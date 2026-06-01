// src/components/applications/applications-table.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { STATUS_CONFIG } from "@/types";
import { ApplicationStatus } from "@/types";
import { deleteApplication } from "@/lib/actions/applications";
import { useToast } from "@/hooks/use-toast";
import { ExternalLink, Pencil, Trash2, Loader2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Application {
  id: string;
  companyName: string;
  jobTitle: string;
  location: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  jobUrl: string | null;
  appliedAt: string;
  status: ApplicationStatus;
  interviews: unknown[];
}

export function ApplicationsTable() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toast } = useToast();
  const searchParams = useSearchParams();

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(searchParams.toString());
      const res = await fetch(`/api/applications?${params}`);
      const data = await res.json();
      if (data.success) {
        setApplications(data.data);
        setTotal(data.total);
      }
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleDelete = async (id: string, companyName: string) => {
    if (!confirm(`Delete application at ${companyName}?`)) return;
    setDeletingId(id);
    const result = await deleteApplication(id);
    if (result.success) {
      toast({ title: "Deleted", description: "Application removed." });
      fetchApplications();
    } else {
      toast({ title: "Error", description: result.error, variant: "destructive" });
    }
    setDeletingId(null);
  };

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-xl p-8 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-12 text-center space-y-3">
        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto">
          <span className="text-2xl">📋</span>
        </div>
        <h3 className="text-foreground font-semibold">No applications found</h3>
        <p className="text-muted-foreground text-sm">Try adjusting your filters or add a new application</p>
        <Link href="/applications/new">
          <Button className="mt-2">Add Application</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="hidden md:grid grid-cols-[2fr_1.5fr_1fr_1fr_auto] gap-4 px-5 py-3 border-b border-border text-xs text-muted-foreground font-medium">
        <span>Company / Role</span>
        <span>Location</span>
        <span>Status</span>
        <span>Applied</span>
        <span>Actions</span>
      </div>

      <div className="divide-y divide-border">
        {applications.map((app) => {
          const config = STATUS_CONFIG[app.status];
          return (
            <div
              key={app.id}
              className="grid grid-cols-1 md:grid-cols-[2fr_1.5fr_1fr_1fr_auto] gap-4 px-5 py-4 hover:bg-accent/30 transition-colors items-center"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-semibold text-sm">
                    {app.companyName[0].toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0">
                  <Link
                    href={`/applications/${app.id}`}
                    className="text-sm font-medium text-foreground hover:text-primary truncate block"
                  >
                    {app.jobTitle}
                  </Link>
                  <p className="text-xs text-muted-foreground truncate">{app.companyName}</p>
                </div>
              </div>

              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                {app.location ? (
                  <>
                    <MapPin className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{app.location}</span>
                  </>
                ) : (
                  <span>—</span>
                )}
              </div>

              <div>
                <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${config?.bgColor} ${config?.color}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${config?.dotColor}`} />
                  {config?.label}
                </span>
              </div>

              <div className="text-xs text-muted-foreground">
                {format(new Date(app.appliedAt), "MMM d, yyyy")}
              </div>

              <div className="flex items-center gap-1">
                {app.jobUrl && (
                  <a href={app.jobUrl} target="_blank" rel="noopener noreferrer"
                    className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
                <Link href={`/applications/${app.id}`}
                  className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                  <Pencil className="h-3.5 w-3.5" />
                </Link>
                <button
                  onClick={() => handleDelete(app.id, app.companyName)}
                  disabled={deletingId === app.id}
                  className="p-1.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
                >
                  {deletingId === app.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="px-5 py-3 border-t border-border text-xs text-muted-foreground">
        Showing {applications.length} of {total} applications
      </div>
    </div>
  );
}
