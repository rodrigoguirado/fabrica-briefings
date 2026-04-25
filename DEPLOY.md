# Deploy — Briefing Spot Seazone

## Pré-requisitos

- Conta no [Supabase](https://supabase.com) (plano Free)
- Conta no [Netlify](https://netlify.com) (plano Free)
- Node.js 18+ instalado localmente (para desenvolvimento)

---

## 1. Setup do Supabase

### 1.1 Criar projeto

1. Acesse https://supabase.com/dashboard
2. Clique "New Project"
3. Escolha um nome (ex: `briefing-seazone`) e uma senha forte
4. Região: South America (São Paulo)
5. Aguarde a criação (~2 min)

### 1.2 Rodar o schema

1. No dashboard do Supabase, vá em **SQL Editor**
2. Clique "New Query"
3. Cole o conteúdo do arquivo `supabase_schema.sql`
4. Clique "Run"
5. Verifique que as tabelas `profiles` e `briefings` foram criadas em **Table Editor**

### 1.3 Criar bucket de storage

1. Vá em **Storage** no menu lateral
2. Clique "New Bucket"
3. Nome: `briefing-files`
4. Marque **Public bucket**
5. Clique "Create"

### 1.4 Configurar políticas do Storage

1. Em Storage > `briefing-files` > **Policies**
2. Adicione estas políticas:
   - **SELECT (download)**: Allow for all users → `true`
   - **INSERT (upload)**: Allow for authenticated → `auth.role() = 'authenticated'`
   - **DELETE**: Allow for authenticated → `auth.role() = 'authenticated'`

### 1.5 Criar primeiro usuário

1. Vá em **Authentication** > **Users**
2. Clique "Add User" > "Create New User"
3. Email: `marketing.interno@seazone.com.br`
4. Senha: (escolha uma senha forte)
5. Marque "Auto-confirm email"
6. Repita para cada membro do time

### 1.6 Copiar credenciais

1. Vá em **Settings** > **API**
2. Copie:
   - **Project URL** (ex: `https://xxxx.supabase.co`)
   - **anon public key** (começa com `eyJ...`)

---

## 2. Setup do projeto local

```bash
# Clonar / copiar os arquivos do projeto
cd briefing-app

# Instalar dependências
npm install

# Criar arquivo de ambiente
cp .env.local.example .env.local

# Editar .env.local com suas credenciais Supabase:
# NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key

# Rodar em desenvolvimento
npm run dev
```

Acesse http://localhost:3000 para testar.

---

## 3. Deploy no Netlify

### 3.1 Via Git (recomendado)

1. Suba o código para um repositório Git (GitHub/GitLab)
2. No Netlify, clique "Add new site" > "Import an existing project"
3. Conecte ao repositório
4. Build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `.next`
5. Em **Environment variables**, adicione:
   - `NEXT_PUBLIC_SUPABASE_URL` = sua URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = sua anon key
6. Clique "Deploy"

### 3.2 Instalar plugin Next.js

O `netlify.toml` já configura o plugin `@netlify/plugin-nextjs`.
Se não funcionar automaticamente:
1. Vá em **Plugins** no Netlify
2. Busque "Next.js Runtime"
3. Instale para o seu site

### 3.3 Domínio customizado (opcional)

1. Em **Domain management** no Netlify
2. Adicione seu domínio (ex: `briefing.seazone.com.br`)
3. Configure o DNS conforme instruções

---

## 4. Como usar

### Fluxo completo:

1. **No Cowork:** Forneça dados do Spot → skill gera briefing → entrega .docx
2. **No app:** Login → "+ Novo Spot" → Upload .docx → sistema parseia automaticamente
3. **Editar:** Clique em qualquer campo para editar, adicione fotos/vídeos de referência
4. **Salvar:** Botão "Salvar" no topo (aparece quando há alterações)
5. **Compartilhar:** Botão "Compartilhar" copia o link público
6. **Link público:** Quem acessar vê apenas visualização (sem edição)

### Links:

- **Dashboard:** `seusite.netlify.app/` (requer login)
- **Briefing (edição):** `seusite.netlify.app/briefing/{id}` (requer login)
- **Briefing (público):** `seusite.netlify.app/share/{shareId}` (qualquer pessoa)

---

## 5. Estrutura do projeto

```
briefing-app/
├── netlify.toml                    # Config Netlify
├── package.json                    # Dependências
├── supabase_schema.sql             # Schema do banco
├── .env.local.example              # Template de variáveis
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Layout raiz
│   │   ├── globals.css             # Estilos globais
│   │   ├── page.tsx                # Dashboard
│   │   ├── login/page.tsx          # Login
│   │   ├── upload/page.tsx         # Upload DOCX
│   │   ├── briefing/[id]/page.tsx  # View/Edit briefing
│   │   └── share/[shareId]/page.tsx # Link público
│   ├── components/
│   │   ├── Header.tsx              # Header com nav
│   │   ├── StatsCards.tsx          # Cards de estatísticas
│   │   ├── BriefingTable.tsx       # Tabela do dashboard
│   │   ├── BriefingView.tsx        # Visualização completa
│   │   ├── EditableField.tsx       # Campo editável inline
│   │   ├── PontosFortesBadges.tsx  # Badges coloridos
│   │   ├── SceneTable.tsx          # Tabela de cenas
│   │   └── MediaUpload.tsx         # Upload de fotos/vídeos
│   ├── lib/
│   │   ├── supabase.ts             # Cliente Supabase
│   │   ├── docx-parser.ts          # Parser de DOCX
│   │   └── utils.ts                # Utilitários
│   └── types/
│       └── briefing.ts             # TypeScript types
```
