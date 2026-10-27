import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { STATUS_STYLES } from '../styles/designSystem';
import { Button } from './ui/Button';

export const TimelineView: React.FC = () => {
  const { tasks, groups, setSelectedTaskId } = useProject();
  const [currentMonthIndex, setCurrentMonthIndex] = useState(0);

  const months = ['Outubro, 2026', 'Novembro, 2026', 'Dezembro, 2026'];

  const days = [
    { num: 18, label: 'Dom 18' },
    { num: 19, label: 'Seg 19' },
    { num: 20, label: 'Ter 20' },
    { num: 21, label: 'Qua 21' },
    { num: 22, label: 'Qui 22' },
    { num: 23, label: 'Sex 23' },
    { num: 24, label: 'Sáb 24' },
    { num: 25, label: 'Dom 25' },
    { num: 26, label: 'Seg 26' },
    { num: 27, label: 'Ter 27' },
  ];

  return (
    <div className="flex-1 overflow-auto p-4 sm:p-6 bg-[var(--bg-canvas)] select-none space-y-5 transition-colors">
      {/* Timeline Controls */}
      <div className="flex items-center justify-between p-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xs">
        <div className="flex items-center gap-2.5">
          <Calendar className="w-4 h-4 text-[var(--accent-primary)]" />
          <h2 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
            Cronograma de Sprints e Entregas
          </h2>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentMonthIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentMonthIndex === 0}
            aria-label="Mês anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="font-semibold text-[var(--text-primary)] px-2 font-mono tabular-nums">
            {months[currentMonthIndex]}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentMonthIndex((prev) => Math.min(months.length - 1, prev + 1))}
            disabled={currentMonthIndex === months.length - 1}
            aria-label="Próximo mês"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Gantt Matrix Container */}
      <div className="rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] overflow-x-auto shadow-xs">
        <div className="min-w-[900px]">
          {/* Header row: Days */}
          <div className="grid grid-cols-12 border-b border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-xs font-semibold text-[var(--text-muted)]">
            <div className="col-span-4 p-3 border-r border-[var(--border-subtle)]">Demanda / Tarefa</div>
            {days.map((d) => (
              <div
                key={d.num}
                className={`col-span-1 p-2.5 text-center border-r border-[var(--border-subtle)] font-mono tabular-nums text-xs ${
                  d.num === 22 ? 'bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] font-bold' : ''
                }`}
              >
                <div>{d.label}</div>
              </div>
            ))}
          </div>

          {/* Group and Task Rows */}
          {groups.map((group) => {
            const groupTasks = tasks.filter((t) => t.groupId === group.id);
            if (groupTasks.length === 0) return null;

            return (
              <div key={group.id} className="border-b border-[var(--border-subtle)]">
                {/* Group section header */}
                <div
                  className="px-3.5 py-2 font-bold text-xs bg-[var(--bg-canvas)]/60 flex items-center gap-2 border-b border-[var(--border-subtle)]"
                  style={{ color: group.color }}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: group.color }} />
                  <span>{group.title}</span>
                  <span className="text-[10px] text-[var(--text-muted)] font-mono">({groupTasks.length})</span>
                </div>

                {/* Tasks inside group */}
                {groupTasks.map((task) => {
                  const startDay = parseInt(task.timeline.start.slice(8, 10)) || 19;
                  const endDay = parseInt(task.timeline.end.slice(8, 10)) || 21;
                  const span = Math.max(1, endDay - startDay + 1);

                  return (
                    <div
                      key={task.id}
                      onClick={() => setSelectedTaskId(task.id)}
                      className="grid grid-cols-12 border-t border-[var(--border-subtle)] hover:bg-[var(--bg-surface-hover)] transition-colors cursor-pointer group"
                    >
                      {/* Left Title */}
                      <div className="col-span-4 p-3 border-r border-[var(--border-subtle)] flex items-center gap-2 truncate">
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: group.color }} />
                        <span className="text-xs font-medium text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] truncate transition-colors">
                          {task.title}
                        </span>
                      </div>

                      {/* Timeline Day Bar Cells */}
                      <div className="col-span-8 relative flex items-center px-1">
                        {/* Today Marker Line (Day 22) */}
                        <div
                          className="absolute top-0 bottom-0 w-px bg-[var(--accent-primary)]/40 pointer-events-none z-10"
                          style={{ left: `${((22 - 18) / 10) * 100}%` }}
                        />

                        {/* Task Timeline Bar Capsule */}
                        <div
                          className="h-6 rounded-md shadow-xs flex items-center px-2.5 text-[11px] font-medium text-white truncate transition-opacity hover:opacity-90 bg-[var(--accent-primary)]"
                          style={{
                            marginLeft: `${((startDay - 18) / 10) * 100}%`,
                            width: `${Math.max(14, (span / 10) * 100)}%`,
                          }}
                        >
                          <span className="truncate">{task.title}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
