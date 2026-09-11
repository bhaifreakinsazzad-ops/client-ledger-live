import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { workBalance } from "@/lib/selectors";
import { formatBDT, formatDate, todayISO } from "@/lib/format";
import { Download } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  workId: string | null;
}

export function InvoiceDialog({ open, onOpenChange, workId }: Props) {
  const { data } = useStore();
  const work = data.works.find((w) => w.id === workId);
  const client = work ? data.clients.find((c) => c.id === work.clientId) : null;
  const wb = work ? workBalance(data.transactions, work.id) : null;

  if (!work || !client || !wb) return null;

  const invoiceNo = `INV-${work.id.slice(-6).toUpperCase()}`;
  const balance = work.fee - wb.received;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader className="flex-row items-center justify-between">
          <DialogTitle>Invoice / Invoice</DialogTitle>
          <Button size="sm" variant="outline" onClick={handlePrint}>
            <Download className="h-4 w-4" /> Print / Save PDF
          </Button>
        </DialogHeader>

        <div className="rounded-lg border border-border p-6 print:border-0">
          {/* Header */}
          <div className="flex items-start justify-between border-b border-border pb-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary text-primary-foreground">
                  <span className="font-bold">F</span>
                </div>
                <span className="text-lg font-bold">FinanceFlow</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Client & Finance Management
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold">INVOICE</p>
              <p className="text-xs text-muted-foreground">{invoiceNo}</p>
              <p className="text-xs text-muted-foreground">{todayISO()}</p>
            </div>
          </div>

          {/* Bill to */}
          <div className="grid gap-4 py-4 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase text-muted-foreground">Bill To</p>
              <p className="mt-1 font-semibold">{client.name}</p>
              {client.businessName && (
                <p className="text-sm text-muted-foreground">
                  {client.businessName}
                </p>
              )}
              {client.contacts[0]?.phone && (
                <p className="text-xs text-muted-foreground">
                  {client.contacts[0].phone}
                </p>
              )}
            </div>
            <div className="sm:text-right">
              <p className="text-xs uppercase text-muted-foreground">Service</p>
              <p className="mt-1 font-semibold">{work.title}</p>
              <p className="text-xs text-muted-foreground">{work.category}</p>
              {work.dueDate && (
                <p className="text-xs text-muted-foreground">
                  Due: {formatDate(work.dueDate)}
                </p>
              )}
            </div>
          </div>

          {/* Items */}
          <table className="w-full text-sm">
            <thead className="border-y border-border text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="py-2">Description</th>
                <th className="py-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border">
                <td className="py-3">
                  <p className="font-medium">{work.title}</p>
                  {work.description && (
                    <p className="text-xs text-muted-foreground">
                      {work.description}
                    </p>
                  )}
                </td>
                <td className="py-3 text-right">{formatBDT(work.fee)}</td>
              </tr>
            </tbody>
          </table>

          {/* Summary */}
          <div className="ml-auto mt-4 max-w-xs space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Fee</span>
              <span className="font-medium">{formatBDT(work.fee)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Received</span>
              <span className="text-success">{formatBDT(wb.received)}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-2">
              <span className="font-semibold">Balance Due</span>
              <span className="font-bold text-primary">
                {formatBDT(balance)}
              </span>
            </div>
          </div>

          <p className="mt-6 border-t border-border pt-4 text-center text-xs text-muted-foreground">
            Thank you for your business. · FinanceFlow
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
