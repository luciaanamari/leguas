# CLAUDE.md - Legua: Planejamento Técnico do MVP

## Visão Geral do Produto

O Léguas é uma plataforma web responsiva para estudantes do 3o ano do ensino médio de escolas públicas, com foco inicial no Piauí. O objetivo é apresentar, de forma visual e acessível, todos os caminhos possíveis após o ensino médio, permitindo que o estudante simule como seria a vida em cada carreira escolhida e receba um resultado de compatibilidade com um próximo passo concreto.

O produto não é um PWA. É uma aplicação web responsiva, mobile-first, acessível por link direto no navegador do celular sem instalação.

O fluxo central do MVP é simples: o estudante entra, diz quem é, vê o que existe, clica no que chama atenção, simula como seria a vida naquele caminho e recebe um resultado. Pode voltar e testar outra carreira sem limite e sem pressão.


## Decisoes de Produto e Escopo do MVP

### O que e MVP

O MVP entrega exatamente quatro funcionalidades principais, nesta ordem de prioridade:

1. Cadastro em tres passos (dados pessoais, dados da escola, perfil de interesse)
2. Mapa de Trilhas com seis caminhos possiveis representados como cards visuais
3. Simulador de Carreira com narrativas escritas sobre um dia como aluno e um dia como profissional, seguido de uma tela de match com resultado de compatibilidade e proximo passo concreto
4. Area administrativa para gerenciamento de trilhas, profissoes e estudantes

### O que nao e MVP

Nao fazem parte do MVP: simulador interativo com escolhas, trilha de preparacao, dashboard para escolas, personalizacao por regiao, integracao com conteudo externo, painel de parceiros ou qualquer funcionalidade de versao 1.1 ou 2.0.

### Metricas de Sucesso do MVP

Antes de qualquer evolucao do produto, as tres perguntas que definem se o MVP cumpriu o que prometeu sao:

- O estudante voltou mais de uma vez?
- Ele completou ao menos uma simulacao?
- Ele clicou em compartilhar?

O criterio de validacao e: 60% ou mais dos testadores completam ao menos uma simulacao na primeira sessao e conseguem nomear pelo menos um caminho que pretendem explorar.


## Arquitetura Tecnica

### Stack

- Runtime: Node.js 24
- Framework: Next.js 16 (App Router)
- ORM: Prisma 6
- Banco de dados: PostgreSQL 16
- Containerizacao: Docker com Docker Compose
- Linguagem: TypeScript em todo o projeto

### Principio BFF (Backend for Frontend)

O frontend e o backend vivem no mesmo repositorio e na mesma stack Next.js. Nao existe servidor Express separado. A camada de backend e implementada exclusivamente por meio dos mecanismos nativos do Next.js:

- Route Handlers em `app/api/**/route.ts` para endpoints REST consumidos pelo cliente
- Server Actions para mutacoes iniciadas diretamente nos Server Components
- Server Components para busca de dados e renderizacao no servidor, eliminando round-trips desnecessarios ao cliente
- Middleware do Next.js para autenticacao, protecao de rotas e validacao de sessao

Toda logica de acesso ao banco de dados, validacao de negocio e regras de dominio fica nos Route Handlers e Server Actions. O cliente nunca acessa o banco diretamente.

### Prisma como ORM

O Prisma e o unico mecanismo de acesso ao banco de dados no projeto. Nao existe query SQL escrita a mao fora do Prisma. O schema em `prisma/schema.prisma` e a fonte de verdade de todos os modelos. As migrations sao geradas e aplicadas pelo proprio Prisma CLI.

O `PrismaClient` e instanciado uma unica vez em `lib/db/index.ts` com tratamento de singleton para evitar multiplas conexoes no ambiente de desenvolvimento com hot reload.

### Estrutura de Pastas

```
legua/
  app/
    (public)/
      page.tsx                    # tela de boas-vindas
      cadastro/
        page.tsx                  # fluxo de cadastro em 3 passos
    (auth)/
      layout.tsx                  # layout com verificacao de sessao do estudante
      trilhas/
        page.tsx                  # mapa de trilhas
        [slug]/
          page.tsx                # tela interna do card de trilha
          simulador/
            page.tsx              # simulador de carreira
            resultado/
              page.tsx            # tela de match e resultado
      perfil/
        page.tsx                  # historico de simulacoes do estudante
    (admin)/
      layout.tsx                  # layout com verificacao de sessao de admin
      login/
        page.tsx                  # login exclusivo de administradores
      dashboard/
        page.tsx                  # visao geral do admin
      trilhas/
        page.tsx                  # listagem de trilhas
        nova/
          page.tsx                # formulario de criacao de trilha
        [id]/
          editar/
            page.tsx              # formulario de edicao de trilha
      profissoes/
        page.tsx                  # listagem de profissoes
        nova/
          page.tsx                # formulario de criacao de profissao
        [id]/
          editar/
            page.tsx              # formulario de edicao de profissao
      estudantes/
        page.tsx                  # listagem de estudantes
        [id]/
          page.tsx                # detalhe e edicao do estudante
    api/
      auth/
        route.ts                  # login e criacao de sessao do estudante
        logout/
          route.ts                # encerramento de sessao
      admin/
        auth/
          route.ts                # login de administrador
          logout/
            route.ts              # encerramento de sessao de admin
        trilhas/
          route.ts                # GET listagem e POST criacao de trilha
          [id]/
            route.ts              # GET detalhe, PUT edicao, DELETE remocao
        profissoes/
          route.ts                # GET listagem e POST criacao de profissao
          [id]/
            route.ts              # GET detalhe, PUT edicao, DELETE remocao
        estudantes/
          route.ts                # GET listagem de estudantes
          [id]/
            route.ts              # GET detalhe, PUT edicao, DELETE remocao
          [id]/
            senha/
              route.ts            # POST geracao de nova senha temporaria
      estudantes/
        route.ts                  # POST cadastro de estudante
      trilhas/
        route.ts                  # GET listagem de trilhas ativas
        [slug]/
          route.ts                # GET detalhe de trilha
      simulacoes/
        route.ts                  # POST inicio e GET listagem de simulacoes
      match/
        route.ts                  # POST calculo e persistencia do resultado
      eventos/
        route.ts                  # POST registro de eventos de engajamento
  components/
    ui/                           # componentes genericos de interface
    trilhas/                      # componentes especificos do mapa de trilhas
    simulador/                    # componentes especificos do simulador
    cadastro/                     # componentes do fluxo de cadastro
    admin/                        # componentes exclusivos da area administrativa
  lib/
    db/
      index.ts                    # instancia singleton do PrismaClient
    auth/
      session.ts                  # sessao do estudante via cookie HTTPOnly
      admin-session.ts            # sessao do administrador via cookie HTTPOnly
    validations/                  # schemas de validacao com Zod
    match/
      engine.ts                   # logica de calculo do match de compatibilidade
  prisma/
    schema.prisma                 # definicao de todos os modelos e relacoes
    migrations/                   # migrations geradas pelo Prisma CLI
    seed.ts                       # seed de trilhas, profissoes e admin inicial
  public/
    images/
  docker-compose.yml
  Dockerfile
  .env.example
  README.md
```

### Banco de Dados

O PostgreSQL roda em container Docker separado, definido no docker-compose.yml. Todo acesso ao banco passa pelo Prisma Client. Nao existe SQL escrito manualmente fora do contexto de migrations geradas pelo Prisma. O arquivo `prisma/seed.ts` popula as trilhas, profissoes e o usuario administrador inicial.

### Containerizacao

O projeto tem dois servicos no docker-compose.yml:

1. `app`: imagem baseada em `node:24-alpine`, build em multi-stage para producao enxuta
2. `db`: imagem `postgres:16-alpine` com volume persistente para os dados

O ambiente de desenvolvimento usa `docker compose up` para subir ambos os servicos. Hot reload do Next.js e configurado via volume mount do codigo-fonte no container de desenvolvimento.


## Modulos do MVP - Checklist de Desenvolvimento

### Modulo 0 - Infraestrutura e Configuracao Base

- [ ] Criar repositorio com estrutura de pastas definida acima
- [ ] Configurar `package.json` com Next.js 16 e Node.js 24 como engine minima
- [ ] Configurar TypeScript com `tsconfig.json` estrito
- [ ] Criar `Dockerfile` com build multi-stage (development e production)
- [ ] Criar `docker-compose.yml` com servicos `app` e `db`
- [ ] Configurar variaveis de ambiente via `.env.local` (nao commitado) e `.env.example` (commitado)
- [ ] Instalar e configurar Prisma: `npm install prisma @prisma/client`
- [ ] Inicializar Prisma com `npx prisma init` apontando para o PostgreSQL do container
- [ ] Criar instancia singleton do PrismaClient em `lib/db/index.ts`
- [ ] Configurar ESLint e Prettier com regras do projeto
- [ ] Validar que `docker compose up` sobe os dois servicos com hot reload funcionando
- [ ] Validar que a conexao com o banco e estabelecida ao iniciar a aplicacao


### Modulo 1 - Schema do Banco de Dados e Seed

Todos os modelos sao definidos em `prisma/schema.prisma`. O Prisma CLI gera as migrations automaticamente a partir das alteracoes no schema. Nao e necessario escrever SQL manualmente.

- [ ] Definir modelo `Estudante` no schema Prisma
  - id, nome, dataNascimento, cpfHash, whatsapp, escolaNome, escolaAno, cursoTecnico (opcional), areaAfinidade, preocupacaoPrincipal, criadoEm, atualizadoEm
- [ ] Definir modelo `Admin` no schema Prisma
  - id, nome, email, senhaHash, role (SUPER_ADMIN, EDITOR), ativo, criadoEm, atualizadoEm
- [ ] Definir modelo `Trilha` no schema Prisma
  - id, slug, titulo, modalidade, descricaoCurta, descricaoCompleta, comoEntrar, duracao, custoEstimado, primeirosPassos, ordem, ativo, criadoEm, atualizadoEm
- [ ] Definir modelo `Profissao` no schema Prisma
  - id, nome, descricao, trilhaId (FK), ativo, criadoEm
- [ ] Definir modelo `Simulacao` no schema Prisma
  - id, estudanteId (FK), trilhaId (FK), narrativaAluno, narrativaProfissional, iniciadaEm, concluidaEm (opcional)
- [ ] Definir modelo `ResultadoMatch` no schema Prisma
  - id, estudanteId (FK), trilhaId (FK), simulacaoId (FK), pontuacao (Int), justificativa, proximoPasso, compartilhado, criadoEm
- [ ] Definir modelo `EventoEngajamento` no schema Prisma
  - id, estudanteId (FK), tipoEvento, payload (Json), criadoEm
- [ ] Executar `npx prisma migrate dev --name init` para gerar a migration inicial
- [ ] Criar `prisma/seed.ts` com as 6 trilhas do MVP, profissoes de cada trilha e usuario admin inicial
  - Trilhas: Bacharelado Presencial, Bacharelado EAD, Tecnologo, Curso Tecnico, Concurso Publico, Mercado Direto
  - Narrativas "Um dia como aluno" e "Um dia como profissional" com contexto nordestino e piauiense
  - Admin inicial com email e senha temporaria definidos via variavel de ambiente
- [ ] Configurar script `prisma.seed` no `package.json`
- [ ] Executar `npx prisma db seed` e validar dados inseridos via `npx prisma studio`


### Modulo 2 - Autenticacao e Sessao

Este modulo implementa dois mecanismos de sessao independentes: um para o estudante e outro para o administrador. O estudante nao tem senha: e identificado pelo CPF e whatsapp no cadastro. O administrador autentica com email e senha.

- [ ] Criar `lib/auth/session.ts` com funcoes de criacao e leitura de sessao do estudante via cookie HTTPOnly
- [ ] Criar `lib/auth/admin-session.ts` com funcoes de criacao e leitura de sessao de admin via cookie HTTPOnly separado
- [ ] Implementar JWT assinado com secret configurado em variavel de ambiente para ambos os casos
- [ ] Criar middleware em `middleware.ts` com tres regras:
  - Rotas em `(auth)` exigem cookie de sessao de estudante valido
  - Rotas em `(admin)` exigem cookie de sessao de admin valido
  - Rotas publicas nao exigem autenticacao
- [ ] Criar `app/api/auth/route.ts` com POST para criacao de sessao do estudante apos cadastro
- [ ] Criar `app/api/auth/logout/route.ts` com POST para encerramento de sessao do estudante
- [ ] Criar `app/api/admin/auth/route.ts` com POST para login de administrador com email e senha
  - Verificar senha com bcrypt
  - Retornar erro claro para credenciais invalidas
- [ ] Criar `app/api/admin/auth/logout/route.ts` com POST para encerramento de sessao de admin
- [ ] Validar que rotas protegidas redirecionam corretamente sem sessao valida
- [ ] Validar que nenhum cookie de sessao e acessivel via JavaScript no cliente


### Modulo 3 - Cadastro em Tres Passos

O cadastro e a primeira experiencia do estudante. Deve ser leve, claro e sem atrito. O CPF e coletado mas armazenado apenas como hash (SHA-256) para identificacao sem exposicao de dado sensivel.

- [ ] Criar `app/(public)/cadastro/page.tsx` como Server Component com estado gerenciado em Client Component filho
- [ ] Implementar componente `components/cadastro/PassoCadastro.tsx` com controle de etapa atual (1, 2 ou 3)
- [ ] Passo 1: Dados Pessoais
  - Campos: nome completo, data de nascimento, CPF, WhatsApp
  - Validacao client-side com Zod antes de avancar
  - Mascara de CPF e WhatsApp
  - Texto explicativo sobre o CPF para reduzir desconfianca
- [ ] Passo 2: Dados da Escola
  - Campos: nome da escola, ano (1o, 2o, 3o), curso tecnico (opcional, com campo "nao tenho")
- [ ] Passo 3: Perfil de Interesse
  - Campo: area de afinidade (saude, tecnologia, educacao, seguranca publica, negocios, artes, agropecuaria)
  - Campo: principal preocupacao sobre o futuro (nao saber o que escolher, nao ter dinheiro para estudar, nao passar no vestibular, nao encontrar emprego, outra)
- [ ] Criar `app/api/estudantes/route.ts` com POST para persistencia do cadastro via Prisma
  - Validacao server-side com Zod
  - Hash do CPF com SHA-256 antes de persistir
  - Criacao de sessao apos cadastro bem-sucedido
  - Retorno de erro claro em caso de CPF ja cadastrado
- [ ] Indicador visual de progresso nos tres passos ("Passo 1 de 3")
- [ ] Botao "Voltar" funcional entre passos sem perda dos dados ja preenchidos
- [ ] Validar fluxo completo end-to-end em mobile (viewport 375px)


### Modulo 4 - Mapa de Trilhas

O mapa de trilhas e a tela central do produto. Deve surpreender o estudante ao mostrar, pela primeira vez, todos os caminhos existentes em um unico lugar.

- [ ] Criar `app/(auth)/trilhas/page.tsx` como Server Component que busca trilhas via Prisma
- [ ] Criar `app/api/trilhas/route.ts` com GET para listagem de trilhas ativas
  - Suporte a filtro por modalidade via query param
- [ ] Criar componente `components/trilhas/CardTrilha.tsx`
  - Exibir titulo, modalidade, descricao curta e indicador visual de categoria
  - Responsivo: grid de 1 coluna em mobile, 2 colunas em tablet, 3 em desktop
  - Estado de foco e toque visiveis (sem depender apenas de hover)
- [ ] Criar componente `components/trilhas/FiltroTrilhas.tsx`
  - Filtrar por modalidade (presencial, EAD, tecnico, concurso, mercado)
  - Implementado como Client Component com estado local
  - Filtro visual com botoes de selecao, sem dropdown
- [ ] Saudacao personalizada com o primeiro nome do estudante no topo da pagina
- [ ] Validar carregamento correto das 6 trilhas do seed
- [ ] Validar filtragem funcional sem recarregar a pagina


### Modulo 5 - Tela Interna da Trilha

Quando o estudante clica em um card, ve as informacoes que nunca ninguem explicou de forma clara.

- [ ] Criar `app/(auth)/trilhas/[slug]/page.tsx` como Server Component
  - Buscar trilha pelo slug via Prisma incluindo profissoes associadas
  - Retornar 404 para slug invalido
- [ ] Criar `app/api/trilhas/[slug]/route.ts` com GET para detalhe da trilha
- [ ] Exibir blocos de informacao: o que e, como entrar, tempo de duracao, custo estimado, profissoes possiveis dentro desse caminho
- [ ] Linguagem simples, sem jargoes, com exemplos concretos do contexto nordestino
- [ ] Botao destacado "Entrar na simulacao" que direciona para o simulador desta trilha
- [ ] Botao "Voltar para o mapa" sem perder o estado do filtro anterior
- [ ] Validar renderizacao correta para cada uma das 6 trilhas


### Modulo 6 - Simulador de Carreira

O simulador e onde a experiencia muda de nivel. No MVP, o conteudo e estatico, produzido com qualidade editorial e contexto nordestino real.

- [ ] Criar `app/(auth)/trilhas/[slug]/simulador/page.tsx`
- [ ] Criar `app/api/simulacoes/route.ts` com POST para registrar inicio de simulacao via Prisma
  - Persistir estudanteId, trilhaId e iniciadaEm ao acessar o simulador
- [ ] Criar componente `components/simulador/NarrativaSimulador.tsx`
  - Exibir a narrativa em duas etapas distintas: "Um dia como aluno" e "Um dia como profissional"
  - Progresso visual entre as duas etapas
  - Botao "Continuar" entre as etapas
  - Leitura fluida, paragrafos curtos, linguagem proxima do estudante
- [ ] Ao concluir as duas etapas, chamar POST em `/api/match` com os dados da simulacao
- [ ] Persistir `concluidaEm` na simulacao ao transicionar para resultado
- [ ] Validar que o inicio da simulacao e registrado mesmo se o estudante nao concluir
- [ ] Validar narrativas para cada uma das 6 trilhas (conteudo editorial)


### Modulo 7 - Motor de Match e Tela de Resultado

O resultado e o momento de maior impacto emocional. Deve ser claro, empatico e terminar com uma acao concreta.

- [ ] Criar `lib/match/engine.ts` com a logica de calculo do match
  - Entrada: areaAfinidade do estudante, preocupacaoPrincipal e slug da trilha simulada
  - Saida: pontuacao (0-100), justificativa em texto e proximo passo concreto
  - No MVP, o motor e uma tabela de correspondencia (lookup table): area de afinidade x trilha = pontuacao base, ajustada pela preocupacao principal
  - A logica deve ser facilmente substituivel por um modelo mais sofisticado em versoes futuras
- [ ] Criar `app/api/match/route.ts` com POST para calcular e persistir o resultado via Prisma
  - Validar que o estudante concluiu a simulacao antes de calcular
  - Persistir resultado no modelo `ResultadoMatch`
- [ ] Criar `app/(auth)/trilhas/[slug]/simulador/resultado/page.tsx`
  - Exibir pontuacao de compatibilidade de forma visual (porcentagem ou barra de progresso)
  - Exibir justificativa humanizada em texto
  - Exibir proximo passo concreto em destaque
  - Botao "Simular outra carreira" voltando para o mapa de trilhas
  - Botao "Compartilhar pelo WhatsApp" com link de compartilhamento pre-formatado
- [ ] Implementar logica de compartilhamento via WhatsApp
  - URL: `https://wa.me/?text=` com mensagem pre-formatada contendo o resultado
  - Atualizar `compartilhado = true` no modelo `ResultadoMatch` ao clicar
- [ ] Validar que o resultado e unico e coerente para cada combinacao estudante x trilha


### Modulo 8 - Historico de Simulacoes

O historico permite que o estudante retorne e veja tudo que ja explorou.

- [ ] Criar `app/(auth)/perfil/page.tsx` como Server Component
  - Buscar todas as simulacoes concluidas do estudante autenticado via Prisma com include de ResultadoMatch
- [ ] Adicionar handler GET em `app/api/simulacoes/route.ts` para listar simulacoes do estudante autenticado (o mesmo arquivo ja tem o POST criado no Modulo 6; o Next.js suporta multiplos metodos HTTP no mesmo route.ts via funcoes exportadas separadas)
- [ ] Exibir lista de trilhas simuladas com pontuacao de match de cada uma
- [ ] Link para repetir a simulacao de uma trilha ja explorada
- [ ] Estado vazio claro para estudante que ainda nao simulou nenhuma carreira
- [ ] Validar que o estudante so ve suas proprias simulacoes (isolamento por sessao)


### Modulo 9 - Metricas e Rastreamento de Engajamento

As tres perguntas de sucesso do MVP precisam ser respondidas com dados reais.

- [ ] Criar `app/api/eventos/route.ts` com POST para registro de eventos via Prisma
- [ ] Registrar evento `sessao_iniciada` no middleware ao autenticar
- [ ] Registrar evento `trilha_visualizada` ao acessar tela interna de qualquer trilha
- [ ] Registrar eventos de simulacao nos endpoints ja existentes dos modulos 6 e 7
- [ ] Registrar evento `resultado_compartilhado` ao clicar em compartilhar
- [ ] Criar queries Prisma documentadas para calcular as tres metricas de sucesso do MVP:
  - Taxa de retorno: estudantes com mais de uma sessao / total de estudantes
  - Taxa de conclusao: simulacoes concluidas / simulacoes iniciadas
  - Taxa de compartilhamento: resultados compartilhados / resultados visualizados


### Modulo 10 - Design System e Responsividade

O design system do Léguas e baseado em contraste forte: fundo azul escuro, tipografia clara e amarelo como cor de destaque. A paleta foi definida a partir da identidade visual do produto.

#### Paleta de Cores

```css
/* Cores primarias */
--color-background:   #12203C;  /* azul escuro - fundo principal, header, sidebar */
--color-surface:      #1E3358;  /* azul medio - cards, hover de elementos no fundo escuro */
--color-text:         #F5F6F8;  /* quase branco - texto principal sobre fundo escuro */
--color-accent:       #E2AC40;  /* amarelo - CTAs, destaques, indicadores de progresso */

/* Cores de suporte */
--color-accent-hover: #C99930;  /* amarelo escurecido - estado hover do accent */
--color-border:       #2E4A73;  /* azul acinzentado - bordas e divisores */
--color-text-muted:   #8B9AB0;  /* cinza azulado - textos secundarios, labels */
--color-text-dark:    #12203C;  /* azul escuro - texto sobre fundos claros */
--color-surface-light:#F5F6F8;  /* quase branco - fundo de areas claras, inputs */
```

#### Uso das Cores por Contexto

- Fundo principal de paginas, header e navegacao: `--color-background`
- Cards sobre o fundo azul: `--color-surface`
- Botao primario (CTA principal): fundo `--color-accent`, texto `--color-text-dark`
- Botao secundario: borda `--color-accent`, texto `--color-accent`, fundo transparente
- Textos sobre fundo escuro: `--color-text`
- Textos secundarios e placeholders: `--color-text-muted`
- Indicadores de progresso e destaques visuais: `--color-accent`
- Inputs e areas de formulario: fundo `--color-surface-light`, texto `--color-text-dark`

#### Checklist de Responsividade e Acessibilidade

- [ ] Definir todas as CSS custom properties acima em `globals.css`
- [ ] Configurar tipografia base: minimo 16px para corpo de texto em mobile
- [ ] Todos os componentes devem funcionar em viewports de 320px a 1440px
- [ ] Botoes e areas clicaveis com area minima de 44x44px (padrao de acessibilidade)
- [ ] Formularios com labels visiveis (nao apenas placeholder)
- [ ] Foco de teclado visivel em todos os elementos interativos
- [ ] Ratio de contraste WCAG AA validado para texto sobre fundo (minimo 4.5:1)
- [ ] Testar em Chrome Mobile (iOS e Android) via DevTools e em dispositivo real
- [ ] Validar que a aplicacao carrega em menos de 3 segundos em 3G (simular via DevTools)


### Modulo 11 - Area Administrativa

A area administrativa e acessivel somente por administradores autenticados via email e senha. Ela permite gerenciar todo o conteudo do produto sem precisar alterar codigo.

#### Autenticacao de Admin

- [ ] Criar `app/(admin)/login/page.tsx` com formulario de email e senha
- [ ] Criar `app/(admin)/layout.tsx` que verifica cookie de sessao de admin e redireciona para login se ausente
- [ ] A rota `/admin` nao e indexada por mecanismos de busca (`robots.txt` e meta noindex)

#### Dashboard

- [ ] Criar `app/(admin)/dashboard/page.tsx` com numeros gerais:
  - Total de estudantes cadastrados
  - Total de simulacoes iniciadas e concluidas
  - Total de resultados compartilhados
  - Trilhas mais simuladas

#### Gerenciamento de Trilhas

- [ ] Criar `app/(admin)/trilhas/page.tsx` com listagem de todas as trilhas (ativas e inativas)
- [ ] Criar `app/(admin)/trilhas/nova/page.tsx` com formulario de criacao de trilha
  - Campos: titulo, slug (gerado automaticamente a partir do titulo, editavel), modalidade, descricao curta, descricao completa, como entrar, duracao, custo estimado, primeiros passos, narrativa aluno, narrativa profissional, ordem, ativo
- [ ] Criar `app/(admin)/trilhas/[id]/editar/page.tsx` com formulario de edicao
- [ ] Criar `app/api/admin/trilhas/route.ts` com GET (listagem) e POST (criacao)
- [ ] Criar `app/api/admin/trilhas/[id]/route.ts` com GET, PUT e DELETE
  - DELETE deve ser logico (campo `ativo = false`), nao fisico
- [ ] Criar componente `components/admin/TabelaTrilhas.tsx`

#### Gerenciamento de Profissoes

- [ ] Criar `app/(admin)/profissoes/page.tsx` com listagem de profissoes agrupadas por trilha
- [ ] Criar `app/(admin)/profissoes/nova/page.tsx` com formulario de criacao
  - Campos: nome, descricao, trilha associada, ativo
- [ ] Criar `app/(admin)/profissoes/[id]/editar/page.tsx` com formulario de edicao
- [ ] Criar `app/api/admin/profissoes/route.ts` com GET e POST
- [ ] Criar `app/api/admin/profissoes/[id]/route.ts` com GET, PUT e DELETE logico

#### Gerenciamento de Estudantes

- [ ] Criar `app/(admin)/estudantes/page.tsx` com listagem paginada de estudantes
  - Filtros por escola, ano, area de afinidade e data de cadastro
  - Busca por nome
- [ ] Criar `app/(admin)/estudantes/[id]/page.tsx` com detalhe completo do estudante
  - Dados pessoais (CPF nao exibido, apenas indicador de hash)
  - Historico de simulacoes
  - Resultados de match
  - Opcoes: editar dados, gerar nova senha temporaria, desativar conta
- [ ] Criar `app/api/admin/estudantes/route.ts` com GET paginado
- [ ] Criar `app/api/admin/estudantes/[id]/route.ts` com GET, PUT e DELETE logico
- [ ] Criar `app/api/admin/estudantes/[id]/senha/route.ts` com POST para geracao de senha temporaria
  - Gerar token aleatorio de 8 caracteres
  - Registrar hash do token no banco com validade de 24 horas
  - Retornar o token em texto puro apenas uma vez na resposta da API
  - O estudante usa o token no proximo login no lugar da identificacao habitual
- [ ] Validar que o admin nao consegue ver o CPF original de nenhum estudante (dado irreversivel)

#### Componentes Compartilhados do Admin

- [ ] Criar componente `components/admin/Sidebar.tsx` com navegacao lateral
- [ ] Criar componente `components/admin/TabelaPaginada.tsx` reutilizavel
- [ ] Criar componente `components/admin/FormularioTrilha.tsx` compartilhado entre criacao e edicao
- [ ] Todos os formularios do admin com validacao client-side via Zod


### Modulo 12 - Documentacao Tecnica (README)

A documentacao e parte obrigatoria do MVP. Qualquer pessoa do time deve conseguir clonar o repositorio e rodar o projeto localmente seguindo o README sem precisar perguntar nada para ninguem.

- [ ] Criar `README.md` na raiz do repositorio com as seguintes secoes:

#### Secao: Visao Geral

Descricao curta do produto e da stack utilizada (Next.js 16, Node.js 24, Prisma, PostgreSQL, Docker).

#### Secao: Pre-requisitos

Lista do que precisa estar instalado antes de comecar:
- Docker e Docker Compose
- Node.js 24 ou superior
- npm ou pnpm

#### Secao: Clonando e Configurando o Ambiente

```bash
# 1. Clonar o repositorio
git clone <url-do-repositorio>
cd legua

# 2. Copiar o arquivo de variaveis de ambiente
cp .env.example .env.local
# Editar .env.local com os valores reais (ver secao de variaveis)

# 3. Subir os containers (banco de dados e aplicacao)
docker compose up
```

#### Secao: O que Sao Migrations

Explicacao objetiva: migrations sao arquivos que descrevem as mudancas no schema do banco de dados ao longo do tempo. No Léguas, o Prisma gerencia as migrations automaticamente: quando o `prisma/schema.prisma` e alterado, o Prisma CLI gera um novo arquivo de migration em `prisma/migrations/` e o aplica no banco. Isso garante que todos os ambientes (desenvolvimento, staging, producao) tenham exatamente o mesmo schema.

#### Secao: Comandos Prisma

```bash
# Gerar uma nova migration apos alterar o schema.prisma
npx prisma migrate dev --name descricao-da-mudanca

# Aplicar migrations pendentes (usado em CI e producao)
npx prisma migrate deploy

# Popular o banco com dados iniciais (trilhas, profissoes, admin)
npx prisma db seed

# Abrir o Prisma Studio para inspecionar os dados no navegador
npx prisma studio

# Regenerar o Prisma Client apos mudancas no schema (geralmente automatico)
npx prisma generate

# Resetar o banco e reaplicar todas as migrations e seed (apenas dev)
npx prisma migrate reset
```

#### Secao: Sequencia Completa de Comandos para Primeiro Acesso

```bash
# 1. Clonar e configurar
git clone <url-do-repositorio>
cd legua
cp .env.example .env.local
# editar .env.local

# 2. Instalar dependencias
npm install

# 3. Subir o banco de dados
docker compose up db -d

# 4. Aplicar migrations e popular o banco
npx prisma migrate dev
npx prisma db seed

# 5. Subir a aplicacao em modo de desenvolvimento
npm run dev

# Alternativa: subir tudo junto com Docker
docker compose up
```

#### Secao: Variaveis de Ambiente

Documentar cada variavel do `.env.example` com descricao e exemplo de valor.

#### Secao: Estrutura de Pastas

Descricao resumida de cada pasta principal do projeto.

#### Secao: Acesso ao Admin

Informar a rota de acesso (`/admin`) e que as credenciais iniciais sao definidas via variavel de ambiente no seed.

- [ ] Validar que o README funciona do zero em uma maquina limpa seguindo apenas os passos documentados


## Ordem de Implementacao Recomendada

A implementacao segue esta sequencia para que cada modulo seja testavel antes de depender do seguinte:

1. Modulo 0: Infraestrutura e configuracao base (com Prisma)
2. Modulo 1: Schema do banco e seed
3. Modulo 2: Autenticacao e sessao (estudante e admin)
4. Modulo 10: Design system base (pode rodar em paralelo com 2 e 3)
5. Modulo 3: Cadastro em tres passos
6. Modulo 4: Mapa de trilhas
7. Modulo 5: Tela interna da trilha
8. Modulo 6: Simulador de carreira
9. Modulo 7: Motor de match e tela de resultado
10. Modulo 8: Historico de simulacoes
11. Modulo 9: Metricas e rastreamento
12. Modulo 11: Area administrativa
13. Modulo 12: Documentacao tecnica


## Conteudo Editorial Necessario Antes do Lancamento

O conteudo e tao critico quanto o codigo. As narrativas do simulador precisam estar prontas antes dos testes com usuarios. Para cada uma das 6 trilhas, e necessario produzir:

- Descricao curta para o card do mapa (ate 80 caracteres)
- Descricao completa para a tela interna (3 a 5 paragrafos)
- Como entrar: instrucoes praticas sem jargao
- Duracao e custo estimado com exemplos reais do Piaui
- Lista de profissoes possiveis dentro daquela trilha (minimo 5 por trilha)
- Narrativa "Um dia como aluno" com referencias nordestinas (400 a 600 palavras)
- Narrativa "Um dia como profissional" com referencias nordestinas (400 a 600 palavras)
- Proximo passo concreto para cada trilha (instrucao direta de uma ou duas frases)


## Variaveis de Ambiente Necessarias

```
# Banco de dados (Prisma usa DATABASE_URL diretamente)
DATABASE_URL=postgresql://legua:senha@db:5432/legua
POSTGRES_USER=legua
POSTGRES_PASSWORD=senha
POSTGRES_DB=legua

# Sessao do estudante
SESSION_SECRET=string-longa-e-aleatoria-minimo-32-caracteres
SESSION_MAX_AGE=604800

# Sessao do administrador (secret separado do estudante)
ADMIN_SESSION_SECRET=outra-string-longa-e-aleatoria-minimo-32-caracteres
ADMIN_SESSION_MAX_AGE=28800

# Admin inicial criado pelo seed
ADMIN_INITIAL_EMAIL=admin@legua.com.br
ADMIN_INITIAL_PASSWORD=trocar-na-primeira-entrada

# Aplicacao
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```


## Criterios de Aceitacao do MVP Completo

O MVP esta pronto para testes com usuarios reais quando:

- [ ] Um estudante consegue se cadastrar do zero e chegar ao resultado de match em menos de 10 minutos
- [ ] O fluxo completo funciona em um celular Android com Chrome em conexao 3G
- [ ] Todas as 6 trilhas tem conteudo completo e revisado
- [ ] As tres metricas de sucesso sao coletadas e consultaveis
- [ ] Nenhum dado sensivel (CPF em texto puro, token de sessao) e acessivel via DevTools do navegador
- [ ] A aplicacao sobe com `docker compose up` sem configuracao adicional alem do `.env.local`
- [ ] O botao de compartilhar gera um link valido no WhatsApp com o resultado do estudante
- [ ] O admin consegue criar, editar e desativar trilhas sem alterar codigo
- [ ] O admin consegue visualizar e gerenciar estudantes sem ver o CPF original
- [ ] O README permite que um desenvolvedor novo rode o projeto do zero sem perguntar nada


## O que Fica Fora do Escopo deste CLAUDE.md

Este arquivo cobre exclusivamente o MVP. As funcionalidades de versao 1.1 (simulador interativo com escolhas, mais trilhas, historico expandido) e versao 2.0 (personalizacao por regiao, trilha de preparacao, dashboard para escolas) serao planejadas em arquivo separado apos a validacao do MVP com usuarios reais.
