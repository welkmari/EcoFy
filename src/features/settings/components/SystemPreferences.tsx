"use client";

import { MonitorIcon, SunIcon, MoonIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/cn";
import type { Theme } from "@/lib/useUserPreferences";

type Props = {
  value: Theme;
  onChange: (theme: Theme) => void;
};

const options: { value: Theme; label: string; icon: React.ElementType }[] = [
  { value: "light", label: "Claro", icon: SunIcon },
  { value: "dark", label: "Escuro", icon: MoonIcon },
  { value: "system", label: "Sistema", icon: MonitorIcon },
];

export default function SystemPreferences({ value, onChange }: Props) {
  return (
    <section className="overflow-hidden rounded-2xl border border-border-default bg-surface/50">
      <div className="border-b border-border-default px-6 py-5">
        <h2 className="text-lg font-bold text-text-primary">Aparência</h2>
      </div>

      <div className="px-6 py-5 flex flex-col gap-4">
        <p className="text-sm text-text-muted">Escolha o tema da interface.</p>

        <div className="grid grid-cols-3 gap-3">
          {options.map(({ value: opt, label, icon: Icon }) => (
            <button
              key={opt}
              onClick={() => onChange(opt)}
              className={cn(
                "flex flex-col items-center gap-2 rounded-2xl border p-4 text-sm font-bold transition-all",
                value === opt
                  ? "border-purple-500/50 bg-purple-500/10 text-purple-300 shadow-[0_0_20px_rgba(139,92,246,0.1)]"
                  : "border-border-default bg-base/50 text-text-muted hover:border-border-active hover:text-text-primary",
              )}
            >
              <Icon size={24} />
              {label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}