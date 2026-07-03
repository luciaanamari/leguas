"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import QrCodeLink from "./QrCodeLink";

export type LinkItem = {
  id: string;
  slug: string;
  rotulo: string | null;
  ativo: boolean;
  permanente: boolean;
};

type Props = {
  escolaId: string;
  baseUrl: string;
  link: LinkItem;
};

function urlDoLink(baseUrl: string, slug: string): string {
  const raiz = baseUrl.replace(/\/+$/, "");
  return `${raiz}/e/${slug}`;
}

export default function GestaoLinks({ baseUrl, link }: Props) {
  const router = useRouter();
  // Em runtime usamos o host real (localhost em dev, domínio em prod);
  // baseUrl do server é só o valor inicial para o primeiro render.
  const [origin, setOrigin] = useState(baseUrl);
  useEffect(() => {
    if (typeof window !== "undefined") setOrigin(window.location.origin);
  }, []);

  const [erro, setErro] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);
  const [processando, setProcessando] = useState(false);

  const url = urlDoLink(origin, link.slug);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      setErro("Não foi possível copiar. Copie manualmente.");
    }
  }

  async function alternarCadastro() {
    setErro(null);
    setProcessando(true);
    try {
      const res = await fetch(`/api/admin/links/${link.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ativo: !link.ativo }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErro(data.error ?? "Não foi possível atualizar.");
        return;
      }
      router.refresh();
    } finally {
      setProcessando(false);
    }
  }

  return (
    <div className="card">
      {erro && (
        <p className="error" style={{ marginBottom: "0.75rem" }}>
          {erro}
        </p>
      )}

      <p className="muted" style={{ margin: "0 0 0.25rem", fontSize: "0.8rem" }}>
        Link de cadastro da escola
      </p>
      <p style={{ margin: 0, wordBreak: "break-all", fontWeight: 600 }}>{url}</p>

      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap", marginTop: "0.75rem" }}>
        <button
          type="button"
          className="btn btn-secondary"
          style={{ fontSize: "0.85rem", padding: "0.35rem 0.7rem" }}
          onClick={copiar}
        >
          {copiado ? "Copiado!" : "Copiar link"}
        </button>
      </div>

      <div style={{ marginTop: "0.75rem" }}>
        <QrCodeLink url={url} titulo="Cadastro da escola" />
      </div>

      <hr
        style={{
          border: "none",
          borderTop: "1px solid var(--color-border)",
          margin: "1rem 0",
        }}
      />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "1rem",
          flexWrap: "wrap",
        }}
      >
        <div>
          <strong>Novos cadastros</strong>
          <p className="muted" style={{ margin: "0.15rem 0 0", fontSize: "0.85rem" }}>
            {link.ativo
              ? "Abertos — o link aceita novos alunos."
              : "Fechados — o link só permite login de quem já tem cadastro."}
          </p>
        </div>
        <button
          type="button"
          className={link.ativo ? "btn btn-ghost" : "btn btn-primary"}
          style={{ fontSize: "0.9rem", whiteSpace: "nowrap" }}
          disabled={processando}
          onClick={alternarCadastro}
        >
          {processando ? "..." : link.ativo ? "Fechar cadastros" : "Abrir cadastros"}
        </button>
      </div>
    </div>
  );
}
