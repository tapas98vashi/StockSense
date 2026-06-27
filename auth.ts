// auth.ts
// Full Auth.js v5 config — Node.js runtime only (API routes + server components).
// DO NOT import this from middleware.ts — use auth.config.ts there instead.
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/auth.config";
import type { Role } from "@prisma/client";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,

  adapter: PrismaAdapter(prisma),

  providers: [
    GoogleProvider({
      clientId:     process.env.GOOGLE_CLIENT_ID  ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),

    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email:    { label: "Email",    type: "email"    },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.password) return null;

        const valid = await bcrypt.compare(
          credentials.password as string,
          user.password,
        );
        if (!valid) return null;

        return { id: user.id, email: user.email, name: user.name, role: user.role };
      },
    }),
  ],

  callbacks: {
    // Embed role + id in JWT so they're available everywhere without a DB lookup
    async jwt({ token, user }) {
      if (user) {
        token.id   = user.id;
        token.role = (user as { role?: Role }).role ?? "USER";
      }
      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id   = token.id   as string;
        session.user.role = token.role as Role;
      }
      return session;
    },
  },

  events: {
    // Every successful sign-in → log a LoginEvent + update lastLoginAt
    async signIn({ user, account }) {
      if (!user?.id) return;
      const provider = account?.provider ?? "credentials";
      await prisma.$transaction([
        prisma.loginEvent.create({
          data: { userId: user.id, provider },
        }),
        prisma.user.update({
          where: { id: user.id },
          data:  { lastLoginAt: new Date() },
        }),
      ]);
    },
  },
});
