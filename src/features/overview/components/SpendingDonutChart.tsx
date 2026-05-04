"use client";

import { useState } from "react";
import { formatBrl, formatCompactBrl } from "@/lib/chartFormatter";
import { cn } from "@/lib/cn";

type SpendingPoint = { name: string; value: number; color: string };

const center = 120;
const radius = 78;
const stroke = 24;
const gap = 3;

function polarToCartesian(angle: number) {
  const angleInRadians = ((angle - 90) * Math.PI) / 180;

  return {
    x: center + radius * Math.cos(angleInRadians),
    y: center + radius * Math.sin(angleInRadians),
  };
}

function describeArc(startAngle: number, endAngle: number) {
  const start = polarToCartesian(endAngle);
  const end = polarToCartesian(startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  return [
    "M",
    start.x,
    start.y,
    "A",
    radius,
    radius,
    0,
    largeArcFlag,
    0,
    end.x,
    end.y,
  ].join(" ");
}

export default function SpendingDonutChart({ data }: { data: SpendingPoint[] }) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const chartData = data.length
    ? data
    : [{ name: "Sem gastos", value: 1, color: "#1f2937" }];
  const total = chartData.reduce((acc, item) => acc + item.value, 0);
  const slices = chartData.map((item, index) => {
    const start = chartData
      .slice(0, index)
      .reduce((acc, current) => acc + (current.value / total) * 360, 0);
    const size = (item.value / total) * 360;

    return {
      ...item,
      startAngle: start + gap / 2,
      endAngle: start + size - gap / 2,
      percent: Math.round((item.value / total) * 100),
    };
  });
  const activeIndex = hoverIndex ?? selectedIndex;
  const active = activeIndex == null ? null : chartData[activeIndex];

  return (
    <div className="bg-surface/50 p-5 rounded-2xl border border-border-default flex flex-col gap-4 h-full min-h-[320px]">
      <div className="flex items-start justify-between gap-3 shrink-0">
        <div>
          <h3 className="text-text-primary font-semibold">
            Gastos por Categoria
          </h3>
          <p className="text-text-muted text-xs mt-0.5">
            Distribuição - Maio 2026
          </p>
        </div>
        <span className="rounded-full border border-border-default bg-base/40 px-3 py-1.5 text-xs font-semibold text-text-primary">
          {formatCompactBrl(total)}
        </span>
      </div>

      <div className="grid flex-1 min-h-0 grid-rows-[minmax(0,1fr)_auto] gap-3 md:grid-cols-[minmax(0,1fr)_150px] md:grid-rows-1">
        <div className="relative flex min-h-0 items-center justify-center rounded-xl bg-base/20">
          <svg
            viewBox="0 0 240 240"
            className="h-full max-h-[260px] w-full max-w-[320px]"
            role="img"
            aria-label="Gráfico de gastos por categoria"
            onMouseLeave={() => setHoverIndex(null)}
          >
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke="#1f2937"
              strokeWidth={stroke}
            />

            {slices.map((slice, index) => (
              <path
                key={slice.name}
                d={describeArc(slice.startAngle, slice.endAngle)}
                fill="none"
                stroke={slice.color}
                strokeWidth={index === activeIndex ? stroke + 2 : stroke}
                strokeLinecap="round"
                className="cursor-pointer transition-all duration-200"
                onMouseEnter={() => setHoverIndex(index)}
                onClick={() => setSelectedIndex(index)}
              />
            ))}

            <circle cx={center} cy={center} r="50" fill="#0b1120" />
          </svg>

          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-black text-text-primary">
              {activeIndex == null ? "100%" : `${slices[activeIndex].percent}%`}
            </span>
            <span className="max-w-24 truncate text-xs text-text-muted">
              {active?.name ?? "Total"}
            </span>
            <span className="mt-1 text-xs font-semibold text-text-primary">
              {formatBrl(active?.value ?? total)}
            </span>
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-1.5 lg:justify-center">
          {slices.map((item, index) => (
            <button
              key={item.name}
              type="button"
              onMouseEnter={() => setHoverIndex(index)}
              onMouseLeave={() => setHoverIndex(null)}
              onFocus={() => setHoverIndex(index)}
              onBlur={() => setHoverIndex(null)}
              onClick={() => setSelectedIndex(index)}
              className={cn(
                "flex w-full items-center justify-between gap-2 rounded-md border px-2 py-1.5 text-left transition-colors",
                activeIndex === index
                  ? "border-border-active bg-base/60"
                  : "border-transparent bg-base/20 hover:border-border-default",
              )}
            >
              <span className="flex min-w-0 items-center gap-2">
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="truncate text-xs font-medium text-text-secondary">
                  {item.name}
                </span>
              </span>
              <span className="shrink-0 text-xs font-bold text-text-primary">
                {item.percent}%
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
