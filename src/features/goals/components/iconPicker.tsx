'use client';

import { COFRINHO_ICONS, type CofrinhoIconKey } from '../icons';

type Props = {
  selected: CofrinhoIconKey;
  onChange: (icon: CofrinhoIconKey) => void;
};

export default function CofrinhoIconPicker({ selected, onChange }: Props) {
  return (
    <div>
      <p className="text-xs text-text-muted uppercase tracking-widest mb-3">Ícone</p>
      <div className="grid grid-cols-5 gap-2">
        {COFRINHO_ICONS.map(({ key, label, icon: Icon }) => {
          const isSelected = selected === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onChange(key)}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-all ${
                isSelected
                  ? 'border-border-active bg-purple-500/10 text-purple-400'
                  : 'border-border-default bg-base text-text-muted hover:border-purple-500/30 hover:text-text-secondary'
              }`}
            >
              <Icon size={20} />
              <span className="text-[9px] leading-none">{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
