"use client";

import { useMemo, useState } from "react";
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  XIcon,
} from "@phosphor-icons/react";
import { cn } from "@/lib/cn";
import { COVERS, JAR_ICONS } from "../types/JarConfig";
import type { Jar } from "../types/JarTypes";
import type { JarIconKey } from "../types/JarConfig";

const uid = () => Math.random().toString(36).slice(2);
const SUGGESTED_GOALS = [1000, 5000, 10000, 25000, 50000];

type Props = {
  onClose: () => void;
  onCreate: (data: Omit<Jar, "id">) => void;
};

export default function CreateModal({ onClose, onCreate }: Props) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [goal, setGoal] = useState("");
  const [initial, setInitial] = useState("");
  const [targetMonth, setTargetMonth] = useState("");
  const [iconKey, setIconKey] = useState<JarIconKey>("star");
  const [cover, setCover] = useState(COVERS[0]);

  const selectedIcon = JAR_ICONS.find((i) => i.key === iconKey) ?? JAR_ICONS[0];
  const Icon = selectedIcon.icon;
  const goalValue = Number(goal);
  const initialValue = Number(initial) || 0;
  const canAdvance = step === 1 ? Boolean(name.trim()) : step === 2 ? goalValue > 0 : true;

  const monthlyProjection = useMemo(() => {
    if (!targetMonth || goalValue <= 0) return null;
    const [year, month] = targetMonth.split("-").map(Number);
    const target = new Date(year, (month || 1) - 1, 1);
    const now = new Date();
    const months =
      (target.getFullYear() - now.getFullYear()) * 12 +
      target.getMonth() -
      now.getMonth() +
      1;
    if (months <= 0) return null;
    return Math.max((goalValue - initialValue) / months, 0);
  }, [goalValue, initialValue, targetMonth]);

  const create = () => {
    if (!name.trim() || goalValue <= 0) return;
    onCreate({
      name: name.trim(),
      goal: goalValue,
      current: initialValue,
      iconKey,
      cover,
      targetMonth: targetMonth || undefined,
      history:
        initialValue > 0
          ? [
              {
                id: uid(),
                amount: initialValue,
                note: "Valor inicial",
                date: new Date().toISOString(),
              },
            ]
          : [],
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md"
      onClick={(event) => event.target === event.currentTarget && onClose()}
    >
      <div className="flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-border-default bg-surface shadow-2xl shadow-black/40">
        <div
          className="relative flex min-h-32 items-end p-5"
          style={{ background: cover.style }}
        >
          <button
            onClick={onClose}
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-xl bg-black/35 text-white backdrop-blur transition-colors hover:bg-black/50"
            aria-label="Fechar modal"
          >
            <XIcon size={17} weight="bold" />
          </button>
          <div className="flex items-center gap-3">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/20 bg-black/35 text-white backdrop-blur">
              <Icon size={28} weight="duotone" />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/70">
                Novo cofrinho
              </p>
              <h2 className="text-xl font-black text-white">
                {name || "Dê um nome para sua meta"}
              </h2>
            </div>
          </div>
        </div>

        <div className="border-b border-border-default px-5 py-4">
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className={cn(
                  "h-2 rounded-full transition-colors",
                  item <= step ? "bg-purple-400" : "bg-base",
                )}
              />
            ))}
          </div>
        </div>

        <div className="overflow-y-auto p-5">
          {step === 1 && (
            <div className="grid gap-5">
              <Field label="Nome da meta">
                <input
                  autoFocus
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Viagem para Europa, notebook novo..."
                  className="w-full rounded-xl border border-border-default bg-base px-4 py-3 text-sm font-bold text-text-primary outline-none transition-colors placeholder:text-text-muted focus:border-border-active"
                />
              </Field>

              <Field label="Escolha um ícone">
                <div className="grid grid-cols-6 gap-2">
                  {JAR_ICONS.map(({ key, label, icon: IcoComp }) => (
                    <button
                      key={key}
                      onClick={() => setIconKey(key)}
                      title={label}
                      className={cn(
                        "flex h-12 items-center justify-center rounded-xl border transition-all",
                        iconKey === key
                          ? "border-purple-400 bg-purple-400/15 text-purple-300"
                          : "border-border-default bg-base text-text-muted hover:text-text-primary",
                      )}
                    >
                      <IcoComp
                        size={21}
                        weight={iconKey === key ? "fill" : "regular"}
                      />
                    </button>
                  ))}
                </div>
              </Field>
            </div>
          )}

          {step === 2 && (
            <div className="grid gap-5">
              <Field label="Valor alvo">
                <div className="flex items-center gap-2 rounded-xl border border-border-default bg-base px-4 py-3">
                  <span className="text-sm font-black text-text-muted">R$</span>
                  <input
                    value={goal}
                    onChange={(event) => setGoal(event.target.value)}
                    type="number"
                    placeholder="0"
                    className="w-full bg-transparent text-sm font-black text-text-primary outline-none"
                  />
                </div>
              </Field>

              <div className="flex flex-wrap gap-2">
                {SUGGESTED_GOALS.map((value) => (
                  <button
                    key={value}
                    onClick={() => setGoal(String(value))}
                    className="rounded-full border border-purple-400/25 px-3 py-1.5 text-xs font-bold text-purple-300 transition-colors hover:bg-purple-400/10"
                  >
                    R$ {value.toLocaleString("pt-BR")}
                  </button>
                ))}
              </div>

              <Field label="Já tenho algum valor guardado? (opcional)">
                <div className="flex items-center gap-2 rounded-xl border border-border-default bg-base px-4 py-3">
                  <span className="text-sm font-black text-text-muted">R$</span>
                  <input
                    value={initial}
                    onChange={(event) => setInitial(event.target.value)}
                    type="number"
                    placeholder="0"
                    className="w-full bg-transparent text-sm font-black text-text-primary outline-none"
                  />
                </div>
              </Field>

              <Field label="Prazo (opcional)">
                <input
                  value={targetMonth}
                  onChange={(event) => setTargetMonth(event.target.value)}
                  type="month"
                  className="w-full rounded-xl border border-border-default bg-base px-4 py-3 text-sm font-bold text-text-primary outline-none transition-colors focus:border-border-active"
                />
              </Field>

              {monthlyProjection !== null && (
                <div className="rounded-xl border border-purple-400/20 bg-purple-400/10 px-4 py-3 text-sm font-bold text-purple-200">
                  Você precisa guardar R${" "}
                  {monthlyProjection.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
                  /mês.
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="grid gap-5">
              <Field label="Capa do cofrinho">
                <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
                  {COVERS.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setCover(item)}
                      title={item.label}
                      className={cn(
                        "h-12 rounded-xl border-2 transition-transform hover:scale-105",
                        cover.id === item.id
                          ? "border-white"
                          : "border-transparent",
                      )}
                      style={{ background: item.style }}
                    />
                  ))}
                </div>
              </Field>

              <div
                className="rounded-2xl p-5"
                style={{ background: cover.style }}
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-black/35 text-white">
                    <Icon size={25} weight="duotone" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-lg font-black text-white">
                      {name}
                    </p>
                    <p className="text-sm font-bold text-white/75">
                      Meta de R${" "}
                      {goalValue.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-border-default p-5">
          <button
            onClick={() => (step === 1 ? onClose() : setStep((value) => value - 1))}
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-text-secondary transition-colors hover:bg-base hover:text-text-primary"
          >
            {step > 1 && <ArrowLeftIcon size={16} />}
            {step === 1 ? "Cancelar" : "Voltar"}
          </button>

          {step < 3 ? (
            <button
              onClick={() => canAdvance && setStep((value) => value + 1)}
              disabled={!canAdvance}
              className="rounded-xl bg-purple-500 px-5 py-2.5 text-sm font-black text-slate-950 transition-colors hover:bg-purple-400 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Continuar
            </button>
          ) : (
            <button
              onClick={create}
              className="flex items-center gap-2 rounded-xl bg-purple-500 px-5 py-2.5 text-sm font-black text-slate-950 transition-colors hover:bg-purple-400"
            >
              <CheckCircleIcon size={17} weight="fill" />
              Criar cofrinho
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-black uppercase tracking-[0.14em] text-text-muted">
        {label}
      </span>
      {children}
    </label>
  );
}
