"use client";

import { useState } from "react";
import { CheckIcon, DotsThreeVerticalIcon } from "@phosphor-icons/react";
import { formatBrl, formatCompactBrl } from "@/lib/chartFormatter";
import { cn } from "@/lib/cn";

type BudgetCategory = {
  label: string;
  spent: number;
  budget: number;
  color: string;
};

function getHealthLabel(pct: number) {
  if (pct < 50) return { text: "Ótimo", color: "text-cyan-400" };
  if (pct < 75) return { text: "Atenção", color: "text-yellow-400" };
  return { text: "Crítico", color: "text-red-400" };
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
  onBudgetChange,
}: {
  categories: BudgetCategory[];
  totalSpent: number;
  totalBudget: number;
  onBudgetChange?: (value: number) => void;
}) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [budgetMenuOpen, setBudgetMenuOpen] = useState(false);
  const [budgetDraft, setBudgetDraft] = useState(String(totalBudget));
  const safeBudget = Math.max(totalBudget, 1);
  const healthPct = Math.min((totalSpent / safeBudget) * 100, 100);
  const hasData = categories.length > 0 || totalSpent > 0;
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
  const safeActiveIndex =
    activeIndex == null ? null : Math.min(activeIndex, segments.length - 1);
  const active = safeActiveIndex == null ? null : segments[safeActiveIndex];
  const health = getHealthLabel(healthPct);
  const isAvailable = active?.type === "available";

  const saveBudget = (value: string) => {
    const parsed = Number(value.replace(/\./g, "").replace(",", "."));
    if (Number.isFinite(parsed) && parsed > 0) {
      onBudgetChange?.(parsed);
      setBudgetMenuOpen(false);
    }
  };

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
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setBudgetDraft(String(totalBudget));
                setBudgetMenuOpen((open) => !open);
              }}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-border-default bg-base/40 text-text-muted transition-colors hover:border-border-active hover:text-text-primary"
              aria-label="Editar limite mensal"
            >
              <DotsThreeVerticalIcon size={18} weight="bold" />
            </button>

            {budgetMenuOpen && (
              <div className="absolute right-0 top-10 z-40 w-64 rounded-2xl border border-border-default bg-surface p-3 shadow-2xl shadow-black/30">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-text-muted">
                  Limite mensal
                </p>
                <div className="mt-3 flex items-center gap-2 rounded-xl border border-border-default bg-base px-3 py-2 focus-within:border-border-active">
                  <span className="text-sm font-bold text-text-muted">R$</span>
                  <input
                    value={budgetDraft}
                    onChange={(event) => setBudgetDraft(event.target.value)}
                    onKeyDown={(event) =>
                      event.key === "Enter" && saveBudget(budgetDraft)
                    }
                    className="w-full bg-transparent text-sm font-bold text-text-primary outline-none"
                    inputMode="decimal"
                    aria-label="Novo limite mensal"
                  />
                  <button
                    type="button"
                    onClick={() => saveBudget(budgetDraft)}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-500 text-white transition-colors hover:bg-purple-400"
                    aria-label="Salvar limite"
                  >
                    <CheckIcon size={16} weight="bold" />
                  </button>
                </div>
              </div>
            )}
          </div>
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
                  onMouseLeave={() => setActiveIndex(null)}
                  onBlur={() => setActiveIndex(null)}
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

            {active && safeActiveIndex != null && (
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
            )}
          </div>

          <div className="mt-16 grid grid-cols-3 text-[11px] text-text-muted">
            <span>R$ 0</span>
            <span className="text-center">{formatCompactBrl(totalBudget / 2)}</span>
            <span className="text-right">{formatCompactBrl(totalBudget)}</span>
          </div>
        </div>

        <div className="grid min-w-0 grid-cols-1 gap-1.5 sm:grid-cols-2 xl:grid-cols-1 xl:content-center">
          {!hasData ? (
            <div className="rounded-xl border border-dashed border-border-default bg-base/20 px-3 py-5 text-center">
              <p className="text-sm font-semibold text-text-primary">Sem dados</p>
              <p className="mt-1 text-xs text-text-muted">
                Cadastre gastos para acompanhar o orçamento por categoria.
              </p>
            </div>
          ) : categories.map((item, index) => {
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
                      over ? "text-red-400" : "text-text-primary",
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
