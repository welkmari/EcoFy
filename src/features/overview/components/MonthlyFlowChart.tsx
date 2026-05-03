"use client";

import { useMemo, useState } from "react";
import { formatBrl, formatCompactBrl } from "@/lib/chartFormatter";
import { cn } from "@/lib/cn";

const data = [
  { day: "01", entradas: 3200, saidas: 1800 },
  { day: "05", entradas: 4100, saidas: 2200 },
  { day: "10", entradas: 3800, saidas: 3100 },
  { day: "15", entradas: 5200, saidas: 2800 },
  { day: "20", entradas: 4700, saidas: 3600 },
  { day: "25", entradas: 6100, saidas: 3200 },
  { day: "30", entradas: 5800, saidas: 4100 },
];

const chart = {
  width: 720,
  height: 300,
  top: 24,
  right: 24,
  bottom: 36,
  left: 52,
};

const plotWidth = chart.width - chart.left - chart.right;
const plotHeight = chart.height - chart.top - chart.bottom;
const ticks = [0, 2000, 4000, 6000];
const maxValue = 6500;

type SeriesKey = "entradas" | "saidas";

const series: Array<{
  key: SeriesKey;
  label: string;
  color: string;
  fill: string;
}> = [
  {
    key: "entradas",
    label: "Entradas",
    color: "#34d399",
    fill: "url(#entradas-fill)",
  },
  {
    key: "saidas",
    label: "Saídas",
    color: "#fb7185",
    fill: "url(#saidas-fill)",
  },
];

function getX(index: number) {
  return chart.left + (index / (data.length - 1)) * plotWidth;
}

function getY(value: number) {
  return chart.top + (1 - value / maxValue) * plotHeight;
}

function getLinePath(key: SeriesKey) {
  return data
    .map((item, index) => `${index === 0 ? "M" : "L"} ${getX(index)} ${getY(item[key])}`)
    .join(" ");
}

function getAreaPath(key: SeriesKey) {
  const line = getLinePath(key);
  const lastX = getX(data.length - 1);
  const firstX = getX(0);
  const baseY = chart.top + plotHeight;

  return `${line} L ${lastX} ${baseY} L ${firstX} ${baseY} Z`;
}

function getTooltipPlacement(index: number) {
  if (index <= 1) return "translateX(0)";
  if (index >= data.length - 2) return "translateX(-100%)";
  return "translateX(-50%)";
}

export default function MonthlyFlowChart() {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const totals = useMemo(
    () => ({
      entradas: data.reduce((sum, item) => sum + item.entradas, 0),
      saidas: data.reduce((sum, item) => sum + item.saidas, 0),
    }),
    [],
  );

  const activeIndex = hoverIndex ?? selectedIndex;
  const active = activeIndex == null ? null : data[activeIndex];
  const activeX = activeIndex == null ? null : getX(activeIndex);

  return (
    <div className="bg-surface/50 p-5 rounded-2xl border border-border-default flex flex-col gap-4 h-full min-h-[320px]">
      <div className="flex flex-wrap items-start justify-between gap-3 shrink-0">
        <div>
          <h3 className="text-text-primary font-semibold">Fluxo do Mês</h3>
          <p className="text-text-muted text-xs mt-0.5">
            Entradas vs saídas - Maio 2026
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

      <div className="relative flex-1 min-h-0 overflow-hidden rounded-xl bg-base/20">
        <svg
          viewBox={`0 0 ${chart.width} ${chart.height}`}
          className="h-full w-full"
          role="img"
          aria-label="Gráfico de fluxo mensal com entradas e saídas"
          onMouseLeave={() => setHoverIndex(null)}
        >
          <defs>
            <linearGradient id="entradas-fill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#34d399" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="saidas-fill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#fb7185" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#fb7185" stopOpacity="0" />
            </linearGradient>
            <filter id="soft-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {ticks.map((tick) => {
            const y = getY(tick);
            return (
              <g key={tick}>
                <line
                  x1={chart.left}
                  x2={chart.width - chart.right}
                  y1={y}
                  y2={y}
                  stroke="#1f2937"
                  strokeDasharray="4 8"
                />
                <text
                  x={chart.left - 12}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-text-muted text-[11px]"
                >
                  {tick === 0 ? "0" : `${tick / 1000}k`}
                </text>
              </g>
            );
          })}

          {data.map((item, index) => (
            <text
              key={item.day}
              x={getX(index)}
              y={chart.height - 12}
              textAnchor="middle"
              className="fill-text-muted text-[11px]"
            >
              {item.day}
            </text>
          ))}

          {series.map((item) => (
            <g key={item.key}>
              <path d={getAreaPath(item.key)} fill={item.fill} />
              <path
                d={getLinePath(item.key)}
                fill="none"
                stroke={item.color}
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#soft-glow)"
              />
            </g>
          ))}

          {active != null && activeX != null && (
            <>
              <line
                x1={activeX}
                x2={activeX}
                y1={chart.top}
                y2={chart.top + plotHeight}
                stroke="#475569"
                strokeDasharray="4 6"
              />

              {series.map((item) => (
                <circle
                  key={item.key}
                  cx={activeX}
                  cy={getY(active[item.key])}
                  r="5"
                  fill={item.color}
                  stroke="#0b1120"
                  strokeWidth="3"
                />
              ))}
            </>
          )}

          {data.map((item, index) => {
            const previous = index === 0 ? chart.left : (getX(index - 1) + getX(index)) / 2;
            const next =
              index === data.length - 1
                ? chart.width - chart.right
                : (getX(index) + getX(index + 1)) / 2;

            return (
              <rect
                key={item.day}
                x={previous}
                y={chart.top}
                width={next - previous}
                height={plotHeight}
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHoverIndex(index)}
                onClick={() => setSelectedIndex(index)}
              />
            );
          })}
        </svg>

        {active != null && activeX != null && activeIndex != null && (
          <div
            className={cn(
              "pointer-events-none absolute top-3 w-32 rounded-lg border border-border-default bg-base/95 px-2.5 py-2 shadow-xl shadow-black/30 transition-all",
            )}
            style={{
              left: `${(activeX / chart.width) * 100}%`,
              transform: getTooltipPlacement(activeIndex),
            }}
          >
            <p className="mb-1 text-[10px] font-semibold uppercase text-text-muted">
              Dia {active.day}
            </p>
            {series.map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between gap-2 text-[11px]"
              >
                <span className="flex items-center gap-2 text-text-secondary">
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  {item.label}
                </span>
                <span className="font-semibold text-text-primary">
                  {formatBrl(active[item.key])}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
