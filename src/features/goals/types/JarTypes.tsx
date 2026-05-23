import type { CoverOption, JarIconKey } from "./JarConfig";

export type HistoryEntry = {
  id: string;
  amount: number;
  note: string;
  date: string;
};

export type Jar = {
  id: string;
  name: string;
  iconKey: JarIconKey;
  cover: CoverOption;
  coverImage?: string;
  goal: number;
  current: number;
  targetMonth?: string;
  history: HistoryEntry[];
};
