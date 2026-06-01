// src/components/interviews/interviews-list.tsx
"use client";

import { format, formatDistanceToNow } from "date-fns";
import { INTERVIEW_TYPE_LABELS, INTERVIEW_OUTCOME_LABELS } from "@/types";
import { InterviewType, InterviewOutcome } from "@/types";
import Link from "next/link";
import { Clock, CheckCircle2, XCircle, Calendar, MapPin, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface Interview {
  id: string;
  type: InterviewType;
  scheduledAt: Date;
  location: string | null;
  notes: string | null;
  outcome: InterviewOutcome | null;
  application: { id: string; companyName: string; jobTitle: string };
}

interface Props {
  upcoming: Interview[];
  past: Interview[];
}

export function InterviewsList({ upcoming, past }: Props) {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" />
          Upcoming ({upcoming.length})
        </h2>
        {upcoming.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-8 text-center text-muted-foreground text-sm">
            No upcoming interviews scheduled.
          </div>
        ) : (
          <div className="space-y-3">
            {upcoming.map((interview) => <InterviewCard key={interview.id} interview={interview} isUpcoming />)}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          Past ({past.length})
        </h2>
        {past.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-8 text-center text-muted-foreground text-sm">
            No past interviews yet.
          </div>
        ) : (
          <div className="space-y-3">
            {past.map((interview) => <InterviewCard key={interview.id} interview={interview} isUpcoming={false} />)}
          </div>
        )}
      </section>
    </div>
  );
}

function InterviewCard({ interview, isUpcoming }: { interview: Interview; isUpcoming: boolean }) {
  const OutcomeIcon =
    interview.outcome === "PASSED" ? CheckCircle2 :
    interview.outcome === "FAILED" || interview.outcome === "CANCELLED" ? XCircle : Clock;

  const outcomeColor =
    interview.outcome === "PASSED" ? "text-emerald-400" :
    interview.outcome === "FAILED" ? "text-red-400" :
    interview.outcome === "CANCELLED" ? "text-slate-400" : "text-amber-400";

  return (
    <Link href={`/applications/${interview.application.id}`}
      className="flex items-start gap-4 bg-card border border-border rounded-xl p-4 hover:bg-accent/30 transition-colors group">
      <div className={cn("flex-shrink-0 w-12 text-center rounded-lg p-2", isUpcoming ? "bg-primary/10" : "bg-muted")}>
        <p className={cn("text-xs font-medium", isUpcoming ? "text-primary" : "text-muted-foreground")}>
          {format(new Date(interview.scheduledAt), "MMM")}
        </p>
        <p className={cn("text-lg font-bold leading-tight", isUpcoming ? "text-primary" : "text-muted-foreground")}>
          {format(new Date(interview.scheduledAt), "d")}
        </p>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-foreground">{INTERVIEW_TYPE_LABELS[interview.type]}</span>
          <span className="text-muted-foreground text-xs">·</span>
          <span className="text-sm text-foreground">{interview.application.companyName}</span>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">{interview.application.jobTitle}</p>
        <div className="flex items-center gap-3 mt-2 flex-wrap">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {format(new Date(interview.scheduledAt), "h:mm a")}
            {isUpcoming && (
              <span className="text-primary ml-1">
                ({formatDistanceToNow(new Date(interview.scheduledAt), { addSuffix: true })})
              </span>
            )}
          </span>
          {interview.location && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {interview.location}
            </span>
          )}
        </div>
        {interview.notes && (
          <p className="text-xs text-muted-foreground mt-1.5 line-clamp-1">{interview.notes}</p>
        )}
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {interview.outcome && (
          <span className={cn("flex items-center gap-1 text-xs font-medium", outcomeColor)}>
            <OutcomeIcon className="h-3.5 w-3.5" />
            {INTERVIEW_OUTCOME_LABELS[interview.outcome]}
          </span>
        )}
        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
      </div>
    </Link>
  );
}
