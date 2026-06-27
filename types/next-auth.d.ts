// types/next-auth.d.ts
// Augment next-auth types so session.user.id and session.user.role are typed
import type { Role } from "@prisma/client";
import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id:    string;
      role:  Role;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }

  interface User {
    role?: Role;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?:   string;
    role?: Role;
  }
}
