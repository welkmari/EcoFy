"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  BagIcon,
  CalendarCheckIcon,
  ChartLineUpIcon,
  CheckCircleIcon,
  ClockIcon,
  FireIcon,
  FunnelSimpleIcon,
  HeartIcon,
  LightbulbIcon,
  PlusIcon,
  SparkleIcon,
  TrashIcon,
  WalletIcon,
} from "@phosphor-icons/react";
import { cn } from "@/lib/cn";
import { useUserPreferences } from "@/lib/useUserPreferences";

type WishTag = "priority" | "desire" | "useful";
type WishItem = {
  id: string;
  title: string;
  category: string;
  price: number;
  need: number;
  desire: number;
  usefulness: number;
  tags: WishTag[];
  deadline: string;
};

type PlannerState = {
  income: number;
  reserveRate: number;
  items: WishItem[];
};

type SortMode = "score" | "price" | "deadline";

const STORAGE_KEY = "ecofy:wishlist-planner:v1";

const TAGS: Record<
  WishTag,
  { label: string; icon: typeof FireIcon; className: string }
> = {
  priority: {
    label: "Prioridade",
    icon: FireIcon,
    className: "bg-amber-500/12 text-amber-200 border-amber-400/30",
  },
  desire: {
    label: "Desejo",
    icon: HeartIcon,
    className: "bg-pink-500/12 text-pink-200 border-pink-400/30",
  },
  useful: {
    label: "Útil",
    icon: LightbulbIcon,
    className: "bg-cyan-500/12 text-cyan-200 border-cyan-400/30",
  },
};

const STARTER_ITEMS: WishItem[] = [
  {
    id: "notebook",
    title: "Notebook para estudos",
    category: "Tecnologia",
    price: 2800,
    need: 9,
    desire: 7,
    usefulness: 10,
    tags: ["priority", "useful"],
    deadline: "2026-08",
  },
  {
    id: "viagem",
    title: "Viagem de descanso",
    category: "Experiência",
    price: 1600,
    need: 4,
    desire: 10,
    usefulness: 6,
    tags: ["desire"],
    deadline: "2026-12",
  },
  {
    id: "fone",
    title: "Fone com cancelamento",
    category: "Rotina",
    price: 420,
    need: 6,
    desire: 8,
    usefulness: 7,
    tags: ["desire", "useful"],
    deadline: "2026-07",
  },
];

const uid = () => Math.random().toString(36).slice(2);

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function getScore(item: WishItem, monthlyBudget: number) {
  const tagBonus =
    item.tags.includes("priority") ? 12 : item.tags.includes("useful") ? 7 : 0;
  const pricePressure =
    monthlyBudget > 0 ? Math.min(item.price / monthlyBudget, 6) * 4 : 12;
  return clampScore(
    item.need * 4.2 + item.usefulness * 3.1 + item.desire * 2.2 + tagBonus - pricePressure,
  );
}

function getMonths(price: number, monthlyBudget: number) {
  if (monthlyBudget <= 0) return Infinity;
  return Math.max(1, Math.ceil(price / monthlyBudget));
}

function getDeadlineMonths(value: string) {
  if (!value) return Infinity;
  const [year, month] = value.split("-").map(Number);
  if (!year || !month) return Infinity;

  const now = new Date();
  const currentIndex = now.getFullYear() * 12 + now.getMonth() + 1;
  const targetIndex = year * 12 + month;
  return Math.max(1, targetIndex - currentIndex);
}

function getRecommendation(item: WishItem, score: number, months: number) {
  if (score >= 78 && months <= 2) return "Comprar primeiro";
  if (score >= 68) return "Planejar agora";
  if (item.tags.includes("desire") && item.need < 5) return "Esperar esfriar";
  return "Guardar sem pressa";
}

function formatMonth(value: string) {
  if (!value) return "Sem prazo";
  const [year, month] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("pt-BR", {
    month: "short",
    year: "numeric",
  }).format(new Date(year, month - 1, 1));
}

function readStoredPlanner(): PlannerState {
  const fallback = {
    income: 3200,
    reserveRate: 12,
    items: STARTER_ITEMS,
  };

  if (typeof window === "undefined") return fallback;

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return fallback;

  try {
    const saved = JSON.parse(raw) as Partial<PlannerState>;
    return {
      income: saved.income ?? fallback.income,
      reserveRate: saved.reserveRate ?? fallback.reserveRate,
      items: saved.items?.length ? saved.items : fallback.items,
    };
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return fallback;
  }
}

export default function WishlistPlannerPage() {
  const { preferences } = useUserPreferences();
  const [initialPlanner] = useState(readStoredPlanner);
  const [income, setIncome] = useState(initialPlanner.income);
  const [reserveRate, setReserveRate] = useState(initialPlanner.reserveRate);
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState<WishTag | "all">("all");
  const [sortMode, setSortMode] = useState<SortMode>("score");
  const [items, setItems] = useState<WishItem[]>(initialPlanner.items);
  const [form, setForm] = useState({
    title: "",
    category: "Casa",
    price: "350",
    need: 6,
    desire: 7,
    usefulness: 6,
    tags: ["desire"] as WishTag[],
    deadline: "2026-09",
  });

  const formatMoney = (value: number) =>
    new Intl.NumberFormat(preferences.language, {
      style: "currency",
      currency: preferences.currency,
      minimumFractionDigits: 2,
    }).format(Number(value) || 0);

  useEffect(() => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ income, reserveRate, items }),
    );
  }, [income, reserveRate, items]);

  const monthlyBudget = Math.max((income * reserveRate) / 100, 0);
  const enrichedItems = useMemo(
    () => {
      const sorted = items
        .map((item) => {
          const score = getScore(item, monthlyBudget);
          const months = getMonths(item.price, monthlyBudget);
          const deadlineMonths = getDeadlineMonths(item.deadline);
          const requiredMonthly = Number.isFinite(deadlineMonths)
            ? item.price / deadlineMonths
            : 0;
          const deadlineGap = Math.max(requiredMonthly - monthlyBudget, 0);

          return {
            ...item,
            score,
            months,
            deadlineMonths,
            requiredMonthly,
            deadlineGap,
            recommendation: getRecommendation(item, score, months),
          };
        })
        .sort((a, b) => {
          if (sortMode === "price") return a.price - b.price;
          if (sortMode === "deadline") {
            return a.deadline.localeCompare(b.deadline);
          }
          return b.score - a.score;
        });

      return sorted;
    },
    [items, monthlyBudget, sortMode],
  );

  const filteredItems = enrichedItems.filter((item) => {
    const matchTag = activeTag === "all" || item.tags.includes(activeTag);
    const normalized = `${item.title} ${item.category}`.toLowerCase();
    return matchTag && normalized.includes(query.toLowerCase());
  });

  const selectedPlan = enrichedItems.slice(0, 3);
  const planTotal = selectedPlan.reduce((sum, item) => sum + item.price, 0);
  const planMonths = getMonths(planTotal, monthlyBudget);
  const totalWishlist = items.reduce((sum, item) => sum + item.price, 0);
  const impulseRisk = enrichedItems.filter(
    (item) => item.desire >= 8 && item.need <= 5,
  ).length;

  const addItem = () => {
    const price = Number(form.price.replace(",", "."));
    if (!form.title.trim() || !Number.isFinite(price) || price <= 0) return;
    setItems((current) => [
      {
        id: uid(),
        title: form.title.trim(),
        category: form.category.trim() || "Geral",
        price,
        need: form.need,
        desire: form.desire,
        usefulness: form.usefulness,
        tags: form.tags,
        deadline: form.deadline,
      },
      ...current,
    ]);
    setForm((current) => ({ ...current, title: "", price: "350" }));
  };

  const toggleFormTag = (tag: WishTag) => {
    setForm((current) => ({
      ...current,
      tags: current.tags.includes(tag)
        ? current.tags.filter((item) => item !== tag)
        : [...current.tags, tag],
    }));
  };

  return (
    <div className="min-h-full overflow-y-auto bg-base px-4 pb-24 pt-4 scrollbar-styled sm:px-6 lg:pb-8">
      <div className="mx-auto flex w-full max-w-[1480px] flex-col gap-5">
      <header className="flex flex-col gap-4 rounded-2xl border border-border-default bg-surface/70 p-4 shadow-[0_22px_60px_rgba(0,0,0,0.18)] lg:flex-row lg:items-center lg:justify-between lg:p-5">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-cyan-300/25 bg-cyan-400/10 text-cyan-200">
              <BagIcon size={24} weight="fill" />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-200">
                Planejamento
              </p>
              <h1 className="text-2xl font-black leading-tight text-text-primary sm:text-4xl">
                Lista inteligente de desejos
              </h1>
            </div>
          </div>
          <p className="mt-3 max-w-2xl text-sm text-text-secondary">
            Compare vontade, utilidade, necessidade e preço antes de transformar
            desejo em compra.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 rounded-xl border border-border-default bg-base/80 p-2 sm:flex">
          <Metric icon={WalletIcon} label="Reserva mensal" value={formatMoney(monthlyBudget)} />
          <Metric icon={ChartLineUpIcon} label="Lista total" value={formatMoney(totalWishlist)} />
        </div>
      </header>

      <section className="grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
        <div className="space-y-4 xl:sticky xl:top-4 xl:self-start">
          <div className="rounded-xl border border-border-default bg-surface p-4 shadow-[0_20px_45px_rgba(0,0,0,0.18)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-black text-text-primary">Simulação</h2>
                <p className="text-xs text-text-muted">Quanto dá para separar sem apertar.</p>
              </div>
              <SparkleIcon size={22} className="text-purple-300" />
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <Field label="Quanto você ganha">
                <input
                  type="number"
                  min={0}
                  value={income}
                  onChange={(event) => setIncome(Number(event.target.value))}
                  className="h-11 w-full rounded-xl border border-border-default bg-base px-3 text-sm font-bold text-text-primary outline-none focus:border-purple-400"
                />
              </Field>
              <Field label={`Separar ${reserveRate}% por mês`}>
                <input
                  type="range"
                  min={1}
                  max={45}
                  value={reserveRate}
                  onChange={(event) => setReserveRate(Number(event.target.value))}
                  className="w-full accent-purple-400"
                />
              </Field>
            </div>

            <div className="mt-4 rounded-xl border border-purple-300/20 bg-purple-400/10 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-purple-200">
                Plano sugerido
              </p>
              <p className="mt-2 text-2xl font-black text-text-primary">
                {Number.isFinite(planMonths) ? `${planMonths} meses` : "Sem reserva"}
              </p>
              <p className="mt-1 text-sm text-text-secondary">
                Para os 3 itens com maior pontuação: {formatMoney(planTotal)}.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-border-default bg-surface p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-text-primary">Novo desejo</h2>
              <PlusIcon size={20} className="text-cyan-300" />
            </div>

            <div className="mt-4 space-y-3">
              <Field label="Nome">
                <input
                  value={form.title}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, title: event.target.value }))
                  }
                  placeholder="Ex: cadeira ergonômica"
                  className="h-11 w-full rounded-xl border border-border-default bg-base px-3 text-sm font-bold text-text-primary outline-none placeholder:text-text-muted focus:border-cyan-300"
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Preço">
                  <input
                    inputMode="decimal"
                    value={form.price}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, price: event.target.value }))
                    }
                    className="h-11 w-full rounded-xl border border-border-default bg-base px-3 text-sm font-bold text-text-primary outline-none focus:border-cyan-300"
                  />
                </Field>
                <Field label="Categoria">
                  <input
                    value={form.category}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, category: event.target.value }))
                    }
                    className="h-11 w-full rounded-xl border border-border-default bg-base px-3 text-sm font-bold text-text-primary outline-none focus:border-cyan-300"
                  />
                </Field>
              </div>

              <Field label="Prazo desejado">
                <input
                  type="month"
                  value={form.deadline}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, deadline: event.target.value }))
                  }
                  className="h-11 w-full rounded-xl border border-border-default bg-base px-3 text-sm font-bold text-text-primary outline-none focus:border-cyan-300"
                />
              </Field>

              <ScoreSlider label="Necessidade" value={form.need} onChange={(need) => setForm((current) => ({ ...current, need }))} />
              <ScoreSlider label="Desejo" value={form.desire} onChange={(desire) => setForm((current) => ({ ...current, desire }))} />
              <ScoreSlider label="Utilidade" value={form.usefulness} onChange={(usefulness) => setForm((current) => ({ ...current, usefulness }))} />

              <Field label="Etiquetas">
                <div className="grid grid-cols-3 gap-2">
                  {(Object.keys(TAGS) as WishTag[]).map((tag) => {
                    const TagIcon = TAGS[tag].icon;
                    const active = form.tags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleFormTag(tag)}
                        className={cn(
                          "flex h-10 items-center justify-center gap-1 rounded-xl border text-xs font-bold transition-colors",
                          active
                            ? TAGS[tag].className
                            : "border-border-default bg-base text-text-muted hover:text-text-primary",
                        )}
                      >
                        <TagIcon size={15} weight={active ? "fill" : "regular"} />
                        {TAGS[tag].label}
                      </button>
                    );
                  })}
                </div>
              </Field>

              <button
                type="button"
                onClick={addItem}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-purple-500 text-sm font-black text-white transition-colors hover:bg-purple-400"
              >
                <PlusIcon size={18} weight="bold" />
                Adicionar na lista
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-3">
            <InsightCard
              icon={CheckCircleIcon}
              title="Melhor compra"
              value={enrichedItems[0]?.title ?? "Adicione um item"}
              tone="cyan"
            />
            <InsightCard
              icon={ClockIcon}
              title="Risco de impulso"
              value={`${impulseRisk} item${impulseRisk === 1 ? "" : "s"}`}
              tone="pink"
            />
            <InsightCard
              icon={CalendarCheckIcon}
              title="Compra em foco"
              value={selectedPlan[0] ? formatMonth(selectedPlan[0].deadline) : "Sem prazo"}
              tone="amber"
            />
          </div>

          <div className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="overflow-hidden rounded-xl border border-border-default bg-surface shadow-[0_24px_70px_rgba(0,0,0,0.2)]">
              <div className="flex flex-col gap-3 border-b border-border-default bg-base/25 p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h2 className="text-lg font-black text-text-primary">Mapa de decisão</h2>
                    <p className="text-xs text-text-muted">
                      Ordenado pela compra que faz mais sentido agora.
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <div className="flex h-10 items-center gap-2 rounded-xl border border-border-default bg-base px-3">
                      <FunnelSimpleIcon size={16} className="text-text-muted" />
                      <input
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Buscar"
                        className="w-full bg-transparent text-sm font-semibold text-text-primary outline-none placeholder:text-text-muted sm:w-36"
                      />
                    </div>
                    <select
                      value={sortMode}
                      onChange={(event) => setSortMode(event.target.value as SortMode)}
                      className="h-10 rounded-xl border border-border-default bg-base px-3 text-xs font-bold text-text-secondary outline-none focus:border-purple-400"
                      aria-label="Ordenar desejos"
                    >
                      <option value="score">Score</option>
                      <option value="deadline">Prazo</option>
                      <option value="price">Menor preço</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-1 rounded-xl bg-base p-1">
                  {(["all", "priority", "desire", "useful"] as const).map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setActiveTag(tag)}
                      className={cn(
                        "h-8 rounded-lg px-2 text-xs font-bold transition-colors",
                        activeTag === tag
                          ? "bg-purple-500 text-white"
                          : "text-text-muted hover:bg-surface hover:text-text-primary",
                      )}
                    >
                      {tag === "all" ? "Tudo" : TAGS[tag].label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="divide-y divide-border-default">
                {filteredItems.map((item, index) => (
                  <WishRow
                    key={item.id}
                    item={item}
                    index={index}
                    monthlyBudget={monthlyBudget}
                    formatMoney={formatMoney}
                    onDelete={() =>
                      setItems((current) => current.filter((wish) => wish.id !== item.id))
                    }
                  />
                ))}
                {filteredItems.length === 0 && (
                  <div className="p-8 text-center text-sm font-semibold text-text-muted">
                    Nenhum desejo encontrado nesse filtro.
                  </div>
                )}
              </div>
            </div>

            <PlanTimeline
              items={selectedPlan}
              monthlyBudget={monthlyBudget}
              planMonths={planMonths}
              formatMoney={formatMoney}
            />
          </div>
        </div>
      </section>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.12em] text-text-muted">
        {label}
      </span>
      {children}
    </label>
  );
}

function ScoreSlider({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-xs font-bold uppercase tracking-[0.12em] text-text-muted">
        <span>{label}</span>
        <span className="text-text-primary">{value}/10</span>
      </div>
      <input
        type="range"
        min={1}
        max={10}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full accent-cyan-300"
      />
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof WalletIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2 rounded-lg bg-surface px-3 py-2">
      <Icon size={18} className="shrink-0 text-cyan-300" />
      <div className="min-w-0">
        <p className="truncate text-[11px] font-semibold text-text-muted">{label}</p>
        <p className="truncate text-sm font-black text-text-primary">{value}</p>
      </div>
    </div>
  );
}

function InsightCard({
  icon: Icon,
  title,
  value,
  tone,
}: {
  icon: typeof CheckCircleIcon;
  title: string;
  value: string;
  tone: "cyan" | "pink" | "amber";
}) {
  const toneClass = {
    cyan: "text-cyan-200 bg-cyan-400/10 border-cyan-300/20",
    pink: "text-pink-200 bg-pink-400/10 border-pink-300/20",
    amber: "text-amber-200 bg-amber-400/10 border-amber-300/20",
  }[tone];

  return (
    <div className={cn("rounded-xl border p-4", toneClass)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.14em] opacity-80">
            {title}
          </p>
          <p className="mt-2 truncate text-lg font-black text-text-primary">
            {value}
          </p>
        </div>
        <Icon size={22} weight="fill" className="shrink-0" />
      </div>
    </div>
  );
}

function WishRow({
  item,
  index,
  monthlyBudget,
  formatMoney,
  onDelete,
}: {
  item: WishItem & {
    score: number;
    months: number;
    deadlineMonths: number;
    requiredMonthly: number;
    deadlineGap: number;
    recommendation: string;
  };
  index: number;
  monthlyBudget: number;
  formatMoney: (value: number) => string;
  onDelete: () => void;
}) {
  const monthlyImpact = monthlyBudget > 0 ? (item.price / monthlyBudget) * 100 : 0;
  const deadlineHealthy = item.deadlineGap <= 0;

  return (
    <article className="grid gap-4 p-4 transition-colors hover:bg-base/35 lg:grid-cols-[minmax(220px,1.2fr)_170px_minmax(230px,0.8fr)_48px] lg:items-center">
      <div className="min-w-0">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-base text-sm font-black text-cyan-200">
            {index + 1}
          </span>
          <div className="min-w-0">
            <h3 className="truncate text-base font-black text-text-primary">
              {item.title}
            </h3>
            <p className="truncate text-xs font-semibold text-text-muted">
              {item.category} • {formatMonth(item.deadline)}
            </p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {item.tags.map((tag) => {
            const TagIcon = TAGS[tag].icon;
            return (
              <span
                key={tag}
                className={cn(
                  "inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-bold",
                  TAGS[tag].className,
                )}
              >
                <TagIcon size={13} weight="fill" />
                {TAGS[tag].label}
              </span>
            );
          })}
        </div>
      </div>

      <div>
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-text-muted">
          Preço
        </p>
        <p className="mt-1 text-xl font-black text-text-primary">
          {formatMoney(item.price)}
        </p>
        <p className="text-xs text-text-muted">
          {monthlyImpact.toFixed(0)}% da reserva mensal
        </p>
        <p className="mt-1 text-xs font-bold text-text-secondary">
          {Number.isFinite(item.deadlineMonths)
            ? `${formatMoney(item.requiredMonthly)}/mês até o prazo`
            : "Sem prazo definido"}
        </p>
      </div>

      <div>
        <div className="flex items-center justify-between text-xs font-bold text-text-muted">
          <span>Score Ecofy</span>
          <span className="text-text-primary">{item.score}/100</span>
        </div>
        <div className="mt-2 h-2 rounded-full bg-base">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-purple-400"
            style={{ width: `${item.score}%` }}
          />
        </div>
        <p className="mt-2 text-xs font-bold text-cyan-200">
          {item.recommendation} •{" "}
          {Number.isFinite(item.months) ? `${item.months} meses` : "sem reserva"}
        </p>
        <p
          className={cn(
            "mt-1 text-xs font-bold",
            deadlineHealthy ? "text-emerald-300" : "text-amber-300",
          )}
        >
          {deadlineHealthy
            ? "Prazo cabe na reserva"
            : `Faltam ${formatMoney(item.deadlineGap)}/mês`}
        </p>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={onDelete}
          className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-border-default bg-base px-3 text-xs font-bold text-text-muted transition-colors hover:border-red-400/40 hover:text-red-300 lg:w-10"
          aria-label="Remover desejo"
        >
          <TrashIcon size={16} />
          <span className="lg:hidden">Remover</span>
        </button>
      </div>
    </article>
  );
}

function PlanTimeline({
  items,
  monthlyBudget,
  planMonths,
  formatMoney,
}: {
  items: Array<
    WishItem & {
      score: number;
      months: number;
      deadlineGap: number;
      recommendation: string;
    }
  >;
  monthlyBudget: number;
  planMonths: number;
  formatMoney: (value: number) => string;
}) {
  return (
    <aside className="rounded-xl border border-border-default bg-surface p-4 shadow-[0_24px_70px_rgba(0,0,0,0.16)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-text-primary">Roteiro</h2>
          <p className="text-xs text-text-muted">Sequência prática para comprar sem bagunçar o mês.</p>
        </div>
        <CalendarCheckIcon size={22} weight="fill" className="shrink-0 text-amber-200" />
      </div>

      <div className="mt-4 rounded-xl border border-purple-300/20 bg-purple-400/10 p-3">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-purple-200">
          Duração estimada
        </p>
        <p className="mt-1 text-2xl font-black text-text-primary">
          {Number.isFinite(planMonths) ? `${planMonths} meses` : "Sem reserva"}
        </p>
        <p className="mt-1 text-xs text-text-secondary">
          Reserva considerada: {formatMoney(monthlyBudget)}/mês.
        </p>
      </div>

      <div className="mt-4 space-y-3">
        {items.length === 0 && (
          <p className="rounded-xl border border-border-default bg-base p-4 text-sm font-semibold text-text-muted">
            Adicione desejos para montar o roteiro.
          </p>
        )}
        {items.map((item, index) => (
          <div key={item.id} className="rounded-xl border border-border-default bg-base p-3">
            <div className="flex items-start gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface text-xs font-black text-cyan-200">
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-black text-text-primary">
                  {item.title}
                </p>
                <p className="mt-1 text-xs text-text-muted">
                  {formatMoney(item.price)} • score {item.score}/100
                </p>
                <p
                  className={cn(
                    "mt-2 text-xs font-bold",
                    item.deadlineGap <= 0 ? "text-emerald-300" : "text-amber-300",
                  )}
                >
                  {item.deadlineGap <= 0
                    ? item.recommendation
                    : `Ajuste +${formatMoney(item.deadlineGap)}/mês`}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
