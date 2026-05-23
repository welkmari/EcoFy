"use client";

import { cn } from "@/lib/cn";
import { getCategoryStyle } from "./CategoryIcon";

export default function CategoryFilter({
  categories,
  selectedCategory,
  onChange,
}: {
  categories: string[];
  selectedCategory: string | null;
  onChange: (category: string | null) => void;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2 overflow-x-auto scrollbar-hide">
      <button
        type="button"
        onClick={() => onChange(null)}
        className={cn(
          "shrink-0 rounded-full px-3 py-1.5 text-xs font-bold transition-colors",
          selectedCategory === null
            ? "bg-purple-500 text-white"
            : "bg-base/45 text-text-secondary hover:bg-base/70 hover:text-text-primary",
        )}
      >
        Todas categorias
      </button>
      {categories.map((category) => {
        const style = getCategoryStyle(category);
        const active = selectedCategory === category;

        return (
          <button
            key={category}
            type="button"
            onClick={() => onChange(active ? null : category)}
            className={cn(
              "shrink-0 rounded-full px-3 py-1.5 text-xs font-bold transition-colors",
              active
                ? `${style.bg} ${style.text}`
                : "bg-base/45 text-text-secondary hover:bg-base/70 hover:text-text-primary",
            )}
          >
            {category}
          </button>
        );
      })}
    </div>
  );
}
