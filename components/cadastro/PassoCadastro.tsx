"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { perguntasDisc } from "@/lib/data/quiz-disc";
import { cursosTecnicos } from "@/lib/data/cursos-tecnicos";

type Passo = 1 | 2 | 3 | 4;

type RendaOpcao =
  | "ATE_1K"
  | "DE_1K_A_2_5K"
  | "DE_2_5K_A_5K"
  | "ACIMA_5K"
  | "PREFIRO_NAO_INFORMAR";

type PerfilEmpreendedorOpcao =
  | "ESTAVEL"
  | "EQUILIBRIO"
  | "EMPREENDEDOR"
  | "ALTO_RISCO";

type PreocupacaoOpcao =
  | "SEM_DINHEIRO_FACULDADE"
  | "PRECISO_TRABALHAR_LOGO"
  | "NAO_PASSAR_NO_ENEM"
  | "MEDO_ESCOLHER_ERRADO"
  | "NAO_CONHECO_OPCOES";

type OpcaoDisc = "A" | "B" | "C" | "D";

type EstadoForm = {
  // Passo 1
  nome: string;
  email: string;
  senha: string;
  confirmarSenha: string;
  dataNascimento: string;
  cpf: string;
  whatsapp: string;
  rendaFamiliar: "" | RendaOpcao;
  // Passo 2
  escolaNome: string;
  escolaAno: "" | "PRIMEIRO" | "SEGUNDO" | "TERCEIRO";
  cursoTecnico: string;
  // Passo 3
  perfilEmpreendedor: "" | PerfilEmpreendedorOpcao;
  preocupacoes: PreocupacaoOpcao[];
  // Passo 4 — respostas DISC indexadas por perguntaId
  respostasDisc: Record<number, OpcaoDisc | undefined>;
};

const inicial: EstadoForm = {
  nome: "",
  email: "",
  senha: "",
  confirmarSenha: "",
  dataNascimento: "",
  cpf: "",
  whatsapp: "",
  rendaFamiliar: "",
  escolaNome: "",
  escolaAno: "",
  cursoTecnico: "",
  perfilEmpreendedor: "",
  preocupacoes: [],
  respostasDisc: {},
};

const opcoesRenda: { value: RendaOpcao; label: string }[] = [
  { value: "ATE_1K", label: "Até R$ 1.000" },
  { value: "DE_1K_A_2_5K", label: "R$ 1.000 a R$ 2.500" },
  { value: "DE_2_5K_A_5K", label: "R$ 2.500 a R$ 5.000" },
  { value: "ACIMA_5K", label: "Acima de R$ 5.000" },
  { value: "PREFIRO_NAO_INFORMAR", label: "Prefiro não informar" },
];

const opcoesPerfil: {
  value: PerfilEmpreendedorOpcao;
  titulo: string;
  descricao: string;
}[] = [
  {
    value: "ESTAVEL",
    titulo: "Quero estabilidade",
    descricao: "Emprego fixo, salário garantido, sem grandes riscos.",
  },
  {
    value: "EQUILIBRIO",
    titulo: "Quero equilíbrio",
    descricao: "Segurança com espaço para crescer.",
  },
  {
    value: "EMPREENDEDOR",
    titulo: "Quero empreender",
    descricao: "Ter meu próprio negócio um dia.",
  },
  {
    value: "ALTO_RISCO",
    titulo: "Quero arriscar",
    descricao: "Não me importo com incerteza se o potencial for alto.",
  },
];

const opcoesPreocupacao: { value: PreocupacaoOpcao; label: string }[] = [
  { value: "SEM_DINHEIRO_FACULDADE", label: "Não tenho dinheiro para pagar faculdade" },
  { value: "PRECISO_TRABALHAR_LOGO", label: "Preciso trabalhar logo para ajudar em casa" },
  { value: "NAO_PASSAR_NO_ENEM", label: "Não sei se consigo passar no ENEM" },
  { value: "MEDO_ESCOLHER_ERRADO", label: "Tenho medo de escolher errado e perder tempo" },
  { value: "NAO_CONHECO_OPCOES", label: "Não conheço bem as opções disponíveis" },
];

function validaCpfMath(cpf: string): boolean {
  const d = cpf.replace(/\D/g, "");
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;
  let soma = 0;
  for (let i = 0; i < 9; i++) soma += parseInt(d[i], 10) * (10 - i);
  let resto = (soma * 10) % 11;
  if (resto === 10) resto = 0;
  if (resto !== parseInt(d[9], 10)) return false;
  soma = 0;
  for (let i = 0; i < 10; i++) soma += parseInt(d[i], 10) * (11 - i);
  resto = (soma * 10) % 11;
  if (resto === 10) resto = 0;
  return resto === parseInt(d[10], 10);
}

function mascaraCpf(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  return d
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

function mascaraWhatsapp(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 10) return d.replace(/(\d{2})(\d{4})(\d)/, "($1) $2-$3");
  return d.replace(/(\d{2})(\d{5})(\d)/, "($1) $2-$3");
}

export default function PassoCadastro() {
  const router = useRouter();
  const [passo, setPasso] = useState<Passo>(1);
  const [estado, setEstado] = useState<EstadoForm>(inicial);
  const [erros, setErros] = useState<Record<string, string>>({});
  const [enviando, setEnviando] = useState(false);
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [perguntaDiscIdx, setPerguntaDiscIdx] = useState(0);

  function atualiza<K extends keyof EstadoForm>(key: K, value: EstadoForm[K]) {
    setEstado((s) => ({ ...s, [key]: value }));
  }

  function togglePreocupacao(p: PreocupacaoOpcao) {
    setEstado((s) => {
      const tem = s.preocupacoes.includes(p);
      return {
        ...s,
        preocupacoes: tem
          ? s.preocupacoes.filter((x) => x !== p)
          : [...s.preocupacoes, p],
      };
    });
  }

  function responderDisc(perguntaId: number, opcao: OpcaoDisc) {
    setEstado((s) => ({
      ...s,
      respostasDisc: { ...s.respostasDisc, [perguntaId]: opcao },
    }));
    // Avanca automaticamente apos selecionar
    setTimeout(() => {
      setPerguntaDiscIdx((idx) =>
        idx < perguntasDisc.length - 1 ? idx + 1 : idx,
      );
    }, 200);
  }

  function validaPasso1(): boolean {
    const novos: Record<string, string> = {};
    const nomeTrim = estado.nome.trim();
    if (nomeTrim.length < 2) novos.nome = "Informe seu nome completo";
    else if (nomeTrim.length > 100) novos.nome = "Nome muito longo (máximo 100 caracteres)";

    if (!estado.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(estado.email))
      novos.email = "Informe um e-mail válido";
    if (estado.senha.length < 8) novos.senha = "A senha deve ter pelo menos 8 caracteres";
    if (estado.senha !== estado.confirmarSenha) novos.confirmarSenha = "As senhas não coincidem";

    if (!estado.dataNascimento) {
      novos.dataNascimento = "Informe a data de nascimento";
    } else {
      const nascimento = new Date(estado.dataNascimento);
      const hoje = new Date();
      if (isNaN(nascimento.getTime())) {
        novos.dataNascimento = "Data de nascimento inválida";
      } else if (nascimento > hoje) {
        novos.dataNascimento = "A data de nascimento não pode estar no futuro";
      }
    }

    if (estado.cpf.replace(/\D/g, "").length !== 11) novos.cpf = "CPF deve ter 11 dígitos";
    else if (!validaCpfMath(estado.cpf))
      novos.cpf = "CPF inválido. Verifique os números digitados.";

    const wapp = estado.whatsapp.replace(/\D/g, "");
    if (wapp.length > 0 && (wapp.length < 10 || wapp.length > 11))
      novos.whatsapp = "WhatsApp inválido (10 ou 11 dígitos)";
    if (!estado.rendaFamiliar) novos.rendaFamiliar = "Selecione uma faixa de renda";
    setErros(novos);
    return Object.keys(novos).length === 0;
  }

  function validaPasso2(): boolean {
    const novos: Record<string, string> = {};
    if (estado.escolaNome.trim().length < 2) novos.escolaNome = "Informe o nome da escola";
    if (!estado.escolaAno) novos.escolaAno = "Selecione o ano";
    setErros(novos);
    return Object.keys(novos).length === 0;
  }

  function validaPasso3(): boolean {
    const novos: Record<string, string> = {};
    if (!estado.perfilEmpreendedor)
      novos.perfilEmpreendedor = "Escolha a opção que mais combina";
    if (estado.preocupacoes.length === 0)
      novos.preocupacoes = "Selecione ao menos uma preocupação";
    setErros(novos);
    return Object.keys(novos).length === 0;
  }

  function validaPasso4(): boolean {
    const novos: Record<string, string> = {};
    const respondidas = perguntasDisc.filter(
      (p) => estado.respostasDisc[p.id] != null,
    ).length;
    if (respondidas < perguntasDisc.length) {
      novos.disc = `Responda todas as ${perguntasDisc.length} perguntas (faltam ${perguntasDisc.length - respondidas})`;
    }
    setErros(novos);
    return Object.keys(novos).length === 0;
  }

  async function enviar(e: FormEvent) {
    e.preventDefault();
    if (!validaPasso4()) return;
    setEnviando(true);
    setErroGeral(null);
    try {
      const payload = {
        nome: estado.nome,
        email: estado.email,
        senha: estado.senha,
        confirmarSenha: estado.confirmarSenha,
        dataNascimento: estado.dataNascimento,
        cpf: estado.cpf,
        whatsapp: estado.whatsapp,
        rendaFamiliar: estado.rendaFamiliar,
        escolaNome: estado.escolaNome,
        escolaAno: estado.escolaAno,
        cursoTecnico: estado.cursoTecnico,
        perfilEmpreendedor: estado.perfilEmpreendedor,
        preocupacoes: estado.preocupacoes,
        respostasDisc: perguntasDisc.map((p) => ({
          perguntaId: p.id,
          opcaoId: estado.respostasDisc[p.id]!,
        })),
      };
      const resp = await fetch("/api/estudantes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        if (data.detalhes?.fieldErrors) {
          const campos = data.detalhes.fieldErrors as Record<string, string[]>;
          const primeiroCampo = Object.entries(campos)[0];
          setErroGeral(
            primeiroCampo
              ? `${primeiroCampo[1][0]}`
              : (data.error ?? "Dados inválidos"),
          );
        } else {
          setErroGeral(data.error ?? "Não foi possível concluir o cadastro.");
        }
        setEnviando(false);
        return;
      }
      router.push("/perfil-vocacional");
      router.refresh();
    } catch {
      setErroGeral("Erro de conexão. Tente novamente.");
      setEnviando(false);
    }
  }

  async function avancar() {
    if (passo === 1) {
      if (!validaPasso1()) return;

      // Verifica no servidor se o CPF ja esta cadastrado
      try {
        const resp = await fetch("/api/estudantes/verificar-cpf", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cpf: estado.cpf }),
        });
        const data = (await resp.json()) as { existe: boolean };
        if (data.existe) {
          setErros({ cpf: "Já existe um cadastro com esse CPF." });
          return;
        }
      } catch {
        setErros({ cpf: "Não foi possível verificar o CPF agora. Tente novamente." });
        return;
      }

      setPasso(2);
    } else if (passo === 2 && validaPasso2()) {
      setPasso(3);
    } else if (passo === 3 && validaPasso3()) {
      setPasso(4);
      setPerguntaDiscIdx(0);
    }
  }

  const perguntaDiscAtual = perguntasDisc[perguntaDiscIdx];
  const totalDisc = perguntasDisc.length;
  const respondidasDisc = perguntasDisc.filter(
    (p) => estado.respostasDisc[p.id] != null,
  ).length;

  return (
    <form onSubmit={enviar} className="card" noValidate>
      <p className="muted" style={{ marginBottom: "0.5rem", fontSize: "0.85rem" }}>
        Passo {passo} de 4
      </p>
      <div
        aria-hidden
        style={{
          height: 6,
          borderRadius: 999,
          background: "var(--color-border)",
          marginBottom: "1.5rem",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${(passo / 4) * 100}%`,
            background: "var(--color-accent)",
            transition: "width 200ms ease",
          }}
        />
      </div>

      {/* ── Passo 1: Dados pessoais + renda ──────────────────────────── */}
      {passo === 1 && (
        <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
          <legend style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "1rem" }}>
            Sobre você
          </legend>

          <label className="label" htmlFor="nome">
            Nome completo
          </label>
          <input
            id="nome"
            className="input"
            type="text"
            maxLength={100}
            value={estado.nome}
            onChange={(e) => atualiza("nome", e.target.value)}
            autoComplete="name"
          />
          {erros.nome && <p className="error">{erros.nome}</p>}

          <label className="label" htmlFor="email" style={{ marginTop: "1rem" }}>
            E-mail
          </label>
          <input
            id="email"
            className="input"
            type="email"
            inputMode="email"
            placeholder="seu@email.com"
            value={estado.email}
            onChange={(e) => atualiza("email", e.target.value)}
            autoComplete="email"
          />
          {erros.email && <p className="error">{erros.email}</p>}

          <label className="label" htmlFor="senha" style={{ marginTop: "1rem" }}>
            Senha
          </label>
          <input
            id="senha"
            className="input"
            type="password"
            placeholder="Mínimo 8 caracteres"
            value={estado.senha}
            onChange={(e) => atualiza("senha", e.target.value)}
            autoComplete="new-password"
          />
          {erros.senha && <p className="error">{erros.senha}</p>}

          <label className="label" htmlFor="confirmar" style={{ marginTop: "1rem" }}>
            Confirmar senha
          </label>
          <input
            id="confirmar"
            className="input"
            type="password"
            placeholder="Repita a senha"
            value={estado.confirmarSenha}
            onChange={(e) => atualiza("confirmarSenha", e.target.value)}
            autoComplete="new-password"
          />
          {erros.confirmarSenha && <p className="error">{erros.confirmarSenha}</p>}

          <label className="label" htmlFor="data" style={{ marginTop: "1rem" }}>
            Data de nascimento
          </label>
          <input
            id="data"
            className="input"
            type="date"
            value={estado.dataNascimento}
            onChange={(e) => atualiza("dataNascimento", e.target.value)}
          />
          {erros.dataNascimento && <p className="error">{erros.dataNascimento}</p>}

          <label className="label" htmlFor="cpf" style={{ marginTop: "1rem" }}>
            CPF
          </label>
          <input
            id="cpf"
            className="input"
            type="text"
            inputMode="numeric"
            placeholder="000.000.000-00"
            value={estado.cpf}
            onChange={(e) => atualiza("cpf", mascaraCpf(e.target.value))}
          />
          <p className="muted" style={{ marginTop: "0.25rem", fontSize: "0.8rem" }}>
            Guardado de forma cifrada, nunca aparece em texto puro.
          </p>
          {erros.cpf && <p className="error">{erros.cpf}</p>}

          <label className="label" htmlFor="whats" style={{ marginTop: "1rem" }}>
            WhatsApp{" "}
            <span style={{ color: "var(--color-text-muted)", fontWeight: 400 }}>
              (opcional)
            </span>
          </label>
          <input
            id="whats"
            className="input"
            type="tel"
            inputMode="tel"
            placeholder="(86) 9XXXX-XXXX"
            value={estado.whatsapp}
            onChange={(e) => atualiza("whatsapp", mascaraWhatsapp(e.target.value))}
          />
          {erros.whatsapp && <p className="error">{erros.whatsapp}</p>}

          <p className="label" style={{ marginTop: "1.25rem" }}>
            Renda familiar mensal
          </p>
          <p
            className="muted"
            style={{ fontSize: "0.8rem", marginTop: 0, marginBottom: "0.6rem" }}
          >
            Usamos para sugerir oportunidades adequadas (bolsas, ProUni, FIES).
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {opcoesRenda.map((op) => {
              const checked = estado.rendaFamiliar === op.value;
              return (
                <label
                  key={op.value}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.6rem",
                    padding: "0.7rem 0.9rem",
                    border: `2px solid ${checked ? "var(--color-accent)" : "var(--color-border)"}`,
                    borderRadius: "0.5rem",
                    background: checked
                      ? "rgba(226,172,64,0.10)"
                      : "transparent",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="radio"
                    name="renda"
                    value={op.value}
                    checked={checked}
                    onChange={() => atualiza("rendaFamiliar", op.value)}
                    style={{ accentColor: "var(--color-accent)" }}
                  />
                  <span>{op.label}</span>
                </label>
              );
            })}
          </div>
          {erros.rendaFamiliar && <p className="error">{erros.rendaFamiliar}</p>}
        </fieldset>
      )}

      {/* ── Passo 2: Escola ─────────────────────────────────────────── */}
      {passo === 2 && (
        <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
          <legend style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "1rem" }}>
            Sobre sua escola
          </legend>

          <label className="label" htmlFor="escola">
            Nome da escola
          </label>
          <input
            id="escola"
            className="input"
            type="text"
            value={estado.escolaNome}
            onChange={(e) => atualiza("escolaNome", e.target.value)}
          />
          {erros.escolaNome && <p className="error">{erros.escolaNome}</p>}

          <label className="label" htmlFor="ano" style={{ marginTop: "1rem" }}>
            Em que ano você está?
          </label>
          <select
            id="ano"
            className="select"
            value={estado.escolaAno}
            onChange={(e) =>
              atualiza("escolaAno", e.target.value as EstadoForm["escolaAno"])
            }
          >
            <option value="">Escolha</option>
            <option value="PRIMEIRO">1º ano</option>
            <option value="SEGUNDO">2º ano</option>
            <option value="TERCEIRO">3º ano</option>
          </select>
          {erros.escolaAno && <p className="error">{erros.escolaAno}</p>}

          <label className="label" htmlFor="tecnico" style={{ marginTop: "1rem" }}>
            Faz ou já fez algum curso técnico?
          </label>
          <select
            id="tecnico"
            className="select"
            value={estado.cursoTecnico}
            onChange={(e) => atualiza("cursoTecnico", e.target.value)}
          >
            <option value="">Não faço nenhum</option>
            {cursosTecnicos.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.nome}
              </option>
            ))}
          </select>
          <p className="muted" style={{ marginTop: "0.25rem", fontSize: "0.8rem" }}>
            Se já tem um curso técnico, ele aumenta o match das carreiras
            relacionadas.
          </p>
        </fieldset>
      )}

      {/* ── Passo 3: Perfil empreendedor + preocupacoes ─────────────── */}
      {passo === 3 && (
        <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
          <legend style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem" }}>
            O que você quer para o futuro?
          </legend>
          <p className="muted" style={{ marginBottom: "1rem" }}>
            Qual dessas opções mais combina com o que você quer?
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            {opcoesPerfil.map((op) => {
              const checked = estado.perfilEmpreendedor === op.value;
              return (
                <label
                  key={op.value}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "0.7rem",
                    padding: "0.85rem 1rem",
                    border: `2px solid ${checked ? "var(--color-accent)" : "var(--color-border)"}`,
                    borderRadius: "0.5rem",
                    background: checked
                      ? "rgba(226,172,64,0.10)"
                      : "transparent",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="radio"
                    name="perfilEmpreendedor"
                    value={op.value}
                    checked={checked}
                    onChange={() => atualiza("perfilEmpreendedor", op.value)}
                    style={{ accentColor: "var(--color-accent)", marginTop: 4 }}
                  />
                  <span>
                    <strong style={{ display: "block" }}>{op.titulo}</strong>
                    <span className="muted" style={{ fontSize: "0.88rem" }}>
                      {op.descricao}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
          {erros.perfilEmpreendedor && (
            <p className="error">{erros.perfilEmpreendedor}</p>
          )}

          <p className="label" style={{ marginTop: "1.5rem" }}>
            O que mais te preocupa hoje? (pode marcar mais de uma)
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {opcoesPreocupacao.map((op) => {
              const checked = estado.preocupacoes.includes(op.value);
              return (
                <label
                  key={op.value}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.6rem",
                    padding: "0.7rem 0.9rem",
                    border: `2px solid ${checked ? "var(--color-accent)" : "var(--color-border)"}`,
                    borderRadius: "0.5rem",
                    background: checked
                      ? "rgba(226,172,64,0.10)"
                      : "transparent",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => togglePreocupacao(op.value)}
                    style={{ accentColor: "var(--color-accent)" }}
                  />
                  <span>{op.label}</span>
                </label>
              );
            })}
          </div>
          {erros.preocupacoes && <p className="error">{erros.preocupacoes}</p>}
        </fieldset>
      )}

      {/* ── Passo 4: Quiz DISC ──────────────────────────────────────── */}
      {passo === 4 && perguntaDiscAtual && (
        <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
          <legend style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.25rem" }}>
            Quiz vocacional
          </legend>
          <p className="muted" style={{ marginBottom: "1rem" }}>
            Não existe resposta certa. Escolha o que mais combina com você.
          </p>

          <div style={{ marginBottom: "1rem" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "0.82rem",
                marginBottom: "0.4rem",
              }}
            >
              <span className="muted">
                Pergunta {perguntaDiscIdx + 1} de {totalDisc}
              </span>
              <span style={{ color: "var(--color-accent)", fontWeight: 700 }}>
                {respondidasDisc}/{totalDisc} respondidas
              </span>
            </div>
            <div
              aria-hidden
              style={{
                height: 4,
                borderRadius: 999,
                background: "var(--color-border)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${((perguntaDiscIdx + 1) / totalDisc) * 100}%`,
                  background: "var(--color-accent)",
                  transition: "width 250ms ease",
                }}
              />
            </div>
          </div>

          <h3 style={{ fontSize: "1.05rem", margin: "0 0 1rem" }}>
            {perguntaDiscAtual.texto}
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            {perguntaDiscAtual.opcoes.map((opcao) => {
              const isSelected =
                estado.respostasDisc[perguntaDiscAtual.id] === opcao.id;
              return (
                <button
                  key={opcao.id}
                  type="button"
                  onClick={() => responderDisc(perguntaDiscAtual.id, opcao.id)}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "0.7rem",
                    padding: "0.85rem 1rem",
                    border: `2px solid ${isSelected ? "var(--color-accent)" : "var(--color-border)"}`,
                    borderRadius: "0.5rem",
                    background: isSelected
                      ? "rgba(226,172,64,0.12)"
                      : "transparent",
                    cursor: "pointer",
                    textAlign: "left",
                    width: "100%",
                  }}
                >
                  <span
                    style={{
                      flexShrink: 0,
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      border: `2px solid ${isSelected ? "var(--color-accent)" : "var(--color-border)"}`,
                      background: isSelected ? "var(--color-accent)" : "transparent",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginTop: 1,
                    }}
                  >
                    {isSelected && (
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: "var(--color-text-dark)",
                          display: "block",
                        }}
                      />
                    )}
                  </span>
                  <span style={{ lineHeight: 1.5, fontSize: "0.95rem" }}>
                    {opcao.texto}
                  </span>
                </button>
              );
            })}
          </div>

          <div
            style={{
              marginTop: "1rem",
              display: "flex",
              justifyContent: "space-between",
              gap: "0.5rem",
            }}
          >
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() =>
                setPerguntaDiscIdx((i) => Math.max(0, i - 1))
              }
              disabled={perguntaDiscIdx === 0}
            >
              ← Anterior
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() =>
                setPerguntaDiscIdx((i) =>
                  Math.min(totalDisc - 1, i + 1),
                )
              }
              disabled={perguntaDiscIdx >= totalDisc - 1}
            >
              Próxima →
            </button>
          </div>

          {erros.disc && <p className="error" style={{ marginTop: "1rem" }}>{erros.disc}</p>}
        </fieldset>
      )}

      {erroGeral && (
        <p className="error" style={{ marginTop: "1rem" }}>
          {erroGeral}
        </p>
      )}

      <div
        style={{
          marginTop: "2rem",
          display: "flex",
          gap: "0.75rem",
          justifyContent: "space-between",
          flexWrap: "wrap",
        }}
      >
        {passo > 1 ? (
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => setPasso((p) => (p - 1) as Passo)}
          >
            Voltar
          </button>
        ) : (
          <span />
        )}
        {passo < 4 ? (
          <button type="button" className="btn btn-primary" onClick={avancar}>
            Continuar
          </button>
        ) : (
          <button
            type="submit"
            className="btn btn-primary"
            disabled={enviando || respondidasDisc < totalDisc}
            aria-disabled={enviando || respondidasDisc < totalDisc}
          >
            {enviando ? "Enviando..." : "Concluir cadastro"}
          </button>
        )}
      </div>
    </form>
  );
}
