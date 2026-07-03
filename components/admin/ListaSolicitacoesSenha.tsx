"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Solicitacao = {
  id: string;
  criadoEm: string;
  estudante: {
    id: string;
    nome: string;
    email: string | null;
    escola: { nome: string; organizacao: { nome: string } } | null;
  };
};

type Props = {
  solicitacoes: Solicitacao[];
};

export default function ListaSolicitacoesSenha({ solicitacoes: iniciais }: Props) {
  const router = useRouter();
  const [itens, setItens] = useState(iniciais);
  const [carregandoId, setCarregandoId] = useState<string | null>(null);
  const [tokens, setTokens] = useState<Record<string, string>>({});
  const [erro, setErro] = useState<string | null>(null);

  async function gerarSenha(solicitacao: Solicitacao) {
    setCarregandoId(solicitacao.id);
    setErro(null);

    try {
      const resp = await fetch(`/api/admin/estudantes/${solicitacao.estudante.id}/senha`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ solicitacaoId: solicitacao.id }),
      });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        setErro(data.error ?? "Não foi possível gerar a senha temporária.");
        setCarregandoId(null);
        return;
      }

      setTokens((t) => ({ ...t, [solicitacao.id]: data.token }));
      setItens((lista) => lista.filter((s) => s.id !== solicitacao.id));
      router.refresh();
    } catch {
      setErro("Erro de conexão.");
    } finally {
      setCarregandoId(null);
    }
  }

  if (itens.length === 0 && Object.keys(tokens).length === 0) {
    return (
      <div className="card" style={{ textAlign: "center", padding: "2rem" }}>
        <p className="muted" style={{ margin: 0 }}>
          Nenhuma solicitação pendente no seu escopo.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      {itens.map((s) => (
        <div key={s.id} className="card">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              flexWrap: "wrap",
              gap: "1rem",
            }}
          >
            <div>
              <h2 style={{ fontSize: "1.05rem", margin: "0 0 0.25rem" }}>
                {s.estudante.nome}
              </h2>
              <p className="muted" style={{ margin: 0, fontSize: "0.88rem" }}>
                {s.estudante.email ?? "Sem e-mail cadastrado"}
              </p>
              <p className="muted" style={{ margin: "0.25rem 0 0", fontSize: "0.85rem" }}>
                {s.estudante.escola
                  ? `${s.estudante.escola.nome} · ${s.estudante.escola.organizacao.nome}`
                  : "Escola não vinculada"}
              </p>
              <p className="muted" style={{ margin: "0.35rem 0 0", fontSize: "0.8rem" }}>
                Solicitado em{" "}
                {new Date(s.criadoEm).toLocaleString("pt-BR", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "flex-end" }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => void gerarSenha(s)}
                disabled={carregandoId === s.id}
              >
                {carregandoId === s.id ? "Gerando…" : "Gerar nova senha"}
              </button>
              <Link
                href={`/admin/estudantes/${s.estudante.id}`}
                className="btn btn-ghost"
                style={{ fontSize: "0.85rem" }}
              >
                Ver estudante
              </Link>
            </div>
          </div>
        </div>
      ))}

      {Object.entries(tokens).map(([solicitacaoId, token]) => (
        <div
          key={solicitacaoId}
          className="card"
          style={{ borderColor: "var(--color-accent)", borderWidth: 2 }}
        >
          <p className="muted" style={{ margin: 0, fontSize: "0.85rem" }}>
            Senha temporária gerada (válida 24h — repasse ao aluno uma única vez):
          </p>
          <p style={{ fontSize: "1.4rem", letterSpacing: "0.15em", margin: "0.5rem 0 0" }}>
            <code>{token}</code>
          </p>
      <p className="muted" style={{ margin: "0.75rem 0 0", fontSize: "0.85rem" }}>
        O aluno deve entrar em{" "}
        <Link href="/entrar" style={{ fontWeight: 700 }}>
          /entrar
        </Link>{" "}
        (não no painel admin) com o e-mail cadastrado e este código no campo senha.
      </p>
        </div>
      ))}

      {erro && <p className="error">{erro}</p>}
    </div>
  );
}
