'use client'

import { Bell, CaretDown } from '@phosphor-icons/react';

interface HeaderProps {
  userName?: string;
  userRole?: string;
  avatarUrl?: string;
}

export default function Header({
  userName = 'Maria',
  userRole = 'Aqui estão as informações sobre todas as suas finanças.',
  avatarUrl = 'https://github.com/shadcn.png',
}: HeaderProps) {
  return (
    <header className="flex items-center justify-between w-full px-10 pt-16 pb-8 bg-transparent">

      <div className="flex flex-col gap-1">
        <h1 className="text-text-primary font-black text-3xl tracking-tight">
          Bem-Vindo(a), {userName}!
        </h1>
        <p className="text-purple-400/80 text-sm font-medium">
          {userRole}
        </p>
      </div>

      <div className="flex items-center gap-5">

        <button className="relative w-11 h-11 flex items-center justify-center rounded-2xl bg-surface text-text-secondary hover:text-purple-400 hover:bg-surface transition-all shadow-sm">
          <Bell size={22} />
          <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-purple-500 rounded-full border-2 border-surface" />
        </button>

        <button className="flex items-center gap-3 pl-3 pr-3 py-2 rounded-2xl bg-surface border border-border-default hover:border-border-active hover:bg-surface transition-all shadow-lg">
          <div className="relative">
            <img
              src={avatarUrl}
              alt={userName}
              className="w-9 h-9 rounded-xl border-2 border-border-active object-cover"
            />
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-surface" />
          </div>

          <div className="hidden lg:block text-left mr-2">
            <span className="text-text-primary text-sm font-bold block leading-none mb-1">{userName}</span>
            <span className="text-[10px] text-text-muted uppercase font-black tracking-tighter">Premium User</span>
          </div>

          <CaretDown size={16} className="text-text-muted" />
        </button>
      </div>
    </header>
  );
}