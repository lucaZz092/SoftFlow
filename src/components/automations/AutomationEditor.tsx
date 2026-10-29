import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { useBilling } from '../../context/BillingContext';
import { ACTIONS, TRIGGERS, describeAutomation, triggerScope } from '../../lib/automations';
import { STATUS_STYLES } from '../../styles/designSystem';
import { AutomationActionType, AutomationTriggerType, AutomationWorkflow, TaskPriority, TaskStatus } from '../../types';
import { Button } from '../ui/Button';
import { Checkbox } from '../ui/Checkbox';
import { fieldClass, FormField, Modal } from '../ui/Modal';

export type AutomationDraft = Omit<AutomationWorkflow, 'id' | 'executionCount' | 'lastRunAt'>;

const STATUSES = Object.keys(STATUS_STYLES) as TaskStatus[];
const PRIORITIES: TaskPriority[] = ['Crítica', 'Alta', 'Média', 'Baixa'];

const CONDITIONS: { field: string; label: string; taskOnly: boolean }[] = [
  { field: '', label: 'Sempre', taskOnly: false },
  { field: 'groupId', label: 'Estiver no grupo…', taskOnly: true },
  { field: 'priority', label: 'Tiver a prioridade…', taskOnly: true },
  { field: 'tag', label: 'Tiver a etiqueta…', taskOnly: true },
  { field: 'clientId', label: 'For do cliente…', taskOnly: false },
  { field: 'hasClient', label: 'Tiver cliente', taskOnly: false },
];

export const EMPTY_DRAFT: AutomationDraft = {
  name: '',
  description: '',
  enabled: true,
  trigger: { type: 'STATUS_CHANGE', label: '', targetStatus: 'Pronto' },
  action: { type: 'MOVE_TO_GROUP', label: '' },
};

const TEXT_HINT = 'Use {demanda}, {fatura} e {cliente} para inserir nomes.';

export const AutomationEditor: React.FC<{
  initial: AutomationDraft;
  title: string;
  onSave: (draft: AutomationDraft) => void;
  onClose: () => void;
}> = ({ initial, title, onSave, onClose }) => {
  const { groups, tags, members } = useProject();
  const { clients } = useBilling();
  const [draft, setDraft] = useState<AutomationDraft>(() =>
    // Legacy trigger is edited as its modern equivalent
    initial.trigger.type === 'PRIORITY_SET_CRITICAL'
      ? { ...initial, trigger: { ...initial.trigger, type: 'PRIORITY_CHANGE', targetPriority: 'Crítica' } }
      : initial
  );

  const trigger = draft.trigger;
  const action = draft.action;
  const condition = draft.condition;
  const scope = triggerScope(trigger.type);
  const names = { groups, tags, clients, members };

  const setTrigger = (patch: Partial<AutomationDraft['trigger']>) => setDraft((d) => ({ ...d, trigger: { ...d.trigger, ...patch } }));
  const setAction = (patch: Partial<AutomationDraft['action']>) => setDraft((d) => ({ ...d, action: { ...d.action, ...patch } }));
  const setCondition = (field: string, value = '') =>
    setDraft((d) => ({ ...d, condition: field ? { field, operator: 'equals', value, label: '' } : undefined }));

  const availableActions = ACTIONS.filter((a) => scope === 'task' || a.forInvoices);
  const availableConditions = CONDITIONS.filter((c) => scope === 'task' || !c.taskOnly);

  // What each action/condition still needs before saving
  const missing =
    (action.type === 'SET_STATUS' && !action.targetStatus) ||
    (action.type === 'SET_PRIORITY' && !action.targetPriority) ||
    (action.type === 'MOVE_TO_GROUP' && !groups.some((g) => g.id === action.targetGroupId)) ||
    (action.type === 'ADD_TAG' && !tags.some((t) => t.id === action.tagId)) ||
    ((action.type === 'ADD_COMMENT' || action.type === 'CREATE_TASK') && !action.text?.trim()) ||
    (condition && condition.field !== 'hasClient' && !condition.value);

  const preview = describeAutomation({ ...draft, id: 'preview', executionCount: 0 }, names);

  const save = async () => {
    if (action.type === 'NOTIFY_TEAM' && 'Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
    // Keep only the fields the chosen trigger/action use, plus labels for older readers
    const cleanTrigger: AutomationDraft['trigger'] = {
      type: trigger.type,
      label: TRIGGERS.find((t) => t.type === trigger.type)?.label ?? '',
      ...(trigger.type === 'STATUS_CHANGE' && trigger.targetStatus ? { targetStatus: trigger.targetStatus } : {}),
      ...(trigger.type === 'PRIORITY_CHANGE' && trigger.targetPriority ? { targetPriority: trigger.targetPriority } : {}),
      ...(trigger.type === 'TAG_ADDED' && trigger.tagId ? { tagId: trigger.tagId } : {}),
    };
    const a = action;
    const cleanAction: AutomationDraft['action'] = {
      type: a.type,
      label: ACTIONS.find((x) => x.type === a.type)?.label ?? '',
      ...(a.type === 'SET_STATUS' ? { targetStatus: a.targetStatus } : {}),
      ...(a.type === 'SET_PRIORITY' ? { targetPriority: a.targetPriority } : {}),
      ...(a.type === 'MOVE_TO_GROUP' ? { targetGroupId: a.targetGroupId } : {}),
      ...(a.type === 'ADD_TAG' ? { tagId: a.tagId } : {}),
      ...(a.type === 'ASSIGN_USER' ? { assigneeId: a.assigneeId || 'me' } : {}),
      ...(['ADD_COMMENT', 'NOTIFY_TEAM', 'CREATE_TASK'].includes(a.type) && a.text?.trim() ? { text: a.text.trim() } : {}),
      ...(a.type === 'CREATE_TASK' ? { dueInDays: a.dueInDays ?? 1 } : {}),
    };
    onSave({
      ...draft,
      name: draft.name.trim() || preview.replace(/\.$/, ''),
      description: preview,
      trigger: cleanTrigger,
      action: cleanAction,
      condition: draft.condition ? { ...draft.condition, label: '' } : undefined,
    });
  };

  return (
    <Modal
      title={title}
      size="lg"
      onClose={onClose}
      footer={
        <>
          <span className="mr-auto">
            <Checkbox label="Ativa" checked={draft.enabled} onChange={(e) => setDraft((d) => ({ ...d, enabled: e.target.checked }))} />
          </span>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" size="sm" onClick={() => void save()} disabled={Boolean(missing)}>
            Salvar
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        <FormField label="Nome (opcional)" htmlFor="auto-name">
          <input
            id="auto-name"
            className={fieldClass}
            value={draft.name}
            placeholder="Gerado a partir da regra se ficar vazio"
            onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
          />
        </FormField>

        {/* WHEN */}
        <section className="space-y-2">
          <h3 className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Quando</h3>
          <div className="flex flex-wrap gap-2">
            <select
              className={`${fieldClass} sm:w-auto sm:flex-1`}
              value={trigger.type}
              onChange={(e) => {
                const type = e.target.value as AutomationTriggerType;
                setDraft((d) => {
                  const nextScope = triggerScope(type);
                  const actionOk = nextScope === 'task' || ACTIONS.find((x) => x.type === d.action.type)?.forInvoices;
                  const conditionOk = !d.condition || nextScope === 'task' || !CONDITIONS.find((c) => c.field === d.condition!.field)?.taskOnly;
                  return {
                    ...d,
                    trigger: { type, label: '' },
                    action: actionOk ? d.action : { type: 'CREATE_TASK', label: '', text: 'Acompanhar fatura {fatura} – {cliente}' },
                    condition: conditionOk ? d.condition : undefined,
                  };
                });
              }}
              aria-label="Gatilho"
            >
              {TRIGGERS.map((t) => (
                <option key={t.type} value={t.type}>
                  {t.label}
                </option>
              ))}
            </select>
            {trigger.type === 'STATUS_CHANGE' && (
              <select
                className={`${fieldClass} sm:w-48`}
                value={trigger.targetStatus ?? ''}
                onChange={(e) => setTrigger({ targetStatus: (e.target.value || undefined) as TaskStatus | undefined })}
                aria-label="Para o status"
              >
                <option value="">para qualquer status</option>
                {STATUSES.map((st) => (
                  <option key={st} value={st}>
                    para "{st}"
                  </option>
                ))}
              </select>
            )}
            {trigger.type === 'PRIORITY_CHANGE' && (
              <select
                className={`${fieldClass} sm:w-48`}
                value={trigger.targetPriority ?? ''}
                onChange={(e) => setTrigger({ targetPriority: (e.target.value || undefined) as TaskPriority | undefined })}
                aria-label="Para a prioridade"
              >
                <option value="">para qualquer prioridade</option>
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    para "{p}"
                  </option>
                ))}
              </select>
            )}
            {trigger.type === 'TAG_ADDED' && (
              <select
                className={`${fieldClass} sm:w-48`}
                value={trigger.tagId ?? ''}
                onChange={(e) => setTrigger({ tagId: e.target.value || undefined })}
                aria-label="Etiqueta"
              >
                <option value="">qualquer etiqueta</option>
                {tags.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            )}
          </div>
          {(trigger.type === 'TASK_OVERDUE' || trigger.type === 'INVOICE_OVERDUE') && (
            <p className="text-xs text-[var(--text-muted)]">
              Verificado com o app aberto, a cada 5 minutos. Dispara uma vez por vencimento, inclusive para itens que já estão vencidos quando você ativa a regra.
            </p>
          )}
          {scope === 'invoice' && (
            <p className="text-xs text-[var(--text-muted)]">
              As ações valem para as demandas cujas horas entraram na fatura. “Criar demanda” cria uma só, ligada ao cliente.
            </p>
          )}
        </section>

        {/* IF */}
        <section className="space-y-2">
          <h3 className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
            Se {scope === 'invoice' ? 'a fatura / demanda' : 'a demanda'}
          </h3>
          <div className="flex flex-wrap gap-2">
            <select
              className={`${fieldClass} sm:w-auto sm:flex-1`}
              value={condition?.field ?? ''}
              onChange={(e) => setCondition(e.target.value)}
              aria-label="Condição"
            >
              {availableConditions.map((c) => (
                <option key={c.field} value={c.field}>
                  {c.label}
                </option>
              ))}
            </select>
            {condition?.field === 'groupId' && (
              <select className={`${fieldClass} sm:w-48`} value={condition.value} onChange={(e) => setCondition('groupId', e.target.value)} aria-label="Grupo">
                <option value="">Escolha…</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.title}
                  </option>
                ))}
              </select>
            )}
            {condition?.field === 'priority' && (
              <select className={`${fieldClass} sm:w-48`} value={condition.value} onChange={(e) => setCondition('priority', e.target.value)} aria-label="Prioridade">
                <option value="">Escolha…</option>
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            )}
            {condition?.field === 'tag' && (
              <select className={`${fieldClass} sm:w-48`} value={condition.value} onChange={(e) => setCondition('tag', e.target.value)} aria-label="Etiqueta">
                <option value="">Escolha…</option>
                {tags.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            )}
            {condition?.field === 'clientId' && (
              <select className={`${fieldClass} sm:w-48`} value={condition.value} onChange={(e) => setCondition('clientId', e.target.value)} aria-label="Cliente">
                <option value="">Escolha…</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        </section>

        {/* THEN */}
        <section className="space-y-2">
          <h3 className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Então</h3>
          <div className="flex flex-wrap gap-2">
            <select
              className={`${fieldClass} sm:w-auto sm:flex-1`}
              value={action.type}
              onChange={(e) => setDraft((d) => ({ ...d, action: { type: e.target.value as AutomationActionType, label: '' } }))}
              aria-label="Ação"
            >
              {availableActions.map((a) => (
                <option key={a.type} value={a.type}>
                  {a.label}
                </option>
              ))}
            </select>
            {action.type === 'SET_STATUS' && (
              <select className={`${fieldClass} sm:w-48`} value={action.targetStatus ?? ''} onChange={(e) => setAction({ targetStatus: e.target.value as TaskStatus })} aria-label="Novo status">
                <option value="">Escolha…</option>
                {STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            )}
            {action.type === 'SET_PRIORITY' && (
              <select className={`${fieldClass} sm:w-48`} value={action.targetPriority ?? ''} onChange={(e) => setAction({ targetPriority: e.target.value as TaskPriority })} aria-label="Nova prioridade">
                <option value="">Escolha…</option>
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            )}
            {action.type === 'MOVE_TO_GROUP' && (
              <select className={`${fieldClass} sm:w-48`} value={action.targetGroupId ?? ''} onChange={(e) => setAction({ targetGroupId: e.target.value })} aria-label="Grupo de destino">
                <option value="">Escolha…</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.title}
                  </option>
                ))}
              </select>
            )}
            {action.type === 'ADD_TAG' && (
              <select className={`${fieldClass} sm:w-48`} value={action.tagId ?? ''} onChange={(e) => setAction({ tagId: e.target.value })} aria-label="Etiqueta">
                <option value="">{tags.length === 0 ? 'Crie uma etiqueta antes' : 'Escolha…'}</option>
                {tags.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            )}
            {action.type === 'ASSIGN_USER' && (
              <select className={`${fieldClass} sm:w-48`} value={action.assigneeId ?? 'me'} onChange={(e) => setAction({ assigneeId: e.target.value })} aria-label="Responsável">
                <option value="me">Quem estiver logado</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            )}
            {action.type === 'CREATE_TASK' && (
              <label className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
                prazo em
                <input
                  type="number"
                  min={0}
                  max={365}
                  className={`${fieldClass} w-16`}
                  value={action.dueInDays ?? 1}
                  onChange={(e) => setAction({ dueInDays: Math.max(0, Number(e.target.value) || 0) })}
                />
                dias
              </label>
            )}
          </div>
          {(action.type === 'ADD_COMMENT' || action.type === 'NOTIFY_TEAM' || action.type === 'CREATE_TASK') && (
            <FormField label={action.type === 'CREATE_TASK' ? 'Título da nova demanda' : 'Texto'} hint={TEXT_HINT}>
              <input
                className={fieldClass}
                value={action.text ?? ''}
                placeholder={action.type === 'NOTIFY_TEAM' ? 'Opcional' : ''}
                onChange={(e) => setAction({ text: e.target.value })}
              />
            </FormField>
          )}
          {action.type === 'NOTIFY_TEAM' && (
            <p className="text-xs text-[var(--text-muted)]">O navegador pede permissão para notificações ao salvar.</p>
          )}
          {action.type === 'CREATE_INVOICE_DRAFT' && (
            <p className="text-xs text-[var(--text-muted)]">
              Usa as horas ainda não faturadas da demanda, ao valor-hora do cliente dela. Se o cronômetro estiver rodando, ele é parado e entra na fatura.
            </p>
          )}
        </section>

        <p className="text-[13px] text-[var(--text-primary)] border-t border-[var(--border-subtle)] pt-4">{preview}</p>
      </div>
    </Modal>
  );
};
