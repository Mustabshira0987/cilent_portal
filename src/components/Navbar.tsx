import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { usePortal } from '../context/PortalContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { Bell, LogOut, RefreshCw, Menu, User, Zap, ChevronDown, Settings, ShieldAlert, CheckCircle2, Info } from 'lucide-react';

interface NavbarProps {
  onToggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { currentRole, setRole, notifications, profile } = usePortal();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const unread = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setShowProfile(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotif(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleRoleToggle = () => {
    const next = currentRole === 'agency' ? 'client' : 'agency';
    setRole(next);
    navigate(next === 'agency' ? '/agency' : '/client');
  };

  const notifIcon = (type: string) => {
    if (type === 'alert') return <ShieldAlert className="h-3.5 w-3.5 text-amber-400" />;
    if (type === 'message') return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />;
    return <Info className="h-3.5 w-3.5 text-indigo-400" />;
  };

  const dropdownVariants = {
    hidden: { opacity: 0, y: -8, scale: 0.96 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.15, ease: 'easeOut' } },
    exit: { opacity: 0, y: -8, scale: 0.96, transition: { duration: 0.1 } },
  };

  return (
    <header
      className="sticky top-0 z-40 flex h-16 w-full items-center justify-between px-4 md:px-6"
      style={{
        background: 'rgba(10,15,30,0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(99,102,241,0.12)',
      }}
    >
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="rounded-lg p-2 text-slate-400 hover:text-white hover:bg-white/5 transition lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg btn-primary">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <span className="hidden sm:block font-bold text-white text-sm tracking-tight">
            Client<span className="gradient-text">Portal</span>
            <span className="ml-1 text-slate-500 font-normal">Lite</span>
          </span>
        </Link>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Role switcher */}
        <div className="flex items-center gap-2 rounded-xl px-3 py-1.5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <span className="text-xs font-semibold text-slate-400 hidden sm:block">
            {currentRole === 'agency' ? '🏢 Agency' : '👥 Client'}
          </span>
          <button
            onClick={handleRoleToggle}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold text-white transition-all btn-primary"
          >
            <RefreshCw className="h-3 w-3" />
            <span className="hidden sm:block">Switch</span>
          </button>
        </div>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => { setShowNotif(!showNotif); setShowProfile(false); }}
            className="relative flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition"
          >
            <Bell className="h-4.5 w-4.5" />
            {unread > 0 && (
              <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-bold text-white" style={{ background: 'linear-gradient(135deg,#F43F5E,#F59E0B)' }}>
                {unread}
              </span>
            )}
          </button>

          <AnimatePresence>
            {showNotif && (
              <motion.div
                variants={dropdownVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="absolute right-0 mt-2 w-80 rounded-2xl overflow-hidden"
                style={{ background: 'rgba(10,15,30,0.98)', border: '1px solid rgba(99,102,241,0.2)', boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 30px rgba(99,102,241,0.1)' }}
              >
                <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
                  <span className="text-sm font-bold text-white">Notifications</span>
                  <Link to="/notifications" onClick={() => setShowNotif(false)} className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition">
                    View all
                  </Link>
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center text-xs text-slate-500">No notifications</div>
                  ) : (
                    notifications.slice(0, 5).map(n => (
                      <div key={n.id} className="flex gap-3 px-4 py-3 hover:bg-white/3 transition" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg" style={{ background: 'rgba(99,102,241,0.1)' }}>
                          {notifIcon(n.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-xs font-semibold text-white truncate">{n.title}</p>
                            {!n.read && <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: '#6366F1' }} />}
                          </div>
                          <p className="mt-0.5 text-[11px] text-slate-500 line-clamp-2">{n.description}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => { setShowProfile(!showProfile); setShowNotif(false); }}
            className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-white/5 transition"
          >
            <div className="h-7 w-7 overflow-hidden rounded-lg" style={{ background: 'linear-gradient(135deg,#6366F1,#3B82F6)' }}>
              {profile.logo ? (
                <img src={profile.logo} referrerPolicy="no-referrer" alt="avatar" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-white text-xs font-bold">
                  {profile.name?.[0] || 'A'}
                </div>
              )}
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-slate-500 hidden sm:block" />
          </button>

          <AnimatePresence>
            {showProfile && (
              <motion.div
                variants={dropdownVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="absolute right-0 mt-2 w-56 rounded-2xl overflow-hidden"
                style={{ background: 'rgba(10,15,30,0.98)', border: '1px solid rgba(99,102,241,0.2)', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}
              >
                <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
                  <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Signed in as</p>
                  <p className="text-sm font-bold text-white truncate mt-0.5">{profile.name}</p>
                  <p className="text-xs text-slate-500 truncate">{profile.email}</p>
                </div>
                <div className="p-1.5">
                  <Link
                    to="/settings"
                    onClick={() => setShowProfile(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition"
                  >
                    <Settings className="h-4 w-4 text-slate-500" />
                    <span>Settings</span>
                  </Link>
                  <button
                    onClick={async () => { setShowProfile(false); await signOut(); navigate('/login'); }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign out</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};
