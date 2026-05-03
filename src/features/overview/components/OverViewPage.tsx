import MetricCard from "./MetricCard";
import MonthlyFlowChart from "./MonthlyFlowChart";
import SpendingDonutChart from "./SpendingDonutChart";
import BudgetHealthBar from "./BudgetHealthBar";

export default function OverViewPage() {
  return (
    <div className="flex min-h-full flex-col gap-3 p-5">
      <div className="grid grid-cols-1 gap-3 shrink-0 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          variant="ganhos"
          value="R$ 89.935"
          change="+10.2"
          percentage="+1.01%"
          isUp={true}
        />
        <MetricCard
          variant="investimentos"
          value="R$ 23.283"
          change="+3.1"
          percentage="+0.49%"
          isUp={true}
        />
        <MetricCard
          variant="saidas"
          value="R$ 4.827"
          change="-2.56"
          percentage="-0.91%"
          isUp={false}
        />
        <MetricCard
          variant="contas"
          value="R$ 12.854"
          change="+7.2"
          percentage="+1.51%"
          isUp={true}
        />
      </div>

      <div className="grid flex-1 min-h-[320px] grid-cols-1 gap-3 xl:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)]">
        <div className="min-w-0">
          <MonthlyFlowChart />
        </div>
        <div className="min-w-0">
          <SpendingDonutChart />
        </div>
      </div>

      <div className="shrink-0">
        <BudgetHealthBar />
      </div>
    </div>
  );
}
