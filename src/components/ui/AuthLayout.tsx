import React from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => (
  <div className="flex min-h-screen items-center justify-center px-4 py-12 font-sans" style={{ background: '#0A0F1E' }}>
    {/* Background orbs */}
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full opacity-20 blur-3xl" style={{ background: 'radial-gradient(circle, #6366F1, transparent)' }} />
      <div className="absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full opacity-10 blur-3xl" style={{ background: 'radial-gradient(circle, #06B6D4, transparent)' }} />
      <div className="absolute top-3/4 left-1/2 h-48 w-48 rounded-full opacity-10 blur-3xl" style={{ background: 'radial-gradient(circle, #3B82F6, transparent)' }} />
    </div>

    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="relative w-full max-w-md"
    >
      <div className="rounded-2xl p-8" style={{
        background: 'rgba(15,23,42,0.85)',
        backdropFilter: 'blur(24px)',
        border: '1px solid rgba(99,102,241,0.2)',
        boxShadow: '0 40px 80px rgba(0,0,0,0.5), 0 0 40px rgba(99,102,241,0.08)',
      }}>
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl btn-primary glow-indigo mb-4">
            <Zap className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">{title}</h1>
          <p className="mt-1.5 text-sm" style={{ color: '#64748B' }}>{subtitle}</p>
        </div>
        {children}
      </div>
    </motion.div>
  </div>
);

export default AuthLayout;
