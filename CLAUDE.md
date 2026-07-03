# CLAUDE.md - Léguas: Documentação Técnica

> Este arquivo descreve o **estado atual implementado** do Léguas. Ele substitui o
> antigo planejamento do MVP: várias decisões evoluíram durante o desenvolvimento
> (login com e-mail e senha, quiz vocacional DISC no cadastro, simulação por curso,
> catálogo estático de cursos, motor de match em dois componentes, paleta de fundo
> claro). Quando houver dúvida entre este documento e o código, **o código é a
> fonte de verdade** — mas mantenha este arquivo atualizado ao alterar arquitetura.

## Visão Geral do Produto

O Léguas é uma plataforma web responsiva para estudantes do 3º ano do ensino médio de escolas públicas, com foco inicial no Piauí. O objetivo é apresentar, de forma visual e acessível, todos os caminhos possíveis após o ensino médio, permitindo que o estudante simule como seria a vida em cada carreira escolhida e receba um resultado de compatibilidade com um próximo passo concreto.

O produto não é um PWA. É uma aplicação web responsiva, mobile-first, acessível por link direto no navegador do celular sem instalação.

O fluxo central é simples: o estudante entra, se cadastra (incluindo um quiz vocacional), descobre seu perfil, navega pelas trilhas e áreas, escolhe um curso, simula como seria a vida naquele caminho e recebe um resultado de compatibilidade. Pode voltar e testar outros cursos sem limite e sem pressão.


## Decisões de Produto e Escopo do MVP

### O que é MVP

1. Cadastro em quatro passos (dados pessoais + renda, dados da escola + curso técnico, perfil de futuro + preocupações, quiz vocacional DISC de 8 perguntas)
2. Perfil vocacional gerado a partir do quiz (perfil DISC + área dominante)
3. Mapa de Trilhas com seis caminhos possíveis representados como cards visuais
4. Navegação Trilha → Área de conhecimento → Curso específico
5. Simulador de Carreira por curso, com narrativas "um dia como aluno" e "um dia como profissional" intercaladas com um quiz de afinidade
6. Motor de Match com resultado de compatibilidade (0–100), análise de contexto e próximo passo concreto
7. Área administrativa para gerenciamento de trilhas, profissões e estudantes

### O que não é MVP

Não fazem parte do MVP: simulador interativo com escolhas ramificadas, trilha de preparação, dashboard para escolas, personalização por região, integração com conteúdo externo, painel de parceiros ou qualquer funcionalidade de versão 1.1 ou 2.0.

### Métricas de Sucesso do MVP

As três perguntas que definem se o MVP cumpriu o que prometeu:

- O estudante voltou mais de uma vez?
- Ele completou ao menos uma simulação?
- Ele clicou em compartilhar?

Critério de validação: 60% ou mais dos testadores completam ao menos uma simulação na primeira sessão e conseguem nomear pelo menos um caminho que pretendem explorar. Os eventos de engajamento (ver seção de Métricas) instrumentam essas respostas.


## Arquitetura Técnica

### Stack

- Runtime: Node.js 24 (imagem `node:24-alpine` no Docker)
- Framework: Next.js 16 (App Router), `output: "standalone"`, `reactStrictMode: true`
- UI: React 19 com CSS puro (CSS custom properties em `app/globals.css` + estilos inline nas páginas). Não há Tailwind nem CSS-in-JS.
- ORM: Prisma 7 com **driver adapter** (`@prisma/adapter-pg` sobre um `pg.Pool`)
- Banco de dados: PostgreSQL 16
- Autenticação: JWT assinado (HS256) via `jose`, em cookie HttpOnly; senhas com `bcryptjs`
- Validação: Zod 3 (cliente e servidor)
- Hash de dados sensíveis: `node:crypto` SHA-256 (CPF e WhatsApp)
- Containerização: Docker multi-stage + Docker Compose
- Linguagem: TypeScript em todo o projeto

### Princípio BFF (Backend for Frontend)

Frontend e backend vivem no mesmo repositório e na mesma stack Next.js. Não existe servidor Express separado. A camada de backend usa exclusivamente os mecanismos nativos do Next.js:

- **Server Components** para busca de dados e renderização no servidor (a maioria das páginas autenticadas chama `prisma.*` diretamente)
- **Route Handlers** em `app/api/**/route.ts` para endpoints REST consumidos pelos Client Components (cadastro, simulador, ações)
- **`proxy.ts`** na raiz (o "middleware" do Next 16, renomeado) para o guard de rotas no edge runtime

Toda lógica de acesso ao banco, validação e regra de domínio fica nos Server Components, Route Handlers e na camada `lib/`. O cliente nunca acessa o banco diretamente.

### Prisma como ORM (Prisma 7)

O Prisma é o único mecanismo de acesso ao banco. Não existe SQL escrito à mão fora das migrations geradas pelo Prisma CLI. O `prisma/schema.prisma` é a fonte de verdade dos modelos.

Particularidades do Prisma 7 neste projeto:
- O `PrismaClient` é instanciado em `lib/db/index.ts` com um **driver adapter** (`PrismaPg` sobre `pg.Pool`), e usa o padrão singleton via `globalThis` para evitar múltiplas conexões no hot reload.
- A URL do datasource é configurada em `prisma.config.ts` (`defineConfig`), lendo `DATABASE_URL`.
- O `generator client` define `binaryTargets = ["native", "linux-musl-openssl-3.0.x"]` para funcionar no Alpine.

### Estrutura de Pastas (real)

```
leguas/
  app/
    layout.tsx                        # root layout (html/body, metadata, viewport)
    globals.css                       # design system (CSS custom properties)
    (public)/
      page.tsx                        # landing de boas-vindas
      cadastro/page.tsx               # wizard de cadastro (Client Component)
      entrar/page.tsx                 # login do estudante
    (auth)/                           # exige sessão de estudante
      layout.tsx                      # header + verificação de sessão
      perfil-vocacional/page.tsx      # retrato DISC pós-cadastro
      perfil/page.tsx                 # histórico de simulações + editar cadastro
      trilhas/
        page.tsx                      # mapa de trilhas (com filtro por grupo)
        [slug]/
          page.tsx                    # detalhe da trilha
          simulador/page.tsx          # rota LEGADA -> redireciona para /areas
          areas/
            page.tsx                  # áreas de conhecimento da trilha
            [areaSlug]/
              page.tsx                # cursos da área (filtrados pela trilha)
              [cursoSlug]/
                page.tsx              # detalhe do curso (narrativas em abas)
                simulador/
                  page.tsx            # cria a Simulacao e roda o simulador
                  resultado/page.tsx  # tela de match e resultado
    admin/
      layout.tsx                      # meta noindex
      page.tsx                        # redireciona para /admin/dashboard
      login/page.tsx                  # login de admin
      (protected)/                    # exige sessão de admin
        layout.tsx                    # sidebar + verificação de sessão
        dashboard/page.tsx
        trilhas/{page,nova,[id]/editar}
        profissoes/{page,nova,[id]/editar}
        estudantes/{page,[id]}
        conteudo/page.tsx
    api/
      auth/route.ts                   # POST login do estudante
      auth/logout/route.ts            # POST logout do estudante
      estudantes/route.ts             # POST cadastro
      estudantes/me/route.ts          # PUT atualizar próprio cadastro
      estudantes/verificar-cpf/route.ts     # POST checagem de unicidade
      estudantes/verificar-email/route.ts   # POST checagem de unicidade
      trilhas/route.ts                # GET listagem de trilhas ativas
      trilhas/[slug]/route.ts         # GET detalhe de trilha
      simulacoes/route.ts             # POST (legado) + GET histórico
      simulacoes/[id]/route.ts        # DELETE simulação do próprio estudante
      match/route.ts                  # POST cálculo e persistência do resultado
      eventos/route.ts                # POST registro de eventos de engajamento
      admin/
        auth/route.ts                 # POST login admin
        auth/logout/route.ts          # POST logout admin
        trilhas/route.ts              # GET/POST
        trilhas/[id]/route.ts         # GET/PUT/DELETE (lógico)
        profissoes/route.ts           # GET/POST
        profissoes/[id]/route.ts      # GET/PUT/DELETE (lógico)
        estudantes/route.ts           # GET paginado
        estudantes/[id]/route.ts      # GET/PUT/DELETE (físico, cascata)
        estudantes/[id]/senha/route.ts# POST token de senha temporária
  components/
    ui/                               # genéricos (LogoutButton)
    trilhas/                          # CardTrilha, FiltroTrilhas
    simulador/                        # SimuladorCurso, TabsCurso, CompartilharResultado, ComoFoiCalculado
    cadastro/                         # PassoCadastro, LoginEstudanteForm
    perfil/                           # EditarPerfilForm, ApagarSimulacao
    admin/                            # AdminNav, TabelaTrilhas, FormularioTrilha, FormularioProfissao, etc.
  lib/
    db/index.ts                       # singleton do PrismaClient (com adapter pg)
    auth/
      edge.ts                         # verifySessionToken (edge-safe, só jwtVerify)
      session.ts                      # sessão do estudante (cookie legua_session)
      admin-session.ts                # sessão do admin (cookie legua_admin_session)
      index.ts                        # re-exports
    hash.ts                           # hashCpf, hashWhatsapp, hashSenha, verificarSenha, gerarTokenAleatorio
    validations/                      # cadastro.ts, admin.ts (schemas Zod)
    match/engine.ts                   # motor de cálculo do match
    data/
      cursos.ts                       # agrega os JSONs e helpers de navegação
      cursos-1..4.json                # catálogo de ~158 cursos em 8 áreas
      quiz-disc.ts                    # 8 perguntas DISC + cálculo + textos
      quiz-afinidade.ts               # helpers do quiz por curso
      quiz-afinidade-cursos.json      # 3 perguntas por curso
      cursos-tecnicos.ts              # ~42 técnicos do Piauí + correlação
      correlacao-tecnico.ts           # tags, habilitadores e mensagens curadas
  prisma/
    schema.prisma
    migrations/
    seed.ts                           # 6 trilhas + profissões + admin inicial
  public/
  proxy.ts                            # guard de rotas (middleware do Next 16)
  prisma.config.ts
  next.config.ts
  docker-compose.yml
  Dockerfile
  scripts/docker-entrypoint.sh
  .env.example
```

### Containerização

`docker-compose.yml` tem dois serviços: `db` (`postgres:16-alpine`, volume persistente, healthcheck) e `app` (build com `target: development`, bind mount do código com volumes anônimos para `node_modules` e `.next`). O `Dockerfile` é multi-stage (`base → deps → builder → runner`) com um alvo `development` separado usado pelo compose.

O `scripts/docker-entrypoint.sh` na subida: `prisma generate` → `prisma migrate deploy` (ou `prisma db push` como fallback se não houver migrations) → seed condicional (só roda se não houver nenhum admin cadastrado) → start.


## Modelo de Dados

Todos os modelos estão em `prisma/schema.prisma`. Enums: `AdminRole`, `Preocupacao`, `AnoEscolar`, `ModalidadeTrilha`, `TipoEvento`, `RendaFamiliar`, `PerfilEmpreendedor`, `DiscPerfil` (D/I/S/C), `AreaDISC` (HUMANAS/EXATAS/BIOLOGICAS), `FaixaResultado` (ALTA/MEDIA/BAIXA).

### Estudante

Identidade e perfil vocacional num só lugar:
- Identidade: `email` (único) + `senhaHash` (bcrypt). `cpfHash` (único) e `whatsappHash` guardados apenas como SHA-256 (irreversível, nunca exibidos).
- Dados: `nome`, `dataNascimento`, `escolaNome`, `escolaAno` (`AnoEscolar`), `cursoTecnico` (slug opcional), `rendaFamiliar`, `perfilEmpreendedor`, `preocupacoes` (`Preocupacao[]`).
- Perfil vocacional (calculado no cadastro): `areaQuizH/E/B` (contagens de respostas por área), `discPerfil`, `respostasDisc` (Json bruto para auditoria).
- Recuperação: `tokenSenhaHash` + `tokenSenhaExpiraEm` (token temporário gerado pelo admin).
- Controle: `ativo`, `criadoEm`, `atualizadoEm`.

### Admin

`nome`, `email` (único), `senhaHash` (bcrypt), `role` (`AdminRole`, default EDITOR), `ativo`.

### Trilha

`slug` (único), `titulo`, `modalidade`, `descricaoCurta`, `descricaoCompleta`, `comoEntrar`, `duracao`, `custoEstimado`, `primeirosPassos`, `ordem`, `ativo`. Os campos `narrativaAluno`/`narrativaProfissional` são **legado** (a narrativa hoje vem do JSON do curso) e ficam opcionais só para não quebrar dados existentes.

### Profissao

`nome`, `descricao`, `trilhaId` (FK, cascade), `ativo`. Usada no seed e no admin. O catálogo navegável de cursos é estático (ver seção de Catálogo).

### Simulacao

Liga `estudanteId` ↔ `trilhaId` ↔ (`areaSlug`, `cursoSlug`). Copia `narrativaAluno`/`narrativaProfissional` do curso (snapshot), guarda `respostasAfinidade` (Json), `iniciadaEm` e `concluidaEm` (nulo até concluir). Relação 1:1 opcional com `ResultadoMatch`.

### ResultadoMatch

Snapshot imutável do cálculo, 1:1 com `Simulacao`:
- `pontuacao` (0–100), `pontuacaoArea` (0–60), `pontuacaoCurso` (0–40), `faixa`.
- `tituloDisc`, `areaDominante`, `cursoSlug`.
- `justificativa`, `proximoPasso`.
- `contextoBlocos` (Json: blocos verde/azul/cinza), `explicacao` (Json: breakdown numérico da tela "como foi calculado").
- `compartilhado`, `criadoEm`.

### EventoEngajamento

Telemetria genérica: `estudanteId` (opcional, `onDelete: SetNull`), `tipoEvento` (`TipoEvento`), `payload` (Json), `criadoEm`.


## Autenticação e Sessão

Dois domínios de sessão **totalmente independentes** (cookies, secrets e max-age separados):

| | Estudante | Admin |
|---|---|---|
| Cookie | `legua_session` | `legua_admin_session` |
| Secret | `SESSION_SECRET` | `ADMIN_SESSION_SECRET` |
| Max-age | `SESSION_MAX_AGE` (7 dias) | `ADMIN_SESSION_MAX_AGE` (8h) |
| Identificação | e-mail + senha (bcrypt) | e-mail + senha (bcrypt) |

- `lib/auth/edge.ts` contém **apenas** `verifySessionToken` (usa `jwtVerify`). É o único módulo de auth que o `proxy.ts` importa, por ser compatível com o edge runtime.
- `lib/auth/session.ts` e `admin-session.ts` criam/leem/encerram cookies via `next/headers`. O JWT carrega `sub` (id do usuário) e `role`. Cookies são `httpOnly`, `sameSite=lax`, `secure` em produção.

**Autorização em duas camadas (defesa em profundidade):**

1. `proxy.ts` intercepta `/trilhas`, `/perfil` (sessão de estudante) e `/admin` exceto `/admin/login` (sessão de admin), redirecionando para `/entrar` ou `/admin/login` com `?redirect=`. O matcher exclui `/api/*`, estáticos e `robots.txt`.
2. **Cada Route Handler e cada layout protegido re-verifica a sessão** por conta própria (`lerSessaoEstudante()` / `lerSessaoAdmin()`). O proxy é conveniência de UX, não a fronteira de segurança.

Há **isolamento por dono**: rotas de simulação/match/resultado checam `estudanteId === sessao.sub` antes de devolver dados.


## Fluxo do Estudante

### Cadastro (`components/cadastro/PassoCadastro.tsx`)

Wizard de 4 passos num único Client Component com estado local e barra de progresso:

1. **Dados pessoais + renda**: nome, e-mail, senha (+confirmação, com olho de mostrar/ocultar), data de nascimento, CPF (com máscara e validação dos dígitos verificadores), WhatsApp (opcional), faixa de renda familiar.
2. **Escola**: nome da escola, ano, curso técnico (combobox com busca, navegação por teclado e opção "não faço nenhum" — a lista vem de `lib/data/cursos-tecnicos.ts`).
3. **Futuro**: perfil empreendedor (estável/equilíbrio/empreendedor/alto risco) + preocupações (múltipla escolha).
4. **Quiz DISC**: 8 perguntas que auto-avançam; cada opção pontua simultaneamente uma área (H/E/B) e um perfil DISC (D/I/S/C). O estudante nunca vê os rótulos.

Entre o passo 1 e o 2, o cliente chama `/api/estudantes/verificar-email` e `/api/estudantes/verificar-cpf` para detectar duplicidade antes de prosseguir. O submit final faz `POST /api/estudantes`, que valida com Zod (`cadastroSchema`), calcula o DISC no servidor (`calcularDisc`), persiste o estudante (CPF/WhatsApp como hash), cria a sessão e registra `SESSAO_INICIADA`. Em seguida o cliente navega para `/perfil-vocacional`.

### Perfil vocacional (`/perfil-vocacional`)

Mostra o retrato gerado pelo quiz: rótulo do perfil DISC humanizado (Decisor/Influenciador/Estável/Analítico), área dominante com barras H/E/B, pontos fortes, cuidados e — se houver — destaque do curso técnico. A sigla DISC nunca aparece. Inclui aviso metodológico ("ponto de partida, não diagnóstico").

### Navegação Trilhas → Áreas → Curso

- `/trilhas`: 6 cards, saudação personalizada, filtro client-side por **grupo** (superior=PRESENCIAL+EAD, técnico, concurso, mercado) via query param `?grupo=`.
- `/trilhas/[slug]`: detalhe da trilha (o que é, como entrar, duração, custo, primeiros passos, profissões) com CTA para entrar na simulação.
- `/trilhas/[slug]/areas`: áreas de conhecimento que têm ao menos um curso compatível com a modalidade da trilha (`areasPorTrilha`).
- `/trilhas/[slug]/areas/[areaSlug]`: cursos da área filtrados pela trilha (`cursosPorTrilha`).
- `/trilhas/[slug]/areas/[areaSlug]/[cursoSlug]`: detalhe do curso (duração, salário médio, narrativas em abas via `TabsCurso`) com CTA para simular.

A rota legada `/trilhas/[slug]/simulador` apenas redireciona para `/areas` (a simulação é sempre por curso).

### Simulador (`components/simulador/SimuladorCurso.tsx`)

A página `.../[cursoSlug]/simulador/page.tsx` é um Server Component que **cria a `Simulacao` no carregamento** (persistindo as narrativas do curso) e registra `SIMULACAO_INICIADA`. O componente cliente é uma máquina de estados de 4 fases:

`NARRATIVA_ALUNO → QUIZ_ALUNO → NARRATIVA_PROFISSIONAL → QUIZ_PROFISSIONAL → (envio)`

As perguntas vêm de `obterQuizCurso(cursoSlug)` (1 pergunta fase ALUNO peso 1 + 2 fase PROFISSIONAL peso 2). Ao final, junta todas as respostas e faz um único `POST /api/match`.

> Observação: existe um `POST /api/simulacoes` que cria simulação isoladamente, mas o fluxo real **não o usa** (a página cria a simulação direto). O `GET /api/simulacoes` ainda serve o histórico do perfil. Tratar como ponto de limpeza futura.

### Match e Resultado (`/api/match`, `.../simulador/resultado`)

`POST /api/match` é **idempotente**: valida a sessão e o dono da simulação; se já houver resultado, devolve o existente. Caso contrário chama `calcularMatch`, marca a simulação como concluída, persiste o `ResultadoMatch` e registra `SIMULACAO_CONCLUIDA`.

A página de resultado (Server Component) registra `RESULTADO_VISUALIZADO` e exibe: score grande com faixa colorida, breakdown 60/40, título DISC + justificativa, próximo passo, card de orientação técnico×curso (quando houver), blocos de contexto (verde/azul/cinza), a seção "como foi calculado" (`ComoFoiCalculado`) e os botões de simular outro curso / compartilhar.


## Catálogo Estático de Cursos

O catálogo navegável **não está no banco** — vive em JSON versionado, carregado em build/runtime por `lib/data/cursos.ts`:

- `cursos-1..4.json` (~158 cursos em 8 áreas: saúde, exatas, humanas, linguística, tecnologia, negócios, artes, agropecuária). Cada curso tem `slug`, `nome`, `descricaoCurta`, `duracao`, `salarioMedio`, `narrativaEstudante` e `narrativaProfissional` (com contexto piauiense).
- `courseModalidades` mapeia cada curso às trilhas (modalidades) a que pertence — um curso pode estar em várias. É a base de `cursosPorTrilha` / `areasPorTrilha`.
- `quiz-afinidade-cursos.json` tem 3 perguntas por curso (com fallback genérico em `quiz-afinidade.ts`).

Decisão de design: conteúdo editorial pesado e estável é estático (rápido, versionável); só dados por-usuário e mutáveis vão ao Postgres. As 6 Trilhas e suas Profissões são populadas pelo seed (upsert idempotente).


## Motor de Match (`lib/match/engine.ts`)

Determinístico, sem ML, totalmente transparente. A entrada/saída é tipada (`CalcularInput` / `ResultadoMatchEngine`) para ser **facilmente substituível** por um modelo mais sofisticado no futuro.

### Bloco 1 — Compatibilidade real (0–100)

**Componente A — Afinidade de área (0–60):**
1. Mapeia o `areaSlug` do curso para uma área DISC (`areaCursoParaAreaDisc`; ex.: saúde→BIOLOGICAS, tecnologia→EXATAS).
2. `fração = respostasDISC_naquela_área / total` → base `= round(18 + fração·42)` (piso 18, teto 60).
3. **Bônus de curso técnico**: classifica a correlação entre o técnico do aluno e o curso simulado e soma `DIRETA +10 / TRANSVERSAL +5 / AREA +3 / NENHUMA 0` (com cap em 60).

**Componente B — Identificação com a simulação (0–40):**
- As 3 perguntas de afinidade viram percentual ponderado (`SIM=1, MAIS_OU_MENOS=0.5, NAO=0`) e escalam para 0–40 (`calcularAfinidadeCurso`).

**Faixa:** `≥65 ALTA / ≥35 MEDIA / <35 BAIXA`.

Além do número, o motor produz `tituloDisc` (frase da matriz 4×3 perfil DISC × área dominante — a sigla nunca aparece), `justificativa`, `proximoPasso` (template por trilha) e um card de orientação técnico×curso.

### Bloco 2 — Análise de contexto (não afeta a nota)

`gerarContexto` cruza renda, perfil empreendedor, preocupações, ano escolar e curso técnico com a trilha simulada e gera blocos:
- 🟢 verde (oportunidade): trilha gratuita + renda baixa, ou "já está no caminho" do técnico.
- 🔵 azul (orientação): ProUni/FIES, ENEM não é a única porta, renda enquanto estuda, etc.
- ⚪ cinza (ponto neutro): alertas de perfil (ex.: empreendedor × concurso, estável × mercado direto).

### Subsistema de correlação técnico ↔ curso

Curado em três arquivos:
- `cursos-tecnicos.ts` — técnicos do Piauí com `area` DISC, `cursosRelacionados[]` (ponte direta) e `tagsAplicacao[]` (domínios). Esta lista também alimenta o dropdown do cadastro.
- `correlacao-tecnico.ts` — vocabulário fechado de 19 tags, conceito de **curso habilitador** (TI, marketing, design, gestão, comunicação são transversais) e **mensagens curadas por par (tag × família)** com fallback paramétrico.
- `classificarCorrelacao` decide DIRETA / TRANSVERSAL / AREA / NENHUMA. A TRANSVERSAL é a parte engenhosa: reconhece combinações raras (ex.: técnico em Alimentos + simular Ciência da Computação → software para a cadeia alimentícia).

`explicacao` serializa todo o breakdown numérico para a tela "como foi calculado".


## Métricas e Rastreamento de Engajamento

`POST /api/eventos` grava `EventoEngajamento`. Eventos registrados ao longo do fluxo (não centralizados): `SESSAO_INICIADA`, `LOGIN`, `SIMULACAO_INICIADA`, `SIMULACAO_CONCLUIDA`, `RESULTADO_VISUALIZADO`, `RESULTADO_COMPARTILHADO`. Ao compartilhar, o handler também seta `compartilhado=true` no `ResultadoMatch`.

As três métricas-norte do MVP derivam desses eventos: taxa de retorno (sessões por estudante), taxa de conclusão (concluídas/iniciadas) e taxa de compartilhamento (compartilhados/visualizados).


## Área Administrativa

Domínio paralelo sob `app/admin/`, com login e sessão próprios. `app/admin/layout.tsx` aplica `noindex`; `app/admin/(protected)/layout.tsx` re-verifica admin ativo e renderiza a sidebar. Todos os CRUDs seguem o mesmo padrão de handler: `lerSessaoAdmin()` → validação Zod (`lib/validations/admin.ts`) → Prisma.

- **Dashboard**: contagens (estudantes, simulações iniciadas/concluídas, compartilhados) + trilhas mais simuladas (`groupBy`).
- **Trilhas / Profissões**: CRUD com DELETE **lógico** (`ativo=false`).
- **Estudantes**: listagem paginada com busca por nome; detalhe sem o CPF (apenas indicador de hash); gerar **token de senha temporária** (`/[id]/senha` — token de 8 caracteres, hash bcrypt, validade 24h, devolvido em texto puro só uma vez); DELETE **físico** (cascateia simulações, resultados e eventos).


## Design System e Responsividade (`app/globals.css`)

A paleta atual é **base clara** (mudou em relação ao planejamento original de fundo escuro):

```css
--color-background: #ffffff;   /* fundo das páginas */
--color-surface:    #f5f6f8;   /* cards e inputs */
--color-text:       #12203c;   /* azul escuro: texto principal */
--color-text-soft:  #1e3358;   /* azul médio: títulos/links */
--color-text-muted: #6b7a91;   /* cinza azulado: secundário */
--color-accent:     #e2ac40;   /* amarelo: CTAs, destaques, foco */
--color-accent-hover:#c99930;
--color-accent-soft:#fdf3d8;
--color-border:     #d9deea;
--color-danger:     #c0392b;
--color-success:    #2f9e6e;
```

Classes utilitárias: `.container`, `.card`, `.btn`/`.btn-primary`/`.btn-secondary`/`.btn-ghost`, `.input`/`.select`/`.textarea`, `.label`, `.muted`, `.error`, `.grid-cards`, `.skip-link`. O styling concreto das páginas é majoritariamente inline.

Requisitos mantidos: corpo ≥16px, alvos clicáveis ≥44px, foco visível (`:focus-visible`), grid responsivo (1/2/3 colunas), mobile-first de 320px a 1440px.


## Variáveis de Ambiente (`.env.example`)

```
# Banco (Prisma usa DATABASE_URL diretamente)
DATABASE_URL=postgresql://legua:senha@db:5432/legua
POSTGRES_USER=legua
POSTGRES_PASSWORD=senha
POSTGRES_DB=legua

# Sessão do estudante
SESSION_SECRET=string-longa-e-aleatoria-minimo-32-caracteres
SESSION_MAX_AGE=604800

# Sessão do administrador (secret separado)
ADMIN_SESSION_SECRET=outra-string-longa-e-aleatoria-minimo-32-caracteres
ADMIN_SESSION_MAX_AGE=28800

# Admin inicial criado pelo seed
ADMIN_INITIAL_EMAIL=admin@legua.com.br
ADMIN_INITIAL_PASSWORD=trocar-na-primeira-entrada

# Aplicação
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

`SESSION_SECRET` e `ADMIN_SESSION_SECRET` precisam ter no mínimo 32 caracteres (validado em runtime). No docker-compose, `DATABASE_URL` do serviço `app` é sobrescrito para apontar para o host `legua-db`.


## Comandos Úteis

```bash
# Desenvolvimento
npm run dev

# Prisma
npm run prisma:generate     # gerar client
npm run prisma:migrate      # migrate dev (cria/aplica migration)
npm run prisma:deploy       # migrate deploy (CI/produção)
npm run prisma:seed         # tsx prisma/seed.ts (6 trilhas + profissões + admin)
npm run prisma:studio
npm run prisma:reset

# Subir tudo com Docker (db + app, com seed condicional no entrypoint)
docker compose up
```


## Conteúdo Editorial

O conteúdo é tão crítico quanto o código. Antes do lançamento, cada curso do catálogo (`lib/data/cursos-*.json`) precisa de: descrição curta, duração, salário médio e as narrativas "um dia como aluno" e "um dia como profissional" com referências nordestinas/piauienses. Cada curso precisa também de suas 3 perguntas de afinidade em `quiz-afinidade-cursos.json` (caso contrário cai num fallback genérico que distorce o match). As 6 trilhas e suas profissões ficam no `seed.ts`.


## Critérios de Aceitação do MVP

- [ ] Um estudante se cadastra do zero e chega ao resultado de match em menos de 10 minutos.
- [ ] O fluxo completo funciona em celular Android com Chrome em 3G.
- [ ] Todas as 6 trilhas têm áreas e cursos com conteúdo completo e revisado.
- [ ] As três métricas de sucesso são coletáveis a partir dos eventos.
- [ ] Nenhum dado sensível (CPF em texto puro, token de sessão) é acessível via DevTools.
- [ ] A aplicação sobe com `docker compose up` sem configuração além do `.env.local`.
- [ ] O compartilhamento gera um link válido no WhatsApp com o resultado.
- [ ] O admin cria, edita e desativa trilhas sem alterar código e gerencia estudantes sem ver o CPF original.


## Dívidas Técnicas e Pontos de Atenção

- **Código órfão**: `POST /api/simulacoes` e os campos `narrativaAluno`/`narrativaProfissional` da `Trilha` não são usados pelo fluxo atual.
- **Token de senha temporária**: o admin gera o token (`/[id]/senha`) e o schema tem os campos, mas o fluxo de consumo do token no login do estudante ainda não está implementado.
- **Breakdown da nota**: o bônus de curso técnico está embutido no componente de área (0–60); a UI mostra "afinidade de área X/60" já incluindo o bônus.
- **Styling inline** em larga escala dificulta consistência; não há camada de componentes de UI além das classes utilitárias.
- **`gerarTokenAleatorio`** usa `Math.random` — aceitável para token de uso único de 24h, mas `crypto` seria mais robusto.


## Fora do Escopo deste Documento

Funcionalidades de versão 1.1 (simulador interativo com escolhas ramificadas, histórico expandido) e versão 2.0 (personalização por região, trilha de preparação, dashboard para escolas) serão planejadas em arquivo separado após a validação do MVP com usuários reais.
