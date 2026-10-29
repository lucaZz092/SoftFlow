import React, { useState } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { Tag, Task } from '../../types';
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

/** Color swatch that opens the native color picker */
export const ColorDot: React.FC<{ color: string; onChange: (color: string) => void; label: string; size?: 'sm' | 'md' }> = ({
  color,
  onChange,
  label,
  size = 'sm',
}) => (
  <label
    className={`relative shrink-0 rounded-full cursor-pointer ring-offset-1 ring-offset-[var(--bg-surface)] hover:ring-2 hover:ring-[var(--border-strong)] ${
      size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'
    }`}
    style={{ backgroundColor: color }}
    title={label}
  >
    <input
      type="color"
      value={color.startsWith('#') ? color : '#3b63f3'}
      onChange={(e) => onChange(e.target.value)}
      className="absolute inset-0 opacity-0 cursor-pointer"
      aria-label={label}
    />
  </label>
);

/**
 * Dropdown listing every tag: check to apply, click the dot to recolor, trash to delete, or create a new one.
 * `isChecked`/`onToggle` decide what "applied" means (one task, or a whole selection).
 */
export const TagMenu: React.FC<{
  isChecked: (tag: Tag) => boolean;
  onToggle: (tag: Tag) => void;
  className?: string;
}> = ({ isChecked, onToggle, className = '' }) => {
  const { tags, addTag, updateTag, deleteTag } = useProject();
  const [newName, setNewName] = useState('');

  const create = () => {
    const name = newName.trim();
    if (!name) return;
    const existing = tags.find((t) => t.name.toLowerCase() === name.toLowerCase());
    const tag = existing ?? addTag(name, TAG_COLORS[tags.length % TAG_COLORS.length]);
    if (!isChecked(tag)) onToggle(tag);
    setNewName('');
  };

  return (
    <div
      className={`w-60 p-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-xl space-y-1 ${className}`}
    >
      <div className="max-h-56 overflow-y-auto">
        {tags.length === 0 && <p className="px-2 py-1.5 text-xs text-[var(--text-muted)]">Nenhuma etiqueta ainda.</p>}
        {tags.map((t) => (
          <div
            key={t.id}
            className="group/tag flex items-center gap-2 px-2 py-1.5 rounded-md text-xs text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)]"
          >
            <Checkbox size="sm" checked={isChecked(t)} onChange={() => onToggle(t)} aria-label={t.name} />
            <ColorDot color={t.color} onChange={(color) => updateTag(t.id, { color })} label={`Cor de ${t.name}`} />
            <button type="button" onClick={() => onToggle(t)} className="flex-1 min-w-0 truncate text-left cursor-pointer">
              {t.name}
            </button>
            <button
              type="button"
              onClick={() => deleteTag(t.id)}
              className="opacity-0 group-hover/tag:opacity-100 focus:opacity-100 text-[var(--text-muted)] hover:text-rose-500 cursor-pointer"
              aria-label={`Excluir etiqueta ${t.name}`}
              title="Excluir etiqueta"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
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
  );
};

/** Shows a task's tags and lets you toggle existing ones or create a new tag. */
export const TagPicker: React.FC<{ task: Task }> = ({ task }) => {
  const { tags, toggleTaskTag } = useProject();
  const [isOpen, setIsOpen] = useState(false);

  const selected = tags.filter((t) => task.tags?.includes(t.id));

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
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <TagMenu
            className="absolute z-20 mt-1.5"
            isChecked={(t) => Boolean(task.tags?.includes(t.id))}
            onToggle={(t) => toggleTaskTag(task.id, t.id)}
          />
        </>
      )}
    </div>
  );
};
