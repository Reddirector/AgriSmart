// ============================================================
// AgriSmart — Farmer Verification Page
// ============================================================
import { AlertBanner,Button,Card,Input,SectionHeader,VerificationBadge } from '@/components/ui';
import { translate } from '@/i18n';
import { cn } from '@/lib/utils';
import { useCurrentUser } from '@/store';
import { AnimatePresence,motion } from 'framer-motion';
import { Banknote,CheckCircle2,CreditCard,Eye,Loader2,Lock,MapPin,ShieldCheck } from 'lucide-react';
import { useState } from 'react';

export function FarmerVerification() {
  const user = useCurrentUser();
  const [verifying, setVerifying] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, 'verified' | 'pending'>>({});
  const t = (k: string) => translate(k, user?.language || 'en');

  const verifyItems = [
    { id: 'identity', icon: <ShieldCheck className="w-6 h-6" />, title: t('verify.aadhaar'), desc: 'Mock Aadhaar verification — not connected to UIDAI', status: user?.identityVerified || 'unverified', fields: [{ label: 'Aadhaar Number (masked)', placeholder: 'XXXX-XXXX-1234', hint: 'Only verification token stored, never the full number' }, { label: 'Name as per Aadhaar', placeholder: 'Your full name' }] },
    { id: 'kcc', icon: <CreditCard className="w-6 h-6" />, title: t('verify.kcc'), desc: 'Mock KCC verification — not connected to any bank', status: user?.kccStatus || 'unverified', fields: [{ label: 'KCC Number', placeholder: 'Enter KCC number', hint: 'Only verification status stored' }, { label: 'Issuing Bank', placeholder: 'e.g. State Bank of India' }] },
    { id: 'farm', icon: <MapPin className="w-6 h-6" />, title: t('verify.farmOwnership'), desc: 'Verify farm ownership or cultivation rights', status: 'pending' as const, fields: [{ label: 'Land Survey Number', placeholder: 'e.g. 123/45A' }, { label: 'Ownership Type', placeholder: 'Owned / Leased / Shared' }] },
    { id: 'bank', icon: <Banknote className="w-6 h-6" />, title: t('verify.bankAccount'), desc: 'Verify bank account for payment processing', status: 'unverified' as const, fields: [{ label: 'Account Number (masked)', placeholder: 'XXXXXX1234' }, { label: 'IFSC Code', placeholder: 'e.g. SBIN0001234' }] },
  ];

  const handleVerify = (id: string) => {
    setVerifying(id);
    setTimeout(() => {
      setVerifying(null);
      setResults(prev => ({ ...prev, [id]: 'verified' }));
    }, 1800);
  };

  return (
    <div className="space-y-6">
      <div><h1 className="text-xl font-bold text-brand-text">{t('verify.title')}</h1><p className="text-sm text-brand-muted">Complete verification to build trust with buyers</p></div>

      {/* Sandbox notice */}
      <AlertBanner type="warning" title={t('verify.sandboxNotice')} message="All verification results are clearly labeled as sandbox data. No real connections to UIDAI, banks, or government platforms." />

      {/* Verification summary */}
      <Card className="p-5">
        <SectionHeader title="Verification Status" icon={<ShieldCheck className="w-5 h-5" />} />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {verifyItems.map(item => {
            const status = results[item.id] || item.status;
            return (
              <div key={item.id} className="text-center p-3 rounded-lg border border-brand-border">
                <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-2', status === 'verified' ? 'bg-brand-success/10 text-brand-success' : status === 'pending' ? 'bg-brand-warning/10 text-brand-warning' : 'bg-brand-muted/10 text-brand-muted')}>
                  {status === 'verified' ? <CheckCircle2 className="w-5 h-5" /> : item.icon}
                </div>
                <p className="text-xs font-medium text-brand-text">{item.title.split('(')[0].trim()}</p>
                <div className="mt-1"><VerificationBadge status={status as 'verified' | 'pending' | 'unverified'} /></div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Verification cards */}
      <div className="space-y-4">
        {verifyItems.map(item => {
          const status = results[item.id] || item.status;
          return (
            <motion.div key={item.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-xl bg-brand-soft text-brand-primary flex items-center justify-center shrink-0">{item.icon}</div>
                    <div>
                      <h3 className="text-base font-semibold text-brand-text">{item.title}</h3>
                      <p className="text-xs text-brand-muted mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                  <VerificationBadge status={status as 'verified' | 'pending' | 'unverified'} />
                </div>

                <AnimatePresence>
                  {status !== 'verified' && (
                    <motion.div initial={{ opacity: 0, height: 'auto' }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                      <div className="grid sm:grid-cols-2 gap-3 mb-3">
                        {item.fields.map(f => <Input key={f.label} label={f.label} placeholder={f.placeholder} hint={f.hint} />)}
                      </div>
                      <label className="flex items-center gap-2 text-sm text-brand-text cursor-pointer mb-3">
                        <input type="checkbox" className="rounded border-brand-border" /> {t('verify.consent')}
                      </label>
                      {verifying === item.id ? (
                        <div className="flex items-center gap-2 py-2"><Loader2 className="w-5 h-5 animate-spin text-brand-primary" /><span className="text-sm text-brand-muted">Verifying…</span></div>
                      ) : (
                        <Button onClick={() => handleVerify(item.id)} icon={<ShieldCheck className="w-4 h-4" />}>Start Verification</Button>
                      )}
                    </motion.div>
                  )}
                  {status === 'verified' && (
                    <AlertBanner type="success" title="Verified (Sandbox)" message="Mock verification completed. Token stored. No real identity data retained." />
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Privacy info */}
      <Card className="p-5 bg-brand-soft/30">
        <div className="flex items-start gap-3">
          <Lock className="w-5 h-5 text-brand-primary shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-semibold text-brand-text">Privacy & Data Protection</p>
            <ul className="text-xs text-brand-muted space-y-1">
              <li className="flex items-center gap-1.5"><Eye className="w-3 h-3" /> {t('verify.masked')}</li>
              <li className="flex items-center gap-1.5"><Lock className="w-3 h-3" /> {t('verify.tokenOnly')}</li>
              <li>• No complete Aadhaar numbers stored</li>
              <li>• Sensitive data encrypted at rest</li>
              <li>• Consent records maintained</li>
              <li>• Data retention controls in place</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
