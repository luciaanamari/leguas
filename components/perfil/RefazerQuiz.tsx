"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import QuizDisc, {
  contarRespostasDisc,
  quizDiscCompleto,
  serializarRespostasDisc,
  type RespostasDiscMap,
} from "@/components/cadastro/QuizDisc";
import { perguntasDisc } from "@/lib/data/quiz-disc";

export default function RefazerQuiz() {
  const router = useRouter();
  const [respostas, setRespostas] = useState<RespostasDiscMap>({});
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function enviar(e: FormEvent) {
    e.preventDefault();
    if (!quizDiscCompleto(respostas)) {
      const faltam = perguntasDisc.length - contarRespostasDisc(respostas);
      setErro(`Responda todas as perguntas (faltam ${faltam}).`);
      return;
    }

    setEnviando(true);
    setErro(null);

    try {
      const resp = await fetch("/api/perfil/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ respostasDisc: serializarRespostasDisc(respostas) }),
      });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        setErro(data.error ?? "Não foi possível salvar o novo perfil.");
        setEnviando(false);
        return;
      }
      router.push("/perfil-vocacional");
      router.refresh();
    } catch {
      setErro("Erro de conexão. Tente novamente.");
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={enviar} className="card" noValidate>
      <QuizDisc
        respostas={respostas}
        onChange={setRespostas}
        erro={erro}
        titulo="Refazer quiz vocacional"
        subtitulo="Suas simulações anteriores não mudam — só o perfil usado em novos resultados."
      />

      <div
        style={{
          marginTop: "2rem",
          display: "flex",
          gap: "0.75rem",
          justifyContent: "flex-end",
          flexWrap: "wrap",
        }}
      >
        <button
          type="submit"
          className="btn btn-primary"
          disabled={enviando || !quizDiscCompleto(respostas)}
        >
          {enviando ? "Salvando…" : "Salvar novo perfil"}
        </button>
      </div>
    </form>
  );
}
