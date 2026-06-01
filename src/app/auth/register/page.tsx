// src/app/auth/register/page.tsx
import { RegisterForm } from "@/components/auth/register-form";
import Link from "next/link";
import { Briefcase } from "lucide-react";

export default function RegisterPage() {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
            <Briefcase className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-2xl font-bold text-foreground">JobTrackr</span>
        </div>
        <p className="text-muted-foreground text-sm">
          Start tracking your job search journey
        </p>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 shadow-xl shadow-black/20">
        <div className="space-y-1 mb-6">
          <h1 className="text-xl font-semibold text-foreground">Create an account</h1>
          <p className="text-sm text-muted-foreground">Fill in your details below</p>
        </div>
        <RegisterForm />
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/auth/login" className="text-primary hover:underline font-medium">
          Sign in
        </Link>
      </p>
    </div>
  );
}
