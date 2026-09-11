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
import type { PaymentMethod, TxnType } from "@/lib/types";
import { todayISO } from "@/lib/format";

const TXN_TYPES: TxnType[] = ["Received", "Expense", "Receivable", "Payable"];
const METHODS: PaymentMethod[] = [
  "Cash",
  "Bank",
  "Mobile Banking",
  "Cheque",
  "Card",
  "Other",
];

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  clientId: string | null;
  workId?: string | null;
  editId?: string | null;
}

export function TransactionFormDialog({
  open,
  onOpenChange,
  clientId,
  workId,
  editId,
}: Props) {
  const { data, addTransaction, updateTransaction } = useStore();
  const editing = editId
    ? data.transactions.find((t) => t.id === editId)
    : null;

  const clientWorks = data.works.filter((w) => w.clientId === clientId);

  const [type, setType] = useState<TxnType>(editing?.type ?? "Received");
  const [date, setDate] = useState(editing?.date ?? todayISO());
  const [amount, setAmount] = useState(String(editing?.amount ?? ""));
  const [description, setDescription] = useState(editing?.description ?? "");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    editing?.paymentMethod ?? "Cash",
  );
  const [remarks, setRemarks] = useState(editing?.remarks ?? "");
  const [workIdState, setWorkIdState] = useState<string>(
    editing?.workId ?? workId ?? clientWorks[0]?.id ?? "",
  );
  const [bankAccountId, setBankAccountId] = useState<string>(
    editing?.bankAccountId ?? "",
  );

  const handleSubmit = () => {
    if (!amount || Number(amount) <= 0) return;
    const payload = {
      clientId,
      workId: workIdState || null,
      type,
      date,
      amount: Number(amount),
      description,
      paymentMethod,
      remarks,
      bankAccountId: bankAccountId || null,
    };
    if (editing) updateTransaction(editing.id, payload);
    else addTransaction(payload);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {editing ? "Edit Transaction" : "New Transaction / Transactions"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Type / Type</Label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as TxnType)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              >
                {TXN_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Amount () *</Label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Date</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Payment Method</Label>
              <select
                value={paymentMethod}
                onChange={(e) =>
                  setPaymentMethod(e.target.value as PaymentMethod)
                }
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              >
                {METHODS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {clientId && clientWorks.length > 0 && (
            <div className="space-y-1.5">
              <Label>Related Work</Label>
              <select
                value={workIdState}
                onChange={(e) => setWorkIdState(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">— None —</option>
                {clientWorks.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.title}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="space-y-1.5">
            <Label>Bank Account</Label>
            <select
              value={bankAccountId}
              onChange={(e) => setBankAccountId(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">— None —</option>
              {data.bankAccounts.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.bankName})
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label>Description / Description</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Remarks / Remarks</Label>
            <Textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
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
            {editing ? "Save Changes" : "Add Transaction"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
