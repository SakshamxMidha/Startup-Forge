import { useState, FormEvent } from 'react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Moon, Sun, KeyRound, UserCircle, Shield } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { authApi, extractError } from '@/lib/api';

export default function Settings() {
  const { user } = useAuth();
  const { theme, toggle } = useTheme();
  const [sending, setSending] = useState(false);
  const [resetStep, setResetStep] = useState<'idle' | 'code'>('idle');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const requestReset = async () => {
    if (!user) return;
    setSending(true);
    try {
      await authApi.forgotPassword(user.email);
      toast.success('Reset code sent to your email.');
      setResetStep('code');
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setSending(false);
    }
  };

  const submitReset = async (ev: FormEvent) => {
    ev.preventDefault();
    if (!user) return;
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setSaving(true);
    try {
      await authApi.resetPassword(user.email, code, newPassword);
      toast.success('Password changed. Other sessions were signed out.');
      setResetStep('idle');
      setCode('');
      setNewPassword('');
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-6 py-10">
        <PageHeader title="Settings" subtitle="Account, appearance, and security." showKatana />

        <div className="space-y-5">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <Card hover className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2"><UserCircle className="w-4 h-4 text-crimson" /> Account</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{user?.email}</p>
                  <p className="text-xs text-fg-subtle mt-0.5">
                    Member since {user ? new Date(user.createdAt).toLocaleDateString() : '—'}
                  </p>
                </div>
                <Badge tone="success"><Shield className="w-3 h-3" /> Verified</Badge>
              </div>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
            <Card hover className="p-6">
              <h3 className="font-semibold mb-4">Appearance</h3>
              <div className="flex items-center justify-between">
                <p className="text-sm text-fg-muted">Theme</p>
                <Button variant="secondary" size="sm" onClick={toggle}>
                  {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  {theme === 'dark' ? 'Switch to light' : 'Switch to dark'}
                </Button>
              </div>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}>
            <Card hover className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2"><KeyRound className="w-4 h-4 text-warning" /> Change password</h3>
              {resetStep === 'idle' ? (
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm text-fg-muted">We'll email you a 6-digit code to confirm it's you.</p>
                  <Button variant="secondary" size="sm" onClick={requestReset} loading={sending}>
                    Send code
                  </Button>
                </div>
              ) : (
                <form onSubmit={submitReset} className="space-y-4">
                  <Input
                    label="Code from email" inputMode="numeric" maxLength={6}
                    value={code} onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456" className="text-center tracking-[0.5em] font-mono"
                  />
                  <Input label="New password" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="••••••••" />
                  <div className="flex gap-2">
                    <Button type="submit" loading={saving}>Update password</Button>
                    <Button type="button" variant="ghost" onClick={() => setResetStep('idle')}>Cancel</Button>
                  </div>
                </form>
              )}
            </Card>
          </motion.div>
        </div>
      </div>
    </AppShell>
  );
}
