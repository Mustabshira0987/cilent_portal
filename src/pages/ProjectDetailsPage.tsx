import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { usePortal } from '../context/PortalContext';
import { ChevronLeft, Briefcase, Calendar, Clock, Plus, MessageSquare, FileIcon, Download, Activity, Send, CheckCircle2, Sliders } from 'lucide-react';
import { usePageTitle } from '../hooks/usePageTitle';

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.35, ease: 'easeOut' } }),
};

export const ProjectDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentRole, projects, deliverables, activities, addCommentToProject, addMilestone, toggleMilestoneStatus, setProjectProgress } = usePortal();

  const [commentText, setCommentText] = useState('');
  const [showMilestoneForm, setShowMilestoneForm] = useState(false);
  const [milestoneTitle, setMilestoneTitle] = useState('');
  const [milestoneDate, setMilestoneDate] = useState('');

  const project = projects.find(p => p.id === id);
  usePageTitle(project ? project.name : 'Project Details');

  if (!project) {
    return (
      <div className="glass rounded-2xl p-12 text-center max-w-xl mx-auto my-12">
        <Sliders className="h-12 w-12 mx-auto mb-4" style={{ color: '#334155' }} />
        <h3 className="font-bold text-white">Project Not Found</h3>
        <p className="text-xs mt-1" style={{ color: '#475569' }}>The requested portal does not exist or was deleted.</p>
        <button
          onClick={() => navigate(currentRole === 'agency' ? '/agency' : '/client')}
          className="mt-6 btn-primary rounded-xl px-5 py-2.5 text-xs font-semibold text-white"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const projectFiles = deliverables.filter(d => d.projectId === project.id);
  const projectActivities = activities.filter(a => a.projectId === project.id);

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addCommentToProject(project.id, commentText);
    setCommentText('');
  };

  const handleCreateMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!milestoneTitle || !milestoneDate) return;
    addMilestone(project.id, milestoneTitle, milestoneDate);
    setMilestoneTitle('');
    setMilestoneDate('');
    setShowMilestoneForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-5" style={{ borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
        <div className="flex items-center gap-3">
          <Link
            to={currentRole === 'agency' ? '/agency' : '/client'}
            className="flex h-9 w-9 items-center justify-center rounded-xl transition"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#94A3B8' }}
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-white">{project.name}</h1>
            <p className="text-xs mt-0.5" style={{ color: '#475569' }}>
              Client: <strong className="text-slate-300">{project.clientName}</strong> · Deadline: <strong className="text-slate-300">{project.deadline}</strong>
            </p>
          </div>
        </div>
        <span className={`self-start sm:self-center inline-flex items-center rounded-full px-3 py-1 text-xs font-bold badge-${project.priority}`}>
          {project.priority} priority
        </span>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left */}
        <div className="lg:col-span-2 space-y-6">
          {/* Brief */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={1} className="glass rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Briefcase className="h-4 w-4" style={{ color: '#6366F1' }} />Project Brief
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: '#94A3B8' }}>{project.description}</p>

            <div className="rounded-xl p-4" style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.12)' }}>
              <div className="flex items-center justify-between text-xs font-semibold mb-2">
                <span className="text-white">Task Progress</span>
                <span style={{ color: '#818CF8' }}>{project.progress}%</span>
              </div>
              <div className="h-2 w-full rounded-full overflow-hidden mb-3" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${project.progress}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full rounded-full progress-glow"
                  style={{ background: 'linear-gradient(90deg,#6366F1,#06B6D4)' }}
                />
              </div>
              {currentRole === 'agency' && (
                <div className="flex items-center gap-3 pt-2" style={{ borderTop: '1px solid rgba(99,102,241,0.1)' }}>
                  <label className="text-[10px] font-bold uppercase tracking-wider shrink-0" style={{ color: '#475569' }}>Adjust</label>
                  <input
                    type="range" min="0" max="100" value={project.progress}
                    onChange={e => setProjectProgress(project.id, parseInt(e.target.value))}
                    className="flex-1 h-1.5 rounded-lg appearance-none cursor-pointer"
                    style={{ accentColor: '#6366F1' }}
                  />
                </div>
              )}
            </div>
          </motion.div>

          {/* Files vault */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={2} className="glass rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3" style={{ borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
              <h3 className="font-bold text-white flex items-center gap-2">
                <FileIcon className="h-4 w-4" style={{ color: '#6366F1' }} />Files & Handoff Vault
              </h3>
              <Link to="/deliverables" className="text-xs font-semibold transition" style={{ color: '#818CF8' }}>Upload files →</Link>
            </div>
            <div className="space-y-2">
              {projectFiles.length === 0 ? (
                <p className="text-xs italic text-center py-6" style={{ color: '#334155' }}>No assets uploaded yet.</p>
              ) : (
                projectFiles.map(file => (
                  <div key={file.id} className="flex items-center justify-between rounded-xl p-3.5 transition" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" style={{ background: 'rgba(99,102,241,0.1)' }}>
                        <FileIcon className="h-4 w-4" style={{ color: '#818CF8' }} />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-white truncate">{file.fileName}</h4>
                        <p className="text-[10px] mt-0.5" style={{ color: '#475569' }}>{file.version} · {file.fileSize}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold badge-${file.status === 'approved' ? 'approved' : file.status === 'rejected' ? 'rejected' : 'review'}`}>
                        {file.approvalStatus}
                      </span>
                      <button
                        onClick={() => alert(`Downloading: ${file.fileName}`)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg transition"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', color: '#64748B' }}
                      >
                        <Download className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>

          {/* Milestones */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={3} className="glass rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3" style={{ borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
              <h3 className="font-bold text-white flex items-center gap-2">
                <Calendar className="h-4 w-4" style={{ color: '#6366F1' }} />Milestones Checklist
              </h3>
              {currentRole === 'agency' && (
                <button
                  onClick={() => setShowMilestoneForm(!showMilestoneForm)}
                  className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition"
                  style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', color: '#818CF8' }}
                >
                  <Plus className="h-3.5 w-3.5" />Add
                </button>
              )}
            </div>

            {showMilestoneForm && (
              <form onSubmit={handleCreateMilestone} className="rounded-xl p-4 space-y-3" style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)' }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text" placeholder="Milestone title" value={milestoneTitle}
                    onChange={e => setMilestoneTitle(e.target.value)} required
                    className="rounded-xl py-2 px-3 text-xs text-white placeholder-slate-600 input-glow"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                  />
                  <input
                    type="date" value={milestoneDate}
                    onChange={e => setMilestoneDate(e.target.value)} required
                    className="rounded-xl py-2 px-3 text-xs text-white input-glow"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', colorScheme: 'dark' }}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setShowMilestoneForm(false)} className="rounded-lg px-3 py-1.5 text-xs font-semibold" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', color: '#64748B' }}>Cancel</button>
                  <button type="submit" className="btn-primary rounded-lg px-4 py-1.5 text-xs font-semibold text-white">Schedule</button>
                </div>
              </form>
            )}

            <div className="space-y-2">
              {project.milestones.map(m => (
                <button
                  key={m.id}
                  onClick={() => toggleMilestoneStatus(project.id, m.id)}
                  className="w-full flex items-center justify-between rounded-xl p-3.5 text-left transition group"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
                >
                  <div className="flex items-center gap-3">
                    <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition ${
                      m.status === 'completed' ? 'border-emerald-500 bg-emerald-500' :
                      m.status === 'in-progress' ? 'border-indigo-500 bg-indigo-500/20' : 'border-slate-600'
                    }`}>
                      {m.status === 'completed'
                        ? <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                        : <Clock className="h-3.5 w-3.5" style={{ color: m.status === 'in-progress' ? '#818CF8' : '#475569' }} />
                      }
                    </span>
                    <div>
                      <span className={`text-xs font-semibold block ${m.status === 'completed' ? 'line-through' : 'text-white'}`} style={m.status === 'completed' ? { color: '#475569' } : {}}>
                        {m.title}
                      </span>
                      <span className="text-[10px] uppercase tracking-wider" style={{ color: '#334155' }}>{m.status}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold rounded-full px-2.5 py-0.5" style={{ background: 'rgba(255,255,255,0.05)', color: '#475569' }}>
                    Due {m.dueDate}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right */}
        <div className="space-y-6">
          {/* Discussion */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={4} className="glass rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-white flex items-center gap-2">
              <MessageSquare className="h-4 w-4" style={{ color: '#06B6D4' }} />Discussion Board
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {project.comments.length === 0 ? (
                <p className="text-xs italic text-center py-8" style={{ color: '#334155' }}>No messages yet. Start the conversation!</p>
              ) : (
                project.comments.map(c => (
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
            <form onSubmit={handlePostComment} className="flex gap-2">
              <input
                type="text" placeholder="Publish a message..." value={commentText}
                onChange={e => setCommentText(e.target.value)} required
                className="flex-1 rounded-xl py-2.5 px-3 text-xs text-white placeholder-slate-600 input-glow"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
              />
              <button type="submit" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white btn-primary">
                <Send className="h-4 w-4" />
              </button>
            </form>
          </motion.div>

          {/* Activity */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={5} className="glass rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Activity className="h-4 w-4" style={{ color: '#6366F1' }} />Project Activity
            </h3>
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {projectActivities.length === 0 ? (
                <p className="text-xs italic text-center py-6" style={{ color: '#334155' }}>No activity yet.</p>
              ) : (
                projectActivities.slice(0, 8).map(activity => (
                  <div key={activity.id} className="flex gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg" style={{ background: 'rgba(99,102,241,0.1)' }}>
                      <Clock className="h-3.5 w-3.5" style={{ color: '#6366F1' }} />
                    </div>
                    <div className="flex-1 min-w-0 pt-0.5">
                      <p className="text-xs font-semibold text-white">{activity.title}</p>
                      <p className="text-xs mt-0.5" style={{ color: '#475569' }}>{activity.description}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailsPage;
