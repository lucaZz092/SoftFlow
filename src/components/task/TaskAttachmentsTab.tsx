import React, { useRef, useState } from 'react';
import { Download, FileText, Paperclip, Trash2 } from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { Attachment, Task } from '../../types';
import { Button } from '../ui/Button';

const MAX_SIZE = 50 * 1024 * 1024; // matches the bucket's file_size_limit

const formatSize = (bytes: number) =>
  bytes < 1024 ? `${bytes} B` : bytes < 1024 ** 2 ? `${(bytes / 1024).toFixed(0)} KB` : `${(bytes / 1024 ** 2).toFixed(1)} MB`;

export const TaskAttachmentsTab: React.FC<{ task: Task }> = ({ task }) => {
  const { uploadAttachment, deleteAttachment, getAttachmentUrl } = useProject();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const attachments = task.attachments ?? [];

  const upload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setError(null);
    const list = Array.from(files);
    const tooBig = list.filter((f) => f.size > MAX_SIZE);
    if (tooBig.length > 0) setError(`Acima de 50 MB, não enviado: ${tooBig.map((f) => f.name).join(', ')}`);
    const ok = list.filter((f) => f.size <= MAX_SIZE);
    setUploading((n) => n + ok.length);
    // Sequential so each upload appends to the latest task state
    for (const file of ok) {
      await uploadAttachment(task.id, file);
      setUploading((n) => n - 1);
    }
  };

  const open = async (attachment: Attachment) => {
    const url = await getAttachmentUrl(attachment);
    if (url) window.open(url, '_blank', 'noopener');
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          void upload(e.dataTransfer.files);
        }}
        className={`flex flex-col items-center gap-2 py-6 rounded-lg border border-dashed text-center transition-colors ${
          isDragging ? 'border-[var(--accent-primary)] bg-[var(--accent-subtle)]' : 'border-[var(--border-strong)]'
        }`}
      >
        <Paperclip className="w-4 h-4 text-[var(--text-muted)]" />
        <p className="text-xs text-[var(--text-muted)]">Arraste arquivos aqui (até 50 MB cada)</p>
        <Button variant="secondary" size="sm" onClick={() => inputRef.current?.click()} isLoading={uploading > 0}>
          {uploading > 0 ? `Enviando ${uploading}…` : 'Escolher arquivos'}
        </Button>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => {
            void upload(e.target.files);
            e.target.value = '';
          }}
        />
      </div>
      {error && <p className="text-xs text-rose-500">{error}</p>}

      {attachments.length > 0 && (
        <ul className="divide-y divide-[var(--border-subtle)] border-y border-[var(--border-subtle)]">
          {attachments.map((a) => (
            <li key={a.id} className="flex items-center gap-3 py-2 text-[13px]">
              <FileText className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
              <button
                type="button"
                onClick={() => void open(a)}
                className="flex-1 min-w-0 text-left truncate text-[var(--text-primary)] hover:underline cursor-pointer"
              >
                {a.name}
              </button>
              <span className="text-xs text-[var(--text-muted)] tabular-nums shrink-0">{formatSize(a.size)}</span>
              <button
                type="button"
                onClick={() => void open(a)}
                className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                aria-label={`Baixar ${a.name}`}
              >
                <Download className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => void deleteAttachment(task.id, a)}
                className="p-1 text-[var(--text-muted)] hover:text-rose-500 cursor-pointer"
                aria-label={`Excluir ${a.name}`}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
