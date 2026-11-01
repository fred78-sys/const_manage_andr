import React from 'react';
import { ProjectStatus, TaskStatus, TaskPriority, IssueSeverity } from '../lib/types';
import { formatKES } from '../lib/formatters';
import { CheckCircle2, AlertTriangle, XCircle, Clock, AlertCircle, PlayCircle, ShieldCheck } from 'lucide-react';

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  switch (status) {
    case 'active':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          Active / On Track
        </span>
      );
    case 'delayed':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <AlertTriangle className="w-3 h-3 text-amber-500" />
          Schedule At Risk
        </span>
      );
    case 'completed':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
          <CheckCircle2 className="w-3 h-3 text-blue-500" />
          Completed
        </span>
      );
    case 'on_hold':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          <XCircle className="w-3 h-3 text-rose-500" />
          On Hold
        </span>
      );
    case 'planning':
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300">
          <Clock className="w-3 h-3 text-slate-500" />
          Pre-Construction / Planning
        </span>
      );
  }
}

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  switch (status) {
    case 'done':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800">
          <CheckCircle2 className="w-3 h-3" />
          Done
        </span>
      );
    case 'in_progress':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-800">
          <PlayCircle className="w-3 h-3" />
          In Progress
        </span>
      );
    case 'blocked':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-rose-100 text-rose-800 animate-pulse">
          <AlertCircle className="w-3 h-3" />
          Blocked
        </span>
      );
    case 'todo':
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700">
          <Clock className="w-3 h-3" />
          To Do
        </span>
      );
  }
}

export function TaskPriorityBadge({ priority }: { priority: TaskPriority }) {
  switch (priority) {
    case 'high':
      return (
        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
          High Priority
        </span>
      );
    case 'medium':
      return (
        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
          Medium
        </span>
      );
    case 'low':
    default:
      return (
        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-slate-50 text-slate-600 border border-slate-200">
          Low
        </span>
      );
  }
}

export function BudgetHealthBadge({ budgeted, actual }: { budgeted: number; actual: number }) {
  const variance = budgeted - actual;
  const ratio = actual / (budgeted || 1);

  if (ratio > 1.0) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
        <AlertCircle className="w-3 h-3 text-rose-600" />
        Over Budget (+{formatKES(Math.abs(variance))})
      </span>
    );
  } else if (ratio >= 0.9) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
        <AlertTriangle className="w-3 h-3 text-amber-600" />
        At Risk ({Math.round(ratio * 100)}% Spent)
      </span>
    );
  } else {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
        <ShieldCheck className="w-3 h-3 text-emerald-600" />
        On Track ({formatKES(variance)} under)
      </span>
    );
  }
}

export function IssueSeverityBadge({ severity }: { severity: IssueSeverity }) {
  switch (severity) {
    case 'critical':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-rose-600 text-white">
          <AlertCircle className="w-3 h-3" /> Critical / Stop-Work / NCA Inspection Alert
        </span>
      );
    case 'moderate':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-amber-500 text-white">
          <AlertTriangle className="w-3 h-3" /> Moderate Delay / Weather
        </span>
      );
    case 'minor':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-yellow-100 text-yellow-800">
          Minor Logged Issue
        </span>
      );
    case 'none':
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700">
          No Issues Reported
        </span>
      );
  }
}
