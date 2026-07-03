"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  BRANDING_DEFAULTS,
  LOGO_DIMENSAO_MAX_PX,
  LOGO_PADRAO,
  LOGO_TAMANHO_MAX_MB,
} from "@/lib/branding/defaults";
import { validarContrasteAa } from "@/lib/branding/contrast";

export type BrandingInicial = {
  logoUrl: string | null;
  corBackground: string | null;
  corSurface: string | null;
  corAccent: string | null;
  corText: string | null;
};

type Props = {
  organizacaoId: string;
  nomeOrganizacao: string;
  inicial: BrandingInicial;
};

type CoresEstado = {
  corBackground: string | null;
  corSurface: string | null;
  corAccent: string | null;
  corText: string | null;
};

const DEFAULTS = {
  corBackground: BRANDING_DEFAULTS["--color-background"],
  corSurface: BRANDING_DEFAULTS["--color-surface"],
  corAccent: BRANDING_DEFAULTS["--color-accent"],
  corText: BRANDING_DEFAULTS["--color-text"],
} as const;

function efetiva(cor: string | null, padrao: string): string {
  return cor ?? padrao;
}

type CorCampoProps = {
  id: string;
  label: string;
  valor: string | null;
  padrao: string;
  onChange: (valor: string | null) => void;
};

function CampoCor({ id, label, valor, padrao, onChange }: CorCampoProps) {
  const exibicao = efetiva(valor, padrao);
  const customizado = valor !== null;

  return (
    <div>
      <label className="label" htmlFor={id}>
        {label}
      </label>
      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
        <input
          id={id}
          type="color"
          value={exibicao}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          style={{
            width: 44,
            height: 44,
            padding: 0,
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-sm)",
            cursor: "pointer",
          }}
          aria-label={`${label} — seletor de cor`}
        />
        <input
          className="input"
          type="text"
          value={exibicao}
          onChange={(e) => {
            const v = e.target.value.trim();
            if (/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(v)) {
              onChange(v.toUpperCase());
            }
          }}
          style={{ maxWidth: 120, fontFamily: "monospace" }}
        />
        {customizado ? (
          <button type="button" className="btn btn-ghost" onClick={() => onChange(null)}>
            Usar padrão
          </button>
        ) : (
          <span className="muted" style={{ fontSize: "0.8rem" }}>
            Padrão Léguas
          </span>
        )}
      </div>
    </div>
  );
}

export default function FormularioPersonalizacao({
  organizacaoId,
  nomeOrganizacao,
  inicial,
}: Props) {
  const router = useRouter();
  const [cores, setCores] = useState<CoresEstado>({
    corBackground: inicial.corBackground,
    corSurface: inicial.corSurface,
    corAccent: inicial.corAccent,
    corText: inicial.corText,
  });
  const [logoUrl, setLogoUrl] = useState(inicial.logoUrl);
  const [logoArquivo, setLogoArquivo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (logoPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(logoPreview);
      }
    };
  }, [logoPreview]);

  const preview = useMemo(
    () => ({
      fundo: efetiva(cores.corBackground, DEFAULTS.corBackground),
      surface: efetiva(cores.corSurface, DEFAULTS.corSurface),
      texto: efetiva(cores.corText, DEFAULTS.corText),
      accent: efetiva(cores.corAccent, DEFAULTS.corAccent),
      logo: logoPreview ?? logoUrl ?? LOGO_PADRAO,
    }),
    [cores, logoUrl, logoPreview],
  );

  const contraste = useMemo(
    () => validarContrasteAa(preview.texto, preview.fundo),
    [preview.texto, preview.fundo],
  );

  const temAlteracoesPendentes =
    logoArquivo !== null ||
    cores.corBackground !== inicial.corBackground ||
    cores.corSurface !== inicial.corSurface ||
    cores.corAccent !== inicial.corAccent ||
    cores.corText !== inicial.corText;

  function atualizaCor<K extends keyof CoresEstado>(campo: K, valor: CoresEstado[K]) {
    setCores((s) => ({ ...s, [campo]: valor }));
    setSucesso(null);
  }

  function limparPreviewBlob() {
    if (logoPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(logoPreview);
    }
    setLogoPreview(null);
    setLogoArquivo(null);
  }

  function onLogoChange(file: File | undefined) {
    if (!file) return;
    if (logoPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(logoPreview);
    }
    setLogoArquivo(file);
    setLogoPreview(URL.createObjectURL(file));
    setSucesso(null);
    setErro(null);
  }

  async function salvarPersonalizacao(e: FormEvent) {
    e.preventDefault();
    if (!contraste.ok) return;

    setSalvando(true);
    setErro(null);
    setSucesso(null);

    try {
      const respCores = await fetch(`/api/admin/organizacoes/${organizacaoId}/branding`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cores),
      });
      const dataCores = await respCores.json().catch(() => ({}));
      if (!respCores.ok) {
        setErro(dataCores.error ?? "Não foi possível salvar as cores.");
        setSalvando(false);
        return;
      }

      if (logoArquivo) {
        const fd = new FormData();
        fd.append("logo", logoArquivo);
        const respLogo = await fetch(`/api/admin/organizacoes/${organizacaoId}/branding`, {
          method: "POST",
          body: fd,
        });
        const dataLogo = await respLogo.json().catch(() => ({}));
        if (!respLogo.ok) {
          setErro(
            dataLogo.error ??
              "Cores salvas, mas o logo não pôde ser enviado. Tente escolher o arquivo de novo.",
          );
          setSalvando(false);
          router.refresh();
          return;
        }
        setLogoUrl(dataLogo.organizacao?.logoUrl ?? logoUrl);
        limparPreviewBlob();
      }

      setSucesso(
        logoArquivo
          ? "Personalização salva (cores e logo). Alunos verão as mudanças ao recarregar."
          : "Cores salvas. Alunos verão o novo tema ao recarregar.",
      );
      router.refresh();
    } catch {
      setErro("Erro de conexão ao salvar.");
    } finally {
      setSalvando(false);
    }
  }

  async function restaurarTudo() {
    if (!confirm("Restaurar cores e logo para o padrão do Léguas?")) return;
    setSalvando(true);
    setErro(null);
    setSucesso(null);

    try {
      const resp = await fetch(`/api/admin/organizacoes/${organizacaoId}/branding`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          corBackground: null,
          corSurface: null,
          corAccent: null,
          corText: null,
        }),
      });
      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        setErro(data.error ?? "Não foi possível restaurar.");
        setSalvando(false);
        return;
      }
      setCores({
        corBackground: null,
        corSurface: null,
        corAccent: null,
        corText: null,
      });
      setLogoUrl(null);
      limparPreviewBlob();
      setSucesso("Cores restauradas ao padrão. Envie um novo logo se quiser substituir o atual.");
      router.refresh();
    } catch {
      setErro("Erro de conexão.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <form onSubmit={salvarPersonalizacao}>
      <div
        style={{
          display: "grid",
          gap: "1.5rem",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          alignItems: "start",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div>
            <h1 style={{ fontSize: "1.75rem", margin: 0 }}>Personalização</h1>
            <p className="muted" style={{ margin: "0.35rem 0 0" }}>
              {nomeOrganizacao} — logo e paleta na área do aluno
            </p>
          </div>

          <div className="card" style={{ display: "grid", gap: "1rem" }}>
            <h2 style={{ fontSize: "1.1rem", margin: 0 }}>Cores</h2>

            <CampoCor
              id="corBackground"
              label="Fundo"
              valor={cores.corBackground}
              padrao={DEFAULTS.corBackground}
              onChange={(v) => atualizaCor("corBackground", v)}
            />
            <CampoCor
              id="corSurface"
              label="Superfície (cards, header)"
              valor={cores.corSurface}
              padrao={DEFAULTS.corSurface}
              onChange={(v) => atualizaCor("corSurface", v)}
            />
            <CampoCor
              id="corText"
              label="Texto"
              valor={cores.corText}
              padrao={DEFAULTS.corText}
              onChange={(v) => atualizaCor("corText", v)}
            />
            <CampoCor
              id="corAccent"
              label="Destaque (botões, links)"
              valor={cores.corAccent}
              padrao={DEFAULTS.corAccent}
              onChange={(v) => atualizaCor("corAccent", v)}
            />

            {!contraste.ok && (
              <p className="error" style={{ margin: 0 }}>
                Contraste texto/fundo: {contraste.ratio.toFixed(2)}:1 (mínimo 4.5:1). Ajuste antes de
                salvar.
              </p>
            )}
          </div>

          <div className="card" style={{ display: "grid", gap: "0.75rem" }}>
            <h2 style={{ fontSize: "1.1rem", margin: 0 }}>Logo</h2>
            <p className="muted" style={{ margin: 0, fontSize: "0.85rem" }}>
              PNG, JPG ou SVG · máx. {LOGO_TAMANHO_MAX_MB} MB · máx. {LOGO_DIMENSAO_MAX_PX}×
              {LOGO_DIMENSAO_MAX_PX} px
            </p>
            <label className="btn btn-secondary" style={{ width: "fit-content", cursor: "pointer" }}>
              Escolher arquivo
              <input
                type="file"
                accept="image/png,image/jpeg,image/svg+xml"
                style={{ display: "none" }}
                disabled={salvando}
                onChange={(e) => {
                  onLogoChange(e.target.files?.[0]);
                  e.target.value = "";
                }}
              />
            </label>
            {logoArquivo && (
              <p className="muted" style={{ margin: 0, fontSize: "0.85rem" }}>
                Selecionado: <strong>{logoArquivo.name}</strong> — aparece na pré-visualização.
                Clique em Salvar para aplicar.
              </p>
            )}
            {!logoArquivo && logoUrl && (
              <p className="muted" style={{ margin: 0, fontSize: "0.8rem", wordBreak: "break-all" }}>
                Logo atual: {logoUrl}
              </p>
            )}
          </div>
        </div>

        <section className="card">
          <h2 style={{ fontSize: "1.1rem", margin: "0 0 1rem" }}>Pré-visualização</h2>
          <div
            style={{
              borderRadius: "var(--radius-md)",
              overflow: "hidden",
              border: "1px solid var(--color-border)",
            }}
          >
            <div
              style={{
                background: preview.fundo,
                color: preview.texto,
                padding: "1rem 1.25rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottom: `1px solid ${preview.surface}`,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview.logo}
                alt="Logo"
                width={56}
                height={56}
                style={{ objectFit: "contain" }}
              />
              <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>Área do aluno</span>
            </div>
            <div style={{ background: preview.fundo, padding: "1.25rem" }}>
              <div
                style={{
                  background: preview.surface,
                  borderRadius: "var(--radius-md)",
                  padding: "1.25rem",
                  color: preview.texto,
                }}
              >
                <p style={{ margin: "0 0 0.75rem", fontWeight: 700 }}>Mapa de trilhas</p>
                <p style={{ margin: "0 0 1rem", fontSize: "0.9rem", opacity: 0.85 }}>
                  Exemplo de como cards e botões aparecem para os estudantes.
                </p>
                <button
                  type="button"
                  style={{
                    background: preview.accent,
                    color: preview.fundo,
                    border: "none",
                    borderRadius: "var(--radius-sm)",
                    padding: "0.65rem 1.1rem",
                    fontWeight: 700,
                    cursor: "default",
                    minHeight: 44,
                  }}
                >
                  Simular um curso
                </button>
              </div>
            </div>
          </div>
          <p className="muted" style={{ margin: "0.75rem 0 0", fontSize: "0.8rem" }}>
            Contraste texto/fundo: {contraste.ratio.toFixed(2)}:1
            {contraste.ok ? " (OK)" : " — abaixo do mínimo AA"}
          </p>
        </section>
      </div>

      <div
        style={{
          marginTop: "1.5rem",
          paddingTop: "1.25rem",
          borderTop: "1px solid var(--color-border)",
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
        }}
      >
        {erro && <p className="error" style={{ margin: 0 }}>{erro}</p>}
        {sucesso && (
          <p style={{ color: "var(--color-success)", margin: 0 }}>{sucesso}</p>
        )}

        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={salvando || !contraste.ok || !temAlteracoesPendentes}
          >
            {salvando ? "Salvando…" : "Salvar personalização"}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => void restaurarTudo()}
            disabled={salvando}
          >
            Restaurar padrão Léguas
          </button>
        </div>
        {!temAlteracoesPendentes && !sucesso && (
          <p className="muted" style={{ margin: 0, fontSize: "0.85rem" }}>
            Altere cores ou escolha um logo para habilitar o salvamento.
          </p>
        )}
      </div>
    </form>
  );
}
