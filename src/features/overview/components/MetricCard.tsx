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
import { useEffect, useRef, useState } from "react";

const VARIANT_CONFIG = {
  ganhos: {
    icon: TrendUpIcon,
    label: "Ganhos totais",
    color: "text-cyan-400",
    bg: "bg-cyan-400/10",
  },
  saidas: {
    icon: TrendDownIcon,
    label: "Saídas totais",
    color: "text-red-400",
    bg: "bg-red-400/10",
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

// Helper to detect if text is overflowing
function useOverflowDetection(ref: React.RefObject<HTMLElement | null>) {
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    const checkOverflow = () => {
      if (ref.current) {
        setIsOverflowing(ref.current.scrollWidth > ref.current.clientWidth);
      }
    };

    checkOverflow();
    window.addEventListener("resize", checkOverflow);
    return () => window.removeEventListener("resize", checkOverflow);
  }, [ref]);

  return isOverflowing;
}

// Format large numbers with compact notation when needed
function formatCompactValue(value: string): string {
  // Extract numeric value from currency string (e.g., "R$ 1.234,56" -> 1234.56)
  const match = value.match(/([\d.,]+)/);
  if (!match) return value;
  
  const cleanNumber = parseFloat(
    match[0].replace(/\./g, "").replace(",", ".")
  );
  
  if (isNaN(cleanNumber)) return value;
  
  // Use compact notation for numbers >= 1 million
  if (Math.abs(cleanNumber) >= 1_000_000) {
    const formatter = new Intl.NumberFormat("pt-BR", {
      notation: "compact",
      compactDisplay: "short",
      maximumFractionDigits: 1,
    });
    const compactNum = formatter.format(cleanNumber);
    // Re-apply currency symbol
    return value.replace(/R?\$?\s?[\d.,]+/, `R$ ${compactNum}`);
  }
  
  return value;
}

export default function MetricCard({
  variant,
  value,
  change,
  percentage,
  isUp,
  className,
}: MetricCardProps) {
  const { icon: Icon, label, color, bg } = VARIANT_CONFIG[variant];
  const textRef = useRef<HTMLHeadingElement>(null);
  const isOverflowing = useOverflowDetection(textRef);
  
  // Apply compact formatting if overflowing or value is large
  const displayValue = isOverflowing ? formatCompactValue(value) : value;

  return (
    <div
      className={cn(
        "flex min-w-0 flex-1 flex-col gap-3 rounded-2xl border border-gray-800 bg-surface/50 p-4 sm:gap-4 sm:p-5 xl:p-6",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h2
            ref={textRef}
            className="truncate font-bold text-white sm:text-2xl xl:text-3xl"
            style={{
              fontSize: "clamp(1.25rem, 5vw, 1.875rem)",
              lineHeight: 1.2,
            }}
            title={value} // Show full value on hover
          >
            {displayValue}
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