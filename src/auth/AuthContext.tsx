import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseEnabled } from '../services/supabase';

interface AuthUser { email: string; id: string; fullName: string; role: 'agency' | 'client'; }

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null; role?: 'agency' | 'client' }>;
  signUp: (email: string, password: string, fullName: string, companyName: string, role: 'agency' | 'client') => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<{ error: string | null }>;
  updatePassword: (password: string) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ── Local (no-Supabase) helpers ──────────────────────────────────────────────
const LOCAL_ACCOUNTS = 'cpl_accounts';
const LOCAL_SESSION  = 'cpl_session';

interface LocalAccount { id: string; email: string; password: string; fullName: string; companyName: string; role: 'agency' | 'client'; }

const getLocalAccounts = (): LocalAccount[] =>
  JSON.parse(localStorage.getItem(LOCAL_ACCOUNTS) || '[]');

const saveLocalAccounts = (a: LocalAccount[]) =>
  localStorage.setItem(LOCAL_ACCOUNTS, JSON.stringify(a));

// ── Provider ─────────────────────────────────────────────────────────────────
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser]       = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    if (isSupabaseEnabled && supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) setUser({
          id: session.user.id,
          email: session.user.email!,
          fullName: session.user.user_metadata?.full_name || session.user.email!,
          role: session.user.user_metadata?.role || 'client',
        });
        setLoading(false);
      });
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
        setUser(session?.user ? {
          id: session.user.id,
          email: session.user.email!,
          fullName: session.user.user_metadata?.full_name || session.user.email!,
          role: session.user.user_metadata?.role || 'client',
        } : null);
      });
      return () => subscription.unsubscribe();
    } else {
      // Local fallback
      const stored = localStorage.getItem(LOCAL_SESSION);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (!parsed.fullName || !parsed.role) {
          const account = getLocalAccounts().find(a => a.email === parsed.email);
          if (account) { parsed.fullName = account.fullName; parsed.role = account.role; }
        }
        setUser(parsed);
      }
      setLoading(false);
    }
  }, []);

  // ── Sign In ────────────────────────────────────────────────────────────────
  const signIn = useCallback(async (email: string, password: string) => {
    if (isSupabaseEnabled && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      return { error: error?.message ?? null, role: data?.user?.user_metadata?.role as 'agency' | 'client' || 'client' };
    }
    const match = getLocalAccounts().find(a => a.email === email && a.password === password);
    if (!match) return { error: 'Invalid email or password.', role: undefined };
    const u = { id: match.id, email: match.email, fullName: match.fullName, role: match.role };
    setUser(u);
    localStorage.setItem(LOCAL_SESSION, JSON.stringify(u));
    return { error: null, role: match.role };
  }, []);

  // ── Sign Up ────────────────────────────────────────────────────────────────
  const signUp = useCallback(async (email: string, password: string, fullName: string, companyName: string, role: 'agency' | 'client') => {
    if (isSupabaseEnabled && supabase) {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { data: { full_name: fullName, company_name: companyName, role } },
      });
      return { error: error?.message ?? null };
    }
    const accounts = getLocalAccounts();
    if (accounts.find(a => a.email === email)) return { error: 'An account with this email already exists.' };
    const newAccount: LocalAccount = { id: `local_${Date.now()}`, email, password, fullName, companyName, role };
    saveLocalAccounts([...accounts, newAccount]);
    const u = { id: newAccount.id, email, fullName, role };
    setUser(u);
    localStorage.setItem(LOCAL_SESSION, JSON.stringify(u));
    return { error: null };
  }, []);

  // ── Sign Out ───────────────────────────────────────────────────────────────
  const signOut = useCallback(async () => {
    if (isSupabaseEnabled && supabase) await supabase.auth.signOut();
    setUser(null);
    localStorage.removeItem(LOCAL_SESSION);
  }, []);

  // ── Password Reset ─────────────────────────────────────────────────────────
  const sendPasswordReset = useCallback(async (email: string) => {
    if (isSupabaseEnabled && supabase) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      return { error: error?.message ?? null };
    }
    const exists = getLocalAccounts().find(a => a.email === email);
    if (!exists) return { error: 'No account found with this email.' };
    return { error: null }; // local: just simulate success
  }, []);

  // ── Update Password ────────────────────────────────────────────────────────
  const updatePassword = useCallback(async (password: string) => {
    if (isSupabaseEnabled && supabase) {
      const { error } = await supabase.auth.updateUser({ password });
      return { error: error?.message ?? null };
    }
    if (!user) return { error: 'Not authenticated.' };
    const accounts = getLocalAccounts().map(a =>
      a.email === user.email ? { ...a, password } : a
    );
    saveLocalAccounts(accounts);
    return { error: null };
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, sendPasswordReset, updatePassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
