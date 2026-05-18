"use client";

import {
  CheckCircleIcon,
  InfoIcon,
  SpinnerGapIcon,
  WarningCircleIcon,
  XIcon,
} from "@phosphor-icons/react";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import { cn } from "@/lib/cn";

type ToastType = "success" | "error" | "info" | "loading";

type ToastInput = {
  title: string;
  description?: string;
  type?: ToastType;
  duration?: number;
  actionLabel?: string;
  onAction?: () => void;
};

type Toast = ToastInput & {
  id: string;
  type: ToastType;
};

type ToastContextValue = {
  showToast: (toast: ToastInput) => string;
  dismissToast: (id: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const ICONS: Record<ToastType, React.ElementType> = {
  success: CheckCircleIcon,
  error: WarningCircleIcon,
  info: InfoIcon,
  loading: SpinnerGapIcon,
};

const STYLES: Record<ToastType, string> = {
  success: "border-cyan-400/25 bg-cyan-500/15 text-cyan-100",
  error: "border-red-400/25 bg-red-500/15 text-red-100",
  info: "border-sky-400/25 bg-sky-500/15 text-sky-100",
  loading: "border-teal-400/25 bg-teal-500/15 text-teal-100",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef(new Map<string, number>());

  const dismissToast = useCallback((id: string) => {
    const timer = timers.current.get(id);
    if (timer) window.clearTimeout(timer);
    timers.current.delete(id);
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (input: ToastInput) => {
      const id = crypto.randomUUID();
      const type = input.type ?? "success";
      const toast: Toast = { ...input, id, type };
      const duration = input.duration ?? (type === "error" ? 5000 : 3000);

      setToasts((current) => [toast, ...current].slice(0, 4));

      if (type !== "loading" && duration > 0) {
        const timer = window.setTimeout(() => dismissToast(id), duration);
        timers.current.set(id, timer);
      }

      return id;
    },
    [dismissToast],
  );

  const value = useMemo(
    () => ({ showToast, dismissToast }),
    [dismissToast, showToast],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-5 right-4 z-[80] flex w-[min(360px,calc(100vw-2rem))] flex-col gap-3 md:bottom-6 md:right-6">
        {toasts.map((toast) => {
          const Icon = ICONS[toast.type];

          return (
            <div
              key={toast.id}
              className={cn(
                "rounded-xl border p-3 shadow-2xl shadow-black/30 backdrop-blur-xl animate-[toastIn_180ms_ease]",
                STYLES[toast.type],
              )}
              role={toast.type === "error" ? "alert" : "status"}
            >
              <div className="flex items-start gap-3">
                <Icon
                  size={20}
                  weight={toast.type === "loading" ? "regular" : "fill"}
                  className={cn(
                    "mt-0.5 shrink-0",
                    toast.type === "loading" && "animate-spin",
                  )}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold">{toast.title}</p>
                  {toast.description && (
                    <p className="mt-0.5 text-xs text-white/70">
                      {toast.description}
                    </p>
                  )}
                  {toast.actionLabel && toast.onAction && (
                    <button
                      type="button"
                      onClick={() => {
                        toast.onAction?.();
                        dismissToast(toast.id);
                      }}
                      className="mt-2 rounded-lg border border-white/20 px-3 py-1 text-xs font-bold text-white transition-colors hover:bg-white/10"
                    >
                      {toast.actionLabel}
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => dismissToast(toast.id)}
                  className="rounded-lg p-1 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                  aria-label="Fechar aviso"
                >
                  <XIcon size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}
