"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  ArrowRightIcon,
  CheckCircleIcon,
  PiggyBankIcon,
  WalletIcon,
  XIcon,
} from "@phosphor-icons/react";
import { cn } from "@/lib/cn";
import { useUserPreferences } from "@/lib/useUserPreferences";

const STORAGE_KEY = "ecofy:onboarding-complete";
const CATEGORIES = ["Alimentação", "Transporte", "Lazer", "Moradia", "Saúde"];

export default function OnboardingCoach() {
  const pathname = usePathname();
  const { preferences, savePreferences } = useUserPreferences();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [income, setIncome] = useState(String(preferences.monthlyBudget));
  const [categories, setCategories] = useState<string[]>([
    "Alimentação",
    "Transporte",
  ]);
  const [goal, setGoal] = useState("");

  const isDashboard = [
    "/overview",
    "/payments",
    "/recurring",
    "/goals",
    "/settings",
    "/users",
  ].some((path) => pathname?.startsWith(path));

  useEffect(() => {
    if (!isDashboard) return;
    if (window.localStorage.getItem(STORAGE_KEY)) return;
    const timer = window.setTimeout(() => setOpen(true), 600);
    return () => window.clearTimeout(timer);
  }, [isDashboard]);

  const close = () => {
    window.localStorage.setItem(STORAGE_KEY, "true");
    setOpen(false);
  };

  const finish = async () => {
    await savePreferences({
      monthlyBudget: Math.max(Number(income) || preferences.monthlyBudget, 1),
    });
    close();
  };

  if (!open || !isDashboard) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-border-default bg-surface shadow-2xl shadow-black/40">
        <div className="flex items-center justify-between border-b border-border-default px-5 py-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-purple-400">
              Primeira experiência
            </p>
            <h2 className="text-xl font-black text-text-primary">
              {step === 0 && `Olá, ${preferences.displayName.split(" ")[0] || "vamos começar"}?`}
              {step === 1 && "Qual é sua renda aproximada?"}
              {step === 2 && "Onde seu dinheiro costuma ir?"}
              {step === 3 && "Tem algum objetivo financeiro agora?"}
            </h2>
          </div>
          <button
            type="button"
            onClick={close}
            className="rounded-lg p-2 text-text-muted transition-colors hover:bg-base hover:text-text-primary"
            aria-label="Fechar onboarding"
          >
            <XIcon size={18} />
          </button>
        </div>

        <div className="p-5">
          <div className="mb-6 grid grid-cols-4 gap-2">
            {[0, 1, 2, 3].map((item) => (
              <div
                key={item}
                className={cn(
                  "h-2 rounded-full",
                  item <= step ? "bg-purple-400" : "bg-base",
                )}
              />
            ))}
          </div>

          {step === 0 && (
            <div className="grid gap-4">
              <div className="flex h-24 w-24 items-center justify-center rounded-2xl border border-purple-400/25 bg-purple-400/10 text-purple-300">
                <WalletIcon size={42} weight="duotone" />
              </div>
              <p className="text-sm leading-6 text-text-secondary">
                Vamos preparar seu dashboard para ele não começar vazio. Em um
                minuto você define renda, categorias e uma meta inicial.
              </p>
            </div>
          )}

          {step === 1 && (
            <label className="grid gap-2">
              <span className="text-sm font-bold text-text-secondary">
                Renda por mês
              </span>
              <div className="flex items-center gap-2 rounded-xl border border-border-default bg-base px-4 py-3">
                <span className="font-black text-text-muted">R$</span>
                <input
                  value={income}
                  onChange={(event) => setIncome(event.target.value)}
                  type="number"
                  className="w-full bg-transparent text-xl font-black text-text-primary outline-none"
                />
              </div>
            </label>
          )}

          {step === 2 && (
            <div className="grid gap-2">
              {CATEGORIES.map((category) => {
                const checked = categories.includes(category);
                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() =>
                      setCategories((current) =>
                        checked
                          ? current.filter((item) => item !== category)
                          : [...current, category],
                      )
                    }
                    className={cn(
                      "flex items-center justify-between rounded-xl border p-3 text-left text-sm font-bold transition-colors",
                      checked
                        ? "border-purple-400/35 bg-purple-400/10 text-purple-200"
                        : "border-border-default bg-base text-text-secondary",
                    )}
                  >
                    {category}
                    {checked && <CheckCircleIcon size={18} weight="fill" />}
                  </button>
                );
              })}
            </div>
          )}

          {step === 3 && (
            <div className="grid gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-purple-400/25 bg-purple-400/10 text-purple-300">
                <PiggyBankIcon size={36} weight="duotone" />
              </div>
              <input
                value={goal}
                onChange={(event) => setGoal(event.target.value)}
                placeholder="Notebook novo, viagem, reserva..."
                className="rounded-xl border border-border-default bg-base px-4 py-3 text-sm font-bold text-text-primary outline-none transition-colors placeholder:text-text-muted focus:border-border-active"
              />
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t border-border-default p-5">
          {step > 0 && (
            <button
              type="button"
              onClick={() => setStep((value) => value - 1)}
              className="rounded-xl px-4 py-2 text-sm font-bold text-text-secondary transition-colors hover:text-text-primary"
            >
              Voltar
            </button>
          )}
          <button
            type="button"
            onClick={() => (step === 3 ? void finish() : setStep((value) => value + 1))}
            className="inline-flex items-center gap-2 rounded-xl bg-purple-500 px-5 py-2 text-sm font-black text-slate-950 transition-colors hover:bg-purple-400"
          >
            {step === 3 ? "Finalizar" : "Continuar"}
            <ArrowRightIcon size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
