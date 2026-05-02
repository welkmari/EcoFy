'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Eye, EyeSlash, ArrowRight, Globe, Layout, EnvelopeSimple, Lock } from '@phosphor-icons/react';
import Logo from '@/components/layout/Logo';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
  };

  return (
    <div className="min-h-screen bg-base flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-base border border-border-default rounded-2xl p-8 shadow-2xl shadow-purple-500/5">

        <div className="flex flex-col items-center mb-10">
          <Logo isCollapsed={false} />
          <h1 className="text-text-primary text-2xl font-bold mt-6">Bem-vindo de volta</h1>
          <p className="text-text-muted text-sm mt-2 text-center">Entre com suas credenciais para acessar a plataforma.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm text-text-secondary ml-1">E-mail</label>
            <div className="relative group">
              <EnvelopeSimple className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-purple-500 transition-colors" />
              <input
                type="email"
                required
                placeholder="seu@email.com"
                className="w-full bg-surface border border-border-default rounded-xl py-3 pl-11 pr-4 text-text-primary text-sm focus:ring-2 focus:ring-border-active focus:border-purple-500 outline-none transition-all placeholder:text-text-muted"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center ml-1">
              <label className="text-sm text-text-secondary">Senha</label>
              <Link href="#" className="text-xs text-purple-400 hover:text-purple-300 transition-colors">Esqueceu a senha?</Link>
            </div>
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-purple-500 transition-colors" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                className="w-full bg-surface border border-border-default rounded-xl py-3 pl-11 pr-12 text-text-primary text-sm focus:ring-2 focus:ring-border-active focus:border-purple-500 outline-none transition-all placeholder:text-text-muted"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
              >
                {showPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 mt-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-text-primary rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-500/20 active:scale-[0.98] disabled:opacity-70"
          >
            {isLoading ? 'Autenticando...' : 'Acessar Conta'}
            {!isLoading && <ArrowRight size={18} />}
          </button>
        </form>

        <div className="relative my-8 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border-default" />
          </div>
          <span className="relative px-4 bg-base text-xs text-text-muted uppercase tracking-widest">ou continue com</span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button className="flex items-center justify-center gap-2 py-3 border border-border-default rounded-xl text-text-secondary hover:bg-surface transition-all text-sm font-medium">
            <Globe size={18} /> Google
          </button>
          <button className="flex items-center justify-center gap-2 py-3 border border-border-default rounded-xl text-text-secondary hover:bg-surface transition-all text-sm font-medium">
            <Layout size={18} /> GitHub
          </button>
        </div>

        <p className="text-center text-text-muted text-sm mt-8">
          Não tem uma conta?{' '}
          <Link href="#" className="text-cyan-400 hover:underline font-medium">Crie agora</Link>
        </p>
      </div>
    </div>
  );
}