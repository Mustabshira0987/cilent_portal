import React, { useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';

interface PasswordInputProps {
  label: string;
  placeholder?: string;
  error?: string;
  showStrength?: boolean;
  registration: React.InputHTMLAttributes<HTMLInputElement>;
}

const getStrength = (password: string) => {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
};

const strengthLabel = ['', 'Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];
const strengthColor = ['', '#F43F5E', '#F59E0B', '#EAB308', '#10B981', '#06B6D4'];

const PasswordInput: React.FC<PasswordInputProps> = ({ label, placeholder = '••••••••', error, showStrength = false, registration }) => {
  const [show, setShow] = useState(false);
  const [value, setValue] = useState('');
  const strength = showStrength ? getStrength(value) : 0;

  return (
    <div>
      <label className="block text-xs font-semibold mb-1.5" style={{ color: '#94A3B8' }}>{label}</label>
      <div className="relative">
        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: '#475569' }} />
        <input
          {...registration}
          type={show ? 'text' : 'password'}
          placeholder={placeholder}
          onChange={e => { setValue(e.target.value); (registration as any).onChange?.(e); }}
          className="w-full rounded-xl py-3 pl-10 pr-11 text-sm text-white placeholder-slate-600 input-glow transition"
          style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${error ? 'rgba(244,63,94,0.5)' : 'rgba(255,255,255,0.08)'}` }}
        />
        <button type="button" onClick={() => setShow(v => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 transition" style={{ color: '#475569' }}>
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>

      {showStrength && value.length > 0 && (
        <div className="mt-2">
          <div className="flex gap-1 mb-1">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-1 flex-1 rounded-full transition-all duration-300"
                style={{ background: i <= strength ? strengthColor[strength] : 'rgba(255,255,255,0.08)' }} />
            ))}
          </div>
          <p className="text-[10px] font-semibold" style={{ color: strengthColor[strength] }}>
            {strengthLabel[strength]}
          </p>
        </div>
      )}

      {error && <p className="mt-1.5 text-xs font-medium" style={{ color: '#F43F5E' }}>{error}</p>}
    </div>
  );
};

export default PasswordInput;
