"use client";

import type { Transaction } from "../types";
import TransactionRow from "./TransactionRow";
import { getMonthBadge, getMonthLabel } from "../utils";

type Props = {
  transactions: Transaction[];
  searchTerm?: string;
  month: string;
  selectedCategory?: string | null;
  onEdit: (t: Transaction) => void;
  onDelete: (id: string) => void;
};

export default function TransactionsTable({
  transactions,
  searchTerm = "",
  month,
  selectedCategory = null,
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
    <div className="overflow-hidden rounded-2xl bg-surface/75 shadow-[0_14px_34px_rgba(0,0,0,0.16)]">
      <MonthTitle month={month} />
      <div className="block md:hidden">
        {transactions.length === 0 ? (
          <EmptyState
            searchTerm={searchTerm}
            month={month}
            selectedCategory={selectedCategory}
          />
        ) : (
          <div className="max-h-[520px] overflow-y-auto scrollbar-hide">
            {dates.map((date) => (
              <section key={date}>
                <div className="sticky top-0 z-10 bg-base/35 px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-text-muted">
                  {new Date(`${date}T00:00:00`).toLocaleDateString("pt-BR", {
                    weekday: "short",
                    day: "2-digit",
                    month: "short",
                  })}
                </div>
                <div className="divide-y divide-white/[0.04]">
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
          <thead className="sticky top-0 z-10 bg-base/25 text-xs uppercase tracking-wider text-text-muted">
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
                  {getEmptyMessage(searchTerm, month, selectedCategory)}
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

function MonthTitle({ month }: { month: string }) {
  return (
    <div className="flex items-center gap-2 bg-surface/70 px-4 py-3">
      <h3 className="text-sm font-black capitalize text-text-primary">
        {getMonthLabel(month)}
      </h3>
      <span className="rounded-full bg-purple-500/[0.12] px-2.5 py-1 text-[11px] font-bold text-purple-400">
        {getMonthBadge(month)}
      </span>
    </div>
  );
}

function getEmptyMessage(
  searchTerm: string,
  month: string,
  selectedCategory?: string | null,
) {
  if (searchTerm) return `Nenhuma transação encontrada para "${searchTerm}".`;

  const label = getMonthLabel(month);
  if (selectedCategory) {
    return `Nenhuma transação de ${selectedCategory} em ${label}.`;
  }

  return `Nenhuma transação em ${label}.`;
}

function EmptyState({
  searchTerm,
  month,
  selectedCategory,
}: {
  searchTerm: string;
  month: string;
  selectedCategory?: string | null;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      <div className="mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-base/60 text-2xl">
        <span aria-hidden>?</span>
      </div>
      <p className="text-sm font-bold text-text-primary">
        {getEmptyMessage(searchTerm, month, selectedCategory)}
      </p>
      <p className="mt-1 max-w-64 text-xs text-text-muted">
        Ajuste a busca, troque o mês ou registre uma nova movimentação.
      </p>
    </div>
  );
}
