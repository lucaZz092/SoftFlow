import { Task, Group, Assignee, AutomationWorkflow, AutomationRunLog } from '../types';

export const CURRENT_USER: Assignee = {
  id: 'user-1',
  name: 'Lucas Martins',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces',
  email: 'lucas.martins@preventsenior.com.br',
  initials: 'LM',
  color: '#0073ea',
};

export const TEAM_MEMBERS: Assignee[] = [
  CURRENT_USER,
  {
    id: 'user-2',
    name: 'Sofia Mendes',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces',
    email: 'sofia.mendes@preventsenior.com.br',
    initials: 'SM',
    color: '#a25ddc',
  },
  {
    id: 'user-3',
    name: 'Bruno Castro',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces',
    email: 'bruno.castro@preventsenior.com.br',
    initials: 'BC',
    color: '#00c875',
  },
  {
    id: 'user-4',
    name: 'Mariana Duarte',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=faces',
    email: 'mariana.duarte@preventsenior.com.br',
    initials: 'MD',
    color: '#fa6400',
  },
];

export const INITIAL_GROUPS: Group[] = [
  {
    id: 'group-marketing',
    title: 'Marketing',
    color: '#0073ea',
    collapsed: false,
  },
  {
    id: 'group-vendas',
    title: 'Vendas & Growth',
    color: '#fa6400',
    collapsed: false,
  },
  {
    id: 'group-produto',
    title: 'Produto & Engenharia',
    color: '#579bfc',
    collapsed: false,
  },
  {
    id: 'group-concluido',
    title: 'Concluído',
    color: '#00c875',
    collapsed: false,
  },
];

export const INITIAL_TASKS: Task[] = [
  {
    id: 'task-1',
    groupId: 'group-marketing',
    title: 'Captação B2B',
    description: 'Estratégia de prospecção inbound e outbound para clientes corporativos de saúde.',
    status: 'Parado',
    priority: 'Baixa',
    assignee: CURRENT_USER,
    dueDate: '2026-10-19',
    timeline: {
      start: '2026-10-19',
      end: '2026-10-20',
    },
    subtasks: [
      { id: 'sub-1', title: 'Definir lista de contas tier 1', completed: true },
      { id: 'sub-2', title: 'Aprovar copy de e-mail frio com Claude', completed: false },
    ],
    comments: [
      {
        id: 'c-1',
        author: 'Sistema',
        timestamp: '19 out 10:14',
        text: 'Tarefa pausada aguardando validação jurídica do modelo de proposta.',
        isAi: false,
      },
    ],
    integrations: {
      claude: {
        refinedAt: '2026-10-19T10:00:00Z',
        summary: 'Copy de prospecção B2B com taxa estimada de abertura de 42%.',
        complexityScore: 'M',
        estimatedHours: 6,
      },
    },
    createdAt: '2026-10-18T09:00:00Z',
    updatedAt: '2026-10-19T10:14:00Z',
  },
  {
    id: 'task-2',
    groupId: 'group-marketing',
    title: 'Post Instagram',
    description: 'Campanha de lançamento da nova funcionalidade de automações integradas.',
    status: 'Parado',
    priority: 'Alta',
    assignee: CURRENT_USER,
    dueDate: '2026-10-20',
    timeline: {
      start: '2026-10-21',
      end: '2026-10-22',
    },
    subtasks: [
      { id: 'sub-3', title: 'Briefing de design para carrossel', completed: true },
      { id: 'sub-4', title: 'Revisão final de copywriting', completed: false },
    ],
    comments: [
      {
        id: 'c-2',
        author: 'Claude',
        aiModel: 'Claude',
        timestamp: '20 out 14:30',
        text: 'Gerei 3 opções de gancho inicial (hook) focados no diferencial de integração com Codex e GitHub.',
        isAi: true,
      },
    ],
    integrations: {
      claude: {
        refinedAt: '2026-10-20T14:30:00Z',
        userStory: 'Como profissional de tecnologia, quero visualizar o poder da automação para acelerar entregas.',
        acceptanceCriteria: [
          'Design visual no padrão escuro da marca',
          'Chamada para ação para teste gratuito',
          'Menção das IAs integradas (Claude & Codex)',
        ],
        complexityScore: 'P',
        estimatedHours: 4,
      },
    },
    createdAt: '2026-10-18T11:00:00Z',
    updatedAt: '2026-10-20T14:30:00Z',
  },
  {
    id: 'task-3',
    groupId: 'group-vendas',
    title: 'Demo Interativa de Vendas para Enterprise',
    description: 'Preparar roteiro e ambiente de demonstração com simulação de fluxo ponta a ponta.',
    status: 'Em andamento',
    priority: 'Média',
    assignee: TEAM_MEMBERS[1],
    dueDate: '2026-10-25',
    timeline: {
      start: '2026-10-22',
      end: '2026-10-25',
    },
    subtasks: [
      { id: 'sub-5', title: 'Configurar workspace de demonstração', completed: true },
      { id: 'sub-6', title: 'Criar webhook simulado do GitHub', completed: true },
      { id: 'sub-7', title: 'Testar acionamento em tempo real', completed: false },
    ],
    comments: [],
    integrations: {
      github: {
        repo: 'preventsenior/soft-solutions-core',
        branch: 'demo/enterprise-flows',
        prNumber: 38,
        prTitle: 'demo: seed data and live webhook triggers',
        prStatus: 'open',
        commitsCount: 3,
        checksPassing: true,
      },
    },
    createdAt: '2026-10-20T08:00:00Z',
    updatedAt: '2026-10-22T08:00:00Z',
  },
  {
    id: 'task-4',
    groupId: 'group-produto',
    title: 'Autenticação OAuth & Webhooks GitHub',
    description: 'Mecanismo seguro de sincronização de eventos de PR (opened, merged, reviewed) para acionar fluxos de automação.',
    status: 'Em Revisão',
    priority: 'Crítica',
    assignee: TEAM_MEMBERS[2],
    dueDate: '2026-10-23',
    timeline: {
      start: '2026-10-20',
      end: '2026-10-23',
    },
    subtasks: [
      { id: 'sub-8', title: 'Assinatura HMAC dos webhooks GitHub', completed: true },
      { id: 'sub-9', title: 'Geração de testes unitários com Codex', completed: true },
      { id: 'sub-10', title: 'Code Review automatizado', completed: false },
    ],
    comments: [
      {
        id: 'c-3',
        author: 'Codex',
        aiModel: 'Codex',
        timestamp: 'Hoje às 08:15',
        text: '⚡ Gerei suite de testes com 100% de cobertura para validação do payload SHA256 do GitHub webhook.',
        isAi: true,
      },
    ],
    integrations: {
      github: {
        repo: 'preventsenior/soft-solutions-core',
        branch: 'feature/github-webhooks-secure',
        prNumber: 42,
        prTitle: 'feat: add secure webhook signature verification & event dispatcher',
        prStatus: 'open',
        commitsCount: 6,
        checksPassing: true,
      },
      codex: {
        lastRunAt: '2026-10-22T08:15:00Z',
        reviewScore: 98,
        reviewSummary: 'Código limpo, tratamento de erro robusto contra replay attack e tipagem estrita.',
        testsPassing: true,
        generatedTests: `describe('GitHub Webhook Verifier', () => {
  it('should validate legitimate HMAC SHA256 signature', () => {
    const valid = verifyGitHubSignature(payload, secret, headerSig);
    expect(valid).toBe(true);
  });
  it('should reject tampered payload or missing secret', () => {
    expect(() => verifyGitHubSignature('tampered', secret, headerSig)).toThrow();
  });
});`,
      },
      claude: {
        refinedAt: '2026-10-21T11:00:00Z',
        userStory: 'Como desenvolvedor, quero que os webhooks do GitHub disparem automações sem falhas de autenticação.',
        acceptanceCriteria: [
          'Validar cabeçalho x-hub-signature-256',
          'Descartar requisições não autorizadas com HTTP 401',
          'Registrar log de auditoria no fluxo',
        ],
        complexityScore: 'G',
        estimatedHours: 8,
      },
    },
    createdAt: '2026-10-19T09:00:00Z',
    updatedAt: '2026-10-22T08:15:00Z',
  },
  {
    id: 'task-5',
    groupId: 'group-produto',
    title: 'Geração Automatizada de Testes Unitários via Codex',
    description: 'Automatização do fluxo de qualidade onde todo PR aberto passa por inspeção e geração de mocks.',
    status: 'Em andamento',
    priority: 'Alta',
    assignee: CURRENT_USER,
    dueDate: '2026-10-24',
    timeline: {
      start: '2026-10-22',
      end: '2026-10-24',
    },
    subtasks: [
      { id: 'sub-11', title: 'Parser de AST em TypeScript', completed: true },
      { id: 'sub-12', title: 'Integração com API de prompts do Codex', completed: true },
      { id: 'sub-13', title: 'Notificação de cobertura no pull request', completed: false },
    ],
    comments: [
      {
        id: 'c-4',
        author: 'Claude',
        aiModel: 'Claude',
        timestamp: 'Hoje às 07:45',
        text: 'Recomendo dividir a extração de fixtures em um subfluxo assíncrono para evitar timeout no webhook.',
        isAi: true,
      },
    ],
    integrations: {
      github: {
        repo: 'preventsenior/soft-solutions-core',
        branch: 'feature/codex-test-gen',
        prNumber: 44,
        prTitle: 'feat: AST parsing for automated test generation',
        prStatus: 'open',
        commitsCount: 4,
        checksPassing: true,
      },
      codex: {
        lastRunAt: '2026-10-22T07:30:00Z',
        reviewScore: 92,
        reviewSummary: 'Implementação modular. Sugerido adicionar memoização nos cálculos de AST.',
        testsPassing: true,
      },
    },
    createdAt: '2026-10-20T10:00:00Z',
    updatedAt: '2026-10-22T08:00:00Z',
  },
  {
    id: 'task-6',
    groupId: 'group-concluido',
    title: 'Setup da Pipeline CI/CD com GitHub Actions',
    description: 'Esteira de build automatizado, lint, testes de regressão e deploy contínuo.',
    status: 'Pronto',
    priority: 'Alta',
    assignee: TEAM_MEMBERS[2],
    dueDate: '2026-10-19',
    timeline: {
      start: '2026-10-18',
      end: '2026-10-19',
    },
    subtasks: [
      { id: 'sub-14', title: 'Configurar secrets no GitHub Repo', completed: true },
      { id: 'sub-15', title: 'Adicionar step de teste com Codex report', completed: true },
      { id: 'sub-16', title: 'Deploy em staging automático', completed: true },
    ],
    comments: [
      {
        id: 'c-5',
        author: 'GitHub',
        aiModel: 'GitHub',
        timestamp: '19 out 18:20',
        text: '✓ PR #39 mesclado por Bruno Castro na branch main. Pipeline executada com sucesso.',
        isAi: true,
      },
    ],
    integrations: {
      github: {
        repo: 'preventsenior/soft-solutions-core',
        branch: 'main',
        prNumber: 39,
        prTitle: 'ci: add complete github actions workflow with test reporters',
        prStatus: 'merged',
        commitsCount: 8,
        checksPassing: true,
      },
    },
    createdAt: '2026-10-17T09:00:00Z',
    updatedAt: '2026-10-19T18:20:00Z',
  },
];

export const INITIAL_AUTOMATIONS: AutomationWorkflow[] = [
  {
    id: 'auto-1',
    name: 'Auto-Finalização via GitHub PR Merged',
    description: 'Quando um Pull Request vinculado for mesclado (Merged) na branch main do GitHub, mover a demanda para o grupo "Concluído" e alterar o status para "Pronto".',
    enabled: true,
    trigger: {
      type: 'GITHUB_PR_MERGED',
      label: 'Quando um PR for mesclado no GitHub',
    },
    action: {
      type: 'SET_STATUS',
      targetStatus: 'Pronto',
      targetGroupId: 'group-concluido',
      label: 'Mover para Concluído e definir status Pronto',
      integrationIcon: 'github',
    },
    executionCount: 24,
    lastRunAt: '19 out às 18:20',
  },
  {
    id: 'auto-2',
    name: 'Análise & Testes Automatizados via Codex',
    description: 'Quando uma demanda for colocada em "Em Revisão", acionar o Codex para realizar inspeção estática, avaliar segurança e gerar os testes unitários da feature.',
    enabled: true,
    trigger: {
      type: 'STATUS_CHANGE',
      targetStatus: 'Em Revisão',
      label: 'Quando o status mudar para "Em Revisão"',
    },
    action: {
      type: 'CODEX_GENERATE_TESTS',
      label: 'Gerar suíte de testes e code review pelo Codex',
      integrationIcon: 'codex',
    },
    executionCount: 18,
    lastRunAt: 'Hoje às 08:15',
  },
  {
    id: 'auto-3',
    name: 'Refinamento de Requisitos com Claude',
    description: 'Quando uma nova tarefa for criada no grupo "Produto & Engenharia", acionar Claude para decompor em critérios de aceite, calcular complexidade e sugerir sub-tarefas.',
    enabled: true,
    trigger: {
      type: 'TASK_CREATED',
      label: 'Quando uma nova tarefa for criada em Produto',
    },
    condition: {
      field: 'groupId',
      operator: 'equals',
      value: 'group-produto',
      label: 'Se o grupo for Produto & Engenharia',
    },
    action: {
      type: 'CLAUDE_REFINE',
      label: 'Claude elabora critérios de aceite e user stories',
      integrationIcon: 'claude',
    },
    executionCount: 31,
    lastRunAt: 'Hoje às 07:45',
  },
  {
    id: 'auto-4',
    name: 'Geração de Branch no GitHub ao Iniciar',
    description: 'Quando o status de uma demanda mudar para "Em andamento", criar automaticamente uma nova branch padronizada no repositório GitHub (`feature/task-id`).',
    enabled: true,
    trigger: {
      type: 'STATUS_CHANGE',
      targetStatus: 'Em andamento',
      label: 'Quando o status mudar para "Em andamento"',
    },
    action: {
      type: 'GITHUB_CREATE_BRANCH',
      label: 'Criar branch feature/ no GitHub',
      integrationIcon: 'github',
    },
    executionCount: 42,
    lastRunAt: '20 out às 10:15',
  },
  {
    id: 'auto-5',
    name: 'Escalada de Demanda Parada ou Crítica',
    description: 'Quando uma tarefa receber prioridade "Crítica" ou ficar no status "Parado", alertar imediatamente o time de engenharia e criar issue com label `blocker`.',
    enabled: true,
    trigger: {
      type: 'PRIORITY_SET_CRITICAL',
      label: 'Quando a prioridade for definida como Crítica',
    },
    action: {
      type: 'NOTIFY_TEAM',
      label: 'Notificar responsáveis e marcar issue de bloqueio',
      integrationIcon: 'monday',
    },
    executionCount: 7,
    lastRunAt: 'Hoje às 06:30',
  },
];

export const INITIAL_RUN_LOGS: AutomationRunLog[] = [
  {
    id: 'log-1',
    workflowId: 'auto-2',
    workflowName: 'Análise & Testes Automatizados via Codex',
    taskId: 'task-4',
    taskTitle: 'Autenticação OAuth & Webhooks GitHub',
    timestamp: 'Hoje às 08:15',
    status: 'success',
    details: 'Codex gerou 2 suites de testes unitários com 100% de cobertura e score de review 98/100.',
    integrationType: 'Codex',
  },
  {
    id: 'log-2',
    workflowId: 'auto-3',
    workflowName: 'Refinamento de Requisitos com Claude',
    taskId: 'task-5',
    taskTitle: 'Geração Automatizada de Testes Unitários via Codex',
    timestamp: 'Hoje às 07:45',
    status: 'success',
    details: 'Claude refinou os critérios de aceite e recomendou divisão assíncrona do payload de webhook.',
    integrationType: 'Claude',
  },
  {
    id: 'log-3',
    workflowId: 'auto-1',
    workflowName: 'Auto-Finalização via GitHub PR Merged',
    taskId: 'task-6',
    taskTitle: 'Setup da Pipeline CI/CD com GitHub Actions',
    timestamp: '19 out às 18:20',
    status: 'success',
    details: 'GitHub Webhook recebeu evento PR #39 Merged -> Tarefa movida para "Concluído" com status "Pronto".',
    integrationType: 'GitHub',
  },
  {
    id: 'log-4',
    workflowId: 'auto-4',
    workflowName: 'Geração de Branch no GitHub ao Iniciar',
    taskId: 'task-3',
    taskTitle: 'Demo Interativa de Vendas para Enterprise',
    timestamp: '20 out às 10:15',
    status: 'success',
    details: 'Branch "demo/enterprise-flows" provisionada automaticamente no repositório.',
    integrationType: 'GitHub',
  },
];

export const STATUS_CONFIG: Record<string, { bg: string; text: string; border: string; label: string }> = {
  'Pronto': {
    bg: '#00c875',
    text: '#ffffff',
    border: '#00b066',
    label: 'Pronto',
  },
  'Em andamento': {
    bg: '#fdab3d',
    text: '#ffffff',
    border: '#e6982b',
    label: 'Em andamento',
  },
  'Parado': {
    bg: '#e2445c',
    text: '#ffffff',
    border: '#c7334a',
    label: 'Parado',
  },
  'Em Revisão': {
    bg: '#a25ddc',
    text: '#ffffff',
    border: '#8f4ac8',
    label: 'Em Revisão',
  },
  'A Fazer': {
    bg: '#579bfc',
    text: '#ffffff',
    border: '#4585e0',
    label: 'A Fazer',
  },
  'Bloqueado': {
    bg: '#333333',
    text: '#ffffff',
    border: '#222222',
    label: 'Bloqueado',
  },
};

export const PRIORITY_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
  'Crítica': {
    bg: '#333333',
    text: '#ff5ac4',
    label: 'Crítica',
  },
  'Alta': {
    bg: '#5559df',
    text: '#ffffff',
    label: 'Alta',
  },
  'Média': {
    bg: '#579bfc',
    text: '#ffffff',
    label: 'Média',
  },
  'Baixa': {
    bg: '#6bc0f8',
    text: '#111317',
    label: 'Baixa',
  },
  'Nenhuma': {
    bg: '#323842',
    text: '#a0aec0',
    label: '-',
  },
};
