"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import BotaoCopiar from "./BotaoCopiar";

type Props = {
  estudante: { id: string; ativo: boolean };
};

export default function AcoesEstudante({ estudante }: Props) {
  const router = useRouter();
  const [carregando, setCarregando] = useState<null | "senha" | "toggle" | "apagar">(null);
  const [tokenTemp, setTokenTemp] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [confirmarApagar, setConfirmarApagar] = useState(false);

  async function gerarSenha() {
    setCarregando("senha");
    setErro(null);
    setTokenTemp(null);
    try {
      const resp = await fetch(`/api/admin/estudantes/${estudante.id}/senha`, {
        method: "POST",
      });
      const data = await resp.json();
      if (!resp.ok) {
        setErro(data.error ?? "Erro ao gerar token.");
      } else {
        setTokenTemp(data.token);
      }
    } catch {
      setErro("Erro de conexão.");
    } finally {
      setCarregando(null);
    }
  }

  async function alternarAtivo() {
    setCarregando("toggle");
    setErro(null);
    try {
      const resp = await fetch(`/api/admin/estudantes/${estudante.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ativo: !estudante.ativo }),
      });
      if (!resp.ok) {
        const data = await resp.json();
        setErro(data.error ?? "Erro");
      } else {
        router.refresh();
      }
    } catch {
      setErro("Erro de conexão.");
    } finally {
      setCarregando(null);
    }
  }

  async function apagarConta() {
    setCarregando("apagar");
    setErro(null);
    try {
      const resp = await fetch(`/api/admin/estudantes/${estudante.id}`, {
        method: "DELETE",
      });
      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        setErro(data.error ?? "Erro ao apagar conta.");
        setCarregando(null);
      } else {
        router.push("/admin/estudantes");
      }
    } catch {
      setErro("Erro de conexão.");
      setCarregando(null);
    }
  }

  return (
    <div>
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={gerarSenha}
          disabled={carregando !== null}
        >
          {carregando === "senha" ? "Gerando..." : "Gerar senha temporária"}
        </button>

        <button
          type="button"
          className="btn btn-ghost"
          onClick={alternarAtivo}
          disabled={carregando !== null}
        >
          {carregando === "toggle"
            ? "Salvando..."
            : estudante.ativo
              ? "Desativar conta"
              : "Reativar conta"}
        </button>

        {!confirmarApagar ? (
          <button
            type="button"
            onClick={() => setConfirmarApagar(true)}
            disabled={carregando !== null}
            style={{
              background: "none",
              border: "1px solid #c0392b",
              color: "#c0392b",
              cursor: "pointer",
              padding: "0.5rem 1rem",
              borderRadius: "0.4rem",
              fontWeight: 600,
              fontSize: "0.9rem",
            }}
          >
            Apagar conta
          </button>
        ) : (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.5rem 0.75rem",
              border: "1px solid #c0392b",
              borderRadius: "0.4rem",
            }}
          >
            <span style={{ fontSize: "0.85rem", color: "#c0392b", fontWeight: 600 }}>
              ⚠ Isso apaga todos os dados. Confirmar?
            </span>
            <button
              type="button"
              onClick={apagarConta}
              disabled={carregando !== null}
              style={{
                background: "#c0392b",
                color: "#fff",
                border: "none",
                cursor: "pointer",
                padding: "0.3rem 0.75rem",
                borderRadius: "0.3rem",
                fontWeight: 700,
                fontSize: "0.85rem",
              }}
            >
              {carregando === "apagar" ? "Apagando…" : "Sim, apagar"}
            </button>
            <button
              type="button"
              onClick={() => setConfirmarApagar(false)}
              disabled={carregando !== null}
              style={{
                background: "none",
                border: "1px solid var(--color-border)",
                cursor: "pointer",
                padding: "0.3rem 0.75rem",
                borderRadius: "0.3rem",
                fontSize: "0.85rem",
                color: "var(--color-text-muted)",
              }}
            >
              Cancelar
            </button>
          </div>
        )}
      </div>

      {tokenTemp && (
        <div
          className="card"
          style={{ marginTop: "0.75rem", borderColor: "var(--color-accent)", borderWidth: 2 }}
        >
          <p className="muted" style={{ margin: 0, fontSize: "0.85rem" }}>
            Token temporário (válido por 24h, mostre uma única vez). O aluno usa em{" "}
            <Link href="/entrar" style={{ fontWeight: 700 }}>
              /entrar
            </Link>
            , não no login admin.
          </p>
          <p
            style={{
              fontSize: "1.4rem",
              letterSpacing: "0.15em",
              margin: "0.5rem 0 0",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <code>{tokenTemp}</code>
            <BotaoCopiar valor={tokenTemp} titulo="Copiar token" />
          </p>
        </div>
      )}
      {erro && (
        <p className="error" style={{ marginTop: "0.75rem" }}>
          {erro}
        </p>
      )}
    </div>
  );
}
