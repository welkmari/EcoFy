import Link from "next/link";
import {
  ArrowRightIcon,
  ChartLineUpIcon,
  CurrencyDollarIcon,
  GithubLogoIcon,
  PiggyBankIcon,
  ReceiptIcon,
  WalletIcon,
} from "@phosphor-icons/react/dist/ssr";

const steps = [
  {
    title: "Cadastre sua base",
    text: "Renda, contas fixas e categorias aparecem em um fluxo curto e sem fricção.",
    icon: WalletIcon,
  },
  {
    title: "Acompanhe o mês",
    text: "Entradas, saídas e saldo ficam claros antes de virarem ansiedade.",
    icon: ChartLineUpIcon,
  },
  {
    title: "Crie cofrinhos",
    text: "Metas ganham nome, ícone, prazo opcional e progresso visual.",
    icon: PiggyBankIcon,
  },
];

const features = [
  ["Overview mensal", "Totais, fluxo e saúde do orçamento em uma tela só."],
  ["Busca global", "Encontre transações por descrição, valor, data ou categoria."],
  ["Contas fixas", "Vencimentos, status e parcelamentos no mesmo lugar."],
  ["Cofrinhos", "Planeje metas sem transformar sonho em planilha."],
  ["Notificações", "Alertas úteis para orçamento, vencimentos e metas."],
  ["Exportação", "CSV e relatórios mensais para quando precisar sair do app."],
];

const tech = [
  "Next.js",
  "TypeScript",
  "Tailwind CSS",
  "React Query",
  "Supabase",
  "Drizzle",
  "Acessibilidade",
  "Design System",
];

export default function LandingPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#060712] text-white">
      {/* Navbar */}
      <nav className="fixed inset-x-0 top-0 z-50 border-b border-white/5 bg-[#060712]/75 px-5 py-4 backdrop-blur-2xl lg:px-12">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link
            href="/"
            className="text-2xl font-black tracking-normal text-white"
          >
            Eco<span className="text-cyan-400">fy</span>
          </Link>
          <div className="hidden items-center gap-8 md:flex">
            <a href="#como-funciona" className="text-sm text-slate-400 hover:text-white">
              Como funciona
            </a>
            <a href="#features" className="text-sm text-slate-400 hover:text-white">
              Funcionalidades
            </a>
            <a href="#time" className="text-sm text-slate-400 hover:text-white">
              Time
            </a>
          </div>
          <Link
            href="/register"
            className="rounded-xl bg-purple-600 px-4 py-2 text-sm font-black text-white transition-colors hover:bg-purple-500"
          >
            Começar grátis
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative flex min-h-screen flex-col items-center justify-center px-5 pb-16 pt-32 text-center">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_30%,black_0%,transparent_80%)]" />
        <div className="absolute left-1/2 top-0 h-[620px] w-[620px] -translate-x-1/2 rounded-full bg-purple-600/10 blur-3xl" />
        <div className="absolute bottom-20 right-0 h-[420px] w-[420px] rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="relative z-10 inline-flex items-center gap-2 rounded-full border border-purple-500/25 bg-purple-500/10 px-4 py-1.5 text-xs font-bold text-purple-300">
          <span className="h-1.5 w-1.5 rounded-full bg-purple-400 shadow-[0_0_18px_rgba(168,85,247,.8)]" />
          Beta aberto para jovens que querem começar direito
        </div>

        <h1 className="relative z-10 mt-9 max-w-5xl text-5xl font-black leading-[0.95] tracking-normal sm:text-7xl lg:text-8xl">
          Controle total
          <br />
          do seu <span className="text-cyan-400">dinheiro.</span>
        </h1>
        <p className="relative z-10 mt-7 max-w-xl text-lg font-light leading-8 text-purple-200/60">
          O Ecofy organizes entradas, saídas, contas fixas e metas sem te jogar
          em uma planilha infinita.
        </p>

        <div className="relative z-10 mt-10 flex flex-wrap justify-center gap-3">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-7 py-3.5 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-purple-500"
          >
            Começar agora — é grátis
            <ArrowRightIcon size={17} />
          </Link>
          <Link
            href="/login"
            className="rounded-xl border border-white/10 px-7 py-3.5 text-sm font-bold text-slate-300 transition hover:border-white/25 hover:text-white"
          >
            Já tenho conta
          </Link>
        </div>

        <DashboardMockup />
      </section>

      {/* Marquee Tech */}
      <section className="border-y border-white/5 py-5 bg-[#0b0c16]">
        <div className="flex w-max animate-[marquee_26s_linear_infinite] gap-10 px-5">
          {[...tech, ...tech].map((item, index) => (
            <span
              key={`${item}-${index}`}
              className="flex items-center gap-3 whitespace-nowrap text-sm text-slate-500"
            >
              <span className="h-1 w-1 rounded-full bg-purple-500/40" />
              {item}
            </span>
          ))}
        </div>
      </section>

      {/* Como funciona */}
      <section id="como-funciona" className="mx-auto max-w-7xl px-5 py-28 lg:px-12">
        <span className="text-xs font-black uppercase tracking-[0.22em] text-purple-400">
          Como funciona
        </span>
        <h2 className="mt-4 max-w-2xl text-4xl font-black leading-tight tracking-normal sm:text-5xl">
          Três passos para sair do improviso.
        </h2>
        <p className="mt-4 max-w-xl text-base leading-7 text-slate-400">
          O essencial aparece primeiro. Os detalhes entram quando você precisa.
        </p>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {steps.map(({ title, text, icon: Icon }, index) => (
            <article
              key={title}
              className="rounded-2xl border border-white/5 bg-[#0f1123] p-6 transition hover:-translate-y-1 hover:border-purple-500/20"
            >
              <div className="mb-8 text-5xl font-black text-white/5">
                0{index + 1}
              </div>
              <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-purple-400/20 bg-purple-400/10 text-purple-300">
                <Icon size={24} />
              </span>
              <h3 className="text-lg font-black">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">{text}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Funcionalidades */}
      <section id="features" className="mx-auto max-w-7xl px-5 pb-28 lg:px-12">
        <span className="text-xs font-black uppercase tracking-[0.22em] text-purple-400">
          Funcionalidades
        </span>
        <h2 className="mt-4 max-w-2xl text-4xl font-black leading-tight tracking-normal sm:text-5xl">
          Feito para usar toda semana.
        </h2>
        <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(([title, text]) => (
            <article
              key={title}
              className="rounded-2xl border border-white/5 bg-[#0f1123] p-5 transition hover:border-purple-500/25 hover:bg-[#161831]"
            >
              <h3 className="font-black">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">{text}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Time (Aqui alteramos de md:grid-cols-2 para lg:grid-cols-3) */}
      <section id="time" className="border-y border-white/5 bg-[#0b0c16]">
        <div className="mx-auto max-w-7xl px-5 py-24 lg:px-12">
          <span className="text-xs font-black uppercase tracking-[0.22em] text-purple-400">
            O time
          </span>
          <h2 className="mt-4 max-w-2xl text-4xl font-black tracking-normal sm:text-5xl">
            Construído por quem também usa.
          </h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <TeamCard
              initials="PS"
              name="Pedro Sanson"
              role="Frontend Engineer · React · Next.js · TypeScript"
              github="sansonpedro"
            />
            <TeamCard
              initials="MW"
              name="Maria Helena Welk"
              role="Junior Developer · Software Engineering Student"
              github="welkmari"
            />
            <TeamCard
              initials="HK"
              name="Henrique Gustavo König"
              role="Junior Developer · Software Engineering Student"
              github="henrique-konig" 
            />
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="relative px-5 py-32 text-center">
        <div className="absolute left-1/2 top-1/2 h-[720px] w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-600/5 blur-3xl" />
        <h2 className="relative z-10 text-5xl font-black leading-none tracking-normal sm:text-7xl">
          Sua vida financeira
          <br />
          começa <span className="text-cyan-400">aqui.</span>
        </h2>
        <p className="relative z-10 mt-6 text-slate-400">
          Grátis para começar. Sem complicação.
        </p>
        <Link
          href="/register"
          className="relative z-10 mt-10 inline-flex items-center gap-2 rounded-xl bg-purple-600 px-8 py-4 text-sm font-black text-white transition hover:bg-purple-500"
        >
          Criar minha conta grátis
          <ArrowRightIcon size={18} />
        </Link>
      </section>
    </main>
  );
}

function DashboardMockup() {
  return (
    <div className="relative z-10 mt-20 w-full max-w-5xl">
      <div className="absolute inset-x-8 -bottom-10 h-32 rounded-full bg-purple-600/10 blur-3xl" />
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#060712] shadow-[0_60px_120px_rgba(0,0,0,.8)]">
        <div className="flex items-center gap-2 border-b border-white/5 bg-[#0b0c16] px-5 py-3">
          <span className="h-3 w-3 rounded-full bg-red-500/40" />
          <span className="h-3 w-3 rounded-full bg-yellow-500/40" />
          <span className="h-3 w-3 rounded-full bg-green-500/40" />
          <span className="ml-4 flex-1 rounded-lg bg-[#060712] px-4 py-1 text-left text-xs text-slate-500">
            app.ecofy.com.br/overview
          </span>
        </div>
        
        <div className="grid min-h-[420px] md:grid-cols-[200px_1fr]">
          <aside className="hidden border-r border-white/5 bg-[#0b0c16] p-5 text-left md:block">
            <p className="mb-6 text-lg font-black">
              Eco<span className="text-cyan-400">fy</span>
            </p>
            <div className="mb-2 rounded-lg bg-[#1c1936] border border-purple-500/20 px-3 py-2 text-xs font-bold text-purple-300">
              Visão Geral
            </div>
            {["Transações", "Contas Fixas", "Planejamento", "EcoPlus"].map((item) => (
              <div key={item} className="mb-2 px-3 py-2 text-xs font-medium text-slate-500">
                {item}
              </div>
            ))}
          </aside>

          <div className="grid gap-4 p-6 text-left bg-[#060712]">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black">Bem-vindo(a), henriquegustavokonig!</h3>
                <p className="text-xs text-purple-400/80 mt-0.5">Aqui estão as informações sobre todas as suas finanças.</p>
              </div>
              <span className="rounded-lg border border-white/5 bg-[#0b0c16] px-3 py-1 text-xs text-slate-400">
                maio de 2026
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-4">
              <MockCard label="Ganhos totais" value="R$ 0,00" sub="Total registrado" tone="cyan" />
              <MockCard label="Investimentos" value="R$ 0,00" sub="Cofrinhos guardado" tone="blue" />
              <MockCard label="Saídas totais" value="R$ 0,00" sub="Total em gastos" tone="red" />
              <MockCard label="Contas Mensais" value="R$ 0,00" sub="Fixas mensais" tone="yellow" />
            </div>

            <div className="rounded-xl border border-white/5 bg-[#0f1123] p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <span className="text-sm font-bold block">Fluxo do Mês</span>
                  <span className="text-[11px] text-slate-500">Total de entrada e saída - maio de 2026</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-xs bg-cyan-500/10 text-cyan-400 px-2 py-1 rounded-md font-bold">Entradas: R$ 0,00</span>
                  <span className="text-xs bg-red-500/10 text-red-400 px-2 py-1 rounded-md font-bold">Saídas: R$ 0,00</span>
                </div>
              </div>
              <div className="py-8 text-center text-xs text-slate-500 border border-dashed border-white/5 rounded-xl bg-[#060712]/50">
                Sem dados <br />
                <span className="text-[11px] text-slate-600">Adicione entradas ou gastos para ver o total do mês.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MockCard({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string;
  sub: string;
  tone: "cyan" | "blue" | "red" | "yellow";
}) {
  const colorMap = {
    cyan: "text-cyan-400 bg-cyan-400/10",
    blue: "text-blue-400 bg-blue-400/10",
    red: "text-red-400 bg-red-400/10",
    yellow: "text-amber-400 bg-amber-400/10",
  };

  return (
    <div className="rounded-xl border border-white/5 bg-[#0f1123] p-4 flex flex-col justify-between min-h-[105px]">
      <div>
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-slate-400">{label}</p>
          <span className={`w-2 h-2 rounded-full ${colorMap[tone].split(' ')[0]}`} />
        </div>
        <p className="mt-2 text-xl font-black text-white">{value}</p>
      </div>
      <p className="mt-2 text-[10px] text-slate-500 flex items-center gap-1">
        <span className={colorMap[tone].split(' ')[0]}>↗</span> {sub}
      </p>
    </div>
  );
}

function TeamCard({
  initials,
  name,
  role,
  github,
}: {
  initials: string;
  name: string;
  role: string;
  github: string;
}) {
  return (
    <article className="flex gap-4 rounded-2xl border border-white/5 bg-[#0f1123] p-5">
      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-purple-500/10 text-lg font-black text-purple-300">
        {initials}
      </span>
      <div>
        <h3 className="font-black">{name}</h3>
        <p className="mt-1 text-sm leading-6 text-slate-400">{role}</p>
        <a
          href={`https://github.com/${github}`}
          className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-slate-500 transition hover:text-purple-400"
        >
          <GithubLogoIcon size={15} />
          {github}
        </a>
      </div>
    </article>
  );
}