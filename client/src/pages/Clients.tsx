import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Plus, Search, Users } from "lucide-react";
import { useStore } from "@/lib/store";
import { clientBalance } from "@/lib/selectors";
import { formatBDT } from "@/lib/format";
import { ClientFormDialog } from "@/components/ClientFormDialog";

const Clients = () => {
  const { data } = useStore();
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const activeCategory = params.get("category") ?? "All";

  const categories = useMemo(
    () => ["All", ...data.categories],
    [data.categories],
  );

  const filtered = useMemo(() => {
    return data.clients.filter((c) => {
      const matchCat =
        activeCategory === "All" || c.category === activeCategory;
      const q = query.toLowerCase();
      const matchQuery =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.businessName.toLowerCase().includes(q) ||
        c.contacts.some(
          (ct) => ct.name.toLowerCase().includes(q) || ct.phone.includes(q),
        );
      return matchCat && matchQuery;
    });
  }, [data.clients, activeCategory, query]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">
            Clients / Beneficiary
          </h1>
          <p className="text-sm text-muted-foreground">
            {data.clients.length} beneficiaries registered
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 rounded-lg gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-elegant"
        >
          <Plus className="h-4 w-4" /> New Client
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Name,    ..."
            className="w-full rounded-lg border border-input bg-background py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setParams(cat === "All" ? {} : { category: cat })}
            className={
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors " +
              (activeCategory === cat
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:bg-muted")
            }
          >
            {cat}
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="card-surface flex flex-col items-center justify-center gap-2 p-12 text-center">
          <Users className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            No beneficiaries found.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((c) => {
            const bal = clientBalance(data.transactions, c.id);
            const works = data.works.filter((w) => w.clientId === c.id).length;
            return (
              <Link
                key={c.id}
                to={`/clients/${c.id}`}
                className="card-surface card-surface-hover block p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{c.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {c.businessName}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-md bg-secondary px-2 py-0.5 text-[11px] text-secondary-foreground">
                    {c.category}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{works} works</span>
                  <span
                    className={
                      bal.outstanding > 0
                        ? "font-semibold text-info"
                        : "text-success"
                    }
                  >
                    {bal.outstanding > 0
                      ? `Receivable ${formatBDT(bal.outstanding)}`
                      : "Settled"}
                  </span>
                </div>
                {c.contacts[0] && (
                  <p className="mt-2 truncate text-[11px] text-muted-foreground">
                    {c.contacts[0].name} · {c.contacts[0].phone}
                  </p>
                )}
              </Link>
            );
          })}
        </div>
      )}

      <ClientFormDialog open={showForm} onOpenChange={setShowForm} />
    </div>
  );
};

export default Clients;
