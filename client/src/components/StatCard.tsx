import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface StatCardProps {
  label: string;
  sublabel?: string;
  value: string;
  icon?: ReactNode;
  tone?: "default" | "primary" | "success" | "warning" | "destructive" | "info";
  className?: string;
}

const TONES: Record<NonNullable<StatCardProps["tone"]>, string> = {
  default: "text-foreground",
  primary: "text-primary",
  success: "text-success",
  warning: "text-warning",
  destructive: "text-destructive",
  info: "text-info",
};

export function StatCard({
  label,
  sublabel,
  value,
  icon,
  tone = "default",
  className,
}: StatCardProps) {
  return (
    <div className={cn("card-surface p-5", className)}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          {sublabel && (
            <p className="mt-0.5 text-[11px] text-muted-foreground/80">
              {sublabel}
            </p>
          )}
        </div>
        {icon && (
          <div className={cn("rounded-lg bg-muted p-2", TONES[tone])}>
            {icon}
          </div>
        )}
      </div>
      <p className={cn("mt-3 text-2xl font-bold tracking-tight", TONES[tone])}>
        {value}
      </p>
    </div>
  );
}
