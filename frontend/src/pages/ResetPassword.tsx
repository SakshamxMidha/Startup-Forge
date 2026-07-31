import { FormEvent, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { authApi, extractError } from '@/lib/api';

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState<string>((location.state as { email?: string })?.email ?? '');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (ev: FormEvent) => {
    ev.preventDefault();
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await authApi.resetPassword(email, code, newPassword);
      toast.success('Password reset! Sign in with your new password.');
      navigate('/login');
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Set a new password" subtitle="Enter the code from your email and choose a new password.">
      <form onSubmit={onSubmit} className="space-y-4">
        <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" />
        <Input
          label="Reset code" inputMode="numeric" maxLength={6}
          value={code} onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
          placeholder="123456" className="text-center tracking-[0.5em] font-mono text-lg"
        />
        <Input label="New password" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="••••••••" autoComplete="new-password" />
        <Button type="submit" loading={loading} className="w-full" size="lg">Reset password</Button>
      </form>
      <p className="text-sm text-fg-muted text-center mt-6">
        <Link to="/login" className="text-crimson font-medium hover:underline">Back to sign in</Link>
      </p>
    </AuthLayout>
  );
}
