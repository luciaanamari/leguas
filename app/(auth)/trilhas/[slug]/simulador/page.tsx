import { redirect } from "next/navigation";

type Params = Promise<{ slug: string }>;

// Rota legada. Hoje a simulacao e sempre por curso (ver
// /trilhas/[slug]/areas/[areaSlug]/[cursoSlug]/simulador), entao redirecionamos
// para a tela de areas para que o aluno escolha o curso primeiro.
export default async function SimuladorRedirect({ params }: { params: Params }) {
  const { slug } = await params;
  redirect(`/trilhas/${slug}/areas`);
}
