import { useMemo, useState } from "react";
import { Download, FileBarChart, Filter } from "lucide-react";
import { useStore } from "@/lib/store";
import { formatBDT, formatDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const Reports = () => {
  const { data } = useStore();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [clientId, setClientId] = useState("all");
  const [category, setCategory] = useState("all");

  const filtered = useMemo(() => {
    return data.transactions
      .filter((t) => {
        if (from && t.date < from) return false;
        if (to && t.date > to) return false;
        if (clientId !== "all" && t.clientId !== clientId) return false;
        if (clientId === "all" && t.clientId === null) {
          // include personal finance in "all"
        }
        if (category !== "all") {
          const work = data.works.find((w) => w.id === t.workId);
          const client = data.clients.find((c) => c.id === t.clientId);
          const cat = work?.category ?? client?.category;
          if (cat !== category) return false;
        }
        return true;
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [data, from, to, clientId, category]);

  const totals = useMemo(() => {
    const acc = { Received: 0, Expense: 0, Receivable: 0, Payable: 0 };
    for (const t of filtered) acc[t.type] += t.amount;
    return acc;
  }, [filtered]);

  const exportCSV = () => {
    const headers = [
      "Date",
      "Type",
      "Client",
      "Work",
      "Description",
      "Method",
      "Amount",
      "Remarks",
    ];
    const rows = filtered.map((t) => {
      const client = data.clients.find((c) => c.id === t.clientId);
      const work = data.works.find((w) => w.id === t.workId);
      return [
        t.date,
        t.type,
        client?.name ?? "Personal",
        work?.title ?? "",
        t.description,
        t.paymentMethod,
        t.amount,
        t.remarks,
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(",");
    });
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `financeflow_report_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Report exported as CSV");
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">
            Reports / Reports
          </h1>
          <p className="text-sm text-muted-foreground">
            , Beneficiary  Category  
          </p>
        </div>
        <Button
          onClick={exportCSV}
          className="gradient-primary text-primary-foreground"
        >
          <Download className="h-4 w-4" /> Export CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="card-surface p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-medium">
          <Filter className="h-4 w-4 text-primary" /> Filters
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">From Date</label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">To Date</label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Client</label>
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="all">All Clients</option>
              {data.clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="all">All Categories</option>
              {data.categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {(["Received", "Expense", "Receivable", "Payable"] as const).map(
          (type) => (
            <div key={type} className="card-surface p-4">
              <p className="text-xs uppercase text-muted-foreground">{type}</p>
              <p
                className={
                  "mt-1 text-xl font-bold " +
                  (type === "Received"
                    ? "text-success"
                    : type === "Expense"
                      ? "text-destructive"
                      : type === "Receivable"
                        ? "text-info"
                        : "text-warning")
                }
              >
                {formatBDT(totals[type])}
              </p>
            </div>
          ),
        )}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="card-surface flex flex-col items-center gap-2 p-12 text-center">
          <FileBarChart className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
              No  Transactions yet।
          </p>
        </div>
      ) : (
        <div className="card-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/50 text-left text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Client</th>
                  <th className="px-4 py-3 font-medium">Description</th>
                  <th className="px-4 py-3 text-right font-medium">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((t) => {
                  const client = data.clients.find((c) => c.id === t.clientId);
                  return (
                    <tr key={t.id} className="hover:bg-muted/30">
                      <td className="whitespace-nowrap px-4 py-3 text-xs">
                        {formatDate(t.date)}
                      </td>
                      <td className="px-4 py-3 text-xs font-medium">
                        {t.type}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {client?.name ?? "Personal"}
                      </td>
                      <td className="px-4 py-3 text-sm">{t.description}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-right font-semibold">
                        {formatBDT(t.amount)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="border-t-2 border-border bg-muted/50">
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-3 text-right text-sm font-semibold"
                  >
                    Net (Received − Expense):
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-primary">
                    {formatBDT(totals.Received - totals.Expense)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
