# Manual de Implementação — Hyara

> **Tarefa:** Mudar os filtros da página de **Trilhas** (`/trilhas`). Hoje temos `Todos / Presencial / EAD / Técnico / Concurso / Mercado`. Queremos: `Todos / Ensino Superior / Técnico / Concurso Público / Mercado Direto`. O filtro **"Ensino Superior"** deve mostrar tanto Bacharelado (Presencial e EAD) quanto Tecnólogo.

---

## 1. Preparar o ambiente

### 1.1. Clonar o repositório

Abra o terminal (Git Bash recomendado no Windows) e rode:

```bash
git clone https://github.com/luciaanamari/leguas.git
cd leguas
```

### 1.2. Trocar para a sua branch

```bash
git checkout hyara_dev
git pull origin hyara_dev
```

### 1.3. Copiar variáveis de ambiente

```bash
cp .env.example .env.local
```

Não precisa alterar nada no `.env.local`.

### 1.4. Subir os containers

```bash
docker compose up --build
```

Espere até ver `Ready in ...` e abra `http://localhost:3000` para confirmar.

---

## 2. Entender o que vai mudar

Hoje cada trilha tem uma **modalidade** no banco (`PRESENCIAL`, `EAD`, `TECNICO`, `CONCURSO`, `MERCADO`) e o filtro funciona em cima dessa modalidade direta.

O problema é que "Bacharelado Presencial", "Bacharelado EAD" e "Tecnólogo" são todos **ensino superior**, mas hoje precisam de filtros separados.

A solução: criar **grupos** que mapeiam para uma ou mais modalidades:

| Filtro novo | Modalidades agrupadas |
|---|---|
| Ensino Superior | `PRESENCIAL` + `EAD` |
| Técnico | `TECNICO` |
| Concurso Público | `CONCURSO` |
| Mercado Direto | `MERCADO` |

Vamos mudar dois arquivos: o componente do filtro e a página que lista as trilhas.

---

## 3. Modificar o código

### 3.1. Atualizar o componente do filtro

**Arquivo:** [components/trilhas/FiltroTrilhas.tsx](../components/trilhas/FiltroTrilhas.tsx)

**Substitua TODO o conteúdo do arquivo por:**

```tsx
"use client";

import { useRouter } from "next/navigation";

export type GrupoTrilha = "superior" | "tecnico" | "concurso" | "mercado";

type Props = {
  selecionado: GrupoTrilha | null;
};

const opcoes: { valor: GrupoTrilha; rotulo: string }[] = [
  { valor: "superior", rotulo: "Ensino Superior" },
  { valor: "tecnico", rotulo: "Técnico" },
  { valor: "concurso", rotulo: "Concurso Público" },
  { valor: "mercado", rotulo: "Mercado Direto" },
];

export default function FiltroTrilhas({ selecionado }: Props) {
  const router = useRouter();

  function selecionar(g: GrupoTrilha | null) {
    if (g) router.push(`/trilhas?grupo=${g}`);
    else router.push(`/trilhas`);
  }

  return (
    <div
      role="group"
      aria-label="Filtrar trilhas por grupo"
      style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}
    >
      <button
        type="button"
        onClick={() => selecionar(null)}
        className={selecionado === null ? "btn btn-primary" : "btn btn-ghost"}
        style={{ minHeight: 38, padding: "0.4rem 0.9rem", fontSize: "0.9rem" }}
      >
        Todos
      </button>
      {opcoes.map((o) => (
        <button
          key={o.valor}
          type="button"
          onClick={() => selecionar(o.valor)}
          className={selecionado === o.valor ? "btn btn-primary" : "btn btn-ghost"}
          style={{ minHeight: 38, padding: "0.4rem 0.9rem", fontSize: "0.9rem" }}
          aria-pressed={selecionado === o.valor}
        >
          {o.rotulo}
        </button>
      ))}
    </div>
  );
}
```

> **O que mudou:**
> - Trocamos as 5 opções antigas pelas 4 novas (`superior`, `tecnico`, `concurso`, `mercado`).
> - O parâmetro da URL deixou de ser `?modalidade=` e virou `?grupo=` (mais fiel ao que ele representa agora).
> - O tipo `ModalidadeTrilha` do Prisma não é mais usado aqui — criamos um tipo novo `GrupoTrilha` próprio do filtro.

---

### 3.2. Atualizar a página de listagem de trilhas

**Arquivo:** [app/(auth)/trilhas/page.tsx](../app/(auth)/trilhas/page.tsx)

**Localize este bloco (linhas 1 a 35):**

```tsx
import Link from "next/link";
import { prisma } from "@/lib/db";
import { lerSessaoEstudante } from "@/lib/auth";
import CardTrilha from "@/components/trilhas/CardTrilha";
import FiltroTrilhas from "@/components/trilhas/FiltroTrilhas";
import type { ModalidadeTrilha } from "@prisma/client";

type SearchParams = Promise<{ modalidade?: string }>;

const modalidadesValidas: ModalidadeTrilha[] = [
  "PRESENCIAL",
  "EAD",
  "TECNICO",
  "CONCURSO",
  "MERCADO",
];

export default async function TrilhasPage({ searchParams }: { searchParams: SearchParams }) {
  const sessao = await lerSessaoEstudante();
  const sp = await searchParams;
  const filtroParam = sp.modalidade?.toUpperCase() ?? null;
  const filtro =
    filtroParam && (modalidadesValidas as string[]).includes(filtroParam)
      ? (filtroParam as ModalidadeTrilha)
      : null;

  const [estudante, trilhas] = await Promise.all([
    sessao
      ? prisma.estudante.findUnique({ where: { id: sessao.sub }, select: { nome: true } })
      : null,
    prisma.trilha.findMany({
      where: { ativo: true, ...(filtro ? { modalidade: filtro } : {}) },
      orderBy: { ordem: "asc" },
    }),
  ]);
```

**Substitua por:**

```tsx
import Link from "next/link";
import { prisma } from "@/lib/db";
import { lerSessaoEstudante } from "@/lib/auth";
import CardTrilha from "@/components/trilhas/CardTrilha";
import FiltroTrilhas, { type GrupoTrilha } from "@/components/trilhas/FiltroTrilhas";
import type { ModalidadeTrilha } from "@prisma/client";

type SearchParams = Promise<{ grupo?: string }>;

// Cada filtro da UI vira uma lista de modalidades que vamos buscar no banco.
const gruposParaModalidades: Record<GrupoTrilha, ModalidadeTrilha[]> = {
  superior: ["PRESENCIAL", "EAD"],
  tecnico: ["TECNICO"],
  concurso: ["CONCURSO"],
  mercado: ["MERCADO"],
};

function ehGrupoValido(v: string): v is GrupoTrilha {
  return v === "superior" || v === "tecnico" || v === "concurso" || v === "mercado";
}

export default async function TrilhasPage({ searchParams }: { searchParams: SearchParams }) {
  const sessao = await lerSessaoEstudante();
  const sp = await searchParams;
  const filtroParam = sp.grupo ?? null;
  const filtro = filtroParam && ehGrupoValido(filtroParam) ? filtroParam : null;

  const modalidadesAlvo = filtro ? gruposParaModalidades[filtro] : null;

  const [estudante, trilhas] = await Promise.all([
    sessao
      ? prisma.estudante.findUnique({ where: { id: sessao.sub }, select: { nome: true } })
      : null,
    prisma.trilha.findMany({
      where: {
        ativo: true,
        ...(modalidadesAlvo ? { modalidade: { in: modalidadesAlvo } } : {}),
      },
      orderBy: { ordem: "asc" },
    }),
  ]);
```

> **O que mudou:**
> - O parâmetro da URL agora é `?grupo=` em vez de `?modalidade=`.
> - Importamos o tipo `GrupoTrilha` direto do componente do filtro.
> - Criamos um **dicionário** (`gruposParaModalidades`) que diz: para o grupo "superior", busque trilhas com modalidade `PRESENCIAL` **ou** `EAD`.
> - A query do Prisma agora usa `modalidade: { in: [...] }` para buscar várias modalidades de uma vez.

---

### 3.3. Atualizar o nome da prop do filtro

Ainda no mesmo arquivo (`app/(auth)/trilhas/page.tsx`), **localize este bloco (linha 82):**

```tsx
      <FiltroTrilhas selecionada={filtro} />
```

**Substitua por:**

```tsx
      <FiltroTrilhas selecionado={filtro} />
```

> **O que mudou:** A prop trocou de `selecionada` (feminino, combinava com "modalidade") para `selecionado` (masculino, combina com "grupo"). É só consistência de nome com o componente novo.

---

## 4. Salvar e testar

### 4.1. Salvar os arquivos

No VS Code: `Ctrl + S` em cada arquivo modificado. Verifique no canto inferior direito se está como `LF`.

### 4.2. Reiniciar os containers

```bash
docker compose down
docker compose up --build
```

### 4.3. Verificar

1. Abra `http://localhost:3000` e faça login (ou cadastro).
2. Vá para `http://localhost:3000/trilhas`.
3. **Topo da página:** os botões de filtro devem ser exatamente:
   - `Todos`
   - `Ensino Superior`
   - `Técnico`
   - `Concurso Público`
   - `Mercado Direto`
4. Clique em **"Ensino Superior"** → a URL deve virar `/trilhas?grupo=superior` e devem aparecer **3 cards**: Bacharelado Presencial, Bacharelado EAD e Tecnólogo.
5. Clique em **"Técnico"** → URL `/trilhas?grupo=tecnico` → 1 card (Curso Técnico).
6. Clique em **"Concurso Público"** → URL `/trilhas?grupo=concurso` → 1 card (Concurso Público).
7. Clique em **"Mercado Direto"** → URL `/trilhas?grupo=mercado` → 1 card (Mercado Direto).
8. Clique em **"Todos"** → URL `/trilhas` (sem query string) → todos os 6 cards.

---

## 5. Subir as alterações

Quando tudo estiver funcionando:

```bash
git add .
git commit -m "feat: agrupa filtros de trilhas em ensino superior/tecnico/concurso/mercado"
git push origin hyara_dev
```

Avise o time que a branch está pronta para revisão.
