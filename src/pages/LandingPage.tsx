import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FolderKanban, Clock, MessageSquare, CheckCircle2, ArrowRight, Star, Zap, Users, Sparkles, FileText, Shield, TrendingUp } from 'lucide-react';
import { usePageTitle } from '../hooks/usePageTitle';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' } }),
};

export const LandingPage: React.FC = () => {
  usePageTitle('Client Portal Lite — Premium Agency Workspace');

  return (
    <div className="min-h-screen font-sans" style={{ background: '#0A0F1E', color: '#E2E8F0' }}>
      {/* Nav */}
      <nav className="sticky top-0 z-50" style={{ background: 'rgba(10,15,30,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(99,102,241,0.12)' }}>
        <div className="mx-auto flex max-w-7xl h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl btn-primary glow-indigo">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-white text-lg tracking-tight">
              Client<span className="gradient-text">Portal</span>
              <span className="text-slate-500 font-normal ml-1">Lite</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-semibold text-slate-400 hover:text-white transition px-3 py-2">
              Sign In
            </Link>
            <Link to="/login?signup=true" className="btn-primary rounded-xl px-5 py-2 text-sm font-semibold text-white">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden py-24 lg:py-32">
        {/* Background orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 left-1/4 h-96 w-96 rounded-full opacity-20 blur-3xl" style={{ background: 'radial-gradient(circle, #6366F1, transparent)' }} />
          <div className="absolute top-20 right-1/4 h-64 w-64 rounded-full opacity-15 blur-3xl" style={{ background: 'radial-gradient(circle, #06B6D4, transparent)' }} />
          <div className="absolute bottom-0 left-1/2 h-80 w-80 rounded-full opacity-10 blur-3xl" style={{ background: 'radial-gradient(circle, #3B82F6, transparent)' }} />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}>
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold mb-6" style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', color: '#818CF8' }}>
              <Sparkles className="h-3.5 w-3.5" />
              <span>Built for Modern Agencies & Clients</span>
            </div>
          </motion.div>

          <motion.h1
            variants={fadeUp} initial="hidden" animate="visible" custom={1}
            className="text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl max-w-4xl mx-auto leading-tight"
          >
            Stop Emailing Deliverables.{' '}
            <span className="gradient-text">Collaborate In Real-Time.</span>
          </motion.h1>

          <motion.p
            variants={fadeUp} initial="hidden" animate="visible" custom={2}
            className="mt-6 text-lg max-w-2xl mx-auto leading-relaxed"
            style={{ color: '#94A3B8' }}
          >
            A centralized, premium workspace for creative agencies and tech freelancers to coordinate feedback, file versions, approvals, and comments with clients.
          </motion.p>

          <motion.div
            variants={fadeUp} initial="hidden" animate="visible" custom={3}
            className="mt-10 flex flex-wrap items-center justify-center gap-4"
          >
            <Link to="/login" className="group btn-primary flex items-center gap-2 rounded-2xl px-8 py-4 text-base font-semibold text-white">
              <span>Launch Agency Dashboard</span>
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link to="/login?role=client" className="flex items-center gap-2 rounded-2xl px-8 py-4 text-base font-semibold transition" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#CBD5E1' }}>
              View Client Workspace
            </Link>
          </motion.div>

          {/* App mockup */}
          <motion.div
            variants={fadeUp} initial="hidden" animate="visible" custom={4}
            className="mt-20 overflow-hidden rounded-2xl"
            style={{ border: '1px solid rgba(99,102,241,0.2)', boxShadow: '0 40px 80px rgba(0,0,0,0.5), 0 0 60px rgba(99,102,241,0.1)' }}
          >
            <div className="flex h-10 items-center gap-1.5 px-4" style={{ background: 'rgba(15,23,42,0.9)', borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
              <div className="h-3 w-3 rounded-full" style={{ background: '#F43F5E' }} />
              <div className="h-3 w-3 rounded-full" style={{ background: '#F59E0B' }} />
              <div className="h-3 w-3 rounded-full" style={{ background: '#10B981' }} />
              <div className="ml-4 flex h-5 flex-1 max-w-xs items-center justify-center rounded text-[10px] font-medium" style={{ background: 'rgba(255,255,255,0.05)', color: '#64748B' }}>
                clientportal-lite.app/dashboard
              </div>
            </div>
            <div className="p-6 sm:p-10" style={{ background: 'rgba(10,15,30,0.8)' }}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { icon: FolderKanban, color: '#6366F1', title: 'Organized Workspaces', desc: 'Track deadlines, project briefs, and progress in one spot.' },
                  { icon: CheckCircle2, color: '#10B981', title: 'One-Click Approvals', desc: 'No more confusing email signoffs. Clients approve instantly.' },
                  { icon: MessageSquare, color: '#06B6D4', title: 'Deliverable Threads', desc: 'Leave contextual comments right on specific asset versions.' },
                ].map(({ icon: Icon, color, title, desc }) => (
                  <div key={title} className="glass rounded-xl p-5 text-left card-hover">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg mb-3" style={{ background: `${color}20` }}>
                      <Icon className="h-5 w-5" style={{ color }} />
                    </div>
                    <h4 className="font-bold text-white text-sm">{title}</h4>
                    <p className="text-xs mt-1" style={{ color: '#64748B' }}>{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24" style={{ borderTop: '1px solid rgba(99,102,241,0.08)' }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Everything you need to ship on time
            </h2>
            <p className="mt-4 text-base" style={{ color: '#64748B' }}>
              Eliminate WhatsApp noise, untangle feedback threads, and maintain version control on all your agency assets.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: FolderKanban, color: '#6366F1', title: 'Projects Workspace', desc: 'Create client profiles, assign team members, set milestones, and map priorities.' },
              { icon: FileText, color: '#06B6D4', title: 'Version Auditing', desc: 'Upload deliverables with incremental version tags. Keep archives of all historical layouts.' },
              { icon: Clock, color: '#10B981', title: 'Milestone Timelines', desc: 'Provide clients with real-time visual progress bars and dynamic checklists.' },
              { icon: Shield, color: '#F59E0B', title: 'Instant Approval', desc: 'Secure digital signatures. Request revisions with structured contextual feedback.' },
            ].map(({ icon: Icon, color, title, desc }, i) => (
              <motion.div
                key={title}
                variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i * 0.5}
                className="glass rounded-2xl p-6 card-hover"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl mb-4" style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
                  <Icon className="h-6 w-6" style={{ color }} />
                </div>
                <h3 className="text-base font-bold text-white">{title}</h3>
                <p className="mt-2 text-sm" style={{ color: '#64748B' }}>{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16" style={{ background: 'rgba(99,102,241,0.04)', borderTop: '1px solid rgba(99,102,241,0.08)', borderBottom: '1px solid rgba(99,102,241,0.08)' }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '500+', label: 'Agencies', icon: Users },
              { value: '12k+', label: 'Projects Delivered', icon: FolderKanban },
              { value: '98%', label: 'Client Satisfaction', icon: Star },
              { value: '3.4h', label: 'Avg Review Time', icon: TrendingUp },
            ].map(({ value, label, icon: Icon }) => (
              <div key={label} className="space-y-2">
                <div className="text-3xl font-extrabold gradient-text">{value}</div>
                <div className="flex items-center justify-center gap-1.5 text-sm" style={{ color: '#64748B' }}>
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold tracking-tight text-white">Approved by Creative Leaders</h2>
            <p className="mt-4 text-base" style={{ color: '#64748B' }}>See how agencies saved dozens of hours per project.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { quote: '"We saved at least 15 hours a week in client communication. Our clients just look at Client Portal Lite and approve right there."', name: 'Amara Okafor', role: 'Founder, Helix Agency', img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100&q=80' },
              { quote: '"The file transparency is outstanding. Our tech clients love being able to download specific PDF formats and check version status."', name: 'Marcus Vance', role: 'Project Director, Stark Labs', img: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=100&h=100&q=80' },
              { quote: '"As a client, I love this tool. I can check our brand deliverables without digging through my inbox. Reviewing assets is incredibly easy."', name: 'Helena Vance', role: 'CMO, Vance Energy', img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&h=100&q=80' },
            ].map(({ quote, name, role, img }, i) => (
              <motion.div
                key={name}
                variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i * 0.5}
                className="glass rounded-2xl p-8 card-hover"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => <Star key={j} className="h-4 w-4 fill-current" style={{ color: '#F59E0B' }} />)}
                </div>
                <p className="text-sm leading-relaxed italic" style={{ color: '#94A3B8' }}>{quote}</p>
                <div className="mt-6 flex items-center gap-3">
                  <img src={img} referrerPolicy="no-referrer" alt={name} className="h-10 w-10 rounded-full object-cover" style={{ border: '2px solid rgba(99,102,241,0.3)' }} />
                  <div>
                    <h4 className="font-bold text-white text-sm">{name}</h4>
                    <p className="text-xs" style={{ color: '#64748B' }}>{role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(6,182,212,0.08) 100%)', borderTop: '1px solid rgba(99,102,241,0.15)' }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-64 w-64 rounded-full opacity-20 blur-3xl" style={{ background: 'radial-gradient(circle, #6366F1, transparent)' }} />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl max-w-2xl mx-auto">
            Ready to upgrade your client experience?
          </h2>
          <p className="mt-4 text-base max-w-md mx-auto" style={{ color: '#94A3B8' }}>
            Create an agency workspace in seconds. No credit card required.
          </p>
          <div className="mt-8 flex justify-center">
            <Link to="/login" className="group btn-primary flex items-center gap-2 rounded-2xl px-8 py-4 text-base font-bold text-white">
              <span>Get Started Now</span>
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12" style={{ background: 'rgba(5,8,15,0.8)', borderTop: '1px solid rgba(99,102,241,0.1)' }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg btn-primary">
                  <Zap className="h-4 w-4 text-white" />
                </div>
                <span className="font-bold text-white">Client<span className="gradient-text">Portal</span> Lite</span>
              </div>
              <p className="mt-4 text-xs leading-relaxed max-w-sm" style={{ color: '#475569' }}>
                Centralizes agency and client collaboration on a robust, lightweight dashboard. Coordinate deliverables and collect approvals seamlessly.
              </p>
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Product</h4>
              <ul className="mt-4 space-y-2 text-xs" style={{ color: '#475569' }}>
                {['Features', 'Pricing', 'Support'].map(item => (
                  <li key={item}><Link to="/login" className="hover:text-white transition">{item}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Legal</h4>
              <ul className="mt-4 space-y-2 text-xs" style={{ color: '#475569' }}>
                {['Privacy Policy', 'Terms of Service', 'Security'].map(item => (
                  <li key={item}><Link to="/login" className="hover:text-white transition">{item}</Link></li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-6 text-center text-xs" style={{ borderTop: '1px solid rgba(99,102,241,0.08)', color: '#334155' }}>
            <p>&copy; 2026 Client Portal Lite. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
