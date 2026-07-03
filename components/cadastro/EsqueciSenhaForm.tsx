"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { MENSAGEM_ESQUECI_SENHA_GENERICO } from "@/lib/validations/esqueci-senha";

export default function EsqueciSenhaForm() {
  const [email, setEmail] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setErro(null);
    setSucesso(false);

    try {
      const resp = await fetch("/api/auth/esqueci-senha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        const msg =
          data.detalhes?.fieldErrors?.email?.[0] ??
          data.error ??
          "Não foi possível enviar a solicitação.";
        setErro(msg);
        setEnviando(false);
        return;
      }
      setSucesso(true);
    } catch {
      setErro("Erro de conexão. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  if (sucesso) {
    return (
      <div className="card" style={{ textAlign: "center" }}>
        <p style={{ margin: "0 0 1rem", lineHeight: 1.55 }}>{MENSAGEM_ESQUECI_SENHA_GENERICO}</p>
        <Link href="/entrar" className="btn btn-primary">
          Voltar para entrar
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={enviar} className="card" noValidate>
      <label className="label" htmlFor="email">
        E-mail
      </label>
      <input
        id="email"
        className="input"
        type="email"
        inputMode="email"
        autoComplete="email"
        placeholder="seu@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <p className="muted" style={{ marginTop: "0.35rem", fontSize: "0.85rem" }}>
        Informe o e-mail que você usou no cadastro. A escola vai gerar uma nova senha para você.
      </p>

      {erro && <p className="error" style={{ marginTop: "1rem" }}>{erro}</p>}

      <button
        type="submit"
        className="btn btn-primary"
        style={{ width: "100%", marginTop: "1.5rem" }}
        disabled={enviando}
      >
        {enviando ? "Enviando…" : "Solicitar ajuda da escola"}
      </button>
    </form>
  );
}
