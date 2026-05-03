'use client';

import {
  Target,
  DeviceMobile,
  Island,
  Car,
  House,
  Airplane,
  GameController,
  GraduationCap,
  Heart,
  Briefcase,
} from '@phosphor-icons/react';
import { Icon } from '@phosphor-icons/react';

const ICONS: { label: string; icon: Icon }[] = [
  { label: 'Meta', icon: Target },
  { label: 'Celular', icon: DeviceMobile },
  { label: 'Viagem', icon: Island },
  { label: 'Carro', icon: Car },
  { label: 'Casa', icon: House },
  { label: 'Avião', icon: Airplane },
  { label: 'Games', icon: GameController },
  { label: 'Educação', icon: GraduationCap },
  { label: 'Saúde', icon: Heart },
  { label: 'Negócio', icon: Briefcase },
];

type Props = {
  selected: Icon;
  onChange: (icon: Icon) => void;
};

export default function CofrinhoIconPicker({ selected, onChange }: Props) {
  return (
    <div>
      <p className="text-xs text-text-muted uppercase tracking-widest mb-3">Ícone</p>
      <div className="grid grid-cols-5 gap-2">
        {ICONS.map(({ label, icon: Icon }) => {
          const isSelected = selected === Icon;
          return (
            <button
              key={label}
              type="button"
              onClick={() => onChange(Icon)}
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