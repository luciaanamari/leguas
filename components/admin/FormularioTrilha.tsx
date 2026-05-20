"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { Trilha } from "@prisma/client";

type Props = { trilha?: Trilha };

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

export default function FormularioTrilha({ trilha }: Props) {
  const router = useRouter();
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [valores, setValores] = useState({
    slug: trilha?.slug ?? "",
    titulo: trilha?.titulo ?? "",
    modalidade: trilha?.modalidade ?? "PRESENCIAL",
    descricaoCurta: trilha?.descricaoCurta ?? "",
    descricaoCompleta: trilha?.descricaoCompleta ?? "",
    comoEntrar: trilha?.comoEntrar ?? "",
    duracao: trilha?.duracao ?? "",
    custoEstimado: trilha?.custoEstimado ?? "",
    primeirosPassos: trilha?.primeirosPassos ?? "",
    ordem: trilha?.ordem ?? 0,
    ativo: trilha?.ativo ?? true,
  });
  const [slugEditadoManualmente, setSlugEditadoManualmente] = useState(!!trilha);

  function update<K extends keyof typeof valores>(k: K, v: (typeof valores)[K]) {
    setValores((s) => ({ ...s, [k]: v }));
  }

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setErro(null);

    const url = trilha ? `/api/admin/trilhas/${trilha.id}` : "/api/admin/trilhas";
    const method = trilha ? "PUT" : "POST";

    try {
      const resp = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(valores),
      });
      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        setErro(data.error ?? "Não foi possível salvar.");
        setEnviando(false);
        return;
      }
      router.push("/admin/trilhas");
      router.refresh();
    } catch {
      setErro("Erro de conexão.");
      setEnviando(false);
    }
  }

  async function desativar() {
    if (!trilha) return;
    if (!confirm("Tem certeza que deseja desativar essa trilha?")) return;
    setEnviando(true);
    try {
      const resp = await fetch(`/api/admin/trilhas/${trilha.id}`, { method: "DELETE" });
      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        setErro(data.error ?? "Não foi possível desativar.");
        setEnviando(false);
        return;
      }
      router.push("/admin/trilhas");
      router.refresh();
    } catch {
      setErro("Erro de conexão.");
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={enviar} className="card" noValidate style={{ maxWidth: 820 }}>
      <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "1fr 1fr" }}>
        <div>
          <label className="label" htmlFor="titulo">
            Título
          </label>
          <input
            id="titulo"
            className="input"
            value={valores.titulo}
            onChange={(e) => {
              const v = e.target.value;
              update("titulo", v);
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

      <div style={{ marginTop: "1rem", display: "grid", gap: "1rem", gridTemplateColumns: "1fr 1fr" }}>
        <div>
          <label className="label" htmlFor="modalidade">
            Modalidade
          </label>
          <select
            id="modalidade"
            className="select"
            value={valores.modalidade}
            onChange={(e) => update("modalidade", e.target.value as typeof valores.modalidade)}
          >
            <option value="PRESENCIAL">Presencial</option>
            <option value="EAD">EAD</option>
            <option value="TECNICO">Técnico</option>
            <option value="CONCURSO">Concurso</option>
            <option value="MERCADO">Mercado</option>
          </select>
        </div>
        <div>
          <label className="label" htmlFor="ordem">
            Ordem de exibição
          </label>
          <input
            id="ordem"
            className="input"
            type="number"
            min={0}
            value={valores.ordem}
            onChange={(e) => update("ordem", Number(e.target.value))}
          />
        </div>
      </div>

      <Bloco label="Descrição curta (até 240 caracteres)">
        <input
          className="input"
          maxLength={240}
          value={valores.descricaoCurta}
          onChange={(e) => update("descricaoCurta", e.target.value)}
          required
        />
      </Bloco>

      <Bloco label="Descrição completa">
        <textarea
          className="textarea"
          rows={5}
          value={valores.descricaoCompleta}
          onChange={(e) => update("descricaoCompleta", e.target.value)}
          required
        />
      </Bloco>

      <Bloco label="Como entrar">
        <textarea
          className="textarea"
          rows={3}
          value={valores.comoEntrar}
          onChange={(e) => update("comoEntrar", e.target.value)}
          required
        />
      </Bloco>

      <div style={{ marginTop: "1rem", display: "grid", gap: "1rem", gridTemplateColumns: "1fr 1fr" }}>
        <div>
          <label className="label" htmlFor="duracao">
            Duração
          </label>
          <input
            id="duracao"
            className="input"
            value={valores.duracao}
            onChange={(e) => update("duracao", e.target.value)}
            required
          />
        </div>
        <div>
          <label className="label" htmlFor="custo">
            Custo estimado
          </label>
          <input
            id="custo"
            className="input"
            value={valores.custoEstimado}
            onChange={(e) => update("custoEstimado", e.target.value)}
            required
          />
        </div>
      </div>

      <Bloco label="Primeiros passos">
        <textarea
          className="textarea"
          rows={2}
          value={valores.primeirosPassos}
          onChange={(e) => update("primeirosPassos", e.target.value)}
          required
        />
      </Bloco>

      <div style={{ marginTop: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <input
          id="ativo"
          type="checkbox"
          checked={valores.ativo}
          onChange={(e) => update("ativo", e.target.checked)}
        />
        <label htmlFor="ativo">Trilha ativa</label>
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
        {trilha && (
          <button type="button" className="btn btn-ghost" onClick={desativar} disabled={enviando}>
            Desativar trilha
          </button>
        )}
      </div>
    </form>
  );
}

function Bloco({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginTop: "1rem" }}>
      <label className="label">{label}</label>
      {children}
    </div>
  );
}
