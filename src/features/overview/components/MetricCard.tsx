"use client";

import {
  ArrowDownRightIcon,
  ArrowUpRightIcon,
  TrendUpIcon,
  TrendDownIcon,
  ReceiptIcon,
  ChartLineUpIcon,
} from "@phosphor-icons/react";
import { cn } from "@/lib/cn";

const VARIANT_CONFIG = {
  ganhos: {
    icon: TrendUpIcon,
    label: "Ganhos totais",
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
  },
  saidas: {
    icon: TrendDownIcon,
    label: "Saídas totais",
    color: "text-rose-400",
    bg: "bg-rose-400/10",
  },
  contas: {
    icon: ReceiptIcon,
    label: "Contas Mensais",
    color: "text-yellow-400",
    bg: "bg-yellow-400/10",
  },
  investimentos: {
    icon: ChartLineUpIcon,
    label: "Investimentos",
    color: "text-blue-400",
    bg: "bg-blue-400/10",
  },
} as const;

type Variant = keyof typeof VARIANT_CONFIG;

type MetricCardProps = {
  variant: Variant;
  value: string;
  change: string;
  percentage: string;
  isUp: boolean;
  className?: string;
};

export default function MetricCard({
  variant,
  value,
  change,
  percentage,
  isUp,
  className,
}: MetricCardProps) {
  const { icon: Icon, label, color, bg } = VARIANT_CONFIG[variant];

  return (
    <div
      className={cn(
        "flex min-w-0 flex-1 flex-col gap-3 rounded-2xl border border-gray-800 bg-surface/50 p-4 sm:gap-4 sm:p-5 xl:p-6",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-xl font-bold text-white sm:text-2xl xl:text-3xl">
            {value}
          </h2>
          <p className="text-sm text-gray-400">{label}</p>
        </div>
        <div className={cn("shrink-0 rounded-xl p-2", bg, color)}>
          <Icon size={22} />
        </div>
      </div>

      <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-sm">
        <span className={cn("flex items-center font-semibold", color)}>
          {isUp ? (
            <ArrowUpRightIcon size={16} />
          ) : (
            <ArrowDownRightIcon size={16} />
          )}
          {change}
        </span>
        <span className="text-gray-500">{percentage}</span>
      </div>
    </div>
  );
}
