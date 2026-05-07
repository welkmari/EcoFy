"use client";

import { useEffect, useMemo, useState } from "react";
import { formatBrl, formatCompactBrl } from "@/lib/chartFormatter";
import { cn } from "@/lib/cn";

type FlowPoint = { day: string; entradas: number; saidas: number };

const series = [
  { key: "entradas", label: "Entradas", color: "#34d399" },
  { key: "saidas", label: "Saídas", color: "#fb7185" },
] as const;

const chart = {
  width: 720,
  height: 260,
  top: 22,
  right: 18,
  bottom: 34,
  left: 58,
};

const innerWidth = chart.width - chart.left - chart.right;
const innerHeight = chart.height - chart.top - chart.bottom;

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

function getDayNumber(day: string, index: number) {
  const parsed = Number(day);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : index + 1;
}

function getX(dayNumber: number) {
  const pct = (Math.min(Math.max(dayNumber, 1), 31) - 1) / 30;
  return chart.left + pct * innerWidth;
}

function getY(value: number, maxValue: number) {
  const pct = maxValue <= 0 ? 0 : value / maxValue;
  return chart.top + (1 - pct) * innerHeight;
}

function buildPath(points: Array<{ x: number; y: number }>) {
  if (!points.length) return "";
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  return points
    .map((point, index) =>
      index === 0 ? `M ${point.x} ${point.y}` : `L ${point.x} ${point.y}`,
    )
    .join(" ");
}

type PreparedPoint = FlowPoint & {
  dayNumber: number;
  x: number;
  y: Record<(typeof series)[number]["key"], number>;
};

export default function MonthlyFlowChart({
  data,
  periodLabel,
}: {
  data: FlowPoint[];
  periodLabel?: string;
}) {
  const [mounted, setMounted] = useState(false);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const hasData = data.some((item) => item.entradas > 0 || item.saidas > 0);

  const maxValue = useMemo(
    () =>
      getNiceMax(
        Math.max(
          ...data.flatMap((item) => [item.entradas, item.saidas]),
          1,
        ),
      ),
    [data],
  );

  const prepared = useMemo<PreparedPoint[]>(() => {
    return data
      .map((item, index) => {
        const dayNumber = getDayNumber(item.day, index);

        return {
          ...item,
          dayNumber,
          x: getX(dayNumber),
          y: {
            entradas: getY(item.entradas, maxValue),
            saidas: getY(item.saidas, maxValue),
          },
        };
      })
      .sort((a, b) => a.dayNumber - b.dayNumber);
  }, [data, maxValue]);

  const paths = useMemo(
    () =>
      Object.fromEntries(
        series.map((item) => [
          item.key,
          buildPath(prepared.map((point) => ({ x: point.x, y: point.y[item.key] }))),
        ]),
      ) as Record<(typeof series)[number]["key"], string>,
    [prepared],
  );

  const ticks = [0, maxValue / 2, maxValue];
  const dayTicks = [1, 8, 15, 22, 31];
  const totals = {
    entradas: data.reduce((sum, item) => sum + item.entradas, 0),
    saidas: data.reduce((sum, item) => sum + item.saidas, 0),
  };
  const activeIndex = hasData ? hoverIndex ?? selectedIndex : null;
  const activePoint = activeIndex == null ? null : prepared[activeIndex];

  useEffect(() => {
    // Restart the path animation when the selected month changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(false);
    const frame = window.requestAnimationFrame(() => setMounted(true));
    return () => window.cancelAnimationFrame(frame);
  }, [data]);

  return (
    <div className="flex min-h-[390px] flex-col gap-4 rounded-2xl border border-border-default bg-surface/50 p-4 sm:min-h-[360px] sm:p-5">
      <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h3 className="font-semibold text-text-primary">Fluxo do Mês</h3>
          <p className="mt-0.5 text-xs text-text-muted">
            Entradas vs saídas{periodLabel ? ` - ${periodLabel}` : ""}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs sm:flex sm:flex-wrap sm:items-center">
          {series.map((item) => (
            <span
              key={item.key}
              className="flex min-w-0 items-center justify-between gap-2 rounded-full border border-border-default bg-base/40 px-3 py-1.5 text-text-secondary sm:justify-start"
            >
              <span className="flex min-w-0 items-center gap-2">
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="truncate">{item.label}</span>
              </span>
              <span className="shrink-0 font-semibold text-text-primary">
                {formatCompactBrl(totals[item.key])}
              </span>
            </span>
          ))}
        </div>
      </div>

      <div className="relative min-h-[260px] flex-1 overflow-hidden rounded-xl bg-base/20 px-2 py-3 sm:px-3">
        <svg
          viewBox={`0 0 ${chart.width} ${chart.height}`}
          className="h-full min-h-[245px] w-full"
          role="img"
          aria-label="Gráfico de fluxo do mês"
          onMouseLeave={() => setHoverIndex(null)}
        >
          <defs>
            <linearGradient id="flow-grid-fade" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="#263348" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#263348" stopOpacity="0.9" />
            </linearGradient>
          </defs>

          {ticks.map((tick) => {
            const y = getY(tick, maxValue);

            return (
              <g key={tick}>
                <line
                  x1={chart.left}
                  x2={chart.width - chart.right}
                  y1={y}
                  y2={y}
                  stroke="url(#flow-grid-fade)"
                  strokeDasharray="5 9"
                />
                <text
                  x={chart.left - 10}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-slate-400 text-[11px]"
                >
                  {formatAxis(tick)}
                </text>
              </g>
            );
          })}

          {dayTicks.map((day) => {
            const x = getX(day);

            return (
              <g key={day}>
                <line
                  x1={x}
                  x2={x}
                  y1={chart.top}
                  y2={chart.height - chart.bottom}
                  stroke="#172033"
                  strokeDasharray="4 10"
                />
                <text
                  x={x}
                  y={chart.height - 8}
                  textAnchor="middle"
                  className="fill-slate-400 text-[11px]"
                >
                  {day}
                </text>
              </g>
            );
          })}

          <line
            x1={chart.left}
            x2={chart.width - chart.right}
            y1={chart.height - chart.bottom}
            y2={chart.height - chart.bottom}
            stroke="#334155"
          />

          {hasData &&
            series.map((item, index) => (
              <g key={item.key}>
                <path
                  d={paths[item.key]}
                  fill="none"
                  stroke={item.color}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={index === 0 ? 4 : 3}
                  pathLength={1}
                  style={{
                    strokeDasharray: 1,
                    strokeDashoffset: mounted ? 0 : 1,
                    transition: `stroke-dashoffset 900ms ${index * 140}ms ease`,
                  }}
                />
                <path
                  d={paths[item.key]}
                  fill="none"
                  stroke={item.color}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeOpacity={0.16}
                  strokeWidth={12}
                />
              </g>
            ))}

          {hasData &&
            prepared.map((point, pointIndex) => {
              const active = activeIndex === pointIndex;

              return (
                <g key={point.day}>
                  <rect
                    x={point.x - 18}
                    y={chart.top}
                    width={36}
                    height={innerHeight}
                    fill="transparent"
                    className="cursor-pointer"
                    onMouseEnter={() => setHoverIndex(pointIndex)}
                    onFocus={() => setHoverIndex(pointIndex)}
                    onClick={() => setSelectedIndex(pointIndex)}
                  />
                  {series.map((item) => (
                    <circle
                      key={item.key}
                      cx={point.x}
                      cy={point.y[item.key]}
                      r={active ? 6 : 4.5}
                      fill={item.color}
                      stroke="#0b1120"
                      strokeWidth={3}
                      className={cn(
                        "transition-all duration-200",
                        mounted ? "opacity-100" : "opacity-0",
                      )}
                    />
                  ))}
                  {active && (
                    <line
                      x1={point.x}
                      x2={point.x}
                      y1={chart.top}
                      y2={chart.height - chart.bottom}
                      stroke="#94a3b8"
                      strokeDasharray="4 7"
                      strokeOpacity={0.7}
                    />
                  )}
                </g>
              );
            })}
        </svg>

        {activePoint && (
          <div className="absolute left-3 right-3 top-3 rounded-xl border border-border-default bg-surface/95 p-3 shadow-xl shadow-black/30 backdrop-blur sm:left-auto sm:right-5 sm:w-56">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-text-muted">
              Dia {activePoint.day}
            </p>
            <div className="grid gap-1.5">
              {series.map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between gap-4 text-xs"
                >
                  <span className="flex items-center gap-2 text-text-secondary">
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    {item.label}
                  </span>
                  <span className="font-bold text-text-primary">
                    {formatBrl(activePoint[item.key])}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {!hasData && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
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
