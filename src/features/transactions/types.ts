export type TransactionType = "entrada" | "gasto";

export type TransactionStatus = "recebido" | "pendente" | "pago";

export type Transaction = {
  id: string;
  description: string;
  category: string;
  date: string;
  type: TransactionType;
  amount: number;
  status: TransactionStatus;
};

export type FilterType = "todos" | TransactionType;
