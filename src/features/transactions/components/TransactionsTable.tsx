"use client";

import type { Transaction } from "../types";
import TransactionRow from "./TransactionRow";

type Props = {
  transactions: Transaction[];
  searchTerm?: string;
  onEdit: (t: Transaction) => void;
  onDelete: (id: string) => void;
};

export default function TransactionsTable({
  transactions,
  searchTerm = "",
  onEdit,
  onDelete,
}: Props) {
  const grouped = transactions.reduce<Record<string, Transaction[]>>(
    (acc, transaction) => {
      const date = transaction.date;
      acc[date] = [...(acc[date] ?? []), transaction];
      return acc;
    },
    {},
  );
  const dates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return (
    <div className="overflow-hidden rounded-2xl border border-border-default bg-surface/50">
      <div className="block md:hidden">
        {transactions.length === 0 ? (
          <EmptyState searchTerm={searchTerm} />
        ) : (
          <div className="max-h-[520px] overflow-y-auto scrollbar-hide">
            {dates.map((date) => (
              <section key={date}>
                <div className="sticky top-0 z-10 border-y border-border-default bg-surface px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-text-muted">
                  {new Date(`${date}T00:00:00`).toLocaleDateString("pt-BR", {
                    weekday: "short",
                    day: "2-digit",
                    month: "short",
                  })}
                </div>
                <div className="divide-y divide-border-default">
                  {grouped[date].map((transaction) => (
                    <TransactionRow
                      key={transaction.id}
                      transaction={transaction}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      compact
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>

      <div className="overflow-y-auto scrollbar-hide max-h-[420px]">
        <table className="hidden w-full border-collapse text-left md:table">
          <thead className="sticky top-0 bg-surface text-text-muted text-xs uppercase tracking-wider z-10">
            <tr>
              <th className="px-4 py-3 font-medium">Data</th>
              <th className="px-4 py-3 font-medium">Descrição</th>
              <th className="px-4 py-3 font-medium">Categoria</th>
              <th className="px-4 py-3 font-medium">Conta</th>
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
                  {searchTerm
                    ? `Nenhuma transação encontrada para "${searchTerm}".`
                    : "Nenhuma transação encontrada."}
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

function EmptyState({ searchTerm }: { searchTerm: string }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      <div className="mb-4 grid h-16 w-16 place-items-center rounded-2xl border border-border-default bg-base/60 text-2xl">
        <span aria-hidden>?</span>
      </div>
      <p className="text-sm font-bold text-text-primary">
        {searchTerm
          ? `Nenhuma transação encontrada para "${searchTerm}".`
          : "Nenhuma transação neste mês."}
      </p>
      <p className="mt-1 max-w-64 text-xs text-text-muted">
        Ajuste a busca, troque o mês ou registre uma nova movimentação.
      </p>
    </div>
  );
}
