import { todasAsAreas } from "@/lib/data/cursos";
import { perguntasDisc } from "@/lib/data/quiz-disc";
import { cursosTecnicos } from "@/lib/data/cursos-tecnicos";
import {
  cursosHabilitadores,
  mensagensCuradas,
  nomesTag,
  nomeFamilia,
} from "@/lib/data/correlacao-tecnico";
import bancoPerguntas from "@/lib/data/quiz-afinidade-cursos.json";
import ListaConteudoModal, {
  type ItemConteudo,
} from "@/components/admin/ListaConteudoModal";

export const metadata = {
  title: "Conteúdo do produto — Légua Admin",
};

type PerguntaJSON = {
  id: number;
  peso: number;
  fase: "ALUNO" | "PROFISSIONAL";
  texto: string;
};

type Bloco = {
  rotulo: string;
  contagem: number;
  descricao: string;
  itens: ItemConteudo[];
};

export default function ConteudoAdminPage() {
  // ── Áreas ────────────────────────────────────────────────────────────
  const itensAreas: ItemConteudo[] = todasAsAreas.map((a) => ({
    principal: `${a.icon} ${a.nome}`,
    secundario: `${a.cursos.length} cursos`,
    terciario: a.descricao,
  }));

  // ── Cursos ───────────────────────────────────────────────────────────
  const itensCursos: ItemConteudo[] = todasAsAreas.flatMap((a) =>
    a.cursos.map((c) => ({
      principal: c.nome,
      secundario: `${a.icon} ${a.nome}`,
      terciario: `${c.duracao} · ${c.salarioMedio}`,
    })),
  );

  // ── Perguntas de afinidade ───────────────────────────────────────────
  const banco = bancoPerguntas as Record<string, PerguntaJSON[]>;
  const itensPerguntasAfinidade: ItemConteudo[] = [];
  for (const [cursoSlug, perguntas] of Object.entries(banco)) {
    for (const p of perguntas) {
      itensPerguntasAfinidade.push({
        principal: p.texto,
        secundario: `${cursoSlug} · fase ${p.fase.toLowerCase()} · peso ${p.peso}`,
      });
    }
  }

  // ── Quiz DISC ────────────────────────────────────────────────────────
  const itensDisc: ItemConteudo[] = perguntasDisc.map((p) => ({
    principal: p.texto,
    secundario: `Pergunta ${p.id} de ${perguntasDisc.length} · 4 opções A/B/C/D`,
  }));

  // ── Cursos técnicos ──────────────────────────────────────────────────
  const itensTecnicos: ItemConteudo[] = cursosTecnicos.map((t) => ({
    principal: t.nome,
    secundario: `Área DISC: ${t.area.toLowerCase()} · tags: ${t.tagsAplicacao
      .map((tag) => nomesTag[tag])
      .join(", ")}`,
  }));

  // ── Cursos habilitadores ─────────────────────────────────────────────
  const itensHabilitadores: ItemConteudo[] = Object.entries(
    cursosHabilitadores,
  ).map(([slug, h]) => ({
    principal: slug,
    secundario: `Família: ${nomeFamilia[h.familia]} · compatível com ${h.tagsCompatibilidade.length} tags`,
  }));

  // ── Tags ─────────────────────────────────────────────────────────────
  const itensTags: ItemConteudo[] = Object.entries(nomesTag).map(
    ([slug, nome]) => ({
      principal: nome,
      secundario: slug,
    }),
  );

  // ── Mensagens curadas ────────────────────────────────────────────────
  const itensMensagens: ItemConteudo[] = [];
  for (const [tag, porFamilia] of Object.entries(mensagensCuradas)) {
    if (!porFamilia) continue;
    for (const [familia, texto] of Object.entries(porFamilia)) {
      if (!texto) continue;
      itensMensagens.push({
        principal: `${nomesTag[tag as keyof typeof nomesTag]} × ${nomeFamilia[familia as keyof typeof nomeFamilia]}`,
        secundario: texto,
      });
    }
  }

  const blocos: Bloco[] = [
    {
      rotulo: "Áreas de curso",
      contagem: itensAreas.length,
      descricao:
        "As 8 grandes áreas que agrupam os cursos no mapa (Saúde, Exatas, Humanas, Linguística, Tecnologia, Negócios, Artes, Agropecuária).",
      itens: itensAreas,
    },
    {
      rotulo: "Cursos",
      contagem: itensCursos.length,
      descricao:
        "Catálogo completo de cursos com nome, descrição, duração, salário médio e as duas narrativas ('um dia como aluno' e 'um dia como profissional').",
      itens: itensCursos,
    },
    {
      rotulo: "Perguntas de afinidade por curso",
      contagem: itensPerguntasAfinidade.length,
      descricao:
        "3 perguntas por curso (1 da fase aluno + 2 da fase profissional) que compõem 40% da pontuação final da simulação.",
      itens: itensPerguntasAfinidade,
    },
    {
      rotulo: "Perguntas do quiz vocacional DISC",
      contagem: itensDisc.length,
      descricao:
        "8 perguntas comportamentais usadas no cadastro para determinar a área dominante e o perfil DISC do aluno.",
      itens: itensDisc,
    },
    {
      rotulo: "Cursos técnicos do Piauí",
      contagem: itensTecnicos.length,
      descricao:
        "Lista padronizada de cursos técnicos exibida no cadastro. Cada técnico tem tags de aplicação que alimentam o bônus de correlação no match.",
      itens: itensTecnicos,
    },
    {
      rotulo: "Cursos habilitadores (correlação transversal)",
      contagem: itensHabilitadores.length,
      descricao:
        "Cursos de TI, marketing, design, gestão e comunicação marcados como 'habilitadores' — usados para identificar pontes transversais com o curso técnico do aluno.",
      itens: itensHabilitadores,
    },
    {
      rotulo: "Tags de aplicação",
      contagem: itensTags.length,
      descricao:
        "Vocabulário fechado de domínios (saúde, alimentos, agro, indústria...) usado pelo sistema de correlação transversal.",
      itens: itensTags,
    },
    {
      rotulo: "Mensagens curadas de correlação",
      contagem: itensMensagens.length,
      descricao:
        "Textos exibidos ao aluno quando há correlação transversal entre seu curso técnico e o curso simulado. Casos sem mensagem curada caem em template paramétrico.",
      itens: itensMensagens,
    },
  ];

  return (
    <div>
      <header style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.75rem", margin: 0 }}>Conteúdo do produto</h1>
        <p className="muted" style={{ margin: "0.5rem 0 0", maxWidth: 720 }}>
          Conteúdo essencial do produto que <strong>não é editável por aqui</strong>{" "}
          — vive no código e é alterado via pull request no repositório. Esta
          página existe para você saber o que está disponível, onde mora cada
          coisa, e descartar a expectativa de editar pela interface.
        </p>
      </header>

      <div style={{ display: "grid", gap: "0.85rem" }}>
        {blocos.map((bloco) => (
          <div key={bloco.rotulo} className="card">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                gap: "1rem",
                marginBottom: "0.5rem",
                flexWrap: "wrap",
              }}
            >
              <h2 style={{ fontSize: "1.05rem", margin: 0 }}>{bloco.rotulo}</h2>
              <span
                style={{
                  fontSize: "1.3rem",
                  fontWeight: 800,
                  color: "var(--color-accent)",
                }}
              >
                {bloco.contagem}
              </span>
            </div>
            <p style={{ margin: "0 0 0.85rem", lineHeight: 1.55 }}>
              {bloco.descricao}
            </p>
            <ListaConteudoModal
              rotuloBotao="Ver lista"
              tituloModal={bloco.rotulo}
              itens={bloco.itens}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
