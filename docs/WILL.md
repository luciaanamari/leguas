# Manual de Implementação — Will

> **Tarefa:** Validar os campos do Passo 1 do cadastro (nome muito longo, data de nascimento inválida, CPF inválido, CPF já cadastrado) **ao clicar em "Próximo"**, e não só ao finalizar o cadastro.

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
git checkout will_dev
git pull origin will_dev
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

Hoje o cadastro tem 4 passos. No Passo 1 (dados pessoais), algumas validações **já funcionam ao clicar em "Próximo"** (CPF inválido, senhas diferentes, e-mail inválido). Mas duas coisas só dão erro **no final**:

- **Nome muito longo** (não tem limite hoje).
- **CPF já cadastrado** (só é detectado quando enviamos para o banco).

Também não há validação clara para **data de nascimento no futuro** ou idade impossível.

Vamos consertar esses três pontos.

---

## 3. Modificar o código

### 3.1. Criar um endpoint para checar se o CPF já existe

**Crie um arquivo novo:** `app/api/estudantes/verificar-cpf/route.ts`

> Você precisa criar a pasta `verificar-cpf` dentro de `app/api/estudantes/`.

**Cole exatamente este conteúdo:**

```ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashCpf } from "@/lib/hash";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { cpf?: string } | null;
  const cpf = typeof body?.cpf === "string" ? body.cpf.replace(/\D/g, "") : "";

  if (cpf.length !== 11) {
    return NextResponse.json({ existe: false });
  }

  const cpfHash = hashCpf(cpf);
  const encontrado = await prisma.estudante.findUnique({
    where: { cpfHash },
    select: { id: true },
  });

  return NextResponse.json({ existe: !!encontrado });
}
```

> **O que faz:** Recebe um CPF, transforma em hash (igual o cadastro faz) e responde se já existe alguém com esse CPF. O CPF nunca é guardado em texto puro — esse endpoint mantém a privacidade.

---

### 3.2. Atualizar as validações do Passo 1

**Arquivo:** [components/cadastro/PassoCadastro.tsx](../components/cadastro/PassoCadastro.tsx)

**Localize este bloco (linhas 180 a 197):**

```ts
  function validaPasso1(): boolean {
    const novos: Record<string, string> = {};
    if (estado.nome.trim().length < 2) novos.nome = "Informe seu nome completo";
    if (!estado.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(estado.email))
      novos.email = "Informe um e-mail válido";
    if (estado.senha.length < 8) novos.senha = "A senha deve ter pelo menos 8 caracteres";
    if (estado.senha !== estado.confirmarSenha) novos.confirmarSenha = "As senhas não coincidem";
    if (!estado.dataNascimento) novos.dataNascimento = "Informe a data de nascimento";
    if (estado.cpf.replace(/\D/g, "").length !== 11) novos.cpf = "CPF deve ter 11 dígitos";
    else if (!validaCpfMath(estado.cpf))
      novos.cpf = "CPF inválido. Verifique os números digitados.";
    const wapp = estado.whatsapp.replace(/\D/g, "");
    if (wapp.length > 0 && (wapp.length < 10 || wapp.length > 11))
      novos.whatsapp = "WhatsApp inválido (10 ou 11 dígitos)";
    if (!estado.rendaFamiliar) novos.rendaFamiliar = "Selecione uma faixa de renda";
    setErros(novos);
    return Object.keys(novos).length === 0;
  }
```

**Substitua por:**

```ts
  function validaPasso1(): boolean {
    const novos: Record<string, string> = {};
    const nomeTrim = estado.nome.trim();
    if (nomeTrim.length < 2) novos.nome = "Informe seu nome completo";
    else if (nomeTrim.length > 100) novos.nome = "Nome muito longo (máximo 100 caracteres)";

    if (!estado.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(estado.email))
      novos.email = "Informe um e-mail válido";
    if (estado.senha.length < 8) novos.senha = "A senha deve ter pelo menos 8 caracteres";
    if (estado.senha !== estado.confirmarSenha) novos.confirmarSenha = "As senhas não coincidem";

    if (!estado.dataNascimento) {
      novos.dataNascimento = "Informe a data de nascimento";
    } else {
      const nascimento = new Date(estado.dataNascimento);
      const hoje = new Date();
      if (isNaN(nascimento.getTime())) {
        novos.dataNascimento = "Data de nascimento inválida";
      } else if (nascimento > hoje) {
        novos.dataNascimento = "A data de nascimento não pode estar no futuro";
      } else {
        const idade = Math.floor(
          (hoje.getTime() - nascimento.getTime()) / (1000 * 60 * 60 * 24 * 365.25),
        );
        if (idade < 14) novos.dataNascimento = "Você precisa ter pelo menos 14 anos";
        else if (idade > 30) novos.dataNascimento = "Idade fora do público do Légua (máximo 30 anos)";
      }
    }

    if (estado.cpf.replace(/\D/g, "").length !== 11) novos.cpf = "CPF deve ter 11 dígitos";
    else if (!validaCpfMath(estado.cpf))
      novos.cpf = "CPF inválido. Verifique os números digitados.";

    const wapp = estado.whatsapp.replace(/\D/g, "");
    if (wapp.length > 0 && (wapp.length < 10 || wapp.length > 11))
      novos.whatsapp = "WhatsApp inválido (10 ou 11 dígitos)";
    if (!estado.rendaFamiliar) novos.rendaFamiliar = "Selecione uma faixa de renda";
    setErros(novos);
    return Object.keys(novos).length === 0;
  }
```

> **O que mudou:**
> - Adicionei verificação de **nome com no máximo 100 caracteres**.
> - Adicionei verificação completa de **data de nascimento**: não pode ser no futuro, idade tem que ficar entre 14 e 30 anos.

---

### 3.3. Verificar o CPF no servidor antes de avançar

Ainda no mesmo arquivo, **localize este bloco (linhas 283 a 290):**

```ts
  function avancar() {
    if (passo === 1 && validaPasso1()) setPasso(2);
    else if (passo === 2 && validaPasso2()) setPasso(3);
    else if (passo === 3 && validaPasso3()) {
      setPasso(4);
      setPerguntaDiscIdx(0);
    }
  }
```

**Substitua por:**

```ts
  async function avancar() {
    if (passo === 1) {
      if (!validaPasso1()) return;

      // Verifica no servidor se o CPF ja esta cadastrado
      try {
        const resp = await fetch("/api/estudantes/verificar-cpf", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cpf: estado.cpf }),
        });
        const data = (await resp.json()) as { existe: boolean };
        if (data.existe) {
          setErros({ cpf: "Já existe um cadastro com esse CPF." });
          return;
        }
      } catch {
        setErros({ cpf: "Não foi possível verificar o CPF agora. Tente novamente." });
        return;
      }

      setPasso(2);
    } else if (passo === 2 && validaPasso2()) {
      setPasso(3);
    } else if (passo === 3 && validaPasso3()) {
      setPasso(4);
      setPerguntaDiscIdx(0);
    }
  }
```

> **O que mudou:**
> - A função virou `async` (porque agora ela faz uma chamada de rede).
> - Quando o passo é 1, depois de passar nas validações locais, ela bate no endpoint que você criou no item 3.1 para checar o CPF.
> - Se o CPF já existe, mostra o erro **no Passo 1** (não deixa o usuário continuar até o final só para descobrir isso).

---

### 3.4. Adicionar limite de caracteres direto no input do nome

Ainda no mesmo arquivo, **localize este bloco (linhas 333 a 340):**

```tsx
          <input
            id="nome"
            className="input"
            type="text"
            value={estado.nome}
            onChange={(e) => atualiza("nome", e.target.value)}
            autoComplete="name"
          />
```

**Substitua por:**

```tsx
          <input
            id="nome"
            className="input"
            type="text"
            maxLength={100}
            value={estado.nome}
            onChange={(e) => atualiza("nome", e.target.value)}
            autoComplete="name"
          />
```

> **O que mudou:** O `maxLength={100}` impede o usuário de digitar mais de 100 caracteres no campo (proteção adicional além da validação JavaScript).

---

## 4. Salvar e testar

### 4.1. Salvar os arquivos

No VS Code: `Ctrl + S` em cada arquivo modificado. Verifique no canto inferior direito se está como `LF`.

### 4.2. Reiniciar os containers

```bash
docker compose down
docker compose up --build
```

> O restart é necessário porque você criou um novo arquivo de API.

### 4.3. Verificar

Abra `http://localhost:3000/cadastro` e teste cada cenário no Passo 1:

| Teste | O que digitar | Resultado esperado ao clicar em "Próximo" |
|---|---|---|
| Nome muito longo | mais de 100 letras (cole "aaaaa..." várias vezes) | O campo trava em 100 caracteres; se forçar, aparece "Nome muito longo" |
| Data no futuro | uma data depois de hoje | Aparece "A data de nascimento não pode estar no futuro" |
| Idade impossível | nascimento em 1900 | Aparece "Idade fora do público do Légua" |
| Criança | nascimento em 2020 | Aparece "Você precisa ter pelo menos 14 anos" |
| CPF inválido | `111.111.111-11` | Aparece "CPF inválido" |
| CPF já cadastrado | use um CPF que você já cadastrou antes (faça um cadastro completo primeiro com `123.456.789-09`, depois tente cadastrar de novo com o mesmo CPF) | Aparece "Já existe um cadastro com esse CPF" **no Passo 1** |

Para gerar CPFs válidos para teste, use: https://www.4devs.com.br/gerador_de_cpf

---

## 5. Subir as alterações

Quando tudo estiver funcionando:

```bash
git add .
git commit -m "feat: valida campos do passo 1 do cadastro ao clicar em próximo"
git push origin will_dev
```

Avise o time que a branch está pronta para revisão.
