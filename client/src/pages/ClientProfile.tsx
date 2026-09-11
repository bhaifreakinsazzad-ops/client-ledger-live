import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  Phone,
  Mail,
  FileText,
  Download,
  Briefcase,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { clientBalance, workBalance } from "@/lib/selectors";
import { formatBDT, formatDate } from "@/lib/format";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { ClientFormDialog } from "@/components/ClientFormDialog";
import { WorkFormDialog } from "@/components/WorkFormDialog";
import { TransactionFormDialog } from "@/components/TransactionFormDialog";
import { InvoiceDialog } from "@/components/InvoiceDialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";

const TXN_TONE: Record<string, string> = {
  Received: "text-success",
  Expense: "text-destructive",
  Receivable: "text-info",
  Payable: "text-warning",
};

const ClientProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, deleteClient, deleteWork, deleteTransaction } = useStore();
  const client = data.clients.find((c) => c.id === id);

  const [editClient, setEditClient] = useState(false);
  const [workForm, setWorkForm] = useState(false);
  const [editWorkId, setEditWorkId] = useState<string | null>(null);
  const [txnForm, setTxnForm] = useState(false);
  const [editTxnId, setEditTxnId] = useState<string | null>(null);
  const [txnWorkId, setTxnWorkId] = useState<string | null>(null);
  const [invoiceWorkId, setInvoiceWorkId] = useState<string | null>(null);

  const works = useMemo(
    () => data.works.filter((w) => w.clientId === id),
    [data.works, id],
  );
  const transactions = useMemo(
    () =>
      data.transactions
        .filter((t) => t.clientId === id)
        .sort((a, b) => b.date.localeCompare(a.date)),
    [data.transactions, id],
  );
  const bal = useMemo(
    () => clientBalance(data.transactions, id ?? ""),
    [data.transactions, id],
  );

  if (!client) {
    return (
      <div className="card-surface p-8 text-center">
        <p className="text-sm text-muted-foreground">
          Beneficiary not found.
        </p>
        <Link
          to="/clients"
          className="mt-3 inline-block text-sm text-primary hover:underline"
        >
          ← Back to Clients
        </Link>
      </div>
    );
  }

  const handleDelete = () => {
    if (
      confirm(`"${client.name}" Beneficiary    Work/Transactions  ?`)
    ) {
      deleteClient(client.id);
      toast.success("Client deleted");
      navigate("/clients");
    }
  };

  return (
    <div className="space-y-5">
      <Link
        to="/clients"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Clients
      </Link>

      {/* Header */}
      <div className="card-surface p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight">
                {client.name}
              </h1>
              <span className="rounded-md bg-secondary px-2 py-0.5 text-[11px] text-secondary-foreground">
                {client.category}
              </span>
            </div>
            {client.businessName && (
              <p className="text-sm text-muted-foreground">
                {client.businessName}
              </p>
            )}
            <div className="mt-3 flex flex-wrap gap-3">
              {client.contacts.map((ct) => (
                <div
                  key={ct.id}
                  className="rounded-lg border border-border bg-background px-3 py-2 text-xs"
                >
                  <p className="font-medium">
                    {ct.name}
                    {ct.role && ` · ${ct.role}`}
                  </p>
                  {ct.phone && (
                    <a
                      href={`tel:${ct.phone}`}
                      className="mt-0.5 flex items-center gap-1 text-muted-foreground hover:text-primary"
                    >
                      <Phone className="h-3 w-3" /> {ct.phone}
                    </a>
                  )}
                  {ct.email && (
                    <a
                      href={`mailto:${ct.email}`}
                      className="flex items-center gap-1 text-muted-foreground hover:text-primary"
                    >
                      <Mail className="h-3 w-3" /> {ct.email}
                    </a>
                  )}
                </div>
              ))}
            </div>
            {client.notes && (
              <p className="mt-3 text-sm text-muted-foreground">
                {client.notes}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditClient(true)}
            >
              <Pencil className="h-4 w-4" /> Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              className="text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Balance stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Received / Income"
          value={formatBDT(bal.received)}
          tone="success"
        />
        <StatCard
          label="Expense / Expense"
          value={formatBDT(bal.expense)}
          tone="destructive"
        />
        <StatCard
          label="Receivable / Receivable"
          value={formatBDT(bal.receivable)}
          tone="info"
        />
        <StatCard
          label="Outstanding / Outstanding"
          value={formatBDT(bal.outstanding)}
          tone={bal.outstanding > 0 ? "warning" : "success"}
        />
      </div>

      <Tabs defaultValue="works">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <TabsList>
            <TabsTrigger value="works">Works ({works.length})</TabsTrigger>
            <TabsTrigger value="transactions">
              Transactions ({transactions.length})
            </TabsTrigger>
          </TabsList>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setTxnWorkId(null);
                setEditTxnId(null);
                setTxnForm(true);
              }}
            >
              <Plus className="h-4 w-4" /> Transaction
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setEditWorkId(null);
                setWorkForm(true);
              }}
              className="gradient-primary text-primary-foreground"
            >
              <Plus className="h-4 w-4" /> Work
            </Button>
          </div>
        </div>

        {/* Works */}
        <TabsContent value="works" className="mt-4 space-y-3">
          {works.length === 0 ? (
            <div className="card-surface flex flex-col items-center gap-2 p-10 text-center">
              <Briefcase className="h-7 w-7 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No work yet.</p>
            </div>
          ) : (
            works.map((w) => {
              const wb = workBalance(data.transactions, w.id);
              return (
                <div key={w.id} className="card-surface p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold">{w.title}</h3>
                        <StatusBadge status={w.status} />
                        <span className="text-[11px] text-muted-foreground">
                          {w.category}
                        </span>
                      </div>
                      {w.description && (
                        <p className="mt-1 text-sm text-muted-foreground">
                          {w.description}
                        </p>
                      )}
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span>
                          Fee:{" "}
                          <span className="font-medium text-foreground">
                            {formatBDT(w.fee)}
                          </span>
                        </span>
                        <span>
                          Received:{" "}
                          <span className="text-success">
                            {formatBDT(wb.received)}
                          </span>
                        </span>
                        <span>
                          Expense:{" "}
                          <span className="text-destructive">
                            {formatBDT(wb.expense)}
                          </span>
                        </span>
                        {wb.outstanding > 0 && (
                          <span>
                            Outstanding:{" "}
                            <span className="text-info">
                              {formatBDT(wb.outstanding)}
                            </span>
                          </span>
                        )}
                        {w.dueDate && <span>Due: {formatDate(w.dueDate)}</span>}
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setInvoiceWorkId(w.id);
                        }}
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setTxnWorkId(w.id);
                          setEditTxnId(null);
                          setTxnForm(true);
                        }}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditWorkId(w.id);
                          setWorkForm(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => {
                          if (confirm("Delete this work?")) {
                            deleteWork(w.id);
                            toast.success("Work deleted");
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </TabsContent>

        {/* Transactions */}
        <TabsContent value="transactions" className="mt-4">
          {transactions.length === 0 ? (
            <div className="card-surface p-10 text-center text-sm text-muted-foreground">
              No transactions yet.
            </div>
          ) : (
            <div className="card-surface overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-border bg-muted/50 text-left text-xs uppercase text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 font-medium">Date</th>
                      <th className="px-4 py-3 font-medium">Type</th>
                      <th className="px-4 py-3 font-medium">Description</th>
                      <th className="px-4 py-3 font-medium">Method</th>
                      <th className="px-4 py-3 text-right font-medium">
                        Amount
                      </th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {transactions.map((t) => (
                      <tr key={t.id} className="hover:bg-muted/30">
                        <td className="whitespace-nowrap px-4 py-3 text-xs">
                          {formatDate(t.date)}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`text-xs font-medium ${TXN_TONE[t.type]}`}
                          >
                            {t.type}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm">{t.description}</p>
                          {t.remarks && (
                            <p className="text-xs text-muted-foreground">
                              {t.remarks}
                            </p>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">
                          {t.paymentMethod}
                        </td>
                        <td
                          className={`whitespace-nowrap px-4 py-3 text-right font-semibold ${TXN_TONE[t.type]}`}
                        >
                          {formatBDT(t.amount)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-1">
                            <button
                              onClick={() => {
                                setEditTxnId(t.id);
                                setTxnWorkId(null);
                                setTxnForm(true);
                              }}
                              className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm("Delete this transaction?")) {
                                  deleteTransaction(t.id);
                                  toast.success("Transaction deleted");
                                }
                              }}
                              className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-destructive"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <ClientFormDialog
        open={editClient}
        onOpenChange={setEditClient}
        editId={client.id}
      />
      <WorkFormDialog
        open={workForm}
        onOpenChange={setWorkForm}
        clientId={client.id}
        editId={editWorkId}
      />
      <TransactionFormDialog
        open={txnForm}
        onOpenChange={setTxnForm}
        clientId={client.id}
        workId={txnWorkId}
        editId={editTxnId}
      />
      <InvoiceDialog
        open={!!invoiceWorkId}
        onOpenChange={(v) => !v && setInvoiceWorkId(null)}
        workId={invoiceWorkId}
      />
    </div>
  );
};

export default ClientProfile;
