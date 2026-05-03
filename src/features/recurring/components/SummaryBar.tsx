"use client";

import {
  CalendarCheckIcon,
  HourglassIcon,
  CheckCircleIcon,
} from "@phosphor-icons/react";
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
    <div className="grid grid-cols-3 gap-4">
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
          color: "text-cyan-400",
          bg: "bg-cyan-400/10",
        },
      ].map(({ label, value, icon, color, bg }) => (
        <div
          key={label}
          className="bg-surface/50 border border-border-default rounded-2xl p-5 flex items-center justify-between"
        >
          <div>
            <p className="text-text-muted text-xs">{label}</p>
            <p className={`text-xl font-bold mt-1 ${color}`}>{value}</p>
          </div>
          <div className={`p-2.5 rounded-xl ${bg} ${color}`}>{icon}</div>
        </div>
      ))}
    </div>
  );
}
