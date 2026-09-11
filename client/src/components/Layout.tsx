import { NavLink } from "react-router-dom";
import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  FileBarChart,
  Menu,
  X,
  Settings,
  BriefcaseBusiness,
  MapPin,
  Receipt,
  Wrench,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";

interface NavItem {
  to: string;
  label: string;
  sublabel: string;
  icon: typeof LayoutDashboard;
  end?: boolean;
}

const NAV: NavItem[] = [
  {
    to: "/",
    label: "Dashboard",
    sublabel: "Dashboard",
    icon: LayoutDashboard,
    end: true,
  },
  { to: "/services", label: "Services", sublabel: "Service entries", icon: Wrench },
  { to: "/clients", label: "Beneficiaries", sublabel: "Clients", icon: Users },
  { to: "/reports", label: "Transactions", sublabel: "Ledger & exports", icon: FileBarChart },
  { to: "/movements", label: "Movements", sublabel: "Visits & duration", icon: MapPin },
  { to: "/projects", label: "Projects", sublabel: "Project planning", icon: BriefcaseBusiness },
  { to: "/fees", label: "Fees & Charges", sublabel: "Service pricing", icon: Receipt },
  {
    to: "/settings",
    label: "Settings",
    sublabel: "Business & data",
    icon: Settings,
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const { data } = useStore();

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-sidebar text-sidebar-foreground transition-transform lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary text-primary-foreground shadow-elegant">
            <span className="text-lg font-bold">F</span>
          </div>
          <div>
            <p className="text-base font-semibold leading-tight">FinanceFlow</p>
            <p className="text-[11px] text-sidebar-foreground/60">
              Client & Finance Manager
            </p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4 no-scrollbar">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )
              }
            >
              <item.icon
                className="h-4.5 w-4.5 shrink-0"
                style={{ width: 18, height: 18 }}
              />
              <div className="flex flex-col">
                <span className="font-medium leading-tight">{item.label}</span>
                <span className="text-[10px] opacity-60">{item.sublabel}</span>
              </div>
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-sidebar-border px-5 py-4">
          <p className="text-[11px] text-sidebar-foreground/50">
            {data.clients.length} beneficiaries · {data.works.length} works
          </p>
        </div>
      </aside>

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Main */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur lg:px-8">
          <button
            className="rounded-md p-2 text-muted-foreground hover:bg-muted lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <div className="flex-1">
            <h1 className="text-sm font-semibold text-foreground sm:text-base">
              <span className="text-gradient">FinanceFlow</span>
            </h1>
            <p className="text-[11px] text-muted-foreground">
              Client → Work → Transaction → Balance → Report
            </p>
          </div>
          <div className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex">
            <span className="h-2 w-2 rounded-full bg-success" />
            Data saved locally
          </div>
        </header>

        <main className="animate-fade-in px-4 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
