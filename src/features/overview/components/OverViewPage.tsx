import MetricCard from "./MetricCard";

export default function OverViewPage() {
  return (
    <div className="p-8">
      <div className="flex gap-4 w-full">
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
    </div>
  );
}
