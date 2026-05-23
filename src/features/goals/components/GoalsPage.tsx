"use client";

import { useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CaretLeftIcon,
  CaretRightIcon,
  PlusIcon,
  TargetIcon,
  TrendUpIcon,
  WalletIcon,
} from "@phosphor-icons/react";
import SavingsCard from "./SavingCards";
import DetailModal from "./DetailModal";
import CreateModal from "./CreateModal";
import type { Jar } from "@/features/goals/types/JarTypes";
import { useSelectedMonth } from "@/lib/selectedMonth";
import { COVERS } from "../types/JarConfig";
import type { JarIconKey } from "../types/JarConfig";

const uid = () => Math.random().toString(36).slice(2);

type GoalResponse = {
  id: string;
  title: string;
  current: number;
  total: number;
  iconKey: string;
  coverImage?: string | null;
};

function toJar(goal: GoalResponse): Jar {
  return {
    id: goal.id,
    name: goal.title,
    current: goal.current,
    goal: goal.total,
    iconKey: goal.iconKey as JarIconKey,
    cover: COVERS[0],
    coverImage: goal.coverImage ?? undefined,
    history: [],
  };
}

async function fetchGoals() {
  const response = await fetch("/api/goals");
  if (!response.ok) throw new Error("Falha ao carregar cofrinhos");
  const goals = (await response.json()) as GoalResponse[];
  return goals.map(toJar);
}

async function createGoal(data: Omit<Jar, "id">) {
  const response = await fetch("/api/goals", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: data.name,
      current: data.current,
      total: data.goal,
      iconKey: data.iconKey,
      coverImage: data.coverImage,
    }),
  });
  if (!response.ok) throw new Error("Falha ao criar cofrinho");
  return toJar((await response.json()) as GoalResponse);
}

async function moveGoalAmount({
  id,
  amount,
}: {
  id: string;
  amount: number;
}) {
  const response = await fetch(`/api/goals/${id}/deposit`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount }),
  });
  if (!response.ok) throw new Error("Falha ao atualizar cofrinho");
  return toJar((await response.json()) as GoalResponse);
}

async function updateGoal({
  id,
  data,
}: {
  id: string;
  data: Partial<Jar>;
}) {
  const response = await fetch(`/api/goals/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: data.name,
      total: data.goal,
      iconKey: data.iconKey,
      coverImage: data.coverImage,
    }),
  });
  if (!response.ok) throw new Error("Falha ao editar cofrinho");
  return toJar((await response.json()) as GoalResponse);
}

async function deleteGoal(id: string) {
  const response = await fetch(`/api/goals/${id}`, { method: "DELETE" });
  if (!response.ok) throw new Error("Falha ao excluir cofrinho");
}

export default function GoalsPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  const { month } = useSelectedMonth();
  const queryClient = useQueryClient();

  const {
    data: jars = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["goals"],
    queryFn: fetchGoals,
  });

  const selectedJar = jars.find((j) => j.id === selected) ?? null;

  const updateGoalInCache = (updated: Jar) => {
    queryClient.setQueryData<Jar[]>(["goals"], (current = []) =>
      current.map((jar) =>
        jar.id === updated.id
          ? {
              ...updated,
              cover: jar.cover,
              history: jar.history,
              targetMonth: jar.targetMonth,
              coverImage: updated.coverImage ?? jar.coverImage,
            }
          : jar,
      ),
    );
    queryClient.invalidateQueries({ queryKey: ["overview"] });
  };

  const createMutation = useMutation({
    mutationFn: createGoal,
    onSuccess: (created) => {
      queryClient.setQueryData<Jar[]>(["goals"], (current = []) => [
        created,
        ...current,
      ]);
      queryClient.invalidateQueries({ queryKey: ["overview"] });
    },
  });

  const movementMutation = useMutation({
    mutationFn: moveGoalAmount,
    onSuccess: updateGoalInCache,
  });

  const editMutation = useMutation({
    mutationFn: updateGoal,
    onSuccess: updateGoalInCache,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteGoal,
    onSuccess: (_data, id) => {
      queryClient.setQueryData<Jar[]>(["goals"], (current = []) =>
        current.filter((jar) => jar.id !== id),
      );
      queryClient.invalidateQueries({ queryKey: ["overview"] });
    },
  });

  const handleDeposit = (id: string, amount: number, note: string) => {
    queryClient.setQueryData<Jar[]>(["goals"], (current = []) =>
      current.map((j) =>
        j.id !== id
          ? j
          : {
              ...j,
              current: j.current + amount,
              history: [
                ...j.history,
                { id: uid(), amount, note, date: new Date().toISOString() },
              ],
            },
      ),
    );
    movementMutation.mutate({ id, amount });
  };

  const handleWithdraw = (id: string, amount: number) => {
    queryClient.setQueryData<Jar[]>(["goals"], (current = []) =>
      current.map((j) =>
        j.id !== id
          ? j
          : {
              ...j,
              current: Math.max(j.current - amount, 0),
              history: [
                ...j.history,
                {
                  id: uid(),
                  amount: -amount,
                  note: "Retirada",
                  date: new Date().toISOString(),
                },
              ],
            },
      ),
    );
    movementMutation.mutate({ id, amount: -amount });
  };

  const handleEdit = (id: string, data: Partial<Jar>) => {
    queryClient.setQueryData<Jar[]>(["goals"], (current = []) =>
      current.map((j) => (j.id !== id ? j : { ...j, ...data })),
    );
    editMutation.mutate({ id, data });
  };

  const handleDelete = (id: string) => {
    queryClient.setQueryData<Jar[]>(["goals"], (current = []) =>
      current.filter((j) => j.id !== id),
    );
    setSelected(null);
    deleteMutation.mutate(id);
  };

  const handleCreate = (data: Omit<Jar, "id">) => {
    createMutation.mutate(data);
  };

  const scrollCarousel = (direction: "left" | "right") => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const cardWidth = carousel.querySelector("div")?.clientWidth ?? 320;
    carousel.scrollBy({
      left: direction === "right" ? cardWidth + 16 : -(cardWidth + 16),
      behavior: "smooth",
    });
  };

  const total = jars.reduce((a, j) => a + j.current, 0);
  const totalGoal = jars.reduce((a, j) => a + j.goal, 0);
  const remaining = Math.max(totalGoal - total, 0);
  const overallPct =
    totalGoal > 0 ? Math.min((total / totalGoal) * 100, 100) : 0;
  const nearestGoal = useMemo(
    () =>
      [...jars]
        .filter((jar) => jar.goal > 0)
        .sort((a, b) => b.current / b.goal - a.current / a.goal)[0],
    [jars],
  );

  return (
    <div className="flex h-full flex-col gap-6 overflow-y-auto bg-base p-5 scrollbar-styled lg:p-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-black text-text-primary">
            Cofrinhos
          </h1>
          <p className="mt-1 text-sm font-medium text-text-muted">
            Seu dinheiro separado por objetivos, simples de acompanhar.
          </p>
        </div>
        {jars.length > 0 && (
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-purple-500 px-5 py-3 text-sm font-black text-white shadow-lg shadow-purple-950/25 transition-colors hover:bg-purple-400"
          >
            <PlusIcon size={17} weight="bold" />
            Novo cofrinho
          </button>
        )}
      </header>

      <section>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <SummaryTile
            icon={WalletIcon}
            label="Total acumulado"
            value={`R$ ${total.toLocaleString("pt-BR")}`}
            hint={`${jars.length} cofrinho${jars.length === 1 ? "" : "s"} · ${month}`}
          />
          <SummaryTile
            icon={TargetIcon}
            label="Meta total"
            value={`R$ ${totalGoal.toLocaleString("pt-BR")}`}
          />
          <SummaryTile
            icon={TrendUpIcon}
            label="Falta guardar"
            value={`R$ ${remaining.toLocaleString("pt-BR")}`}
            tone="cyan"
            hint={nearestGoal ? `Mais próximo: ${nearestGoal.name}` : undefined}
          />
        </div>
        <div className="mt-4 rounded-2xl bg-surface/80 p-4 shadow-[0_12px_28px_rgba(0,0,0,0.16)]">
          <div className="mb-2 flex items-center justify-between text-xs font-bold text-text-muted">
            <span>Progresso geral</span>
            <span>{overallPct.toFixed(0)}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-base">
            <div
              className="h-full rounded-full bg-purple-500 transition-all duration-700"
              style={{ width: `${overallPct}%` }}
            />
          </div>
        </div>
      </section>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-44 animate-pulse rounded-2xl bg-surface/60"
            />
          ))}
        </div>
      ) : isError ? (
        <p className="rounded-2xl bg-red-400/10 px-4 py-3 text-sm text-red-400">
          Não consegui carregar seus cofrinhos agora.
        </p>
      ) : jars.length === 0 ? (
        <div className="flex min-h-[42vh] flex-col items-center justify-center gap-4 text-center">
          <div className="grid h-28 w-28 place-items-center rounded-full bg-purple-500/10 text-7xl">
            <span aria-hidden>🐷</span>
          </div>
          <div>
            <h2 className="text-2xl font-black text-text-primary">
              Crie seu primeiro cofrinho!
            </h2>
            <p className="mt-2 text-sm text-text-muted">
              Defina metas e acompanhe sua evolução.
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 rounded-2xl bg-purple-500 px-5 py-3 text-sm font-black text-white transition-colors hover:bg-purple-400"
          >
            <PlusIcon size={17} weight="bold" />
            Criar cofrinho
          </button>
        </div>
      ) : (
        <div>
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <h2 className="text-xl font-black text-text-primary">
                Meus cofrinhos
              </h2>
              <p className="text-sm text-text-muted">
                Toque em uma meta para depositar, retirar ou trocar a imagem.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => scrollCarousel("left")}
                className="grid h-10 w-10 place-items-center rounded-full bg-surface/90 text-text-secondary shadow-[0_10px_24px_rgba(0,0,0,0.2)] transition hover:bg-purple-500 hover:text-white"
                aria-label="Ver cofrinhos anteriores"
              >
                <CaretLeftIcon size={18} weight="bold" />
              </button>
              <button
                type="button"
                onClick={() => scrollCarousel("right")}
                className="grid h-10 w-10 place-items-center rounded-full bg-surface/90 text-text-secondary shadow-[0_10px_24px_rgba(0,0,0,0.2)] transition hover:bg-purple-500 hover:text-white"
                aria-label="Ver próximos cofrinhos"
              >
                <CaretRightIcon size={18} weight="bold" />
              </button>
            </div>
          </div>
          <div
            ref={carouselRef}
            className="scrollbar-hide flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2"
          >
            {jars.map((jar) => (
              <div
                key={jar.id}
                className="w-[82vw] shrink-0 snap-start sm:w-[360px] xl:w-[380px]"
              >
                <SavingsCard
                  jar={jar}
                  onClick={(j) => setSelected(j.id)}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modais */}
      {selectedJar && (
        <DetailModal
          jar={selectedJar}
          onClose={() => setSelected(null)}
          onDeposit={handleDeposit}
          onWithdraw={handleWithdraw}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {showCreate && (
        <CreateModal
          onClose={() => setShowCreate(false)}
          onCreate={handleCreate}
        />
      )}
    </div>
  );
}

function SummaryTile({
  icon: Icon,
  label,
  value,
  hint,
  tone = "purple",
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  hint?: string;
  tone?: "purple" | "cyan";
}) {
  return (
    <div className="rounded-2xl bg-surface/80 p-4 shadow-[0_12px_28px_rgba(0,0,0,0.16)]">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm font-black text-text-muted">{label}</p>
        <span
          className={
            tone === "cyan"
            ? "grid h-9 w-9 place-items-center rounded-xl bg-cyan-400/10 text-cyan-400"
            : "grid h-9 w-9 place-items-center rounded-xl bg-purple-400/10 text-purple-400"
          }
        >
          <Icon size={20} weight="fill" />
        </span>
      </div>
      <p
        className={
          tone === "cyan"
            ? "text-xl font-black text-cyan-400"
            : "text-xl font-black text-purple-400"
        }
      >
        {value}
      </p>
      {hint && <p className="mt-2 text-xs font-medium text-text-muted">{hint}</p>}
    </div>
  );
}
