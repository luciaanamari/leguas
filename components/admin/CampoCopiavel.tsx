"use client";

import BotaoCopiar from "./BotaoCopiar";

export default function CampoCopiavel({
  label,
  valor,
}: {
  label: string;
  valor: string | null;
}) {
  const temValor = !!valor && valor.trim().length > 0;
  return (
    <div>
      <p className="muted" style={{ fontSize: "0.8rem", margin: 0 }}>
        {label}
      </p>
      <p style={{ margin: 0, display: "flex", alignItems: "center", gap: "0.35rem" }}>
        <span style={{ wordBreak: "break-all" }}>{temValor ? valor : "-"}</span>
        {temValor && <BotaoCopiar valor={valor} titulo={`Copiar ${label.toLowerCase()}`} />}
      </p>
    </div>
  );
}
