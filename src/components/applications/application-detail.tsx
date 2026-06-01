// src/components/applications/application-detail.tsx
"use client";

import { useState } from "react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { deleteApplication } from "@/lib/actions/applications";
import { useToast } from "@/hooks/use-toast";
import { STATUS_CONFIG, INTERVIEW_TYPE_LABELS, INTERVIEW_OUTCOME_LABELS } from "@/types";
import type { JobApplicationWithRelations } from "@/types";
import { ApplicationForm } from "./application-form";
import { Button } from "@/components/ui/button";
import { MapPin, DollarSign, Link as LinkIcon, Calendar, Trash2, Pencil, Clock, CheckCircle2, XCircle } from "lucide-react";

interface Props {
  application: JobApplicationWithRelations;
}

export function ApplicationDetail({ application }: Props) {
  const [editing, setEditing] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const config = STATUS_CONFIG[application.status];

  const handleDelete = async () => {
    if (!confirm("Delete this application? This cannot be undone.")) return;
    const result = await deleteApplication(application.id);
    if (result.success) {
      toast({ title: "Deleted", description: "Application removed." });
      router.push("/applications");
    } else {
      toast({ title: "Error", description: result.error, variant: "destructive" });
    }
  };

  if (editing) {
    return (
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-semibold text-foreground">Edit Application</h2>
          <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>Cancel</Button>
        </div>
        <ApplicationForm application={application} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <span className="text-primary font-bold text-lg">{application.companyName[0].toUpperCase()}</span>
            </div>
            <div>
              <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${config?.bgColor} ${config?.color} mb-1`}>
                <span className={`h-1.5 w-1.5 rounded-full ${config?.dotColor}`} />
                {config?.label}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setEditing(true)}>
              <Pencil className="h-3.5 w-3.5" />Edit
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5 text-destructive hover:bg-destructive/10" onClick={handleDelete}>
              <Trash2 className="h-3.5 w-3.5" />Delete
            </Button>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DetailItem icon={Calendar} label="Applied">
            {format(new Date(application.appliedAt), "MMMM d, yyyy")}
          </DetailItem>
          {application.location && (
            <DetailItem icon={MapPin} label="Location">{application.location}</DetailItem>
          )}
          {(application.salaryMin || application.salaryMax) && (
            <DetailItem icon={DollarSign} label="Salary Range">
              {application.salaryMin && application.salaryMax
                ? `$${application.salaryMin.toLocaleString()} – $${application.salaryMax.toLocaleString()}`
                : application.salaryMin
                ? `From $${application.salaryMin.toLocaleString()}`
                : `Up to $${application.salaryMax?.toLocaleString()}`}
            </DetailItem>
          )}
          {application.jobUrl && (
            <DetailItem icon={LinkIcon} label="Job Posting">
              <a href={application.jobUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                View posting
              </a>
            </DetailItem>
          )}
        </div>

        {application.notes && (
          <div className="mt-5 pt-5 border-t border-border">
            <p className="text-xs font-medium text-muted-foreground mb-2">Notes</p>
            <p className="text-sm text-foreground whitespace-pre-wrap">{application.notes}</p>
          </div>
        )}
      </div>

      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="font-semibold text-foreground mb-4">Interviews ({application.interviews.length})</h2>
        {application.interviews.length === 0 ? (
          <p className="text-muted-foreground text-sm">No interviews scheduled yet.</p>
        ) : (
          <div className="space-y-3">
            {application.interviews.map((interview) => {
              const Icon =
                interview.outcome === "PASSED" ? CheckCircle2 :
                interview.outcome === "FAILED" || interview.outcome === "CANCELLED" ? XCircle : Clock;
              return (
                <div key={interview.id} className="flex items-start gap-3 p-3 rounded-lg bg-accent/30">
                  <Icon className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-foreground">{INTERVIEW_TYPE_LABELS[interview.type]}</span>
                      {interview.outcome && (
                        <span className="text-xs text-muted-foreground">· {INTERVIEW_OUTCOME_LABELS[interview.outcome]}</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {format(new Date(interview.scheduledAt), "MMM d, yyyy 'at' h:mm a")}
                      {interview.location ? ` · ${interview.location}` : ""}
                    </p>
                    {interview.notes && <p className="text-xs text-foreground/70 mt-1">{interview.notes}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function DetailItem({ icon: Icon, label, children }: { icon: React.ElementType; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm text-foreground mt-0.5">{children}</p>
      </div>
    </div>
  );
}
