import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, User, Building2, Phone, ShieldCheck, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../auth/AuthContext';
import AuthLayout from '../components/ui/AuthLayout';
import PasswordInput from '../components/ui/PasswordInput';
import { InputField, LoadingButton, ErrorAlert } from '../components/ui/FormComponents';
import { usePageTitle } from '../hooks/usePageTitle';

const schema = z.object({
  role: z.enum(['agency', 'client'], { errorMap: () => ({ message: 'Please select a role' }) }),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Enter a valid email address'),
  companyName: z.string().min(2, 'Company name is required'),
  phone: z.string().min(7, 'Enter a valid phone number'),
  password: z
    .string()
    .min(8, 'Minimum 8 characters')
    .regex(/[A-Z]/, 'Must contain an uppercase letter')
    .regex(/[a-z]/, 'Must contain a lowercase letter')
    .regex(/[0-9]/, 'Must contain a number')
    .regex(/[^A-Za-z0-9]/, 'Must contain a special character'),
  confirmPassword: z.string(),
  terms: z.literal(true, { errorMap: () => ({ message: 'You must accept the terms' }) }),
}).refine(d => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type FormData = z.infer<typeof schema>;

const RegisterPage: React.FC = () => {
  usePageTitle('Register — Client Portal Lite');
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [authError, setAuthError] = useState('');

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setAuthError('');
    const { error } = await signUp(data.email, data.password, data.fullName, data.companyName, data.role);
    if (error) { setAuthError(error); return; }
    toast.success('Account created successfully!');
    navigate(data.role === 'agency' ? '/agency' : '/client');
  };

  return (
    <AuthLayout title="Create Account" subtitle="Set up your Client Portal workspace">
      {authError && <ErrorAlert message={authError} />}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        {/* Role selector */}
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: '#94A3B8' }}>Account Type</label>
          <div className="grid grid-cols-2 gap-2">
            {(['agency', 'client'] as const).map(r => {
              const Icon = r === 'agency' ? ShieldCheck : Users;
              const checked = watch('role') === r;
              return (
                <label key={r} className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 cursor-pointer transition" style={{
                  background: checked ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${checked ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.08)'}`,
                }}>
                  <input type="radio" value={r} {...register('role')} className="hidden" />
                  <Icon className="h-4 w-4 shrink-0" style={{ color: checked ? '#818CF8' : '#475569' }} />
                  <span className="text-xs font-semibold capitalize" style={{ color: checked ? '#A5B4FC' : '#64748B' }}>{r}</span>
                </label>
              );
            })}
          </div>
          {errors.role && <p className="mt-1 text-xs font-medium" style={{ color: '#F43F5E' }}>{errors.role.message}</p>}
        </div>

        <InputField label="Full Name" placeholder="John Smith" icon={User} error={errors.fullName?.message} registration={register('fullName')} />
        <InputField label="Email Address" type="email" placeholder="your@email.com" icon={Mail} error={errors.email?.message} registration={register('email')} />
        <InputField label="Company Name" placeholder="Acme Inc." icon={Building2} error={errors.companyName?.message} registration={register('companyName')} />
        <InputField label="Phone Number" type="tel" placeholder="+1 234 567 8900" icon={Phone} error={errors.phone?.message} registration={register('phone')} />

        <PasswordInput label="Password" showStrength error={errors.password?.message} registration={register('password')} />
        <PasswordInput label="Confirm Password" error={errors.confirmPassword?.message} registration={register('confirmPassword')} />

        {/* Terms */}
        <div>
          <label className="flex items-start gap-2 cursor-pointer">
            <input type="checkbox" {...register('terms')} className="mt-0.5 h-3.5 w-3.5 rounded accent-indigo-500 shrink-0" />
            <span className="text-xs leading-relaxed" style={{ color: '#64748B' }}>
              I agree to the{' '}
              <span className="font-semibold cursor-pointer hover:opacity-80" style={{ color: '#818CF8' }}>Terms of Service</span>
              {' '}and{' '}
              <span className="font-semibold cursor-pointer hover:opacity-80" style={{ color: '#818CF8' }}>Privacy Policy</span>
            </span>
          </label>
          {errors.terms && <p className="mt-1 text-xs font-medium" style={{ color: '#F43F5E' }}>{errors.terms.message}</p>}
        </div>

        <LoadingButton loading={isSubmitting} label="Create Account" loadingLabel="Creating account..." />
      </form>

      <p className="mt-5 text-center text-xs" style={{ color: '#475569' }}>
        Already have an account?{' '}
        <Link to="/login" className="font-bold transition hover:opacity-80" style={{ color: '#818CF8' }}>Sign In</Link>
      </p>
    </AuthLayout>
  );
};

export default RegisterPage;
