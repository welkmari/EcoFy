'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  MagnifyingGlass,
  SquaresFour,
  Users,
  CurrencyDollar,
  Gear,
  CaretRight,
  SignOut,
  ArrowCircleUp,
  ArrowCircleDown,
  BellRinging,
  Wallet,
  List,
  CaretLeft,
  CreditCard,
  Lightning,
  Target,
} from '@phosphor-icons/react';
import Logo from '@/components/layout/Logo';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [dashboardOpen, setDashboardOpen] = useState(true);
  const [featuresOpen, setFeaturesOpen] = useState(false);
  const [premiumOpen, setPremiumOpen] = useState(false);

  const handleLogout = () => {
    router.push('/login');
  };

  return (
    <div className={`flex flex-col h-screen bg-base text-text-secondary p-6 border-r border-border-default transition-all duration-300 ${isCollapsed ? 'w-24' : 'w-72'}`}>

      <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} mb-12`}>
        <Logo isCollapsed={isCollapsed} />
        {!isCollapsed && (
          <button
            onClick={() => setIsCollapsed(true)}
            className="p-1.5 hover:bg-surface rounded-lg text-text-muted hover:text-text-primary transition-colors"
          >
            <CaretLeft size={20} />
          </button>
        )}
      </div>

      {isCollapsed && (
        <button
          onClick={() => setIsCollapsed(false)}
          className="p-1.5 hover:bg-surface rounded-lg text-text-muted hover:text-text-primary transition-colors mx-auto mb-8"
        >
          <List size={20} />
        </button>
      )}

      <div className="relative mb-8">
        <MagnifyingGlass className={`absolute ${isCollapsed ? 'left-1/2 -translate-x-1/2' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted`} />
        {!isCollapsed && (
          <input
            type="text"
            placeholder="Pesquise aqui..."
            className="w-full bg-surface border border-border-default rounded-md py-2 pl-10 text-sm focus:ring-1 focus:ring-purple-500 outline-none transition-colors"
          />
        )}
      </div>

      <nav className="flex-1 space-y-2 overflow-y-auto scrollbar-hide pr-1">

        <div>
          <button
            onClick={() => !isCollapsed && setDashboardOpen(!dashboardOpen)}
            className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} w-full p-2 text-purple-500 font-medium focus:outline-none`}
          >
            <div className="flex items-center gap-3">
              <SquaresFour size={20} />
              {!isCollapsed && <span>Home</span>}
            </div>
            {!isCollapsed && (
              <CaretRight size={16} className={`transition-transform duration-200 ${dashboardOpen ? 'rotate-90' : ''}`} />
            )}
          </button>

          {dashboardOpen && !isCollapsed && (
            <div className="ml-4 mt-2 space-y-1 border-l border-border-default">
              <p className="pl-6 py-2 text-xs uppercase tracking-widest text-text-muted">Visualização Geral</p>
              <SubNavItem href="/bills" label="Contas" active={pathname === '/bills'} icon={<Wallet size={14} />} />
              <SubNavItem href="/spents" label="Gastos" active={pathname === '/spents'} icon={<ArrowCircleDown size={14} />} />
              <SubNavItem href="/earnings" label="Ganhos" active={pathname === '/earnings'} icon={<ArrowCircleUp size={14} />} />
              <SubNavItem href="/fixed-bills" label="Contas Fixas" active={pathname === '/fixed-bills'} icon={<BellRinging size={14} />} />
            </div>
          )}
        </div>

        <div>
          <button
            onClick={() => !isCollapsed && setFeaturesOpen(!featuresOpen)}
            className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} w-full p-2 transition-colors group focus:outline-none ${featuresOpen || pathname.includes('goals') ? 'text-purple-400' : 'hover:text-purple-400'}`}
          >
            <div className="flex items-center gap-3">
              <CurrencyDollar size={20} />
              {!isCollapsed && <span>Planejamento</span>}
            </div>
            {!isCollapsed && (
              <CaretRight size={16} className={`transition-transform duration-200 ${featuresOpen ? 'rotate-90' : ''}`} />
            )}
          </button>

          {featuresOpen && !isCollapsed && (
            <div className="ml-4 mt-2 space-y-1 border-l border-border-default">
              <SubNavItem href="/goals" label="Metas Financeiras" active={pathname === '/goals'} icon={<Target size={14} />} />
            </div>
          )}
        </div>

        <NavItem icon={<Users size={20} />} label="Usuário" active={pathname === '/users'} href="/users" isCollapsed={isCollapsed} />
        <NavItem icon={<Gear size={20} />} label="Settings" active={pathname === '/settings'} href="/settings" isCollapsed={isCollapsed} />

        <div>
          <button
            onClick={() => !isCollapsed && setPremiumOpen(!premiumOpen)}
            className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} w-full p-2 transition-colors group focus:outline-none ${premiumOpen || pathname.includes('premium') ? 'text-yellow-500' : 'hover:text-yellow-500'}`}
          >
            <div className="flex items-center gap-3">
              <Lightning size={20} className={premiumOpen || pathname.includes('premium') ? 'text-yellow-500' : ''} />
              {!isCollapsed && <span className="font-medium">CoinFy Premium</span>}
            </div>
            {!isCollapsed && (
              <CaretRight size={16} className={`transition-transform duration-200 ${premiumOpen ? 'rotate-90' : ''}`} />
            )}
          </button>

          {premiumOpen && !isCollapsed && (
            <div className="ml-4 mt-2 space-y-1 border-l border-border-default">
              <SubNavItem href="/premium" label="Ver Planos" active={pathname === '/premium'} icon={<Lightning size={14} />} />
              <SubNavItem href="/payments" label="Pagamentos" active={pathname === '/payments'} icon={<CreditCard size={14} />} />
            </div>
          )}
        </div>

      </nav>

      <div className="mt-auto pt-6 border-t border-border-default shrink-0 space-y-4">
        {!isCollapsed && (
          <Link
            href="/users"
            className={`flex items-center gap-3 cursor-pointer p-2 rounded-xl transition-all hover:bg-surface group ${pathname === '/users' ? 'bg-surface ring-1 ring-border-active' : ''}`}
          >
            <img src="https://github.com/mariaroberta.png" alt="User" className="w-10 h-10 rounded-full border-2 border-border-default" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-text-primary">Maria Roberta</p>
              <p className="text-xs text-text-muted">Junior Developer</p>
            </div>
          </Link>
        )}

        {isCollapsed && (
          <div className="flex justify-center">
            <img src="https://github.com/mariaroberta.png" alt="User" className="w-10 h-10 rounded-full border-2 border-border-default" />
          </div>
        )}

        <button
          onClick={handleLogout}
          className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} w-full p-2 text-sm font-medium text-text-muted hover:text-red-400 hover:bg-red-hover rounded-lg transition-all`}
        >
          <SignOut size={20} />
          {!isCollapsed && <span>Sair da conta</span>}
        </button>
      </div>
    </div>
  );
}

type SubNavItemProps = {
  href: string;
  label: string;
  active: boolean;
  icon: React.ReactNode;
};

function SubNavItem({ href, label, active, icon }: SubNavItemProps) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 pl-6 py-2 transition-colors rounded-r-md text-sm ${
        active ? 'text-text-primary bg-surface border-l-2 border-purple-500 font-medium' : 'hover:text-purple-400 hover:bg-surface/30'
      }`}
    >
      <span className={active ? 'text-purple-400' : 'text-text-muted'}>{icon}</span>
      {label}
    </Link>
  );
}

type NavItemProps = {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  href: string;
  isCollapsed: boolean;
};

function NavItem({ icon, label, active, href, isCollapsed }: NavItemProps) {
  return (
    <Link
      href={href}
      className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} w-full p-2 transition-colors group rounded-md ${
        active ? 'text-purple-400 font-medium bg-surface/30' : 'hover:text-purple-400 hover:bg-surface/20'
      }`}
    >
      <div className="flex items-center gap-3">
        {icon}
        {!isCollapsed && <span>{label}</span>}
      </div>
      {!isCollapsed && (
        <CaretRight size={16} className={`transition-opacity ${active ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
      )}
    </Link>
  );
}