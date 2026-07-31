import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { extractError } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (ev: FormEvent) => {
    ev.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      const msg = extractError(err);
      toast.error(msg);
      if (msg.toLowerCase().includes('verify')) {
        navigate('/verify-email', { state: { email } });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to continue building.">
      <form onSubmit={onSubmit} className="space-y-4">
        <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" autoComplete="email" />
        <Input label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" />
        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-sm text-crimson hover:underline">Forgot password?</Link>
        </div>
        <Button type="submit" loading={loading} className="w-full" size="lg">Sign in</Button>
      </form>
      <p className="text-sm text-fg-muted text-center mt-6">
        New here? <Link to="/signup" className="text-crimson font-medium hover:underline">Create an account</Link>
      </p>
    </AuthLayout>
  );
}
