"use client";

import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";
import MetricCard from "./MetricCard";
import MonthlyFlowChart from "./MonthlyFlowChart";
import SpendingDonutChart from "./SpendingDonutChart";
import BudgetHealthBar from "./BudgetHealthBar";
import { useUserPreferences } from "@/lib/useUserPreferences";
import { useSelectedMonth } from "@/lib/selectedMonth";
import { useOverViewData } from "../hooks/useOverViewData";
import { FancySelect } from "@/components/ui/FancySelect";

function getMonthOptions() {
  const base = new Date();
  return Array.from({ length: 19 }, (_, index) => {
    const date = new Date(base.getFullYear(), base.getMonth() + index - 9, 1);
    const value = date.toISOString().slice(0, 7);
    const label = new Intl.DateTimeFormat("pt-BR", {
      month: "short",
      year: "numeric",
    }).format(date);

    return { value, label };
  });
}

function getPeriodHint(month: string) {
  const current = new Date().toISOString().slice(0, 7);
  if (month === current) return "Mês atual";
  return month > current ? "Planejamento futuro" : "Histórico";
}

export default function OverViewPage() {
  const { month, setMonth, shiftMonth } = useSelectedMonth();
  const { data, isLoading, isError } = useOverViewData(month);
  const { preferences, savePreferences } = useUserPreferences();
  const formatMoney = (value: number) =>
    new Intl.NumberFormat(preferences.language, {
      style: "currency",
      currency: preferences.currency,
      minimumFractionDigits: 2,
    }).format(Number(value) || 0);

  const metrics = data?.metrics ?? {
    income: 0,
    investments: 0,
    investmentsTarget: 0,
    investmentsRemaining: 0,
    expenses: 0,
    monthlyBills: 0,
  };
  const investmentsProgress =
    metrics.investmentsTarget > 0
      ? Math.min((metrics.investments / metrics.investmentsTarget) * 100, 100)
      : 0;
  const investmentsChange =
    metrics.investmentsTarget > 0
      ? `${investmentsProgress.toFixed(0)}%`
      : "Sem meta";
  const investmentsHint =
    metrics.investmentsTarget > 0
      ? metrics.investmentsRemaining > 0
        ? `faltam ${formatMoney(metrics.investmentsRemaining)}`
        : "metas concluídas"
      : "crie um cofrinho";

  return (
    <div className="flex min-h-full flex-col gap-4 px-4 pb-5 pt-1 sm:px-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">
            Período
          </p>
          <h2 className="truncate text-lg font-bold capitalize text-text-primary">
            {data?.period.label ?? "Mês atual"}
          </h2>
          <p className="mt-1 text-xs font-bold text-purple-400">
            {getPeriodHint(month)}
          </p>
        </div>
        <div className="flex w-full items-center gap-2 rounded-2xl bg-surface/80 p-1.5 shadow-[0_12px_28px_rgba(0,0,0,0.16)] sm:w-auto">
          <button
            type="button"
            onClick={() => shiftMonth(-1)}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-text-muted transition-colors hover:bg-base hover:text-text-primary"
            aria-label="Mês anterior"
          >
            <CaretLeftIcon size={18} />
          </button>
          <FancySelect
            value={month}
            onChange={setMonth}
            options={getMonthOptions()}
            className="min-w-0 flex-1 sm:w-40 sm:flex-none"
          />
          <button
            type="button"
            onClick={() => shiftMonth(1)}
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
      <div className="grid shrink-0 grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          variant="ganhos"
          value={formatMoney(metrics.income)}
          change="Total"
          percentage="registrado"
          isUp={metrics.income >= 0}
        />
        <MetricCard
          variant="investimentos"
          value={formatMoney(metrics.investments)}
          change={investmentsChange}
          percentage={investmentsHint}
          isUp={metrics.investmentsTarget === 0 || metrics.investmentsRemaining === 0 || metrics.investments > 0}
        />
        <MetricCard
          variant="saidas"
          value={formatMoney(metrics.expenses)}
          change="Total"
          percentage="em gastos"
          isUp={false}
        />
        <MetricCard
          variant="contas"
          value={formatMoney(metrics.monthlyBills)}
          change="Fixas"
          percentage="mensais"
          isUp={metrics.monthlyBills === 0}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)]">
        <div className="min-w-0">
          <MonthlyFlowChart data={data?.flow ?? []} periodLabel={data?.period.label} />
        </div>
        <div className="min-w-0">
          <SpendingDonutChart
            data={data?.spending ?? []}
            periodLabel={data?.period.label}
          />
        </div>
      </div>

      <div className="shrink-0">
        <BudgetHealthBar
          categories={data?.budget.categories ?? []}
          totalSpent={data?.budget.totalSpent ?? 0}
          totalBudget={preferences.monthlyBudget}
          onBudgetChange={(monthlyBudget) => savePreferences({ monthlyBudget })}
          periodLabel={data?.period.label}
        />
      </div>
    </div>
  );
}
