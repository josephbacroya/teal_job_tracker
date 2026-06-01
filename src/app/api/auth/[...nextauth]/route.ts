// src/app/api/auth/[...nextauth]/route.ts
// This single file handles all NextAuth endpoints:
// /api/auth/signin, /api/auth/signout, /api/auth/session, etc.

import { handlers } from "@/lib/auth/auth";

export const { GET, POST } = handlers;
