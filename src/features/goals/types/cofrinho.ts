import type { Icon } from '@phosphor-icons/react';
import type { CofrinhoIconKey } from '../icons';

export type Cofrinho = {
  id: string;
  title: string;
  current: number;
  total: number;
  iconKey: CofrinhoIconKey;
  icon: Icon;
};

export type ModalState =
  | { open: false }
  | { open: true; mode: 'deposit'; cofrinhoId: string }
  | { open: true; mode: 'create' }
  | { open: true; mode: 'edit'; cofrinhoId: string }
  | { open: true; mode: 'delete'; cofrinhoId: string };