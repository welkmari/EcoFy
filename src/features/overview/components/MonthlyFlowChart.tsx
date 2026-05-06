"use client";

import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatBrl, formatCompactBrl } from "@/lib/chartFormatter";

type FlowPoint = { day: string; entradas: number; saidas: number };

const series = [
  { key: "entradas", label: "Entradas", color: "#34d399" },
  { key: "saidas", label: "Saídas", color: "#fb7185" },
] as const;

function getNiceMax(value: number) {
  if (value <= 0) return 1000;
  const exponent = Math.floor(Math.log10(value));
  const base = 10 ** exponent;
  const normalized = value / base;
  const nice = normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;

  return nice * base;
}

function formatAxis(value: number) {
  if (value === 0) return "0";
  return formatCompactBrl(value).replace("R$ ", "");
}

type FlowTooltipProps = {
  active?: boolean;
  label?: string;
  payload?: Array<{
    color?: string;
    dataKey?: string | number;
    name?: string;
    value?: number;
  }>;
};

function FlowTooltip({ active, payload, label }: FlowTooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border border-border-default bg-surface/95 p-3 shadow-xl shadow-black/30 backdrop-blur">
      <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-text-muted">
        Dia {label}
      </p>
      <div className="grid gap-1">
        {payload.map((item) => (
          <div
            key={item.dataKey}
            className="flex min-w-40 items-center justify-between gap-4 text-xs"
          >
            <span className="flex items-center gap-2 text-text-secondary">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              {item.name}
            </span>
            <span className="font-bold text-text-primary">
              {formatBrl(Number(item.value ?? 0))}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MonthlyFlowChart({
  data,
  periodLabel,
}: {
  data: FlowPoint[];
  periodLabel?: string;
}) {
  const [mounted, setMounted] = useState(false);
  const hasData = data.some((item) => item.entradas > 0 || item.saidas > 0);
  const chartData = data.length ? data : [{ day: "--", entradas: 0, saidas: 0 }];
  const maxValue = getNiceMax(
    Math.max(...chartData.flatMap((item) => [item.entradas, item.saidas]), 1),
  );
  const ticks = [0, maxValue / 2, maxValue];
  const totals = {
    entradas: chartData.reduce((sum, item) => sum + item.entradas, 0),
    saidas: chartData.reduce((sum, item) => sum + item.saidas, 0),
  };

  useEffect(() => {
    // Recharts needs a real browser layout box before ResponsiveContainer can measure.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  return (
    <div className="flex min-h-[360px] flex-col gap-4 rounded-2xl border border-border-default bg-surface/50 p-5">
      <div className="flex shrink-0 flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-text-primary">Fluxo do Mês</h3>
          <p className="mt-0.5 text-xs text-text-muted">
            Entradas vs saídas{periodLabel ? ` - ${periodLabel}` : ""}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          {series.map((item) => (
            <span
              key={item.key}
              className="flex items-center gap-2 rounded-full border border-border-default bg-base/40 px-3 py-1.5 text-text-secondary"
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              {item.label}
              <span className="font-semibold text-text-primary">
                {formatCompactBrl(totals[item.key])}
              </span>
            </span>
          ))}
        </div>
      </div>

      <div className="relative h-[270px] rounded-xl bg-base/20 p-3">
        {mounted && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 18, right: 18, bottom: 6, left: 0 }}
            >
              <CartesianGrid
                stroke="#263348"
                strokeDasharray="4 8"
                vertical={false}
              />
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94a3b8", fontSize: 12 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94a3b8", fontSize: 12 }}
                tickFormatter={formatAxis}
                domain={[0, maxValue]}
                ticks={ticks}
                width={54}
              />
              <Tooltip
                content={<FlowTooltip />}
                cursor={{ stroke: "#64748b", strokeDasharray: "4 6" }}
              />
              {series.map((item) => (
                <Line
                  key={item.key}
                  type="monotone"
                  dataKey={item.key}
                  name={item.label}
                  stroke={item.color}
                  strokeWidth={3}
                  dot={{
                    r: 5,
                    strokeWidth: 3,
                    stroke: "#0b1120",
                    fill: item.color,
                  }}
                  activeDot={{
                    r: 7,
                    strokeWidth: 3,
                    stroke: "#0b1120",
                    fill: item.color,
                  }}
                  connectNulls
                  isAnimationActive={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}

        {!hasData && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
            <p className="text-sm font-semibold text-text-primary">Sem dados</p>
            <p className="mt-1 max-w-60 text-xs text-text-muted">
              Adicione entradas ou gastos para visualizar o fluxo do mês.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
