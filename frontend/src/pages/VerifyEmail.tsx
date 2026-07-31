import { FormEvent, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { MailCheck } from 'lucide-react';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { authApi, extractError } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const { acceptTokens } = useAuth();
  const [email, setEmail] = useState<string>((location.state as { email?: string })?.email ?? '');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (ev: FormEvent) => {
    ev.preventDefault();
    if (!email || code.length !== 6) {
      toast.error('Enter your email and the 6-digit code');
      return;
    }
    setLoading(true);
    try {
      const { accessToken, refreshToken } = await authApi.verifyEmail(email, code);
      await acceptTokens({ accessToken, refreshToken });
      toast.success('Email verified — welcome!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Verify your email" subtitle="We sent a 6-digit code to your inbox. It expires in 15 minutes.">
      <motion.div
        initial={{ scale: 0 }} animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.15 }}
        className="w-14 h-14 mx-auto mb-6 rounded-2xl bg-success/12 text-success flex items-center justify-center"
      >
        <MailCheck className="w-7 h-7" />
      </motion.div>
      <form onSubmit={onSubmit} className="space-y-4">
        <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" />
        <Input
          label="Verification code" inputMode="numeric" maxLength={6}
          value={code} onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
          placeholder="123456" className="text-center tracking-[0.5em] font-mono text-lg"
        />
        <Button type="submit" loading={loading} className="w-full" size="lg">Verify & continue</Button>
      </form>
      <p className="text-sm text-fg-muted text-center mt-6">
        Wrong email? <Link to="/signup" className="text-crimson font-medium hover:underline">Sign up again</Link> to get a fresh code.
      </p>
    </AuthLayout>
  );
}
