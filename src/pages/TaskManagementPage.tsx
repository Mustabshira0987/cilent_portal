import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  LayoutList, Plus, Search, Filter, ChevronDown, Trash2, RefreshCw,
  Clock, CheckCircle2, XCircle, Loader2, Flag, User, Calendar, Tag,
} from 'lucide-react';
import { useTask } from '../context/TaskContext';
import { usePageTitle } from '../hooks/usePageTitle';
import { Task, TaskStatus, TaskPriority } from '../types';

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.35, ease: 'easeOut' } }),
};

const STATUS_CONFIG: Record<TaskStatus, { color: string; bg: string; icon: React.ReactNode }> = {
  'Pending Acceptance': { color: '#F59E0B', bg: 'rgba(245,158,11,0.15)', icon: <Clock className="h-3.5 w-3.5" /> },
  'Accepted':           { color: '#10B981', bg: 'rgba(16,185,129,0.15)', icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  'Rejected':           { color: '#F43F5E', bg: 'rgba(244,63,94,0.15)',  icon: <XCircle className="h-3.5 w-3.5" /> },
  'In Progress':        { color: '#6366F1', bg: 'rgba(99,102,241,0.15)', icon: <Loader2 className="h-3.5 w-3.5" /> },
  'Completed':          { color: '#818CF8', bg: 'rgba(129,140,248,0.15)',icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
};

const PRIORITY_COLOR: Record<TaskPriority, string> = {
  Low: '#818CF8', Medium: '#F59E0B', High: '#F43F5E', Critical: '#EF4444',
};

const ALL_STATUSES: TaskStatus[] = ['Pending Acceptance', 'Accepted', 'Rejected', 'In Progress', 'Completed'];
const ALL_PRIORITIES: TaskPriority[] = ['Low', 'Medium', 'High', 'Critical'];

export const TaskManagementPage: React.FC = () => {
  usePageTitle('Task Management');
  const { getTasksForAgency, updateTaskStatus, deleteTask } = useTask();
  const tasks = getTasksForAgency();

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<TaskStatus | 'All'>('All');
  const [filterPriority, setFilterPriority] = useState<TaskPriority | 'All'>('All');
  const [filterClient, setFilterClient] = useState('');
  const [filterDue, setFilterDue] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [statusDropdown, setStatusDropdown] = useState<string | null>(null);

  const clientNames = useMemo(() => [...new Set(tasks.map(t => t.clientUsername))], [tasks]);

  const filtered = useMemo(() => tasks.filter(t => {
    if (search && !t.title.toLowerCase().includes(search.toLowerCase()) && !t.clientUsername.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterStatus !== 'All' && t.status !== filterStatus) return false;
    if (filterPriority !== 'All' && t.priority !== filterPriority) return false;
    if (filterClient && t.clientUsername !== filterClient) return false;
    if (filterDue && t.dueDate > filterDue) return false;
    return true;
  }), [tasks, search, filterStatus, filterPriority, filterClient, filterDue]);

  const stats = useMemo(() => ({
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'Pending Acceptance').length,
    accepted: tasks.filter(t => t.status === 'Accepted').length,
    inProgress: tasks.filter(t => t.status === 'In Progress').length,
    completed: tasks.filter(t => t.status === 'Completed').length,
    rejected: tasks.filter(t => t.status === 'Rejected').length,
  }), [tasks]);

  const handleDelete = (id: string) => {
    deleteTask(id);
    setConfirmDelete(null);
    toast.success('Task deleted');
  };

  const handleStatusChange = (taskId: string, status: TaskStatus) => {
    updateTaskStatus(taskId, status);
    setStatusDropdown(null);
    toast.success(`Status updated to "${status}"`);
  };

  const statCards = [
    { label: 'Total', value: stats.total, color: '#6366F1', bg: 'rgba(99,102,241,0.1)', border: 'stat-card-indigo' },
    { label: 'Pending', value: stats.pending, color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', border: 'stat-card-amber' },
    { label: 'Accepted', value: stats.accepted, color: '#10B981', bg: 'rgba(16,185,129,0.1)', border: 'stat-card-emerald' },
    { label: 'In Progress', value: stats.inProgress, color: '#818CF8', bg: 'rgba(129,140,248,0.1)', border: 'stat-card-indigo' },
    { label: 'Completed', value: stats.completed, color: '#06B6D4', bg: 'rgba(6,182,212,0.1)', border: 'stat-card-cyan' },
    { label: 'Rejected', value: stats.rejected, color: '#F43F5E', bg: 'rgba(244,63,94,0.1)', border: 'stat-card-rose' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl btn-primary">
            <LayoutList className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Task Management</h1>
            <p className="text-sm" style={{ color: '#64748B' }}>Monitor all assigned tasks and their acceptance status</p>
          </div>
        </div>
        <Link to="/assign-task"
          className="btn-primary inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white">
          <Plus className="h-4 w-4" />Assign New Task
        </Link>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {statCards.map(({ label, value, color, bg, border }, i) => (
          <motion.div key={label} variants={fadeUp} initial="hidden" animate="visible" custom={i + 1}
            className={`glass rounded-2xl p-4 card-hover ${border}`}>
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#64748B' }}>{label}</p>
            <p className="mt-1.5 text-3xl font-extrabold" style={{ color }}>{value}</p>
          </motion.div>
        ))}
      </div>

      {/* Search + Filter bar */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={7} className="glass rounded-2xl p-4 space-y-3">
        <div className="flex gap-3 flex-wrap">
          <div className="flex flex-1 min-w-48 items-center gap-2 rounded-xl px-3 py-2.5"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <Search className="h-4 w-4 shrink-0" style={{ color: '#475569' }} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search tasks or clients…"
              className="flex-1 bg-transparent text-sm text-white placeholder-slate-600 outline-none" />
          </div>
          <button onClick={() => setShowFilters(v => !v)}
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition"
            style={{ background: showFilters ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.04)', border: '1px solid rgba(99,102,241,0.3)', color: '#A5B4FC' }}>
            <Filter className="h-4 w-4" />Filters
          </button>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-3 overflow-hidden">
              {/* Status */}
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as TaskStatus | 'All')}
                className="rounded-xl px-3 py-2.5 text-xs text-white input-glow transition"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <option value="All" style={{ background: '#0F172A' }}>All Statuses</option>
                {ALL_STATUSES.map(s => <option key={s} value={s} style={{ background: '#0F172A' }}>{s}</option>)}
              </select>
              {/* Priority */}
              <select value={filterPriority} onChange={e => setFilterPriority(e.target.value as TaskPriority | 'All')}
                className="rounded-xl px-3 py-2.5 text-xs text-white input-glow transition"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <option value="All" style={{ background: '#0F172A' }}>All Priorities</option>
                {ALL_PRIORITIES.map(p => <option key={p} value={p} style={{ background: '#0F172A' }}>{p}</option>)}
              </select>
              {/* Client */}
              <select value={filterClient} onChange={e => setFilterClient(e.target.value)}
                className="rounded-xl px-3 py-2.5 text-xs text-white input-glow transition"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <option value="" style={{ background: '#0F172A' }}>All Clients</option>
                {clientNames.map(n => <option key={n} value={n} style={{ background: '#0F172A' }}>{n}</option>)}
              </select>
              {/* Due date */}
              <input type="date" value={filterDue} onChange={e => setFilterDue(e.target.value)}
                className="rounded-xl px-3 py-2.5 text-xs text-white input-glow transition"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', colorScheme: 'dark' }} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Task list */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={8} className="space-y-3">
        {filtered.length === 0 ? (
          <div className="glass rounded-2xl p-16 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl" style={{ background: 'rgba(99,102,241,0.1)' }}>
              <LayoutList className="h-8 w-8" style={{ color: '#6366F1' }} />
            </div>
            <h3 className="text-sm font-bold text-white">No tasks found</h3>
            <p className="mt-1 text-xs" style={{ color: '#475569' }}>
              {tasks.length === 0 ? 'Start by assigning a task to a client.' : 'Try adjusting your filters.'}
            </p>
            {tasks.length === 0 && (
              <Link to="/assign-task" className="mt-4 inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold text-white btn-primary">
                <Plus className="h-3.5 w-3.5" />Assign First Task
              </Link>
            )}
          </div>
        ) : (
          filtered.map((task, i) => {
            const sc = STATUS_CONFIG[task.status];
            return (
              <motion.div key={task.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="glass rounded-2xl p-5 card-hover">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  {/* Left */}
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-white text-sm">{task.title}</h3>
                      {/* Priority badge */}
                      <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold"
                        style={{ background: `${PRIORITY_COLOR[task.priority]}20`, color: PRIORITY_COLOR[task.priority], border: `1px solid ${PRIORITY_COLOR[task.priority]}40` }}>
                        <Flag className="h-2.5 w-2.5" />{task.priority}
                      </span>
                      {/* Status badge */}
                      <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold"
                        style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.color}40` }}>
                        {sc.icon}{task.status}
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed line-clamp-2" style={{ color: '#64748B' }}>{task.description}</p>
                    <div className="flex flex-wrap gap-3 text-[11px]" style={{ color: '#475569' }}>
                      <span className="flex items-center gap-1"><User className="h-3 w-3" />{task.clientUsername}</span>
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />Due {task.dueDate}</span>
                      <span className="flex items-center gap-1"><Tag className="h-3 w-3" />{task.category}</span>
                    </div>
                    {task.status === 'Rejected' && task.rejectionReason && (
                      <div className="rounded-lg px-3 py-2 text-xs" style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)', color: '#F43F5E' }}>
                        Rejection reason: {task.rejectionReason}
                      </div>
                    )}
                  </div>

                  {/* Right: actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {/* Status changer */}
                    <div className="relative">
                      <button onClick={() => setStatusDropdown(statusDropdown === task.id ? null : task.id)}
                        className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#94A3B8' }}>
                        <RefreshCw className="h-3.5 w-3.5" />Status<ChevronDown className="h-3 w-3" />
                      </button>
                      <AnimatePresence>
                        {statusDropdown === task.id && (
                          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                            className="absolute right-0 mt-1 z-50 w-44 rounded-xl overflow-hidden"
                            style={{ background: 'rgba(10,15,30,0.98)', border: '1px solid rgba(99,102,241,0.2)', boxShadow: '0 16px 40px rgba(0,0,0,0.5)' }}>
                            {ALL_STATUSES.map(s => (
                              <button key={s} onClick={() => handleStatusChange(task.id, s)}
                                className="w-full flex items-center gap-2 px-3 py-2.5 text-xs hover:bg-white/5 transition"
                                style={{ color: STATUS_CONFIG[s].color, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                {STATUS_CONFIG[s].icon}{s}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    {/* Delete */}
                    <button onClick={() => setConfirmDelete(task.id)}
                      className="flex h-9 w-9 items-center justify-center rounded-xl transition hover:bg-rose-500/10"
                      style={{ border: '1px solid rgba(244,63,94,0.2)', color: '#F43F5E' }}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </motion.div>

      {/* Delete confirm dialog */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
            onClick={() => setConfirmDelete(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="glass rounded-2xl p-6 w-full max-w-sm text-center space-y-4"
              style={{ border: '1px solid rgba(244,63,94,0.3)' }}>
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full" style={{ background: 'rgba(244,63,94,0.1)' }}>
                <Trash2 className="h-7 w-7" style={{ color: '#F43F5E' }} />
              </div>
              <h3 className="text-lg font-bold text-white">Delete Task?</h3>
              <p className="text-sm" style={{ color: '#64748B' }}>This action cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmDelete(null)}
                  className="flex-1 rounded-xl py-2.5 text-sm font-semibold transition"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#94A3B8' }}>
                  Cancel
                </button>
                <button onClick={() => handleDelete(confirmDelete)}
                  className="flex-1 rounded-xl py-2.5 text-sm font-bold text-white transition"
                  style={{ background: 'linear-gradient(135deg,#F43F5E,#EF4444)', boxShadow: '0 4px 15px rgba(244,63,94,0.4)' }}>
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TaskManagementPage;
