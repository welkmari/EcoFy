"use client";

import {
  ArrowCircleUpIcon,
  ArrowCircleDownIcon,
  ScalesIcon,
} from "@phosphor-icons/react";
import { cn } from "@/lib/cn";
import type { Transaction } from "../types";

type Props = { transactions: Transaction[] };

export default function SummaryCards({ transactions }: Props) {
  const entradas = transactions
    .filter((t) => t.type === "entrada")
    .reduce((acc, t) => acc + t.amount, 0);
  const gastos = transactions
    .filter((t) => t.type === "gasto")
    .reduce((acc, t) => acc + t.amount, 0);
  const saldo = entradas - gastos;
  const isPositive = saldo >= 0;

  const fmt = (v: number) =>
    `R$ ${Math.abs(v).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="bg-surface/50 border border-border-default rounded-2xl p-5 flex items-center justify-between">
        <div>
          <p className="text-text-muted text-xs">Saldo do mês</p>
          <p
            className={cn(
              "text-2xl font-bold mt-1",
              isPositive ? "text-cyan-400" : "text-red-400",
            )}
          >
            {isPositive ? "+" : "-"}
            {fmt(saldo)}
          </p>
        </div>
        <div
          className={cn(
            "p-2.5 rounded-xl",
            isPositive
              ? "bg-cyan-400/10 text-cyan-400"
              : "bg-red-400/10 text-red-400",
          )}
        >
          <ScalesIcon size={22} />
        </div>
      </div>

      <div className="bg-surface/50 border border-border-default rounded-2xl p-5 flex items-center justify-between">
        <div>
          <p className="text-text-muted text-xs">Total de entradas</p>
          <p className="text-2xl font-bold mt-1 text-cyan-400">
            {fmt(entradas)}
          </p>
        </div>
        <div className="p-2.5 rounded-xl bg-cyan-400/10 text-cyan-400">
          <ArrowCircleUpIcon size={22} />
        </div>
      </div>

      <div className="bg-surface/50 border border-border-default rounded-2xl p-5 flex items-center justify-between">
        <div>
          <p className="text-text-muted text-xs">Total de gastos</p>
          <p className="text-2xl font-bold mt-1 text-red-400">{fmt(gastos)}</p>
        </div>
        <div className="p-2.5 rounded-xl bg-red-400/10 text-red-400">
          <ArrowCircleDownIcon size={22} />
        </div>
      </div>
    </div>
  );
}
