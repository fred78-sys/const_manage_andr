import React from 'react';
import { useApp } from '../lib/context';
import { NavigationTab } from './Sidebar';
import { ProjectStatusBadge } from './StatusBadge';
import { formatKES, formatKESCompact } from '../lib/formatters';
import {
  Building2,
  AlertTriangle,
  Users,
  DollarSign,
  CheckCircle2,
  Clock,
  ArrowRight,
  HardHat,
  Camera,
  MapPin,
  ChevronRight,
  ShieldCheck,
  FileCheck,
} from 'lucide-react';

interface DashboardViewProps {
  onNavigate: (tab: NavigationTab) => void;
  onOpenNewLogModal: () => void;
  onOpenNewExpenseModal: () => void;
  onOpenNewProjectModal: () => void;
  onOpenNewTaskModal: () => void;
}

export function DashboardView({
  onNavigate,
  onOpenNewLogModal,
  onOpenNewExpenseModal,
}: DashboardViewProps) {
  const {
    currentUser,
    visibleProjects,
    tasks,
    dailyLogs,
    expenses,
    setSelectedProjectId,
  } = useApp();

  const isClient = currentUser.role === 'client';
  const isSupervisor = currentUser.role === 'supervisor';
  const isAdmin = currentUser.role === 'admin';
  const isPM = currentUser.role === 'pm';

  const totalBudget = visibleProjects.reduce((acc, p) => acc + p.budgetTotal, 0);
  const totalSpent = expenses
    .filter((e) => visibleProjects.some((p) => p.id === e.projectId))
    .reduce((acc, e) => acc + e.amount, 0);
  const overallSpentPercent = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  const visibleTasks = tasks.filter((t) => visibleProjects.some((p) => p.id === t.projectId));
  const blockedTasks = visibleTasks.filter((t) => t.status === 'blocked');
  const inProgressTasks = visibleTasks.filter((t) => t.status === 'in_progress');
  const completedTasks = visibleTasks.filter((t) => t.status === 'done');

  const latestLog = dailyLogs[0];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner & Quick Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
              {currentUser.role === 'admin'
                ? 'Managing Director / GC Dashboard'
                : currentUser.role === 'pm'
                ? 'Project Management Hub (BORAQS / AAK)'
                : currentUser.role === 'supervisor'
                ? 'Kenyan Field Jobsite Operations'
                : 'Client Project Overview'}
            </span>
            <span className="text-xs text-slate-400">
              {new Date().toLocaleDateString('en-KE', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white mt-1.5">
            Welcome back, {currentUser.name}
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {isSupervisor
              ? `Assigned project access: ${visibleProjects.length} project${visibleProjects.length === 1 ? '' : 's'}. View site progress, tasks and reports.`
              : `You have access to ${visibleProjects.length} construction project${visibleProjects.length === 1 ? '' : 's'}.` }
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {!isClient && (
            <button
              type="button"
              onClick={onOpenNewLogModal}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-md shadow-amber-500/20 transition active:scale-95"
            >
              <HardHat className="w-4 h-4" />
              <span>+ Log Daily Work</span>
            </button>
          )}

          {(isAdmin || isPM) && (
            <button
              type="button"
              onClick={onOpenNewExpenseModal}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm border border-slate-700 transition active:scale-95"
            >
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span>+ Record Expense / M-Pesa</span>
            </button>
          )}
        </div>
      </div>

      {/* Blocked Tasks Alert Banner if any */}
      {blockedTasks.length > 0 && !isClient && (
        <div className="bg-rose-950/40 border border-rose-800/60 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-rose-900/60 text-rose-300 border border-rose-700/50 shrink-0 mt-0.5 sm:mt-0">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-rose-200">
                  {blockedTasks.length} Jobsite Blocker{blockedTasks.length > 1 ? 's' : ''} Requiring Action
                </h3>
                <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-rose-500 text-white">
                  Urgent
                </span>
              </div>
              <p className="text-xs text-rose-300/80 mt-0.5">
                "{blockedTasks[0].title}" — {blockedTasks[0].blockReason || 'Material or inspection delay'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('tasks')}
            className="text-xs font-bold text-rose-300 hover:text-white bg-rose-900/80 hover:bg-rose-800 px-3 py-1.5 rounded-lg border border-rose-700/50 transition flex items-center gap-1 self-end sm:self-auto"
          >
            <span>Resolve in Tasks</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div
          onClick={() => onNavigate('projects')}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 sm:p-5 cursor-pointer transition group shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Active Sites</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 group-hover:bg-blue-500 group-hover:text-slate-950 transition">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-white">{visibleProjects.length}</div>
            <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <span className="text-emerald-400 font-semibold">NCA 1 & 2 Reg.</span>
              <span>• Avg {Math.round(visibleProjects.reduce((a, b) => a + b.percentComplete, 0) / (visibleProjects.length || 1))}% complete</span>
            </div>
          </div>
        </div>

        <div
          onClick={() => onNavigate('budget')}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 sm:p-5 cursor-pointer transition group shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">
              {isClient ? 'Project Budget' : 'Total Portfolio Budget'}
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-slate-950 transition">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-white">
              {formatKESCompact(totalBudget)}
            </div>
            <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <span className="text-emerald-400 font-semibold">{formatKESCompact(totalSpent)} spent</span>
              <span>({overallSpentPercent}% BQ utilized)</span>
            </div>
          </div>
        </div>

        <div
          onClick={() => onNavigate('tasks')}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 sm:p-5 cursor-pointer transition group shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Trade Milestones</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:bg-amber-500 group-hover:text-slate-950 transition">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-white">
              {inProgressTasks.length + blockedTasks.length}
            </div>
            <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <span className="text-blue-400 font-semibold">{inProgressTasks.length} in progress</span>
              <span>• {completedTasks.length} done</span>
            </div>
          </div>
        </div>

        <div
          onClick={() => onNavigate('daily-logs')}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 sm:p-5 cursor-pointer transition group shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Crew on Site (Fundis & Vibarua)</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 group-hover:bg-purple-500 group-hover:text-slate-950 transition">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-white">
              {latestLog ? latestLog.crew.total : 26}
            </div>
            <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <span className="text-amber-400 font-semibold">{dailyLogs.length} field logs</span>
              <span>• Weather: {latestLog?.weather.tempC || 22}°C</span>
            </div>
          </div>
        </div>
      </div>

      {/* Projects Overview Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-amber-400" />
              <span>Kenyan Construction Sites & Projects</span>
            </h2>
            <p className="text-xs text-slate-400">
              Live percent completion, BQ budget variances, NCA compliance, and site agents.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('projects')}
            className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1"
          >
            <span>View All ({visibleProjects.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleProjects.map((project) => {
            const projectExpenses = expenses.filter((e) => e.projectId === project.id);
            const spent = projectExpenses.reduce((a, b) => a + b.amount, 0);
            const projectTasks = tasks.filter((t) => t.projectId === project.id);
            const blockedInProject = projectTasks.filter((t) => t.status === 'blocked').length;

            return (
              <div
                key={project.id}
                onClick={() => {
                  setSelectedProjectId(project.id);
                  onNavigate('projects');
                }}
                className="bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-2xl overflow-hidden shadow-sm transition group cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-36 bg-slate-800 overflow-hidden">
                    {project.coverImage ? <img src={project.coverImage} alt={project.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-300 brightness-90" /> : <div className="w-full h-full bg-gradient-to-br from-slate-800 via-slate-900 to-amber-950/40" />}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
                    <div className="absolute top-3 left-3">
                      <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-slate-950/80 text-amber-300 border border-slate-700/80 backdrop-blur-sm">
                        {project.code}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3">
                      <ProjectStatusBadge status={project.status} />
                    </div>
                    <div className="absolute bottom-2.5 left-3 right-3">
                      <h3 className="text-base font-bold text-white drop-shadow truncate">
                        {project.name}
                      </h3>
                      <div className="flex items-center gap-1 text-xs text-slate-300 drop-shadow">
                        <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                        <span className="truncate">{project.address}, {project.county} County</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 space-y-3.5">
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-slate-400 font-medium">Progress to Handover</span>
                        <span className="font-extrabold text-white text-sm">
                          {project.percentComplete}%
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            project.percentComplete >= 80
                              ? 'bg-emerald-500'
                              : project.percentComplete >= 40
                              ? 'bg-amber-500'
                              : 'bg-blue-500'
                          }`}
                          style={{ width: `${project.percentComplete}%` }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800 text-xs">
                      <div>
                        <span className="text-slate-400">Total Budget (KES)</span>
                        <div className="font-bold text-slate-200 mt-0.5 truncate">
                          {formatKES(project.budgetTotal)}
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-400">Actual Spent</span>
                        <div className="font-bold text-amber-400 mt-0.5 truncate">
                          {formatKES(spent)}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      {project.ncaProjectNumber && (
                        <div className="flex items-center justify-between text-[10px] text-slate-400 bg-slate-950/60 px-2 py-1 rounded border border-slate-800/80">
                          <span className="text-amber-400 font-semibold flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" /> NCA: {project.ncaProjectNumber}
                          </span>
                          <span className="text-slate-300">{project.ncaCategory}</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-[11px] text-slate-400 bg-slate-950 p-2 rounded-xl border border-slate-800">
                        <div className="flex items-center gap-1.5 truncate">
                          <HardHat className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span className="truncate">Site Agent: {project.supervisorName}</span>
                        </div>
                        {blockedInProject > 0 ? (
                          <span className="text-rose-400 font-bold bg-rose-950/80 px-1.5 py-0.5 rounded border border-rose-800/40">
                            {blockedInProject} Blocked
                          </span>
                        ) : (
                          <span className="text-emerald-400 font-medium">0 Blockers</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between text-xs font-semibold text-slate-300 group-hover:text-amber-400 transition">
                  <span>Open Site Details</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lower Row: Recent Daily Field Logs & Weekly Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-amber-400" />
              <div>
                <h3 className="text-base font-bold text-white">Latest Kenyan Site Logs</h3>
                <p className="text-xs text-slate-400">Real-time field supervisor logs, material deliveries & photos</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('daily-logs')}
              className="text-xs font-semibold text-amber-400 hover:text-amber-300"
            >
              All Logs →
            </button>
          </div>

          <div className="space-y-3">
            {dailyLogs.slice(0, 2).map((log) => (
              <div
                key={log.id}
                className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3"
              >
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-amber-400">{log.date}</span>
                    <span className="text-xs text-slate-400">• {log.projectName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-medium">
                      👥 {log.crew.total} Crew (Fundis & Vibarua)
                    </span>
                    <span className="text-xs bg-slate-800 text-amber-300 px-2 py-0.5 rounded font-medium">
                      ☀️ {log.weather.tempC}°C ({log.weather.condition})
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                  {log.workDone}
                </p>

                {log.materialDeliveries && (
                  <div className="text-[11px] p-2 rounded bg-slate-900 border border-slate-800 text-slate-300">
                    <strong className="text-amber-400">Site Deliveries:</strong> {log.materialDeliveries}
                  </div>
                )}

                {log.photos && log.photos.length > 0 && (
                  <div className="flex items-center gap-2 overflow-x-auto pt-1">
                    {log.photos.map((photo) => (
                      <div
                        key={photo.id}
                        className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 border border-slate-700 bg-slate-800"
                      >
                        <img
                          src={photo.url}
                          alt={photo.caption}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                    <div className="text-xs text-slate-400 font-medium pl-1">
                      +{log.photos.length} photo{log.photos.length > 1 ? 's' : ''}
                    </div>
                  </div>
                )}

                {log.issues && (
                  <div className="text-xs p-2 rounded bg-amber-950/40 border border-amber-800/40 text-amber-300">
                    <strong className="text-amber-400">Site Issue / Note:</strong> {log.issues}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-400" />
              <div>
                <h3 className="text-base font-bold text-white">Scheduled Tasks & Trades</h3>
                <p className="text-xs text-slate-400">Upcoming trade milestones & inspections</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('tasks')}
              className="text-xs font-semibold text-blue-400 hover:text-blue-300"
            >
              Board →
            </button>
          </div>

          <div className="space-y-2.5">
            {visibleTasks.slice(0, 4).map((task) => (
              <div
                key={task.id}
                className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-start justify-between gap-3"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                      {task.trade}
                    </span>
                    <span className="text-xs font-bold text-slate-200">{task.status.toUpperCase()}</span>
                  </div>
                  <h4 className="text-xs font-bold text-white truncate">{task.title}</h4>
                  <div className="text-[11px] text-slate-400 flex items-center gap-2">
                    <span>Due: {task.dueDate}</span>
                    <span>• {task.assigneeName}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
