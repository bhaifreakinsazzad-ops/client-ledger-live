import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useStore } from "@/lib/store";
import type { WorkStatus } from "@/lib/types";
import { todayISO } from "@/lib/format";

const STATUSES: WorkStatus[] = [
  "Pending",
  "Running",
  "Completed",
  "Issue",
];

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  clientId: string;
  editId?: string | null;
}

export function WorkFormDialog({
  open,
  onOpenChange,
  clientId,
  editId,
}: Props) {
  const { data, addWork, updateWork } = useStore();
  const editing = editId ? data.works.find((w) => w.id === editId) : null;
  const client = data.clients.find((c) => c.id === clientId);

  const [title, setTitle] = useState(editing?.title ?? "");
  const [category, setCategory] = useState(
    editing?.category ?? client?.category ?? data.categories[0] ?? "",
  );
  const [description, setDescription] = useState(editing?.description ?? "");
  const [status, setStatus] = useState<WorkStatus>(
    editing?.status ?? "Pending",
  );
  const [fee, setFee] = useState(String(editing?.fee ?? ""));
  const [priority, setPriority] = useState(editing?.priority ?? "Medium");
  const [dueDate, setDueDate] = useState(editing?.dueDate ?? "");
  const [startDate, setStartDate] = useState(editing?.startDate ?? todayISO());
  const [notes, setNotes] = useState(editing?.notes ?? "");

  const handleSubmit = () => {
    if (!title.trim()) return;
    const payload = {
      clientId,
      category,
      title,
      description,
      status,
      priority,
      fee: Number(fee) || 0,
      dueDate,
      startDate,
      notes,
    };
    if (editing) updateWork(editing.id, payload);
    else addWork(payload);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {editing ? "Edit Work" : "New Work / New Work"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Title / Work Name *</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. August VAT Return"
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Category</Label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              >
                {data.categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as WorkStatus)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label>Fee ()</Label>
              <Input
                type="number"
                value={fee}
                onChange={(e) => setFee(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Start Date</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Due Date</Label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Description / Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Notes / Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="gradient-primary text-primary-foreground"
          >
            {editing ? "Save Changes" : "Add Work"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
