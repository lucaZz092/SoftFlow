import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { Task } from '../../types';
import { Checkbox } from '../ui/Checkbox';

export const TAG_COLORS = ['#3b63f3', '#00c875', '#fdab3d', '#e2445c', '#a25ddc', '#0086c0', '#ff642e', '#7f8c8d'];

export const TagChip: React.FC<{ name: string; color: string; onRemove?: () => void }> = ({ name, color, onRemove }) => (
  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] text-[var(--text-secondary)] border border-[var(--border-subtle)] max-w-[10rem]">
    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
    <span className="truncate">{name}</span>
    {onRemove && (
      <button type="button" onClick={onRemove} className="hover:text-[var(--text-primary)] cursor-pointer" aria-label={`Remover ${name}`}>
        <X className="w-3 h-3" />
      </button>
    )}
  </span>
);

/** Shows a task's tags and lets you toggle existing ones or create a new tag. */
export const TagPicker: React.FC<{ task: Task }> = ({ task }) => {
  const { tags, toggleTaskTag, addTag } = useProject();
  const [isOpen, setIsOpen] = useState(false);
  const [newName, setNewName] = useState('');

  const selected = tags.filter((t) => task.tags?.includes(t.id));

  const create = () => {
    const name = newName.trim();
    if (!name) return;
    const existing = tags.find((t) => t.name.toLowerCase() === name.toLowerCase());
    const tag = existing ?? addTag(name, TAG_COLORS[tags.length % TAG_COLORS.length]);
    if (!task.tags?.includes(tag.id)) toggleTaskTag(task.id, tag.id);
    setNewName('');
  };

  return (
    <div className="relative">
      <div className="flex flex-wrap items-center gap-1.5">
        {selected.map((t) => (
          <TagChip key={t.id} name={t.name} color={t.color} onRemove={() => toggleTaskTag(task.id, t.id)} />
        ))}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] cursor-pointer"
        >
          <Plus className="w-3 h-3" /> Etiqueta
        </button>
      </div>

      {isOpen && (
        <div className="absolute z-20 mt-1.5 w-56 p-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-xl space-y-1">
          <div className="max-h-48 overflow-y-auto">
            {tags.length === 0 && <p className="px-2 py-1.5 text-xs text-[var(--text-muted)]">Nenhuma etiqueta ainda.</p>}
            {tags.map((t) => (
              <label
                key={t.id}
                className="flex items-center gap-2 px-2 py-1.5 rounded-md text-xs text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] cursor-pointer"
              >
                <Checkbox size="sm" checked={Boolean(task.tags?.includes(t.id))} onChange={() => toggleTaskTag(task.id, t.id)} />
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: t.color }} />
                <span className="truncate">{t.name}</span>
              </label>
            ))}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              create();
            }}
            className="flex gap-1 pt-1 border-t border-[var(--border-subtle)]"
          >
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Nova etiqueta"
              className="flex-1 min-w-0 bg-[var(--bg-canvas)] border border-[var(--border-subtle)] rounded-md px-2 py-1 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent-primary)]"
            />
            <button type="submit" className="px-2 text-xs text-[var(--accent-primary)] cursor-pointer">
              Criar
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
