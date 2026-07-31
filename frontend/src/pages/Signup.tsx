import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { authApi, extractError } from '@/lib/api';

export default function Signup() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; confirm?: string }>({});

  const validate = () => {
    const e: typeof errors = {};
    if (!/^\S+@\S+\.\S+$/.test(email)) e.email = 'Enter a valid email address';
    if (password.length < 6) e.password = 'At least 6 characters';
    if (confirm !== password) e.confirm = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (ev: FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await authApi.signup(email, password);
      toast.success('Account created! Check your email for a code.');
      navigate('/verify-email', { state: { email } });
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Create your account" subtitle="Start validating your startup ideas in seconds.">
      <form onSubmit={onSubmit} className="space-y-4">
        <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} error={errors.email} placeholder="you@company.com" autoComplete="email" />
        <Input label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} error={errors.password} placeholder="••••••••" autoComplete="new-password" />
        <Input label="Confirm password" type="password" value={confirm} onChange={e => setConfirm(e.target.value)} error={errors.confirm} placeholder="••••••••" autoComplete="new-password" />
        <Button type="submit" loading={loading} className="w-full" size="lg">Create account</Button>
      </form>
      <p className="text-sm text-fg-muted text-center mt-6">
        Already have an account? <Link to="/login" className="text-crimson font-medium hover:underline">Sign in</Link>
      </p>
    </AuthLayout>
  );
}
