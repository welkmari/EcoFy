export const formatBrl = (value: number) =>
  `R$ ${value.toLocaleString("pt-BR")}`;

export const formatCompactBrl = (value: number) =>
  value >= 1000 ? `R$ ${(value / 1000).toFixed(1)}k` : formatBrl(value);
