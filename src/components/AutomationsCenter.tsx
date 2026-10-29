import React, { useState } from 'react';
import { Plus, Pencil, Trash2, Play, CheckCircle2, XCircle } from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { useBilling } from '../context/BillingContext';
import { describeAutomation, triggerScope } from '../lib/automations';
import { AutomationWorkflow } from '../types';
import { Button } from './ui/Button';
import { ConfirmDialog } from './ui/ConfirmDialog';
import { AutomationDraft, AutomationEditor, EMPTY_DRAFT } from './automations/AutomationEditor';
import { AUTOMATION_TEMPLATES } from './automations/templates';
import { TAG_COLORS } from './task/TagPicker';

const Switch: React.FC<{ checked: boolean; onChange: () => void; label: string }> = ({ checked, onChange, label }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    onClick={onChange}
    className={`relative w-8 h-[18px] rounded-full shrink-0 transition-colors cursor-pointer ${
      checked ? 'bg-[var(--accent-primary)]' : 'bg-[var(--bg-surface-active)]'
    }`}
  >
    <span
      className={`absolute top-[2px] left-[2px] w-[14px] h-[14px] rounded-full bg-white shadow transition-transform ${
        checked ? 'translate-x-[14px]' : ''
      }`}
    />
  </button>
);

/** "Executar agora" on a chosen task */
const RunOnTask: React.FC<{ auto: AutomationWorkflow }> = ({ auto }) => {
  const { tasks, triggerManualAutomation } = useProject();
  const [taskId, setTaskId] = useState('');
  if (triggerScope(auto.trigger.type) === 'invoice') return null;
  return (
    <span className="flex items-center gap-1">
      <select
        value={taskId}
        onChange={(e) => setTaskId(e.target.value)}
        className="max-w-[11rem] bg-[var(--bg-canvas)] border border-[var(--border-subtle)] rounded-md px-2 py-1 text-xs text-[var(--text-secondary)] outline-none"
        aria-label="Demanda para executar"
      >
        <option value="">Executar em…</option>
        {tasks.map((t) => (
          <option key={t.id} value={t.id}>
            {t.title}
          </option>
        ))}
      </select>
      <button
        type="button"
        disabled={!taskId}
        onClick={() => {
          triggerManualAutomation(auto.id, taskId);
          setTaskId('');
        }}
        className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] disabled:opacity-30 cursor-pointer"
        title="Executar agora"
        aria-label="Executar agora"
      >
        <Play className="w-3.5 h-3.5" />
      </button>
    </span>
  );
};

export const AutomationsCenter: React.FC = () => {
  const { automations, runLogs, allGroups: groups, tags, members, toggleAutomation, deleteAutomation, addAutomation, updateAutomation, addTag } =
    useProject();
  const { clients } = useBilling();
  const names = { groups, tags, clients, members };

  const [editing, setEditing] = useState<AutomationWorkflow | 'new' | null>(null);
  const [toDelete, setToDelete] = useState<AutomationWorkflow | null>(null);

  const doneGroupId = groups.find((g) => g.id === 'group-concluido')?.id ?? groups.find((g) => /conclu/i.test(g.title))?.id;
  const ensureTag = (name: string) =>
    tags.find((t) => t.name.toLowerCase() === name.toLowerCase())?.id ?? addTag(name, TAG_COLORS[tags.length % TAG_COLORS.length]).id;

  const addTemplate = (templateId: string) => {
    const template = AUTOMATION_TEMPLATES.find((t) => t.id === templateId);
    const draft = template?.build({ doneGroupId, ensureTag });
    if (!draft) return;
    addAutomation({ ...draft, description: describeAutomation({ ...draft, id: '', executionCount: 0 }, names) });
  };

  const save = (draft: AutomationDraft) => {
    if (editing === 'new') addAutomation(draft);
    else if (editing) updateAutomation(editing.id, draft);
    setEditing(null);
  };

  const failed = runLogs.filter((l) => l.status === 'failed').length;

  return (
    <div className="flex-1 overflow-y-auto bg-[var(--bg-canvas)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8 sm:py-12 space-y-10">
        <section className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">Automações</h2>
            <p className="text-[13px] text-[var(--text-muted)] mt-1">
              Regras que reagem a demandas, kanban, cronômetro e faturamento.
            </p>
          </div>
          <Button variant="primary" size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />} onClick={() => setEditing('new')}>
            Nova automação
          </Button>
        </section>

        {/* Rules */}
        <section>
          <h3 className="text-sm font-medium text-[var(--text-primary)] mb-3">
            Regras <span className="text-[var(--text-muted)] font-normal tabular-nums">{automations.length}</span>
          </h3>
          {automations.length === 0 ? (
            <p className="py-4 text-[13px] text-[var(--text-muted)] border-y border-[var(--border-subtle)]">
              Nenhuma regra ainda. Comece por um modelo abaixo.
            </p>
          ) : (
            <ul className="divide-y divide-[var(--border-subtle)] border-y border-[var(--border-subtle)]">
              {automations.map((auto) => (
                <li key={auto.id} className="flex flex-wrap sm:flex-nowrap items-start gap-3 py-3">
                  <span className="pt-0.5">
                    <Switch checked={auto.enabled} onChange={() => toggleAutomation(auto.id)} label={`Ativar ${auto.name}`} />
                  </span>
                  <div className={`flex-1 min-w-0 ${auto.enabled ? '' : 'opacity-60'}`}>
                    <div className="text-[13px] font-medium text-[var(--text-primary)]">{auto.name}</div>
                    <div className="text-[13px] text-[var(--text-secondary)]">{describeAutomation(auto, names)}</div>
                    <div className="text-xs text-[var(--text-muted)] mt-0.5">
                      {auto.executionCount} {auto.executionCount === 1 ? 'execução' : 'execuções'}
                      {auto.executionCount > 0 && auto.lastRunAt && ` · última em ${auto.lastRunAt}`}
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5 ml-auto">
                    <RunOnTask auto={auto} />
                    <button
                      type="button"
                      onClick={() => setEditing(auto)}
                      className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] cursor-pointer"
                      aria-label={`Editar ${auto.name}`}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setToDelete(auto)}
                      className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-rose-500 hover:bg-[var(--bg-surface-hover)] cursor-pointer"
                      aria-label={`Excluir ${auto.name}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Templates */}
        <section>
          <h3 className="text-sm font-medium text-[var(--text-primary)] mb-3">Modelos prontos</h3>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-px rounded-lg overflow-hidden border border-[var(--border-subtle)] bg-[var(--border-subtle)]">
            {AUTOMATION_TEMPLATES.filter((t) => t.id !== 'done-group' || doneGroupId).map((t) => (
              <li key={t.id} className="bg-[var(--bg-canvas)] p-4 flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] text-[var(--text-primary)]">{t.title}</div>
                  <div className="text-xs text-[var(--text-muted)] mt-0.5">{t.hint}</div>
                </div>
                <Button variant="secondary" size="xs" onClick={() => addTemplate(t.id)}>
                  Adicionar
                </Button>
              </li>
            ))}
          </ul>
        </section>

        {/* History */}
        <section>
          <h3 className="text-sm font-medium text-[var(--text-primary)] mb-3">
            Histórico
            {failed > 0 && <span className="ml-2 text-xs font-normal text-rose-500">{failed} não executadas</span>}
          </h3>
          {runLogs.length === 0 ? (
            <p className="py-4 text-[13px] text-[var(--text-muted)] border-y border-[var(--border-subtle)]">Nenhuma execução ainda.</p>
          ) : (
            <ul className="divide-y divide-[var(--border-subtle)] border-y border-[var(--border-subtle)]">
              {runLogs.slice(0, 50).map((log) => (
                <li key={log.id} className="flex items-start gap-3 py-2.5">
                  {log.status === 'failed' ? (
                    <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" aria-label="Não executada" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" aria-label="Executada" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] text-[var(--text-primary)] truncate">
                      {log.workflowName} <span className="text-[var(--text-muted)]">· {log.taskTitle}</span>
                    </div>
                    <div className="text-xs text-[var(--text-secondary)]">{log.details}</div>
                  </div>
                  <span className="text-xs text-[var(--text-muted)] tabular-nums shrink-0">{log.timestamp}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {editing && (
        <AutomationEditor
          title={editing === 'new' ? 'Nova automação' : 'Editar automação'}
          initial={editing === 'new' ? EMPTY_DRAFT : editing}
          onClose={() => setEditing(null)}
          onSave={save}
        />
      )}

      <ConfirmDialog
        isOpen={Boolean(toDelete)}
        onClose={() => setToDelete(null)}
        onConfirm={() => {
          if (toDelete) deleteAutomation(toDelete.id);
          setToDelete(null);
        }}
        title="Excluir automação"
        description={`"${toDelete?.name ?? ''}" deixa de rodar. O histórico de execuções é mantido.`}
        confirmText="Excluir"
      />
    </div>
  );
};
