"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function FotoPerfil({ fotoUrl }: { fotoUrl: string | null }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function enviar(arquivo: File) {
    setErro(null);
    setEnviando(true);
    try {
      const fd = new FormData();
      fd.append("foto", arquivo);
      const res = await fetch("/api/estudantes/me/foto", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErro(data.error ?? "Não foi possível enviar a foto.");
        return;
      }
      router.refresh();
    } finally {
      setEnviando(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function remover() {
    setErro(null);
    setEnviando(true);
    try {
      const res = await fetch("/api/estudantes/me/foto", { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErro(data.error ?? "Não foi possível remover a foto.");
        return;
      }
      router.refresh();
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: "50%",
          overflow: "hidden",
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {fotoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={fotoUrl}
            alt="Sua foto de perfil"
            width={80}
            height={80}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <span className="muted" style={{ fontSize: "0.7rem", textAlign: "center" }}>
            sem foto
          </span>
        )}
      </div>

      <div>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/svg+xml"
          disabled={enviando}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) enviar(f);
          }}
        />
        <div style={{ marginTop: "0.35rem", display: "flex", gap: "0.75rem", alignItems: "center" }}>
          {enviando && <span className="muted" style={{ fontSize: "0.82rem" }}>Enviando…</span>}
          {fotoUrl && !enviando && (
            <button
              type="button"
              onClick={remover}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--color-danger)",
                fontSize: "0.82rem",
                padding: 0,
              }}
            >
              Remover foto
            </button>
          )}
        </div>
        {erro && <p className="error" style={{ marginTop: "0.35rem" }}>{erro}</p>}
      </div>
    </div>
  );
}
