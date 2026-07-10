import React, { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { ClipboardList, Search, User, ChevronDown, X, Paperclip, Send, CheckCircle2 } from 'lucide-react';
import { useTask } from '../context/TaskContext';
import { useAuth } from '../auth/AuthContext';
import { usePageTitle } from '../hooks/usePageTitle';

const schema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  priority: z.enum(['Low', 'Medium', 'High', 'Critical']),
  dueDate: z.string().min(1, 'Due date is required'),
  category: z.string().min(2, 'Category is required'),
});
type FormData = z.infer<typeof schema>;

const CATEGORIES = ['Design Review', 'UX Approval', 'Content', 'Development', 'Testing', 'Marketing', 'Legal', 'Finance', 'Other'];

export const AssignTaskPage: React.FC = () => {
  usePageTitle('Assign Task');
  const { user } = useAuth();
  const { assignTask, getClientList } = useTask();

  const clients = useMemo(() => getClientList(), [getClientList]);
  const [clientSearch, setClientSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState<ReturnType<typeof getClientList>[0] | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  // Attachments — real File objects
  const [attachments, setAttachments] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [submitted, setSubmitted] = useState(false);

  const filtered = clients.filter(c =>
    c.fullName.toLowerCase().includes(clientSearch.toLowerCase()) ||
    c.email.toLowerCase().includes(clientSearch.toLowerCase())
  );

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { priority: 'Medium' },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setAttachments(prev => [...prev, ...files]);
    e.target.value = '';
  };

  const removeAttachment = (i: number) => {
    setAttachments(prev => prev.filter((_, j) => j !== i));
  };

  const formatSize = (bytes: number) =>
    bytes < 1024 ? `${bytes}B` : bytes < 1048576 ? `${(bytes / 1024).toFixed(1)}KB` : `${(bytes / 1048576).toFixed(1)}MB`;

  const onSubmit = async (data: FormData) => {
    if (!selectedClient) { toast.error('Please select a client first'); return; }
    if (!user) return;
    assignTask({
      clientId: selectedClient.id,
      clientEmail: selectedClient.email,
      clientUsername: selectedClient.fullName,
      assignedBy: user.fullName,
      assignedByEmail: user.email,
      title: data.title,
      description: data.description,
      priority: data.priority,
      dueDate: data.dueDate,
      category: data.category,
      attachments: attachments.map(f => f.name),
    });
    toast.success(`Task assigned to ${selectedClient.fullName}!`);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      reset();
      setSelectedClient(null);
      setClientSearch('');
      setAttachments([]);
    }, 2500);
  };

  if (submitted) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="glass rounded-2xl p-12 flex flex-col items-center gap-4 text-center"
          style={{ border: '1px solid rgba(16,185,129,0.3)' }}>
          <div className="flex h-16 w-16 items-center justify-center rounded-full" style={{ background: 'rgba(16,185,129,0.15)' }}>
            <CheckCircle2 className="h-8 w-8" style={{ color: '#10B981' }} />
          </div>
          <h2 className="text-xl font-bold text-white">Task Assigned Successfully!</h2>
          <p className="text-sm" style={{ color: '#64748B' }}>The client will see this task immediately in their dashboard.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl btn-primary">
          <ClipboardList className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Assign Task</h1>
          <p className="text-sm" style={{ color: '#64748B' }}>Create and assign a task to a registered client</p>
        </div>
      </div>

      {/* ── Everything below is ONE wrapper div, NOT a form ── */}
      <div className="glass rounded-2xl p-6 space-y-5">

        {/* Client selector */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#94A3B8' }}>
            Select Client *
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowDropdown(v => !v)}
              className="w-full flex items-center justify-between rounded-xl px-4 py-3 text-sm transition input-glow"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: `1px solid ${selectedClient ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.08)'}`,
                color: selectedClient ? '#E2E8F0' : '#475569',
              }}>
              <span className="flex items-center gap-2">
                <User className="h-4 w-4 shrink-0" style={{ color: selectedClient ? '#818CF8' : '#475569' }} />
                {selectedClient ? `${selectedClient.fullName} (${selectedClient.email})` : 'Search and select a client…'}
              </span>
              <ChevronDown className="h-4 w-4 shrink-0" style={{ color: '#475569' }} />
            </button>

            <AnimatePresence>
              {showDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  className="absolute z-50 mt-2 w-full rounded-2xl overflow-hidden"
                  style={{ background: 'rgba(10,15,30,0.98)', border: '1px solid rgba(99,102,241,0.25)', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
                  <div className="p-2" style={{ borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
                    <div className="flex items-center gap-2 rounded-xl px-3 py-2" style={{ background: 'rgba(255,255,255,0.04)' }}>
                      <Search className="h-3.5 w-3.5 shrink-0" style={{ color: '#475569' }} />
                      <input
                        autoFocus
                        value={clientSearch}
                        onChange={e => setClientSearch(e.target.value)}
                        placeholder="Search by name or email…"
                        className="flex-1 bg-transparent text-xs text-white placeholder-slate-600 outline-none" />
                    </div>
                  </div>
                  <div className="max-h-52 overflow-y-auto">
                    {filtered.length === 0 ? (
                      <div className="px-4 py-6 text-center text-xs" style={{ color: '#475569' }}>
                        {clients.length === 0 ? 'No clients registered yet.' : 'No clients match your search.'}
                      </div>
                    ) : filtered.map(c => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => { setSelectedClient(c); setShowDropdown(false); setClientSearch(''); }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition"
                        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white text-xs font-bold"
                          style={{ background: 'linear-gradient(135deg,#06B6D4,#3B82F6)' }}>
                          {c.fullName[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">{c.fullName}</p>
                          <p className="text-[11px]" style={{ color: '#475569' }}>{c.email}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── The actual form only wraps the validated fields ── */}
        <form id="assign-task-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#94A3B8' }}>Task Title *</label>
            <input
              {...register('title')}
              placeholder="e.g. Review Brand Guidelines"
              className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 input-glow transition"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }} />
            {errors.title && <p className="mt-1 text-xs" style={{ color: '#F43F5E' }}>{errors.title.message}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#94A3B8' }}>Description *</label>
            <textarea
              {...register('description')}
              rows={4}
              placeholder="Describe what the client needs to do…"
              className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 input-glow transition resize-none"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }} />
            {errors.description && <p className="mt-1 text-xs" style={{ color: '#F43F5E' }}>{errors.description.message}</p>}
          </div>

          {/* Priority + Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#94A3B8' }}>Priority *</label>
              <select
                {...register('priority')}
                className="w-full rounded-xl px-4 py-3 text-sm text-white input-glow transition"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                {(['Low', 'Medium', 'High', 'Critical'] as const).map(p => (
                  <option key={p} value={p} style={{ background: '#0F172A' }}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#94A3B8' }}>Category *</label>
              <select
                {...register('category')}
                className="w-full rounded-xl px-4 py-3 text-sm text-white input-glow transition"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <option value="" style={{ background: '#0F172A' }}>Select category…</option>
                {CATEGORIES.map(c => <option key={c} value={c} style={{ background: '#0F172A' }}>{c}</option>)}
              </select>
              {errors.category && <p className="mt-1 text-xs" style={{ color: '#F43F5E' }}>{errors.category.message}</p>}
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#94A3B8' }}>Due Date *</label>
            <input
              {...register('dueDate')}
              type="date"
              min={new Date().toISOString().split('T')[0]}
              className="w-full rounded-xl px-4 py-3 text-sm text-white input-glow transition"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', colorScheme: 'dark' }} />
            {errors.dueDate && <p className="mt-1 text-xs" style={{ color: '#F43F5E' }}>{errors.dueDate.message}</p>}
          </div>
        </form>

        {/* ── Attachments — intentionally OUTSIDE the <form> tag ── */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#94A3B8' }}>
            Attachments <span style={{ color: '#475569' }}>(optional)</span>
          </label>

          {/* Hidden real file input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />

          {/* Drop zone / click area */}
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={e => e.preventDefault()}
            onDrop={e => {
              e.preventDefault();
              const files = Array.from(e.dataTransfer.files);
              if (files.length) setAttachments(prev => [...prev, ...files]);
            }}
            className="flex flex-col items-center justify-center gap-2 rounded-xl py-6 cursor-pointer transition hover:border-indigo-500/50"
            style={{ background: 'rgba(255,255,255,0.03)', border: '2px dashed rgba(255,255,255,0.1)' }}>
            <Paperclip className="h-5 w-5" style={{ color: '#475569' }} />
            <p className="text-xs" style={{ color: '#475569' }}>Click to browse or drag & drop files here</p>
            <button
              type="button"
              onClick={e => { e.stopPropagation(); fileInputRef.current?.click(); }}
              className="rounded-lg px-4 py-1.5 text-xs font-bold text-white transition"
              style={{ background: 'rgba(99,102,241,0.25)', border: '1px solid rgba(99,102,241,0.4)' }}>
              + Add Files
            </button>
          </div>

          {attachments.length > 0 && (
            <div className="mt-2 flex flex-col gap-1.5">
              {attachments.map((f, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 rounded-lg px-3 py-2"
                  style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.18)' }}>
                  <Paperclip className="h-3.5 w-3.5 shrink-0" style={{ color: '#818CF8' }} />
                  <span className="flex-1 truncate text-xs font-medium" style={{ color: '#A5B4FC' }}>{f.name}</span>
                  <span className="text-[10px] shrink-0" style={{ color: '#475569' }}>{formatSize(f.size)}</span>
                  <button type="button" onClick={() => removeAttachment(i)} className="ml-1 hover:text-rose-400 transition">
                    <X className="h-3.5 w-3.5" style={{ color: '#475569' }} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected client preview */}
        {selectedClient && (
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-xl p-4 flex items-center gap-4"
            style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)' }}>
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white text-sm font-bold"
              style={{ background: 'linear-gradient(135deg,#06B6D4,#3B82F6)' }}>
              {selectedClient.fullName[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white">Assigning to: {selectedClient.fullName}</p>
              <p className="text-[11px]" style={{ color: '#475569' }}>{selectedClient.email}</p>
            </div>
            <button type="button" onClick={() => setSelectedClient(null)}>
              <X className="h-4 w-4" style={{ color: '#475569' }} />
            </button>
          </motion.div>
        )}

        {/* Submit — uses form="assign-task-form" to submit the form from outside it */}
        <button
          type="submit"
          form="assign-task-form"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-white btn-primary transition disabled:opacity-60">
          <Send className="h-4 w-4" />
          {isSubmitting ? 'Assigning…' : 'Assign Task'}
        </button>

      </div>
    </div>
  );
};

export default AssignTaskPage;
