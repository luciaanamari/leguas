"use client";

import { useState, useEffect, useRef, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { perguntasDisc } from "@/lib/data/quiz-disc";
import { cursosTecnicos } from "@/lib/data/cursos-tecnicos";
import QuizDisc, {
  contarRespostasDisc,
  quizDiscCompleto,
  serializarRespostasDisc,
} from "@/components/cadastro/QuizDisc";

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

type SexoOpcao = "FEMININO" | "MASCULINO" | "NAO_INFORMADO";

type OpcaoDisc = "A" | "B" | "C" | "D";

type EstadoForm = {
  // Passo 1
  nome: string;
  email: string;
  senha: string;
  confirmarSenha: string;
  dataNascimento: string;
  sexo: "" | SexoOpcao;
  cpf: string;
  whatsapp: string;
  rendaFamiliar: "" | RendaOpcao;
  // Passo 2
  organizacaoId: string;
  escolaId: string;
  escolaNome: string;
  matricula: string;
  escolaAno: "" | "PRIMEIRO" | "SEGUNDO" | "TERCEIRO";
  cursoTecnico: string;
  // Passo 3
  perfilEmpreendedor: "" | PerfilEmpreendedorOpcao;
  preocupacoes: PreocupacaoOpcao[];
  // Passo 4 - respostas DISC indexadas por perguntaId
  respostasDisc: Record<number, OpcaoDisc | undefined>;
};

const inicial: EstadoForm = {
  nome: "",
  email: "",
  senha: "",
  confirmarSenha: "",
  dataNascimento: "",
  sexo: "",
  cpf: "",
  whatsapp: "",
  rendaFamiliar: "",
  organizacaoId: "",
  escolaId: "",
  escolaNome: "",
  matricula: "",
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

const opcoesSexo: { value: SexoOpcao; label: string }[] = [
  { value: "FEMININO", label: "Feminino" },
  { value: "MASCULINO", label: "Masculino" },
  { value: "NAO_INFORMADO", label: "Prefiro não informar" },
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

function IconeOlho({ aberto }: { aberto: boolean }) {
  const comum = {
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  return aberto ? (
    <svg {...comum}>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg {...comum}>
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 19c-6.5 0-10-7-10-7a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 5c6.5 0 10 7 10 7a18.5 18.5 0 0 1-2.16 3.19" />
      <path d="M9.9 9.9a3 3 0 1 0 4.2 4.2" />
      <line x1="2" y1="2" x2="22" y2="22" />
    </svg>
  );
}

function CampoSenha({
  id,
  label,
  placeholder,
  value,
  onChange,
  erro,
  marginTop,
}: {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  erro?: string;
  marginTop?: string;
}) {
  const [mostrar, setMostrar] = useState(false);
  return (
    <>
      <label
        className="label"
        htmlFor={id}
        style={marginTop ? { marginTop } : undefined}
      >
        {label}
      </label>
      <div style={{ position: "relative" }}>
        <input
          id={id}
          className="input"
          type={mostrar ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete="new-password"
          style={{ paddingRight: "3rem" }}
        />
        <button
          type="button"
          onClick={() => setMostrar((v) => !v)}
          aria-label={mostrar ? "Ocultar senha" : "Mostrar senha"}
          aria-pressed={mostrar}
          title={mostrar ? "Ocultar senha" : "Mostrar senha"}
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            height: "100%",
            width: "2.75rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "transparent",
            border: 0,
            cursor: "pointer",
            color: "var(--color-text-muted)",
            padding: 0,
          }}
        >
          <IconeOlho aberto={mostrar} />
        </button>
      </div>
      {erro && <p className="error">{erro}</p>}
    </>
  );
}

function SelecaoCursoTecnico({
  value,
  onChange,
}: {
  value: string;
  onChange: (slug: string) => void;
}) {
  // Inicializa o texto do campo com o nome do curso ja selecionado
  // (importante ao voltar para o passo 2, que remonta o componente).
  const [busca, setBusca] = useState(
    () => cursosTecnicos.find((c) => c.slug === value)?.nome ?? "",
  );
  const [aberto, setAberto] = useState(false);
  const [destaque, setDestaque] = useState(-1);
  const wrapRef = useRef<HTMLDivElement>(null);

  const termo = busca.trim().toLowerCase();
  // Filtra apenas quando o texto digitado nao for exatamente o curso ja
  // selecionado — assim, abrir o campo com uma selecao mostra a lista inteira.
  const nomeSelecionado = cursosTecnicos.find((c) => c.slug === value)?.nome;
  const filtrados =
    termo && termo !== nomeSelecionado?.toLowerCase()
      ? cursosTecnicos.filter((c) => c.nome.toLowerCase().includes(termo))
      : cursosTecnicos;

  // Fecha o dropdown ao clicar fora
  useEffect(() => {
    function fora(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setAberto(false);
      }
    }
    document.addEventListener("mousedown", fora);
    return () => document.removeEventListener("mousedown", fora);
  }, []);

  function selecionar(slug: string, nome: string) {
    onChange(slug);
    setBusca(nome);
    setAberto(false);
    setDestaque(-1);
  }

  function limpar() {
    onChange("");
    setBusca("");
    setAberto(false);
    setDestaque(-1);
  }

  return (
    <div ref={wrapRef} style={{ position: "relative" }}>
      <input
        id="tecnico"
        className="input"
        type="text"
        role="combobox"
        aria-expanded={aberto}
        aria-autocomplete="list"
        aria-controls="lista-tecnicos"
        autoComplete="off"
        placeholder="Digite para buscar seu curso técnico"
        value={busca}
        style={{ paddingRight: value || busca ? "2.75rem" : undefined }}
        onFocus={(e) => {
          setAberto(true);
          e.target.select();
        }}
        onChange={(e) => {
          setBusca(e.target.value);
          setAberto(true);
          setDestaque(-1);
          if (e.target.value === "" && value) onChange("");
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setAberto(true);
            setDestaque((i) => Math.min(filtrados.length - 1, i + 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setDestaque((i) => Math.max(0, i - 1));
          } else if (e.key === "Enter") {
            if (aberto && destaque >= 0 && filtrados[destaque]) {
              e.preventDefault();
              selecionar(filtrados[destaque].slug, filtrados[destaque].nome);
            }
          } else if (e.key === "Escape") {
            setAberto(false);
          }
        }}
      />
      {(value || busca) && (
        <button
          type="button"
          onClick={limpar}
          aria-label="Limpar seleção"
          title="Limpar seleção"
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            height: "100%",
            width: "2.75rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "transparent",
            border: 0,
            cursor: "pointer",
            color: "var(--color-text-muted)",
            fontSize: "1.25rem",
            lineHeight: 1,
            padding: 0,
          }}
        >
          ×
        </button>
      )}

      {aberto && (
        <ul
          id="lista-tecnicos"
          role="listbox"
          style={{
            position: "absolute",
            zIndex: 20,
            top: "calc(100% + 4px)",
            left: 0,
            right: 0,
            maxHeight: 240,
            overflowY: "auto",
            margin: 0,
            padding: 4,
            listStyle: "none",
            background: "#ffffff",
            border: "2px solid var(--color-border)",
            borderRadius: "var(--radius-sm)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
          }}
        >
          <li role="option" aria-selected={value === ""}>
            <button
              type="button"
              onClick={limpar}
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                padding: "0.6rem 0.75rem",
                border: 0,
                borderRadius: "0.4rem",
                cursor: "pointer",
                background: value === "" ? "var(--color-accent-soft)" : "transparent",
                color: "var(--color-text-muted)",
                fontStyle: "italic",
              }}
            >
              Não faço nenhum
            </button>
          </li>

          {filtrados.length === 0 ? (
            <li
              style={{
                padding: "0.6rem 0.75rem",
                color: "var(--color-text-muted)",
              }}
            >
              Nenhum curso encontrado
            </li>
          ) : (
            filtrados.map((c, idx) => {
              const sel = c.slug === value;
              const hi = idx === destaque;
              return (
                <li key={c.slug} role="option" aria-selected={sel}>
                  <button
                    type="button"
                    onMouseEnter={() => setDestaque(idx)}
                    onClick={() => selecionar(c.slug, c.nome)}
                    style={{
                      display: "block",
                      width: "100%",
                      textAlign: "left",
                      padding: "0.6rem 0.75rem",
                      border: 0,
                      borderRadius: "0.4rem",
                      cursor: "pointer",
                      background:
                        hi || sel ? "var(--color-accent-soft)" : "transparent",
                      color: "var(--color-text)",
                      fontWeight: sel ? 700 : 400,
                    }}
                  >
                    {c.nome}
                  </button>
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
}

export type EscolaContexto = {
  organizacaoId: string;
  escolaId: string;
  escolaNome: string;
  organizacaoNome: string;
};

export default function PassoCadastro({
  escolaContexto,
}: {
  escolaContexto?: EscolaContexto;
} = {}) {
  const router = useRouter();
  const [passo, setPasso] = useState<Passo>(1);
  const [estado, setEstado] = useState<EstadoForm>(() =>
    escolaContexto
      ? {
          ...inicial,
          organizacaoId: escolaContexto.organizacaoId,
          escolaId: escolaContexto.escolaId,
        }
      : inicial,
  );
  const [erros, setErros] = useState<Record<string, string>>({});
  const [enviando, setEnviando] = useState(false);
  const [verificando, setVerificando] = useState(false);
  const [erroGeral, setErroGeral] = useState<string | null>(null);

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

    if (!estado.sexo) novos.sexo = "Selecione uma opção";

    // CPF é opcional: só valida se algo foi digitado.
    const cpfDig = estado.cpf.replace(/\D/g, "");
    if (cpfDig.length > 0) {
      if (cpfDig.length !== 11) novos.cpf = "CPF deve ter 11 dígitos";
      else if (!validaCpfMath(estado.cpf))
        novos.cpf = "CPF inválido. Verifique os números digitados.";
    }

    const wapp = estado.whatsapp.replace(/\D/g, "");
    if (wapp.length > 0 && (wapp.length < 10 || wapp.length > 11))
      novos.whatsapp = "WhatsApp inválido (10 ou 11 dígitos)";
    if (!estado.rendaFamiliar) novos.rendaFamiliar = "Selecione uma faixa de renda";
    setErros(novos);
    return Object.keys(novos).length === 0;
  }

  function validaPasso2(): boolean {
    const novos: Record<string, string> = {};
    // No cadastro por link institucional a matrícula é obrigatória (só no front).
    if (escolaContexto && !estado.matricula.trim()) {
      novos.matricula = "Informe a sua matrícula";
    }
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
    if (!quizDiscCompleto(estado.respostasDisc)) {
      const faltam = perguntasDisc.length - contarRespostasDisc(estado.respostasDisc);
      novos.disc = `Responda todas as ${perguntasDisc.length} perguntas (faltam ${faltam})`;
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
        sexo: estado.sexo,
        cpf: estado.cpf,
        whatsapp: estado.whatsapp,
        rendaFamiliar: estado.rendaFamiliar,
        organizacaoId: estado.organizacaoId,
        escolaId: estado.escolaId,
        escolaNome: estado.escolaNome,
        matricula: estado.matricula,
        escolaAno: estado.escolaAno,
        cursoTecnico: estado.cursoTecnico,
        perfilEmpreendedor: estado.perfilEmpreendedor,
        preocupacoes: estado.preocupacoes,
        respostasDisc: serializarRespostasDisc(estado.respostasDisc),
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

      // Verifica no servidor se o e-mail e o CPF ja estao em uso
      setVerificando(true);
      try {
        const [respEmail, respCpf] = await Promise.all([
          fetch("/api/estudantes/verificar-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: estado.email }),
          }),
          fetch("/api/estudantes/verificar-cpf", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cpf: estado.cpf }),
          }),
        ]);
        const dataEmail = (await respEmail.json()) as {
          valido: boolean;
          existe: boolean;
        };
        const dataCpf = (await respCpf.json()) as { existe: boolean };

        const novos: Record<string, string> = {};
        if (!dataEmail.valido) {
          novos.email = "Informe um e-mail válido";
        } else if (dataEmail.existe) {
          novos.email =
            "Já existe uma conta com esse e-mail. Faça login para continuar.";
        }
        if (dataCpf.existe) {
          novos.cpf = "Já existe um cadastro com esse CPF.";
        }
        if (Object.keys(novos).length > 0) {
          setErros(novos);
          return;
        }
      } catch {
        setErros({
          email: "Não foi possível verificar seus dados agora. Tente novamente.",
        });
        return;
      } finally {
        setVerificando(false);
      }

      setPasso(2);
    } else if (passo === 2 && validaPasso2()) {
      setPasso(3);
    } else if (passo === 3 && validaPasso3()) {
      setPasso(4);
    }
  }

  const totalDisc = perguntasDisc.length;
  const respondidasDisc = contarRespostasDisc(estado.respostasDisc);

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

          <CampoSenha
            id="senha"
            label="Senha"
            placeholder="Mínimo 8 caracteres"
            value={estado.senha}
            onChange={(v) => atualiza("senha", v)}
            erro={erros.senha}
            marginTop="1rem"
          />

          <CampoSenha
            id="confirmar"
            label="Confirmar senha"
            placeholder="Repita a senha"
            value={estado.confirmarSenha}
            onChange={(v) => atualiza("confirmarSenha", v)}
            erro={erros.confirmarSenha}
            marginTop="1rem"
          />

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

          <label className="label" htmlFor="sexo" style={{ marginTop: "1rem" }}>
            Sexo
          </label>
          <p className="muted" style={{ marginBottom: "0.5rem", fontSize: "0.85rem" }}>
            Usado apenas para estatísticas. Não influencia seu resultado de compatibilidade.
          </p>
          <select
            id="sexo"
            className="select"
            value={estado.sexo}
            onChange={(e) => atualiza("sexo", e.target.value as SexoOpcao)}
          >
            <option value="">Selecione</option>
            {opcoesSexo.map((op) => (
              <option key={op.value} value={op.value}>
                {op.label}
              </option>
            ))}
          </select>
          {erros.sexo && <p className="error">{erros.sexo}</p>}

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
            Usamos o CPF para identificar sua conta de forma única.
          </p>
          {erros.cpf && <p className="error">{erros.cpf}</p>}

          <label className="label" htmlFor="whats" style={{ marginTop: "1rem" }}>
            WhatsApp
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

          {escolaContexto ? (
            <>
              <div
                className="card"
                style={{ background: "var(--color-surface)", marginBottom: "1rem" }}
              >
                <p className="muted" style={{ margin: 0, fontSize: "0.8rem" }}>
                  Você está se cadastrando em
                </p>
                <strong style={{ display: "block", fontSize: "1.05rem", marginTop: "0.15rem" }}>
                  {escolaContexto.escolaNome}
                </strong>
                <span className="muted" style={{ fontSize: "0.9rem" }}>
                  {escolaContexto.organizacaoNome}
                </span>
              </div>

              <label className="label" htmlFor="matricula">
                Matrícula
              </label>
              <input
                id="matricula"
                className="input"
                type="text"
                maxLength={50}
                placeholder="Número da sua matrícula na escola"
                value={estado.matricula}
                onChange={(e) => atualiza("matricula", e.target.value)}
              />
              {erros.matricula && <p className="error">{erros.matricula}</p>}
            </>
          ) : (
            <>
              <label className="label" htmlFor="escolaNome">
                Nome da escola onde você estuda
              </label>
              <input
                id="escolaNome"
                className="input"
                type="text"
                maxLength={120}
                placeholder="Ex.: Escola Estadual José de Deus"
                value={estado.escolaNome}
                onChange={(e) => atualiza("escolaNome", e.target.value)}
              />
            </>
          )}

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
          <SelecaoCursoTecnico
            value={estado.cursoTecnico}
            onChange={(slug) => atualiza("cursoTecnico", slug)}
          />
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

      {passo === 4 && (
        <QuizDisc
          respostas={estado.respostasDisc}
          onChange={(respostas) => atualiza("respostasDisc", respostas)}
          erro={erros.disc}
        />
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
          <button
            type="button"
            className="btn btn-primary"
            onClick={avancar}
            disabled={verificando}
            aria-disabled={verificando}
          >
            {verificando ? "Verificando..." : "Continuar"}
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
