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
