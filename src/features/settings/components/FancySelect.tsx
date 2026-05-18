"use client";

import { CaretDownIcon } from "@phosphor-icons/react";
import { useRef, useState } from "react";
import { cn } from "@/lib/cn";

type Option = { value: string; label: string };

type Props = {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
};

export function FancySelect({ value, onChange, options }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value);

  const handleBlur = () => setTimeout(() => setOpen(false), 150);

  return (
    <div ref={ref} className="relative min-w-30" onBlur={handleBlur}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-9 w-full items-center justify-between gap-2 rounded-xl border border-border-default bg-base px-3 text-sm font-bold text-text-primary transition-colors hover:border-border-active focus:outline-none"
      >
        <span>{selected?.label ?? value}</span>
        <CaretDownIcon
          size={14}
          className={cn(
            "text-text-muted transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 w-full overflow-hidden rounded-xl border border-border-default bg-surface shadow-xl">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={cn(
                "flex w-full items-center px-3 py-2 text-sm font-bold transition-colors hover:bg-purple-500/10 hover:text-purple-300",
                opt.value === value ? "text-purple-400" : "text-text-secondary",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
