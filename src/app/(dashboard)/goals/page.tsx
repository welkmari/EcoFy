'use client';

import { useState } from 'react';
import { Plus, Target, DeviceMobile, Island, Car } from '@phosphor-icons/react';
import { Cofrinho, ModalState } from './types/cofrinho';
import Card from '@/features/goals/components/Card';
import Modal from '@/features/goals/components/Modal';

export default function GoalsPage() {
  const [cofrinhos, setCofrinhos] = useState<Cofrinho[]>([
    { id: 1, title: 'Reserva de Emergência', current: 4800, total: 10000, icon: Target },
    { id: 2, title: 'Novo iPhone 17 Pro', current: 2500, total: 8500, icon: DeviceMobile },
    { id: 3, title: 'Viagem para as Maldivas', current: 12400, total: 15000, icon: Island },
    { id: 4, title: 'Entrada do Carro', current: 15000, total: 45000, icon: Car },
  ]);

  const [modalState, setModalState] = useState<ModalState>({ open: false });

  const openDeposit = (id: number) =>
    setModalState({ open: true, mode: 'deposit', cofrinhoId: id });

  const openCreate = () =>
    setModalState({ open: true, mode: 'create' });

  const closeModal = () =>
    setModalState({ open: false });

  const handleDeposit = (id: number, amount: number) =>
    setCofrinhos((prev) =>
      prev.map((c) => (c.id === id ? { ...c, current: c.current + amount } : c))
    );

  const handleCreate = (data: Omit<Cofrinho, 'id'>) =>
    setCofrinhos((prev) => [...prev, { ...data, id: Date.now() }]);

  const totalGuardado = cofrinhos.reduce((acc, c) => acc + c.current, 0);

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
        {cofrinhos.map((cofrinho) => (
          <Card key={cofrinho.id} {...cofrinho} onDeposit={openDeposit} />
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