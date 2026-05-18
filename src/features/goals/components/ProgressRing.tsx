"use client";

type Props = {
  pct: number;
  size?: number;
  stroke?: number;
  color?: string;
};

export default function ProgressRing({
  pct,
  size = 80,
  stroke = 6,
  color = "#a78bfa",
}: Props) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;

  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="rgba(255,255,255,.1)"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        style={{ transition: "stroke-dasharray .7s cubic-bezier(.4,0,.2,1)" }}
      />
    </svg>
  );
}
