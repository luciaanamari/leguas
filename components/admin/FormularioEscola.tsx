"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { Escola } from "@prisma/client";

type OrgOption = { id: string; nome: string };

type Props = {
  escola?: Escola;
  organizacoes: OrgOption[];
  organizacaoTravada?: OrgOption;
};

export default function FormularioEscola({ escola, organizacoes, organizacaoTravada }: Props) {
  const router = useRouter();
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const orgInicial =
    escola?.organizacaoId ?? organizacaoTravada?.id ?? organizacoes[0]?.id ?? "";
  const [valores, setValores] = useState({
    nome: escola?.nome ?? "",
    organizacaoId: orgInicial,
    inep: escola?.inep ?? "",
    municipio: escola?.municipio ?? "",
    ativo: escola?.ativo ?? true,
  });

  function update<K extends keyof typeof valores>(k: K, v: (typeof valores)[K]) {
    setValores((s) => ({ ...s, [k]: v }));
  }

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setErro(null);

    const url = escola ? `/api/admin/escolas/${escola.id}` : "/api/admin/escolas";
    const method = escola ? "PUT" : "POST";

    const payload = {
      ...valores,
      inep: valores.inep.trim() || null,
      municipio: valores.municipio.trim() || null,
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
      const destino = escola ? `/admin/escolas/${escola.id}` : `/admin/escolas/${data.escola.id}`;
      router.push(destino);
      router.refresh();
    } catch {
      setErro("Erro de conexão.");
      setEnviando(false);
    }
  }

  async function desativar() {
    if (!escola) return;
    if (!confirm("Tem certeza que deseja desativar essa escola?")) return;
    setEnviando(true);
    try {
      const resp = await fetch(`/api/admin/escolas/${escola.id}`, { method: "DELETE" });
      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        setErro(data.error ?? "Não foi possível desativar.");
        setEnviando(false);
        return;
      }
      router.push("/admin/escolas");
      router.refresh();
    } catch {
      setErro("Erro de conexão.");
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={enviar} className="card" noValidate style={{ maxWidth: 720 }}>
      <div>
        <label className="label" htmlFor="nome">
          Nome da escola
        </label>
        <input
          id="nome"
          className="input"
          value={valores.nome}
          onChange={(e) => update("nome", e.target.value)}
          required
        />
      </div>

      <div style={{ marginTop: "1rem" }}>
        <label className="label" htmlFor="organizacaoId">
          Organização
        </label>
        {organizacaoTravada ? (
          <>
            <input type="hidden" name="organizacaoId" value={organizacaoTravada.id} />
            <p style={{ margin: 0, padding: "0.65rem 0" }}>{organizacaoTravada.nome}</p>
            <p className="muted" style={{ margin: 0, fontSize: "0.85rem" }}>
              Vinculada à sua organização.
            </p>
          </>
        ) : (
          <select
            id="organizacaoId"
            className="select"
            value={valores.organizacaoId}
            onChange={(e) => update("organizacaoId", e.target.value)}
            required
          >
            {organizacoes.length === 0 ? (
              <option value="">Nenhuma organização ativa</option>
            ) : (
              organizacoes.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.nome}
                </option>
              ))
            )}
          </select>
        )}
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
          <label className="label" htmlFor="inep">
            INEP (opcional)
          </label>
          <input
            id="inep"
            className="input"
            value={valores.inep}
            onChange={(e) => update("inep", e.target.value)}
          />
        </div>
        <div>
          <label className="label" htmlFor="municipio">
            Município (opcional)
          </label>
          <input
            id="municipio"
            className="input"
            value={valores.municipio}
            onChange={(e) => update("municipio", e.target.value)}
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
        <label htmlFor="ativo">Escola ativa</label>
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
        {escola && (
          <button type="button" className="btn btn-ghost" onClick={desativar} disabled={enviando}>
            Desativar escola
          </button>
        )}
      </div>
    </form>
  );
}

type CriarEscolaAdminProps = { escolaId: string };

export function CriarEscolaAdmin({ escolaId }: CriarEscolaAdminProps) {
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
      const resp = await fetch(`/api/admin/escolas/${escolaId}/admins`, {
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
      <h3 style={{ margin: "0 0 1rem", fontSize: "1rem" }}>Novo admin da escola</h3>
      <form onSubmit={enviar} noValidate>
        <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "1fr 1fr" }}>
          <div>
            <label className="label" htmlFor="escola-admin-nome">
              Nome
            </label>
            <input
              id="escola-admin-nome"
              className="input"
              value={valores.nome}
              onChange={(e) => setValores((s) => ({ ...s, nome: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="label" htmlFor="escola-admin-email">
              E-mail
            </label>
            <input
              id="escola-admin-email"
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
          {enviando ? "Criando..." : "Criar ESCOLA_ADMIN"}
        </button>
      </form>
    </div>
  );
}
