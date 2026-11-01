import React from 'react';
import { useApp } from '../lib/context';

import {
  HardHat,
  PlusCircle,
  Menu,
  Database,
  Layers,
  LogOut,
} from 'lucide-react';

interface NavbarProps {
  onOpenMobileMenu: () => void;
  onOpenNewLogModal: () => void;
  onOpenNewProjectModal: () => void;
  onOpenNewExpenseModal: () => void;
  onOpenNewTaskModal: () => void;
}

export function Navbar({
  onOpenMobileMenu,
  onOpenNewLogModal,
  onOpenNewProjectModal,
  onOpenNewExpenseModal,
  onOpenNewTaskModal,
}: NavbarProps) {
  const {
    currentUser,
    selectedProjectId,
    setSelectedProjectId,
    visibleProjects,
    signOut,
    isSupabaseLive,
  } = useApp();

  const isClient = currentUser.role === 'client';
  const isSupervisor = currentUser.role === 'supervisor';
  const isAdmin = currentUser.role === 'admin';
  const isPM = currentUser.role === 'pm';

  return (
    <header className="sticky top-0 z-30 bg-slate-900 border-b border-slate-800 text-slate-100 shadow-md">
      <div className="px-3 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Mobile hamburger & Brand */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20 border border-amber-400/40">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-white">
                  Site<span className="text-amber-400">Flow</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 hidden sm:inline-block">
                  SaaS Field Pro
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Center: Active Project Filter / Scope */}
        {!isClient && (
          <div className="hidden md:flex items-center gap-2">
            <label className="text-xs text-slate-400 font-medium whitespace-nowrap">
              Active Jobsite:
            </label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none max-w-xs truncate font-medium"
            >
              {visibleProjects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.code} — {p.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Right: Quick Action Buttons, DB status, and Role Switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Action Button tailored to role */}
          {isSupervisor && (
            <button
              type="button"
              onClick={onOpenNewLogModal}
              className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs sm:text-sm shadow-sm transition active:scale-95"
            >
              <HardHat className="w-4 h-4" />
              <span>+ Daily Site Log</span>
            </button>
          )}

          {isAdmin && (
            <button
              type="button"
              onClick={onOpenNewProjectModal}
              className="hidden sm:flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs sm:text-sm shadow-sm transition active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ New Project</span>
            </button>
          )}

          {isPM && (
            <button
              type="button"
              onClick={onOpenNewTaskModal}
              className="hidden sm:flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold px-3 py-1.5 rounded-lg text-xs sm:text-sm shadow-sm transition active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ New Task</span>
            </button>
          )}

          {/* Database Live Pulse Indicator */}
          <div
            className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950 border border-slate-800 text-[11px] text-slate-400"
            title="Supabase database connection"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <Database className="w-3 h-3 text-slate-400" />
            <span>{isSupabaseLive ? 'Supabase Live' : 'Supabase'}</span>
          </div>

          <div className="hidden sm:block text-right"><div className="text-xs font-semibold text-slate-200">{currentUser.name}</div><div className="text-[10px] uppercase text-amber-400">{currentUser.role}</div></div>
          <button type="button" onClick={() => void signOut()} title="Sign out" className="p-2 rounded-lg border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800"><LogOut className="w-4 h-4"/></button>
        </div>
      </div>
    </header>
  );
}
