import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { usePortal } from '../context/PortalContext';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'framer-motion';
import { Zap, Mail, Lock, Building2, User, KeyRound, AlertCircle, CheckCircle, Sparkles, ArrowRight } from 'lucide-react';
import { usePageTitle } from '../hooks/usePageTitle';

export const LoginPage: React.FC = () => {
  usePageTitle('Sign In — Client Portal Lite');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentRole, setRole } = usePortal();
  const { signIn, signUp, signOut, user } = useAuth();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [company, setCompany] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [cleared, setCleared] = useState(false);

  // Always clear any existing session when landing on login page
  useEffect(() => {
    signOut().then(() => setCleared(true));
  }, []);

  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam === 'client' || roleParam === 'agency') setRole(roleParam);
    if (searchParams.get('signup') === 'true') setIsSignUp(true);
  }, [searchParams, setRole]);

  // Only redirect after a fresh sign-in, not from stale localStorage
  useEffect(() => {
    if (cleared && user) navigate(currentRole === 'agency' ? '/agency' : '/client');
  }, [cleared, user, currentRole, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!email || !password) { setError('Please fill in all credentials.'); return; }
    if (isSignUp && !company) { setError('Please enter your company name.'); return; }
    setLoading(true);
    try {
      if (isSignUp) {
        const { error } = await signUp(email, password);
        if (error) throw error;
        setSuccess('Account created! Check your email to confirm, then sign in.');
      } else {
        const { error } = await signIn(email, password);
        if (error) throw error;
        navigate(currentRole === 'agency' ? '/agency' : '/client');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12 font-sans" style={{ background: '#0A0F1E' }}>
      {/* Background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full opacity-15 blur-3xl" style={{ background: 'radial-gradient(circle, #6366F1, transparent)' }} />
        <div className="absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full opacity-10 blur-3xl" style={{ background: 'radial-gradient(circle, #06B6D4, transparent)' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative w-full max-w-md"
      >
        <div className="rounded-2xl p-8" style={{ background: 'rgba(15,23,42,0.8)', backdropFilter: 'blur(24px)', border: '1px solid rgba(99,102,241,0.2)', boxShadow: '0 40px 80px rgba(0,0,0,0.5), 0 0 40px rgba(99,102,241,0.08)' }}>

          {/* Logo */}
          <div className="text-center mb-8">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl btn-primary glow-indigo mb-4">
              <Zap className="h-7 w-7 text-white" />
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight text-white">
              {isSignUp ? 'Create Workspace' : 'Welcome Back'}
            </h2>
            <p className="mt-1 text-sm" style={{ color: '#64748B' }}>
              {isSignUp ? 'Set up your agency workspace' : 'Sign in to your portal'}
            </p>
          </div>

          {/* Role switcher */}
          <div className="grid grid-cols-2 gap-2 p-1 rounded-xl mb-6" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
            {(['agency', 'client'] as const).map(role => (
              <button
                key={role}
                type="button"
                onClick={() => setRole(role)}
                className="flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-semibold transition-all duration-200"
                style={currentRole === role ? {
                  background: 'linear-gradient(135deg,rgba(99,102,241,0.3),rgba(59,130,246,0.2))',
                  border: '1px solid rgba(99,102,241,0.4)',
                  color: '#A5B4FC',
                } : { color: '#64748B' }}
              >
                {role === 'agency' ? <Building2 className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
                <span className="capitalize">{role} Portal</span>
              </button>
            ))}
          </div>

          {/* Alerts */}
          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 rounded-xl p-3 mb-4 text-xs font-semibold" style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)', color: '#F43F5E' }}>
              <AlertCircle className="h-4 w-4 shrink-0" /><span>{error}</span>
            </motion.div>
          )}
          {success && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 rounded-xl p-3 mb-4 text-xs font-semibold" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#10B981' }}>
              <CheckCircle className="h-4 w-4 shrink-0" /><span>{success}</span>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: '#94A3B8' }}>Company Name</label>
                <div className="relative">
                  <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: '#475569' }} />
                  <input
                    type="text"
                    placeholder="e.g. Vortex Design LLC"
                    value={company}
                    onChange={e => setCompany(e.target.value)}
                    className="w-full rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-slate-600 input-glow transition"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: '#94A3B8' }}>Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: '#475569' }} />
                <input
                  type="email"
                  placeholder={currentRole === 'agency' ? 'agency@vortex.com' : 'client@acme.com'}
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-slate-600 input-glow transition"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: '#94A3B8' }}>Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: '#475569' }} />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-slate-600 input-glow transition"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group w-full btn-primary flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-white mt-2 disabled:opacity-60"
            >
              {loading ? (
                <span>Please wait...</span>
              ) : (
                <>
                  <span>{isSignUp ? 'Create Free Workspace' : `Access ${currentRole === 'agency' ? 'Agency' : 'Client'} Portal`}</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          {/* Toggle */}
          <div className="mt-6 text-center">
            <p className="text-xs" style={{ color: '#475569' }}>
              {isSignUp ? 'Already have a portal?' : 'New to Client Portal Lite?'}{' '}
              <button type="button" onClick={() => setIsSignUp(!isSignUp)} className="font-bold transition" style={{ color: '#818CF8' }}>
                {isSignUp ? 'Sign In' : 'Register Agency'}
              </button>
            </p>
          </div>

          {/* Demo credentials */}
          <div className="mt-6 rounded-xl p-3" style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)' }}>
            <div className="flex items-center justify-center gap-2 text-xs font-bold mb-2" style={{ color: '#818CF8' }}>
              <KeyRound className="h-3.5 w-3.5" />
              <span>DEMO CREDENTIALS</span>
            </div>
            <div className="space-y-1 text-[11px]" style={{ color: '#94A3B8' }}>
              <p><span style={{ color: '#64748B' }}>Agency →</span> agency@vortex.com / demo1234</p>
              <p><span style={{ color: '#64748B' }}>Client →</span> client@acme.com / demo1234</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
