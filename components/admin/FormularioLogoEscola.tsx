"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  escolaId: string;
  logoUrl: string | null;
};

export default function FormularioLogoEscola({ escolaId, logoUrl }: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function enviar(arquivo: File) {
    setErro(null);
    setEnviando(true);
    try {
      const fd = new FormData();
      fd.append("logo", arquivo);
      const res = await fetch(`/api/admin/escolas/${escolaId}/logo`, {
        method: "POST",
        body: fd,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErro(data.error ?? "Não foi possível enviar o logo.");
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
      const res = await fetch(`/api/admin/escolas/${escolaId}/logo`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErro(data.error ?? "Não foi possível remover o logo.");
        return;
      }
      router.refresh();
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="card">
      <p className="muted" style={{ margin: "0 0 0.5rem", fontSize: "0.85rem" }}>
        Logo da escola · PNG, JPG ou SVG · máx. 5 MB · máx. 800×800 px. Tem prioridade sobre o
        logo da organização nas telas desta escola.
      </p>

      {logoUrl && (
        <div style={{ marginBottom: "0.75rem" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logoUrl}
            alt="Logo atual da escola"
            width={80}
            height={80}
            style={{ objectFit: "contain", border: "1px solid var(--color-border)", borderRadius: 8, padding: 4, background: "#fff" }}
          />
        </div>
      )}

      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
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
        {logoUrl && (
          <button
            type="button"
            className="btn btn-ghost"
            style={{ fontSize: "0.85rem", padding: "0.35rem 0.7rem", color: "var(--color-danger)" }}
            disabled={enviando}
            onClick={remover}
          >
            Remover logo
          </button>
        )}
      </div>

      {enviando && <p className="muted" style={{ marginTop: "0.5rem" }}>Enviando…</p>}
      {erro && <p className="error" style={{ marginTop: "0.5rem" }}>{erro}</p>}
    </div>
  );
}
