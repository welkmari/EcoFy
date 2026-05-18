"use client";

import {
  ArrowsOutLineVerticalIcon,
  EyeIcon,
  MinusIcon,
  MoonIcon,
  PlusIcon,
  SparkleIcon,
  TextAaIcon,
  XIcon,
} from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { useUserPreferences } from "@/lib/useUserPreferences";
import type { FontScalePreference } from "@/lib/userPreferences";

const FONT_ORDER: FontScalePreference[] = ["normal", "large", "larger"];

function nextFontScale(current: FontScalePreference, direction: 1 | -1) {
  const index = FONT_ORDER.indexOf(current);
  const next = Math.min(Math.max(index + direction, 0), FONT_ORDER.length - 1);
  return FONT_ORDER[next];
}

export default function AccessibilityPanel() {
  const { preferences, savePreferences } = useUserPreferences();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.fontScale = preferences.fontScale;
    root.classList.toggle("a11y-contrast", preferences.highContrast);
    root.classList.toggle("a11y-reduce-motion", preferences.reduceMotion);
    root.classList.toggle("a11y-spacing", preferences.increasedSpacing);
  }, [
    preferences.fontScale,
    preferences.highContrast,
    preferences.increasedSpacing,
    preferences.reduceMotion,
  ]);

  return (
    <div className="fixed bottom-5 left-4 z-[70] md:bottom-6 md:left-6">
      {open && (
        <div className="mb-3 w-[min(320px,calc(100vw-2rem))] rounded-2xl border border-border-default bg-surface/95 p-4 shadow-2xl shadow-black/40 backdrop-blur-xl">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-black text-text-primary">
                Acessibilidade
              </p>
              <p className="text-xs text-text-muted">
                Ajustes salvos neste navegador.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg p-2 text-text-muted transition-colors hover:bg-base hover:text-text-primary"
              aria-label="Fechar acessibilidade"
            >
              <XIcon size={16} />
            </button>
          </div>

          <div className="grid gap-3">
            <div className="rounded-xl border border-border-default bg-base/45 p-3">
              <div className="mb-3 flex items-center gap-2 text-sm font-bold text-text-primary">
                <TextAaIcon size={18} />
                Tamanho do texto
              </div>
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() =>
                    savePreferences({
                      fontScale: nextFontScale(preferences.fontScale, -1),
                    })
                  }
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-border-default text-text-secondary transition-colors hover:text-text-primary"
                  aria-label="Diminuir fonte"
                >
                  <MinusIcon size={16} />
                </button>
                <span className="text-xs font-bold uppercase tracking-[0.12em] text-text-muted">
                  {preferences.fontScale === "normal"
                    ? "Normal"
                    : preferences.fontScale === "large"
                      ? "Grande"
                      : "Maior"}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    savePreferences({
                      fontScale: nextFontScale(preferences.fontScale, 1),
                    })
                  }
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-border-default text-text-secondary transition-colors hover:text-text-primary"
                  aria-label="Aumentar fonte"
                >
                  <PlusIcon size={16} />
                </button>
              </div>
            </div>

            <ToggleRow
              icon={<EyeIcon size={18} />}
              label="Alto contraste"
              checked={preferences.highContrast}
              onChange={(highContrast) => savePreferences({ highContrast })}
            />
            <ToggleRow
              icon={<SparkleIcon size={18} />}
              label="Reduzir animações"
              checked={preferences.reduceMotion}
              onChange={(reduceMotion) => savePreferences({ reduceMotion })}
            />
            <ToggleRow
              icon={<ArrowsOutLineVerticalIcon size={18} />}
              label="Mais espaçamento"
              checked={preferences.increasedSpacing}
              onChange={(increasedSpacing) =>
                savePreferences({ increasedSpacing })
              }
            />
            <ToggleRow
              icon={<MoonIcon size={18} />}
              label="Forçar tema escuro"
              checked={preferences.theme === "dark"}
              onChange={(checked) =>
                savePreferences({ theme: checked ? "dark" : "system" })
              }
            />
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex h-12 w-12 items-center justify-center rounded-full border border-cyan-400/35 bg-purple-500 text-slate-950 shadow-xl shadow-purple-500/20 transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
        aria-label="Abrir painel de acessibilidade"
        aria-expanded={open}
      >
        <EyeIcon size={24} weight="bold" />
      </button>
    </div>
  );
}

function ToggleRow({
  icon,
  label,
  checked,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-center justify-between gap-3 rounded-xl border border-border-default bg-base/45 p-3 text-left transition-colors hover:border-border-active"
      aria-pressed={checked}
    >
      <span className="flex min-w-0 items-center gap-2 text-sm font-bold text-text-primary">
        <span className="text-text-muted">{icon}</span>
        {label}
      </span>
      <span
        className={cn(
          "relative h-6 w-11 rounded-full border p-0.5 transition-colors",
          checked
            ? "border-cyan-400/50 bg-purple-500/80"
            : "border-border-default bg-base",
        )}
      >
        <span
          className={cn(
            "block h-4 w-4 rounded-full bg-white transition-transform",
            checked ? "translate-x-5" : "translate-x-0",
          )}
        />
      </span>
    </button>
  );
}
