"use client";

import type { Transaction } from "../types";
import TransactionRow from "./TransactionRow";

type Props = {
  transactions: Transaction[];
  onEdit: (t: Transaction) => void;
  onDelete: (id: string) => void;
};

export default function TransactionsTable({
  transactions,
  onEdit,
  onDelete,
}: Props) {
  return (
    <div className="bg-surface/50 border border-border-default rounded-2xl overflow-hidden">
      <div className="overflow-y-auto scrollbar-hide max-h-[420px]">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-surface text-text-muted text-xs uppercase tracking-wider z-10">
            <tr>
              <th className="px-4 py-3 font-medium">Descrição</th>
              <th className="px-4 py-3 font-medium">Categoria</th>
              <th className="px-4 py-3 font-medium">Data</th>
              <th className="px-4 py-3 font-medium">Tipo</th>
              <th className="px-4 py-3 font-medium">Valor</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-12 text-center text-text-muted text-sm"
                >
                  Nenhuma transação encontrada.
                </td>
              </tr>
            ) : (
              transactions.map((t) => (
                <TransactionRow
                  key={t.id}
                  transaction={t}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
