import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { Company } from '../types';
import { Modal, fieldClass } from './ui/Modal';
import { Button } from './ui/Button';
import { ConfirmDialog } from './ui/ConfirmDialog';
import { TAG_COLORS } from './task/TagPicker';

/** Create, rename and delete companies, and choose which company each team belongs to */
export const CompaniesModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { companies, allGroups, addCompany, updateCompany, deleteCompany, setGroupCompany } = useProject();
  const [newName, setNewName] = useState('');
  const [toDelete, setToDelete] = useState<Company | null>(null);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    addCompany(newName, TAG_COLORS[companies.length % TAG_COLORS.length]);
    setNewName('');
  };

  return (
    <>
      <Modal title="Empresas e equipes" onClose={onClose} size="lg">
        <div className="space-y-6">
          <section className="space-y-2">
            <h3 className="text-xs text-[var(--text-muted)]">Empresas</h3>
            {companies.length === 0 && (
              <p className="text-[13px] text-[var(--text-muted)]">Nenhuma empresa ainda. Crie a primeira abaixo.</p>
            )}
            {companies.map((c) => (
              <div key={c.id} className="flex items-center gap-2">
                <input
                  type="color"
                  value={c.color}
                  onChange={(e) => updateCompany(c.id, { color: e.target.value })}
                  className="w-7 h-7 shrink-0 rounded cursor-pointer bg-transparent border-0 p-0"
                  aria-label={`Cor de ${c.name}`}
                />
                <input
                  defaultValue={c.name}
                  onBlur={(e) => {
                    const name = e.target.value.trim();
                    if (name && name !== c.name) updateCompany(c.id, { name });
                  }}
                  className={fieldClass}
                  aria-label="Nome da empresa"
                />
                <button
                  type="button"
                  onClick={() => setToDelete(c)}
                  className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-red-400 hover:bg-[var(--bg-surface-hover)] cursor-pointer"
                  aria-label={`Excluir ${c.name}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <form onSubmit={handleAdd} className="flex items-center gap-2 pt-1">
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Nova empresa"
                className={fieldClass}
              />
              <Button type="submit" variant="primary" size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />} disabled={!newName.trim()}>
                Adicionar
              </Button>
            </form>
          </section>

          <section className="space-y-2">
            <h3 className="text-xs text-[var(--text-muted)]">Equipes</h3>
            {allGroups.map((g) => (
              <div key={g.id} className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: g.color }} />
                <span className="flex-1 min-w-0 truncate text-[13px] text-[var(--text-primary)]">{g.title}</span>
                <select
                  value={g.companyId ?? ''}
                  onChange={(e) => setGroupCompany(g.id, e.target.value || undefined)}
                  className={`${fieldClass} !w-48`}
                  aria-label={`Empresa de ${g.title}`}
                >
                  <option value="">Sem empresa</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </section>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(toDelete)}
        onClose={() => setToDelete(null)}
        onConfirm={() => {
          if (toDelete) deleteCompany(toDelete.id);
          setToDelete(null);
        }}
        title="Excluir empresa"
        description={`"${toDelete?.name}" será excluída. As equipes e demandas dela continuam no quadro, sem empresa.`}
        confirmText="Excluir"
      />
    </>
  );
};
