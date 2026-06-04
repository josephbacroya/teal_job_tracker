// src/app/auth/login/page.tsx
import { LoginForm } from "@/components/auth/login-form";
import Link from "next/link";
import Image from "next/image";

export default function LoginPage() {
  return (
    <div className="space-y-6">
      {/* Logo */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <div className="h-10 w-10 flex items-center justify-center">
            <Image src="/TEAL.png" alt="Teal Logo" width={40} height={40} className="rounded-xl shadow-sm" />
          </div>
          <span className="text-2xl font-bold text-foreground">Teal</span>
        </div>
        <p className="text-muted-foreground text-sm">
          Sign in to manage your job applications
        </p>
      </div>

      {/* Card */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-xl shadow-black/20">
        <div className="space-y-1 mb-6">
          <h1 className="text-xl font-semibold text-foreground">Welcome back</h1>
          <p className="text-sm text-muted-foreground">Enter your credentials to continue</p>
        </div>
        <LoginForm />
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/auth/register" className="text-primary hover:underline font-medium">
          Create one
        </Link>
      </p>
    </div>
  );
}
