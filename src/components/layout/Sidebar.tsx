'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Search, LayoutDashboard, Users,
  DollarSign, Settings, ChevronRight,
  LogOut, ArrowUpCircle, ArrowDownCircle, BellRing, Wallet,
  Menu, ChevronLeft, CreditCard, Zap, Target
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
    <div>
      <Logo isCollapsed={isCollapsed} />
    </div>
  );
}