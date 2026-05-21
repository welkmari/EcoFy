"use client";

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
      onClick={() => onSubscribe(planId)}
      className={`w-full rounded-xl py-3 text-sm font-bold transition-all active:scale-95 ${
        highlighted
          ? "bg-linear-to-r from-purple-600 to-cyan-500 text-white shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:opacity-90"
          : "border border-border-default bg-base text-text-secondary hover:border-purple-500/40 hover:text-text-primary"
      }`}
    >
      {label}
    </button>
  );
}