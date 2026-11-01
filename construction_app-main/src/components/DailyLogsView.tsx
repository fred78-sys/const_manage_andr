import React, { useState } from 'react';
import { useApp } from '../lib/context';
import { DailyLogPhoto } from '../lib/types';
import { IssueSeverityBadge } from './StatusBadge';
import {
  ClipboardList,
  Search,
  Camera,
  Sun,
  CloudRain,
  Wind,
  Users,
  Calendar,
  HardHat,
  X,
  Maximize2,
  CheckCircle,
  Trash2,
  Truck,
} from 'lucide-react';

interface DailyLogsViewProps {
  onOpenNewLogModal: () => void;
}

export function DailyLogsView({ onOpenNewLogModal }: DailyLogsViewProps) {
  const {
    currentUser,
    dailyLogs,
    visibleProjects,
    deleteDailyLog,
  } = useApp();

  const [filterProject, setFilterProject] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activePhotoModal, setActivePhotoModal] = useState<DailyLogPhoto | null>(null);

  const isClient = currentUser.role === 'client';
  const isAdmin = currentUser.role === 'admin';
  const isSupervisor = currentUser.role === 'supervisor';

  const filteredLogs = dailyLogs.filter((log) => {
    const matchesProject =
      filterProject === 'all'
        ? visibleProjects.some((p) => p.id === log.projectId)
        : log.projectId === filterProject;
    const matchesSeverity = filterSeverity === 'all' || log.issueSeverity === filterSeverity;
    const matchesSearch =
      log.workDone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.issues && log.issues.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (log.materialDeliveries && log.materialDeliveries.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (log.projectName && log.projectName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      log.supervisorName.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesProject && matchesSeverity && matchesSearch;
  });

  const getWeatherIcon = (condition: string) => {
    const c = condition.toLowerCase();
    if (c.includes('rain') || c.includes('masika') || c.includes('drizzle') || c.includes('downpour')) return CloudRain;
    if (c.includes('wind') || c.includes('dust')) return Wind;
    return Sun;
  };

  const handleDeleteLog = async (id: string, date: string) => {
    if (confirm(`Delete site log for ${date}?`)) {
      await deleteDailyLog(id);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
              Kenyan Jobsite Field Diary
            </span>
            <span className="text-xs text-slate-400">NCA & Statutory System of Record</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2 mt-1">
            <ClipboardList className="w-6 h-6 text-amber-400" />
            <span>Daily Site Reports & Field Timeline</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Certified chronological daily progress logs, weather observations, fundi & vibarua headcounts, material deliveries, and photo documentation.
          </p>
        </div>

        {!isClient && (
          <button
            type="button"
            onClick={onOpenNewLogModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-md shadow-amber-500/20 transition active:scale-95 self-start sm:self-auto"
          >
            <HardHat className="w-4 h-4" />
            <span>+ New Daily Site Log</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <div className="relative min-w-[220px] flex-1 sm:flex-initial">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search narrative, work done, deliveries, issues..."
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
            <option value="all">All Sites ({visibleProjects.length})</option>
            {visibleProjects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.code} — {p.name}
              </option>
            ))}
          </select>

          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">All Issues & Clear Days</option>
            <option value="critical">Critical / Stop-Work / NCA Alerts</option>
            <option value="moderate">Moderate Delays (Weather / Rain)</option>
            <option value="minor">Minor Issues</option>
            <option value="none">No Issues Reported</option>
          </select>
        </div>

        <div className="text-xs text-slate-400 font-medium">
          Showing {filteredLogs.length} verified site report{filteredLogs.length === 1 ? '' : 's'}
        </div>
      </div>

      {/* Timeline Stream */}
      <div className="space-y-6">
        {filteredLogs.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
            <ClipboardList className="w-10 h-10 text-slate-400 mx-auto" />
            <div className="text-sm font-bold text-white">No daily logs found</div>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              No daily reports match your current filters. Click "+ New Daily Site Log" to record today's site activity.
            </p>
          </div>
        ) : (
          filteredLogs.map((log) => {
            const WeatherIcon = getWeatherIcon(log.weather.condition);

            return (
              <div
                key={log.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:border-slate-700 transition"
              >
                <div className="bg-slate-950 px-5 py-4 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-black text-sm">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-black text-white">{log.date}</span>
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-900 text-amber-400 border border-slate-800">
                          {log.projectName}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <HardHat className="w-3.5 h-3.5 text-amber-400" />
                        <span>Submitted by: <strong>{log.supervisorName}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <IssueSeverityBadge severity={log.issueSeverity} />
                    {(isAdmin || isSupervisor) && !isClient && (
                      <button
                        type="button"
                        onClick={() => handleDeleteLog(log.id, log.date)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-900 transition"
                        title="Delete log"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 bg-slate-950/40 border-b border-slate-800/80 divide-y md:divide-y-0 md:divide-x divide-slate-800">
                  <div className="p-4 flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                      <WeatherIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                        <span>{log.weather.condition}</span>
                        <span className="text-amber-400 font-mono font-black">
                          {log.weather.tempC}°C
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 leading-snug">
                        {log.weather.notes}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0">
                      <Users className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                        <span>Crew Headcount:</span>
                        <span className="text-blue-400 font-mono font-black">
                          {log.crew.total} Fundis & Vibarua on Site
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {log.crew.breakdown?.map((item, idx) => (
                          <span
                            key={idx}
                            className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800"
                          >
                            {item.trade}: <strong className="text-amber-400">{item.count}</strong>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  {log.materialDeliveries && (
                    <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex items-start gap-2.5">
                      <Truck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <div className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                          Site Material Deliveries & Offloading
                        </div>
                        <p className="text-xs text-slate-200 mt-0.5">{log.materialDeliveries}</p>
                      </div>
                    </div>
                  )}

                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Work Performed & Trade Milestones</span>
                    </h4>
                    <p className="text-sm text-slate-200 leading-relaxed bg-slate-950 p-4 rounded-xl border border-slate-800/80">
                      {log.workDone}
                    </p>
                  </div>

                  {log.issues && (
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-1.5 flex items-center gap-1.5">
                        <span>⚠️</span>
                        <span>Field Issues, Weather Interruptions & Delay Notes</span>
                      </h4>
                      <div className="text-xs text-amber-200 bg-amber-950/40 p-3.5 rounded-xl border border-amber-800/50 leading-relaxed">
                        {log.issues}
                      </div>
                    </div>
                  )}

                  {log.photos && log.photos.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <Camera className="w-3.5 h-3.5 text-amber-400" />
                        <span>Attached Site Photos ({log.photos.length})</span>
                      </h4>

                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {log.photos.map((photo) => (
                          <div
                            key={photo.id}
                            onClick={() => setActivePhotoModal(photo)}
                            className="group relative h-36 rounded-xl overflow-hidden border border-slate-800 bg-slate-950 cursor-pointer shadow-sm"
                          >
                            <img
                              src={photo.url}
                              alt={photo.caption}
                              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition" />
                            {photo.tradeTag && (
                              <span className="absolute top-2 left-2 text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-950/80 text-amber-300 border border-slate-800">
                                {photo.tradeTag}
                              </span>
                            )}
                            <div className="absolute bottom-2 left-2 right-2 text-white">
                              <p className="text-[11px] font-medium leading-tight truncate">
                                {photo.caption}
                              </p>
                              {photo.timestamp && (
                                <span className="text-[9px] text-slate-400">{photo.timestamp}</span>
                              )}
                            </div>
                            <div className="absolute top-2 right-2 p-1 rounded bg-slate-950/80 text-slate-300 opacity-0 group-hover:opacity-100 transition">
                              <Maximize2 className="w-3 h-3" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Photo Lightbox Modal */}
      {activePhotoModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setActivePhotoModal(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative max-h-[70vh] bg-black flex items-center justify-center">
              <img
                src={activePhotoModal.url}
                alt={activePhotoModal.caption}
                className="max-h-[70vh] w-auto object-contain"
              />
              <button
                type="button"
                onClick={() => setActivePhotoModal(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-slate-900/80 text-white hover:bg-slate-800 border border-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">{activePhotoModal.caption}</h3>
                <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                  {activePhotoModal.tradeTag && (
                    <span className="text-amber-400 font-semibold">{activePhotoModal.tradeTag}</span>
                  )}
                  {activePhotoModal.timestamp && (
                    <span>Captured at {activePhotoModal.timestamp}</span>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActivePhotoModal(null)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
