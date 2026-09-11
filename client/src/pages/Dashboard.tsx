import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Briefcase,
  Clock,
  TrendingUp,
  TrendingDown,
  ArrowDownLeft,
  ArrowUpRight,
  CalendarClock,
} from "lucide-react";
import { useStore } from "@/lib/store";
import {
  globalTotals,
  statusSummary,
  categorySummary,
  clientBalance,
} from "@/lib/selectors";
import { StatCard } from "@/components/StatCard";
import { formatBDT, formatDate, daysUntil } from "@/lib/format";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";

const STATUS_COLORS: Record<string, string> = {
  Pending: "hsl(var(--warning))",
  Running: "hsl(var(--info))",
  Completed: "hsl(var(--success))",
  Issue: "hsl(var(--destructive))",
};

const Dashboard = () => {
  const { data } = useStore();
  const totals = useMemo(() => globalTotals(data), [data]);
  const status = useMemo(() => statusSummary(data.works), [data.works]);
  const catSum = useMemo(() => categorySummary(data), [data]);

  const statusData = Object.entries(status).map(([name, value]) => ({
    name,
    value,
  }));
  const catData = Array.from(catSum.entries()).map(([name, v]) => ({
    name,
    Received: v.received,
    Expense: v.expense,
    Receivable: v.receivable,
  }));

  const reminders = useMemo(() => {
    return data.works
      .filter((w) => w.status !== "Completed" && w.dueDate)
      .map((w) => ({ ...w, days: daysUntil(w.dueDate) }))
      .sort((a, b) => a.days - b.days)
      .slice(0, 6);
  }, [data.works]);

  const activeWorks = data.works.filter(
    (w) => w.status === "Running" || w.status === "Issue",
  ).length;

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section className="overflow-hidden rounded-xl border border-border bg-card p-6 shadow-elegant">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Financial overview
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Beneficiary, Work  Transactions summary  
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              to="/clients"
              className="rounded-lg gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-elegant"
            >
              + New Client
            </Link>
            <Link
              to="/reports"
              className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
            >
              View Reports
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total Clients / Beneficiary"
          value={String(data.clients.length)}
          icon={<Users className="h-5 w-5" />}
          tone="primary"
        />
        <StatCard
          label="Active Works / Running work"
          value={String(activeWorks)}
          icon={<Briefcase className="h-5 w-5" />}
          tone="info"
        />
        <StatCard
          label="Pending Payments / Outstanding "
          value={String(totals.pendingPayments)}
          icon={<Clock className="h-5 w-5" />}
          tone="warning"
        />
        <StatCard
          label="Net Position / Net "
          value={formatBDT(totals.totalReceived - totals.totalExpense)}
          icon={<TrendingUp className="h-5 w-5" />}
          tone={
            totals.totalReceived - totals.totalExpense >= 0
              ? "success"
              : "destructive"
          }
        />
      </section>

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total Received / Income"
          value={formatBDT(totals.totalReceived)}
          icon={<ArrowDownLeft className="h-5 w-5" />}
          tone="success"
        />
        <StatCard
          label="Total Expense / Expense"
          value={formatBDT(totals.totalExpense)}
          icon={<ArrowUpRight className="h-5 w-5" />}
          tone="destructive"
        />
        <StatCard
          label="Receivable / Receivable"
          value={formatBDT(totals.totalReceivable)}
          icon={<TrendingUp className="h-5 w-5" />}
          tone="info"
        />
        <StatCard
          label="Payable / Payable"
          value={formatBDT(totals.totalPayable)}
          icon={<TrendingDown className="h-5 w-5" />}
          tone="warning"
        />
      </section>

      {/* Category nav */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold">
            Service Categories
          </h2>
          <Link to="/settings" className="text-xs text-primary hover:underline">
            Manage categories
          </Link>
        </div>
        <div className="flex flex-wrap gap-2">
          {data.categories.map((cat) => {
            const s = catSum.get(cat);
            const count = s?.works ?? 0;
            return (
              <Link
                key={cat}
                to={`/clients?category=${encodeURIComponent(cat)}`}
                className="group flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm transition-colors hover:border-primary hover:bg-secondary"
              >
                <span className="font-medium">{cat}</span>
                <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] text-secondary-foreground">
                  {count} works
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Charts */}
      <section className="grid gap-4 lg:grid-cols-2">
        <div className="card-surface p-5">
          <h3 className="mb-4 text-sm font-semibold">
            Work Status
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  innerRadius={45}
                  paddingAngle={2}
                >
                  {statusData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={STATUS_COLORS[entry.name] ?? "hsl(var(--muted))"}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.5rem",
                    fontSize: "12px",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card-surface p-5">
          <h3 className="mb-4 text-sm font-semibold">
            Category-wise Finance
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={catData}
                margin={{ top: 5, right: 10, left: -10, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10 }}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                  height={50}
                />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.5rem",
                    fontSize: "12px",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
                <Bar
                  dataKey="Received"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="Expense"
                  fill="hsl(var(--destructive))"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="Receivable"
                  fill="hsl(var(--warning))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Reminders + Top receivables */}
      <section className="grid gap-4 lg:grid-cols-2">
        <div className="card-surface p-5">
          <div className="mb-4 flex items-center gap-2">
            <CalendarClock className="h-4 w-4 text-warning" />
            <h3 className="text-sm font-semibold">
              Upcoming Due Dates / Upcoming deadlines
            </h3>
          </div>
          <div className="space-y-2">
            {reminders.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No upcoming deadlines.
              </p>
            )}
            {reminders.map((w) => {
              const client = data.clients.find((c) => c.id === w.clientId);
              const overdue = w.days < 0;
              const soon = w.days >= 0 && w.days <= 3;
              return (
                <Link
                  key={w.id}
                  to={`/clients/${w.clientId}`}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border p-3 hover:bg-muted"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{w.title}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {client?.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">
                      {formatDate(w.dueDate)}
                    </p>
                    <span
                      className={
                        overdue
                          ? "text-xs font-semibold text-destructive"
                          : soon
                            ? "text-xs font-semibold text-warning"
                            : "text-xs text-muted-foreground"
                      }
                    >
                      {overdue
                        ? `${Math.abs(w.days)}d overdue`
                        : w.days === 0
                          ? "Today"
                          : `in ${w.days}d`}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="card-surface p-5">
          <h3 className="mb-4 text-sm font-semibold">
            Top Outstanding / Top Outstanding
          </h3>
          <div className="space-y-2">
            {data.clients
              .map((c) => ({
                client: c,
                bal: clientBalance(data.transactions, c.id),
              }))
              .filter((x) => x.bal.outstanding > 0)
              .sort((a, b) => b.bal.outstanding - a.bal.outstanding)
              .slice(0, 6)
              .map(({ client, bal }) => (
                <Link
                  key={client.id}
                  to={`/clients/${client.id}`}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border p-3 hover:bg-muted"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {client.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {client.category}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-info">
                    {formatBDT(bal.outstanding)}
                  </span>
                </Link>
              ))}
            {!data.clients.some(
              (c) => clientBalance(data.transactions, c.id).outstanding > 0,
            ) && (
              <p className="text-sm text-muted-foreground">No receivables.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
