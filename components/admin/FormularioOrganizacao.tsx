"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { Organizacao } from "@prisma/client";

type Props = { organizacao?: Organizacao };

function gerarSlug(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function FormularioOrganizacao({ organizacao }: Props) {
  const router = useRouter();
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [valores, setValores] = useState({
    nome: organizacao?.nome ?? "",
    slug: organizacao?.slug ?? "",
    cnpj: organizacao?.cnpj ?? "",
    contato: organizacao?.contato ?? "",
    ativo: organizacao?.ativo ?? true,
  });
  const [slugEditadoManualmente, setSlugEditadoManualmente] = useState(!!organizacao);

  function update<K extends keyof typeof valores>(k: K, v: (typeof valores)[K]) {
    setValores((s) => ({ ...s, [k]: v }));
  }

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setErro(null);

    const url = organizacao
      ? `/api/admin/organizacoes/${organizacao.id}`
      : "/api/admin/organizacoes";
    const method = organizacao ? "PUT" : "POST";

    const payload = {
      ...valores,
      cnpj: valores.cnpj.trim() || null,
      contato: valores.contato.trim() || null,
    };

    try {
      const resp = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        setErro(data.error ?? "Não foi possível salvar.");
        setEnviando(false);
        return;
      }
      const data = await resp.json();
      const destino = organizacao
        ? `/admin/organizacoes/${organizacao.id}`
        : `/admin/organizacoes/${data.organizacao.id}`;
      router.push(destino);
      router.refresh();
    } catch {
      setErro("Erro de conexão.");
      setEnviando(false);
    }
  }

  async function desativar() {
    if (!organizacao) return;
    if (!confirm("Tem certeza que deseja desativar essa organização?")) return;
    setEnviando(true);
    try {
      const resp = await fetch(`/api/admin/organizacoes/${organizacao.id}`, {
        method: "DELETE",
      });
      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        setErro(data.error ?? "Não foi possível desativar.");
        setEnviando(false);
        return;
      }
      router.push("/admin/organizacoes");
      router.refresh();
    } catch {
      setErro("Erro de conexão.");
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={enviar} className="card" noValidate style={{ maxWidth: 720 }}>
      <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "1fr 1fr" }}>
        <div>
          <label className="label" htmlFor="nome">
            Nome
          </label>
          <input
            id="nome"
            className="input"
            value={valores.nome}
            onChange={(e) => {
              const v = e.target.value;
              update("nome", v);
              if (!slugEditadoManualmente) update("slug", gerarSlug(v));
            }}
            required
          />
        </div>
        <div>
          <label className="label" htmlFor="slug">
            Slug
          </label>
          <input
            id="slug"
            className="input"
            value={valores.slug}
            onChange={(e) => {
              setSlugEditadoManualmente(true);
              update("slug", gerarSlug(e.target.value));
            }}
            required
          />
        </div>
      </div>

      <div
        style={{
          marginTop: "1rem",
          display: "grid",
          gap: "1rem",
          gridTemplateColumns: "1fr 1fr",
        }}
      >
        <div>
          <label className="label" htmlFor="cnpj">
            CNPJ (opcional)
          </label>
          <input
            id="cnpj"
            className="input"
            value={valores.cnpj}
            onChange={(e) => update("cnpj", e.target.value)}
          />
        </div>
        <div>
          <label className="label" htmlFor="contato">
            Contato (opcional)
          </label>
          <input
            id="contato"
            className="input"
            value={valores.contato}
            onChange={(e) => update("contato", e.target.value)}
          />
        </div>
      </div>

      <div style={{ marginTop: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <input
          id="ativo"
          type="checkbox"
          checked={valores.ativo}
          onChange={(e) => update("ativo", e.target.checked)}
        />
        <label htmlFor="ativo">Organização ativa</label>
      </div>

      {erro && (
        <p className="error" style={{ marginTop: "1rem" }}>
          {erro}
        </p>
      )}

      <div
        style={{
          marginTop: "2rem",
          display: "flex",
          gap: "0.75rem",
          justifyContent: "space-between",
          flexWrap: "wrap",
        }}
      >
        <button type="submit" className="btn btn-primary" disabled={enviando}>
          {enviando ? "Salvando..." : "Salvar"}
        </button>
        {organizacao && (
          <button type="button" className="btn btn-ghost" onClick={desativar} disabled={enviando}>
            Desativar organização
          </button>
        )}
      </div>
    </form>
  );
}

type CriarOrgAdminProps = { organizacaoId: string };

export function CriarOrgAdminOrganizacao({ organizacaoId }: CriarOrgAdminProps) {
  const router = useRouter();
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [senhaTemporaria, setSenhaTemporaria] = useState<string | null>(null);
  const [valores, setValores] = useState({ nome: "", email: "" });

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setErro(null);
    setSenhaTemporaria(null);

    try {
      const resp = await fetch(`/api/admin/organizacoes/${organizacaoId}/admins`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(valores),
      });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        setErro(data.error ?? "Não foi possível criar o admin.");
        setEnviando(false);
        return;
      }
      setSenhaTemporaria(data.senhaTemporaria);
      setValores({ nome: "", email: "" });
      router.refresh();
    } catch {
      setErro("Erro de conexão.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="card" style={{ marginTop: "1rem" }}>
      <h3 style={{ margin: "0 0 1rem", fontSize: "1rem" }}>Novo admin da organização</h3>
      <form onSubmit={enviar} noValidate>
        <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "1fr 1fr" }}>
          <div>
            <label className="label" htmlFor="admin-nome">
              Nome
            </label>
            <input
              id="admin-nome"
              className="input"
              value={valores.nome}
              onChange={(e) => setValores((s) => ({ ...s, nome: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="label" htmlFor="admin-email">
              E-mail
            </label>
            <input
              id="admin-email"
              className="input"
              type="email"
              value={valores.email}
              onChange={(e) => setValores((s) => ({ ...s, email: e.target.value }))}
              required
            />
          </div>
        </div>
        {erro && (
          <p className="error" style={{ marginTop: "0.75rem" }}>
            {erro}
          </p>
        )}
        {senhaTemporaria && (
          <div
            style={{
              marginTop: "0.75rem",
              padding: "0.75rem",
              border: "2px solid var(--color-accent)",
              borderRadius: "0.4rem",
            }}
          >
            <p className="muted" style={{ margin: 0, fontSize: "0.85rem" }}>
              Senha temporária (mostre uma única vez):
            </p>
            <p style={{ fontSize: "1.4rem", letterSpacing: "0.15em", margin: "0.5rem 0 0" }}>
              <code>{senhaTemporaria}</code>
            </p>
          </div>
        )}
        <button
          type="submit"
          className="btn btn-secondary"
          style={{ marginTop: "1rem" }}
          disabled={enviando}
        >
          {enviando ? "Criando..." : "Criar ORG_ADMIN"}
        </button>
      </form>
    </div>
  );
}
