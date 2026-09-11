import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { AppData, BankAccount, BusinessInfo, Client, FeeCharge, Movement, Project, Transaction, Work } from "./types";
import { seedData } from "./seed";
import { uid } from "./format";

const STORAGE_KEY = "financeflow_data_v2";
function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...seedData, ...(JSON.parse(raw) as Partial<AppData>) };
  } catch { /* use seed */ }
  return seedData;
}
interface StoreContextValue {
  data: AppData;
  addClient: (c: Omit<Client, "id" | "createdAt">) => Client; updateClient: (id: string, patch: Partial<Client>) => void; deleteClient: (id: string) => void;
  addWork: (w: Omit<Work, "id" | "createdAt">) => Work; updateWork: (id: string, patch: Partial<Work>) => void; deleteWork: (id: string) => void;
  addTransaction: (t: Omit<Transaction, "id" | "createdAt">) => Transaction; updateTransaction: (id: string, patch: Partial<Transaction>) => void; deleteTransaction: (id: string) => void;
  addBankAccount: (b: Omit<BankAccount, "id">) => BankAccount; updateBankAccount: (id: string, patch: Partial<BankAccount>) => void; deleteBankAccount: (id: string) => void;
  addMovement: (m: Omit<Movement, "id" | "createdAt" | "durationMinutes">) => Movement; updateMovement: (id: string, patch: Partial<Movement>) => void; deleteMovement: (id: string) => void;
  addProject: (p: Omit<Project, "id" | "createdAt">) => Project; updateProject: (id: string, patch: Partial<Project>) => void; deleteProject: (id: string) => void;
  addFee: (f: Omit<FeeCharge, "id" | "createdAt">) => FeeCharge; updateFee: (id: string, patch: Partial<FeeCharge>) => void; deleteFee: (id: string) => void;
  updateBusiness: (patch: Partial<BusinessInfo>) => void; addCategory: (name: string) => void; renameCategory: (oldName: string, newName: string) => void; deleteCategory: (name: string) => void; deleteSection: (section: keyof AppData) => void; resetData: () => void;
}
const StoreContext = createContext<StoreContextValue | null>(null);
const today = () => new Date().toISOString().slice(0, 10);
export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(() => loadData());
  useEffect(() => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {} }, [data]);
  const mutate = useCallback(<K extends keyof AppData>(key: K, fn: (items: AppData[K]) => AppData[K]) => setData(d => ({ ...d, [key]: fn(d[key]) })), []);
  const addClient = useCallback((c: Omit<Client, "id" | "createdAt">) => { const x = { ...c, id: uid("cl"), createdAt: today() }; mutate("clients", xs => [x, ...xs]); return x; }, [mutate]);
  const updateClient = useCallback((id: string, patch: Partial<Client>) => mutate("clients", xs => xs.map(x => x.id === id ? { ...x, ...patch } : x)), [mutate]);
  const deleteClient = useCallback((id: string) => setData(d => ({ ...d, clients: d.clients.filter(x => x.id !== id), works: d.works.filter(x => x.clientId !== id), transactions: d.transactions.filter(x => x.clientId !== id), movements: d.movements.filter(x => x.clientId !== id) })), []);
  const addWork = useCallback((w: Omit<Work, "id" | "createdAt">) => { const x = { ...w, id: uid("wk"), createdAt: today() }; mutate("works", xs => [x, ...xs]); return x; }, [mutate]);
  const updateWork = useCallback((id: string, patch: Partial<Work>) => mutate("works", xs => xs.map(x => x.id === id ? { ...x, ...patch } : x)), [mutate]);
  const deleteWork = useCallback((id: string) => setData(d => ({ ...d, works: d.works.filter(x => x.id !== id), transactions: d.transactions.filter(x => x.workId !== id) })), []);
  const addTransaction = useCallback((t: Omit<Transaction, "id" | "createdAt">) => { const x = { ...t, id: uid("tx"), createdAt: new Date().toISOString() }; mutate("transactions", xs => [x, ...xs]); return x; }, [mutate]);
  const updateTransaction = useCallback((id: string, patch: Partial<Transaction>) => mutate("transactions", xs => xs.map(x => x.id === id ? { ...x, ...patch } : x)), [mutate]);
  const deleteTransaction = useCallback((id: string) => mutate("transactions", xs => xs.filter(x => x.id !== id)), [mutate]);
  const addBankAccount = useCallback((b: Omit<BankAccount, "id">) => { const x = { ...b, id: uid("bk") }; mutate("bankAccounts", xs => [...xs, x]); return x; }, [mutate]);
  const updateBankAccount = useCallback((id: string, patch: Partial<BankAccount>) => mutate("bankAccounts", xs => xs.map(x => x.id === id ? { ...x, ...patch } : x)), [mutate]);
  const deleteBankAccount = useCallback((id: string) => mutate("bankAccounts", xs => xs.filter(x => x.id !== id)), [mutate]);
  const addMovement = useCallback((m: Omit<Movement, "id" | "createdAt" | "durationMinutes">) => { const durationMinutes = duration(m.checkIn, m.checkOut); const x = { ...m, durationMinutes, id: uid("mv"), createdAt: new Date().toISOString() }; mutate("movements", xs => [x, ...xs]); return x; }, [mutate]);
  const updateMovement = useCallback((id: string, patch: Partial<Movement>) => mutate("movements", xs => xs.map(x => x.id === id ? { ...x, ...patch, durationMinutes: duration(patch.checkIn ?? x.checkIn, patch.checkOut ?? x.checkOut) } : x)), [mutate]);
  const deleteMovement = useCallback((id: string) => mutate("movements", xs => xs.filter(x => x.id !== id)), [mutate]);
  const addProject = useCallback((p: Omit<Project, "id" | "createdAt">) => { const x = { ...p, id: uid("pr"), createdAt: today() }; mutate("projects", xs => [x, ...xs]); return x; }, [mutate]);
  const updateProject = useCallback((id: string, patch: Partial<Project>) => mutate("projects", xs => xs.map(x => x.id === id ? { ...x, ...patch } : x)), [mutate]);
  const deleteProject = useCallback((id: string) => mutate("projects", xs => xs.filter(x => x.id !== id)), [mutate]);
  const addFee = useCallback((f: Omit<FeeCharge, "id" | "createdAt">) => { const x = { ...f, id: uid("fee"), createdAt: today() }; mutate("fees", xs => [x, ...xs]); return x; }, [mutate]);
  const updateFee = useCallback((id: string, patch: Partial<FeeCharge>) => mutate("fees", xs => xs.map(x => x.id === id ? { ...x, ...patch } : x)), [mutate]);
  const deleteFee = useCallback((id: string) => mutate("fees", xs => xs.filter(x => x.id !== id)), [mutate]);
  const updateBusiness = useCallback((patch: Partial<BusinessInfo>) => setData(d => ({ ...d, business: { ...d.business, ...patch } })), []);
  const addCategory = useCallback((name: string) => { const n = name.trim(); if (n) mutate("categories", xs => xs.includes(n) ? xs : [...xs, n]); }, [mutate]);
  const renameCategory = useCallback((oldName: string, newName: string) => { const n = newName.trim(); if (!n) return; setData(d => ({ ...d, categories: d.categories.map(x => x === oldName ? n : x), clients: d.clients.map(x => x.category === oldName ? { ...x, category: n } : x), works: d.works.map(x => x.category === oldName ? { ...x, category: n } : x) })); }, []);
  const deleteCategory = useCallback((name: string) => mutate("categories", xs => xs.filter(x => x !== name)), [mutate]);
  const deleteSection = useCallback((section: keyof AppData) => { if (Array.isArray(seedData[section])) setData(d => ({ ...d, [section]: [] })); }, []);
  const resetData = useCallback(() => { localStorage.removeItem(STORAGE_KEY); setData(seedData); }, []);
  const value = useMemo(() => ({ data, addClient, updateClient, deleteClient, addWork, updateWork, deleteWork, addTransaction, updateTransaction, deleteTransaction, addBankAccount, updateBankAccount, deleteBankAccount, addMovement, updateMovement, deleteMovement, addProject, updateProject, deleteProject, addFee, updateFee, deleteFee, updateBusiness, addCategory, renameCategory, deleteCategory, deleteSection, resetData }), [data, addClient, updateClient, deleteClient, addWork, updateWork, deleteWork, addTransaction, updateTransaction, deleteTransaction, addBankAccount, updateBankAccount, deleteBankAccount, addMovement, updateMovement, deleteMovement, addProject, updateProject, deleteProject, addFee, updateFee, deleteFee, updateBusiness, addCategory, renameCategory, deleteCategory, deleteSection, resetData]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}
function duration(start: string, end: string) { if (!start || !end) return 0; const [sh, sm] = start.split(":").map(Number); const [eh, em] = end.split(":").map(Number); const value = (eh * 60 + em) - (sh * 60 + sm); return value >= 0 ? value : value + 1440; }
export function useStore() { const ctx = useContext(StoreContext); if (!ctx) throw new Error("useStore must be used within StoreProvider"); return ctx; }
