import Link from "next/link";
import Image from "next/image";
import { LOGO_PADRAO, brandingParaCss } from "@/lib/branding";
import type { BrandingResolvido } from "@/lib/branding";

/** Cabeçalho branded com o logo da instituição (ou o padrão do Léguas). */
export function CabecalhoInstituicao({
  branding,
  href,
}: {
  branding: BrandingResolvido;
  href: string;
}) {
  const logoCustomizado = branding.logoUrl !== LOGO_PADRAO;
  return (
    <header
      style={{
        borderBottom: "1px solid var(--color-border)",
        background: "var(--color-surface)",
      }}
    >
      <div
        className="container"
        style={{
          display: "flex",
          alignItems: "center",
          minHeight: "var(--header-height)",
          padding: "0.75rem 1.25rem",
        }}
      >
        <Link
          href={href}
          style={{ display: "flex", alignItems: "center", textDecoration: "none" }}
          aria-label="Página inicial da instituição"
        >
          {logoCustomizado ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={branding.logoUrl}
              alt="Logo da instituição"
              width={80}
              height={80}
              style={{ display: "block", objectFit: "contain" }}
            />
          ) : (
            <Image src={LOGO_PADRAO} alt="Léguas" width={80} height={80} priority />
          )}
        </Link>
      </div>
    </header>
  );
}

/** Injeta o branding (CSS vars) e envolve o conteúdo com fundo/cor da instituição. */
export function MolduraInstituicao({
  branding,
  children,
}: {
  branding: BrandingResolvido;
  children: React.ReactNode;
}) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: brandingParaCss(branding) }} />
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          background: "var(--color-background)",
          color: "var(--color-text)",
        }}
      >
        {children}
      </div>
    </>
  );
}
