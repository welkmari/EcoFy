"use client";

import {
  CheckCircleIcon,
  ClockIcon,
  WarningCircleIcon,
  ArrowCounterClockwiseIcon,
} from "@phosphor-icons/react";
import { cn } from "@/lib/cn";
import type { FixedBill, BillStatus } from "../types";

type Props = {
  bill: FixedBill;
  onMarkPaid: (id: string) => void;
  onUndo: (id: string) => void;
};

const STATUS_CONFIG: Record<
  BillStatus,
  { label: string; color: string; bg: string; icon: React.ReactNode }
> = {
  paid: {
    label: "Paid",
    color: "text-cyan-400",
    bg: "bg-cyan-400/10",
    icon: <CheckCircleIcon size={22} weight="fill" />,
  },
  pending: {
    label: "Pending",
    color: "text-yellow-500",
    bg: "bg-yellow-500/10",
    icon: <ClockIcon size={22} weight="fill" />,
  },
  overdue: {
    label: "Overdue",
    color: "text-red-400",
    bg: "bg-red-400/10",
    icon: <WarningCircleIcon size={22} weight="fill" />,
  },
};

const RECURRENCE_LABEL: Record<string, string> = {
  monthly: "Monthly",
  annual: "Annual",
  weekly: "Weekly",
};

export default function BillCard({ bill, onMarkPaid, onUndo }: Props) {
  const config = STATUS_CONFIG[bill.status];
  const fmt = (v: number) =>
    `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

  return (
    <div
      className={cn(
        "bg-surface/50 border rounded-2xl p-5 flex flex-col gap-4 transition-all",
        bill.status === "overdue"
          ? "border-red-400/30"
          : "border-border-default",
      )}
    >
      <div className="flex items-start justify-between">
        <div className={cn("p-2 rounded-xl", config.bg, config.color)}>
          {config.icon}
        </div>
        <div className="text-right">
          <p className="text-white text-xl font-bold">{fmt(bill.amount)}</p>
          <span
            className={cn(
              "text-xs font-semibold px-2 py-0.5 rounded-full",
              config.bg,
              config.color,
            )}
          >
            {config.label}
          </span>
        </div>
      </div>

      <div>
        <p className="text-white font-semibold">{bill.name}</p>
        <p className="text-text-muted text-xs mt-0.5">
          {bill.category} · Due day{" "}
          <span className="font-medium text-text-secondary">{bill.dueDay}</span>{" "}
          · {RECURRENCE_LABEL[bill.recurrence]}
        </p>
      </div>

      {bill.status === "paid" ? (
        <div className="flex items-center justify-between gap-2 py-2.5 px-4 rounded-xl bg-cyan-400/10 text-cyan-400 text-sm font-semibold">
          <div className="flex items-center gap-2">
            <CheckCircleIcon size={16} />
            Payment Confirmed
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onUndo(bill.id);
            }}
            className="p-1 rounded-lg hover:bg-cyan-400/20 transition-colors"
            title="Desfazer"
          >
            <ArrowCounterClockwiseIcon size={14} />
          </button>
        </div>
      ) : (
        <button
          onClick={() => onMarkPaid(bill.id)}
          className={cn(
            "w-full py-2.5 rounded-xl text-sm font-bold transition-all",
            bill.status === "overdue"
              ? "bg-red-400 hover:bg-red-300 text-white"
              : "bg-surface border border-border-default text-text-primary hover:border-border-active hover:text-white",
          )}
        >
          Mark as Paid
        </button>
      )}
    </div>
  );
}
