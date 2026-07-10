import React, { useState } from 'react';
import { usePortal } from '../context/PortalContext';
import { motion } from 'framer-motion';
import { Briefcase, Clock, FileDown, CheckCircle2, MessageSquare, ArrowUpRight, Send, AlertCircle, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePageTitle } from '../hooks/usePageTitle';

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4, ease: 'easeOut' } }),
};

export const ClientDashboard: React.FC = () => {
  usePageTitle('Client Dashboard');
  const { projects, deliverables, updateDeliverableStatus, addCommentToProject } = usePortal();

  const pendingReviews = deliverables.filter(d => d.status === 'review');
  const [commentText, setCommentText] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState(projects[0]?.id || '');
  const activeProject = projects.find(p => p.id === selectedProjectId) || projects[0];

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !activeProject) return;
    addCommentToProject(activeProject.id, commentText);
    setCommentText('');
  };

  return (
    <div className="space-y-6">
      {/* Hero header */}
      <motion.div
        variants={fadeUp} initial="hidden" animate="visible" custom={0}
        className="relative overflow-hidden rounded-2xl p-6 md:p-8"
        style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(6,182,212,0.1) 100%)', border: '1px solid rgba(99,102,241,0.25)' }}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 h-48 w-48 rounded-full opacity-20 blur-3xl" style={{ background: 'radial-gradient(circle, #6366F1, transparent)' }} />
        </div>
        <div className="relative">
          <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold mb-3" style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#A5B4FC' }}>
            <Sparkles className="h-3 w-3" />Client Collaboration Space
          </span>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">Welcome, Acme Client Partner</h1>
          <p className="mt-1 text-sm" style={{ color: '#94A3B8' }}>
            Review design hand-offs, leave notes, and sign off on deliverables instantly.
          </p>
        </div>
      </motion.div>

      {/* Pending reviews */}
      {pendingReviews.length > 0 && (
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={1} className="glass rounded-2xl p-6" style={{ border: '1px solid rgba(245,158,11,0.25)' }}>
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="h-5 w-5" style={{ color: '#F59E0B' }} />
            <h3 className="font-bold text-white">Handoffs Awaiting Your Review</h3>
            <span className="ml-auto rounded-full px-2.5 py-0.5 text-xs font-bold" style={{ background: 'rgba(245,158,11,0.15)', color: '#F59E0B' }}>
              {pendingReviews.length} pending
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pendingReviews.map(file => (
              <div key={file.id} className="rounded-xl p-4 flex flex-col justify-between gap-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-bold" style={{ color: '#818CF8' }}>{file.version}</span>
                    <span className="text-[10px] font-semibold" style={{ color: '#475569' }}>{file.fileSize}</span>
                  </div>
                  <h4 className="font-bold text-white text-sm truncate">{file.fileName}</h4>
                  <p className="text-xs truncate mt-0.5" style={{ color: '#475569' }}>{file.projectName}</p>
                </div>
                <div className="flex gap-2 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <button
                    onClick={() => updateDeliverableStatus(file.id, 'approved', 'Approved!')}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold text-white transition"
                    style={{ background: 'linear-gradient(135deg,#10B981,#059669)', boxShadow: '0 4px 12px rgba(16,185,129,0.3)' }}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />Approve
                  </button>
                  <Link
                    to="/deliverables"
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition"
                    style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)', color: '#F43F5E' }}
                  >
                    Request Changes
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Project status */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={2} className="lg:col-span-2 glass rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5" style={{ borderBottom: '1px solid rgba(99,102,241,0.1)', paddingBottom: '1.25rem' }}>
            <div>
              <h3 className="font-bold text-white">Project Status & Timelines</h3>
              <p className="text-xs mt-0.5" style={{ color: '#64748B' }}>Select a workspace to examine milestone status</p>
            </div>
            <select
              value={selectedProjectId}
              onChange={e => setSelectedProjectId(e.target.value)}
              className="rounded-xl py-2 px-3 text-xs text-white input-glow transition"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(99,102,241,0.2)' }}
            >
              {projects.map(p => <option key={p.id} value={p.id} style={{ background: '#0F172A' }}>{p.name}</option>)}
            </select>
          </div>

          {activeProject ? (
            <div className="space-y-5">
              {/* Progress */}
              <div className="rounded-xl p-4" style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.12)' }}>
                <div className="flex items-center justify-between text-xs font-semibold mb-2">
                  <span className="flex items-center gap-1.5 text-white"><Briefcase className="h-3.5 w-3.5" style={{ color: '#6366F1' }} />Work Progress</span>
                  <span style={{ color: '#818CF8' }}>{activeProject.progress}% Complete</span>
                </div>
                <div className="h-2 w-full rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${activeProject.progress}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="h-full rounded-full progress-glow"
                    style={{ background: 'linear-gradient(90deg,#6366F1,#06B6D4)' }}
                  />
                </div>
              </div>

              {/* Milestones */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#475569' }}>Milestones Checklist</h4>
                <div className="space-y-2">
                  {activeProject.milestones.map(m => (
                    <div key={m.id} className="flex items-center justify-between rounded-xl p-3 transition" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div className="flex items-center gap-3">
                        <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition ${
                          m.status === 'completed' ? 'border-emerald-500 bg-emerald-500/20' :
                          m.status === 'in-progress' ? 'border-indigo-500 bg-indigo-500/20' : 'border-slate-600 bg-transparent'
                        }`}>
                          {m.status === 'completed'
                            ? <CheckCircle2 className="h-3.5 w-3.5" style={{ color: '#10B981' }} />
                            : <Clock className="h-3.5 w-3.5" style={{ color: m.status === 'in-progress' ? '#6366F1' : '#475569' }} />
                          }
                        </span>
                        <span className={`text-xs font-semibold ${m.status === 'completed' ? 'line-through' : 'text-white'}`} style={m.status === 'completed' ? { color: '#475569' } : {}}>
                          {m.title}
                        </span>
                      </div>
                      <span className="text-[10px] font-semibold rounded-full px-2 py-0.5" style={{ background: 'rgba(255,255,255,0.05)', color: '#475569' }}>
                        Due {m.dueDate}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <Link to={`/projects/${activeProject.id}`} className="inline-flex items-center gap-1.5 text-xs font-bold transition" style={{ color: '#818CF8' }}>
                  <span>Examine files & comments</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ) : (
            <p className="text-xs" style={{ color: '#475569' }}>No active workspaces assigned yet.</p>
          )}
        </motion.div>

        {/* Right: Forum */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={3} className="glass rounded-2xl p-6 flex flex-col">
          <div className="mb-4" style={{ borderBottom: '1px solid rgba(99,102,241,0.1)', paddingBottom: '1rem' }}>
            <h3 className="font-bold text-white flex items-center gap-2">
              <MessageSquare className="h-4 w-4" style={{ color: '#06B6D4' }} />Portal Forum
            </h3>
            <p className="text-xs mt-0.5" style={{ color: '#64748B' }}>Leave design notes or timeline questions</p>
          </div>

          {activeProject && (
            <div className="flex flex-col flex-1 gap-3">
              <div className="flex-1 space-y-2 max-h-64 overflow-y-auto pr-1">
                {activeProject.comments.length === 0 ? (
                  <p className="text-xs italic text-center py-8" style={{ color: '#334155' }}>No thread entries. Type below to begin.</p>
                ) : (
                  activeProject.comments.slice(-6).map(c => (
                    <div key={c.id} className="rounded-xl p-3 text-xs" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold" style={{ color: c.authorRole === 'agency' ? '#818CF8' : '#06B6D4' }}>{c.authorName}</span>
                        <span style={{ color: '#334155', fontSize: '10px' }}>{new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p style={{ color: '#94A3B8' }}>{c.text}</p>
                    </div>
                  ))
                )}
              </div>
              <form onSubmit={handlePostComment} className="flex gap-2 mt-auto">
                <input
                  type="text"
                  placeholder="Ask a question or state feedback..."
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  required
                  className="flex-1 rounded-xl py-2.5 px-3 text-xs text-white placeholder-slate-600 input-glow transition"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                />
                <button type="submit" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white btn-primary">
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ClientDashboard;
