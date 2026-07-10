import { useState, useEffect } from 'react';

const SESSION_KEY = 'cpl_mock_user';
const ACCOUNTS_KEY = 'cpl_accounts';

interface Account { id: string; email: string; password: string; }

const getAccounts = (): Account[] => {
  const defaults: Account[] = [
    { id: 'agency@vortex.com', email: 'agency@vortex.com', password: 'demo1234' },
    { id: 'client@acme.com',   email: 'client@acme.com',   password: 'demo1234' },
  ];
  const stored = localStorage.getItem(ACCOUNTS_KEY);
  if (!stored) { localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(defaults)); return defaults; }
  return JSON.parse(stored) as Account[];
};

const saveAccounts = (accounts: Account[]) =>
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));

export function useAuth() {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [loading] = useState(false);

  useEffect(() => {
    if (user) localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    else localStorage.removeItem(SESSION_KEY);
  }, [user]);

  const signIn = async (email: string, password: string) => {
    const accounts = getAccounts();
    const match = accounts.find(a => a.email === email && a.password === password);
    if (!match) return { error: { message: 'Invalid email or password.' } };
    const loggedIn = { id: match.id, email: match.email };
    setUser(loggedIn);
    return { error: null };
  };

  const signUp = async (email: string, password: string) => {
    if (!email || !password) return { error: { message: 'Email and password required.' } };
    const accounts = getAccounts();
    if (accounts.find(a => a.email === email))
      return { error: { message: 'An account with this email already exists.' } };
    const newAccount: Account = { id: email, email, password };
    saveAccounts([...accounts, newAccount]);
    setUser({ id: email, email });
    return { error: null };
  };

  const signOut = async () => setUser(null);

  return { session: user ? { user } : null, user, loading, signIn, signUp, signOut };
}
