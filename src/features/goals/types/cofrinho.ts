import { Icon } from '@phosphor-icons/react';

export type Cofrinho = {
  id: number;
  title: string;
  current: number;
  total: number;
  icon: Icon;
};

export type ModalState =
  | { open: false }
  | { open: true; mode: 'deposit'; cofrinhoId: number }
  | { open: true; mode: 'create' };