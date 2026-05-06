const brlFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const compactFormatter = new Intl.NumberFormat("pt-BR", {
  notation: "compact",
  compactDisplay: "short",
  maximumFractionDigits: 1,
});

export const formatBrl = (value: number) => brlFormatter.format(Number(value) || 0);

export const formatCompactBrl = (value: number) =>
  value >= 1000
    ? `R$ ${compactFormatter.format(Number(value) || 0)}`
    : formatBrl(value);
