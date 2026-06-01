// src/types/next-auth.d.ts
// Architecture note: Module augmentation extends NextAuth's built-in types
// without modifying the library. This is the TypeScript-idiomatic way to add
// custom fields (like `id`) to the Session and JWT objects.

import { DefaultSession, DefaultJWT } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
  }
}
