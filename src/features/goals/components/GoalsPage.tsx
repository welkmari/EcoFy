"use client";

import { useState } from "react";
import SavingsCard from "./SavingCards";
import DetailModal from "./DetailModal";
import CreateModal from "./CreateModal";
import type { Jar } from "@/features/goals/types/JarTypes";

const uid = () => Math.random().toString(36).slice(2);

export default function GoalsPage() {
  const [jars, setJars] = useState<Jar[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const selectedJar = jars.find((j) => j.id === selected) ?? null;

  const handleDeposit = (id: string, amount: number, note: string) => {
    setJars((prev) =>
      prev.map((j) =>
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
  };

  const handleWithdraw = (id: string, amount: number) => {
    setJars((prev) =>
      prev.map((j) =>
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
  };

  const handleEdit = (id: string, data: Partial<Jar>) => {
    setJars((prev) => prev.map((j) => (j.id !== id ? j : { ...j, ...data })));
  };

  const handleDelete = (id: string) => {
    setJars((prev) => prev.filter((j) => j.id !== id));
    setSelected(null);
  };

  const handleCreate = (data: Omit<Jar, "id">) => {
    setJars((prev) => [...prev, { id: uid(), ...data }]);
  };

  const total = jars.reduce((a, j) => a + j.current, 0);
  const totalGoal = jars.reduce((a, j) => a + j.goal, 0);
  const overallPct =
    totalGoal > 0 ? Math.min((total / totalGoal) * 100, 100) : 0;

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-xs text-text-muted uppercase tracking-widest mb-1">
            Meus Cofrinhos
          </p>
          <h1 className="text-3xl font-black text-text-primary">
            R$ {total.toLocaleString("pt-BR")}
          </h1>
        </div>
        {jars.length > 0 && (
          <button
            onClick={() => setShowCreate(true)}
            className="px-4 py-2.5 rounded-xl bg-linear-to-r from-purple-700 to-purple-500 text-white text-sm font-bold hover:opacity-90 transition-opacity active:scale-95"
          >
            + Novo cofrinho
          </button>
        )}
      </div>

      {/* Progresso geral */}
      {jars.length > 0 && (
        <div className="bg-surface border border-border-default rounded-2xl p-4 mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-text-muted">
              {jars.length} cofrinho{jars.length > 1 ? "s" : ""} · meta total R${" "}
              {totalGoal.toLocaleString("pt-BR")}
            </span>
            <span className="text-sm font-bold text-purple-400">
              {overallPct.toFixed(0)}%
            </span>
          </div>
          <div className="h-1.5 bg-base rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-linear-to-r from-purple-600 to-cyan-400 transition-all duration-700"
              style={{ width: `${overallPct}%` }}
            />
          </div>
        </div>
      )}

      {/* Grid de cards */}
      {jars.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <p className="text-5xl">🐷</p>
          <p className="text-text-muted font-semibold">Nenhum cofrinho ainda</p>
          <button
            onClick={() => setShowCreate(true)}
            className="px-4 py-2 rounded-xl border border-purple-500/30 text-purple-400 text-sm font-bold hover:bg-purple-500/10 transition-colors"
          >
            Criar o primeiro
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
          {jars.map((jar) => (
            <SavingsCard
              key={jar.id}
              jar={jar}
              onClick={(j) => setSelected(j.id)}
            />
          ))}
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
