"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { Profissao } from "@prisma/client";

type Trilha = { id: string; titulo: string };

type Props = {
  profissao?: Profissao;
  trilhas: Trilha[];
};

export default function FormularioProfissao({ profissao, trilhas }: Props) {
  const router = useRouter();
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [valores, setValores] = useState({
    nome: profissao?.nome ?? "",
    descricao: profissao?.descricao ?? "",
    trilhaId: profissao?.trilhaId ?? trilhas[0]?.id ?? "",
    ativo: profissao?.ativo ?? true,
  });

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setErro(null);
    const url = profissao ? `/api/admin/profissoes/${profissao.id}` : "/api/admin/profissoes";
    const method = profissao ? "PUT" : "POST";
    try {
      const resp = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(valores),
      });
      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        setErro(data.error ?? "Erro ao salvar.");
        setEnviando(false);
        return;
      }
      router.push("/admin/profissoes");
      router.refresh();
    } catch {
      setErro("Erro de conexão.");
      setEnviando(false);
    }
  }

  async function desativar() {
    if (!profissao) return;
    if (!confirm("Desativar essa profissão?")) return;
    setEnviando(true);
    try {
      const resp = await fetch(`/api/admin/profissoes/${profissao.id}`, { method: "DELETE" });
      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        setErro(data.error ?? "Erro");
        setEnviando(false);
        return;
      }
      router.push("/admin/profissoes");
      router.refresh();
    } catch {
      setErro("Erro de conexão.");
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={enviar} className="card" noValidate style={{ maxWidth: 640 }}>
      <label className="label" htmlFor="nome">
        Nome
      </label>
      <input
        id="nome"
        className="input"
        value={valores.nome}
        onChange={(e) => setValores((s) => ({ ...s, nome: e.target.value }))}
        required
      />

      <label className="label" htmlFor="desc" style={{ marginTop: "1rem" }}>
        Descrição
      </label>
      <textarea
        id="desc"
        className="textarea"
        rows={3}
        value={valores.descricao}
        onChange={(e) => setValores((s) => ({ ...s, descricao: e.target.value }))}
        required
      />

      <label className="label" htmlFor="trilha" style={{ marginTop: "1rem" }}>
        Trilha associada
      </label>
      <select
        id="trilha"
        className="select"
        value={valores.trilhaId}
        onChange={(e) => setValores((s) => ({ ...s, trilhaId: e.target.value }))}
      >
        {trilhas.map((t) => (
          <option key={t.id} value={t.id}>
            {t.titulo}
          </option>
        ))}
      </select>

      <div style={{ marginTop: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <input
          id="ativo"
          type="checkbox"
          checked={valores.ativo}
          onChange={(e) => setValores((s) => ({ ...s, ativo: e.target.checked }))}
        />
        <label htmlFor="ativo">Ativa</label>
      </div>

      {erro && (
        <p className="error" style={{ marginTop: "1rem" }}>
          {erro}
        </p>
      )}

      <div
        style={{
          marginTop: "1.5rem",
          display: "flex",
          gap: "0.75rem",
          flexWrap: "wrap",
          justifyContent: "space-between",
        }}
      >
        <button type="submit" className="btn btn-primary" disabled={enviando}>
          {enviando ? "Salvando..." : "Salvar"}
        </button>
        {profissao && (
          <button type="button" className="btn btn-ghost" onClick={desativar} disabled={enviando}>
            Desativar
          </button>
        )}
      </div>
    </form>
  );
}
