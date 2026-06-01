// src/app/applications/new/page.tsx
import { ApplicationForm } from "@/components/applications/application-form";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function NewApplicationPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/applications"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">New Application</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Track a new job opportunity
          </p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-6">
        <ApplicationForm />
      </div>
    </div>
  );
}
