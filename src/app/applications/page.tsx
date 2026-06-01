// src/app/applications/page.tsx
import { ApplicationsTable } from "@/components/applications/applications-table";
import { ApplicationFiltersBar } from "@/components/applications/applications-filters";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ApplicationsPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Applications</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage and track all your job applications
          </p>
        </div>
        <Link href="/applications/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Application
          </Button>
        </Link>
      </div>

      <ApplicationFiltersBar />
      <ApplicationsTable />
    </div>
  );
}
