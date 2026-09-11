import { cn } from "@/lib/utils";
import type { WorkStatus } from "@/lib/types";

const STATUS_STYLES: Record<WorkStatus, string> = {
  Pending: "bg-warning/15 text-warning border-warning/30",
  Running: "bg-info/15 text-info border-info/30",
  Completed: "bg-success/15 text-success border-success/30",
  Issue: "bg-destructive/15 text-destructive border-destructive/30",
};

export function StatusBadge({
  status,
  className,
}: {
  status: WorkStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        STATUS_STYLES[status],
        className,
      )}
    >
      {status}
    </span>
  );
}
