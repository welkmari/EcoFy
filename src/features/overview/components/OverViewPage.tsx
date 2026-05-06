"use client";

import { useState } from "react";
import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";
import MetricCard from "./MetricCard";
import MonthlyFlowChart from "./MonthlyFlowChart";
import SpendingDonutChart from "./SpendingDonutChart";
import BudgetHealthBar from "./BudgetHealthBar";
import { formatBrl } from "@/lib/chartFormatter";
import { useUserPreferences } from "@/lib/useUserPreferences";
import { useOverViewData } from "../hooks/useOverViewData";
import { FancySelect } from "@/components/ui/FancySelect";

function shiftMonth(month: string, offset: number) {
  const [year, monthIndex] = month.split("-").map(Number);
  const date = new Date(year, (monthIndex || 1) - 1 + offset, 1);
  return date.toISOString().slice(0, 7);
}

function getMonthOptions() {
  const base = new Date();
  return Array.from({ length: 13 }, (_, index) => {
    const date = new Date(base.getFullYear(), base.getMonth() - index, 1);
    const value = date.toISOString().slice(0, 7);
    const label = new Intl.DateTimeFormat("pt-BR", {
      month: "short",
      year: "numeric",
    }).format(date);

    return { value, label };
  });
}

export default function OverViewPage() {
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const { data, isLoading, isError } = useOverViewData(month);
  const { preferences, savePreferences } = useUserPreferences();

  const metrics = data?.metrics ?? {
    income: 0,
    investments: 0,
    expenses: 0,
    monthlyBills: 0,
  };

  return (
    <div className="flex min-h-full flex-col gap-3 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">
            Período
          </p>
          <h2 className="text-lg font-bold capitalize text-text-primary">
            {data?.period.label ?? "Mês atual"}
          </h2>
        </div>
        <div className="flex items-center gap-2 rounded-2xl border border-border-default bg-surface/70 p-1.5">
          <button
            type="button"
            onClick={() => setMonth((current) => shiftMonth(current, -1))}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-text-muted transition-colors hover:bg-base hover:text-text-primary"
            aria-label="Mês anterior"
          >
            <CaretLeftIcon size={18} />
          </button>
          <FancySelect
            value={month}
            onChange={setMonth}
            options={getMonthOptions()}
            className="w-40"
          />
          <button
            type="button"
            onClick={() => setMonth((current) => shiftMonth(current, 1))}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-text-muted transition-colors hover:bg-base hover:text-text-primary"
            aria-label="Próximo mês"
          >
            <CaretRightIcon size={18} />
          </button>
        </div>
      </div>
      {isLoading && (
        <p className="text-text-muted text-sm">Carregando overview...</p>
      )}
      {isError && (
        <p className="text-red-400 text-sm">
          Não consegui carregar o overview agora.
        </p>
      )}
      <div className="grid grid-cols-1 gap-3 shrink-0 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          variant="ganhos"
          value={formatBrl(metrics.income)}
          change="Total"
          percentage="registrado"
          isUp={metrics.income >= 0}
        />
        <MetricCard
          variant="investimentos"
          value={formatBrl(metrics.investments)}
          change="Cofrinhos"
          percentage="guardado"
          isUp={metrics.investments >= 0}
        />
        <MetricCard
          variant="saidas"
          value={formatBrl(metrics.expenses)}
          change="Total"
          percentage="em gastos"
          isUp={false}
        />
        <MetricCard
          variant="contas"
          value={formatBrl(metrics.monthlyBills)}
          change="Fixas"
          percentage="mensais"
          isUp={metrics.monthlyBills === 0}
        />
      </div>

      <div className="grid flex-1 min-h-[320px] grid-cols-1 gap-3 xl:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)]">
        <div className="min-w-0">
          <MonthlyFlowChart data={data?.flow ?? []} periodLabel={data?.period.label} />
        </div>
        <div className="min-w-0">
          <SpendingDonutChart data={data?.spending ?? []} />
        </div>
      </div>

      <div className="shrink-0">
        <BudgetHealthBar
          categories={data?.budget.categories ?? []}
          totalSpent={data?.budget.totalSpent ?? 0}
          totalBudget={preferences.monthlyBudget}
          onBudgetChange={(monthlyBudget) => savePreferences({ monthlyBudget })}
        />
      </div>
    </div>
  );
}
