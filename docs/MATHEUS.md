# Manual de Implementação — Matheus

> **Tarefa:** Adicionar a logo do Légua na aba do navegador (favicon) e no topo do site (navbar).

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
git checkout matheus_dev
git pull origin matheus_dev
```

### 1.3. Copiar variáveis de ambiente

```bash
cp .env.example .env.local
```

Não precisa alterar nada no `.env.local` para esta tarefa — os valores padrão funcionam para desenvolvimento.

### 1.4. Subir os containers

```bash
docker compose up --build
```

Espere até ver no terminal a mensagem:

```
✓ Ready in ...
- Local:        http://localhost:3000
```

Abra `http://localhost:3000` no navegador para confirmar que o site carregou.

---

## 2. Receber os arquivos da logo

Antes de mexer no código, peça ao designer/responsável **três arquivos**:

| Arquivo | Formato | Tamanho |
|---|---|---|
| `icon.svg` | SVG | vetorial |
| `apple-icon.png` | PNG | 180×180 px |
| `favicon.ico` | ICO | 32×32 px (multi-resolução) |

E mais um arquivo para a navbar:

| Arquivo | Formato | Tamanho |
|---|---|---|
| `logo.svg` (ou `logo.png`) | SVG ou PNG | SVG é o ideal. Se for PNG, 120 px de altura |

Coloque os arquivos da seguinte forma:

```
leguas/
├── app/
│   ├── icon.svg         ← favicon principal
│   ├── apple-icon.png   ← ícone iPhone
│   └── favicon.ico      ← fallback navegadores antigos
└── public/
    └── images/
        └── logo.svg     ← logo da navbar
```

> Se a pasta `public/images/` não existir, crie-a.

---

## 3. Modificar o código

### 3.1. Adicionar a logo na navbar

**Arquivo:** [app/(auth)/layout.tsx](../app/(auth)/layout.tsx)

**Localize este bloco (linhas 1 a 6):**

```tsx
import { redirect } from "next/navigation";
import Link from "next/link";
import { lerSessaoEstudante } from "@/lib/auth";
import { prisma } from "@/lib/db";
import LogoutButton from "@/components/ui/LogoutButton";
```

**Substitua por:**

```tsx
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { lerSessaoEstudante } from "@/lib/auth";
import { prisma } from "@/lib/db";
import LogoutButton from "@/components/ui/LogoutButton";
```

> **O que mudou:** Adicionamos `import Image from "next/image"`. O `Image` é um componente otimizado do Next.js para imagens.

---

**Agora localize este bloco (linhas 37 a 47):**

```tsx
          <Link
            href="/trilhas"
            style={{
              color: "var(--color-text)",
              textDecoration: "none",
              fontWeight: 700,
              letterSpacing: "0.04em",
            }}
          >
            Légua
          </Link>
```

**Substitua por:**

```tsx
          <Link
            href="/trilhas"
            style={{
              display: "flex",
              alignItems: "center",
              textDecoration: "none",
            }}
            aria-label="Légua — voltar para o mapa de trilhas"
          >
            <Image
              src="/images/logo.svg"
              alt="Légua"
              width={120}
              height={32}
              priority
            />
          </Link>
```

> **O que mudou:** Trocamos o texto "Légua" por uma `<Image>` que aponta para o arquivo `public/images/logo.svg`. O `priority` faz a logo carregar antes — é importante por estar no topo da página.

---

### 3.2. Atualizar o `themeColor` da aba

**Arquivo:** [app/layout.tsx](../app/layout.tsx)

**Localize (linha 14):**

```tsx
  themeColor: "#ffffff",
```

**Substitua por:**

```tsx
  themeColor: "#12203C",
```

> **O que mudou:** A cor azul escura do Légua (`#12203C`) aparece na barra superior do navegador em alguns celulares Android quando o usuário entra no site.

---

## 4. Salvar e testar

### 4.1. Salvar os arquivos

No VS Code: `Ctrl + S` em cada arquivo modificado. **Importante:** verifique no canto inferior direito se está como `LF` (não `CRLF`).

### 4.2. Reiniciar os containers

No terminal onde o Docker está rodando, pressione `Ctrl + C` para parar. Depois:

```bash
docker compose down
docker compose up --build
```

> Os arquivos da pasta `app/` (favicon, icon) só são detectados quando o Next.js inicia, por isso o restart é necessário.

### 4.3. Verificar

1. Abra `http://localhost:3000` no navegador.
2. **Aba do navegador:** confira se a logo aparece no lugar do ícone padrão. Se não aparecer, force atualização com `Ctrl + Shift + R`.
3. **Cadastro:** crie um cadastro de teste para entrar no site autenticado.
4. **Navbar:** depois de entrar, confira se a logo aparece no topo da página (substituindo o texto "Légua").
5. **Celular Android:** se possível, abra no celular pelo IP da sua máquina e confira a cor azul escura da barra superior.

---

## 5. Subir as alterações

Quando tudo estiver funcionando:

```bash
git add .
git commit -m "feat: adiciona logo na aba do navegador e na navbar"
git push origin matheus_dev
```

Avise o time que a branch está pronta para revisão.
