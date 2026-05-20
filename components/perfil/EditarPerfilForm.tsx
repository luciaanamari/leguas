"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Estudante {
  nome: string;
  escolaNome: string;
  escolaAno: string;
  cursoTecnico: string | null;
}

const anosEscolares = [
  { value: "PRIMEIRO", label: "1º ano" },
  { value: "SEGUNDO", label: "2º ano" },
  { value: "TERCEIRO", label: "3º ano" },
];

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "0.82rem",
  fontWeight: 600,
  color: "var(--color-text-muted)",
  marginBottom: "0.35rem",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.65rem 0.85rem",
  border: "1px solid var(--color-border)",
  borderRadius: "0.4rem",
  background: "var(--color-background)",
  color: "var(--color-text)",
  fontSize: "0.95rem",
  boxSizing: "border-box",
};

export default function EditarPerfilForm({ estudante }: { estudante: Estudante }) {
  const router = useRouter();
  const [aberto, setAberto] = useState(false);
  const [form, setForm] = useState<Estudante>({ ...estudante });
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);

  function mudar(field: keyof Estudante, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErro(null);
    setSucesso(false);
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    setErro(null);
    setSucesso(false);

    const payload: Record<string, string | null> = {
      nome: form.nome,
      escolaNome: form.escolaNome,
      escolaAno: form.escolaAno,
      cursoTecnico: form.cursoTecnico || null,
    };

    try {
      const resp = await fetch("/api/estudantes/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        setErro(data.error ?? "Não foi possível salvar.");
      } else {
        setSucesso(true);
        setAberto(false);
        router.refresh();
      }
    } catch {
      setErro("Erro de conexão. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  }

  if (!aberto) {
    return (
      <button
        type="button"
        className="btn btn-secondary"
        onClick={() => setAberto(true)}
        style={{ marginTop: "0.75rem" }}
      >
        Editar informações
      </button>
    );
  }

  return (
    <form
      onSubmit={salvar}
      style={{
        marginTop: "1rem",
        display: "grid",
        gap: "1rem",
      }}
    >
      <div>
        <label style={labelStyle}>Nome completo</label>
        <input
          style={inputStyle}
          value={form.nome}
          onChange={(e) => mudar("nome", e.target.value)}
          required
          minLength={3}
        />
      </div>

      <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "1fr 1fr" }}>
        <div>
          <label style={labelStyle}>Escola</label>
          <input
            style={inputStyle}
            value={form.escolaNome}
            onChange={(e) => mudar("escolaNome", e.target.value)}
            required
            minLength={3}
          />
        </div>
        <div>
          <label style={labelStyle}>Ano</label>
          <select
            style={inputStyle}
            value={form.escolaAno}
            onChange={(e) => mudar("escolaAno", e.target.value)}
          >
            {anosEscolares.map((a) => (
              <option key={a.value} value={a.value}>
                {a.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label style={labelStyle}>Curso técnico (se houver)</label>
        <input
          style={inputStyle}
          value={form.cursoTecnico ?? ""}
          onChange={(e) => mudar("cursoTecnico", e.target.value)}
          placeholder="Deixe em branco se não tiver"
        />
      </div>

      {erro && (
        <p className="error" style={{ margin: 0 }}>
          {erro}
        </p>
      )}
      {sucesso && (
        <p style={{ margin: 0, color: "#4caf78", fontWeight: 600 }}>
          ✓ Informações salvas com sucesso.
        </p>
      )}

      <div style={{ display: "flex", gap: "0.75rem" }}>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => {
            setAberto(false);
            setForm({ ...estudante });
            setErro(null);
          }}
          disabled={salvando}
        >
          Cancelar
        </button>
        <button type="submit" className="btn btn-primary" disabled={salvando}>
          {salvando ? "Salvando…" : "Salvar alterações"}
        </button>
      </div>
    </form>
  );
}
