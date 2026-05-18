"use client";

import { useState } from "react";
import {
  ArrowUpIcon,
  ArrowDownIcon,
  CheckCircleIcon,
  ClockIcon,
  ChartBarIcon,
  PencilSimpleIcon,
  XIcon,
} from "@phosphor-icons/react";
import ProgressRing from "./ProgressRing";
import EditTab from "./EditTab";
import type { Jar } from "../types/JarTypes";
import { JAR_ICONS } from "../types/JarConfig";

const fmt = (n: number) =>
  n.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
const fmtShort = (n: number) => n.toLocaleString("pt-BR");
const dateStr = (iso: string) =>
  new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
const timeStr = (iso: string) =>
  new Date(iso).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

type Props = {
  jar: Jar;
  onClose: () => void;
  onDeposit: (id: string, amount: number, note: string) => void;
  onWithdraw: (id: string, amount: number) => void;
  onEdit: (id: string, data: Partial<Jar>) => void;
  onDelete: (id: string) => void;
};

const TABS = [
  { id: "overview", label: "Visão Geral", icon: ChartBarIcon },
  { id: "depositar", label: "Depositar", icon: ArrowUpIcon },
  { id: "historico", label: "Histórico", icon: ClockIcon },
  { id: "editar", label: "Editar", icon: PencilSimpleIcon },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function DetailModal({
  jar,
  onClose,
  onDeposit,
  onWithdraw,
  onEdit,
  onDelete,
}: Props) {
  const [tab, setTab] = useState<TabId>("overview");
  const [depAmount, setDepAmount] = useState("");
  const [depNote, setDepNote] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");

  const pct = Math.min((jar.current / jar.goal) * 100, 100);
  const falta = Math.max(jar.goal - jar.current, 0);
  const done = pct >= 100;

  const iconDef = JAR_ICONS.find((i) => i.key === jar.iconKey) ?? JAR_ICONS[0];
  const Icon = iconDef.icon;

  const totalDeposited = jar.history
    .filter((h) => h.amount > 0)
    .reduce((a, b) => a + b.amount, 0);
  const totalWithdrawn = jar.history
    .filter((h) => h.amount < 0)
    .reduce((a, b) => a + Math.abs(b.amount), 0);
  const deposits = jar.history.filter((h) => h.amount > 0);
  const avgDeposit = deposits.length ? totalDeposited / deposits.length : 0;

  const handleDeposit = () => {
    const n = parseFloat(depAmount.replace(",", "."));
    if (!n || n <= 0) return;
    onDeposit(jar.id, n, depNote.trim());
    setDepAmount("");
    setDepNote("");
  };

  const handleWithdraw = () => {
    const n = parseFloat(withdrawAmount.replace(",", "."));
    if (!n || n <= 0 || n > jar.current) return;
    onWithdraw(jar.id, n);
    setWithdrawAmount("");
  };

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.75)",
        backdropFilter: "blur(6px)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 480,
          background: "#0f0e17",
          border: "1px solid rgba(255,255,255,.1)",
          borderRadius: 24,
          overflow: "hidden",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          animation: "zoomIn .2s ease",
        }}
      >
        {/* Cover Header */}
        <div
          style={{
            height: 120,
            background: jar.cover.style,
            position: "relative",
            flexShrink: 0,
          }}
        >
          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: 12,
              right: 12,
              background: "rgba(0,0,0,.4)",
              backdropFilter: "blur(4px)",
              border: "none",
              borderRadius: 10,
              width: 32,
              height: 32,
              color: "#fff",
              fontSize: 16,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <XIcon size={16} weight="bold" />
          </button>
          <div
            style={{
              position: "absolute",
              bottom: 14,
              left: 16,
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                background: "rgba(0,0,0,.35)",
                backdropFilter: "blur(4px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                border: "1px solid rgba(255,255,255,.2)",
              }}
            >
              <Icon size={26} weight="duotone" />
            </div>
            <div>
              <p
                style={{
                  margin: 0,
                  fontWeight: 800,
                  fontSize: 18,
                  color: "#fff",
                  textShadow: "0 1px 8px rgba(0,0,0,.6)",
                }}
              >
                {jar.name}
              </p>
              {done && (
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#4ade80",
                    background: "rgba(0,0,0,.4)",
                    padding: "2px 8px",
                    borderRadius: 99,
                  }}
                >
                  ✓ Meta atingida!
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div
          style={{
            display: "flex",
            borderBottom: "1px solid rgba(255,255,255,.06)",
            flexShrink: 0,
          }}
        >
          {TABS.map(({ id, label, icon: TabIcon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              style={{
                flex: 1,
                padding: "12px 4px",
                background: "none",
                border: "none",
                color: tab === id ? "#a78bfa" : "rgba(226,217,243,.4)",
                fontSize: 11,
                fontWeight: tab === id ? 700 : 400,
                cursor: "pointer",
                borderBottom:
                  tab === id ? "2px solid #a78bfa" : "2px solid transparent",
                transition: "all .15s",
                fontFamily: "inherit",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
              }}
            >
              <TabIcon size={16} weight={tab === id ? "fill" : "regular"} />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ overflowY: "auto", flex: 1 }}>
          {/* OVERVIEW */}
          {tab === "overview" && (
            <div style={{ padding: 20 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 20,
                }}
              >
                <div>
                  <p
                    style={{
                      margin: "0 0 2px",
                      fontSize: 12,
                      color: "rgba(226,217,243,.4)",
                      textTransform: "uppercase",
                      letterSpacing: 1,
                    }}
                  >
                    Progresso
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 28,
                      fontWeight: 800,
                      color: "#e2d9f3",
                    }}
                  >
                    R$ {fmtShort(jar.current)}
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 400,
                        color: "rgba(226,217,243,.4)",
                      }}
                    >
                      {" "}
                      / R$ {fmtShort(jar.goal)}
                    </span>
                  </p>
                </div>
                <div style={{ position: "relative", width: 80, height: 80 }}>
                  <ProgressRing
                    pct={pct}
                    size={80}
                    stroke={7}
                    color={done ? "#4ade80" : "#a78bfa"}
                  />
                  <span
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 14,
                      fontWeight: 800,
                      color: done ? "#4ade80" : "#a78bfa",
                    }}
                  >
                    {pct.toFixed(0)}%
                  </span>
                </div>
              </div>

              <div
                style={{
                  height: 8,
                  background: "rgba(255,255,255,.07)",
                  borderRadius: 99,
                  overflow: "hidden",
                  marginBottom: 6,
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${pct}%`,
                    borderRadius: 99,
                    background: done
                      ? "#4ade80"
                      : "linear-gradient(90deg,#a78bfa,#67e8f9)",
                    transition: "width .8s cubic-bezier(.4,0,.2,1)",
                  }}
                />
              </div>
              {falta > 0 && (
                <p
                  style={{
                    margin: "0 0 20px",
                    fontSize: 12,
                    color: "rgba(226,217,243,.4)",
                    textAlign: "right",
                  }}
                >
                  faltam R$ {fmtShort(falta)}
                </p>
              )}

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                  marginBottom: 16,
                }}
              >
                {[
                  {
                    label: "Total depositado",
                    val: `R$ ${fmt(totalDeposited)}`,
                    color: "#a78bfa",
                    Icon: ArrowUpIcon,
                  },
                  {
                    label: "Total retirado",
                    val: `R$ ${fmt(totalWithdrawn)}`,
                    color: "#f87171",
                    Icon: ArrowDownIcon,
                  },
                  {
                    label: "Depósito médio",
                    val: `R$ ${fmt(avgDeposit)}`,
                    color: "#67e8f9",
                    Icon: ChartBarIcon,
                  },
                  {
                    label: "Nº de depósitos",
                    val: deposits.length,
                    color: "#4ade80",
                    Icon: CheckCircleIcon,
                  },
                ].map((s) => (
                  <div
                    key={s.label}
                    style={{
                      background: "rgba(255,255,255,.04)",
                      borderRadius: 14,
                      padding: "14px 16px",
                      border: "1px solid rgba(255,255,255,.06)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        marginBottom: 6,
                      }}
                    >
                      <s.Icon size={13} color={s.color} weight="fill" />
                      <p
                        style={{
                          margin: 0,
                          fontSize: 10,
                          color: "rgba(226,217,243,.4)",
                          textTransform: "uppercase",
                          letterSpacing: 0.8,
                        }}
                      >
                        {s.label}
                      </p>
                    </div>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 18,
                        fontWeight: 700,
                        color: s.color,
                      }}
                    >
                      {s.val}
                    </p>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setTab("depositar")}
                style={{
                  width: "100%",
                  padding: 13,
                  borderRadius: 14,
                  border: "none",
                  background: "linear-gradient(135deg,#7c3aed,#a78bfa)",
                  color: "#fff",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "opacity .15s",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = ".85")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                <ArrowUpIcon size={16} weight="bold" />
                Fazer depósito
              </button>
            </div>
          )}

          {/* DEPOSITAR */}
          {tab === "depositar" && (
            <div style={{ padding: 20 }}>
              <p
                style={{
                  margin: "0 0 16px",
                  fontSize: 13,
                  color: "rgba(226,217,243,.5)",
                }}
              >
                Saldo atual:{" "}
                <strong style={{ color: "#e2d9f3" }}>
                  R$ {fmt(jar.current)}
                </strong>
              </p>

              <label style={lbl}>Valor</label>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  background: "rgba(255,255,255,.05)",
                  border: "1px solid rgba(255,255,255,.1)",
                  borderRadius: 12,
                  padding: "10px 14px",
                  marginBottom: 10,
                }}
              >
                <span
                  style={{
                    color: "rgba(226,217,243,.4)",
                    fontWeight: 700,
                    fontSize: 14,
                  }}
                >
                  R$
                </span>
                <input
                  value={depAmount}
                  onChange={(e) => setDepAmount(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleDeposit()}
                  type="number"
                  placeholder="0,00"
                  style={{
                    background: "none",
                    border: "none",
                    outline: "none",
                    color: "#e2d9f3",
                    fontSize: 18,
                    fontWeight: 700,
                    width: "100%",
                    fontFamily: "inherit",
                  }}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 6,
                  marginBottom: 14,
                  flexWrap: "wrap",
                }}
              >
                {[50, 100, 200, 500, 1000].map((v) => (
                  <button
                    key={v}
                    onClick={() => setDepAmount(String(v))}
                    style={{
                      padding: "5px 12px",
                      borderRadius: 99,
                      border: "1px solid rgba(167,139,250,.3)",
                      background: "transparent",
                      color: "#a78bfa",
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      transition: "all .15s",
                    }}
                    onMouseEnter={(e) => {
                      (e.target as HTMLButtonElement).style.background =
                        "rgba(167,139,250,.15)";
                    }}
                    onMouseLeave={(e) => {
                      (e.target as HTMLButtonElement).style.background =
                        "transparent";
                    }}
                  >
                    +{v}
                  </button>
                ))}
              </div>

              <label style={lbl}>Anotação (opcional)</label>
              <input
                value={depNote}
                onChange={(e) => setDepNote(e.target.value)}
                placeholder="Ex: Bônus, freelance, mesada..."
                style={{ ...inp, marginBottom: 16 }}
              />

              <button
                onClick={handleDeposit}
                disabled={!depAmount || parseFloat(depAmount) <= 0}
                style={{
                  width: "100%",
                  padding: 13,
                  borderRadius: 14,
                  border: "none",
                  background: "linear-gradient(135deg,#7c3aed,#a78bfa)",
                  color: "#fff",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  opacity: !depAmount || parseFloat(depAmount) <= 0 ? 0.35 : 1,
                  transition: "opacity .15s",
                }}
              >
                Confirmar depósito
              </button>

              <div
                style={{
                  borderTop: "1px solid rgba(255,255,255,.06)",
                  marginTop: 20,
                  paddingTop: 20,
                }}
              >
                <p
                  style={{
                    margin: "0 0 10px",
                    fontSize: 12,
                    color: "rgba(226,217,243,.4)",
                    textTransform: "uppercase",
                    letterSpacing: 1,
                  }}
                >
                  Retirar valor
                </p>
                <div style={{ display: "flex", gap: 8 }}>
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      background: "rgba(255,255,255,.05)",
                      border: "1px solid rgba(248,113,113,.2)",
                      borderRadius: 12,
                      padding: "10px 14px",
                    }}
                  >
                    <span
                      style={{
                        color: "rgba(248,113,113,.5)",
                        fontWeight: 700,
                        fontSize: 14,
                      }}
                    >
                      R$
                    </span>
                    <input
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      type="number"
                      placeholder="0,00"
                      style={{
                        background: "none",
                        border: "none",
                        outline: "none",
                        color: "#f87171",
                        fontSize: 14,
                        fontWeight: 700,
                        width: "100%",
                        fontFamily: "inherit",
                      }}
                    />
                  </div>
                  <button
                    onClick={handleWithdraw}
                    disabled={
                      !withdrawAmount ||
                      parseFloat(withdrawAmount) <= 0 ||
                      parseFloat(withdrawAmount) > jar.current
                    }
                    style={{
                      padding: "10px 16px",
                      borderRadius: 12,
                      border: "1px solid rgba(248,113,113,.3)",
                      background: "rgba(248,113,113,.1)",
                      color: "#f87171",
                      fontWeight: 700,
                      fontSize: 13,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      opacity:
                        !withdrawAmount ||
                        parseFloat(withdrawAmount) <= 0 ||
                        parseFloat(withdrawAmount) > jar.current
                          ? 0.35
                          : 1,
                    }}
                  >
                    Retirar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* HISTÓRICO */}
          {tab === "historico" && (
            <div style={{ padding: 20 }}>
              {jar.history.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "40px 0",
                    color: "rgba(226,217,243,.3)",
                  }}
                >
                  <ClockIcon
                    size={40}
                    style={{ marginBottom: 8, opacity: 0.3 }}
                  />
                  <p style={{ margin: 0, fontSize: 14 }}>
                    Nenhuma movimentação ainda
                  </p>
                </div>
              ) : (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 8 }}
                >
                  {[...jar.history].reverse().map((h) => (
                    <div
                      key={h.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        background: "rgba(255,255,255,.04)",
                        borderRadius: 14,
                        padding: "12px 14px",
                        border: `1px solid ${h.amount > 0 ? "rgba(167,139,250,.1)" : "rgba(248,113,113,.1)"}`,
                      }}
                    >
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 10,
                          flexShrink: 0,
                          background:
                            h.amount > 0
                              ? "rgba(167,139,250,.15)"
                              : "rgba(248,113,113,.15)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {h.amount > 0 ? (
                          <ArrowUpIcon
                            size={16}
                            color="#a78bfa"
                            weight="bold"
                          />
                        ) : (
                          <ArrowDownIcon
                            size={16}
                            color="#f87171"
                            weight="bold"
                          />
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p
                          style={{
                            margin: "0 0 2px",
                            fontSize: 13,
                            fontWeight: 600,
                            color: "#e2d9f3",
                          }}
                        >
                          {h.note || (h.amount > 0 ? "Depósito" : "Retirada")}
                        </p>
                        <p
                          style={{
                            margin: 0,
                            fontSize: 11,
                            color: "rgba(226,217,243,.35)",
                          }}
                        >
                          {dateStr(h.date)} · {timeStr(h.date)}
                        </p>
                      </div>
                      <span
                        style={{
                          fontSize: 15,
                          fontWeight: 800,
                          color: h.amount > 0 ? "#a78bfa" : "#f87171",
                          flexShrink: 0,
                        }}
                      >
                        {h.amount > 0 ? "+" : ""}R$ {fmt(Math.abs(h.amount))}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* EDITAR */}
          {tab === "editar" && (
            <EditTab
              jar={jar}
              onEdit={onEdit}
              onDelete={onDelete}
              onClose={onClose}
            />
          )}
        </div>
      </div>
    </div>
  );
}

const lbl: React.CSSProperties = {
  display: "block",
  fontSize: 11,
  color: "rgba(226,217,243,.4)",
  textTransform: "uppercase",
  letterSpacing: 1,
  marginBottom: 6,
};
const inp: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  background: "rgba(255,255,255,.05)",
  border: "1px solid rgba(255,255,255,.1)",
  borderRadius: 12,
  padding: "10px 14px",
  color: "#e2d9f3",
  fontSize: 14,
  outline: "none",
  fontFamily: "inherit",
};
