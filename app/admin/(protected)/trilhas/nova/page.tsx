import Link from "next/link";
import FormularioTrilha from "@/components/admin/FormularioTrilha";

export default function NovaTrilhaPage() {
  return (
    <div>
      <Link href="/admin/trilhas" className="muted" style={{ textDecoration: "none" }}>
        ← voltar
      </Link>
      <h1 style={{ fontSize: "1.75rem", marginTop: "1rem", marginBottom: "1.5rem" }}>
        Nova trilha
      </h1>
      <FormularioTrilha />
    </div>
  );
}
