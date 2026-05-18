"use client";

import { useMemo, useState } from "react";
import { formatBrl, formatCompactBrl } from "@/lib/chartFormatter";

type FlowPoint = { day: string; entradas: number; saidas: number };

export default function MonthlyFlowChart({
  data,
  periodLabel,
}: {
  data: FlowPoint[];
  periodLabel?: string;
}) {
  const [active, setActive] = useState<"entradas" | "saidas" | null>(null);
  const totals = useMemo(
    () => ({
      entradas: data.reduce((sum, item) => sum + item.entradas, 0),
      saidas: data.reduce((sum, item) => sum + item.saidas, 0),
    }),
    [data],
  );
  const max = Math.max(totals.entradas, totals.saidas, 1);
  const hasData = totals.entradas > 0 || totals.saidas > 0;

  const bars = [
    {
      key: "entradas" as const,
      label: "Entradas",
      value: totals.entradas,
      color: "from-cyan-500 to-cyan-300",
      text: "text-cyan-400",
      bg: "bg-cyan-400/10",
    },
    {
      key: "saidas" as const,
      label: "Saídas",
      value: totals.saidas,
      color: "from-red-500 to-red-300",
      text: "text-red-400",
      bg: "bg-red-400/10",
    },
  ];

  return (
    <div className="flex min-h-[360px] flex-col gap-5 rounded-2xl border border-border-default bg-surface/50 p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="font-semibold text-text-primary">Fluxo do Mês</h3>
          <p className="mt-0.5 text-xs text-text-muted">
            Total de entrada e saída{periodLabel ? ` - ${periodLabel}` : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {bars.map((bar) => (
            <span
              key={bar.key}
              className={`rounded-full border border-border-default ${bar.bg} px-3 py-1.5 text-xs font-bold ${bar.text}`}
            >
              {bar.label}: {formatCompactBrl(bar.value)}
            </span>
          ))}
        </div>
      </div>

      <div className="grid flex-1 gap-5 rounded-xl bg-base/20 p-4">
        {bars.map((bar) => {
          const pct = Math.max((bar.value / max) * 100, hasData ? 4 : 0);
          const focused = active === null || active === bar.key;

          return (
            <div
              key={bar.key}
              onMouseEnter={() => setActive(bar.key)}
              onMouseLeave={() => setActive(null)}
              className="grid gap-2"
            >
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm font-bold text-text-primary">
                  {bar.label}
                </span>
                <span className={`text-sm font-black ${bar.text}`}>
                  {formatBrl(bar.value)}
                </span>
              </div>
              <div className="h-16 overflow-hidden rounded-xl border border-border-default bg-base">
                <div
                  className={`h-full rounded-xl bg-linear-to-r ${bar.color} transition-all duration-700`}
                  style={{
                    width: `${pct}%`,
                    opacity: focused ? 1 : 0.45,
                  }}
                />
              </div>
            </div>
          );
        })}

        {!hasData && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border-default px-6 py-8 text-center">
            <p className="text-sm font-semibold text-text-primary">Sem dados</p>
            <p className="mt-1 max-w-60 text-xs text-text-muted">
              Adicione entradas ou gastos para ver o total do mês.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
