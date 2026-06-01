// src/components/dashboard/recent-applications.tsx
import Link from "next/link";
import { format } from "date-fns";
import { STATUS_CONFIG } from "@/types";
import { ApplicationStatus } from "@/types";
import { ArrowRight } from "lucide-react";

interface RecentApp {
  id: string;
  companyName: string;
  jobTitle: string;
  location: string | null;
  appliedAt: Date;
  status: ApplicationStatus;
}

interface Props {
  applications: RecentApp[];
}

export function RecentApplications({ applications }: Props) {
  return (
    <div className="bg-card border border-border rounded-[16px] p-6 shadow-sm h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-[16px] font-semibold text-foreground">Quotes</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Your recent quotes</p>
        </div>
        <Link href="/applications" className="flex items-center gap-1 text-sm text-primary hover:underline font-medium">
          View all
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {applications.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center space-y-4">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
            <ArrowRight className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="text-[16px] font-semibold text-foreground">No applications yet</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-[250px]">
              You haven't tracked any quotes. Add your first one to see it here.
            </p>
          </div>
          <Link href="/applications/new" className="bg-primary text-primary-foreground font-semibold text-sm px-6 py-2.5 rounded-lg shadow-sm hover:opacity-90 transition-opacity mt-4 inline-block">
            + Add Quote
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {applications.map((app) => {
            const config = STATUS_CONFIG[app.status];
            // Override with new Semantic colors based on spec
            let semanticBg = "bg-gray-100";
            let semanticColor = "text-gray-700";
            if (app.status === "OFFER" || app.status === "PASSED") {
              semanticBg = "bg-[#E6F4EA]"; semanticColor = "text-[#1E8E3E]";
            } else if (app.status === "PENDING" || app.status === "APPLIED") {
               semanticBg = "bg-[#FEF7E0]"; semanticColor = "text-[#E37400]";
            } else {
               semanticBg = config?.bgColor ?? "bg-gray-100";
               semanticColor = config?.color ?? "text-gray-700";
            }

            return (
              <Link key={app.id} href={`/applications/${app.id}`}
                className="flex items-center gap-4 py-3 hover:bg-muted/50 transition-colors group">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-semibold text-xs">
                    {app.companyName[0].toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-medium text-foreground truncate">{app.jobTitle}</p>
                  <p className="text-[12px] text-muted-foreground truncate">
                    {app.companyName}{app.location ? ` · ${app.location}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                  <span className={`text-[12px] font-semibold px-3 py-1 rounded-full ${semanticBg} ${semanticColor}`}>
                    {config?.label}
                  </span>
                  <span className="text-[12px] text-muted-foreground w-12 text-right">
                    {format(new Date(app.appliedAt), "MMM d")}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
