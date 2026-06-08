"use client";

type Props = {
  resultadoId: string;
  titulo: string;
  pontuacao: number;
  proximoPasso: string;
};

export default function CompartilharResultado({
  resultadoId,
  titulo,
  pontuacao,
  proximoPasso,
}: Props) {
  async function compartilhar() {
    const mensagem =
      `No Léguas eu descobri que tenho ${pontuacao}% de compatibilidade com a trilha "${titulo}". ` +
      `Meu próximo passo: ${proximoPasso} ` +
      `Quer descobrir o seu? Acesse: ${typeof window !== "undefined" ? window.location.origin : ""}`;
    const url = `https://wa.me/?text=${encodeURIComponent(mensagem)}`;

    try {
      await fetch("/api/eventos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipoEvento: "RESULTADO_COMPARTILHADO", payload: { resultadoId } }),
      });
    } catch {
      // ignora erro de evento
    }

    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <button type="button" className="btn btn-primary" onClick={compartilhar}>
      Compartilhar pelo WhatsApp
    </button>
  );
}
