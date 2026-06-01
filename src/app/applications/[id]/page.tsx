// src/app/applications/[id]/page.tsx
// Next.js 15 requires params to be awaited before accessing properties
import { notFound } from "next/navigation";
import { getApplication } from "@/lib/actions/applications";
import { ApplicationDetail } from "@/components/applications/application-detail";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ApplicationDetailPage({ params }: Props) {
  const { id } = await params;
  const result = await getApplication(id);

  if (!result.success || !result.data) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/applications"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {result.data.jobTitle}
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {result.data.companyName}
          </p>
        </div>
      </div>

      <ApplicationDetail application={result.data} />
    </div>
  );
}
