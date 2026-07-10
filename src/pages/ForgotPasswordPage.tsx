import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import AuthLayout from '../components/ui/AuthLayout';
import { InputField, LoadingButton, ErrorAlert } from '../components/ui/FormComponents';
import { usePageTitle } from '../hooks/usePageTitle';

const schema = z.object({ email: z.string().email('Enter a valid email address') });
type FormData = z.infer<typeof schema>;

const ForgotPasswordPage: React.FC = () => {
  usePageTitle('Forgot Password — Client Portal Lite');
  const { sendPasswordReset } = useAuth();
  const [sent, setSent] = useState(false);
  const [authError, setAuthError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setAuthError('');
    const { error } = await sendPasswordReset(data.email);
    if (error) { setAuthError(error); return; }
    setSent(true);
  };

  return (
    <AuthLayout title="Forgot Password" subtitle="We'll send you a reset link">
      {sent ? (
        <div className="text-center py-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl mb-4" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)' }}>
            <CheckCircle2 className="h-7 w-7" style={{ color: '#10B981' }} />
          </div>
          <h3 className="text-base font-bold text-white mb-2">Check your email</h3>
          <p className="text-xs leading-relaxed mb-6" style={{ color: '#64748B' }}>
            We've sent a password reset link to your email address. Please check your inbox.
          </p>
          <Link to="/login" className="text-xs font-bold transition hover:opacity-80" style={{ color: '#818CF8' }}>
            Back to Sign In
          </Link>
        </div>
      ) : (
        <>
          {authError && <ErrorAlert message={authError} />}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <InputField label="Email Address" type="email" placeholder="your@email.com" icon={Mail} error={errors.email?.message} registration={register('email')} />
            <LoadingButton loading={isSubmitting} label="Send Reset Link" loadingLabel="Sending..." />
          </form>
          <p className="mt-6 text-center">
            <Link to="/login" className="inline-flex items-center gap-1.5 text-xs font-semibold transition hover:opacity-80" style={{ color: '#64748B' }}>
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Sign In
            </Link>
          </p>
        </>
      )}
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
