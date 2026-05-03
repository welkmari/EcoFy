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
        "bg-surface/50 p-6 rounded-2xl border border-gray-800 flex flex-col gap-4 flex-1 min-w-0",
        className,
      )}
    >
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-white text-3xl font-bold">{value}</h2>
          <p className="text-gray-400 text-sm">{label}</p>
        </div>
        <div className={cn("p-2 rounded-xl", bg, color)}>
          <Icon size={24} />
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm">
        <span className={cn("flex items-center", color)}>
          {isUp ? (
            <ArrowUpRightIcon size={16} />
          ) : (
            <ArrowDownRightIcon size={16} />
          )}
          {change}
        </span>
        <span className="text-gray-500">{percentage} this week</span>
      </div>
    </div>
  );
}
