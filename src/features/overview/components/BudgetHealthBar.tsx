"use client";

import { useState } from "react";
import { formatBrl, formatCompactBrl } from "@/lib/chartFormatter";
import { cn } from "@/lib/cn";

type BudgetCategory = {
  label: string;
  spent: number;
  budget: number;
  color: string;
};

function getHealthLabel(pct: number) {
  if (pct < 50) return { text: "Ótimo", color: "text-emerald-400" };
  if (pct < 75) return { text: "Atenção", color: "text-yellow-400" };
  return { text: "Crítico", color: "text-rose-400" };
}

function getTooltipLeft(
  segments: Array<{ percent: number }>,
  index: number,
) {
  const previous = segments
    .slice(0, index)
    .reduce((acc, item) => acc + item.percent, 0);
  return previous + segments[index].percent / 2;
}

function getTooltipTransform(length: number, index: number) {
  if (index <= 1) return "translateX(0)";
  if (index >= length - 2) return "translateX(-100%)";
  return "translateX(-50%)";
}

export default function BudgetHealthBar({
  categories,
  totalSpent,
  totalBudget,
}: {
  categories: BudgetCategory[];
  totalSpent: number;
  totalBudget: number;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const safeBudget = Math.max(totalBudget, 1);
  const healthPct = Math.min((totalSpent / safeBudget) * 100, 100);
  const categoriesSpent = categories.reduce((acc, item) => acc + item.spent, 0);
  const available = Math.max(safeBudget - categoriesSpent, 0);
  const segments = [
    ...categories.map((item) => ({
      ...item,
      type: "category" as const,
      percent: Math.max((item.spent / safeBudget) * 100, 1),
      usedPercent: Math.min((item.spent / Math.max(item.budget, 1)) * 100, 100),
    })),
    {
      label: "Disponível",
      spent: available,
      budget: available,
      color: "#1f2937",
      type: "available" as const,
      percent: Math.max((available / safeBudget) * 100, categories.length ? 1 : 100),
      usedPercent: 0,
    },
  ];
  const safeActiveIndex = Math.min(activeIndex, segments.length - 1);
  const active = segments[safeActiveIndex];
  const health = getHealthLabel(healthPct);
  const isAvailable = active.type === "available";

  return (
    <div className="bg-surface/50 p-5 rounded-2xl border border-border-default flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-text-primary font-semibold">Saúde Financeira</h3>
          <p className="text-text-muted text-xs mt-0.5">
            Orçamento usado - Maio 2026
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full border border-border-default bg-base/40 px-3 py-1.5 text-xs font-semibold text-text-primary">
            {formatCompactBrl(totalSpent)} / {formatCompactBrl(totalBudget)}
          </span>
          <span className={cn("text-sm font-semibold", health.color)}>
            {health.text}
          </span>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_260px]">
        <div className="min-w-0 rounded-xl bg-base/20 p-4">
          <div className="mb-3 flex items-end justify-between gap-3">
            <div>
              <p className="text-3xl font-black text-text-primary">
                {Math.round(healthPct)}%
              </p>
              <p className="text-xs text-text-muted">do orçamento mensal</p>
            </div>
            <div className="text-right text-xs text-text-muted">
              <p>{formatBrl(totalSpent)} gastos</p>
              <p>limite {formatBrl(totalBudget)}</p>
            </div>
          </div>

          <div className="relative">
            <div className="flex h-9 overflow-hidden rounded-xl border border-border-default bg-surface">
              {segments.map((item, index) => (
                <button
                  key={item.label}
                  type="button"
                  onMouseEnter={() => setActiveIndex(index)}
                  onFocus={() => setActiveIndex(index)}
                  className={cn(
                    "h-full min-w-2 transition-all duration-200",
                    safeActiveIndex === index && "brightness-125",
                  )}
                  style={{
                    width: `${item.percent}%`,
                    backgroundColor: item.color,
                  }}
                  aria-label={`${item.label}: ${formatBrl(item.spent)}`}
                />
              ))}
            </div>

            <div
              className="pointer-events-none absolute top-11 z-10 w-40 rounded-lg border border-border-default bg-base/95 px-2.5 py-2 text-xs shadow-xl shadow-black/30"
              style={{
                left: `${getTooltipLeft(segments, safeActiveIndex)}%`,
                transform: getTooltipTransform(segments.length, safeActiveIndex),
              }}
            >
              <div className="mb-1 flex items-center justify-between gap-2">
                <span className="flex min-w-0 items-center gap-2 text-text-secondary">
                  <span
                    className="h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: active.color }}
                  />
                  <span className="truncate">{active.label}</span>
                </span>
                <span className="font-bold text-text-primary">
                  {Math.round(active.percent)}%
                </span>
              </div>
              <p className="font-semibold text-text-primary">
                {formatBrl(active.spent)}
              </p>
              {!isAvailable && (
                <p className="mt-0.5 text-[11px] text-text-muted">
                  {Math.round(active.usedPercent)}% da categoria
                </p>
              )}
            </div>
          </div>

          <div className="mt-16 grid grid-cols-3 text-[11px] text-text-muted">
            <span>R$ 0</span>
            <span className="text-center">{formatCompactBrl(totalBudget / 2)}</span>
            <span className="text-right">{formatCompactBrl(totalBudget)}</span>
          </div>
        </div>

        <div className="grid min-w-0 grid-cols-1 gap-1.5 sm:grid-cols-2 xl:grid-cols-1 xl:content-center">
          {categories.map((item, index) => {
            const pct = Math.min((item.spent / item.budget) * 100, 100);
            const over = item.spent > item.budget;

            return (
              <button
                key={item.label}
                type="button"
                onMouseEnter={() => setActiveIndex(index)}
                onFocus={() => setActiveIndex(index)}
                className={cn(
                  "rounded-md border px-2.5 py-2 text-left transition-colors",
                  safeActiveIndex === index
                    ? "border-border-active bg-base/60"
                    : "border-transparent bg-base/20 hover:border-border-default",
                )}
              >
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="flex min-w-0 items-center gap-2">
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="truncate text-xs font-medium text-text-secondary">
                      {item.label}
                    </span>
                  </span>
                  <span
                    className={cn(
                      "shrink-0 text-xs font-bold",
                      over ? "text-rose-400" : "text-text-primary",
                    )}
                  >
                    {Math.round(pct)}%
                  </span>
                </div>
                <div className="h-1 rounded-full bg-surface">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: over ? "#fb7185" : item.color,
                    }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
