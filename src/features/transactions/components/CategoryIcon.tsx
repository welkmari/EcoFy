"use client";

import {
  ArrowCircleUpIcon,
  BankIcon,
  BookOpenIcon,
  BriefcaseIcon,
  BusIcon,
  ForkKnifeIcon,
  GameControllerIcon,
  HeartbeatIcon,
  HouseIcon,
  LaptopIcon,
  ShoppingBagIcon,
  TagIcon,
} from "@phosphor-icons/react";
import { cn } from "@/lib/cn";

const CATEGORY_STYLES = [
  {
    match: ["ganho", "entrada", "salario", "salário", "renda", "receita"],
    icon: ArrowCircleUpIcon,
    bg: "bg-emerald-500/10",
    text: "text-emerald-500",
  },
  {
    match: ["alimentacao", "alimentação", "comida", "restaurante", "mercado"],
    icon: ForkKnifeIcon,
    bg: "bg-orange-500/10",
    text: "text-orange-500",
  },
  {
    match: ["transporte", "uber", "combustivel", "combustível"],
    icon: BusIcon,
    bg: "bg-blue-500/10",
    text: "text-blue-500",
  },
  {
    match: ["lazer", "games", "game", "entretenimento"],
    icon: GameControllerIcon,
    bg: "bg-purple-500/10",
    text: "text-purple-500",
  },
  {
    match: ["moradia", "casa", "aluguel"],
    icon: HouseIcon,
    bg: "bg-teal-500/10",
    text: "text-teal-500",
  },
  {
    match: ["saude", "saúde", "farmacia", "farmácia"],
    icon: HeartbeatIcon,
    bg: "bg-rose-500/10",
    text: "text-rose-500",
  },
  {
    match: ["educacao", "educação", "curso", "livro"],
    icon: BookOpenIcon,
    bg: "bg-indigo-500/10",
    text: "text-indigo-500",
  },
  {
    match: ["investimento", "investimentos"],
    icon: BankIcon,
    bg: "bg-cyan-500/10",
    text: "text-cyan-500",
  },
  {
    match: ["trabalho", "freelance"],
    icon: BriefcaseIcon,
    bg: "bg-emerald-500/10",
    text: "text-emerald-500",
  },
  {
    match: ["tecnologia", "software"],
    icon: LaptopIcon,
    bg: "bg-sky-500/10",
    text: "text-sky-500",
  },
  {
    match: ["compras", "shopping"],
    icon: ShoppingBagIcon,
    bg: "bg-pink-500/10",
    text: "text-pink-500",
  },
] as const;

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

export function getCategoryStyle(category: string, type?: "entrada" | "gasto") {
  const normalized = normalize(category);
  const style = CATEGORY_STYLES.find((item) =>
    item.match.some((matcher) => normalized.includes(normalize(matcher))),
  );

  if (style) return style;
  if (type === "entrada") return CATEGORY_STYLES[0];

  return {
    icon: TagIcon,
    bg: "bg-slate-500/10",
    text: "text-slate-500",
  };
}

export default function CategoryIcon({
  category,
  type,
  size = "md",
}: {
  category: string;
  type?: "entrada" | "gasto";
  size?: "sm" | "md";
}) {
  const style = getCategoryStyle(category, type);
  const Icon = style.icon;

  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center rounded-xl",
        style.bg,
        style.text,
        size === "sm" ? "h-8 w-8" : "h-10 w-10",
      )}
    >
      <Icon size={size === "sm" ? 17 : 20} weight="fill" />
    </span>
  );
}
