import {
  Airplane,
  Briefcase,
  Car,
  DeviceMobile,
  GameController,
  GraduationCap,
  Heart,
  House,
  Island,
  Target,
  type Icon,
} from "@phosphor-icons/react";

export const COFRINHO_ICONS = [
  { key: "target", label: "Meta", icon: Target },
  { key: "mobile", label: "Celular", icon: DeviceMobile },
  { key: "travel", label: "Viagem", icon: Island },
  { key: "car", label: "Carro", icon: Car },
  { key: "house", label: "Casa", icon: House },
  { key: "airplane", label: "Avião", icon: Airplane },
  { key: "games", label: "Games", icon: GameController },
  { key: "education", label: "Educação", icon: GraduationCap },
  { key: "health", label: "Saúde", icon: Heart },
  { key: "business", label: "Negócio", icon: Briefcase },
] as const;

export type CofrinhoIconKey = (typeof COFRINHO_ICONS)[number]["key"];

const ICON_BY_KEY = COFRINHO_ICONS.reduce(
  (acc, item) => ({ ...acc, [item.key]: item.icon }),
  {} as Record<CofrinhoIconKey, Icon>,
);

export function getCofrinhoIcon(key: string): Icon {
  return ICON_BY_KEY[key as CofrinhoIconKey] ?? Target;
}
