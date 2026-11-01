import React, { useState } from 'react';
import { useApp } from '../lib/context';
import { ExpenseCategory } from '../lib/types';
import { BudgetHealthBadge } from './StatusBadge';
import { formatKES, formatKESCompact } from '../lib/formatters';
import {
  DollarSign,
  Search,
  Receipt,
  Trash2,
  Layers,
  Smartphone,
  Landmark,
} from 'lucide-react';

interface BudgetViewProps {
  onOpenNewExpenseModal: () => void;
}

export function BudgetView({ onOpenNewExpenseModal }: BudgetViewProps) {
  const {
    currentUser,
    visibleProjects,
    expenses,
    deleteExpense,
  } = useApp();

  const [filterProject, setFilterProject] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const isClient = currentUser.role === 'client';

  const activeProjects =
    filterProject === 'all'
      ? visibleProjects
      : visibleProjects.filter((p) => p.id === filterProject);

  const totalBudget = activeProjects.reduce((acc, p) => acc + p.budgetTotal, 0);

  const categoryBudgets: Record<ExpenseCategory, number> = {
    labor: activeProjects.reduce((acc, p) => acc + (p.budgetCategories?.labor || 0), 0),
    materials: activeProjects.reduce((acc, p) => acc + (p.budgetCategories?.materials || 0), 0),
    equipment: activeProjects.reduce((acc, p) => acc + (p.budgetCategories?.equipment || 0), 0),
    statutory: activeProjects.reduce((acc, p) => acc + (p.budgetCategories?.other || 0) * 0.4, 0),
    other: activeProjects.reduce((acc, p) => acc + (p.budgetCategories?.other || 0) * 0.6, 0),
  };

  const relevantExpenses = expenses.filter((e) =>
    activeProjects.some((p) => p.id === e.projectId)
  );

  const filteredExpenses = relevantExpenses.filter((e) => {
    const matchesCategory = filterCategory === 'all' || e.category === filterCategory;
    const matchesSearch =
      e.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.notes && e.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (e.invoiceNumber && e.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (e.mpesaRef && e.mpesaRef.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (e.projectName && e.projectName.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  const categoryActuals: Record<ExpenseCategory, number> = {
    labor: relevantExpenses
      .filter((e) => e.category === 'labor')
      .reduce((acc, e) => acc + e.amount, 0),
    materials: relevantExpenses
      .filter((e) => e.category === 'materials')
      .reduce((acc, e) => acc + e.amount, 0),
    equipment: relevantExpenses
      .filter((e) => e.category === 'equipment')
      .reduce((acc, e) => acc + e.amount, 0),
    statutory: relevantExpenses
      .filter((e) => e.category === 'statutory')
      .reduce((acc, e) => acc + e.amount, 0),
    other: relevantExpenses
      .filter((e) => e.category === 'other')
      .reduce((acc, e) => acc + e.amount, 0),
  };

  const totalSpent = Object.values(categoryActuals).reduce((a, b) => a + b, 0);
  const totalVariance = totalBudget - totalSpent;
  const burnPercent = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  const categoriesConfig: { key: ExpenseCategory; label: string; desc: string }[] = [
    { key: 'labor', label: 'Fundi & Vibarua Labor', desc: 'Masons, steel fixers, carpenters, plumbers, daily casual wages' },
    { key: 'materials', label: 'Materials & Hardware', desc: 'Bamburi cement, Devki rebars, Thika stones, MRM mabati, river sand' },
    { key: 'equipment', label: 'Plant & Equipment Lease', desc: 'Concrete boom pumps, 300L mixers, poker vibrators, scaffolding' },
    { key: 'statutory', label: 'NCA, NEMA & County Levies', desc: 'NCA compliance levies, NEMA licenses, Nairobi/Kiambu City approvals' },
  ];

  const handleDeleteExpense = async (id: string, vendor: string, amount: number) => {
    if (confirm(`Delete expense record for ${vendor} (${formatKES(amount)})?`)) {
      await deleteExpense(id);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
              Kenyan Construction Cost Accounting
            </span>
            <span className="text-xs text-slate-400">Priced BQ vs Site Actuals</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2 mt-1">
            <DollarSign className="w-6 h-6 text-emerald-400" />
            <span>Bill of Quantities (BQ) & Expense Ledger (KES)</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Running cost variance by category, supplier ETR invoices, and M-Pesa casual labor disbursements.
          </p>
        </div>

        {!isClient && (
          <button
            type="button"
            onClick={onOpenNewExpenseModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-md shadow-amber-500/20 transition active:scale-95 self-start sm:self-auto"
          >
            <Receipt className="w-4 h-4" />
            <span>+ Record Expense / M-Pesa</span>
          </button>
        )}
      </div>

      {/* Summary KPI Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-medium text-slate-400">Total Scoped BQ Budget</span>
          <div className="text-2xl sm:text-3xl font-black text-white mt-1">
            {formatKES(totalBudget)}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Across {activeProjects.length} Kenyan jobsite{activeProjects.length === 1 ? '' : 's'}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-medium text-slate-400">Actual Incurred Spend</span>
          <div className="text-2xl sm:text-3xl font-black text-amber-400 mt-1">
            {formatKES(totalSpent)}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {burnPercent}% of allocated contract BQ utilized
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-medium text-slate-400">Remaining BQ Variance</span>
          <div
            className={`text-2xl sm:text-3xl font-black mt-1 ${
              totalVariance >= 0 ? 'text-emerald-400' : 'text-rose-500'
            }`}
          >
            {formatKES(Math.abs(totalVariance))} {totalVariance >= 0 ? 'Under' : 'Over'}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {totalVariance >= 0 ? 'Cost savings buffer available' : 'Budget overrun alert'}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-medium text-slate-400">Financial Health Status</span>
          <div className="mt-2">
            <BudgetHealthBadge budgeted={totalBudget} actual={totalSpent} />
          </div>
          <div className="text-xs text-slate-400 mt-2">
            Updated live with M-Pesa & bank receipts
          </div>
        </div>
      </div>

      {/* Category Breakdown Cards */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-amber-400" />
          <span>Kenyan Category-by-Category Budget Tracking</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {categoriesConfig.map(({ key, label, desc }) => {
            const budgeted = categoryBudgets[key] || 0;
            const actual = categoryActuals[key] || 0;
            const variance = budgeted - actual;
            const percent = budgeted > 0 ? Math.min(100, Math.round((actual / budgeted) * 100)) : 0;
            const isOver = actual > budgeted;

            return (
              <div
                key={key}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white">{label}</h3>
                    <p className="text-[11px] text-slate-400 leading-tight mt-0.5">{desc}</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">Actual / Budget</span>
                    <span className="font-bold text-white truncate ml-2">
                      {formatKESCompact(actual)} / {formatKESCompact(budgeted)}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isOver
                          ? 'bg-rose-500'
                          : percent >= 85
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Variance:</span>
                  <span
                    className={`font-mono font-bold ${
                      isOver ? 'text-rose-400' : 'text-emerald-400'
                    }`}
                  >
                    {isOver ? `-${formatKESCompact(Math.abs(variance))}` : `+${formatKESCompact(variance)}`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter and Expense Ledger Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm space-y-4 p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Receipt className="w-4 h-4 text-amber-400" />
              <span>Incurred Subcontractor, Supplier & M-Pesa Ledger</span>
            </h3>
            <p className="text-xs text-slate-400">Detailed line-item Kenyan expenditure tracking</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[200px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search supplier, M-Pesa ref, invoice #..."
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
              <option value="all">All Sites</option>
              {visibleProjects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.code} — {p.name}
                </option>
              ))}
            </select>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="all">All Categories</option>
              <option value="labor">Labor (Fundis & Vibarua)</option>
              <option value="materials">Materials & Hardware</option>
              <option value="equipment">Plant & Equipment</option>
              <option value="statutory">Statutory & Levies (NCA/NEMA)</option>
              <option value="other">Other / Transport</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Site / Project</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Vendor / Payee</th>
                <th className="py-3 px-4">Payment & Ref</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Recorded By</th>
                <th className="py-3 px-4 text-right">Amount (KES)</th>
                {!isClient && <th className="py-3 px-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-slate-400 text-xs">
                    No expense records found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap">{exp.date}</td>
                    <td className="py-3 px-4 font-medium text-slate-200 whitespace-nowrap">
                      {exp.projectName}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-900 text-amber-300 border border-slate-800">
                        {exp.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-white whitespace-nowrap">{exp.vendor}</td>
                    <td className="py-3 px-4 font-mono text-[11px] whitespace-nowrap">
                      {exp.paymentMethod === 'mpesa' ? (
                        <span className="text-emerald-400 flex items-center gap-1">
                          <Smartphone className="w-3 h-3" /> {exp.mpesaRef || 'M-Pesa'}
                        </span>
                      ) : (
                        <span className="text-slate-400 flex items-center gap-1">
                          <Landmark className="w-3 h-3" /> {exp.invoiceNumber || exp.paymentMethod || 'EFT/Invoice'}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-300 max-w-xs truncate">{exp.notes || '—'}</td>
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap">{exp.recordedBy}</td>
                    <td className="py-3 px-4 text-right font-black text-white text-sm whitespace-nowrap">
                      {formatKES(exp.amount)}
                    </td>
                    {!isClient && (
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleDeleteExpense(exp.id, exp.vendor, exp.amount)}
                          className="p-1 rounded text-slate-400 hover:text-rose-400 transition"
                          title="Delete expense"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
