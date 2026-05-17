"use client";

import { EyeIcon, EyeSlashIcon, TrashIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { cn } from "@/lib/cn";

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-7 w-12 rounded-full border p-0.5 transition-colors",
        checked
          ? "border-purple-400/50 bg-purple-500/80"
          : "border-border-default bg-base",
      )}
      aria-pressed={checked}
    >
      <span
        className={cn(
          "block h-5 w-5 rounded-full border shadow-sm transition-transform",
          checked
            ? "translate-x-5 border-white/30 bg-white"
            : "translate-x-0 border-border-default bg-text-muted",
        )}
      />
    </button>
  );
}

export default function PrivacySettings() {
  const [analytics, setAnalytics] = useState(true);
  const [publicProfile, setPublicProfile] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <section className="overflow-hidden rounded-2xl border border-border-default bg-surface/50">
      <div className="border-b border-border-default px-6 py-5">
        <h2 className="text-lg font-bold text-text-primary">Privacidade</h2>
      </div>

      <div className="divide-y divide-border-default">
        {/* Analytics */}
        <div className="grid gap-4 px-6 py-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
          <div className="flex min-w-0 items-center gap-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border-default bg-base/70 text-text-secondary">
              <EyeIcon size={22} />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-bold text-text-primary">Análise de uso</p>
              <p className="mt-0.5 text-sm text-text-muted">
                Compartilhar dados anônimos para melhorar o produto.
              </p>
            </div>
          </div>
          <Toggle checked={analytics} onChange={setAnalytics} />
        </div>

        <div className="grid gap-4 px-6 py-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
          <div className="flex min-w-0 items-center gap-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border-default bg-base/70 text-text-secondary">
              <EyeSlashIcon size={22} />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-bold text-text-primary">Perfil público</p>
              <p className="mt-0.5 text-sm text-text-muted">
                Permite que outros usuários vejam seu perfil.
              </p>
            </div>
          </div>
          <Toggle checked={publicProfile} onChange={setPublicProfile} />
        </div>

        <div className="m-4 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-red-500/20 bg-red-500/5 p-4">
          <div className="flex min-w-0 items-center gap-4">
            <span className="text-red-400">
              <TrashIcon size={22} />
            </span>
            <div className="min-w-0">
              <p className="font-bold text-text-primary">Excluir conta</p>
              <p className="text-sm text-text-muted">
                Remove permanentemente todos os seus dados.
              </p>
            </div>
          </div>

          {!showConfirm ? (
            <button
              onClick={() => setShowConfirm(true)}
              className="rounded-xl border border-red-500/30 bg-base/60 px-4 py-2 text-sm font-bold text-red-400 transition-colors hover:bg-red-500/10"
            >
              Excluir
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => setShowConfirm(false)}
                className="rounded-xl border border-border-default bg-base/60 px-4 py-2 text-sm font-bold text-text-muted transition-colors hover:text-text-primary"
              >
                Cancelar
              </button>
              <button
                onClick={() => alert("Conta excluída (integre com seu backend)")}
                className="rounded-xl bg-red-500 px-4 py-2 text-sm font-bold text-white transition-opacity hover:opacity-90"
              >
                Confirmar
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}