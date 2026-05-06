"use client";

import { useEffect, useRef, useState } from "react";
import { CaretDownIcon, CheckIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/cn";

export type SelectOption = {
  value: string;
  label: string;
};

export function FancySelect({
  value,
  options,
  onChange,
  placeholder = "Selecione",
  className,
}: {
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((option) => option.value === value);

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={cn(
          "flex h-10 w-full min-w-32 items-center justify-between gap-3 rounded-xl border border-border-default bg-base/80 px-3 text-sm font-bold text-text-primary outline-none transition-colors",
          open ? "border-border-active ring-2 ring-purple-500/10" : "hover:border-border-active",
        )}
      >
        <span className={selected ? "" : "text-text-muted"}>
          {selected?.label ?? placeholder}
        </span>
        <CaretDownIcon
          size={16}
          className={cn("text-text-muted transition-transform", open && "rotate-180")}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-full min-w-40 overflow-hidden rounded-xl border border-border-default bg-surface shadow-2xl shadow-black/30">
          {options.map((option) => {
            const active = option.value === value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left text-sm transition-colors",
                  active
                    ? "bg-purple-500/20 text-text-primary"
                    : "text-text-secondary hover:bg-base/70 hover:text-text-primary",
                )}
              >
                <span>{option.label}</span>
                {active && <CheckIcon size={15} className="text-purple-300" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
