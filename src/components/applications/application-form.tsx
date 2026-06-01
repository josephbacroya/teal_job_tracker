// src/components/applications/application-form.tsx
"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createApplicationSchema, type CreateApplicationInput } from "@/lib/validations/schemas";
import { createApplication, updateApplication } from "@/lib/actions/applications";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { ApplicationStatus } from "@/types";
import { STATUS_CONFIG } from "@/types";
import type { JobApplicationWithRelations } from "@/types";

interface Props {
  application?: JobApplicationWithRelations;
}

const STATUS_OPTIONS = Object.values(ApplicationStatus);

export function ApplicationForm({ application }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const isEditing = !!application;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CreateApplicationInput>({
    resolver: zodResolver(createApplicationSchema),
    defaultValues: application
      ? {
          companyName: application.companyName,
          jobTitle: application.jobTitle,
          location: application.location ?? "",
          salaryMin: application.salaryMin ?? undefined,
          salaryMax: application.salaryMax ?? undefined,
          jobUrl: application.jobUrl ?? "",
          appliedAt: new Date(application.appliedAt),
          status: application.status,
          notes: application.notes ?? "",
        }
      : {
          status: ApplicationStatus.APPLIED,
          appliedAt: new Date(),
        },
  });

  const onSubmit = async (data: CreateApplicationInput) => {
    const action = isEditing
      ? updateApplication({ ...data, id: application.id })
      : createApplication(data);

    const result = await action;

    if (!result.success) {
      toast({ title: "Error", description: result.error, variant: "destructive" });
      return;
    }

    toast({
      title: isEditing ? "Application updated" : "Application created",
      description: isEditing ? "Your changes have been saved." : "Good luck with your application!",
    });

    router.push("/applications");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Row 1: Company + Job Title */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="companyName">Company Name *</Label>
          <Input id="companyName" placeholder="Acme Corp" {...register("companyName")} />
          {errors.companyName && <p className="text-destructive text-xs">{errors.companyName.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="jobTitle">Job Title *</Label>
          <Input id="jobTitle" placeholder="Senior Software Engineer" {...register("jobTitle")} />
          {errors.jobTitle && <p className="text-destructive text-xs">{errors.jobTitle.message}</p>}
        </div>
      </div>

      {/* Row 2: Location + Status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="location">Location</Label>
          <Input id="location" placeholder="San Francisco, CA (Remote)" {...register("location")} />
        </div>
        <div className="space-y-1.5">
          <Label>Status *</Label>
          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((status) => (
                    <SelectItem key={status} value={status}>
                      {STATUS_CONFIG[status]?.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      {/* Row 3: Salary Range */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="salaryMin">Min Salary ($)</Label>
          <Input
            id="salaryMin"
            type="number"
            placeholder="80000"
            {...register("salaryMin", { valueAsNumber: true })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="salaryMax">Max Salary ($)</Label>
          <Input
            id="salaryMax"
            type="number"
            placeholder="120000"
            {...register("salaryMax", { valueAsNumber: true })}
          />
          {errors.salaryMax && <p className="text-destructive text-xs">{errors.salaryMax.message}</p>}
        </div>
      </div>

      {/* Row 4: Job URL + Date */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="jobUrl">Job URL</Label>
          <Input id="jobUrl" type="url" placeholder="https://..." {...register("jobUrl")} />
          {errors.jobUrl && <p className="text-destructive text-xs">{errors.jobUrl.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="appliedAt">Date Applied *</Label>
          <Controller
            control={control}
            name="appliedAt"
            render={({ field }) => (
              <Input
                id="appliedAt"
                type="date"
                value={field.value ? new Date(field.value).toISOString().split("T")[0] : ""}
                onChange={(e) => field.onChange(new Date(e.target.value))}
              />
            )}
          />
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-1.5">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          placeholder="Referral from John, interesting tech stack, recruiter name..."
          rows={4}
          {...register("notes")}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={isSubmitting} className="flex-1 sm:flex-none sm:min-w-[140px]">
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {isEditing ? "Saving..." : "Creating..."}
            </>
          ) : isEditing ? (
            "Save Changes"
          ) : (
            "Add Application"
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
