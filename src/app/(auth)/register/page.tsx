"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowRightIcon,
  CheckCircleIcon,
  EnvelopeSimpleIcon,
  EyeIcon,
  EyeSlashIcon,
  LockIcon,
  SparkleIcon,
} from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import Logo from "@/components/layout/Logo";
import { createClient } from "@/lib/supabase/client";
import { getCompactUserMetadata } from "@/lib/userPreferences";

const registerSchema = z
  .object({
    email: z.string().email("E-mail inválido"),
    password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
    confirmPassword: z.string().min(6, "Confirme sua senha"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não conferem",
    path: ["confirmPassword"],
  });

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const params = new URLSearchParams(window.location.search);

      if (params.get("sent") === "1") {
        setSentTo("seu e-mail");
      }

      if (params.has("error")) {
        setAuthError("Não consegui criar sua conta agora. Tenta de novo em instantes.");
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  const onSubmit = async (data: RegisterForm) => {
    setAuthError(null);

    const redirectTo = `${window.location.origin}/auth/callback?next=/overview`;
    const { data: signUpData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: redirectTo,
      },
    });

    if (error) {
      setAuthError("Não consegui criar sua conta agora. Tenta de novo em instantes.");
      return;
    }

    if (signUpData.session) {
      if (signUpData.user) {
        await supabase.auth.updateUser({
          data: getCompactUserMetadata(
            signUpData.user.user_metadata,
            signUpData.user.email ?? data.email,
          ),
        });
        await supabase.auth.refreshSession();
      }
      router.replace("/overview");
      router.refresh();
      return;
    }

    setSentTo(data.email);
  };

  const handleRegisterSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void handleSubmit(onSubmit)(event);
  };

  return (
    <div className="min-h-screen bg-base flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-base border border-border-default rounded-2xl p-8 shadow-2xl shadow-purple-500/5">
        <div className="flex flex-col items-center mb-10">
          <Logo isCollapsed={false} />
          <div className="mt-6 rounded-2xl bg-purple-500/10 p-3 text-purple-400">
            {sentTo ? <CheckCircleIcon size={28} weight="fill" /> : <SparkleIcon size={28} />}
          </div>
          <h1 className="text-text-primary text-2xl font-bold mt-5">
            {sentTo ? "Confere seu e-mail" : "Crie sua conta"}
          </h1>
          <p className="text-text-muted text-sm mt-2 text-center">
            {sentTo
              ? `Enviamos a confirmação para ${sentTo}.`
              : "Informe e-mail e senha para começar."}
          </p>
        </div>

        {sentTo ? (
          <div className="space-y-5">
            <div className="rounded-2xl border border-border-default bg-surface p-5 text-center">
              <p className="text-text-secondary text-sm">
                Abra o link no e-mail para confirmar sua conta e entrar no Ecofy.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSentTo(null)}
              className="w-full py-3 border border-border-default text-text-secondary hover:text-text-primary hover:bg-surface rounded-xl font-bold transition-all"
            >
              Enviar para outro e-mail
            </button>
          </div>
        ) : (
          <form
            action="/api/auth/register"
            method="post"
            noValidate
            onSubmit={handleRegisterSubmit}
            className="space-y-5"
          >
            <div className="space-y-2">
              <label className="text-sm text-text-secondary ml-1">E-mail</label>
              <div className="relative group">
                <EnvelopeSimpleIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-purple-500 transition-colors" />
                <input
                  {...register("email")}
                  type="email"
                  autoComplete="email"
                  placeholder="seu@email.com"
                  className="w-full bg-surface border border-border-default rounded-xl py-3 pl-11 pr-4 text-text-primary text-sm focus:ring-2 focus:ring-border-active focus:border-purple-500 outline-none transition-all placeholder:text-text-muted"
                />
              </div>
              {errors.email && (
                <p className="text-red-400 text-xs ml-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm text-text-secondary ml-1">Senha</label>
              <div className="relative group">
                <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-purple-500 transition-colors" />
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  className="w-full bg-surface border border-border-default rounded-xl py-3 pl-11 pr-12 text-text-primary text-sm focus:ring-2 focus:ring-border-active focus:border-purple-500 outline-none transition-all placeholder:text-text-muted"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
                >
                  {showPassword ? <EyeSlashIcon size={20} /> : <EyeIcon size={20} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-xs ml-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm text-text-secondary ml-1">
                Confirmar senha
              </label>
              <div className="relative group">
                <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-purple-500 transition-colors" />
                <input
                  {...register("confirmPassword")}
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  className="w-full bg-surface border border-border-default rounded-xl py-3 pl-11 pr-12 text-text-primary text-sm focus:ring-2 focus:ring-border-active focus:border-purple-500 outline-none transition-all placeholder:text-text-muted"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon size={20} />
                  ) : (
                    <EyeIcon size={20} />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-400 text-xs ml-1">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {authError && (
              <p className="text-red-400 text-sm text-center bg-red-400/10 rounded-xl py-2">
                {authError}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 mt-4 bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-text-primary rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-500/20 active:scale-[0.98] disabled:opacity-70"
            >
              {isSubmitting ? "Criando..." : "Criar conta"}
              {!isSubmitting && <ArrowRightIcon size={18} />}
            </button>
          </form>
        )}

        <p className="text-center text-text-muted text-sm mt-8">
          Já tem uma conta?{" "}
          <Link href="/login" className="text-cyan-400 hover:underline font-medium">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
