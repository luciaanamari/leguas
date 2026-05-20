"use client";

import { useState } from "react";
import type { ExplicacaoMatch } from "@/lib/match/engine";

interface Props {
  explicacao: ExplicacaoMatch;
  pontuacao: number;
  pontuacaoArea: number;
  pontuacaoCurso: number;
  cursoNome: string;
  perfilEmpreendedor: string;
  rendaFamiliar: string;
  preocupacoes: string[];
  anoEscolar: string;
  trilhaTitulo: string;
}

const rotuloArea: Record<string, string> = {
  HUMANAS: "Humanas",
  EXATAS: "Exatas",
  BIOLOGICAS: "Biológicas",
};

const rotuloDisc: Record<string, string> = {
  D: "D — Decisor",
  I: "I — Influenciador",
  S: "S — Estável",
  C: "C — Analítico",
};

const rotuloRenda: Record<string, string> = {
  ATE_1K: "Até R$ 1.000",
  DE_1K_A_2_5K: "R$ 1.000 a R$ 2.500",
  DE_2_5K_A_5K: "R$ 2.500 a R$ 5.000",
  ACIMA_5K: "Acima de R$ 5.000",
  PREFIRO_NAO_INFORMAR: "Não informou",
};

const rotuloPerfil: Record<string, string> = {
  ESTAVEL: "Estável (busca emprego fixo)",
  EQUILIBRIO: "Equilíbrio (segurança + crescimento)",
  EMPREENDEDOR: "Empreendedor (quer ter o próprio negócio)",
  ALTO_RISCO: "Alto risco (não se importa com incerteza)",
};

const rotuloPreocupacao: Record<string, string> = {
  SEM_DINHEIRO_FACULDADE: "Sem dinheiro para faculdade",
  PRECISO_TRABALHAR_LOGO: "Precisa trabalhar logo",
  NAO_PASSAR_NO_ENEM: "Medo de não passar no ENEM",
  MEDO_ESCOLHER_ERRADO: "Medo de escolher errado",
  NAO_CONHECO_OPCOES: "Não conhece bem as opções",
};

const rotuloAno: Record<string, string> = {
  PRIMEIRO: "1º ano",
  SEGUNDO: "2º ano",
  TERCEIRO: "3º ano",
};

const rotuloResposta: Record<string, string> = {
  SIM: "Sim",
  MAIS_OU_MENOS: "Mais ou menos",
  NAO: "Não",
};

const rotuloCorrelacao: Record<string, string> = {
  DIRETA: "Direta — curso técnico está na lista de carreiras relacionadas",
  TRANSVERSAL:
    "Transversal — curso simulado pode atuar no setor do seu curso técnico",
  AREA: "Indireta — mesma área de conhecimento, mas curso diferente",
  NENHUMA: "Nenhuma — não influenciou a pontuação",
};

function Linha({
  rotulo,
  valor,
  destaque = false,
}: {
  rotulo: string;
  valor: string | number;
  destaque?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "0.5rem 0",
        borderBottom: "1px dashed var(--color-border)",
        gap: "1rem",
      }}
    >
      <span className="muted" style={{ fontSize: "0.88rem" }}>
        {rotulo}
      </span>
      <span
        style={{
          fontSize: "0.92rem",
          fontWeight: destaque ? 700 : 500,
          color: destaque ? "var(--color-accent)" : "var(--color-text)",
          textAlign: "right",
        }}
      >
        {valor}
      </span>
    </div>
  );
}

function Bloco({
  titulo,
  subtitulo,
  children,
}: {
  titulo: string;
  subtitulo?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        padding: "1rem",
        background: "var(--color-background)",
        borderRadius: "0.5rem",
        border: "1px solid var(--color-border)",
      }}
    >
      <p
        style={{
          margin: 0,
          fontSize: "0.78rem",
          fontWeight: 700,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: "var(--color-accent)",
        }}
      >
        {titulo}
      </p>
      {subtitulo && (
        <p
          className="muted"
          style={{ margin: "0.25rem 0 0.5rem", fontSize: "0.82rem" }}
        >
          {subtitulo}
        </p>
      )}
      <div style={{ marginTop: subtitulo ? 0 : "0.5rem" }}>{children}</div>
    </div>
  );
}

export default function ComoFoiCalculado({
  explicacao,
  pontuacao,
  pontuacaoArea,
  pontuacaoCurso,
  cursoNome,
  perfilEmpreendedor,
  rendaFamiliar,
  preocupacoes,
  anoEscolar,
  trilhaTitulo,
}: Props) {
  const [aberto, setAberto] = useState(false);

  return (
    <section style={{ marginBottom: "1.5rem" }}>
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0.85rem 1rem",
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "0.5rem",
          color: "var(--color-text)",
          cursor: "pointer",
          fontSize: "0.95rem",
          fontWeight: 600,
        }}
      >
        <span>🔍 Como esse resultado foi calculado</span>
        <span style={{ color: "var(--color-text-muted)" }}>
          {aberto ? "▲ ocultar" : "▼ ver detalhes"}
        </span>
      </button>

      {aberto && (
        <div
          style={{
            marginTop: "0.6rem",
            display: "grid",
            gap: "0.75rem",
          }}
        >
          {/* Visao geral da pontuacao */}
          <Bloco
            titulo="Pontuação final"
            subtitulo="60% vem do quiz vocacional + 40% das 3 perguntas da simulação"
          >
            <Linha
              rotulo="Afinidade de área (peso 60%)"
              valor={`${pontuacaoArea} / 60`}
            />
            <Linha
              rotulo="Identificação com a simulação (peso 40%)"
              valor={`${pontuacaoCurso} / 40`}
            />
            <Linha
              rotulo="Total"
              valor={`${pontuacao} / 100`}
              destaque
            />
          </Bloco>

          {/* Quiz vocacional (DISC + area) */}
          <Bloco
            titulo="Bloco 1 · Quiz vocacional do cadastro"
            subtitulo="8 perguntas que mapearam sua área e seu perfil comportamental"
          >
            <Linha
              rotulo="Respostas em Humanas"
              valor={`${explicacao.area.contagemH} de ${explicacao.area.totalRespostas}`}
            />
            <Linha
              rotulo="Respostas em Exatas"
              valor={`${explicacao.area.contagemE} de ${explicacao.area.totalRespostas}`}
            />
            <Linha
              rotulo="Respostas em Biológicas"
              valor={`${explicacao.area.contagemB} de ${explicacao.area.totalRespostas}`}
            />
            <Linha
              rotulo="Área do curso simulado"
              valor={rotuloArea[explicacao.area.areaDoCurso] ?? explicacao.area.areaDoCurso}
            />
            <Linha
              rotulo="Sua afinidade com essa área"
              valor={`${Math.round(explicacao.area.fracaoAreaDoCurso * 100)}%`}
            />
            <Linha
              rotulo="Pontuação de área antes do bônus"
              valor={`${explicacao.area.pontuacaoBase} / 60`}
            />
            <div
              style={{
                marginTop: "0.6rem",
                padding: "0.6rem 0.75rem",
                background: "var(--color-surface)",
                borderRadius: "0.4rem",
                fontSize: "0.82rem",
              }}
              className="muted"
            >
              Fórmula: 18 (piso) + {Math.round(explicacao.area.fracaoAreaDoCurso * 100)}% × 42 ={" "}
              <strong style={{ color: "var(--color-text)" }}>
                {explicacao.area.pontuacaoBase}
              </strong>
            </div>
          </Bloco>

          {/* Perfil DISC */}
          <Bloco
            titulo="Seu perfil comportamental"
            subtitulo="Calculado a partir das mesmas 8 perguntas do quiz vocacional"
          >
            <Linha
              rotulo="Perfil identificado"
              valor={rotuloDisc[explicacao.disc.perfil] ?? explicacao.disc.perfil}
              destaque
            />
            <Linha rotulo="Marcações tipo D (Decisor)" valor={explicacao.disc.contagemD} />
            <Linha rotulo="Marcações tipo I (Influenciador)" valor={explicacao.disc.contagemI} />
            <Linha rotulo="Marcações tipo S (Estável)" valor={explicacao.disc.contagemS} />
            <Linha rotulo="Marcações tipo C (Analítico)" valor={explicacao.disc.contagemC} />
          </Bloco>

          {/* Quiz por curso */}
          <Bloco
            titulo="Bloco 2 · Quiz da simulação"
            subtitulo={`3 perguntas específicas sobre ${cursoNome}`}
          >
            {explicacao.curso.respostas.map((r) => (
              <Linha
                key={r.perguntaId}
                rotulo={`Pergunta ${r.perguntaId} (peso ${r.peso}) — você respondeu "${rotuloResposta[r.resposta]}"`}
                valor={`${r.pontosGanhos} / ${r.peso} pts`}
              />
            ))}
            <Linha
              rotulo="Total bruto"
              valor={`${explicacao.curso.pontosObtidos} / ${explicacao.curso.pontosMaximos} pts`}
            />
            <Linha
              rotulo="Convertido para 0-100%"
              valor={`${explicacao.curso.percentual}%`}
            />
            <Linha
              rotulo="Pontuação final (escala 0-40)"
              valor={`${explicacao.curso.pontuacaoFinal} / 40`}
              destaque
            />
          </Bloco>

          {/* Bonus do curso tecnico */}
          <Bloco
            titulo="Bônus por curso técnico"
            subtitulo="Aplicado quando seu curso técnico tem ligação com o curso simulado"
          >
            <Linha
              rotulo="Curso técnico cadastrado"
              valor={explicacao.tecnico.nome ?? "Nenhum"}
            />
            <Linha
              rotulo="Tipo de correlação"
              valor={rotuloCorrelacao[explicacao.tecnico.correlacao]}
            />
            {explicacao.tecnico.correlacao === "TRANSVERSAL" &&
              explicacao.tecnico.nomesTagsCompartilhadas.length > 0 && (
                <Linha
                  rotulo="Setores em comum"
                  valor={explicacao.tecnico.nomesTagsCompartilhadas.join(", ")}
                />
              )}
            <Linha
              rotulo="Bônus aplicado"
              valor={
                explicacao.tecnico.bonus > 0
                  ? `+${explicacao.tecnico.bonus} pts na nota de área`
                  : "Nenhum"
              }
              destaque={explicacao.tecnico.bonus > 0}
            />
          </Bloco>

          {/* Contexto do cadastro */}
          <Bloco
            titulo="Contexto do seu cadastro"
            subtitulo="Não afeta a nota — gera os blocos de orientação acima"
          >
            <Linha rotulo="Trilha simulada" valor={trilhaTitulo} />
            <Linha rotulo="Ano escolar" valor={rotuloAno[anoEscolar] ?? anoEscolar} />
            <Linha
              rotulo="Renda familiar"
              valor={rotuloRenda[rendaFamiliar] ?? rendaFamiliar}
            />
            <Linha
              rotulo="O que quer para o futuro"
              valor={rotuloPerfil[perfilEmpreendedor] ?? perfilEmpreendedor}
            />
            <Linha
              rotulo="Preocupações"
              valor={
                preocupacoes.length > 0
                  ? preocupacoes
                      .map((p) => rotuloPreocupacao[p] ?? p)
                      .join(", ")
                  : "Nenhuma"
              }
            />
          </Bloco>
        </div>
      )}
    </section>
  );
}
