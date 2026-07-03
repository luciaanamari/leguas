"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginEstudanteForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setErro(null);
    try {
      const resp = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
      });
      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        setErro(data.error ?? "Não foi possível entrar.");
        setEnviando(false);
        return;
      }
      router.push("/trilhas");
      router.refresh();
    } catch {
      setErro("Erro de conexão.");
      setEnviando(false);
    }
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
        placeholder="seu@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="email"
        required
      />

      <label className="label" htmlFor="senha" style={{ marginTop: "1rem" }}>
        Senha
      </label>
      <input
        id="senha"
        className="input"
        type="password"
        placeholder="Sua senha"
        value={senha}
        onChange={(e) => setSenha(e.target.value)}
        autoComplete="current-password"
        required
      />

      <p className="muted" style={{ marginTop: "0.5rem", fontSize: "0.85rem", lineHeight: 1.45 }}>
        Recebeu um código da escola? Use o mesmo e-mail do cadastro e cole o código no campo
        senha acima.
      </p>

      <p style={{ marginTop: "0.75rem", textAlign: "right" }}>
        <Link
          href="/esqueci-senha"
          style={{ fontSize: "0.88rem", color: "var(--color-text-soft)" }}
        >
          Esqueci minha senha
        </Link>
      </p>

      {erro && (
        <p className="error" style={{ marginTop: "1rem" }}>
          {erro}
        </p>
      )}

      <button
        type="submit"
        className="btn btn-primary"
        style={{ width: "100%", marginTop: "1.5rem" }}
        disabled={enviando}
      >
        {enviando ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
