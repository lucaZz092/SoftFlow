import React from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { STATUS_CONFIG } from '../data/mockData';

export const TimelineView: React.FC = () => {
  const { tasks, groups, setSelectedTaskId } = useProject();

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
    <div className="flex-1 overflow-auto p-5 bg-[#12141a] select-none space-y-5">
      {/* Timeline Controls */}
      <div className="flex items-center justify-between p-3.5 rounded-lg bg-[#161922] border border-[#212633]">
        <div className="flex items-center space-x-2.5">
          <Calendar className="w-4 h-4 text-blue-400" />
          <h2 className="text-xs font-bold text-white uppercase tracking-wider">Cronograma de Entregas (Outubro 2026)</h2>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <button className="p-1 rounded bg-[#1e2330] hover:bg-[#252c3c] text-slate-300 transition-colors cursor-pointer">
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="font-semibold text-slate-200 px-2 font-mono tabular-nums">Outubro, 2026</span>
          <button className="p-1 rounded bg-[#1e2330] hover:bg-[#252c3c] text-slate-300 transition-colors cursor-pointer">
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Gantt Matrix Container */}
      <div className="rounded-lg bg-[#161922] border border-[#212633] overflow-x-auto shadow-xs">
        <div className="min-w-[900px]">
          {/* Header row: Days */}
          <div className="grid grid-cols-12 border-b border-[#212633] bg-[#171b25] text-xs font-semibold text-slate-400">
            <div className="col-span-4 p-2.5 border-r border-[#212633]">Demanda / Tarefa</div>
            {days.map((d) => (
              <div
                key={d.num}
                className={`col-span-1 p-2 text-center border-r border-[#212633] font-mono tabular-nums text-[11px] ${
                  d.num === 22 ? 'bg-blue-600/10 text-blue-400 font-bold' : ''
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
              <div key={group.id} className="border-b border-[#202532]">
                {/* Group section header */}
                <div
                  className="px-3 py-1.5 font-bold text-xs bg-[#141720] flex items-center space-x-2"
                  style={{ color: group.color }}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: group.color }} />
                  <span>{group.title}</span>
                </div>

                {/* Tasks inside group */}
                {groupTasks.map((task) => {
                  const statusInfo = STATUS_CONFIG[task.status] || STATUS_CONFIG['A Fazer'];
                  const startDay = parseInt(task.timeline.start.slice(8, 10)) || 19;
                  const endDay = parseInt(task.timeline.end.slice(8, 10)) || 21;
                  const span = Math.max(1, endDay - startDay + 1);

                  return (
                    <div
                      key={task.id}
                      onClick={() => setSelectedTaskId(task.id)}
                      className="grid grid-cols-12 border-t border-[#1e2330] hover:bg-[#1a1e28] transition-colors cursor-pointer group"
                    >
                      {/* Left Title */}
                      <div className="col-span-4 p-2.5 border-r border-[#212633] flex items-center space-x-2 truncate">
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: group.color }} />
                        <span className="text-xs font-medium text-slate-200 group-hover:text-white truncate">
                          {task.title}
                        </span>
                      </div>

                      {/* Timeline Day Bar Cells */}
                      <div className="col-span-8 relative flex items-center px-1">
                        {/* Today Marker Line (Day 22) */}
                        <div
                          className="absolute top-0 bottom-0 w-px bg-blue-500/30 pointer-events-none z-10"
                          style={{ left: `${((22 - 18) / 10) * 100}%` }}
                        />

                        {/* Task Timeline Bar Capsule */}
                        <div
                          className="h-5 rounded shadow-xs flex items-center px-2 text-[10px] font-medium text-white truncate transition-opacity hover:opacity-90"
                          style={{
                            marginLeft: `${((startDay - 18) / 10) * 100}%`,
                            width: `${Math.max(12, (span / 10) * 100)}%`,
                            backgroundColor: statusInfo.bg,
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
