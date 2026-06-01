// src/app/auth/layout.tsx
import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-950/20 via-background to-slate-900/40 pointer-events-none" />
      <div className="relative w-full max-w-md px-4">{children}</div>
    </div>
  );
}
