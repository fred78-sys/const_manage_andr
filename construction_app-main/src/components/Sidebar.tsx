import React from 'react';
import { useApp } from '../lib/context';
import {
  LayoutDashboard,
  Building2,
  CheckSquare,
  ClipboardList,
  DollarSign,
  FolderClosed,
  Users,
  Eye,
  Camera,
  HardHat,
  X,
} from 'lucide-react';

export type NavigationTab =
  | 'dashboard'
  | 'projects'
  | 'tasks'
  | 'daily-logs'
  | 'budget'
  | 'documents'
  | 'team'
  | 'client-portal';

interface SidebarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ currentTab, onSelectTab, isOpen, onClose }: SidebarProps) {
  const { currentUser, tasks, dailyLogs, visibleProjects } = useApp();

  const isClient = currentUser.role === 'client';
  const isSupervisor = currentUser.role === 'supervisor';

  const pendingTasksCount = tasks.filter((t) => t.status === 'todo' || t.status === 'in_progress').length;
  const blockedTasksCount = tasks.filter((t) => t.status === 'blocked').length;

  const getNavItems = () => {
    if (isClient) {
      return [
        {
          id: 'client-portal' as NavigationTab,
          label: 'Client Project View',
          icon: Eye,
          badge: 'Live',
          badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
        },
        {
          id: 'daily-logs' as NavigationTab,
          label: 'Field Logs & Photos',
          icon: Camera,
          badge: `${dailyLogs.length} updates`,
          badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        },
        {
          id: 'documents' as NavigationTab,
          label: 'Approved Documents',
          icon: FolderClosed,
        },
      ];
    }

    if (isSupervisor) {
      return [
        {
          id: 'dashboard' as NavigationTab,
          label: 'Jobsite Overview',
          icon: HardHat,
        },
        {
          id: 'daily-logs' as NavigationTab,
          label: 'Daily Field Logs',
          icon: ClipboardList,
          badge: 'Daily Entry',
          badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
        },
        {
          id: 'tasks' as NavigationTab,
          label: 'Site Tasks & Trades',
          icon: CheckSquare,
          badge: blockedTasksCount > 0 ? `${blockedTasksCount} Blocked` : undefined,
          badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
        },
        {
          id: 'projects' as NavigationTab,
          label: 'Project Details',
          icon: Building2,
        },
        {
          id: 'documents' as NavigationTab,
          label: 'Blueprints & Specs',
          icon: FolderClosed,
        },
        {
          id: 'budget' as NavigationTab,
          label: 'Expenses & Receipts',
          icon: DollarSign,
        },
      ];
    }

    return [
      {
        id: 'dashboard' as NavigationTab,
        label: 'Dashboard',
        icon: LayoutDashboard,
      },
      {
        id: 'projects' as NavigationTab,
        label: 'Projects',
        icon: Building2,
        badge: `${visibleProjects.length}`,
      },
      {
        id: 'tasks' as NavigationTab,
        label: 'Tasks & Schedule',
        icon: CheckSquare,
        badge: blockedTasksCount > 0 ? `${blockedTasksCount} Blocked` : `${pendingTasksCount}`,
        badgeColor: blockedTasksCount > 0 ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' : undefined,
      },
      {
        id: 'daily-logs' as NavigationTab,
        label: 'Daily Field Logs',
        icon: ClipboardList,
        badge: `${dailyLogs.length}`,
      },
      {
        id: 'budget' as NavigationTab,
        label: 'Budget vs Actual',
        icon: DollarSign,
        badge: 'Financials',
        badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      },
      {
        id: 'documents' as NavigationTab,
        label: 'Documents & Plans',
        icon: FolderClosed,
      },
      {
        id: 'team' as NavigationTab,
        label: 'Team & Directory',
        icon: Users,
      },
      {
        id: 'client-portal' as NavigationTab,
        label: 'Client Portal Preview',
        icon: Eye,
        badge: 'Guest View',
        badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      },
    ];
  };

  const navItems = getNavItems();

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed lg:sticky top-16 left-0 bottom-0 z-40 w-64 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } h-[calc(100vh-4rem)] overflow-y-auto`}
      >
        <div className="p-4 flex items-center justify-between lg:hidden border-b border-slate-800">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Navigation</span>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3.5 m-3 rounded-xl bg-slate-950 border border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs border border-amber-500/30 shrink-0">
              {currentUser.name.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-white truncate">{currentUser.name}</div>
              <div className="text-[11px] text-slate-400 truncate capitalize font-medium">
                {currentUser.role === 'admin' ? 'Admin / Owner' : currentUser.role.toUpperCase()}
              </div>
            </div>
          </div>
          {isClient && (
            <div className="mt-2 text-[11px] text-emerald-400 bg-emerald-950/60 px-2 py-1 rounded border border-emerald-800/40">
              🔒 Read-Only Client Portal Access
            </div>
          )}
          {isSupervisor && (
            <div className="mt-2 text-[11px] text-amber-400 bg-amber-950/60 px-2 py-1 rounded border border-amber-800/40">
              📱 Field Jobsite Superintendent View
            </div>
          )}
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            const ItemIcon = item.icon;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSelectTab(item.id);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition group ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <ItemIcon
                    className={`w-4 h-4 ${
                      isActive ? 'text-slate-950' : 'text-slate-400 group-hover:text-amber-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      isActive
                        ? 'bg-slate-950 text-amber-400 border-amber-400/40'
                        : item.badgeColor || 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-3.5 m-3 border-t border-slate-800/80 text-[11px] text-slate-400 space-y-1">
          <div className="flex items-center justify-between">
            <span>SiteFlow v2.4</span>
            <span className="text-emerald-400 font-semibold">● Online</span>
          </div>
          <p className="text-slate-400 text-[10px] leading-tight">
            System of record for General Contractors & Field Superintendents.
          </p>
        </div>
      </aside>
    </>
  );
}
