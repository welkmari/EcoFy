"use client";

import {
  CalendarCheckIcon,
  HourglassIcon,
  CheckCircleIcon,
} from "@phosphor-icons/react";
import { cn } from "@/lib/cn";
import type { FixedBill, Installment } from "../types";

type Props = { bills: FixedBill[]; installments: Installment[] };

export default function SummaryBar({ bills, installments }: Props) {
  const monthlyInstallments = installments.reduce(
    (acc, i) => acc + i.totalAmount / i.totalInstallments,
    0,
  );
  const monthlyBills = bills.reduce(
    (acc, b) =>
      acc +
      (b.recurrence === "monthly"
        ? b.amount
        : b.recurrence === "annual"
          ? b.amount / 12
          : b.amount * 4.33),
    0,
  );
  const total = monthlyBills + monthlyInstallments;
  const paid = bills
    .filter((b) => b.status === "paid")
    .reduce((acc, b) => acc + b.amount, 0);
  const pending = bills
    .filter((b) => b.status !== "paid")
    .reduce((acc, b) => acc + b.amount, 0);

  const fmt = (v: number) =>
    `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
      {[
        {
          label: "Total mensal comprometido",
          value: fmt(total),
          icon: <CalendarCheckIcon size={20} />,
          color: "text-purple-400",
          bg: "bg-purple-400/10",
        },
        {
          label: "Pendente este mês",
          value: fmt(pending),
          icon: <HourglassIcon size={20} />,
          color: "text-yellow-500",
          bg: "bg-yellow-500/10",
        },
        {
          label: "Pago este mês",
          value: fmt(paid),
          icon: <CheckCircleIcon size={20} />,
          color: "text-emerald-500",
          bg: "bg-emerald-500/10",
        },
      ].map(({ label, value, icon, color, bg }) => (
        <div
          key={label}
          className={cn(
            "flex min-h-24 items-center justify-between rounded-2xl bg-surface/80 px-5 py-4 shadow-[0_14px_34px_rgba(0,0,0,0.18)]",
          )}
        >
          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-text-muted">
              {label}
            </p>
            <p className={cn("mt-1 truncate text-2xl font-black", color)}>
              {value}
            </p>
          </div>
          <div className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-xl", bg, color)}>
            {icon}
          </div>
        </div>
      ))}
    </div>
  );
}
