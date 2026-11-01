import React, { useState } from 'react';
import { useApp } from '../../lib/context';
import { ProjectStatus } from '../../lib/types';
import { X, Building2 } from 'lucide-react';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const KENYAN_COUNTIES = [
  'Nairobi',
  'Kiambu',
  'Mombasa',
  'Nakuru',
  'Machakos',
  'Kajiado',
  'Uasin Gishu (Eldoret)',
  'Kisumu',
  'Kilifi',
  'Nyeri',
  'Murang\'a',
  'Meru',
  'Laikipia',
];

const NCA_CATEGORIES = [
  'NCA 1 - Unlimited Value (Building Works)',
  'NCA 2 - Up to KES 500M',
  'NCA 3 - Up to KES 300M',
  'NCA 4 - Up to KES 200M',
  'NCA 5 - Up to KES 100M',
  'NCA 6 - Up to KES 50M',
  'NCA 7 - Up to KES 20M',
  'NCA 8 - Up to KES 10M',
];

export function NewProjectModal({ isOpen, onClose }: NewProjectModalProps) {
  const { createProject, allUsers } = useApp();

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [address, setAddress] = useState('');
  const [county, setCounty] = useState('');
  const [subCounty, setSubCounty] = useState('');
  const [lrNumber, setLrNumber] = useState('');
  const [ncaProjectNumber, setNcaProjectNumber] = useState('');
  const [ncaCategory, setNcaCategory] = useState(NCA_CATEGORIES[0]);
  const [nemaLicenseNumber, setNemaLicenseNumber] = useState('');
  const [countyPermitNumber, setCountyPermitNumber] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState<ProjectStatus>('planning');
  const [budgetTotal, setBudgetTotal] = useState(0); // KES 85M
  const [laborBudget, setLaborBudget] = useState(0);
  const [materialsBudget, setMaterialsBudget] = useState(0);
  const [equipmentBudget, setEquipmentBudget] = useState(0);
  const [otherBudget, setOtherBudget] = useState(0);
  const [pmId, setPmId] = useState('');
  const [supervisorId, setSupervisorId] = useState('');
  const pmName = allUsers.find((user) => user.uid === pmId)?.name || '';
  const supervisorName = allUsers.find((user) => user.uid === supervisorId)?.name || '';
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !clientName.trim()) {
      alert('Please fill in the project and client name.');
      return;
    }

    setIsSubmitting(true);
    try {
      await createProject({
        name,
        code: code || `SITE-${Date.now()}`, 
        clientName,
        clientEmail,
        address,
        county,
        subCounty,
        lrNumber: lrNumber || undefined,
        ncaProjectNumber: ncaProjectNumber || undefined,
        ncaCategory: ncaCategory.split(' - ')[0],
        nemaLicenseNumber: nemaLicenseNumber || undefined,
        countyPermitNumber: countyPermitNumber || undefined,
        startDate,
        endDate,
        status,
        budgetTotal: Number(budgetTotal),
        budgetCategories: {
          labor: Number(laborBudget),
          materials: Number(materialsBudget),
          equipment: Number(equipmentBudget),
          other: Number(otherBudget),
        },
        percentComplete: 0,
        pmId: pmId || undefined,
        pmName,
        supervisorId: supervisorId || undefined,
        supervisorName,
        description,
        coverImage: coverImage || undefined,
      });
      onClose();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'The operation could not be completed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="relative max-w-2xl w-full bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-6">
        <div className="p-4 sm:p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Register New Kenyan Construction Site</h3>
              <p className="text-xs text-slate-400">Initialize BQ contract budget, NCA permits & site team</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-slate-300">Project / Site Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Kilimani Executive Towers Block B"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Site Code</label>
              <input
                type="text"
                placeholder="e.g. SITE-001"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Client / Developer *</label>
              <input
                type="text"
                required
                placeholder="Enter the client or organisation name"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Client Contact Email</label>
              <input
                type="email"
                placeholder="e.g. info@client.co.ke"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Site Physical Address</label>
              <input
                type="text"
                placeholder="e.g. Argwings Kodhek Rd"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">County</label>
              <select
                value={county}
                onChange={(e) => setCounty(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:ring-2 focus:ring-amber-500 outline-none"
              >
                <option value="">Select a county</option>
                {KENYAN_COUNTIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Area / Sub-County</label>
              <input
                type="text"
                placeholder="e.g. Kilimani / Westlands"
                value={subCounty}
                onChange={(e) => setSubCounty(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>
          </div>

          {/* Statutory Compliance Fields */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
              Kenyan Statutory & Regulatory Identifiers
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-slate-300">NCA Project Reg. Number</label>
                <input
                  type="text"
                  placeholder="Enter the issued NCA registration number"
                  value={ncaProjectNumber}
                  onChange={(e) => setNcaProjectNumber(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-300">NCA Contractor Category</label>
                <select
                  value={ncaCategory}
                  onChange={(e) => setNcaCategory(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white outline-none"
                >
                  {NCA_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-300">LR Number (Land Reference)</label>
                <input
                  type="text"
                  placeholder="e.g. LR No. 209/18942/2"
                  value={lrNumber}
                  onChange={(e) => setLrNumber(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-300">County Building Permit No.</label>
                <input
                  type="text"
                  placeholder="Enter the issued county permit number"
                  value={countyPermitNumber}
                  onChange={(e) => setCountyPermitNumber(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white outline-none"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Project Manager (PM)</label>
              <select value={pmId} onChange={(e) => setPmId(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none"><option value="">Unassigned</option>{allUsers.filter((user) => user.role === 'pm' || user.role === 'admin').map((user) => <option key={user.uid} value={user.uid}>{user.name} ({user.role})</option>)}</select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Site Agent / Superintendent</label>
              <select value={supervisorId} onChange={(e) => setSupervisorId(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none"><option value="">Unassigned</option>{allUsers.filter((user) => user.role === 'supervisor' || user.role === 'admin').map((user) => <option key={user.uid} value={user.uid}>{user.name} ({user.role})</option>)}</select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Groundbreaking Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Target Handover Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
              />
            </div>
          </div>

          {/* BQ Financial Budgeting in KES */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                Priced Bill of Quantities (BQ) Total & Allocations (KES)
              </span>
              <span className="text-xs font-mono font-bold text-white">
                Total: KES {Number(budgetTotal).toLocaleString('en-KE')}
              </span>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-300">Total Scoped Budget (KES)</label>
              <input
                type="number"
                value={budgetTotal}
                onChange={(e) => setBudgetTotal(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-bold outline-none"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div>
                <label className="text-slate-400">Labor (KES)</label>
                <input
                  type="number"
                  value={laborBudget}
                  onChange={(e) => setLaborBudget(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white text-xs"
                />
              </div>
              <div>
                <label className="text-slate-400">Materials (KES)</label>
                <input
                  type="number"
                  value={materialsBudget}
                  onChange={(e) => setMaterialsBudget(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white text-xs"
                />
              </div>
              <div>
                <label className="text-slate-400">Equipment (KES)</label>
                <input
                  type="number"
                  value={equipmentBudget}
                  onChange={(e) => setEquipmentBudget(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white text-xs"
                />
              </div>
              <div>
                <label className="text-slate-400">Statutory / Other</label>
                <input
                  type="number"
                  value={otherBudget}
                  onChange={(e) => setOtherBudget(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white text-xs"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Scope of Work / Description</label>
            <textarea
              rows={3}
              placeholder="e.g. 12-story reinforced concrete residential apartment with basement parking, Thika machine cut walling, and MRM roofing..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:ring-2 focus:ring-amber-500 outline-none resize-none"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs shadow-md"
            >
              {isSubmitting ? 'Creating...' : 'Register Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
