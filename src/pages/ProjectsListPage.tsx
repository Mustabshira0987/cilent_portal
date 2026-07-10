import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { usePortal } from '../context/PortalContext';
import { FolderKanban, Plus, Search, ChevronRight, Trash2, Calendar, Users } from 'lucide-react';
import { usePageTitle } from '../hooks/usePageTitle';

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.35, ease: 'easeOut' } }),
};

export const ProjectsListPage: React.FC = () => {
  usePageTitle('All Projects');
  const { projects, currentRole, deleteProject } = usePortal();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed' | 'on-hold'>('all');

  const filtered = projects.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.clientName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    all: projects.length,
    active: projects.filter(p => p.status === 'active').length,
    completed: projects.filter(p => p.status === 'completed').length,
    'on-hold': projects.filter(p => p.status === 'on-hold').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">All Projects</h1>
          <p className="mt-1 text-sm" style={{ color: '#64748B' }}>{projects.length} total workspaces</p>
        </div>
        {currentRole === 'agency' && (
          <Link to="/create-project" className="btn-primary inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white">
            <Plus className="h-4 w-4" />New Project
          </Link>
        )}
      </motion.div>

      {/* Filters */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={1} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: '#475569' }} />
          <input
            type="text"
            placeholder="Search by project or client name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-600 input-glow transition"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(['all', 'active', 'completed', 'on-hold'] as const).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className="rounded-xl px-3 py-2 text-xs font-semibold capitalize transition-all"
              style={statusFilter === s ? {
                background: 'linear-gradient(135deg,rgba(99,102,241,0.3),rgba(59,130,246,0.2))',
                border: '1px solid rgba(99,102,241,0.4)',
                color: '#A5B4FC',
              } : {
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.06)',
                color: '#64748B',
              }}
            >
              {s} <span className="ml-1 opacity-60">({statusCounts[s]})</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={2} className="glass rounded-2xl py-20 text-center">
          <FolderKanban className="h-12 w-12 mx-auto mb-4" style={{ color: '#334155' }} />
          <h3 className="text-sm font-bold text-white">No projects found</h3>
          <p className="text-xs mt-1" style={{ color: '#475569' }}>Try adjusting your search or filters.</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((project, i) => (
            <motion.div
              key={project.id}
              variants={fadeUp} initial="hidden" animate="visible" custom={i * 0.5 + 2}
              className="glass rounded-2xl p-5 card-hover flex flex-col justify-between gap-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <Link to={`/projects/${project.id}`} className="font-bold text-white hover:text-indigo-300 transition text-sm leading-snug">
                    {project.name}
                  </Link>
                  <span className={`shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold badge-${project.priority}`}>
                    {project.priority}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs" style={{ color: '#475569' }}>
                  <span className="flex items-center gap-1"><Users className="h-3 w-3" />{project.clientName}</span>
                  <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{project.deadline}</span>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1.5">
                    <span style={{ color: '#475569' }}>Progress</span>
                    <span style={{ color: '#818CF8' }}>{project.progress}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <div
                      style={{ width: `${project.progress}%`, background: project.progress === 100 ? '#10B981' : 'linear-gradient(90deg,#6366F1,#3B82F6)' }}
                      className="h-full rounded-full transition-all duration-500"
                    />
                  </div>
                </div>

                <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold capitalize badge-${project.status === 'on-hold' ? 'hold' : project.status}`}>
                  {project.status}
                </span>
              </div>

              <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                {currentRole === 'agency' && (
                  <button
                    onClick={() => deleteProject(project.id)}
                    className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold transition"
                    style={{ color: '#475569' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#F43F5E'; (e.currentTarget as HTMLElement).style.background = 'rgba(244,63,94,0.1)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#475569'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />Delete
                  </button>
                )}
                <Link
                  to={`/projects/${project.id}`}
                  className="ml-auto flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-semibold transition"
                  style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', color: '#818CF8' }}
                >
                  Open <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectsListPage;
