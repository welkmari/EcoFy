"use client";

import { useState } from "react";
import { TrashIcon, FloppyDiskIcon } from "@phosphor-icons/react";
import { COVER_IMAGES, JAR_ICONS, suggestCoverImage } from "../types/JarConfig";
import type { Jar } from "../types/JarTypes"; 
import type { JarIconKey } from "../types/JarConfig";

type Props = {
  jar: Jar;
  onEdit: (id: string, data: Partial<Jar>) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
};

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
  marginBottom: 14,
};

export default function EditTab({ jar, onEdit, onDelete, onClose }: Props) {
  const [name, setName] = useState(jar.name);
  const [iconKey, setIconKey] = useState<JarIconKey>(jar.iconKey);
  const [goal, setGoal] = useState(String(jar.goal));
  const cover = jar.cover;
  const [coverImage, setCoverImage] = useState(
    jar.coverImage ?? suggestCoverImage(jar.name, jar.iconKey).image,
  );
  const [showDel, setShowDel] = useState(false);

  const save = () => {
    const g = parseFloat(goal.replace(",", "."));
    if (!name.trim() || !g || g <= 0) return;
    onEdit(jar.id, { name: name.trim(), iconKey, goal: g, cover, coverImage });
    onClose();
  };

  return (
    <div style={{ padding: 20 }}>
      <label style={lbl}>Nome</label>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={inp}
      />

      <label style={lbl}>Meta (R$)</label>
      <input
        value={goal}
        onChange={(e) => setGoal(e.target.value)}
        type="number"
        style={inp}
      />

      {/* Icon picker */}
      <label style={lbl}>Ícone</label>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(6, 1fr)",
          gap: 6,
          marginBottom: 16,
        }}
      >
        {JAR_ICONS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setIconKey(key)}
            title={label}
            style={{
              height: 44,
              borderRadius: 10,
              fontSize: 20,
              border: `1px solid ${iconKey === key ? "rgba(167,139,250,.7)" : "rgba(255,255,255,.08)"}`,
              background:
                iconKey === key
                  ? "rgba(167,139,250,.15)"
                  : "rgba(255,255,255,.04)",
              cursor: "pointer",
              transition: "all .12s",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: iconKey === key ? "#a78bfa" : "rgba(226,217,243,.4)",
            }}
          >
            <Icon size={20} weight={iconKey === key ? "fill" : "regular"} />
          </button>
        ))}
      </div>

      <label style={lbl}>Imagem de capa</label>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 6,
          marginBottom: 20,
        }}
      >
        {COVER_IMAGES.map((c) => (
          <button
            key={c.id}
            onClick={() => setCoverImage(c.image)}
            title={c.label}
            style={{
              height: 52,
              borderRadius: 10,
              border: `2px solid ${coverImage === c.image ? "#a78bfa" : "transparent"}`,
              backgroundImage: `linear-gradient(to top, rgba(0,0,0,.65), transparent), url("${c.image}")`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              cursor: "pointer",
              transition: "border .15s",
              color: "#fff",
              fontSize: 10,
              fontWeight: 800,
              display: "flex",
              alignItems: "flex-end",
              padding: 6,
            }}
          >
            {c.label}
          </button>
        ))}
      </div>
      <button
        onClick={() => setCoverImage(suggestCoverImage(name, iconKey).image)}
        style={{
          width: "100%",
          padding: 10,
          borderRadius: 12,
          border: "1px solid rgba(167,139,250,.3)",
          background: "rgba(167,139,250,.08)",
          color: "#a78bfa",
          fontSize: 12,
          fontWeight: 700,
          cursor: "pointer",
          fontFamily: "inherit",
          marginBottom: 14,
        }}
      >
        Sugerir imagem pelo nome
      </button>

      <button
        onClick={save}
        disabled={!name.trim() || !goal || parseFloat(goal) <= 0}
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
          opacity: !name.trim() || !goal || parseFloat(goal) <= 0 ? 0.35 : 1,
          marginBottom: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
        }}
      >
        <FloppyDiskIcon size={16} weight="bold" />
        Salvar alterações
      </button>

      {!showDel ? (
        <button
          onClick={() => setShowDel(true)}
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 14,
            border: "1px solid rgba(248,113,113,.3)",
            background: "rgba(248,113,113,.07)",
            color: "#f87171",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "inherit",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <TrashIcon size={15} weight="bold" />
          Excluir cofrinho
        </button>
      ) : (
        <div
          style={{
            background: "rgba(248,113,113,.08)",
            border: "1px solid rgba(248,113,113,.25)",
            borderRadius: 14,
            padding: 16,
          }}
        >
          <p
            style={{
              margin: "0 0 12px",
              fontSize: 13,
              color: "#fca5a5",
              textAlign: "center",
            }}
          >
            Excluir <strong>`{jar.name}`</strong>? Esta ação é irreversível.
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => setShowDel(false)}
              style={{
                flex: 1,
                padding: 10,
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,.1)",
                background: "none",
                color: "rgba(226,217,243,.5)",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                onDelete(jar.id);
                onClose();
              }}
              style={{
                flex: 1,
                padding: 10,
                borderRadius: 10,
                border: "none",
                background: "#dc2626",
                color: "#fff",
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Excluir
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
