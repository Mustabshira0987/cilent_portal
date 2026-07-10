import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useAuth } from '../auth/AuthContext';
import AuthLayout from '../components/ui/AuthLayout';
import PasswordInput from '../components/ui/PasswordInput';
import { LoadingButton, ErrorAlert } from '../components/ui/FormComponents';
import { usePageTitle } from '../hooks/usePageTitle';

const schema = z.object({
  password: z
    .string()
    .min(8, 'Minimum 8 characters')
    .regex(/[A-Z]/, 'Must contain an uppercase letter')
    .regex(/[a-z]/, 'Must contain a lowercase letter')
    .regex(/[0-9]/, 'Must contain a number')
    .regex(/[^A-Za-z0-9]/, 'Must contain a special character'),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type FormData = z.infer<typeof schema>;

const ResetPasswordPage: React.FC = () => {
  usePageTitle('Reset Password — Client Portal Lite');
  const { updatePassword } = useAuth();
  const navigate = useNavigate();
  const [authError, setAuthError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setAuthError('');
    const { error } = await updatePassword(data.password);
    if (error) { setAuthError(error); return; }
    toast.success('Password updated successfully!');
    navigate('/login');
  };

  return (
    <AuthLayout title="Reset Password" subtitle="Enter your new password below">
      {authError && <ErrorAlert message={authError} />}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <PasswordInput label="New Password" showStrength error={errors.password?.message} registration={register('password')} />
        <PasswordInput label="Confirm New Password" error={errors.confirmPassword?.message} registration={register('confirmPassword')} />
        <LoadingButton loading={isSubmitting} label="Update Password" loadingLabel="Updating..." />
      </form>
    </AuthLayout>
  );
};

export default ResetPasswordPage;
