// ============================================================
// AgriSmart — Login Page (Phone/Email + OTP + Demo Accounts)
// ============================================================
import { AlertBanner,Badge,Button,Card,Input } from '@/components/ui';
import { translate } from '@/i18n';
import { cn } from '@/lib/utils';
import { demoLogin,useAppStore } from '@/store';
import { AnimatePresence,motion } from 'framer-motion';
import { Building2,KeyRound,Mail,Phone,ShieldCheck,Smartphone,Sprout,UserCog } from 'lucide-react';
import { useState } from 'react';
import { Link,useNavigate } from 'react-router-dom';

export function LoginPage() {
  const navigate = useNavigate();
  const { locale, login } = useAppStore();
  const t = (k: string) => translate(k, locale);

  const [mode, setMode] = useState<'phone' | 'email'>('phone');
  const [step, setStep] = useState<'credentials' | 'otp'>('credentials');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOtp = () => {
    if (mode === 'phone' && phone.length < 10) { setError('Enter a valid 10-digit phone number'); return; }
    if (mode === 'email' && !email.includes('@')) { setError('Enter a valid email address'); return; }
    setError('');
    setLoading(true);
    setTimeout(() => { setLoading(false); setStep('otp'); }, 1200);
  };

  const handleVerifyOtp = () => {
    if (otp.length < 6) { setError('Enter the 6-digit OTP'); return; }
    setError('');
    setLoading(true);
    setTimeout(() => {
      const userId = demoLogin('farmer');
      setLoading(false);
      if (userId) {
        login(userId, 'farmer');
        navigate('/farmer');
      }
    }, 700);
  };

  const handleDemoLogin = (role: 'farmer' | 'buyer' | 'verifier' | 'admin') => {
    const userId = demoLogin(role);
    if (userId) {
      login(userId, role);
      navigate(`/${role}`);
    }
  };

  const demoAccounts = [
    { role: 'farmer' as const, name: 'Rajesh Patel', desc: 'Gujarat · Cotton farmer', icon: <Sprout className="w-5 h-5" /> },
    { role: 'buyer' as const, name: 'Anand Agro Industries', desc: 'Gujarat · Agro buyer', icon: <Building2 className="w-5 h-5" /> },
    { role: 'verifier' as const, name: 'Dr. Meena Krishnan', desc: 'Tamil Nadu · Field verifier', icon: <ShieldCheck className="w-5 h-5" /> },
    { role: 'admin' as const, name: 'Platform Admin', desc: 'System administrator', icon: <UserCog className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-soft via-brand-cream to-brand-soft p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-brand-primary text-white">
            <Sprout className="w-6 h-6" />
          </div>
          <span className="text-xl font-bold text-brand-text">AgriSmart</span>
        </Link>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-6 sm:p-8 shadow-lift">
            <h1 className="text-xl font-bold text-brand-text text-center mb-1">{t('auth.login')}</h1>
            <p className="text-sm text-brand-muted text-center mb-6">Secure sandbox login with phone or email</p>

            {/* Mode toggle */}
            <div className="flex gap-2 p-1 bg-brand-cream rounded-lg mb-5">
              <button type="button" onClick={() => { setMode('phone'); setStep('credentials'); setError(''); }} className={cn('flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-colors', mode === 'phone' ? 'bg-brand-card text-brand-primary shadow-sm' : 'text-brand-muted')}>
                <Phone className="w-4 h-4" /> {t('auth.phoneLogin')}
              </button>
              <button type="button" onClick={() => { setMode('email'); setStep('credentials'); setError(''); }} className={cn('flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-colors', mode === 'email' ? 'bg-brand-card text-brand-primary shadow-sm' : 'text-brand-muted')}>
                <Mail className="w-4 h-4" /> {t('auth.emailLogin')}
              </button>
            </div>

            <AnimatePresence mode="wait">
              {step === 'credentials' ? (
                <motion.div key="creds" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                  {mode === 'phone' ? (
                    <Input label={t('auth.phone')} placeholder="98765 43210" prefix="+91" icon={<Phone className="w-4 h-4" />} value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} />
                  ) : (
                    <Input label={t('auth.email')} placeholder="you@example.com" icon={<Mail className="w-4 h-4" />} value={email} onChange={e => setEmail(e.target.value)} />
                  )}
                  {error && <AlertBanner type="error" title={error} />}
                  <Button className="w-full" onClick={handleSendOtp} loading={loading} icon={!loading ? <KeyRound className="w-4 h-4" /> : undefined}>
                    {t('auth.sendOtp')}
                  </Button>
                </motion.div>
              ) : (
                <motion.div key="otp" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                  <div className="text-center">
                    <Badge variant="info" className="mb-2">OTP Sent (Sandbox)</Badge>
                    <p className="text-xs text-brand-muted">Enter any 6 digits to open the seeded farmer workspace. No OTP is sent in this sandbox.</p>
                  </div>
                  <Input label={t('auth.otp')} placeholder="000000" icon={<KeyRound className="w-4 h-4" />} value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} maxLength={6} />
                  {error && <AlertBanner type="error" title={error} />}
                  <Button className="w-full" onClick={handleVerifyOtp} loading={loading}>
                    {t('auth.verifyOtp')}
                  </Button>
                  <button type="button" onClick={() => { setStep('credentials'); setOtp(''); setError(''); }} className="w-full text-sm text-brand-muted hover:text-brand-primary">
                    ← {t('common.back')}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <p className="text-center text-sm text-brand-muted mt-5">
              {t('auth.noAccount')} <Link to="/register" className="text-brand-primary font-medium hover:underline">{t('auth.createAccount')}</Link>
            </p>
          </Card>
        </motion.div>

        {/* Demo accounts */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mt-4">
          <Card className="p-4">
            <p className="text-xs font-semibold text-brand-muted uppercase mb-3 flex items-center gap-2"><Smartphone className="w-3.5 h-3.5" /> {t('auth.demoAccounts')}</p>
            <div className="grid sm:grid-cols-2 gap-2">
              {demoAccounts.map(acc => (
                <button type="button" key={acc.role} onClick={() => handleDemoLogin(acc.role)} className="flex items-start gap-2.5 p-2.5 rounded-lg border border-brand-border hover:border-brand-primary hover:bg-brand-soft transition-all text-left group">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-brand-soft text-brand-primary shrink-0 group-hover:scale-110 transition-transform">{acc.icon}</div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-brand-text truncate">{acc.name}</p>
                    <p className="text-[10px] text-brand-muted truncate">{acc.desc}</p>
                    <p className="text-[10px] text-brand-primary font-medium mt-0.5 capitalize">Login as {acc.role} →</p>
                  </div>
                </button>
              ))}
            </div>
          </Card>
        </motion.div>

        <p className="text-center text-xs text-brand-muted mt-4">{t('footer.sandboxDisclaimer')}</p>
      </div>
    </div>
  );
}
