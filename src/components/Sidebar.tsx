import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { usePortal } from '../context/PortalContext';
import { useAuth } from '../hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, FolderKanban, PlusCircle, FolderGit2,
  Bell, Settings, LogOut, X, Zap, Users, Sparkles
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { currentRole, profile, notifications } = usePortal();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const unread = notifications.filter(n => !n.read).length;

  const agencyLinks = [
    { to: '/agency', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/projects', label: 'Projects', icon: FolderKanban },
    { to: '/create-project', label: 'New Project', icon: PlusCircle },
    { to: '/deliverables', label: 'Deliverables', icon: FolderGit2 },
    { to: '/notifications', label: 'Notifications', icon: Bell, badge: unread },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  const clientLinks = [
    { to: '/client', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/projects', label: 'Projects', icon: FolderKanban },
    { to: '/deliverables', label: 'Deliverables', icon: FolderGit2 },
    { to: '/notifications', label: 'Notifications', icon: Bell, badge: unread },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  const links = currentRole === 'agency' ? agencyLinks : clientLinks;

  const handleLogout = async () => {
    onClose();
    await signOut();
    navigate('/login');
  };

  const sidebarContent = (
    <aside className="flex h-full w-64 flex-col" style={{
      background: 'rgba(10, 15, 30, 0.95)',
      backdropFilter: 'blur(24px)',
      borderRight: '1px solid rgba(99,102,241,0.15)',
    }}>
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-5" style={{ borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg btn-primary">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-white text-sm tracking-tight">
            Client<span className="gradient-text">Portal</span>
          </span>
        </div>
        <button onClick={onClose} className="rounded-lg p-1.5 text-slate-500 hover:text-white hover:bg-white/5 transition lg:hidden">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Profile chip */}
      <div className="mx-4 mt-4 rounded-xl p-3" style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)' }}>
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" style={{ background: 'linear-gradient(135deg,#6366F1,#3B82F6)' }}>
            {currentRole === 'agency' ? <Users className="h-4 w-4 text-white" /> : <Sparkles className="h-4 w-4 text-white" />}
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'rgba(99,102,241,0.8)' }}>
              {currentRole === 'agency' ? 'Agency' : 'Client'} Space
            </p>
            <p className="truncate text-xs font-bold text-white">
              {currentRole === 'agency' ? profile.companyName : 'Acme Client Suite'}
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(148,163,184,0.5)' }}>
          Navigation
        </p>
        {links.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            onClick={onClose}
            end={link.to === '/agency' || link.to === '/client'}
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 relative ${
                isActive ? 'nav-active text-indigo-300' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-full" style={{ background: '#6366F1' }} />
                )}
                <link.icon className={`h-4 w-4 shrink-0 transition-colors ${isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                <span className="flex-1">{link.label}</span>
                {link.badge && link.badge > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white" style={{ background: 'linear-gradient(135deg,#F43F5E,#F59E0B)' }}>
                    {link.badge}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3" style={{ borderTop: '1px solid rgba(99,102,241,0.1)' }}>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-200"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 lg:hidden"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          />
        )}
      </AnimatePresence>

      {/* Mobile drawer */}
      <motion.div
        className="fixed bottom-0 top-0 left-0 z-50 lg:hidden"
        initial={{ x: '-100%' }}
        animate={{ x: isOpen ? 0 : '-100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      >
        {sidebarContent}
      </motion.div>

      {/* Desktop sticky */}
      <div className="hidden lg:flex lg:sticky lg:top-0 lg:h-screen lg:flex-col">
        {sidebarContent}
      </div>
    </>
  );
};
