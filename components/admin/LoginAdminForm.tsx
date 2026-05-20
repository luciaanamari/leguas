"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

type Props = {
  redirectTo?: string;
};

export default function LoginAdminForm({ redirectTo }: Props) {
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
      const resp = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
      });
      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        setErro(data.error ?? "Credenciais inválidas.");
        setEnviando(false);
        return;
      }
      router.push(redirectTo ?? "/admin/dashboard");
      router.refresh();
    } catch {
      setErro("Erro de conexão.");
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={enviar} className="card" noValidate>
      <label className="label" htmlFor="email">
        Email
      </label>
      <input
        id="email"
        className="input"
        type="email"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <label className="label" htmlFor="senha" style={{ marginTop: "1rem" }}>
        Senha
      </label>
      <input
        id="senha"
        className="input"
        type="password"
        autoComplete="current-password"
        value={senha}
        onChange={(e) => setSenha(e.target.value)}
        required
      />

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
