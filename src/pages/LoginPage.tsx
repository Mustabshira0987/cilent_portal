import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../auth/AuthContext';
import AuthLayout from '../components/ui/AuthLayout';
import PasswordInput from '../components/ui/PasswordInput';
import { InputField, LoadingButton, ErrorAlert } from '../components/ui/FormComponents';
import { usePageTitle } from '../hooks/usePageTitle';

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

type FormData = z.infer<typeof schema>;

const LoginPage: React.FC = () => {
  usePageTitle('Sign In — Client Portal Lite');
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [authError, setAuthError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setAuthError('');
    const { error, role } = await signIn(data.email, data.password);
    if (error) { setAuthError(error); return; }
    toast.success('Welcome back!');
    navigate(role === 'agency' ? '/agency' : '/client', { replace: true });
  };

  return (
    <AuthLayout title="Welcome Back" subtitle="Sign in to your Client Portal">
      {authError && <ErrorAlert message={authError} />}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <InputField
          label="Email Address"
          type="email"
          placeholder="your@email.com"
          icon={Mail}
          error={errors.email?.message}
          registration={register('email')}
        />

        <PasswordInput
          label="Password"
          error={errors.password?.message}
          registration={register('password')}
        />

        {/* Remember me + Forgot password */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              {...register('rememberMe')}
              className="h-3.5 w-3.5 rounded accent-indigo-500"
            />
            <span className="text-xs" style={{ color: '#64748B' }}>Remember me</span>
          </label>
          <Link to="/forgot-password" className="text-xs font-semibold transition hover:opacity-80" style={{ color: '#818CF8' }}>
            Forgot password?
          </Link>
        </div>

        <LoadingButton loading={isSubmitting} label="Sign In" />
      </form>

      <p className="mt-6 text-center text-xs" style={{ color: '#475569' }}>
        Don't have an account?{' '}
        <Link to="/register" className="font-bold transition hover:opacity-80" style={{ color: '#818CF8' }}>
          Register
        </Link>
      </p>
    </AuthLayout>
  );
};

export default LoginPage;
