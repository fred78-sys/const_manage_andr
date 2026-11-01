import React, { useState } from 'react';
import { useApp } from '../../lib/context';
import { ExpenseCategory, PaymentMethod } from '../../lib/types';
import { X, Receipt, Smartphone, Landmark } from 'lucide-react';

interface NewExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewExpenseModal({ isOpen, onClose }: NewExpenseModalProps) {
  const { visibleProjects, selectedProjectId, createExpense, currentUser } = useApp();

  const [projectId, setProjectId] = useState(selectedProjectId || visibleProjects[0]?.id || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState<ExpenseCategory>('other');
  const [vendor, setVendor] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mpesa');
  const [mpesaRef, setMpesaRef] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendor.trim() || !amount || Number(amount) <= 0) {
      alert('Please enter a valid vendor and amount in KES.');
      return;
    }

    setIsSubmitting(true);
    try {
      await createExpense({
        projectId,
        date,
        category,
        vendor,
        amount: Number(amount),
        paymentMethod,
        mpesaRef: mpesaRef.trim() || undefined,
        invoiceNumber: invoiceNumber.trim() || undefined,
        notes: notes.trim() || undefined,
        recordedBy: currentUser.name,
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
      <div className="relative max-w-xl w-full bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-6">
        <div className="p-4 sm:p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Record Kenyan Jobsite Expense / M-Pesa</h3>
              <p className="text-xs text-slate-400">Post supplier ETR invoice or casual wage voucher</p>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                Site / Project *
              </label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:ring-2 focus:ring-emerald-500"
                required
              >
                {visibleProjects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.code} — {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                BQ Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:ring-2 focus:ring-emerald-500"
                required
              >
                <option value="materials">Materials & Hardware (Cement/Steel/Stones)</option>
                <option value="labor">Labor (Fundis & Vibarua Wages)</option>
                <option value="equipment">Plant & Machinery Lease</option>
                <option value="statutory">Statutory & Levies (NCA / NEMA / County)</option>
                <option value="other">Other / Transport</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                Vendor / Payee Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Bamburi Cement Ltd or Fundi Juma"
                value={vendor}
                onChange={(e) => setVendor(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-emerald-400 uppercase mb-1">
                Amount (KES / KSh) *
              </label>
              <input
                type="number"
                required
                min="1"
                placeholder="e.g. 450000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-slate-950 border border-emerald-500/80 rounded-xl px-3 py-2 text-xs text-white font-bold outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
              Payment Method & Kenyan Transaction References
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-300 mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white outline-none"
                >
                  <option value="mpesa">M-Pesa (Till / Paybill / Bulk B2C)</option>
                  <option value="bank_transfer">Bank RTGS / EFT / Pesalink</option>
                  <option value="cheque">Bank Cheque</option>
                  <option value="petty_cash">Site Petty Cash</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">
                  {paymentMethod === 'mpesa' ? 'M-Pesa Transaction Code' : 'Invoice / ETR / Cheque #'}
                </label>
                <input
                  type="text"
                  placeholder={paymentMethod === 'mpesa' ? 'Enter M-Pesa reference' : 'Enter invoice reference'}
                  value={paymentMethod === 'mpesa' ? mpesaRef : invoiceNumber}
                  onChange={(e) => {
                    if (paymentMethod === 'mpesa') setMpesaRef(e.target.value);
                    else setInvoiceNumber(e.target.value);
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono outline-none"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                Date of Incurrence
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                Recorded By
              </label>
              <input
                type="text"
                disabled
                value={currentUser.name}
                className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
              Description & BQ Item Notes
            </label>
            <textarea
              rows={2}
              placeholder="e.g. 450 bags Bamburi Tembo 42.5N cement for 4th floor slab pour..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
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
              className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs shadow-md"
            >
              {isSubmitting ? 'Recording...' : 'Post Expense (KES)'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
