"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface School {
  _id: string;
  name: string;
}

interface SchoolMultiSelectProps {
  schools: School[];
  selectedSchoolIds: string[];
  onChange: (selectedIds: string[]) => void;
  className?: string;
}

export function SchoolMultiSelect({
  schools,
  selectedSchoolIds,
  onChange,
  className,
}: SchoolMultiSelectProps) {
  const handleToggle = (schoolId: string) => {
    const selected = new Set(selectedSchoolIds);
    if (selected.has(schoolId)) {
      selected.delete(schoolId);
    } else {
      selected.add(schoolId);
    }
    onChange(Array.from(selected));
  };

  return (
    <div className={cn("flex flex-wrap gap-3", className)}>
      {schools.map((school) => {
        const isSelected = selectedSchoolIds.includes(school._id);
        return (
          <Button
            key={school._id}
            type="button"
            variant={isSelected ? "default" : "outline"}
            onClick={() => handleToggle(school._id)}
            className={cn(
              "transition-colors",
              isSelected && "bg-blue-500 hover:bg-blue-600 text-white"
            )}
          >
            {school.name}
          </Button>
        );
      })}
    </div>
  );
}
