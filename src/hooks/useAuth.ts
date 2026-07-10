import { useState } from 'react';

const SESSION_KEY = 'cpl_session';
const ACCOUNTS_KEY = 'cpl_accounts';
const LAST_EMAIL_KEY = 'cpl_last_email';

// Force wipe all old stale data
const CLEAN_VERSION = 'v3';
if (localStorage.getItem('cpl_clean') !== CLEAN_VERSION) {
  Object.keys(localStorage)
    .filter(k => k.startsWith('cpl_'))
    .forEach(k => localStorage.removeItem(k));
  localStorage.setItem('cpl_clean', CLEAN_VERSION);
}

interface Account { email: string; password: string; }

const getAccounts = (): Account[] =>
  JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || '[]');

const saveAccounts = (accounts: Account[]) =>
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));

export function useAuth() {
  const [user, setUser] = useState<{ email: string } | null>(null);

  const signIn = async (email: string, password: string) => {
    const match = getAccounts().find(a => a.email === email && a.password === password);
    if (!match) return { error: { message: 'Invalid email or password.' } };
    setUser({ email });
    localStorage.setItem(SESSION_KEY, email);
    localStorage.setItem(LAST_EMAIL_KEY, email);
    return { error: null };
  };

  const signUp = async (email: string, password: string) => {
    if (!email || !password) return { error: { message: 'Email and password required.' } };
    const accounts = getAccounts();
    if (accounts.find(a => a.email === email))
      return { error: { message: 'An account with this email already exists.' } };
    saveAccounts([...accounts, { email, password }]);
    setUser({ email });
    localStorage.setItem(SESSION_KEY, email);
    localStorage.setItem(LAST_EMAIL_KEY, email);
    return { error: null };
  };

  const signOut = async () => {
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
  };

  const getSavedAccounts = (): Account[] => getAccounts();

  const getLastEmail = (): string => localStorage.getItem(LAST_EMAIL_KEY) || '';

  return { user, signIn, signUp, signOut, getSavedAccounts, getLastEmail };
}
