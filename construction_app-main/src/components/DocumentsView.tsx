import React, { useState } from 'react';
import { useApp } from '../lib/context';
import { ProjectDocument, DocumentCategory } from '../lib/types';
import {
  FolderClosed,
  Plus,
  Search,
  Download,
  Eye,
  Trash2,
  Building2,
  X,
  FileCheck,
  ShieldCheck,
} from 'lucide-react';

interface DocumentsViewProps {
  onOpenNewDocModal: () => void;
}

export function DocumentsView({ onOpenNewDocModal }: DocumentsViewProps) {
  const {
    currentUser,
    visibleProjects,
    documents,
    deleteDocument,
  } = useApp();

  const [filterProject, setFilterProject] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewDoc, setPreviewDoc] = useState<ProjectDocument | null>(null);

  const isClient = currentUser.role === 'client';

  const filteredDocs = documents.filter((doc) => {
    const matchesProject =
      filterProject === 'all'
        ? visibleProjects.some((p) => p.id === doc.projectId)
        : doc.projectId === filterProject;
    const matchesCategory = filterCategory === 'all' || doc.category === filterCategory;
    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.notes && doc.notes.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesProject && matchesCategory && matchesSearch;
  });

  const getCategoryBadge = (category: DocumentCategory) => {
    switch (category) {
      case 'nca_nema':
        return (
          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-900/80 text-amber-300 border border-amber-700/60">
            🛡️ NCA / NEMA License
          </span>
        );
      case 'county_permit':
        return (
          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-900/80 text-emerald-300 border border-emerald-700/60">
            🏛️ County Building Permit
          </span>
        );
      case 'structural_arch':
        return (
          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-900/80 text-blue-300 border border-blue-700/60">
            📐 BORAQS / EBK Stamped Drawings
          </span>
        );
      case 'bq_financial':
        return (
          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-purple-900/80 text-purple-300 border border-purple-700/60">
            📊 Priced Bill of Quantities (BQ)
          </span>
        );
      case 'contracts_safety':
        return (
          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-teal-900/80 text-teal-300 border border-teal-700/60">
            📝 DOSHS Safety & Sub Contracts
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
            📄 Document
          </span>
        );
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Are you sure you want to remove "${title}"?`)) {
      await deleteDocument(id);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20">
              Kenyan Jobsite Compliance Vault
            </span>
            <span className="text-xs text-slate-400">NCA, NEMA & County Approvals</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2 mt-1">
            <FolderClosed className="w-6 h-6 text-blue-400" />
            <span>Blueprints, Permits & Contract Repository</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Central repository for stamped structural drawings, NCA site registration certificates, NEMA licenses, and priced BQs.
          </p>
        </div>

        {!isClient && (
          <button
            type="button"
            onClick={onOpenNewDocModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition active:scale-95 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>+ Upload Site Document</span>
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
              placeholder="Search drawings, permits, BQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Sites ({visibleProjects.length})</option>
            {visibleProjects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.code} — {p.name}
              </option>
            ))}
          </select>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            <option value="nca_nema">NCA & NEMA Licenses</option>
            <option value="county_permit">County Building Permits</option>
            <option value="structural_arch">Structural & Arch Drawings</option>
            <option value="bq_financial">Bill of Quantities (BQ)</option>
            <option value="contracts_safety">DOSHS Safety & Contracts</option>
            <option value="other">Other Documents</option>
          </select>
        </div>

        <div className="text-xs text-slate-400 font-medium">
          {filteredDocs.length} approved document{filteredDocs.length === 1 ? '' : 's'} on record
        </div>
      </div>

      {/* Document Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocs.map((doc) => (
          <div
            key={doc.id}
            className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 space-y-4 shadow-sm transition flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs font-mono text-amber-400">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>{doc.projectName}</span>
                </div>
                {getCategoryBadge(doc.category)}
              </div>

              <div>
                <h3 className="text-sm font-bold text-white leading-snug">{doc.title}</h3>
                <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
                  <span className="font-mono">{doc.fileName}</span>
                  <span>•</span>
                  <span>{doc.fileSize}</span>
                </div>
              </div>

              {doc.notes && (
                <p className="text-xs text-slate-300 bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 leading-relaxed">
                  {doc.notes}
                </p>
              )}
            </div>

            <div className="space-y-3 pt-3 border-t border-slate-800/80">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Stamped: <strong>{doc.version}</strong></span>
                <span>Uploaded: {doc.uploadDate}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewDoc(doc)}
                  className="flex-1 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview Plan</span>
                </button>
                <a
                  href={doc.fileUrl}
                  download={doc.fileName}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-200 rounded-xl text-xs transition"
                  title="Download File"
                >
                  <Download className="w-3.5 h-3.5" />
                </a>
                {!isClient && (
                  <button
                    type="button"
                    onClick={() => handleDelete(doc.id, doc.title)}
                    className="p-2 bg-slate-950 hover:bg-rose-950/60 border border-slate-800 text-slate-400 hover:text-rose-400 rounded-xl text-xs transition"
                    title="Delete Document"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Plan Preview Modal */}
      {previewDoc && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setPreviewDoc(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl space-y-4 p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">{previewDoc.title}</h3>
                <p className="text-xs text-slate-400">
                  {previewDoc.fileName} • Version: {previewDoc.version} • Uploaded by {previewDoc.uploadedBy}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative h-[60vh] bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center border border-slate-800">
              <img
                src={previewDoc.fileUrl}
                alt={previewDoc.title}
                className="max-h-full max-w-full object-contain"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="text-xs text-slate-300">
                {previewDoc.notes || 'Verified statutory submission on file.'}
              </div>
              <a
                href={previewDoc.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs"
              >
                Open Original File
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
