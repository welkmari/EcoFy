'use client';

import { useState, useEffect, useRef } from 'react';
import { X, CheckCircle, Target } from '@phosphor-icons/react';
import { Cofrinho, ModalState } from '../types/cofrinho';
import type { CofrinhoIconKey } from '../icons';
import CofrinhoIconPicker from './iconPicker';

type Props = {
  state: ModalState;
  cofrinhos: Cofrinho[];
  onDeposit: (id: string, amount: number) => void;
  onCreate: (data: Omit<Cofrinho, 'id'>) => void;
  onClose: () => void;
};

function DepositMode({
  cofrinho,
  onDeposit,
  onClose,
}: {
  cofrinho: Cofrinho;
  onDeposit: (id: string, amount: number) => void;
  onClose: () => void;
}) {
  const [value, setValue] = useState('');
  const [success, setSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const percentage = Math.min((cofrinho.current / cofrinho.total) * 100, 100);
  const falta = cofrinho.total - cofrinho.current;

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleConfirm = () => {
    const amount = parseFloat(value.replace(',', '.'));
    if (!amount || amount <= 0) return;
    onDeposit(cofrinho.id, amount);
    setSuccess(true);
    setTimeout(() => onClose(), 1500);
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-4">
        <div className="text-green-400 animate-bounce">
          <CheckCircle size={56} weight="fill" />
        </div>
        <p className="text-text-primary font-bold text-lg">Depósito realizado!</p>
        <p className="text-text-secondary text-sm">
          R$ {parseFloat(value.replace(',', '.')).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} adicionados ao cofrinho
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs text-text-muted uppercase tracking-widest mb-1">Cofrinho</p>
        <p className="text-text-primary font-bold text-xl">{cofrinho.title}</p>
      </div>

      <div>
        <div className="flex justify-between text-sm mb-2">
          <span className="text-text-secondary">R$ {cofrinho.current.toLocaleString('pt-BR')}</span>
          <span className="text-text-muted">faltam R$ {falta.toLocaleString('pt-BR')}</span>
        </div>
        <div className="w-full h-3 bg-base rounded-full p-[2px] border border-border-default">
          <div
            className="h-full rounded-full bg-gradient-to-r from-purple-600 via-purple-500 to-cyan-400 shadow-[0_0_12px_rgba(139,92,246,0.4)] transition-all duration-700"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-text-muted mt-1">
          <span>{percentage.toFixed(0)}% concluído</span>
          <span>Meta: R$ {cofrinho.total.toLocaleString('pt-BR')}</span>
        </div>
      </div>

      <div>
        <p className="text-xs text-text-muted uppercase tracking-widest mb-2">Valor do depósito</p>
        <div className="flex items-center gap-2 bg-base border border-border-default focus-within:border-border-active rounded-xl px-4 py-3 transition-colors">
          <span className="text-text-muted font-bold text-sm">R$</span>
          <input
            ref={inputRef}
            type="number"
            min="0"
            step="0.01"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
            placeholder="0,00"
            className="bg-transparent text-text-primary font-bold text-lg w-full outline-none placeholder:text-text-muted"
          />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          onClick={onClose}
          className="flex-1 py-3 rounded-xl border border-border-default text-text-muted hover:text-text-primary hover:border-purple-500/30 font-bold text-sm transition-all"
        >
          Cancelar
        </button>
        <button
          onClick={handleConfirm}
          disabled={!value || parseFloat(value) <= 0}
          className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-bold text-sm hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
        >
          Confirmar Depósito
        </button>
      </div>
    </div>
  );
}

function CreateMode({
  onCreate,
  onClose,
}: {
  onCreate: (data: Omit<Cofrinho, 'id'>) => void;
  onClose: () => void;
}) {
  const [title, setTitle] = useState('');
  const [total, setTotal] = useState('');
  const [initial, setInitial] = useState('');
  const [iconKey, setIconKey] = useState<CofrinhoIconKey>('target');

  const handleConfirm = () => {
    const totalNum = parseFloat(total.replace(',', '.'));
    const initialNum = parseFloat(initial.replace(',', '.')) || 0;
    if (!title.trim() || !totalNum || totalNum <= 0) return;
    onCreate({
      title: title.trim(),
      total: totalNum,
      current: initialNum,
      iconKey,
      icon: Target,
    });
    onClose();
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-xs text-text-muted uppercase tracking-widest mb-2">Nome da meta</p>
        <input
          autoFocus
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex: Viagem para Europa"
          className="w-full bg-base border border-border-default focus:border-border-active rounded-xl px-4 py-3 text-text-primary font-bold outline-none placeholder:text-text-muted transition-colors"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs text-text-muted uppercase tracking-widest mb-2">Valor alvo</p>
          <div className="flex items-center gap-2 bg-base border border-border-default focus-within:border-border-active rounded-xl px-3 py-3 transition-colors">
            <span className="text-text-muted text-sm font-bold">R$</span>
            <input
              type="number"
              min="0"
              value={total}
              onChange={(e) => setTotal(e.target.value)}
              placeholder="0"
              className="bg-transparent text-text-primary font-bold w-full outline-none placeholder:text-text-muted text-sm"
            />
          </div>
        </div>
        <div>
          <p className="text-xs text-text-muted uppercase tracking-widest mb-2">Valor inicial</p>
          <div className="flex items-center gap-2 bg-base border border-border-default focus-within:border-border-active rounded-xl px-3 py-3 transition-colors">
            <span className="text-text-muted text-sm font-bold">R$</span>
            <input
              type="number"
              min="0"
              value={initial}
              onChange={(e) => setInitial(e.target.value)}
              placeholder="0"
              className="bg-transparent text-text-primary font-bold w-full outline-none placeholder:text-text-muted text-sm"
            />
          </div>
        </div>
      </div>

      <CofrinhoIconPicker selected={iconKey} onChange={setIconKey} />

      <div className="flex gap-3 pt-2">
        <button
          onClick={onClose}
          className="flex-1 py-3 rounded-xl border border-border-default text-text-muted hover:text-text-primary hover:border-purple-500/30 font-bold text-sm transition-all"
        >
          Cancelar
        </button>
        <button
          onClick={handleConfirm}
          disabled={!title.trim() || !total || parseFloat(total) <= 0}
          className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-bold text-sm hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
        >
          Criar Cofrinho
        </button>
      </div>
    </div>
  );
}

export default function CofrinhoModal({ state, cofrinhos, onDeposit, onCreate, onClose }: Props) {
  if (!state.open) return null;

  const cofrinho =
    state.mode === 'deposit'
      ? cofrinhos.find((c) => c.id === state.cofrinhoId)
      : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div className="relative w-full max-w-md bg-surface border border-border-default rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-text-primary font-black text-xl">
            {state.mode === 'deposit' ? 'Fazer Depósito' : 'Novo Cofrinho'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-base transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {state.mode === 'deposit' && cofrinho ? (
          <DepositMode cofrinho={cofrinho} onDeposit={onDeposit} onClose={onClose} />
        ) : state.mode === 'create' ? (
          <CreateMode onCreate={onCreate} onClose={onClose} />
        ) : null}
      </div>
    </div>
  );
}
