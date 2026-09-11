import type { AppData, Transaction, Work } from "./types";

export interface WorkBalance {
  received: number;
  expense: number;
  receivable: number;
  payable: number;
  net: number; // received - expense
  outstanding: number; // receivable - payable
}

export function workBalance(
  transactions: Transaction[],
  workId: string,
): WorkBalance {
  const b: WorkBalance = {
    received: 0,
    expense: 0,
    receivable: 0,
    payable: 0,
    net: 0,
    outstanding: 0,
  };
  for (const t of transactions) {
    if (t.workId !== workId) continue;
    if (t.type === "Received") b.received += t.amount;
    else if (t.type === "Expense") b.expense += t.amount;
    else if (t.type === "Receivable") b.receivable += t.amount;
    else if (t.type === "Payable") b.payable += t.amount;
  }
  b.net = b.received - b.expense;
  b.outstanding = b.receivable - b.payable;
  return b;
}

export interface ClientBalance {
  received: number;
  expense: number;
  receivable: number;
  payable: number;
  net: number;
  outstanding: number;
}

export function clientBalance(
  transactions: Transaction[],
  clientId: string,
): ClientBalance {
  const b: ClientBalance = {
    received: 0,
    expense: 0,
    receivable: 0,
    payable: 0,
    net: 0,
    outstanding: 0,
  };
  for (const t of transactions) {
    if (t.clientId !== clientId) continue;
    if (t.type === "Received") b.received += t.amount;
    else if (t.type === "Expense") b.expense += t.amount;
    else if (t.type === "Receivable") b.receivable += t.amount;
    else if (t.type === "Payable") b.payable += t.amount;
  }
  b.net = b.received - b.expense;
  b.outstanding = b.receivable - b.payable;
  return b;
}

export interface Totals {
  totalReceived: number;
  totalExpense: number;
  totalReceivable: number;
  totalPayable: number;
  pendingPayments: number;
}

export function globalTotals(data: AppData): Totals {
  let totalReceived = 0,
    totalExpense = 0,
    totalReceivable = 0,
    totalPayable = 0;
  for (const t of data.transactions) {
    if (t.clientId === null) {
      // personal finance expenses only count as expense
      if (t.type === "Expense") totalExpense += t.amount;
      continue;
    }
    if (t.type === "Received") totalReceived += t.amount;
    else if (t.type === "Expense") totalExpense += t.amount;
    else if (t.type === "Receivable") totalReceivable += t.amount;
    else if (t.type === "Payable") totalPayable += t.amount;
  }
  const pendingPayments = data.works.filter(
    (w) => w.status === "Issue",
  ).length;
  return {
    totalReceived,
    totalExpense,
    totalReceivable,
    totalPayable,
    pendingPayments,
  };
}

export function categorySummary(data: AppData) {
  const map = new Map<
    string,
    {
      works: number;
      received: number;
      expense: number;
      receivable: number;
      payable: number;
    }
  >();
  for (const cat of data.categories) {
    map.set(cat, {
      works: 0,
      received: 0,
      expense: 0,
      receivable: 0,
      payable: 0,
    });
  }
  for (const w of data.works) {
    const e = map.get(w.category) ?? {
      works: 0,
      received: 0,
      expense: 0,
      receivable: 0,
      payable: 0,
    };
    e.works += 1;
    map.set(w.category, e);
  }
  for (const t of data.transactions) {
    if (!t.clientId) continue;
    const work = data.works.find((w) => w.id === t.workId);
    const cat =
      work?.category ?? data.clients.find((c) => c.id === t.clientId)?.category;
    if (!cat) continue;
    const e = map.get(cat) ?? {
      works: 0,
      received: 0,
      expense: 0,
      receivable: 0,
      payable: 0,
    };
    if (t.type === "Received") e.received += t.amount;
    else if (t.type === "Expense") e.expense += t.amount;
    else if (t.type === "Receivable") e.receivable += t.amount;
    else if (t.type === "Payable") e.payable += t.amount;
    map.set(cat, e);
  }
  return map;
}

export function statusSummary(works: Work[]) {
  const counts: Record<string, number> = {
    Pending: 0,
    Running: 0,
    Completed: 0,
    Issue: 0,
  };
  for (const w of works) counts[w.status] = (counts[w.status] ?? 0) + 1;
  return counts;
}

export interface BankBalance {
  id: string;
  name: string;
  bankName: string;
  accountNumber: string;
  openingBalance: number;
  deposits: number;
  withdrawals: number;
  balance: number;
}

export function bankBalance(data: AppData, bankId: string): BankBalance {
  const acc = data.bankAccounts.find((b) => b.id === bankId);
  let deposits = 0,
    withdrawals = 0;
  for (const t of data.transactions) {
    if (t.bankAccountId !== bankId) continue;
    if (t.type === "Received") deposits += t.amount;
    else if (t.type === "Expense") withdrawals += t.amount;
  }
  return {
    id: bankId,
    name: acc?.name ?? "",
    bankName: acc?.bankName ?? "",
    accountNumber: acc?.accountNumber ?? "",
    openingBalance: acc?.openingBalance ?? 0,
    deposits,
    withdrawals,
    balance: (acc?.openingBalance ?? 0) + deposits - withdrawals,
  };
}
