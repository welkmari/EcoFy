"use client";

import {
  ArrowCircleUpIcon,
  ArrowCircleDownIcon,
} from "@phosphor-icons/react";
import { cn } from "@/lib/cn";
import { useUserPreferences } from "@/lib/useUserPreferences";
import type { Transaction } from "../types";

type Props = { transactions: Transaction[]; month: string };

function isSameMonth(date: string, month: string) {
  return date.startsWith(month);
}

function previousMonth(month: string) {
  const [year, monthIndex] = month.split("-").map(Number);
  return new Date(year, (monthIndex || 1) - 2, 1).toISOString().slice(0, 7);
}

export default function SummaryCards({ transactions, month }: Props) {
  const { preferences } = useUserPreferences();
  const previous = previousMonth(month);
  const monthTransactions = transactions.filter((t) => isSameMonth(t.date, month));
  const previousTransactions = transactions.filter((t) =>
    isSameMonth(t.date, previous),
  );

  const entradas = monthTransactions
    .filter((t) => t.type === "entrada")
    .reduce((acc, t) => acc + t.amount, 0);
  const gastos = monthTransactions
    .filter((t) => t.type === "gasto")
    .reduce((acc, t) => acc + t.amount, 0);
  const previousEntradas = previousTransactions
    .filter((t) => t.type === "entrada")
    .reduce((acc, t) => acc + t.amount, 0);
  const previousGastos = previousTransactions
    .filter((t) => t.type === "gasto")
    .reduce((acc, t) => acc + t.amount, 0);

  const fmt = (v: number) =>
    new Intl.NumberFormat(preferences.language, {
      style: "currency",
      currency: preferences.currency,
      minimumFractionDigits: 2,
    }).format(Math.abs(v));
  const variation = (current: number, previousValue: number) => {
    if (previousValue <= 0) return current > 0 ? "+100%" : "0%";
    const diff = ((current - previousValue) / previousValue) * 100;
    return `${diff >= 0 ? "+" : ""}${diff.toFixed(0)}%`;
  };

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <div className="flex min-h-36 items-center justify-between rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-cyan-400/75">
            Entradas
          </p>
          <p className="mt-2 text-3xl font-black text-cyan-400 sm:text-4xl">
            {fmt(entradas)}
          </p>
          <span className="mt-3 inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-bold text-cyan-300">
            {variation(entradas, previousEntradas)} vs mês passado
          </span>
        </div>
        <div className="rounded-2xl bg-cyan-400/15 p-4 text-cyan-400">
          <ArrowCircleUpIcon size={32} weight="fill" />
        </div>
      </div>

      <div className="flex min-h-36 items-center justify-between rounded-2xl border border-red-400/20 bg-red-400/10 p-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-red-400/75">
            Saídas
          </p>
          <p className="mt-2 text-3xl font-black text-red-400 sm:text-4xl">
            {fmt(gastos)}
          </p>
          <span
            className={cn(
              "mt-3 inline-flex rounded-full border px-3 py-1 text-xs font-bold",
              gastos <= previousGastos
                ? "border-cyan-400/20 bg-cyan-400/10 text-cyan-300"
                : "border-red-400/20 bg-red-400/10 text-red-300",
            )}
          >
            {variation(gastos, previousGastos)} vs mês passado
          </span>
        </div>
        <div className="rounded-2xl bg-red-400/15 p-4 text-red-400">
          <ArrowCircleDownIcon size={32} weight="fill" />
        </div>
      </div>
    </div>
  );
}
