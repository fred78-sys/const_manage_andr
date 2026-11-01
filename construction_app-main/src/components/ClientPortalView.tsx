import React from 'react';
import { useApp } from '../lib/context';
import {
  Calendar,
  CheckCircle2,
  MapPin,
  Camera,
  Phone,
  Mail,
  HardHat,
  FileCheck,
  ShieldCheck,
} from 'lucide-react';
import { ProjectStatusBadge } from './StatusBadge';

export function ClientPortalView() {
  const {
    visibleProjects,
    dailyLogs,
    tasks,
  } = useApp();

  const project = visibleProjects[0];

  if (!project) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
        No active project assigned to this client account.
      </div>
    );
  }

  const projectLogs = dailyLogs.filter((l) => l.projectId === project.id);

  const projectTasks = tasks.filter((task) => task.projectId === project.id);
  const milestones = projectTasks;

  return (
    <div className="space-y-6 pb-12">
      {/* Client Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/40 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                🔒 Client Stakeholder Portal
              </span>
              <span className="text-xs text-slate-400">Project information and updates</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-2">
              {project.name}
            </h1>
            <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-300 mt-2">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                {project.address}, {project.county} County
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-400" />
                Target Handover: <strong>{project.endDate}</strong>
              </span>
              <ProjectStatusBadge status={project.status} />
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 shrink-0 text-center sm:text-right">
            <span className="text-xs text-slate-400 font-medium">Recorded Project Progress</span>
            <div className="text-3xl sm:text-4xl font-black text-amber-400 mt-0.5">
              {project.percentComplete}%
            </div>
            <span className="text-[11px] text-slate-400 font-semibold">Target: {project.endDate || 'Not set'}</span>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="w-full h-3.5 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-400 rounded-full transition-all duration-700 shadow-lg"
              style={{ width: `${project.percentComplete}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-slate-400 font-mono">
            <span>Groundbreaking: {project.startDate}</span>
            <span>Handover Date: {project.endDate}</span>
          </div>
        </div>
      </div>

      {/* 2-Column Grid: Milestones & Jobsite Contacts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>Project Construction Milestones</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Live task and milestone status recorded by the project team.
            </p>
          </div>

          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
            {milestones.length === 0 ? <p className="text-sm text-slate-400">No milestones or tasks have been recorded for this project yet.</p> : milestones.map((m, idx) => (
              <div key={m.id} className="relative space-y-1">
                <div
                  className={`absolute -left-6 top-1 w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] font-bold ${
                    m.status === 'done'
                      ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                      : m.status === 'in_progress'
                      ? 'bg-amber-500 border-amber-400 text-slate-950 animate-pulse'
                      : 'bg-slate-950 border-slate-700 text-slate-400'
                  }`}
                >
                  {m.status === 'done' ? '✓' : idx + 1}
                </div>

                <div className="flex items-center justify-between">
                  <h3
                    className={`text-sm font-bold ${
                      m.status === 'done'
                        ? 'text-white'
                        : m.status === 'in_progress'
                        ? 'text-amber-300 font-extrabold'
                        : 'text-slate-400'
                    }`}
                  >
                    {m.title}
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">{m.dueDate || 'No due date'}</span>
                </div>
                <p className="text-xs text-slate-400">{m.description || m.trade}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <HardHat className="w-5 h-5 text-amber-400" />
                <span>Your General Contractor Team</span>
              </h2>
              <p className="text-xs text-slate-400">
                Project roles currently assigned to this site.
              </p>
            </div>

            <div className="rounded-xl bg-slate-950 border border-slate-800 p-4 space-y-2">
              <div className="text-xs text-slate-400">Project manager</div>
              <div className="text-sm font-semibold text-white">{project.pmName || 'Not assigned'}</div>
              <div className="text-xs text-slate-400">Site supervisor</div>
              <div className="text-sm font-semibold text-white">{project.supervisorName || 'Not assigned'}</div>
              <p className="text-xs text-slate-500">Contact details are shown here when they are added to the assigned team profiles.</p>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2"><FileCheck className="w-5 h-5 text-emerald-400"/><span>Project approvals & compliance</span></h2>
            <div className="space-y-2 text-xs">
              <p className="rounded-lg bg-slate-950 border border-slate-800 p-3"><span className="text-slate-400">NCA registration: </span>{project.ncaProjectNumber || 'Not provided'}</p>
              <p className="rounded-lg bg-slate-950 border border-slate-800 p-3"><span className="text-slate-400">County permit: </span>{project.countyPermitNumber || 'Not provided'}</p>
              <p className="rounded-lg bg-slate-950 border border-slate-800 p-3"><span className="text-slate-400">NEMA licence: </span>{project.nemaLicenseNumber || 'Not provided'}</p>
              <p className="rounded-lg bg-slate-950 border border-slate-800 p-3"><span className="text-slate-400">Land reference: </span>{project.lrNumber || 'Not provided'}</p>
            </div>
          </div>
          </div>
        </div>

      {/* Latest Site Photos */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Camera className="w-5 h-5 text-amber-400" />
              <span>Jobsite Photo Documentation</span>
            </h2>
            <p className="text-xs text-slate-400">
              Photographs uploaded with this project's daily site reports.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projectLogs.flatMap((l) => l.photos || []).slice(0, 6).map((photo) => (
            <div
              key={photo.id}
              className="group relative h-48 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shadow-sm"
            >
              <img
                src={photo.url}
                alt={photo.caption}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
              {photo.tradeTag && (
                <span className="absolute top-3 left-3 text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-950/80 text-amber-300 border border-slate-800">
                  {photo.tradeTag}
                </span>
              )}
              <div className="absolute bottom-3 left-3 right-3 text-white">
                <p className="text-xs font-semibold leading-snug">{photo.caption}</p>
                {photo.timestamp && (
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Logged at {photo.timestamp}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
