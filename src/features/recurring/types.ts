export type BillStatus = "paid" | "pending" | "overdue";
export type Recurrence = "monthly" | "annual" | "weekly";

export type FixedBill = {
  id: string;
  name: string;
  category: string;
  amount: number;
  recurrence: Recurrence;
  dueDay: number;
  status: BillStatus;
};

export type BillPayload = Omit<FixedBill, "id" | "status">;

export type Installment = {
  id: string;
  name: string;
  category: string;
  totalAmount: number;
  paidAmount: number;
  totalInstallments: number;
  paidInstallments: number;
  dueDay: number;
  startDate: string;
};

export type InstallmentEditScope = "current" | "future" | "all";

export type InstallmentEditPayload = {
  name: string;
  category: string;
  totalAmount: number;
  totalInstallments: number;
  dueDay: number;
  scope: InstallmentEditScope;
};
