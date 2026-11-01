import React, { useState } from 'react';
import { useApp } from '../lib/context';
import { ProjectStatusBadge, BudgetHealthBadge } from './StatusBadge';
import { formatKES, formatKESCompact } from '../lib/formatters';
import {
  Building2,
  Plus,
  Search,
  Filter,
  MapPin,
  Calendar,
  DollarSign,
  Edit2,
  Trash2,
  FileText,
  Camera,
  CheckSquare,
  ShieldCheck,
  Award,
} from 'lucide-react';

interface ProjectsViewProps {
  onOpenNewProjectModal: () => void;
  onOpenNewLogModal: () => void;
  onOpenNewTaskModal: () => void;
  onOpenNewExpenseModal: () => void;
}

export function ProjectsView({
  onOpenNewProjectModal,
  onOpenNewLogModal,
  onOpenNewTaskModal,
  onOpenNewExpenseModal,
}: ProjectsViewProps) {
  const {
    currentUser,
    visibleProjects,
    selectedProjectId,
    setSelectedProjectId,
    updateProject,
    deleteProject,
    tasks,
    dailyLogs,
    expenses,
    documents,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'details' | 'tasks' | 'logs' | 'budget' | 'docs'>('details');
  const [isEditingProgress, setIsEditingProgress] = useState(false);
  const [progressInput, setProgressInput] = useState<number>(0);

  const isAdmin = currentUser.role === 'admin';
  const isClient = currentUser.role === 'client';

  const filteredProjects = visibleProjects.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.county.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.subCounty && p.subCounty.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const currentSelectedProject =
    visibleProjects.find((p) => p.id === selectedProjectId) || visibleProjects[0] || null;

  const projectTasks = currentSelectedProject
    ? tasks.filter((t) => t.projectId === currentSelectedProject.id)
    : [];
  const projectLogs = currentSelectedProject
    ? dailyLogs.filter((l) => l.projectId === currentSelectedProject.id)
    : [];
  const projectExpenses = currentSelectedProject
    ? expenses.filter((e) => e.projectId === currentSelectedProject.id)
    : [];
  const projectDocs = currentSelectedProject
    ? documents.filter((d) => d.projectId === currentSelectedProject.id)
    : [];

  const totalSpentOnProject = projectExpenses.reduce((sum, e) => sum + e.amount, 0);

  const handleUpdateProgress = async () => {
    if (!currentSelectedProject) return;
    await updateProject(currentSelectedProject.id, {
      percentComplete: Math.min(100, Math.max(0, Number(progressInput))),
    });
    setIsEditingProgress(false);
  };

  const handleDeleteProject = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      await deleteProject(id);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <Building2 className="w-6 h-6 text-amber-400" />
            <span>Kenyan Construction Sites & Projects</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            End-to-end management of projects across Nairobi, Kiambu, Mombasa and beyond.
          </p>
        </div>

        {isAdmin && (
          <button
            type="button"
            onClick={onOpenNewProjectModal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-md shadow-amber-500/20 transition active:scale-95 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>+ Create Project</span>
          </button>
        )}
      </div>

      {/* Main Grid: Projects List on Left / Drilldown Detail on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-3">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by project, client, county, code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="all">All Sites ({visibleProjects.length})</option>
                <option value="active">Active / On Track</option>
                <option value="delayed">Schedule At Risk</option>
                <option value="completed">Completed</option>
                <option value="on_hold">On Hold</option>
              </select>
            </div>
          </div>

          <div className="space-y-2.5 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
            {filteredProjects.map((project) => {
              const isSelected = project.id === currentSelectedProject?.id;
              const pExp = expenses.filter((e) => e.projectId === project.id);
              const pSpent = pExp.reduce((a, b) => a + b.amount, 0);

              return (
                <div
                  key={project.id}
                  onClick={() => setSelectedProjectId(project.id)}
                  className={`p-4 rounded-xl border transition cursor-pointer text-left ${
                    isSelected
                      ? 'bg-slate-800/90 border-amber-500/80 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/30'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-mono font-bold text-amber-400">
                        {project.code}
                      </span>
                      <h3 className="text-sm font-bold text-white truncate mt-0.5">
                        {project.name}
                      </h3>
                      <p className="text-xs text-slate-400 truncate mt-0.5">
                        Client: {project.clientName}
                      </p>
                      <p className="text-[11px] text-amber-300/80 truncate mt-0.5">
                        📍 {project.county} County {project.subCounty ? `(${project.subCounty})` : ''}
                      </p>
                    </div>
                    <ProjectStatusBadge status={project.status} />
                  </div>

                  <div className="mt-3 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Completion</span>
                      <span className="font-bold text-white">{project.percentComplete}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full"
                        style={{ width: `${project.percentComplete}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="text-slate-300 font-medium">{formatKESCompact(pSpent)} spent</span>
                    <span className="text-amber-400 font-medium">BQ: {formatKESCompact(project.budgetTotal)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-8 space-y-4">
          {currentSelectedProject ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
              <div className="relative h-48 sm:h-56 bg-slate-800 overflow-hidden">
                {currentSelectedProject.coverImage ? <img src={currentSelectedProject.coverImage} alt={currentSelectedProject.name} className="w-full h-full object-cover brightness-75" /> : <div className="w-full h-full bg-gradient-to-br from-slate-800 via-slate-900 to-amber-950/40" />}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-slate-950/80 text-amber-300 border border-slate-700 backdrop-blur-sm">
                      {currentSelectedProject.code}
                    </span>
                    {currentSelectedProject.ncaCategory && (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {currentSelectedProject.ncaCategory}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <ProjectStatusBadge status={currentSelectedProject.status} />
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() =>
                          handleDeleteProject(
                            currentSelectedProject.id,
                            currentSelectedProject.name
                          )
                        }
                        className="p-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800"
                        title="Delete project"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h2 className="text-lg sm:text-2xl font-black">{currentSelectedProject.name}</h2>
                  <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-300 mt-1">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-amber-400" />
                      {currentSelectedProject.address}, {currentSelectedProject.county} County
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-blue-400" />
                      {currentSelectedProject.startDate} → {currentSelectedProject.endDate}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-b border-slate-800 bg-slate-950/60 px-4 flex items-center gap-2 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setActiveTab('details')}
                  className={`py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition ${
                    activeTab === 'details'
                      ? 'border-amber-400 text-amber-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Site Overview & Compliance
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('tasks')}
                  className={`py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition flex items-center gap-1.5 ${
                    activeTab === 'tasks'
                      ? 'border-amber-400 text-amber-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <CheckSquare className="w-3.5 h-3.5" />
                  <span>Trade Tasks ({projectTasks.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('logs')}
                  className={`py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition flex items-center gap-1.5 ${
                    activeTab === 'logs'
                      ? 'border-amber-400 text-amber-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Site Logs ({projectLogs.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('budget')}
                  className={`py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition flex items-center gap-1.5 ${
                    activeTab === 'budget'
                      ? 'border-amber-400 text-amber-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>BQ & Expenses ({formatKESCompact(totalSpentOnProject)})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('docs')}
                  className={`py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition flex items-center gap-1.5 ${
                    activeTab === 'docs'
                      ? 'border-amber-400 text-amber-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Permits & Drawings ({projectDocs.length})</span>
                </button>
              </div>

              {activeTab === 'details' && (
                <div className="p-5 sm:p-6 space-y-6">
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 sm:p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          Overall Milestone Handover Progress
                        </span>
                        <div className="text-2xl font-black text-white mt-0.5">
                          {currentSelectedProject.percentComplete}% Complete
                        </div>
                      </div>

                      {!isClient && (
                        <div>
                          {isEditingProgress ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={progressInput}
                                onChange={(e) => setProgressInput(Number(e.target.value))}
                                className="w-20 bg-slate-900 border border-amber-500 rounded-lg px-2 py-1 text-sm font-bold text-white text-center"
                              />
                              <button
                                type="button"
                                onClick={handleUpdateProgress}
                                className="px-3 py-1 bg-amber-500 text-slate-950 font-bold rounded-lg text-xs"
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                onClick={() => setIsEditingProgress(false)}
                                className="px-2 py-1 bg-slate-800 text-slate-300 rounded-lg text-xs"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setProgressInput(currentSelectedProject.percentComplete);
                                setIsEditingProgress(true);
                              }}
                              className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800"
                            >
                              <Edit2 className="w-3 h-3" />
                              <span>Update % Progress</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${currentSelectedProject.percentComplete}%` }}
                      />
                    </div>
                  </div>

                  {/* Statutory & Regulatory Compliance Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                      <div className="text-[10px] uppercase font-bold text-amber-400">NCA Reg. No.</div>
                      <div className="text-xs font-bold text-white mt-1">
                        {currentSelectedProject.ncaProjectNumber || 'Not provided'}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">National Construction Auth</div>
                    </div>
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                      <div className="text-[10px] uppercase font-bold text-emerald-400">LR Number</div>
                      <div className="text-xs font-bold text-white mt-1">
                        {currentSelectedProject.lrNumber || 'LR No. 209/18942/2'}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Title & Site Deed</div>
                    </div>
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                      <div className="text-[10px] uppercase font-bold text-blue-400">County Approval</div>
                      <div className="text-xs font-bold text-white mt-1">
                        {currentSelectedProject.countyPermitNumber || 'Not provided'}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{currentSelectedProject.county} Permit</div>
                    </div>
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                      <div className="text-[10px] uppercase font-bold text-purple-400">NEMA EIA License</div>
                      <div className="text-xs font-bold text-white mt-1 truncate">
                        {currentSelectedProject.nemaLicenseNumber || 'NEMA/EIA/28419'}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Environment License</div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Scope of Works & Technical Specification
                    </h4>
                    <p className="text-sm text-slate-200 leading-relaxed bg-slate-950 p-4 rounded-xl border border-slate-800">
                      {currentSelectedProject.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                      <div className="text-[11px] text-slate-400 font-medium">Developer / Client</div>
                      <div className="text-sm font-bold text-white">
                        {currentSelectedProject.clientName}
                      </div>
                      <div className="text-xs text-slate-400 truncate">
                        {currentSelectedProject.clientEmail}
                      </div>
                    </div>

                    <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                      <div className="text-[11px] text-slate-400 font-medium">Project Manager (PM)</div>
                      <div className="text-sm font-bold text-blue-400">
                        {currentSelectedProject.pmName}
                      </div>
                      <div className="text-xs text-slate-400">BORAQS Registered Architect</div>
                    </div>

                    <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                      <div className="text-[11px] text-slate-400 font-medium">Site Agent / Superintendent</div>
                      <div className="text-sm font-bold text-amber-400">
                        {currentSelectedProject.supervisorName}
                      </div>
                      <div className="text-xs text-slate-400">NCA Accredited Supervisor</div>
                    </div>
                  </div>

                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Priced Bill of Quantities (BQ) vs Incurred Actuals
                      </span>
                      <BudgetHealthBadge
                        budgeted={currentSelectedProject.budgetTotal}
                        actual={totalSpentOnProject}
                      />
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                        <span className="text-slate-400">Fundis & Vibarua Labor</span>
                        <div className="font-bold text-white mt-1 truncate">
                          {formatKES(currentSelectedProject.budgetCategories?.labor || 0)}
                        </div>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                        <span className="text-slate-400">Site Materials</span>
                        <div className="font-bold text-white mt-1 truncate">
                          {formatKES(currentSelectedProject.budgetCategories?.materials || 0)}
                        </div>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                        <span className="text-slate-400">Plant & Equipment</span>
                        <div className="font-bold text-white mt-1 truncate">
                          {formatKES(currentSelectedProject.budgetCategories?.equipment || 0)}
                        </div>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                        <span className="text-slate-400">Statutory / Levies</span>
                        <div className="font-bold text-white mt-1 truncate">
                          {formatKES(currentSelectedProject.budgetCategories?.other || 0)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'tasks' && (
                <div className="p-5 sm:p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white">
                      Tasks Assigned to {currentSelectedProject.name}
                    </h3>
                    {!isClient && (
                      <button
                        type="button"
                        onClick={onOpenNewTaskModal}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold"
                      >
                        + Add Task
                      </button>
                    )}
                  </div>

                  {projectTasks.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-xs">
                      No tasks logged yet for this project.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {projectTasks.map((t) => (
                        <div
                          key={t.id}
                          className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-start justify-between gap-3"
                        >
                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-800 text-amber-400">
                                {t.trade}
                              </span>
                              <h4 className="text-xs sm:text-sm font-bold text-white">{t.title}</h4>
                            </div>
                            <p className="text-xs text-slate-400">{t.description}</p>
                            <div className="text-[11px] text-slate-400 flex items-center gap-3">
                              <span>Due: {t.dueDate}</span>
                              <span>Assignee: {t.assigneeName}</span>
                            </div>
                          </div>
                          <ProjectStatusBadge status={t.status === 'done' ? 'completed' : t.status === 'blocked' ? 'delayed' : 'active'} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'logs' && (
                <div className="p-5 sm:p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white">Daily Field Logs & Kenyan Site Reports</h3>
                    {!isClient && (
                      <button
                        type="button"
                        onClick={onOpenNewLogModal}
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold"
                      >
                        + Submit Site Log
                      </button>
                    )}
                  </div>

                  {projectLogs.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-xs">
                      No field reports submitted yet for this project.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {projectLogs.map((log) => (
                        <div
                          key={log.id}
                          className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-amber-400">{log.date}</span>
                            <span className="text-xs text-slate-400">
                              👥 {log.crew.total} Fundis & Vibarua • ☀️ {log.weather.tempC}°C ({log.weather.condition})
                            </span>
                          </div>
                          <p className="text-xs text-slate-200 leading-relaxed">{log.workDone}</p>
                          {log.materialDeliveries && (
                            <div className="text-[11px] p-2 rounded bg-slate-900 border border-slate-800 text-slate-300">
                              <strong className="text-amber-400">Site Deliveries:</strong> {log.materialDeliveries}
                            </div>
                          )}
                          {log.photos && log.photos.length > 0 && (
                            <div className="flex gap-2 pt-1 overflow-x-auto">
                              {log.photos.map((p) => (
                                <img
                                  key={p.id}
                                  src={p.url}
                                  alt={p.caption}
                                  className="w-16 h-16 rounded-lg object-cover border border-slate-700"
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'budget' && (
                <div className="p-5 sm:p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white">Project Expense & M-Pesa Ledger</h3>
                      <p className="text-xs text-slate-400">
                        Incurred supplier invoices, BQ certificates, and fundi payroll
                      </p>
                    </div>
                    {!isClient && (
                      <button
                        type="button"
                        onClick={onOpenNewExpenseModal}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold border border-slate-700"
                      >
                        + Record Expense
                      </button>
                    )}
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-300">
                      <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                        <tr>
                          <th className="py-2.5 px-3">Date</th>
                          <th className="py-2.5 px-3">Category</th>
                          <th className="py-2.5 px-3">Vendor / Supplier</th>
                          <th className="py-2.5 px-3">M-Pesa / Ref</th>
                          <th className="py-2.5 px-3">Notes</th>
                          <th className="py-2.5 px-3 text-right">Amount (KES)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
                        {projectExpenses.map((exp) => (
                          <tr key={exp.id} className="hover:bg-slate-800/40">
                            <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap">{exp.date}</td>
                            <td className="py-2.5 px-3 uppercase font-bold text-[10px] text-amber-400 whitespace-nowrap">
                              {exp.category}
                            </td>
                            <td className="py-2.5 px-3 font-semibold text-white whitespace-nowrap">{exp.vendor}</td>
                            <td className="py-2.5 px-3 text-[11px] text-emerald-400 font-mono whitespace-nowrap">
                              {exp.mpesaRef || exp.invoiceNumber || '—'}
                            </td>
                            <td className="py-2.5 px-3 text-slate-400 truncate max-w-xs">
                              {exp.notes || '—'}
                            </td>
                            <td className="py-2.5 px-3 text-right font-bold text-white whitespace-nowrap">
                              {formatKES(exp.amount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'docs' && (
                <div className="p-5 sm:p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white">
                      NCA Registrations, Stamped County Permits & Drawings
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {projectDocs.map((doc) => (
                      <div
                        key={doc.id}
                        className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-start justify-between gap-3"
                      >
                        <div className="space-y-1 min-w-0">
                          <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-slate-800 text-amber-400">
                            {doc.category.replace('_', ' ')}
                          </span>
                          <h4 className="text-xs font-bold text-white truncate">{doc.title}</h4>
                          <p className="text-[11px] text-slate-400">
                            {doc.fileName} • {doc.fileSize} • {doc.version}
                          </p>
                        </div>
                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-semibold shrink-0"
                        >
                          View
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
              Select a project from the left to view detailed logs, schedules, and financials.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
