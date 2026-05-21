# Manual de Implementação — Hélio

> **Tarefa:** No formulário de "Editar informações" do perfil do estudante, trocar o campo de texto livre do **curso técnico** por uma lista (dropdown) com os mesmos cursos que aparecem no cadastro inicial.

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
git checkout helio_dev
git pull origin helio_dev
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

## 2. Entender o problema

No **cadastro inicial** (passo 2), o curso técnico é escolhido em uma lista pronta — assim o aluno não digita o nome errado:

> "Eletrotécnica", "Informática", "Enfermagem", etc.

Já no **perfil > Editar informações**, esse mesmo campo é um **input livre**. Ou seja, o aluno pode digitar "etrotecnica" ou "info" e ferrar com o sistema de match (que depende do nome correto).

Vamos trocar esse input por um `<select>` igual ao do cadastro, usando os mesmos dados.

---

## 3. Modificar o código

### 3.1. Importar a lista de cursos técnicos

**Arquivo:** [components/perfil/EditarPerfilForm.tsx](../components/perfil/EditarPerfilForm.tsx)

**Localize este bloco (linhas 1 a 4):**

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
```

**Substitua por:**

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cursosTecnicos } from "@/lib/data/cursos-tecnicos";
```

> **O que mudou:** Adicionei o `import` da lista `cursosTecnicos`, que é o mesmo arquivo que o cadastro usa. Assim os dois lugares ficam **sempre sincronizados**: se alguém adicionar ou renomear um curso, os dois funcionam.

---

### 3.2. Trocar o input livre por um select

Ainda no mesmo arquivo, **localize este bloco (linhas 148 a 156):**

```tsx
      <div>
        <label style={labelStyle}>Curso técnico (se houver)</label>
        <input
          style={inputStyle}
          value={form.cursoTecnico ?? ""}
          onChange={(e) => mudar("cursoTecnico", e.target.value)}
          placeholder="Deixe em branco se não tiver"
        />
      </div>
```

**Substitua por:**

```tsx
      <div>
        <label style={labelStyle}>Curso técnico (se houver)</label>
        <select
          style={inputStyle}
          value={form.cursoTecnico ?? ""}
          onChange={(e) => mudar("cursoTecnico", e.target.value)}
        >
          <option value="">Não faço nenhum</option>
          {cursosTecnicos.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.nome}
            </option>
          ))}
        </select>
      </div>
```

> **O que mudou:**
> - `<input>` virou `<select>`.
> - A primeira opção vazia (`""`) representa "não faz nenhum curso técnico".
> - Em seguida, listamos todas as opções de `cursosTecnicos`, usando o `slug` como valor interno (igual o cadastro faz) e o `nome` como rótulo bonito para o usuário.

---

## 4. Salvar e testar

### 4.1. Salvar o arquivo

No VS Code: `Ctrl + S`. Verifique no canto inferior direito se está como `LF`.

### 4.2. Reiniciar os containers

No terminal onde o Docker está rodando, pressione `Ctrl + C` para parar. Depois:

```bash
docker compose down
docker compose up --build
```

### 4.3. Verificar

1. Abra `http://localhost:3000` no navegador.
2. Faça um cadastro completo (ou entre com um cadastro existente).
3. No menu superior, clique em **"Olá, [seu nome]"** para abrir o perfil.
4. Role a página até a seção de informações pessoais e clique no botão **"Editar informações"**.
5. Olhe o campo **"Curso técnico"**:
   - Deve ser uma **lista clicável** (não mais um campo de texto livre).
   - Ao abrir, deve mostrar **"Não faço nenhum"** como primeira opção e em seguida todos os cursos técnicos (Eletrotécnica, Informática, Enfermagem, etc).
6. Selecione um curso técnico diferente e clique em **"Salvar alterações"**.
7. Volte a clicar em **"Editar informações"** e confirme que a opção escolhida ficou marcada (significa que o backend gravou e o frontend leu corretamente).

---

## 5. Subir as alterações

Quando tudo estiver funcionando:

```bash
git add .
git commit -m "fix: usa lista padronizada de cursos tecnicos no editar perfil"
git push origin helio_dev
```

Avise o time que a branch está pronta para revisão.
