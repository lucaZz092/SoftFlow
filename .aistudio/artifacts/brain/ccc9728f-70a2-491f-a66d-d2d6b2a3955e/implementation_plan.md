# SoftFlow - Transformação Funcional Completa

Plano de engenharia e interatividade para tornar todas as funcionalidades do SoftFlow 100% operacionais, interativas e completas, atendendo aos requisitos confirmados pelo usuário.

---

## Decisões Confirmadas pelo Usuário

> [!IMPORTANT]
> - **Operações Claude & Codex**: Templates realistas pré-configurados com execução instantânea (sem tempo de espera ou dependência de chaves de API externas).
> - **Recursos do Quadro**: Drag-and-drop nativo no Kanban Ágil, seletores de datas inline rápidos e sistema dinâmico de criação de colunas personalizadas (Texto, Estimativa, Link, Tag).
> - **Integração GitHub**: Conexão com campo de Token de Acesso Pessoal (PAT) do GitHub para autenticação, sincronização de branches, criação de Pull Requests e teste de conexão com o repositório.

---

## 1. Visão Geral & Escopo Funcional

O objetivo é transformar cada botão, menu, seletor e interação do SoftFlow em uma funcionalidade ativa e com retorno imediato de estado:
1. **Adição Dinâmica de Colunas Personalizadas**: O botão `+` no cabeçalho das tabelas permitirá adicionar novas colunas (ex: *Estimativa (Horas)*, *Link da PR*, *Tags*, *Texto Customizado*), renderizando células editáveis em todas as linhas e persistindo no estado.
2. **Kanban Ágil com Drag-and-Drop Completo**: Permitir arrastar e soltar cartões diretamente entre as colunas (*A Fazer*, *Em andamento*, *Em Revisão*, *Parado*, *Pronto*), com atualização automática dos status e acionamento de fluxos vinculados.
3. **Seletor de Datas & Prazos Inline**: Clicar na célula de prazo abrirá um calendário interativo para alterar datas com cálculo de atraso em tempo real.
4. **Integração GitHub com Token Pessoal**: Adicionar suporte a PAT (Personal Access Token) para testar conexão com a API do GitHub, além de disparar criação de branches `feature/` e Pull Requests diretamente das demandas.
5. **Automações e Templates Instantâneos**: Claude e Codex fornecerão geração instantânea de critérios de aceite, user stories, testes unitários em Vitest/Jest com botão de cópia e execução imediata.
6. **Controles da Barra de Ferramentas Funcionais**: Ordenação ativa (por título, prazo ou prioridade), ocultar/exibir colunas selecionadas, agrupamento por status ou responsável.

---

## 2. Experiência do Usuário & Fluxos de Interação

```
┌────────────────────────────────────────────────────────────────────────┐
│                        SoftFlow Architecture Flow                       │
├───────────────────┬────────────────────────────────────────────────────┤
│ 1. Quadro/Table   │  • Edição inline de título, status, prioridade     │
│                   │  • Seletor de data interativo por clique          │
│                   │  • Criação dinâmica de novas colunas customizadas  │
│                   │  • Multi-seleção de linhas e exclusão em lote      │
├───────────────────┼────────────────────────────────────────────────────┤
│ 2. Kanban Ágil    │  • Arraste de cards com feedback visual (drag/drop)│
│                   │  • Transição imediata de status e automações       │
├───────────────────┼────────────────────────────────────────────────────┤
│ 3. Integração Git │  • Input para GitHub Personal Access Token (PAT)   │
│                   │  • Teste de conexão com status ativo               │
│                   │  • Criação de branch e PR direta da tarefa         │
├───────────────────┼────────────────────────────────────────────────────┤
│ 4. Claude & Codex │  • Execução instantânea com templates ricos        │
│                   │  • Copiar código e aprovar critérios com 1 clique  │
└───────────────────┴────────────────────────────────────────────────────┘
```

### Detalhamento dos Componentes Interativos

1. **Modal de Nova Coluna**:
   - Disparado pelo botão `+` da tabela.
   - Permite escolher Nome da Coluna e Tipo (*Texto*, *Número/Horas*, *Link*, *Status Extra*).
   - Insere a coluna no estado e adiciona o valor correspondente nas tarefas.

2. **Seletor de Data Popover**:
   - Clicar na célula de prazo abre um calendário rápido com atalhos: *Hoje*, *Amanhã*, *Próxima Semana* ou seletor de data específico.

3. **Kanban Drag-and-Drop**:
   - Implementado com HTML5 Drag & Drop nativo, garantindo fluidez e zero dependências pesadas.
   - Cartões com visual elevado durante o arraste e área receptora iluminada.

4. **Gerenciador de GitHub no Drawer e Modal**:
   - Campo para inserir token GitHub pessoal com armazenamento seguro em `localStorage`.
   - Botão "Testar Token & Conexão" com feedback de sucesso/permissões.
   - Ação "Criar Pull Request" com geração de título e número sequencial real.

5. **Barra de Ferramentas Completa**:
   - **Ordenar**: Escolher ordenação por *Prazo (Crescente/Decrescente)*, *Prioridade* ou *Nome*.
   - **Ocultar Colunas**: Menu dropdown com toggles para ocultar colunas como *Cronograma*, *Integrações*, *Prioridade*.
   - **Agrupar por**: Alternar agrupamento entre *Grupos de Negócio*, *Status* ou *Responsável*.

---

## 3. Arquitetura Técnica & Modelo de Dados

### Atualizações no Estado (`ProjectContext.tsx` e `types/index.ts`):
- `customColumns`: Array de colunas adicionais `{ id: string; title: string; type: 'text' | 'number' | 'date' | 'link' }`.
- `githubToken`: String salva no `localStorage` para autorização de chamadas e teste de conexão.
- `sortBy`: `{ field: 'dueDate' | 'priority' | 'title'; direction: 'asc' | 'desc' } | null`.
- `hiddenColumns`: `string[]` para controle de visibilidade.
- `groupBy`: `'group' | 'status' | 'assignee'`.

---

## 4. Etapas de Execução

1. **Passo 1**: Expandir tipos e store em `ProjectContext.tsx` para comportar colunas customizadas, ordenação, ocultação, agrupamento e token GitHub.
2. **Passo 2**: Atualizar `TableView.tsx` com renderização dinâmica de colunas customizadas, modal de criação de coluna e seletor popover de datas.
3. **Passo 3**: Implementar Drag-and-Drop nativo no `KanbanView.tsx` com atualização reativa de status.
4. **Passo 4**: Adicionar controles ativos de Ordenação, Ocultação de Colunas e Agrupamento em `BoardToolbar.tsx`.
5. **Passo 5**: Adicionar suporte a Token de Acesso Pessoal (PAT) do GitHub em `IntegrationsModal.tsx` e no `TaskDetailDrawer.tsx` com botão de teste de conexão e criação de PRs.
6. **Passo 6**: Validação final de compilação com `compile_applet` e `lint_applet`.
