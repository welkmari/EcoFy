"use client";

import { JAR_ICONS, suggestCoverImage } from "../types/JarConfig"; 
import type { Jar } from "../types/JarTypes"; 

const fmtShort = (n: number) => n.toLocaleString("pt-BR");

type Props = {
  jar: Jar;
  onClick: (jar: Jar) => void;
};

export default function SavingsCard({ jar, onClick }: Props) {
  const pct = Math.min((jar.current / jar.goal) * 100, 100);
  const done = pct >= 100;
  const iconDef = JAR_ICONS.find((i) => i.key === jar.iconKey) ?? JAR_ICONS[0];
  const Icon = iconDef.icon;
  const coverImage = jar.coverImage ?? suggestCoverImage(jar.name, jar.iconKey).image;

  return (
    <div
      onClick={() => onClick(jar)}
      className="group cursor-pointer overflow-hidden rounded-2xl bg-surface/85 shadow-[0_16px_38px_rgba(0,0,0,0.22)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-surface"
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "";
      }}
    >
      <div
        className="relative h-32 bg-cover bg-center"
        style={{ backgroundImage: `url("${coverImage}")` }}
      >
        <div className="absolute inset-0 bg-linear-to-t from-black/65 to-black/10" />
        <div className="absolute left-4 top-4 flex items-start justify-between gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-black/35 text-white backdrop-blur">
            <Icon size={23} weight="duotone" />
          </span>
        </div>
        {done && (
          <span className="absolute right-4 top-4 rounded-full bg-emerald-400/20 px-3 py-1 text-xs font-black text-emerald-100 backdrop-blur">
            Meta atingida
          </span>
        )}
      </div>

      <div className="p-4">
        <div className="mb-4">
          <p className="line-clamp-1 text-lg font-black text-text-primary">
            {jar.name}
          </p>
          <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-text-muted">
            Acumulado
          </p>
          <p className="mt-1 text-xl font-black text-text-primary">
            R$ {fmtShort(jar.current)}
            <span className="text-sm font-bold text-text-muted">
              {" "}de R$ {fmtShort(jar.goal)}
            </span>
          </p>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between text-xs font-bold text-text-muted">
            <span>Progresso</span>
            <span className={done ? "text-emerald-400" : "text-purple-400"}>
              {pct.toFixed(0)}%
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-base">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${pct}%`,
                background: done
                  ? "#34d399"
                  : "linear-gradient(90deg,#8E63CE,#BFE9DD)",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
