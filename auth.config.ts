// auth.config.ts
// Edge-safe Auth.js config — NO Prisma, NO bcrypt, NO Node.js-only imports.
// Used ONLY by middleware.ts (which runs on the Edge Runtime).
// The full config (with PrismaAdapter, bcrypt, events) lives in auth.ts.
import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },

  // No providers here — credentials/google are configured in auth.ts.
  // Middleware only needs to read the JWT session, not authenticate.
  providers: [],

  callbacks: {
    // Embed role + id into the JWT (must match auth.ts so the token is consistent)
    async jwt({ token, user }) {
      if (user) {
        token.id   = user.id;
        token.role = (user as { role?: string }).role ?? "USER";
      }
      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id   = token.id   as string;
        // Cast to Role enum — auth.config.ts avoids importing @prisma/client (Node.js)
        (session.user as { role: string }).role = token.role as string;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
    error:  "/login",
  },
};
