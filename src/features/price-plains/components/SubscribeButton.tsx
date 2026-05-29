"use client";

import { cn } from "@/lib/cn";

type Props = {
  planId: string;
  highlighted?: boolean;
  label?: string;
  onSubscribe: (planId: string) => void;
};

export default function SubscribeButton({
  planId,
  highlighted = false,
  label = "Assinar agora",
  onSubscribe,
}: Props) {
  return (
    <button
      type="button"
      onClick={() => onSubscribe(planId)}
      className={cn(
        "w-full rounded-lg px-4 py-3 text-sm font-black transition-colors active:scale-[0.99]",
        highlighted
          ? "bg-purple-500 text-white hover:bg-purple-600"
          : "border border-border-default bg-base/55 text-text-secondary hover:border-border-active hover:text-text-primary",
      )}
    >
      {label}
    </button>
  );
}
