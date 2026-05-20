"use client";

import { useEffect, useState } from "react";

export interface ItemConteudo {
  principal: string;
  secundario?: string;
  terciario?: string;
}

interface Props {
  rotuloBotao: string;
  tituloModal: string;
  itens: ItemConteudo[];
}

export default function ListaConteudoModal({
  rotuloBotao,
  tituloModal,
  itens,
}: Props) {
  const [aberto, setAberto] = useState(false);

  useEffect(() => {
    if (!aberto) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAberto(false);
    };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [aberto]);

  return (
    <>
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="btn btn-ghost"
        style={{ fontSize: "0.85rem", padding: "0.4rem 0.85rem" }}
      >
        {rotuloBotao} ({itens.length})
      </button>

      {aberto && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={tituloModal}
          onClick={() => setAberto(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.65)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "0.6rem",
              width: "100%",
              maxWidth: 640,
              maxHeight: "80vh",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
            }}
          >
            <header
              style={{
                padding: "1rem 1.25rem",
                borderBottom: "1px solid var(--color-border)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "1rem",
              }}
            >
              <div>
                <h2 style={{ fontSize: "1.1rem", margin: 0 }}>{tituloModal}</h2>
                <p
                  className="muted"
                  style={{ margin: "0.2rem 0 0", fontSize: "0.8rem" }}
                >
                  {itens.length} {itens.length === 1 ? "item" : "itens"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAberto(false)}
                aria-label="Fechar"
                style={{
                  background: "transparent",
                  border: "1px solid var(--color-border)",
                  color: "var(--color-text)",
                  borderRadius: "0.4rem",
                  width: 32,
                  height: 32,
                  cursor: "pointer",
                  fontSize: "1rem",
                  lineHeight: 1,
                }}
              >
                ✕
              </button>
            </header>

            <div
              style={{
                overflowY: "auto",
                padding: "0.5rem 1.25rem 1rem",
                flex: 1,
              }}
            >
              {itens.length === 0 ? (
                <p className="muted" style={{ padding: "1rem 0" }}>
                  Nenhum item.
                </p>
              ) : (
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {itens.map((item, i) => (
                    <li
                      key={i}
                      style={{
                        padding: "0.7rem 0",
                        borderBottom:
                          i === itens.length - 1
                            ? "none"
                            : "1px solid var(--color-border)",
                      }}
                    >
                      <p
                        style={{
                          margin: 0,
                          fontWeight: 600,
                          lineHeight: 1.45,
                        }}
                      >
                        {item.principal}
                      </p>
                      {item.secundario && (
                        <p
                          className="muted"
                          style={{
                            margin: "0.2rem 0 0",
                            fontSize: "0.82rem",
                            lineHeight: 1.5,
                          }}
                        >
                          {item.secundario}
                        </p>
                      )}
                      {item.terciario && (
                        <p
                          style={{
                            margin: "0.3rem 0 0",
                            fontSize: "0.85rem",
                            lineHeight: 1.55,
                            color: "var(--color-text)",
                          }}
                        >
                          {item.terciario}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
