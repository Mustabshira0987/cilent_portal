import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePortal } from '../context/PortalContext';
import { useAuth } from '../auth/AuthContext';
import {
  FolderGit2, Search, UploadCloud, Download, MessageSquare,
  CheckCircle2, XCircle, Send, FileIcon, ChevronDown, Clock,
  X, Paperclip,
} from 'lucide-react';
import { usePageTitle } from '../hooks/usePageTitle';

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.35, ease: 'easeOut' } }),
};

// Store actual File objects in memory for download during the session
const fileObjectStore = new Map<string, File>();

export const DeliverablesPage: React.FC = () => {
  usePageTitle('Deliverables & Assets');
  const { user } = useAuth();
  const { projects, deliverables, addDeliverable, updateDeliverableStatus, addCommentToDeliverable } = usePortal();
  const isAgency = user?.role === 'agency';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState(projects[0]?.id || '');
  const [activeDeliverableId, setActiveDeliverableId] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [revisionFeedback, setRevisionFeedback] = useState('');
  const [showRevisionInput, setShowRevisionInput] = useState<string | null>(null);

  // Upload form state
  const [pickedFile, setPickedFile] = useState<File | null>(null);
  const [version, setVersion] = useState('v1.0');
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredDeliverables = deliverables.filter(d =>
    d.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.projectName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ── File picking ────────────────────────────────────────────────────────────
  const applyFile = useCallback((file: File) => {
    setPickedFile(file);
    setUploadError('');
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) applyFile(file);
  }, [applyFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) applyFile(file);
    // Reset input so same file can be re-selected
    e.target.value = '';
  }, [applyFile]);

  // ── Upload submit ───────────────────────────────────────────────────────────
  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickedFile) { setUploadError('Please select a file first.'); return; }
    if (!selectedProjectId) { setUploadError('Please select a project.'); return; }

    setIsUploading(true);
    setUploadSuccess('');
    setUploadError('');

    const fileSize = pickedFile.size > 1024 * 1024
      ? `${(pickedFile.size / (1024 * 1024)).toFixed(1)} MB`
      : `${(pickedFile.size / 1024).toFixed(0)} KB`;

    setTimeout(() => {
      const deliverableId = `d_${Date.now()}`;
      // Store the actual File object so we can offer a real download
      fileObjectStore.set(deliverableId, pickedFile);
      addDeliverable(selectedProjectId, pickedFile.name, version || 'v1.0', fileSize);
      setIsUploading(false);
      setPickedFile(null);
      setVersion('v1.0');
      setUploadSuccess(`"${pickedFile.name}" uploaded and queued for client review!`);
      setTimeout(() => setUploadSuccess(''), 5000);
    }, 1000);
  };

  // ── Download ────────────────────────────────────────────────────────────────
  const handleDownload = (deliverableId: string, fileName: string) => {
    const file = fileObjectStore.get(deliverableId);
    if (file) {
      const url = URL.createObjectURL(file);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      // For seeded/mock deliverables, create a placeholder text file
      const blob = new Blob([`Deliverable: ${fileName}\nThis is a mock file for demonstration.`], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handlePostComment = (deliverableId: string) => {
    if (!newComment.trim()) return;
    addCommentToDeliverable(deliverableId, newComment);
    setNewComment('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}>
        <h1 className="text-2xl font-extrabold tracking-tight text-white">Deliverables & Assets</h1>
        <p className="mt-1 text-sm" style={{ color: '#64748B' }}>
          Upload hand-offs, review feedback, trace versions, and secure approvals.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left: deliverables list ── */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={1} className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: '#475569' }} />
            <input
              type="text"
              placeholder="Search files by name or project..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-600 input-glow transition"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            />
          </motion.div>

          {filteredDeliverables.length === 0 ? (
            <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={2}
              className="glass rounded-2xl py-16 text-center">
              <FolderGit2 className="h-12 w-12 mx-auto mb-4" style={{ color: '#334155' }} />
              <h3 className="text-sm font-bold text-white">No deliverables found</h3>
              <p className="text-xs mt-1" style={{ color: '#475569' }}>
                {isAgency ? 'Upload an asset using the panel on the right.' : 'No files have been uploaded yet.'}
              </p>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {filteredDeliverables.map((file, i) => {
                const isExpanded = activeDeliverableId === file.id;
                return (
                  <motion.div
                    key={file.id}
                    variants={fadeUp} initial="hidden" animate="visible" custom={i * 0.4 + 2}
                    className="glass rounded-2xl overflow-hidden transition-all"
                    style={isExpanded ? { border: '1px solid rgba(99,102,241,0.3)', boxShadow: '0 0 20px rgba(99,102,241,0.08)' } : {}}
                  >
                    <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-3.5">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                          style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}>
                          <FileIcon className="h-5 w-5" style={{ color: '#818CF8' }} />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-white text-sm truncate">{file.fileName}</h4>
                          <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs" style={{ color: '#475569' }}>
                            <span style={{ color: '#818CF8', fontWeight: 600 }}>{file.version}</span>
                            <span>·</span>
                            <span className="truncate">{file.projectName}</span>
                            <span>·</span>
                            <span>{file.fileSize}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold badge-${file.status === 'approved' ? 'approved' : file.status === 'rejected' ? 'rejected' : 'review'}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${file.status === 'approved' ? 'bg-emerald-400' : file.status === 'rejected' ? 'bg-rose-400' : 'bg-amber-400'}`} />
                          {file.approvalStatus}
                        </span>
                        <button
                          onClick={() => handleDownload(file.id, file.fileName)}
                          title="Download file"
                          className="flex h-9 w-9 items-center justify-center rounded-xl transition hover:bg-indigo-500/10"
                          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', color: '#64748B' }}
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setActiveDeliverableId(isExpanded ? null : file.id)}
                          className="flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-semibold transition"
                          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', color: '#94A3B8' }}
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                          <span>{file.comments.length}</span>
                          <ChevronDown className={`h-3 w-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        </button>
                      </div>
                    </div>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="p-5 space-y-4"
                            style={{ borderTop: '1px solid rgba(99,102,241,0.1)', background: 'rgba(99,102,241,0.03)' }}>
                            {/* Client approval controls */}
                            {!isAgency && file.status === 'review' && (
                              <div className="rounded-xl p-4 space-y-3"
                                style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
                                <h5 className="text-xs font-bold text-white uppercase tracking-wider">Review Pending Deliverable</h5>
                                <p className="text-xs" style={{ color: '#94A3B8' }}>Inspect the file and approve or request revisions.</p>
                                <div className="flex flex-col sm:flex-row gap-2">
                                  <button
                                    onClick={() => updateDeliverableStatus(file.id, 'approved', 'Approved!')}
                                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold text-white transition"
                                    style={{ background: 'linear-gradient(135deg,#10B981,#059669)', boxShadow: '0 4px 12px rgba(16,185,129,0.3)' }}
                                  >
                                    <CheckCircle2 className="h-4 w-4" />Approve Deliverable
                                  </button>
                                  <button
                                    onClick={() => setShowRevisionInput(showRevisionInput === file.id ? null : file.id)}
                                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold transition"
                                    style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.25)', color: '#F43F5E' }}
                                  >
                                    <XCircle className="h-4 w-4" />Request Revisions
                                  </button>
                                </div>
                                {showRevisionInput === file.id && (
                                  <div className="space-y-2">
                                    <textarea
                                      rows={3}
                                      placeholder="Describe the adjustments needed..."
                                      value={revisionFeedback}
                                      onChange={e => setRevisionFeedback(e.target.value)}
                                      className="w-full rounded-xl p-3 text-xs text-white placeholder-slate-600 input-glow resize-none"
                                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                                    />
                                    <div className="flex justify-end">
                                      <button
                                        onClick={() => {
                                          updateDeliverableStatus(file.id, 'rejected', revisionFeedback);
                                          setShowRevisionInput(null);
                                          setRevisionFeedback('');
                                        }}
                                        className="rounded-xl px-4 py-1.5 text-xs font-semibold text-white"
                                        style={{ background: 'linear-gradient(135deg,#F43F5E,#E11D48)' }}
                                      >
                                        Submit Feedback
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Comments */}
                            <div className="space-y-2">
                              <h5 className="text-xs font-bold uppercase tracking-wider" style={{ color: '#475569' }}>Discussion History</h5>
                              {file.comments.length === 0 ? (
                                <p className="text-xs italic" style={{ color: '#334155' }}>No notes posted yet.</p>
                              ) : (
                                file.comments.map(comment => (
                                  <div key={comment.id} className="rounded-xl p-3 text-xs"
                                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="font-bold text-white">{comment.authorName}</span>
                                      <span style={{ color: '#334155', fontSize: '10px' }}>
                                        {new Date(comment.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                      </span>
                                    </div>
                                    <p style={{ color: '#94A3B8' }}>{comment.text}</p>
                                  </div>
                                ))
                              )}
                            </div>

                            <div className="flex gap-2">
                              <input
                                type="text"
                                placeholder="Type a review note..."
                                value={newComment}
                                onChange={e => setNewComment(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') handlePostComment(file.id); }}
                                className="flex-1 rounded-xl py-2.5 px-3 text-xs text-white placeholder-slate-600 input-glow"
                                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                              />
                              <button
                                onClick={() => handlePostComment(file.id)}
                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white btn-primary"
                              >
                                <Send className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Right: Upload panel ── */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={3} className="glass rounded-2xl p-6 h-fit">
          <div className="mb-5 pb-4" style={{ borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
            <h3 className="font-bold text-white flex items-center gap-2">
              <UploadCloud className="h-5 w-5" style={{ color: '#6366F1' }} />Upload Deliverable
            </h3>
            <p className="text-xs mt-1" style={{ color: '#64748B' }}>Queue layouts and designs for client approval.</p>
          </div>

          {!isAgency ? (
            <div className="rounded-xl p-4 text-center" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
              <Clock className="h-8 w-8 mx-auto mb-2" style={{ color: '#F59E0B' }} />
              <h4 className="text-xs font-bold" style={{ color: '#F59E0B' }}>Agency-Only Panel</h4>
              <p className="text-[11px] mt-1 leading-normal" style={{ color: '#92400E' }}>
                Only agency users can upload deliverables. Use the review controls on each file to approve or request changes.
              </p>
            </div>
          ) : (
            <form onSubmit={handleUploadSubmit} className="space-y-4">
              {/* Success */}
              <AnimatePresence>
                {uploadSuccess && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="rounded-xl p-3 text-xs font-semibold flex items-start gap-2"
                    style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#10B981' }}>
                    <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                    {uploadSuccess}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Error */}
              <AnimatePresence>
                {uploadError && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="rounded-xl p-3 text-xs font-semibold"
                    style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)', color: '#F43F5E' }}>
                    {uploadError}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Project selector */}
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: '#94A3B8' }}>Project Workspace</label>
                <select
                  value={selectedProjectId}
                  onChange={e => setSelectedProjectId(e.target.value)}
                  className="w-full rounded-xl py-2.5 px-3 text-xs text-white input-glow"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  {projects.length === 0
                    ? <option value="" style={{ background: '#0F172A' }}>No projects yet</option>
                    : projects.map(p => <option key={p.id} value={p.id} style={{ background: '#0F172A' }}>{p.name}</option>)
                  }
                </select>
              </div>

              {/* Version */}
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: '#94A3B8' }}>Version Tag</label>
                <input
                  type="text"
                  placeholder="v1.0"
                  value={version}
                  onChange={e => setVersion(e.target.value)}
                  className="w-full rounded-xl py-2.5 px-3 text-xs text-white placeholder-slate-600 input-glow"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                />
              </div>

              {/* Drop zone */}
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: '#94A3B8' }}>File *</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleFileInput}
                />
                <div
                  className="rounded-xl p-6 text-center cursor-pointer transition-all"
                  style={{
                    border: `2px dashed ${isDragging ? 'rgba(99,102,241,0.7)' : pickedFile ? 'rgba(16,185,129,0.5)' : 'rgba(99,102,241,0.25)'}`,
                    background: isDragging ? 'rgba(99,102,241,0.1)' : pickedFile ? 'rgba(16,185,129,0.05)' : 'rgba(99,102,241,0.04)',
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDragEnter={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  {pickedFile ? (
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <Paperclip className="h-4 w-4 shrink-0" style={{ color: '#10B981' }} />
                        <div className="text-left min-w-0">
                          <p className="text-xs font-bold truncate" style={{ color: '#10B981' }}>{pickedFile.name}</p>
                          <p className="text-[10px]" style={{ color: '#475569' }}>
                            {pickedFile.size > 1024 * 1024
                              ? `${(pickedFile.size / (1024 * 1024)).toFixed(1)} MB`
                              : `${(pickedFile.size / 1024).toFixed(0)} KB`}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={e => { e.stopPropagation(); setPickedFile(null); }}
                        className="shrink-0 rounded-lg p-1 hover:bg-white/10 transition"
                      >
                        <X className="h-3.5 w-3.5" style={{ color: '#64748B' }} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <UploadCloud className="h-8 w-8 mx-auto mb-2" style={{ color: isDragging ? '#818CF8' : '#475569' }} />
                      <p className="text-xs font-bold" style={{ color: isDragging ? '#A5B4FC' : '#64748B' }}>
                        {isDragging ? 'Drop to attach file' : 'Drag & drop or click to browse'}
                      </p>
                      <p className="text-[10px] mt-0.5" style={{ color: '#334155' }}>PDF, Figma, PNG, JPG, ZIP up to 100MB</p>
                    </>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={isUploading || !pickedFile}
                className="w-full btn-primary rounded-xl py-3 text-xs font-bold text-white disabled:opacity-50 transition flex items-center justify-center gap-2"
              >
                {isUploading ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Uploading…
                  </>
                ) : (
                  <><UploadCloud className="h-4 w-4" />Upload Deliverable</>
                )}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default DeliverablesPage;
