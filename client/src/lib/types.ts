export type WorkStatus = "Pending" | "Running" | "Completed" | "Issue";
export type WorkPriority = "Low" | "Medium" | "High" | "Urgent";
export type TxnType = "Received" | "Expense" | "Receivable" | "Payable";
export type PaymentMethod = "Cash" | "Bank" | "Mobile Banking" | "Cheque" | "Card" | "Other";

export interface Contact { id: string; name: string; role: string; phone: string; email: string; }
export interface Work {
  id: string; clientId: string; category: string; title: string; description: string;
  status: WorkStatus; priority: WorkPriority; fee: number; dueDate: string; startDate: string; notes: string; createdAt: string;
}
export interface Transaction {
  id: string; clientId: string | null; workId: string | null; type: TxnType; date: string; amount: number;
  description: string; paymentMethod: PaymentMethod; remarks: string; bankAccountId: string | null; createdAt: string;
}
export interface BankAccount { id: string; name: string; bankName: string; accountNumber: string; openingBalance: number; }
export interface Client {
  id: string; name: string; businessName: string; category: string; type: "Regular" | "Irregular";
  address: string; rating: number; contacts: Contact[]; notes: string; createdAt: string;
}
export interface Movement {
  id: string; clientId: string; date: string; location: string; checkIn: string; checkOut: string; purpose: string; durationMinutes: number; createdAt: string;
}
export interface Project {
  id: string; name: string; description: string; deadline: string; status: WorkStatus; priority: WorkPriority; createdAt: string;
}
export interface FeeCharge { id: string; name: string; description: string; createdAt: string; }
export interface BusinessInfo { name: string; address: string; cell: string; email: string; website: string; }
export interface AppData {
  clients: Client[]; works: Work[]; transactions: Transaction[]; bankAccounts: BankAccount[]; categories: string[];
  movements: Movement[]; projects: Project[]; fees: FeeCharge[]; business: BusinessInfo;
}
