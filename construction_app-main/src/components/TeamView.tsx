import React from 'react';
import { useApp } from '../lib/context';
import {
  Users,
  Shield,
  UserCheck,
  HardHat,
  Building2,
  Phone,
  Mail,
  Lock,
} from 'lucide-react';

export function TeamView() {
  const { currentUser, allUsers } = useApp();

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="w-4 h-4 text-indigo-400" />;
      case 'pm':
        return <UserCheck className="w-4 h-4 text-blue-400" />;
      case 'supervisor':
        return <HardHat className="w-4 h-4 text-amber-400" />;
      default:
        return <Building2 className="w-4 h-4 text-emerald-400" />;
    }
  };

  const permissionMatrix = [
    { feature: 'View All Company Financials & Budgets', admin: true, pm: true, supervisor: false, client: false },
    { feature: 'Create & Archive Projects', admin: true, pm: false, supervisor: false, client: false },
    { feature: 'Record Daily Site Logs & Photos', admin: true, pm: true, supervisor: true, client: false },
    { feature: 'Update Task Status & Flag Blockers', admin: true, pm: true, supervisor: true, client: false },
    { feature: 'Log Incurred Expense / Invoices', admin: true, pm: true, supervisor: true, client: false },
    { feature: 'Upload Approved Blueprints & Permits', admin: true, pm: true, supervisor: true, client: false },
    { feature: 'Read-Only Client Milestone Portal', admin: true, pm: true, supervisor: true, client: true },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
              Access Control & Organization
            </span>
            <span className="text-xs text-slate-400">Multi-Role Security</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2 mt-1">
            <Users className="w-6 h-6 text-amber-400" />
            <span>Team & Subcontractor Directory</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Role assignments, contact profiles, and jobsite field permissions.
          </p>
        </div>
      </div>

      {/* Team Cards Grid */}
      {allUsers.length === 0 ? <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 text-sm text-slate-400">No team profiles are available yet. New registered users will appear here when permitted by database access rules.</div> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {allUsers.map((user) => {
          const isActive = currentUser.uid === (user.uid);

          return (
            <div
              key={user.uid}
              className={`bg-slate-900 border rounded-2xl p-5 space-y-4 shadow-sm transition ${
                isActive ? 'border-amber-500 ring-1 ring-amber-500/40 bg-slate-800/80' : 'border-slate-800'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="relative">
                  {user.avatarUrl ? <img src={user.avatarUrl} alt={user.name} className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-700" /> : <div className="w-14 h-14 rounded-2xl bg-slate-800 border-2 border-slate-700 grid place-items-center text-lg font-bold text-amber-400">{user.name?.slice(0,1).toUpperCase()}</div>}
                  <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-slate-950 border border-slate-700">
                    {getRoleIcon(user.role)}
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                    user.role === 'admin'
                      ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                      : user.role === 'pm'
                      ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                      : user.role === 'supervisor'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  }`}
                >
                  {user.role}
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-white">{user.name}</h3>
                <p className="text-xs text-amber-400/90 font-medium">{user.companyTitle}</p>
              </div>

              <div className="space-y-1.5 text-xs text-slate-300 pt-2 border-t border-slate-800">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate">{user.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{user.phone || 'Phone not provided'}</span>
                </div>
              </div>

              {isActive && <div className="pt-2 border-t border-slate-800 text-xs text-amber-400 font-semibold">Signed-in account</div>}
            </div>
          );
        })}
      </div>}

      {/* Role-Based Access Control Matrix */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-400" />
            <span>Role-Based Permission Matrix (RBAC)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Clear separation of concerns enforced across Admin, Project Manager, Field Supervisor, and Client roles.
          </p>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Feature / Permission</th>
                <th className="py-3 px-4 text-center">Admin / Owner</th>
                <th className="py-3 px-4 text-center">Project Manager</th>
                <th className="py-3 px-4 text-center">Site Supervisor</th>
                <th className="py-3 px-4 text-center">Client Portal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
              {permissionMatrix.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40">
                  <td className="py-3 px-4 font-semibold text-white">{row.feature}</td>
                  <td className="py-3 px-4 text-center">
                    {row.admin ? (
                      <span className="inline-flex items-center text-emerald-400 font-bold">✓ Yes</span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {row.pm ? (
                      <span className="inline-flex items-center text-emerald-400 font-bold">✓ Yes</span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {row.supervisor ? (
                      <span className="inline-flex items-center text-emerald-400 font-bold">✓ Yes</span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {row.client ? (
                      <span className="inline-flex items-center text-emerald-400 font-bold">✓ Read-Only</span>
                    ) : (
                      <span className="text-rose-400 font-bold">✕ No Access</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
