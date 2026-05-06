"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AtIcon,
  CalendarBlankIcon,
  CheckCircleIcon,
  FloppyDiskIcon,
  IdentificationBadgeIcon,
  ImageSquareIcon,
  MapPinIcon,
  PencilSimpleIcon,
  ShieldCheckIcon,
  SignOutIcon,
} from "@phosphor-icons/react";
import { getInitials, useUserPreferences } from "@/lib/useUserPreferences";
import { createClient } from "@/lib/supabase/client";

type FormState = {
  displayName: string;
  role: string;
  bio: string;
  location: string;
  avatarUrl: string;
};

export default function UserProfilePage() {
  const routerSupabase = createClient();
  const { preferences, email, createdAt, savePreferences } = useUserPreferences();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState<FormState>({
    displayName: preferences.displayName,
    role: preferences.role,
    bio: preferences.bio,
    location: preferences.location,
    avatarUrl: preferences.avatarUrl,
  });

  useEffect(() => {
    // Sync the editable draft after preferences arrive from localStorage/Supabase.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setForm({
      displayName: preferences.displayName,
      role: preferences.role,
      bio: preferences.bio,
      location: preferences.location,
      avatarUrl: preferences.avatarUrl,
    });
  }, [preferences]);

  const joinedAt = useMemo(() => {
    if (!createdAt) return "Conta ativa";
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(createdAt));
  }, [createdAt]);

  const save = async () => {
    setIsSaving(true);
    await savePreferences(form);
    setIsSaving(false);
    setIsEditing(false);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2200);
  };

  const signOut = async () => {
    await routerSupabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <main className="h-full overflow-y-auto scrollbar-hide p-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-7">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-text-primary">Minha Conta</h1>
            <p className="mt-1 text-sm text-text-muted">
              Personalize como seu perfil aparece no EcoFy.
            </p>
          </div>
          <button
            onClick={() => (isEditing ? save() : setIsEditing(true))}
            disabled={isSaving}
            className="flex items-center gap-2 rounded-xl border border-border-active bg-surface px-4 py-2.5 text-sm font-bold text-text-primary transition-colors hover:bg-purple-500/15 disabled:opacity-60"
          >
            {isEditing ? <FloppyDiskIcon size={18} /> : <PencilSimpleIcon size={18} />}
            {isSaving ? "Salvando..." : isEditing ? "Salvar Perfil" : "Editar Perfil"}
          </button>
        </div>

        {saved && (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-300">
            <CheckCircleIcon size={18} weight="fill" />
            Perfil atualizado.
          </div>
        )}

        <section className="rounded-2xl border border-border-default bg-surface/50 p-8">
          <div className="flex flex-col gap-6 border-b border-border-default pb-8 md:flex-row md:items-center">
            <AvatarPreview
              name={form.displayName}
              avatarUrl={form.avatarUrl}
              editing={isEditing}
              onChange={(avatarUrl) => setForm((prev) => ({ ...prev, avatarUrl }))}
            />
            <div className="min-w-0 flex-1">
              {isEditing ? (
                <div className="grid gap-3 md:grid-cols-2">
                  <ProfileInput
                    label="Nome"
                    value={form.displayName}
                    onChange={(displayName) =>
                      setForm((prev) => ({ ...prev, displayName }))
                    }
                  />
                  <ProfileInput
                    label="Profissão ou papel"
                    value={form.role}
                    onChange={(role) => setForm((prev) => ({ ...prev, role }))}
                  />
                  <label className="md:col-span-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                      Bio
                    </span>
                    <textarea
                      value={form.bio}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, bio: event.target.value }))
                      }
                      rows={3}
                      className="mt-2 w-full resize-none rounded-xl border border-border-default bg-base px-3 py-2.5 text-sm text-text-primary outline-none transition-colors focus:border-border-active"
                    />
                  </label>
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-3xl font-black text-text-primary">
                      {preferences.displayName}
                    </h2>
                    <span className="rounded-full bg-purple-500/15 px-3 py-1 text-xs font-bold text-purple-300">
                      Conta EcoFy
                    </span>
                  </div>
                  <p className="mt-2 text-text-secondary">
                    {preferences.role} · {preferences.bio}
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <InfoTile icon={<AtIcon size={22} />} label="Endereço de e-mail" value={email || "Não informado"} />
            <EditableTile
              icon={<MapPinIcon size={22} />}
              label="Localização"
              value={form.location}
              editing={isEditing}
              onChange={(location) => setForm((prev) => ({ ...prev, location }))}
            />
            <InfoTile icon={<CalendarBlankIcon size={22} />} label="Usuário desde" value={joinedAt} />
            <InfoTile icon={<IdentificationBadgeIcon size={22} />} label="Tipo de acesso" value={preferences.role} />
          </div>
        </section>

        <section className="rounded-2xl border border-border-default bg-surface/50 p-6">
          <h2 className="text-lg font-bold text-text-primary">Configurações de Segurança</h2>
          <div className="mt-5 grid gap-3">
            <SecurityRow label="Alterar senha" action="Acessar" />
            <SecurityRow label="Notificações de acesso" action="Configurar" />
            <SecurityRow label="Autenticação em duas etapas" action="Ativar" badge="Recomendado" />
          </div>
        </section>

        <section className="rounded-2xl border border-border-default bg-surface/50 p-6">
          <h2 className="text-lg font-bold text-text-primary">Atividades da Conta</h2>
          <div className="mt-5 grid gap-3">
            {["Login bem-sucedido", "Perfil atualizado", "Preferências sincronizadas"].map((item, index) => (
              <div key={item} className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
                  <ShieldCheckIcon size={18} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-text-primary">{item}</p>
                  <p className="text-xs text-text-muted">
                    {index === 0 ? "Agora" : index === 1 ? "Hoje" : "Sempre ativo"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <button
          onClick={signOut}
          className="flex items-center justify-center gap-2 rounded-xl bg-red-500/10 px-4 py-3 font-bold text-red-400 transition-colors hover:bg-red-500/15"
        >
          <SignOutIcon size={20} />
          Sair da Conta
        </button>
      </div>
    </main>
  );
}

function AvatarPreview({
  name,
  avatarUrl,
  editing,
  onChange,
}: {
  name: string;
  avatarUrl: string;
  editing: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-purple-500 bg-purple-500/15 text-2xl font-black text-purple-200">
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
        ) : (
          getInitials(name)
        )}
      </div>
      {editing && (
        <label className="w-64">
          <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-text-muted">
            <ImageSquareIcon size={14} />
            URL da foto
          </span>
          <input
            value={avatarUrl}
            onChange={(event) => onChange(event.target.value)}
            placeholder="https://..."
            className="mt-2 w-full rounded-xl border border-border-default bg-base px-3 py-2 text-sm text-text-primary outline-none focus:border-border-active"
          />
        </label>
      )}
    </div>
  );
}

function ProfileInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label>
      <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
        {label}
      </span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-xl border border-border-default bg-base px-3 py-2.5 text-sm text-text-primary outline-none transition-colors focus:border-border-active"
      />
    </label>
  );
}

function InfoTile({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-border-default bg-base/40 p-4">
      <span className="text-purple-300">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-wider text-text-muted">{label}</p>
        <p className="truncate text-sm font-bold text-text-primary">{value}</p>
      </div>
    </div>
  );
}

function EditableTile({
  icon,
  label,
  value,
  editing,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  editing: boolean;
  onChange: (value: string) => void;
}) {
  if (!editing) return <InfoTile icon={icon} label={label} value={value} />;

  return (
    <div className="flex items-center gap-4 rounded-xl border border-border-default bg-base/40 p-4">
      <span className="text-purple-300">{icon}</span>
      <label className="min-w-0 flex-1">
        <span className="text-xs uppercase tracking-wider text-text-muted">{label}</span>
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="mt-1 w-full bg-transparent text-sm font-bold text-text-primary outline-none"
        />
      </label>
    </div>
  );
}

function SecurityRow({
  label,
  action,
  badge,
}: {
  label: string;
  action: string;
  badge?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl px-3 py-3 text-sm">
      <div className="flex items-center gap-3">
        <ShieldCheckIcon size={18} className="text-text-muted" />
        <span className="font-semibold text-text-primary">{label}</span>
        {badge && (
          <span className="rounded-full bg-orange-500/15 px-2 py-0.5 text-[11px] font-bold text-orange-300">
            {badge}
          </span>
        )}
      </div>
      <button className="font-semibold text-blue-400 transition-colors hover:text-blue-300">
        {action}
      </button>
    </div>
  );
}
