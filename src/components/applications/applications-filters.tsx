// src/components/applications/applications-filters.tsx
"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { STATUS_CONFIG } from "@/types";
import { ApplicationStatus } from "@/types";
import { Search, X } from "lucide-react";

const STATUS_OPTIONS = Object.values(ApplicationStatus);

export function ApplicationFiltersBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const createQueryString = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }
      return params.toString();
    },
    [searchParams]
  );

  const updateFilter = (key: string, value: string | null) => {
    startTransition(() => {
      router.push(`${pathname}?${createQueryString({ [key]: value, page: "1" })}`);
    });
  };

  const clearAll = () => {
    startTransition(() => {
      router.push(pathname);
    });
  };

  const hasFilters =
    searchParams.has("search") ||
    searchParams.has("status") ||
    searchParams.has("dateFrom") ||
    searchParams.has("dateTo");

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[200px] max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search company or role..."
          className="pl-9"
          defaultValue={searchParams.get("search") ?? ""}
          onChange={(e) => {
            const value = e.target.value;
            const timeout = setTimeout(() => updateFilter("search", value), 400);
            return () => clearTimeout(timeout);
          }}
        />
      </div>

      <Select
        value={searchParams.get("status") ?? "all"}
        onValueChange={(v) => updateFilter("status", v === "all" ? null : v)}
      >
        <SelectTrigger className="w-44">
          <SelectValue placeholder="All statuses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          {STATUS_OPTIONS.map((status) => (
            <SelectItem key={status} value={status}>
              {STATUS_CONFIG[status]?.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={`${searchParams.get("sortBy") ?? "appliedAt"}_${searchParams.get("sortOrder") ?? "desc"}`}
        onValueChange={(v) => {
          const [sortBy, sortOrder] = v.split("_");
          updateFilter("sortBy", sortBy);
          updateFilter("sortOrder", sortOrder);
        }}
      >
        <SelectTrigger className="w-44">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="appliedAt_desc">Newest first</SelectItem>
          <SelectItem value="appliedAt_asc">Oldest first</SelectItem>
          <SelectItem value="companyName_asc">Company A-Z</SelectItem>
          <SelectItem value="companyName_desc">Company Z-A</SelectItem>
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearAll} className="gap-1.5 text-muted-foreground">
          <X className="h-3.5 w-3.5" />
          Clear
        </Button>
      )}
    </div>
  );
}
