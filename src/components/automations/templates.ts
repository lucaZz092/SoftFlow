import { AutomationDraft } from './AutomationEditor';

export interface AutomationTemplate {
  id: string;
  title: string;
  hint: string;
  /** Builds the automation; may need a tag/group id resolved by the caller */
  build: (ctx: { doneGroupId?: string; ensureTag: (name: string) => string }) => AutomationDraft | null;
}

const base = (name: string, d: Omit<AutomationDraft, 'name' | 'description' | 'enabled'>): AutomationDraft => ({
  name,
  description: '',
  enabled: true,
  ...d,
});

/** Ready-made rules that connect the board, kanban, timer and billing. */
export const AUTOMATION_TEMPLATES: AutomationTemplate[] = [
  {
    id: 'timer-start',
    title: 'Iniciar o cronômetro ao começar',
    hint: 'Arrastar para "Em andamento" no kanban liga o cronômetro.',
    build: () =>
      base('Iniciar cronômetro ao começar', {
        trigger: { type: 'STATUS_CHANGE', label: '', targetStatus: 'Em andamento' },
        action: { type: 'START_TIMER', label: '' },
      }),
  },
  {
    id: 'timer-stop',
    title: 'Parar o cronômetro ao concluir',
    hint: 'Marcar como "Pronto" fecha o tempo da demanda.',
    build: () =>
      base('Parar cronômetro ao concluir', {
        trigger: { type: 'STATUS_CHANGE', label: '', targetStatus: 'Pronto' },
        action: { type: 'STOP_TIMER', label: '' },
      }),
  },
  {
    id: 'invoice-draft',
    title: 'Rascunho de fatura ao concluir',
    hint: 'Demanda de cliente concluída vira um rascunho com as horas dela.',
    build: () =>
      base('Faturar demanda concluída', {
        trigger: { type: 'STATUS_CHANGE', label: '', targetStatus: 'Pronto' },
        condition: { field: 'hasClient', operator: 'is', value: '', label: '' },
        action: { type: 'CREATE_INVOICE_DRAFT', label: '' },
      }),
  },
  {
    id: 'paid-archive',
    title: 'Arquivar demandas quando a fatura for paga',
    hint: 'Limpa o quadro assim que o cliente paga.',
    build: () =>
      base('Arquivar ao receber', {
        trigger: { type: 'INVOICE_PAID', label: '' },
        action: { type: 'ARCHIVE_TASK', label: '' },
      }),
  },
  {
    id: 'paid-tag',
    title: 'Etiquetar como "Faturado" quando a fatura for criada',
    hint: 'Mostra no quadro o que já foi cobrado.',
    build: ({ ensureTag }) =>
      base('Etiquetar faturadas', {
        trigger: { type: 'INVOICE_CREATED', label: '' },
        action: { type: 'ADD_TAG', label: '', tagId: ensureTag('Faturado') },
      }),
  },
  {
    id: 'overdue-invoice',
    title: 'Cobrar fatura vencida',
    hint: 'Cria uma demanda de cobrança quando a fatura vence sem pagamento.',
    build: () =>
      base('Cobrar fatura vencida', {
        trigger: { type: 'INVOICE_OVERDUE', label: '' },
        action: { type: 'CREATE_TASK', label: '', text: 'Cobrar fatura {fatura} – {cliente}', dueInDays: 0 },
      }),
  },
  {
    id: 'overdue-task',
    title: 'Subir a prioridade de demandas atrasadas',
    hint: 'Prazo vencido passa a prioridade para Alta.',
    build: () =>
      base('Atrasada vira prioridade alta', {
        trigger: { type: 'TASK_OVERDUE', label: '' },
        action: { type: 'SET_PRIORITY', label: '', targetPriority: 'Alta' },
      }),
  },
  {
    id: 'critical-notify',
    title: 'Notificar demandas críticas',
    hint: 'Notificação no computador quando algo vira "Crítica".',
    build: () =>
      base('Notificar críticas', {
        trigger: { type: 'PRIORITY_CHANGE', label: '', targetPriority: 'Crítica' },
        action: { type: 'NOTIFY_TEAM', label: '', text: 'Demanda crítica: {demanda}' },
      }),
  },
  {
    id: 'done-group',
    title: 'Mover concluídas para o grupo Concluído',
    hint: 'Mantém os grupos do quadro organizados.',
    build: ({ doneGroupId }) =>
      doneGroupId
        ? base('Mover concluídas', {
            trigger: { type: 'STATUS_CHANGE', label: '', targetStatus: 'Pronto' },
            action: { type: 'MOVE_TO_GROUP', label: '', targetGroupId: doneGroupId },
          })
        : null,
  },
];
