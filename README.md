# SoftFlow

Central de trabalho pessoal: demandas em quadro, kanban e cronograma, automações e uma visão só de leitura do GitHub. Os dados e o login ficam no Supabase, e só os e-mails autorizados entram. Tudo roda nos planos gratuitos do Supabase, da Vercel e do GitHub.

## Funcionalidades

- **Demandas:** quadro (tabela), kanban, cronograma, sub-tarefas, comentários e colunas personalizadas.
- **Automações:** regras do tipo "Quando… se… então…".
  - **Gatilhos de demanda:** mudança de status (inclusive mover no kanban), criação, prioridade, etiqueta, prazo vencido e cronômetro parado.
  - **Gatilhos de fatura:** criada, paga ou vencida.
  - **Ações:** mudar status ou prioridade, mover de grupo, etiquetar, atribuir, comentar, notificar no desktop, ligar ou desligar o cronômetro, arquivar, criar uma demanda de acompanhamento e criar um rascunho de fatura com as horas da demanda.
  - **Comportamento:** uma regra pode disparar outra (até 3 níveis, sem laços). Toda execução fica no histórico, com o motivo quando falha. Há modelos prontos.
  - **Limite:** as regras rodam no navegador com o app aberto, e os gatilhos por prazo são verificados a cada 5 minutos.
- **Controle de tempo:** cronômetro por demanda (um por vez, visível no topo) e lançamento manual de horas.
- **Recorrência:** diária, semanal ou mensal. Ao concluir, a próxima ocorrência é criada.
- **Etiquetas:** coloridas, com filtro no quadro e no kanban.
- **Dependências:** "bloqueada por", com aviso ao concluir antes da hora e bloqueio de ciclos.
- **Vínculo com o GitHub:** links de PRs e issues na demanda, com estado e CI.
- **Arquivo:** tira demandas do quadro sem apagar. Excluir e arquivar têm "Desfazer".
- **Anexos:** arquivos de até 50 MB por demanda, no Supabase Storage (bucket privado).
- **Paleta de comandos:** Ctrl+K / ⌘K para buscar demandas, criar, navegar e controlar o cronômetro.
- **Faturamento:**
  - clientes com valor-hora;
  - projetos de valor fechado com marcos;
  - faturas montadas a partir das horas não faturadas, dos marcos ou de itens manuais;
  - situações: rascunho, enviada, paga, vencida e cancelada;
  - resumo de receita e versão para imprimir ou salvar em PDF.

  Cancelar uma fatura devolve as horas e os marcos para serem faturados de novo.
- **GitHub:** visão só de leitura dos seus PRs, revisões pendentes, issues, repositórios e atividade.

## Arquitetura

- **Front-end** (`src/`): React + Vite. Lê e grava direto no Supabase, protegido por segurança por linha (RLS). Recebe as mudanças em tempo real.
- **API** (`api/`): funções serverless da Vercel. Elas guardam as chaves e exigem login de um e-mail autorizado.
  - `GET /api/github/overview`: seus PRs, PRs aguardando sua revisão, issues atribuídas, repositórios e atividade recente.
  - `POST /api/github/links`: estado dos PRs e issues vinculados às demandas.
  - `GET /api/status`: informa quais integrações têm credenciais configuradas.
- **Banco** (`supabase/migrations/`): tabelas, RLS, lista de e-mails permitidos, bucket de anexos e publicação de tempo real.
- **Lógica de domínio** (`src/lib/`): recorrência, tempo, faturamento, automações e links do GitHub, em funções puras com testes (`npm test`).
- **Motor de automações** (`src/components/AutomationEngine.tsx`): os contextos de tarefas e de faturamento emitem eventos (`src/lib/automationEvents.ts`), e o motor aplica as regras. Ele tem testes de ponta a ponta com um Supabase em memória.

## Configuração

### 1. Supabase

1. Crie um projeto em [supabase.com](https://supabase.com).
2. Aplique o esquema. Uma opção é `supabase link --project-ref <ref>` seguido de `supabase db push`. A outra é colar `supabase/migrations/*.sql` no SQL Editor.
3. Autorize o seu e-mail (o mesmo da sua conta do GitHub), no SQL Editor:
   ```sql
   insert into public.allowed_emails (email) values ('voce@exemplo.com');
   ```
4. Ative o login com GitHub em **Authentication → Providers → GitHub**:
   - Crie um OAuth App no GitHub (Settings → Developer settings → OAuth Apps) com o callback `https://<ref>.supabase.co/auth/v1/callback`.
   - Cole o Client ID e o Client Secret no Supabase.
5. Em **Authentication → URL Configuration**, defina o Site URL (ex.: `https://softflow-chi.vercel.app`) e adicione `http://localhost:3000` aos Redirect URLs.

### 2. Token do GitHub (somente leitura)

Crie um fine-grained token em GitHub → Settings → Developer settings → Personal access tokens. Dê acesso de leitura a Metadata, Contents, Issues e Pull requests nos repositórios que você quer ver. Um token clássico com o escopo `repo` também funciona.

### 3. Variáveis de ambiente (Vercel)

Veja `.env.example`. Cadastre com `vercel env add <NOME>` ou no painel do projeto:

| Variável | Onde é usada |
|---|---|
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` | navegador |
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | API |
| `GITHUB_TOKEN` | API (tela GitHub) |

## Desenvolvimento local

```bash
npm install
cp .env.example .env.local   # preencha os valores
npx vercel dev               # sobe o Vite e as funções de /api juntos
```

`npm run dev` sobe só o front-end, sem as rotas `/api`. `npm test` roda os testes unitários.
