import React from 'react';
import { LucideIcon, Loader2, AlertCircle } from 'lucide-react';
import { ArrowRight } from 'lucide-react';

// ── InputField ────────────────────────────────────────────────────────────────
interface InputFieldProps {
  label: string;
  type?: string;
  placeholder?: string;
  error?: string;
  icon: LucideIcon;
  registration: React.InputHTMLAttributes<HTMLInputElement>;
}

export const InputField: React.FC<InputFieldProps> = ({ label, type = 'text', placeholder, error, icon: Icon, registration }) => (
  <div>
    <label className="block text-xs font-semibold mb-1.5" style={{ color: '#94A3B8' }}>{label}</label>
    <div className="relative">
      <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: '#475569' }} />
      <input
        {...registration}
        type={type}
        placeholder={placeholder}
        className="w-full rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-slate-600 input-glow transition"
        style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${error ? 'rgba(244,63,94,0.5)' : 'rgba(255,255,255,0.08)'}` }}
      />
    </div>
    {error && <p className="mt-1.5 text-xs font-medium" style={{ color: '#F43F5E' }}>{error}</p>}
  </div>
);

// ── LoadingButton ─────────────────────────────────────────────────────────────
interface LoadingButtonProps {
  loading: boolean;
  label: string;
  loadingLabel?: string;
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({ loading, label, loadingLabel = 'Please wait...' }) => (
  <button
    type="submit"
    disabled={loading}
    className="group w-full btn-primary flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-white disabled:opacity-60 transition-all"
  >
    {loading ? (
      <><Loader2 className="h-4 w-4 animate-spin" /><span>{loadingLabel}</span></>
    ) : (
      <><span>{label}</span><ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></>
    )}
  </button>
);

// ── ErrorAlert ────────────────────────────────────────────────────────────────
interface ErrorAlertProps { message: string; }

export const ErrorAlert: React.FC<ErrorAlertProps> = ({ message }) => (
  <div className="flex items-center gap-2 rounded-xl p-3 mb-4 text-xs font-semibold"
    style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)', color: '#F43F5E' }}>
    <AlertCircle className="h-4 w-4 shrink-0" />
    <span>{message}</span>
  </div>
);
