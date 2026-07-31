import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { authApi, extractError } from '@/lib/api';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (ev: FormEvent) => {
    ev.preventDefault();
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      toast.success('If an account exists, a reset code was sent.');
      navigate('/reset-password', { state: { email } });
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Reset your password" subtitle="Enter your email and we'll send you a 6-digit reset code.">
      <form onSubmit={onSubmit} className="space-y-4">
        <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" />
        <Button type="submit" loading={loading} className="w-full" size="lg">Send reset code</Button>
      </form>
      <p className="text-sm text-fg-muted text-center mt-6">
        Remembered it? <Link to="/login" className="text-crimson font-medium hover:underline">Back to sign in</Link>
      </p>
    </AuthLayout>
  );
}
