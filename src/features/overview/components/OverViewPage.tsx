"use client";

import MetricCard from "./MetricCard";
import MonthlyFlowChart from "./MonthlyFlowChart";
import SpendingDonutChart from "./SpendingDonutChart";
import BudgetHealthBar from "./BudgetHealthBar";
import { formatBrl } from "@/lib/chartFormatter";
import { useOverViewData } from "../hooks/useOverViewData";

export default function OverViewPage() {
  const { data, isLoading, isError } = useOverViewData();

  const metrics = data?.metrics ?? {
    income: 0,
    investments: 0,
    expenses: 0,
    monthlyBills: 0,
  };

  return (
    <div className="flex min-h-full flex-col gap-3 p-5">
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
          <MonthlyFlowChart data={data?.flow ?? []} />
        </div>
        <div className="min-w-0">
          <SpendingDonutChart data={data?.spending ?? []} />
        </div>
      </div>

      <div className="shrink-0">
        <BudgetHealthBar
          categories={data?.budget.categories ?? []}
          totalSpent={data?.budget.totalSpent ?? 0}
          totalBudget={data?.budget.totalBudget ?? 1}
        />
      </div>
    </div>
  );
}
