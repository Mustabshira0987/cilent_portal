import React from 'react';
import { Link } from 'react-router-dom';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { motion } from 'framer-motion';
import { usePortal } from '../context/PortalContext';
import { FolderKanban, Users, FileCheck, CheckCircle2, Plus, ChevronRight, TrendingUp, MessageSquare, FileDown, Clock, Zap, Activity } from 'lucide-react';
import { usePageTitle } from '../hooks/usePageTitle';

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4, ease: 'easeOut' } }),
};

const chartData = [
  { day: 'Mon', Assets: 4, Approved: 3 },
  { day: 'Tue', Assets: 7, Approved: 5 },
  { day: 'Wed', Assets: 9, Approved: 8 },
  { day: 'Thu', Assets: 5, Approved: 4 },
  { day: 'Fri', Assets: 8, Approved: 7 },
  { day: 'Sat', Assets: 2, Approved: 2 },
  { day: 'Sun', Assets: 1, Approved: 1 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="rounded-xl p-3 text-xs" style={{ background: 'rgba(10,15,30,0.95)', border: '1px solid rgba(99,102,241,0.3)', boxShadow: '0 10px 30px rgba(0,0,0,0.4)' }}>
        <p className="font-bold text-white mb-1">{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.color }}>{p.name}: <span className="font-bold">{p.value}</span></p>
        ))}
      </div>
    );
  }
  return null;
};

export const AgencyDashboard: React.FC = () => {
  usePageTitle('Agency Workspace');
  const { projects, deliverables, activities } = usePortal();

  const totalProjects = projects.length;
  const activeClientsCount = new Set(projects.map(p => p.clientName)).size;
  const pendingDeliverablesCount = deliverables.filter(d => d.status === 'review').length;
  const completedProjectsCount = projects.filter(p => p.status === 'completed').length;

  const stats = [
    { label: 'Total Projects', value: totalProjects, sub: '↑ 12% from last month', subColor: '#10B981', icon: FolderKanban, color: '#6366F1', cardClass: 'stat-card-indigo' },
    { label: 'Active Clients', value: activeClientsCount, sub: '100% retention rate', subColor: '#94A3B8', icon: Users, color: '#3B82F6', cardClass: 'stat-card-blue' },
    { label: 'Pending Review', value: pendingDeliverablesCount, sub: 'Action required', subColor: '#F59E0B', icon: FileCheck, color: '#F59E0B', cardClass: 'stat-card-amber' },
    { label: 'Completed', value: completedProjectsCount, sub: '100% satisfaction', subColor: '#10B981', icon: CheckCircle2, color: '#10B981', cardClass: 'stat-card-emerald' },
  ];

  const activityIcon = (type: string) => {
    if (type === 'approval') return <CheckCircle2 className="h-4 w-4" style={{ color: '#10B981' }} />;
    if (type === 'deliverable') return <FileDown className="h-4 w-4" style={{ color: '#6366F1' }} />;
    if (type === 'comment') return <MessageSquare className="h-4 w-4" style={{ color: '#06B6D4' }} />;
    return <Clock className="h-4 w-4" style={{ color: '#94A3B8' }} />;
  };

  const activityBg = (type: string) => {
    if (type === 'approval') return 'rgba(16,185,129,0.1)';
    if (type === 'deliverable') return 'rgba(99,102,241,0.1)';
    if (type === 'comment') return 'rgba(6,182,212,0.1)';
    return 'rgba(148,163,184,0.1)';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <Zap className="h-6 w-6" style={{ color: '#6366F1' }} />
            Agency Workspace
          </h1>
          <p className="mt-1 text-sm" style={{ color: '#64748B' }}>
            Monitor client approvals, team deliverables, and timeline health.
          </p>
        </div>
        <Link
          to="/create-project"
          className="btn-primary inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white"
        >
          <Plus className="h-4 w-4" />
          <span>New Project</span>
        </Link>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, sub, subColor, icon: Icon, color, cardClass }, i) => (
          <motion.div
            key={label}
            variants={fadeUp} initial="hidden" animate="visible" custom={i + 1}
            className={`glass rounded-2xl p-5 card-hover ${cardClass}`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#64748B' }}>{label}</p>
                <p className="mt-2 text-3xl font-extrabold text-white">{value}</p>
                <p className="mt-1 text-xs font-medium" style={{ color: subColor }}>{sub}</p>
              </div>
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl" style={{ background: `${color}15`, border: `1px solid ${color}25` }}>
                <Icon className="h-5 w-5" style={{ color }} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left col */}
        <div className="lg:col-span-2 space-y-6">
          {/* Chart */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={5} className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-bold text-white">Weekly Delivery Performance</h3>
                <p className="text-xs mt-0.5" style={{ color: '#64748B' }}>Assets uploaded vs client approval throughput</p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5" style={{ color: '#94A3B8' }}>
                  <span className="h-2 w-2 rounded-full" style={{ background: '#6366F1' }} />Assets
                </span>
                <span className="flex items-center gap-1.5" style={{ color: '#94A3B8' }}>
                  <span className="h-2 w-2 rounded-full" style={{ background: '#10B981' }} />Approved
                </span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorAssets" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorApproved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#475569' }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="Assets" stroke="#6366F1" strokeWidth={2} fill="url(#colorAssets)" />
                <Area type="monotone" dataKey="Approved" stroke="#10B981" strokeWidth={2} fill="url(#colorApproved)" />
              </AreaChart>
            </ResponsiveContainer>
            <div className="mt-4 flex items-center justify-between text-xs" style={{ color: '#64748B' }}>
              <span className="flex items-center gap-1 font-medium" style={{ color: '#10B981' }}>
                <TrendingUp className="h-3.5 w-3.5" />+15.4% Approval velocity
              </span>
              <span>Avg review: <strong className="text-white">3.4 hrs</strong></span>
            </div>
          </motion.div>

          {/* Projects list */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={6} className="glass rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
              <h3 className="font-bold text-white">Active Client Portals</h3>
              <span className="text-xs font-semibold" style={{ color: '#475569' }}>{projects.length} total</span>
            </div>
            <div>
              {projects.slice(0, 5).map((project, i) => (
                <div key={project.id} className="px-6 py-4 hover:bg-white/2 transition" style={{ borderBottom: i < projects.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Link to={`/projects/${project.id}`} className="font-semibold text-white hover:text-indigo-300 transition text-sm truncate">
                          {project.name}
                        </Link>
                        <span className={`shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold badge-${project.priority}`}>
                          {project.priority}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs" style={{ color: '#475569' }}>
                        {project.clientName} · Due {project.deadline}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="w-32">
                        <div className="flex justify-between text-xs mb-1" style={{ color: '#475569' }}>
                          <span>Progress</span>
                          <span style={{ color: '#818CF8' }}>{project.progress}%</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                          <div
                            style={{ width: `${project.progress}%`, background: project.progress === 100 ? '#10B981' : 'linear-gradient(90deg,#6366F1,#3B82F6)' }}
                            className="h-full rounded-full transition-all duration-500 progress-glow"
                          />
                        </div>
                      </div>
                      <Link to={`/projects/${project.id}`} className="flex h-8 w-8 items-center justify-center rounded-lg transition hover:bg-indigo-500/20" style={{ border: '1px solid rgba(99,102,241,0.2)', color: '#6366F1' }}>
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right col — Activity */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={7} className="glass rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-5" style={{ borderBottom: '1px solid rgba(99,102,241,0.1)', paddingBottom: '1rem' }}>
            <Activity className="h-4 w-4" style={{ color: '#6366F1' }} />
            <h3 className="font-bold text-white">Activity Journal</h3>
          </div>
          <div className="space-y-4 max-h-[520px] overflow-y-auto pr-1">
            {activities.slice(0, 12).map((activity, i) => (
              <div key={activity.id} className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ background: activityBg(activity.type) }}>
                  {activityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <p className="text-xs font-semibold text-white leading-tight">{activity.title}</p>
                  <p className="mt-0.5 text-xs leading-normal" style={{ color: '#64748B' }}>{activity.description}</p>
                  <div className="mt-1 flex items-center gap-1 text-[10px]" style={{ color: '#334155' }}>
                    <span>{activity.user.name}</span>
                    <span>·</span>
                    <span>{new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AgencyDashboard;
