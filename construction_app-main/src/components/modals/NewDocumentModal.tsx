import React, { useState } from 'react';
import { useApp } from '../../lib/context';
import { DocumentCategory } from '../../lib/types';
import { X, FolderClosed } from 'lucide-react';

interface NewDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewDocumentModal({ isOpen, onClose }: NewDocumentModalProps) {
  const { visibleProjects, selectedProjectId, createDocument, uploadDocumentFile, currentUser } = useApp();

  const [projectId, setProjectId] = useState(selectedProjectId || visibleProjects[0]?.id || '');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<DocumentCategory>('nca_nema');
  const [fileName, setFileName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [version, setVersion] = useState('');
  const [notes, setNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Please enter a document title.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (!selectedFile) throw new Error('Choose a file to upload.');
      const uploaded = await uploadDocumentFile(selectedFile, projectId);
      await createDocument({
        projectId,
        title,
        category,
        fileUrl: uploaded.fileUrl,
        storagePath: uploaded.storagePath,
        fileName: fileName.trim() || uploaded.fileName,
        fileSize: uploaded.fileSize,
        version,
        uploadedBy: currentUser.name,
        notes: notes.trim() || undefined,
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
      <div className="relative max-w-lg w-full bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-6">
        <div className="p-4 sm:p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <FolderClosed className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Upload Kenyan Site Document</h3>
              <p className="text-xs text-slate-400">Attach NCA certifications, County permits & BORAQS drawings</p>
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

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                Site / Project *
              </label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:ring-2 focus:ring-blue-500"
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
                Document Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as DocumentCategory)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="nca_nema">NCA Registration & NEMA EIA License</option>
                <option value="county_permit">County Government Building Permit</option>
                <option value="structural_arch">AAK / BORAQS Stamped Drawings</option>
                <option value="bq_financial">Approved Bill of Quantities (BQ)</option>
                <option value="contracts_safety">DOSHS Safety & Subcontractor Contracts</option>
                <option value="other">Other Site Documents</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
              Document Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. National Construction Authority Site Registration Board Approval"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Choose file to upload *</label>
            <input type="file" required onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} className="w-full text-xs text-slate-300 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-500/20 file:px-3 file:py-2 file:text-blue-300" />
            {selectedFile && <p className="mt-1 text-xs text-slate-400">{selectedFile.name} · {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                File Name
              </label>
              <input
                type="text"
                placeholder="Original file name (optional)"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                Stamp / Revision Version
              </label>
              <input
                type="text"
                placeholder="e.g. v2.1 (NCC Stamped)"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
              Notes & Compliance Conditions
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Approved by Nairobi City County Urban Planning Directorate with condition for 28-day concrete cube test records..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none"
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
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow-md"
            >
              {isSubmitting ? 'Uploading...' : 'Upload Document'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
