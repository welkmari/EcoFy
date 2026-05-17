"use client";

import { GlobeIcon, LockIcon, DatabaseIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/cn";

const tabs = [
  { id: "general", label: "Geral", icon: GlobeIcon },
  { id: "security", label: "Segurança", icon: LockIcon },
  { id: "data", label: "Dados", icon: DatabaseIcon },
] as const;

export type TabId = (typeof tabs)[number]["id"];

type Props = {
  active: TabId;
  onChange: (tab: TabId) => void;
};

export default function SettingsNav({ active, onChange }: Props) {
  return (
    <div className="grid grid-cols-3 gap-1 rounded-2xl border border-border-default bg-surface/50 p-1">
      {tabs.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className={cn(
            "flex h-10 min-w-28 items-center justify-center gap-2 rounded-xl px-3 text-sm font-bold transition-colors",
            active === id
              ? "bg-purple-500 text-white shadow-lg shadow-purple-500/15"
              : "text-text-muted hover:bg-base/60 hover:text-text-primary",
          )}
        >
          <Icon size={17} />
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}