'use client';

import { useMemo, useState } from 'react';
import { Plus } from '@phosphor-icons/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Cofrinho, ModalState } from '@/features/goals/types/cofrinho';
import Card from '@/features/goals/components/Card';
import Modal from '@/features/goals/components/Modal';
import { getCofrinhoIcon } from '@/features/goals/icons';

type GoalResponse = Omit<Cofrinho, 'icon'>;

async function fetchGoals() {
  const response = await fetch('/api/goals');
  if (!response.ok) throw new Error('Falha ao carregar cofrinhos');
  const data = (await response.json()) as GoalResponse[];
  return data.map((goal) => ({
    ...goal,
    icon: getCofrinhoIcon(goal.iconKey),
  }));
}

async function createGoal(goal: Omit<Cofrinho, 'id' | 'icon'>) {
  const response = await fetch('/api/goals', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(goal),
  });
  if (!response.ok) throw new Error('Falha ao criar cofrinho');
  const data = (await response.json()) as GoalResponse;
  return { ...data, icon: getCofrinhoIcon(data.iconKey) };
}

async function depositGoal({ id, amount }: { id: string; amount: number }) {
  const response = await fetch(`/api/goals/${id}/deposit`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount }),
  });
  if (!response.ok) throw new Error('Falha ao depositar no cofrinho');
  const data = (await response.json()) as GoalResponse;
  return { ...data, icon: getCofrinhoIcon(data.iconKey) };
}

export default function GoalsPage() {
  const [modalState, setModalState] = useState<ModalState>({ open: false });
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [goalOrder, setGoalOrder] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      return JSON.parse(window.localStorage.getItem('ecofy:goal-order') ?? '[]');
    } catch {
      return [];
    }
  });
  const queryClient = useQueryClient();

  const { data: cofrinhos = [], isLoading, isError } = useQuery({
    queryKey: ['goals'],
    queryFn: fetchGoals,
  });

  const invalidateGoals = () => {
    queryClient.invalidateQueries({ queryKey: ['goals'] });
    queryClient.invalidateQueries({ queryKey: ['overview'] });
  };

  const createMutation = useMutation({
    mutationFn: createGoal,
    onSuccess: invalidateGoals,
  });

  const depositMutation = useMutation({
    mutationFn: depositGoal,
    onSuccess: invalidateGoals,
  });

  const openDeposit = (id: string) =>
    setModalState({ open: true, mode: 'deposit', cofrinhoId: id });

  const openCreate = () =>
    setModalState({ open: true, mode: 'create' });

  const closeModal = () =>
    setModalState({ open: false });

  const handleDeposit = (id: string, amount: number) =>
    depositMutation.mutate({ id, amount });

  const handleCreate = (data: Omit<Cofrinho, 'id'>) =>
    createMutation.mutate({
      title: data.title,
      current: data.current,
      total: data.total,
      iconKey: data.iconKey,
    });

  const totalGuardado = cofrinhos.reduce((acc, c) => acc + c.current, 0);
  const orderedCofrinhos = useMemo(() => {
    const order = new Map(goalOrder.map((id, index) => [id, index]));
    return [...cofrinhos].sort((a, b) => {
      const aIndex = order.get(a.id) ?? Number.MAX_SAFE_INTEGER;
      const bIndex = order.get(b.id) ?? Number.MAX_SAFE_INTEGER;
      return aIndex - bIndex;
    });
  }, [cofrinhos, goalOrder]);

  const persistOrder = (ids: string[]) => {
    setGoalOrder(ids);
    window.localStorage.setItem('ecofy:goal-order', JSON.stringify(ids));
  };

  const moveGoal = (targetId: string) => {
    if (!draggingId || draggingId === targetId) return;
    const ids = orderedCofrinhos.map((goal) => goal.id);
    const from = ids.indexOf(draggingId);
    const to = ids.indexOf(targetId);
    if (from < 0 || to < 0) return;

    const next = [...ids];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    persistOrder(next);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12">
        <div>
          <h1 className="text-4xl font-black text-text-primary tracking-tighter mb-2">
            Meus{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
              Cofrinhos
            </span>
          </h1>
          <p className="text-text-muted font-medium">
            Você tem{' '}
            <span className="text-text-primary">
              R$ {totalGuardado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>{' '}
            guardados para o futuro.
          </p>
        </div>

        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-white text-black hover:bg-cyan-400 px-6 py-3 rounded-2xl font-extrabold transition-all shadow-xl shadow-white/5 active:scale-95"
        >
          <Plus size={20} weight="bold" />
          Criar Novo Alvo
        </button>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {isLoading && (
          <p className="text-text-muted text-sm col-span-full">
            Carregando cofrinhos...
          </p>
        )}
        {isError && (
          <p className="text-red-400 text-sm col-span-full">
            Não consegui carregar seus cofrinhos agora.
          </p>
        )}
        {orderedCofrinhos.map((cofrinho) => (
          <Card
            key={cofrinho.id}
            {...cofrinho}
            onDeposit={openDeposit}
            isDragging={draggingId === cofrinho.id}
            dragListeners={{
              draggable: true,
              onDragStart: () => setDraggingId(cofrinho.id),
              onDragOver: (event) => event.preventDefault(),
              onDrop: () => moveGoal(cofrinho.id),
              onDragEnd: () => setDraggingId(null),
            }}
          />
        ))}

        <button
          onClick={openCreate}
          className="border-2 border-dashed border-border-default rounded-3xl p-6 flex flex-col items-center justify-center gap-3 hover:border-border-active hover:bg-surface/30 transition-all text-text-muted hover:text-purple-400 group"
        >
          <div className="p-4 rounded-full bg-base group-hover:bg-purple-500/10 transition-all">
            <Plus size={32} />
          </div>
          <span className="font-bold text-sm">Novo Objetivo</span>
        </button>
      </div>

      <Modal
        state={modalState}
        cofrinhos={cofrinhos}
        onDeposit={handleDeposit}
        onCreate={handleCreate}
        onClose={closeModal}
      />
    </div>
  );
}
