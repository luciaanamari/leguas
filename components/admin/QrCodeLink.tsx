"use client";

import { useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";

export default function QrCodeLink({ url, titulo }: { url: string; titulo?: string }) {
  const [aberto, setAberto] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const nomeArquivo = `qrcode-${(titulo ?? "link").replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.png`;

  function pegarCanvas(): HTMLCanvasElement | null {
    return wrapRef.current?.querySelector("canvas") ?? null;
  }

  function baixarPng() {
    const canvas = pegarCanvas();
    if (!canvas) return;
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = nomeArquivo;
    a.click();
  }

  async function compartilhar() {
    setMsg(null);
    const canvas = pegarCanvas();
    // Tenta compartilhar a imagem do QR (bom para redes sociais no celular).
    try {
      if (canvas && navigator.canShare) {
        const blob: Blob | null = await new Promise((r) => canvas.toBlob(r, "image/png"));
        if (blob) {
          const file = new File([blob], nomeArquivo, { type: "image/png" });
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({ files: [file], title: titulo ?? "Cadastro Léguas", text: url });
            return;
          }
        }
      }
      if (navigator.share) {
        await navigator.share({ title: titulo ?? "Cadastro Léguas", text: url, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setMsg("Compartilhamento não disponível — link copiado.");
    } catch {
      // usuário cancelou ou falhou: silencioso
    }
  }

  return (
    <div>
      <button
        type="button"
        className="btn btn-ghost"
        style={{ fontSize: "0.85rem", padding: "0.35rem 0.6rem" }}
        aria-expanded={aberto}
        onClick={() => setAberto((v) => !v)}
      >
        {aberto ? "Ocultar QR" : "QR code"}
      </button>
      {aberto && (
        <div style={{ marginTop: "0.5rem" }}>
          <div
            ref={wrapRef}
            style={{
              padding: "0.75rem",
              background: "#ffffff",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-sm)",
              display: "inline-flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "0.4rem",
            }}
          >
            <QRCodeCanvas value={url} size={160} level="M" marginSize={2} />
            {titulo && (
              <span style={{ fontSize: "0.75rem", color: "#12203c", maxWidth: 160, textAlign: "center" }}>
                {titulo}
              </span>
            )}
          </div>
          <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem", flexWrap: "wrap" }}>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ fontSize: "0.85rem", padding: "0.35rem 0.7rem" }}
              onClick={baixarPng}
            >
              Baixar PNG
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              style={{ fontSize: "0.85rem", padding: "0.35rem 0.7rem" }}
              onClick={compartilhar}
            >
              Compartilhar
            </button>
          </div>
          {msg && (
            <p className="muted" style={{ fontSize: "0.8rem", marginTop: "0.35rem" }}>
              {msg}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
