# Léguas

Plataforma web responsiva (mobile-first) que ajuda estudantes do 3º ano do ensino médio a descobrir caminhos depois da escola - bacharelado presencial, EAD, tecnólogo, curso técnico, concurso público e entrada direta no mercado.

O foco inicial é o Piauí. As narrativas dos cursos trazem referências do contexto nordestino.

---

## O que faz

**Para o estudante:**

- **Cadastro em 4 passos**: dados pessoais + renda familiar, escola + curso técnico (se houver), perfil empreendedor + preocupações, e um quiz vocacional de 8 perguntas com DISC integrado.
- **Perfil vocacional**: logo após o cadastro, o aluno vê o título do próprio perfil ("você comunica e inspira", "você cuida com paciência", etc.) e o detalhamento da área dominante (Humanas, Exatas, Biológicas).
- **Mapa de trilhas**: 6 caminhos pós-ensino-médio em cards visuais com descrição, custo e duração.
- **Catálogo de cursos**: 158 cursos organizados em 8 áreas. Cada curso tem narrativa "um dia como aluno" e "um dia como profissional" com contexto piauiense.
- **Simulação por curso**: o aluno escolhe um curso, lê a narrativa de aluno → responde 1 pergunta → lê a narrativa de profissional → responde 2 perguntas → vê o resultado.
- **Resultado com match**: pontuação 0-100 dividida em 60% afinidade de área (do quiz vocacional) + 40% identificação com a simulação. Faixas: Alta (≥65), Média (35-64), Baixa (<35).
- **Orientação curso técnico × curso simulado**: quando há ligação direta, transversal (ex: técnico em alimentos + engenharia de software = indústria 4.0) ou na mesma área, aparece um card explicando a conexão.
- **Blocos de contexto**: orientações personalizadas baseadas em renda, perfil empreendedor, preocupações e ano escolar (sem afetar a nota).
- **Histórico**: o estudante pode rever todas as simulações concluídas e repetir.
- **Compartilhamento via WhatsApp**: link pré-formatado com o resultado.

**Para o administrador:**

- **Dashboard** com contagens de estudantes, simulações iniciadas/concluídas e compartilhamentos.
- **CRUD de trilhas** (as 6 modalidades) e **profissões** vinculadas a cada trilha.
- **Listagem de estudantes** com busca, filtro por escola, ano e perfil DISC, e detalhe individual.
- **Painel "Conteúdo do produto"**: lista read-only com contagens e amostras de tudo que vive em código (cursos, perguntas, técnicos, tags) - para o admin saber o que existe e onde mexer.

---

## Stack

- **Runtime**: Node.js 24
- **Framework**: Next.js 16 (App Router, Turbopack)
- **Linguagem**: TypeScript
- **ORM**: Prisma 7 (com adapter `@prisma/adapter-pg`)
- **Banco**: PostgreSQL 16 (em container)
- **Autenticação**: JWT em cookie HTTPOnly (sessões separadas para estudante e admin)
- **Validação**: Zod
- **Containerização**: Docker + Docker Compose

Princípio BFF: front e back na mesma stack. Route Handlers em `app/api/**` e Server Components fazem a maior parte do trabalho. Sem servidor Express separado. Banco acessado exclusivamente via Prisma Client.

---

## Como o match funciona

1. **Quiz DISC do cadastro (60%)**: 8 perguntas determinam a área dominante do aluno (Humanas/Exatas/Biológicas) e seu perfil comportamental (D/I/S/C - Decisor, Influenciador, Estável, Analítico). O aluno nunca vê as siglas - só o título resultante ("você age, decide e lidera", etc.).
2. **Quiz do curso (40%)**: 3 perguntas específicas por curso (1 fase aluno peso 1 + 2 fase profissional peso 2) com respostas Sim / Mais ou menos / Não.
3. **Bônus por curso técnico**: se o aluno cadastrou um técnico, ganha +10 (correlação direta), +5 (correlação transversal via setor em comum) ou +3 (mesma área DISC).
4. **Blocos de contexto** (sem afetar nota): cruza renda, preocupações, perfil empreendedor e ano escolar com a trilha simulada para gerar avisos verdes (oportunidade), azuis (orientação) ou cinzas (ponto neutro).

A lógica vive em [`lib/match/engine.ts`](lib/match/engine.ts). Toda a explicação numérica fica salva em `ResultadoMatch.explicacao` e é exibida na seção "Como esse resultado foi calculado" da tela de resultado.

---

## Estrutura de pastas

```
legua/
  app/
    (public)/             paginas sem auth (home, cadastro, entrar)
    (auth)/               paginas que exigem sessao de estudante
      perfil-vocacional/  tela exibida apos o cadastro
      trilhas/            mapa, detalhe da trilha, areas, cursos e simulador
      perfil/             historico de simulacoes
    admin/                area administrativa
    api/                  route handlers REST
  components/             componentes React (UI, trilhas, simulador, cadastro, admin, perfil)
  lib/
    db/                   PrismaClient singleton
    auth/                 sessao do estudante e do admin (JWT)
    validations/          schemas Zod
    match/                motor de match (60/40 + bonus + faixas + contexto)
    data/                 conteudo estatico do produto
      cursos-*.json         158 cursos em 8 areas
      quiz-disc.ts          8 perguntas DISC + titulos por combinacao
      quiz-afinidade-cursos.json  474 perguntas (3 por curso)
      cursos-tecnicos.ts    41 cursos tecnicos com tags de aplicacao
      correlacao-tecnico.ts vocabulario fechado + cursos habilitadores + mensagens
    hash.ts               hash de CPF e geracao de token temporario
  prisma/
    schema.prisma         fonte de verdade do schema do banco
    seed.ts               popula 6 trilhas, profissoes e admin inicial
  scripts/
    docker-entrypoint.sh  generate + push/deploy + seed condicional + dev
  proxy.ts                guardas de rota (Next.js 16)
  docker-compose.yml
  Dockerfile
  .env.example
```
---

## Manual - rodar com Docker

### Pré-requisitos

- Docker Desktop instalado **e rodando**.
- Git (para clonar).
- Node.js 24+ é útil para rodar comandos no host (typecheck, prisma studio), mas o app sobe inteiro via container.

### Passo a passo (primeira execução)

```bash
# 1. Clonar o projeto
git clone https://github.com/luciaanamari/leguas.git
cd legua

# 2. Copiar variaveis de ambiente
cp .env.example .env.local
# (Windows PowerShell: Copy-Item .env.example .env.local)

# 3. Subir tudo (banco + app + schema + seed)
docker compose up --build

# 4. Abrir
#    App:   http://localhost:3000
#    Admin: http://localhost:3000/admin/login
```

Na primeira execução o entrypoint do container cuida de tudo, na ordem:

1. `prisma generate` - gera o client.
2. `prisma db push` (ou `migrate deploy` se houver migrations) - sincroniza o schema.
3. `prisma db seed` - popula 6 trilhas, profissões e o admin inicial. Idempotente (`upsert`), só roda se ainda não houver admin no banco.
4. Inicia o Next.js em modo dev com hot reload.

### Acesso inicial

- **Estudante novo**: clique em "Começar agora" na home e faça o cadastro de 4 passos.
- **Estudante existente**: clique em "Entrar" e use o e-mail e senha cadastrados.
- **Admin**: `/admin/login` com as credenciais do `.env.local`. Padrão:
  - E-mail: `admin@legua.com.br`
  - Senha: `admin123` (**troque depois do primeiro acesso**)

### Subir tudo em background

```bash
docker compose up -d        # background
docker compose logs -f app  # ver logs do app
docker compose ps           # status dos containers
```

### Parar

```bash
docker compose down         # para containers, preserva o banco
docker compose down -v      # para containers e APAGA o banco (volume legua-pgdata)
```

### Comandos úteis dentro do container

```bash
# Aplicar mudanca no schema.prisma sem migration formal (dev)
docker exec legua-app npx prisma db push

# Inspecionar dados em UI
docker exec -it legua-app npx prisma studio
# (depois abrir http://localhost:5555)

# Re-rodar o seed manualmente (ja é idempotente)
docker exec legua-app npm run prisma:seed
```

### Setup alternativo (app no host, banco no Docker)

Útil se quiser hot reload mais rápido ou debugar no IDE:

```bash
# 1. Subir só o banco
docker compose up db -d

# 2. Ajustar DATABASE_URL no .env.local para localhost
#    DATABASE_URL=postgresql://legua:senha@localhost:5432/legua

# 3. Instalar deps + aplicar schema + seed
npm install
npx prisma db push
npm run prisma:seed

# 4. Rodar dev
npm run dev
```

---

## Variáveis de ambiente

Documentadas em `.env.example`:

| Variável | Descrição |
|---|---|
| `DATABASE_URL` | URL Postgres. Em Docker o `docker-compose.yml` sobrescreve para apontar para o serviço `db`. Fora do Docker, use `localhost`. |
| `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` | Credenciais do container Postgres. |
| `SESSION_SECRET` | String aleatória ≥32 caracteres para assinar o JWT da sessão de estudante. **Trocar em produção.** |
| `SESSION_MAX_AGE` | TTL da sessão de estudante em segundos. Padrão 604800 (7 dias). |
| `ADMIN_SESSION_SECRET` | Secret independente da sessão de admin. **Não reaproveite o do estudante.** |
| `ADMIN_SESSION_MAX_AGE` | TTL da sessão de admin em segundos. Padrão 28800 (8h). |
| `ADMIN_INITIAL_EMAIL` | E-mail do admin criado pelo seed. |
| `ADMIN_INITIAL_PASSWORD` | Senha em texto puro do admin inicial. **Trocar após o primeiro acesso.** |
| `NEXT_PUBLIC_APP_URL` | URL pública da aplicação. |

---

## Decisões importantes

- **CPF** armazenado apenas como hash SHA-256. Não recuperável. O admin nunca vê o CPF original.
- **Autenticação do estudante** por e-mail + senha (bcrypt). Tokens temporários (8 chars, 24h) podem ser gerados pelo admin se necessário.
- **WhatsApp** opcional, também armazenado como hash quando informado.
- **Match** é uma fórmula explícita (60/40 + bônus contextual), facilmente substituível por modelo mais sofisticado no futuro.
- **Conteúdo do quiz e dos cursos** mora em código (`lib/data/`) - alterações exigem PR. A página `/admin/conteudo` deixa essa fronteira explícita.

---

## Métricas de sucesso do MVP

Três perguntas que definem se o MVP cumpriu o objetivo:

1. **Taxa de retorno**: estudantes com mais de uma sessão ÷ total de estudantes.
2. **Taxa de conclusão**: simulações concluídas ÷ simulações iniciadas.
3. **Taxa de compartilhamento**: resultados compartilhados ÷ resultados visualizados.

Eventos registrados em `EventoEngajamento`: `SESSAO_INICIADA`, `TRILHA_VISUALIZADA`, `SIMULACAO_INICIADA`, `SIMULACAO_CONCLUIDA`, `RESULTADO_VISUALIZADO`, `RESULTADO_COMPARTILHADO`, `LOGIN`, `LOGOUT`.

---

## Scripts úteis

```bash
npm run dev             # next dev
npm run build           # next build
npm start               # next start (producao)
npm run lint            # eslint
npm run format          # prettier --write
npm run prisma:seed     # popular o banco
npm run prisma:studio   # abrir Prisma Studio
npm run prisma:generate # regerar Prisma Client
```

---