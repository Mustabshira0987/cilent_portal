import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  ClipboardCheck, CheckCircle2, XCircle, Clock, Loader2, Flag,
  User, Calendar, Tag, Paperclip, AlertCircle, Sparkles,
} from 'lucide-react';
import { useTask } from '../context/TaskContext';
import { useAuth } from '../auth/AuthContext';
import { usePageTitle } from '../hooks/usePageTitle';
import { Task, TaskStatus, TaskPriority } from '../types';

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.35, ease: 'easeOut' } }),
};

const STATUS_CONFIG: Record<TaskStatus, { color: string; bg: string; label: string; icon: React.ReactNode }> = {
  'Pending Acceptance': { color: '#F59E0B', bg: 'rgba(245,158,11,0.15)', label: 'Pending Acceptance', icon: <Clock className="h-3.5 w-3.5" /> },
  'Accepted':           { color: '#10B981', bg: 'rgba(16,185,129,0.15)', label: 'Accepted',           icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  'Rejected':           { color: '#F43F5E', bg: 'rgba(244,63,94,0.15)',  label: 'Rejected',           icon: <XCircle className="h-3.5 w-3.5" /> },
  'In Progress':        { color: '#6366F1', bg: 'rgba(99,102,241,0.15)', label: 'In Progress',        icon: <Loader2 className="h-3.5 w-3.5" /> },
  'Completed':          { color: '#818CF8', bg: 'rgba(129,140,248,0.15)',label: 'Completed',          icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
};

const PRIORITY_COLOR: Record<TaskPriority, string> = {
  Low: '#818CF8', Medium: '#F59E0B', High: '#F43F5E', Critical: '#EF4444',
};

export const ClientTasksPage: React.FC = () => {
  usePageTitle('My Tasks');
  const { user } = useAuth();
  const { getTasksForClient, acceptTask, rejectTask } = useTask();

  const tasks = user ? getTasksForClient(user.id) : [];

  const [acceptConfirm, setAcceptConfirm] = useState<Task | null>(null);
  const [rejectTarget, setRejectTarget] = useState<Task | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectError, setRejectError] = useState('');

  const handleAccept = () => {
    if (!acceptConfirm) return;
    acceptTask(acceptConfirm.id);
    toast.success('Task accepted! The agency has been notified.');
    setAcceptConfirm(null);
  };

  const handleReject = () => {
    if (!rejectTarget) return;
    if (!rejectReason.trim()) { setRejectError('Please provide a rejection reason.'); return; }
    rejectTask(rejectTarget.id, rejectReason.trim());
    toast.error('Task rejected. The agency has been notified.');
    setRejectTarget(null);
    setRejectReason('');
    setRejectError('');
  };

  const pending = tasks.filter(t => t.status === 'Pending Acceptance');
  const others = tasks.filter(t => t.status !== 'Pending Acceptance');

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl btn-primary">
            <ClipboardCheck className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">My Tasks</h1>
            <p className="text-sm" style={{ color: '#64748B' }}>Review and respond to tasks assigned by your agency</p>
          </div>
        </div>
      </motion.div>

      {/* Empty state */}
      {tasks.length === 0 && (
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={1}
          className="glass rounded-2xl p-16 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl" style={{ background: 'rgba(99,102,241,0.1)' }}>
            <Sparkles className="h-8 w-8" style={{ color: '#6366F1' }} />
          </div>
          <h3 className="text-sm font-bold text-white">No tasks assigned yet</h3>
          <p className="mt-1 text-xs" style={{ color: '#475569' }}>Your agency will assign tasks here. Check back soon!</p>
        </motion.div>
      )}

      {/* Pending tasks — action required */}
      {pending.length > 0 && (
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={1}>
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="h-4 w-4" style={{ color: '#F59E0B' }} />
            <h2 className="text-sm font-bold text-white">Action Required</h2>
            <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: 'rgba(245,158,11,0.15)', color: '#F59E0B' }}>
              {pending.length} pending
            </span>
          </div>
          <div className="space-y-3">
            {pending.map((task, i) => (
              <TaskCard key={task.id} task={task} index={i}
                onAccept={() => setAcceptConfirm(task)}
                onReject={() => { setRejectTarget(task); setRejectReason(''); setRejectError(''); }}
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* Other tasks */}
      {others.length > 0 && (
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={2}>
          <h2 className="text-sm font-bold text-white mb-3">All Tasks</h2>
          <div className="space-y-3">
            {others.map((task, i) => (
              <TaskCard key={task.id} task={task} index={i} />
            ))}
          </div>
        </motion.div>
      )}

      {/* Accept confirm dialog */}
      <AnimatePresence>
        {acceptConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
            onClick={() => setAcceptConfirm(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="glass rounded-2xl p-6 w-full max-w-sm space-y-4"
              style={{ border: '1px solid rgba(16,185,129,0.3)' }}>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl" style={{ background: 'rgba(16,185,129,0.15)' }}>
                  <CheckCircle2 className="h-6 w-6" style={{ color: '#10B981' }} />
                </div>
                <div>
                  <h3 className="font-bold text-white">Accept Task?</h3>
                  <p className="text-xs mt-0.5" style={{ color: '#64748B' }}>You are committing to complete this task.</p>
                </div>
              </div>
              <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <p className="text-sm font-bold text-white">{acceptConfirm.title}</p>
                <p className="text-xs mt-1" style={{ color: '#64748B' }}>Due: {acceptConfirm.dueDate}</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setAcceptConfirm(null)}
                  className="flex-1 rounded-xl py-2.5 text-sm font-semibold transition"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#94A3B8' }}>
                  Cancel
                </button>
                <button onClick={handleAccept}
                  className="flex-1 rounded-xl py-2.5 text-sm font-bold text-white transition"
                  style={{ background: 'linear-gradient(135deg,#10B981,#059669)', boxShadow: '0 4px 15px rgba(16,185,129,0.4)' }}>
                  ✅ Accept Task
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reject dialog */}
      <AnimatePresence>
        {rejectTarget && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
            onClick={() => setRejectTarget(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="glass rounded-2xl p-6 w-full max-w-sm space-y-4"
              style={{ border: '1px solid rgba(244,63,94,0.3)' }}>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl" style={{ background: 'rgba(244,63,94,0.1)' }}>
                  <XCircle className="h-6 w-6" style={{ color: '#F43F5E' }} />
                </div>
                <div>
                  <h3 className="font-bold text-white">Reject Task</h3>
                  <p className="text-xs mt-0.5" style={{ color: '#64748B' }}>Please explain why you are rejecting this task.</p>
                </div>
              </div>
              <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <p className="text-sm font-bold text-white">{rejectTarget.title}</p>
              </div>
              <div>
                <textarea value={rejectReason} onChange={e => { setRejectReason(e.target.value); setRejectError(''); }}
                  rows={3} placeholder="e.g. Missing required information, timeline conflict…"
                  className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 input-glow transition resize-none"
                  style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${rejectError ? 'rgba(244,63,94,0.5)' : 'rgba(255,255,255,0.08)'}` }} />
                {rejectError && <p className="mt-1 text-xs" style={{ color: '#F43F5E' }}>{rejectError}</p>}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setRejectTarget(null)}
                  className="flex-1 rounded-xl py-2.5 text-sm font-semibold transition"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#94A3B8' }}>
                  Cancel
                </button>
                <button onClick={handleReject}
                  className="flex-1 rounded-xl py-2.5 text-sm font-bold text-white transition"
                  style={{ background: 'linear-gradient(135deg,#F43F5E,#EF4444)', boxShadow: '0 4px 15px rgba(244,63,94,0.4)' }}>
                  ❌ Reject Task
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface TaskCardProps {
  task: Task;
  index: number;
  onAccept?: () => void;
  onReject?: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, index, onAccept, onReject }) => {
  const sc = STATUS_CONFIG[task.status];
  const isPending = task.status === 'Pending Acceptance';

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
      className="glass rounded-2xl p-5 card-hover"
      style={{ borderLeft: `3px solid ${sc.color}` }}>
      <div className="flex flex-col gap-4">
        {/* Top row */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h3 className="font-bold text-white text-sm">{task.title}</h3>
              <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold"
                style={{ background: `${PRIORITY_COLOR[task.priority]}20`, color: PRIORITY_COLOR[task.priority], border: `1px solid ${PRIORITY_COLOR[task.priority]}40` }}>
                <Flag className="h-2.5 w-2.5" />{task.priority}
              </span>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: '#64748B' }}>{task.description}</p>
          </div>
          {/* Status badge */}
          <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold shrink-0"
            style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.color}40` }}>
            {sc.icon}{sc.label}
          </span>
        </div>

        {/* Meta row */}
        <div className="flex flex-wrap gap-4 text-[11px]" style={{ color: '#475569' }}>
          <span className="flex items-center gap-1.5"><User className="h-3 w-3" />Assigned by {task.assignedBy}</span>
          <span className="flex items-center gap-1.5"><Calendar className="h-3 w-3" />Due {task.dueDate}</span>
          <span className="flex items-center gap-1.5"><Tag className="h-3 w-3" />{task.category}</span>
          <span className="flex items-center gap-1.5"><Clock className="h-3 w-3" />
            {new Date(task.createdAt).toLocaleDateString()}
          </span>
        </div>

        {/* Attachments */}
        {task.attachments.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {task.attachments.map((a, i) => (
              <span key={i} className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px]"
                style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)', color: '#A5B4FC' }}>
                <Paperclip className="h-3 w-3" />{a}
              </span>
            ))}
          </div>
        )}

        {/* Rejection reason */}
        {task.status === 'Rejected' && task.rejectionReason && (
          <div className="rounded-xl px-4 py-3 text-xs" style={{ background: 'rgba(244,63,94,0.06)', border: '1px solid rgba(244,63,94,0.2)', color: '#F43F5E' }}>
            <span className="font-bold">Rejection reason:</span> {task.rejectionReason}
          </div>
        )}

        {/* Accepted timestamp */}
        {task.status === 'Accepted' && task.acceptedAt && (
          <div className="rounded-xl px-4 py-3 text-xs" style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', color: '#10B981' }}>
            <span className="font-bold">Accepted on:</span> {new Date(task.acceptedAt).toLocaleString()}
          </div>
        )}

        {/* Action buttons — only for pending */}
        {isPending && onAccept && onReject && (
          <div className="flex gap-3 pt-1" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <button onClick={onAccept}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold text-white transition"
              style={{ background: 'linear-gradient(135deg,#10B981,#059669)', boxShadow: '0 4px 12px rgba(16,185,129,0.3)' }}>
              <CheckCircle2 className="h-4 w-4" />Accept Task
            </button>
            <button onClick={onReject}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition"
              style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)', color: '#F43F5E' }}>
              <XCircle className="h-4 w-4" />Reject Task
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ClientTasksPage;
