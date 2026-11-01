import React, { useState } from 'react';
import { useApp } from '../lib/context';
import { TaskStatus, TaskPriority } from '../lib/types';
import { TaskStatusBadge, TaskPriorityBadge } from './StatusBadge';
import {
  CheckSquare,
  Plus,
  Search,
  AlertCircle,
  Clock,
  PlayCircle,
  CheckCircle2,
  Calendar,
  User,
  Trash2,
  Check,
  Building2,
} from 'lucide-react';

interface TasksViewProps {
  onOpenNewTaskModal: () => void;
}

export function TasksView({ onOpenNewTaskModal }: TasksViewProps) {
  const {
    currentUser,
    tasks,
    visibleProjects,
    updateTaskStatus,
    updateTask,
    deleteTask,
  } = useApp();

  const [filterProject, setFilterProject] = useState<string>('all');
  const [filterTrade, setFilterTrade] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
  const [blockingTaskId, setBlockingTaskId] = useState<string | null>(null);
  const [blockReasonInput, setBlockReasonInput] = useState('');

  const isClient = currentUser.role === 'client';

  const trades = Array.from(new Set(tasks.map((t) => t.trade).filter(Boolean)));

  const filteredTasks = tasks.filter((t) => {
    const matchesProject =
      filterProject === 'all'
        ? visibleProjects.some((p) => p.id === t.projectId)
        : t.projectId === filterProject;
    const matchesTrade = filterTrade === 'all' || t.trade === filterTrade;
    const matchesPriority = filterPriority === 'all' || t.priority === filterPriority;
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.assigneeName.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesProject && matchesTrade && matchesPriority && matchesSearch;
  });

  const columns: { id: TaskStatus; label: string; icon: any; color: string; border: string }[] = [
    {
      id: 'todo',
      label: 'To Do / Scheduled',
      icon: Clock,
      color: 'bg-slate-800 text-slate-300',
      border: 'border-slate-700',
    },
    {
      id: 'in_progress',
      label: 'In Progress (Active On Site)',
      icon: PlayCircle,
      color: 'bg-blue-900/60 text-blue-300',
      border: 'border-blue-700/50',
    },
    {
      id: 'blocked',
      label: 'Blocked / Action Needed',
      icon: AlertCircle,
      color: 'bg-rose-950/80 text-rose-300',
      border: 'border-rose-700/60',
    },
    {
      id: 'done',
      label: 'Completed & Verified',
      icon: CheckCircle2,
      color: 'bg-emerald-950/70 text-emerald-300',
      border: 'border-emerald-700/50',
    },
  ];

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    if (newStatus === 'blocked') {
      setBlockingTaskId(taskId);
      setBlockReasonInput('');
      return;
    }
    await updateTaskStatus(taskId, newStatus);
  };

  const submitBlockReason = async () => {
    if (!blockingTaskId) return;
    await updateTaskStatus(
      blockingTaskId,
      'blocked',
      blockReasonInput.trim() || 'Awaiting materials, sub inspection or engineering sign-off'
    );
    setBlockingTaskId(null);
  };

  const handleToggleChecklist = async (taskId: string, checkId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task || !task.checklist) return;

    const updatedChecklist = task.checklist.map((item) =>
      item.id === checkId ? { ...item, completed: !item.completed } : item
    );

    const allDone = updatedChecklist.every((i) => i.completed);
    await updateTask(taskId, {
      checklist: updatedChecklist,
      status: allDone ? 'done' : task.status === 'done' ? 'in_progress' : task.status,
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-amber-400" />
            <span>Jobsite Tasks & Trade Milestones</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Track daily field assignments, trade handoffs, and immediate material blockers.
          </p>
        </div>

        {!isClient && (
          <button
            type="button"
            onClick={onOpenNewTaskModal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-md shadow-amber-500/20 transition active:scale-95 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>+ Create Task</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <div className="relative min-w-[200px] flex-1 sm:flex-initial">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search tasks, trades, assignees..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <select
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">All Projects</option>
            {visibleProjects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.code} — {p.name}
              </option>
            ))}
          </select>

          <select
            value={filterTrade}
            onChange={(e) => setFilterTrade(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">All Trades</option>
            {trades.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 self-end md:self-auto">
          <button
            type="button"
            onClick={() => setViewMode('board')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
              viewMode === 'board'
                ? 'bg-amber-500 text-slate-950'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Kanban Board
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
              viewMode === 'list'
                ? 'bg-amber-500 text-slate-950'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            List Table
          </button>
        </div>
      </div>

      {/* Kanban Board View */}
      {viewMode === 'board' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {columns.map((col) => {
            const colTasks = filteredTasks.filter((t) => t.status === col.id);
            const ColIcon = col.icon;

            return (
              <div
                key={col.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col min-h-[500px]"
              >
                <div
                  className={`flex items-center justify-between p-2.5 rounded-xl border mb-3 ${col.color} ${col.border}`}
                >
                  <div className="flex items-center gap-2">
                    <ColIcon className="w-4 h-4" />
                    <span className="text-xs font-bold">{col.label}</span>
                  </div>
                  <span className="text-xs font-mono font-black px-2 py-0.5 rounded-full bg-slate-950/60">
                    {colTasks.length}
                  </span>
                </div>

                <div className="flex-1 space-y-3 overflow-y-auto pr-1">
                  {colTasks.length === 0 ? (
                    <div className="h-32 flex items-center justify-center border-2 border-dashed border-slate-800 rounded-xl text-slate-400 text-xs font-medium">
                      No tasks in this lane
                    </div>
                  ) : (
                    colTasks.map((task) => (
                      <div
                        key={task.id}
                        className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl p-4 space-y-3 transition shadow-sm group"
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700">
                            {task.trade}
                          </span>
                          <TaskPriorityBadge priority={task.priority} />
                        </div>

                        <div className="text-[11px] text-slate-400 font-medium truncate flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{task.projectName}</span>
                        </div>

                        <div>
                          <h4 className="text-sm font-bold text-white leading-snug">{task.title}</h4>
                          <p className="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-2">
                            {task.description}
                          </p>
                        </div>

                        {task.status === 'blocked' && task.blockReason && (
                          <div className="p-2.5 rounded-lg bg-rose-950/80 border border-rose-800/80 text-rose-200 text-xs">
                            <strong className="text-rose-400 block mb-0.5">⚠️ Blocker:</strong>
                            {task.blockReason}
                          </div>
                        )}

                        {task.checklist && task.checklist.length > 0 && (
                          <div className="space-y-1.5 pt-1 border-t border-slate-800/80">
                            <span className="text-[10px] uppercase font-bold text-slate-400">
                              Checklist ({task.checklist.filter((i) => i.completed).length}/
                              {task.checklist.length})
                            </span>
                            <div className="space-y-1">
                              {task.checklist.map((item) => (
                                <button
                                  key={item.id}
                                  type="button"
                                  disabled={isClient}
                                  onClick={() => handleToggleChecklist(task.id, item.id)}
                                  className="w-full flex items-center gap-2 text-left text-xs text-slate-300 hover:text-white"
                                >
                                  <div
                                    className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${
                                      item.completed
                                        ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                                        : 'border-slate-600 bg-slate-900'
                                    }`}
                                  >
                                    {item.completed && <Check className="w-3 h-3 stroke-[3]" />}
                                  </div>
                                  <span
                                    className={`truncate ${
                                      item.completed ? 'line-through text-slate-400' : ''
                                    }`}
                                  >
                                    {item.text}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                          <div className="flex items-center gap-1.5 truncate">
                            <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{task.assigneeName}</span>
                          </div>
                          <div className="flex items-center gap-1 text-amber-400/90 font-medium shrink-0">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{task.dueDate}</span>
                          </div>
                        </div>

                        {!isClient && (
                          <div className="pt-2 flex items-center gap-1 overflow-x-auto">
                            <span className="text-[10px] text-slate-400 mr-1 shrink-0">Move:</span>
                            {columns.map((c) => {
                              if (c.id === task.status) return null;
                              return (
                                <button
                                  key={c.id}
                                  type="button"
                                  onClick={() => handleStatusChange(task.id, c.id)}
                                  className="px-2 py-0.5 text-[10px] font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded border border-slate-800 shrink-0 transition"
                                >
                                  {c.id === 'in_progress'
                                    ? 'Active'
                                    : c.id === 'blocked'
                                    ? 'Block'
                                    : c.id === 'done'
                                    ? 'Done'
                                    : 'To Do'}
                                </button>
                              );
                            })}
                            <button
                              type="button"
                              onClick={() => deleteTask(task.id)}
                              className="ml-auto p-1 text-slate-400 hover:text-rose-400 rounded"
                              title="Delete task"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* List Table View */}
      {viewMode === 'list' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Task / Title</th>
                  <th className="py-3 px-4">Project</th>
                  <th className="py-3 px-4">Trade</th>
                  <th className="py-3 px-4">Assignee</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Due Date</th>
                  {!isClient && <th className="py-3 px-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-900/50">
                {filteredTasks.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-4">
                      <div className="font-bold text-white">{t.title}</div>
                      <div className="text-[11px] text-slate-400 line-clamp-1">{t.description}</div>
                      {t.status === 'blocked' && t.blockReason && (
                        <div className="text-[11px] text-rose-400 font-semibold mt-0.5">
                          ⚠️ {t.blockReason}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-300">{t.projectName}</td>
                    <td className="py-3 px-4 font-bold text-amber-300">{t.trade}</td>
                    <td className="py-3 px-4 text-slate-200">{t.assigneeName}</td>
                    <td className="py-3 px-4">
                      <TaskPriorityBadge priority={t.priority} />
                    </td>
                    <td className="py-3 px-4">
                      <TaskStatusBadge status={t.status} />
                    </td>
                    <td className="py-3 px-4 text-slate-400">{t.dueDate}</td>
                    {!isClient && (
                      <td className="py-3 px-4 text-right">
                        <select
                          value={t.status}
                          onChange={(e) => handleStatusChange(t.id, e.target.value as TaskStatus)}
                          className="bg-slate-950 border border-slate-800 text-[11px] rounded px-2 py-1 text-slate-300 outline-none"
                        >
                          <option value="todo">To Do</option>
                          <option value="in_progress">In Progress</option>
                          <option value="blocked">Blocked</option>
                          <option value="done">Done</option>
                        </select>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Blocking Reason Prompt Modal */}
      {blockingTaskId && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-700/80 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-rose-400">
              <AlertCircle className="w-5 h-5" />
              <h3 className="text-base font-bold text-white">Flag Jobsite Blocker</h3>
            </div>
            <p className="text-xs text-slate-300">
              Please specify the root cause for blocking this task so the Project Manager and field
              subs can coordinate resolution.
            </p>
            <textarea
              rows={3}
              placeholder="e.g. Concrete mix batch delayed 3 hours, or missing engineering approved submittal"
              value={blockReasonInput}
              onChange={(e) => setBlockReasonInput(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-rose-500 outline-none"
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setBlockingTaskId(null)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitBlockReason}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs"
              >
                Confirm Blocker
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
