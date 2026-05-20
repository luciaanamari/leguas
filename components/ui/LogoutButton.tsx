"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  endpoint?: string;
  destino?: string;
  label?: string;
};

export default function LogoutButton({
  endpoint = "/api/auth/logout",
  destino = "/",
  label = "Sair",
}: Props) {
  const router = useRouter();
  const [carregando, setCarregando] = useState(false);

  async function sair() {
    setCarregando(true);
    try {
      await fetch(endpoint, { method: "POST" });
    } finally {
      router.push(destino);
      router.refresh();
    }
  }

  return (
    <button
      type="button"
      onClick={sair}
      className="btn btn-ghost"
      disabled={carregando}
      style={{ minHeight: 36, padding: "0.4rem 0.9rem", fontSize: "0.9rem" }}
    >
      {carregando ? "Saindo..." : label}
    </button>
  );
}
