export type VisualTransactionStatus = "pago" | "pendente" | "agendado";

export function getStatusTransacao(
  dataVencimento: string,
  dataPagamento?: string | null,
): VisualTransactionStatus {
  if (dataPagamento) return "pago";

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dueDate = new Date(`${dataVencimento}T00:00:00`);
  return dueDate < today ? "pendente" : "agendado";
}

export function getMonthLabel(month: string) {
  const [year, monthIndex] = month.split("-").map(Number);
  return new Date(year, (monthIndex || 1) - 1, 1).toLocaleString("pt-BR", {
    month: "long",
  });
}

export function getMonthBadge(month: string) {
  const current = new Date().toISOString().slice(0, 7);
  if (month === current) return "Mês atual";
  return month > current ? "Mês futuro" : "Histórico";
}
