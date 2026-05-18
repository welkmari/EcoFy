"use client";

import { JAR_ICONS } from "../types/JarConfig"; 
import type { Jar } from "../types/JarTypes"; 

const fmtShort = (n: number) => n.toLocaleString("pt-BR");

type Props = {
  jar: Jar;
  onClick: (jar: Jar) => void;
};

export default function SavingsCard({ jar, onClick }: Props) {
  const pct = Math.min((jar.current / jar.goal) * 100, 100);
  const done = pct >= 100;
  const iconDef = JAR_ICONS.find((i) => i.key === jar.iconKey) ?? JAR_ICONS[0];
  const Icon = iconDef.icon;

  return (
    <div
      onClick={() => onClick(jar)}
      style={{
        borderRadius: 20,
        overflow: "hidden",
        cursor: "pointer",
        border: "1px solid rgba(255,255,255,.08)",
        transition: "transform .2s, box-shadow .2s",
        boxShadow: "0 4px 24px rgba(0,0,0,.3)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,0,0,.5)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "";
        e.currentTarget.style.boxShadow = "0 4px 24px rgba(0,0,0,.3)";
      }}
    >
      {/* Cover */}
      <div
        style={{
          height: 90,
          background: jar.cover.style,
          position: "relative",
          display: "flex",
          alignItems: "flex-end",
          padding: "12px 14px",
        }}
      >
        {done && (
          <div
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              background: "rgba(0,0,0,.4)",
              backdropFilter: "blur(4px)",
              borderRadius: 20,
              padding: "3px 10px",
              fontSize: 11,
              fontWeight: 700,
              color: "#4ade80",
            }}
          >
            ✓ Meta atingida!
          </div>
        )}
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: "rgba(0,0,0,.35)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
          }}
        >
          <Icon size={20} weight="duotone" />
        </div>
      </div>

      {/* Body */}
      <div style={{ background: "#0f0e17", padding: "14px 16px" }}>
        <p
          style={{
            margin: "0 0 2px",
            fontWeight: 700,
            fontSize: 15,
            color: "#e2d9f3",
            letterSpacing: -0.2,
          }}
        >
          {jar.name}
        </p>
        <p
          style={{
            margin: "0 0 12px",
            fontSize: 12,
            color: "rgba(226,217,243,.4)",
          }}
        >
          R$ {fmtShort(jar.current)}{" "}
          <span style={{ color: "rgba(226,217,243,.25)" }}>
            / R$ {fmtShort(jar.goal)}
          </span>
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              flex: 1,
              height: 5,
              background: "rgba(255,255,255,.08)",
              borderRadius: 99,
              overflow: "hidden",
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
                transition: "width .7s cubic-bezier(.4,0,.2,1)",
              }}
            />
          </div>
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: done ? "#4ade80" : "#a78bfa",
              minWidth: 36,
              textAlign: "right",
            }}
          >
            {pct.toFixed(0)}%
          </span>
        </div>
      </div>
    </div>
  );
}
