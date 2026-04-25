# Plano Técnico — Redesign Briefing Spot Seazone

> Documento de planejamento para expandir o app Briefing Seazone com novas seções (Don'ts, Do's, Perfil do Hóspede, Destino, Posicionamento) e UI de dashboard com sidebar.
>
> Elaborado com base nos prints de referência de outros Spots (Santinho / Sul da Ilha) e no estado atual do app pós-sessão de 19/04/2026.

---

## 1. Estado atual (o que já funciona)

- ✅ Supabase configurado (schema, storage, auth)
- ✅ App Next.js rodando local + parser extraindo 6 abas do .docx:
  - Contexto (bairro, região, categoria, estágio, apresentadora, alvará, posicionamento)
  - Informações Técnicas (tipologias, amenidades, total de unidades, detalhes)
  - Pontos Fortes (siglas extraídas das estruturas criativas)
  - Dados Financeiros (investimento, RE mensal, RE anual, condições, financiamento)
  - Localização (endereço, principal atrativo, distâncias, características, perfil do hóspede)
  - Criativos (estruturas, variações, cenas, testes A/B, legendas)
- ✅ Upload .docx → briefing aparece preenchido automaticamente

**Gap identificado:** a UI atual é uma tela única. O template de referência mostra dashboard com sidebar e novas seções que não existem nem na skill nem no schema.

---

## 2. Novas seções a construir

Baseadas nos prints de referência:

### 2.1 Posicionamento
Bloco separado (hoje é só um campo em Contexto). Deve conter:
- Tese principal do Spot (1-2 parágrafos)
- Argumentos-chave a reforçar

### 2.2 Don'ts (Diretrizes negativas)
Lista estruturada de categorias, cada uma com:
- **Título** (ex: "Termos juridicamente proibidos")
- **Tag de alerta** (ex: "Não mencionar", "Evitar comunicar como absoluto")
- **Descrição** (opcional, ex: "Não utilizar os seguintes termos…")
- **Itens** (lista de termos/expressões a evitar)
- **Nota final** (opcional, ex: "O ROI e o rendimento são projeções estimadas")

Categorias típicas observadas:
1. Termos juridicamente proibidos
2. Garantia de Rentabilidade
3. Valorização como promessa
4. Comparação direta com Selic ou renda fixa
5. Escassez artificial
6. Promessas de ocupação total
7. Prazo de entrega como definitivo

### 2.3 Do's (Diretrizes positivas)
Lista estruturada de itens a reforçar, cada um com:
- **Título**
- **Tag verde** (ex: "Reforçar")
- **Descrição** (por que reforçar)

Categorias típicas:
1. Produto concebido para short stay
2. Gestão profissional Seazone
3. Investimento com foco em renda passiva
4. Região como desejada
5. Rendimento em reais
6. Ticket de entrada
7. Estrutura de lazer

### 2.4 Perfil do Hóspede
Múltiplos perfis tipificados, cada um com:
- **Nome** (ex: "Turismo de praia e lifestyle")
- **Tag** (ex: "Perfil Principal", "Alta Recorrência", "Experiência", "Fluxo Constante", "Família")
- **Descrição** (2-3 linhas sobre o perfil)

Exemplo (Campeche) — 5 perfis:
1. Turismo de praia e lifestyle (Perfil Principal)
2. Casais (Alta Recorrência)
3. Jovens e grupos pequenos (Experiência)
4. Nômades digitais (Fluxo Constante)
5. Famílias pequenas (Família)

### 2.5 Características do Destino
Cards com 4 dimensões:
- **REGIÃO** — ex: "Campeche — Sul da Ilha — Florianópolis"
- **PERFIL** — ex: "Destino de praia com lifestyle forte, boa oferta gastronômica…"
- **PRAIA** — ex: "Faixa de areia extensa, ideal para lazer…"
- **INFRAESTRUTURA** — ex: "Quiosques, bares, restaurantes e serviços próximos"

### 2.6 Dados do Empreendimento (visual badge-style)
Resumo numérico em badges:
- Cotas / unidades
- Pavimentos
- Metragens (range)
- Tipologias (quantidade)

(Alguns desses campos não existem hoje — precisam ir ao schema.)

---

## 3. Mudanças na Skill (`briefing-spot-seazone`)

### 3.1 Novas partes a documentar no SKILL.md

**PARTE 13 — POSICIONAMENTO**
- Como escrever tese (formato, tom)
- Exemplos de posicionamento válido

**PARTE 14 — DIRETRIZES DE COMUNICAÇÃO (DON'TS)**
- Lista oficial de categorias de Don'ts (7 acima)
- Cada Don't com: título, tag, descrição, lista de termos
- Regras: termos jurídicos sempre presentes, comparações financeiras sempre evitar

**PARTE 15 — DIRETRIZES DE COMUNICAÇÃO (DO'S)**
- Lista oficial de categorias de Do's (7 acima)
- Cada Do com: título, tag, descrição
- Regras: "Reforçar" como tag padrão

**PARTE 16 — PERFIL DO HÓSPEDE**
- Matriz oficial de perfis (nome + tag)
- Instruções pra adaptar perfis ao destino (ex: Campeche = praia/surf; cidade grande = business)
- Mínimo 3 perfis, máximo 6

**PARTE 17 — CARACTERÍSTICAS DO DESTINO**
- 4 dimensões fixas (REGIÃO/PERFIL/PRAIA ou EQUIV/INFRAESTRUTURA)
- Instruções de redação pra cada uma

### 3.2 Mudanças na PARTE 2 (ABAs)

Expandir de 6 para 10 abas:
```
ABA 1 — Contexto do Empreendimento
ABA 2 — Informações Técnicas
ABA 3 — Pontos Fortes Aplicáveis
ABA 4 — Dados Financeiros
ABA 5 — Localização
ABA 6 — Posicionamento          ← NOVO
ABA 7 — Don'ts                   ← NOVO
ABA 8 — Do's                     ← NOVO
ABA 9 — Perfil do Hóspede        ← NOVO
ABA 10 — Características do Destino  ← NOVO
ABA 11 — Criativos               (renumerada)
```

### 3.3 Mudanças no `template_base.js`

Novas helpers:
- `dontsBlock({ title, tag, description, items, note })` — renderiza card de Don't
- `dosBlock({ title, tag, description })` — renderiza card de Do
- `profileBlock({ name, tag, description })` — renderiza card de perfil
- `destinyCard({ label, content })` — card de REGIÃO/PERFIL/PRAIA/INFRAESTRUTURA

### 3.4 Formato no .docx (pra o parser extrair)

Cada aba começa com `ABA N — NOME` em linha própria.

Dentro, padrão Key:Value ou listas com delimitador claro:

```
ABA 7 — DON'TS
Don't 1: Termos juridicamente proibidos
Tag: Não mencionar
Descrição: Não utilizar os seguintes termos ao se referir ao Spot
Itens: imóveis, imóvel, unidade, propriedade, studio
Nota: —

Don't 2: Garantia de Rentabilidade
Tag: Não mencionar
Descrição: Evitar termos como:
Itens: renda garantida, retorno garantido, investimento sem risco
Nota: O ROI e o rendimento são projeções estimadas.
...
```

---

## 4. Mudanças no Schema (Supabase)

### 4.1 Nova coluna em `briefings`

Opção 1 (preferida) — reutilizar o `content` jsonb, adicionando novas chaves:
```typescript
content: {
  abas: {
    // existentes...
    posicionamento: { tese: string, argumentos: string[] },
    donts: Dont[],
    dos: Do[],
    perfil_hospede: Profile[],
    destino: { regiao, perfil, praia, infraestrutura: string },
  },
  criativos: { ... },
  legendas: [ ... ]
}
```

Vantagem: zero migrations, backward-compatible.

Opção 2 — tabelas separadas (`briefing_donts`, `briefing_dos`, etc.). Mais complexo, benefício marginal.

**Recomendação: Opção 1.**

### 4.2 Campos numéricos adicionais (se adotar o visual de "Dados do Empreendimento")

Adicionar em `briefings`:
```sql
alter table briefings add column total_cotas int;
alter table briefings add column total_pavimentos text;
alter table briefings add column metragem_range text;  -- "14 m² a 41 m²"
alter table briefings add column total_tipologias int;
```

---

## 5. Mudanças no Parser (`docx-parser.ts`)

Adicionar ao `parseAbas(html)`:

```typescript
// Don'ts — split por "Don't N:" e parseia cada bloco
function parseDonts(text: string): Dont[] { ... }

// Do's — split por "Do N:"
function parseDos(text: string): Do[] { ... }

// Perfis — split por "Perfil N:"
function parsePerfis(text: string): Profile[] { ... }

// Destino — Key:Value pros 4 campos fixos
function parseDestino(text: string): DestinoCharacteristics { ... }

// Posicionamento — bloco multiparágrafo após "ABA 6 — POSICIONAMENTO"
function parsePosicionamento(text: string): Posicionamento { ... }
```

---

## 6. Redesign da UI

### 6.1 Nova estrutura de rotas/componentes

```
src/app/briefing/[id]/
├── page.tsx                    # shell com sidebar + conteúdo
├── layout.tsx                  # layout com sidebar
└── sections/
    ├── HeroCard.tsx            # header navy com nome + endereço
    ├── OverviewSection.tsx     # "Início" — resumo + dados do empreendimento
    ├── CriativosSection.tsx    # Estruturas criativas (já existe, só reaproveitar)
    ├── FinanceiroSection.tsx   # Dados financeiros em cards
    ├── PontosFortesSection.tsx # Badges + descrição de cada
    ├── PosicionamentoSection.tsx
    ├── DontsSection.tsx
    ├── DosSection.tsx
    ├── PerfilHospedeSection.tsx
    └── DestinoSection.tsx
```

### 6.2 Componentes UI reutilizáveis

```
src/components/
├── NavigationSidebar.tsx       # sidebar esquerda fixa com logo + nav
├── SectionHeader.tsx           # ícone + título + descrição
├── DontCard.tsx                # card vermelho/rosa com lista
├── DoCard.tsx                  # card verde com descrição
├── ProfileCard.tsx             # card de perfil com tag colorida
├── DestinyCard.tsx             # card amarelo com label + conteúdo
├── DataBadge.tsx               # badge de dado numérico (97 cotas, etc.)
└── TagBadge.tsx                # tag colorida (Não mencionar, Reforçar, Perfil Principal)
```

### 6.3 Sidebar — estrutura

```
Logo Seazone
NOME DO SPOT (subtítulo)
─────────────
[🌟] Estrutura dos Criativos    ← default selected
[💰] Dados Financeiros
[🎯] Pontos Fortes e Posicionamento
[🚫] Definição dos Don'ts
[✓] Definição dos Do's
[👥] Perfil do Hóspede
─────────────
Material de Referência Estratégica (footer)
```

### 6.4 Paleta e tokens

- Navy primary: `#00143D`
- Accent red/orange: `#FC6058`
- Background geral: off-white `#F8FAFC`
- Cards: white com sombra sutil
- Don't cards: `#FEF2F2` (rosa claro) + border `#FCA5A5`
- Do cards: `#F0FDF4` (verde claro) + border `#86EFAC`
- Profile/Destiny cards: colored badges com background tintado

---

## 7. Sequência de execução recomendada

### Fase 1 — Skill (sessão dedicada, ~2h)
1. Ler skill atual completa
2. Adicionar PARTE 13 a 17 ao SKILL.md
3. Expandir `template_base.js` com novas helpers
4. Gerar briefing exemplo completo (Campeche) com as 11 abas
5. Validar com QA visual do .docx

### Fase 2 — Schema + Parser (sessão dedicada, ~2h)
1. Adicionar chaves `posicionamento/donts/dos/perfil_hospede/destino` ao `BriefingContent` type
2. Adicionar colunas numéricas em `briefings` (cotas, pavimentos, etc.) — migration SQL
3. Expandir `docx-parser.ts` com parseDonts/parseDos/parsePerfis/parseDestino/parsePosicionamento
4. Upload .docx de exemplo e confirmar extração via banco (SQL SELECT)

### Fase 3 — UI (sessão dedicada, ~3-4h)
1. Criar componentes reutilizáveis (sidebar, cards, badges)
2. Refatorar `briefing/[id]/page.tsx` para layout com sidebar
3. Criar componentes de cada seção
4. Aplicar paleta e tokens
5. Testes visuais em vários Spots

### Fase 4 — Integração + Deploy (sessão dedicada, ~2h)
1. Testes end-to-end (skill → upload → UI)
2. Edge cases (briefings antigos sem as novas seções)
3. Polimento (animações, loading states, erros)
4. Deploy Netlify
5. Smoke test em produção

**Estimativa total: 9-11h distribuídas em 4 sessões.**

---

## 8. Riscos e observações

- **Backward compatibility:** briefings antigos (sem os novos campos) precisam renderizar sem quebrar — todas as novas seções devem tratar dados vazios graciosamente.
- **Skill não tem versionamento:** mudar a skill afeta todos os briefings futuros. Recomendo criar cópia de referência antes de mexer.
- **Mobile:** sidebar precisa virar drawer em telas pequenas. Considerar `shadcn/ui` para componentes base.
- **Edição inline:** manter o padrão de "click to edit" atual em todos os campos novos.
- **Link público (`/share/[shareId]`):** precisa renderizar igual à edição mas em modo read-only.

---

## 9. Perguntas em aberto

Antes de executar Fase 1, preciso confirmar:

1. **Don'ts/Do's são idênticos pra todos os Spots ou variam?** (Dá impressão de que são templates reutilizáveis com poucas variações contextuais.)
2. **Perfis têm lista oficial fechada ou cada Spot pode ter os seus?** (Nos prints vi 5 perfis — "Turismo de praia", "Casais", "Nômades digitais", "Jovens e grupos pequenos", "Famílias pequenas". Parecem ser tipificações reutilizáveis.)
3. **Valores numéricos exatos do Campeche:** existe o conceito de "cotas" aplicável? (Nos prints do Santinho apareceu "97 cotas" mas no Campeche você me passou "66 apartamentos + 2 lojas".)
4. **Template visual em código:** você tem acesso ao repo Lovable/Figma dos prints que mandou? Isso aceleraria o trabalho na Fase 3.
5. **Granularidade de edição:** cada card (Don't, Do, Perfil) deve ser individualmente editável ou o usuário edita o bloco inteiro de uma vez?

---

## 10. Próximos passos

- [ ] Validar este plano com o stakeholder
- [ ] Responder as 5 perguntas em aberto da seção 9
- [ ] Reservar horários pra Fases 1–4
- [ ] Fase 1 — Skill
