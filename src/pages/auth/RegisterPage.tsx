// ============================================================
// AgriSmart — Registration Page (Role Selection)
// ============================================================
import { AlertBanner,Badge,Button,Card } from '@/components/ui';
import { translate } from '@/i18n';
import { cn } from '@/lib/utils';
import { demoLogin,useAppStore } from '@/store';
import type { UserRole } from '@/types';
import { motion } from 'framer-motion';
import { ArrowRight,Building2,CheckCircle2,Info,ShieldCheck,Sprout,UserCog } from 'lucide-react';
import { useState,type ReactNode } from 'react';
import { Link,useNavigate } from 'react-router-dom';

export function RegisterPage() {
  const navigate = useNavigate();
  const { locale, login } = useAppStore();
  const t = (key: string) => translate(key, locale);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  const roles: { role: UserRole; icon: ReactNode; title: string; desc: string; features: string[] }[] = [
    { role: 'farmer', icon: <Sprout className="w-7 h-7" />, title: t('auth.farmer'), desc: 'Create a guided farm profile, then explore IoT, listings, agreements, and payments.', features: ['Guided onboarding', 'IoT dashboard', 'Marketplace listings', 'KCC verification'] },
    { role: 'buyer', icon: <Building2 className="w-7 h-7" />, title: t('auth.buyer'), desc: 'Open a seeded buyer workspace for verified sourcing and escrow workflows.', features: ['Supplier search', 'Escrow payments', 'Field inspections', 'Supplier analytics'] },
    { role: 'verifier', icon: <ShieldCheck className="w-7 h-7" />, title: t('auth.verifier'), desc: 'Open a seeded field-verification workspace with inspections and evidence.', features: ['Farm inspections', 'Crop verification', 'Delivery confirmation', 'Digital signatures'] },
    { role: 'admin', icon: <UserCog className="w-7 h-7" />, title: t('auth.admin'), desc: 'Open a seeded operations workspace for users, disputes, health, and audits.', features: ['User management', 'Dispute resolution', 'System monitoring', 'Audit logs'] },
  ];

  const continueWithRole = () => {
    if (!selectedRole) return;
    if (selectedRole === 'farmer') {
      navigate('/onboarding');
      return;
    }

    const userId = demoLogin(selectedRole);
    if (!userId) return;
    login(userId, selectedRole);
    navigate(`/${selectedRole}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-soft via-brand-cream to-brand-soft p-4 py-8">
      <div className="w-full max-w-3xl">
        <Link to="/" className="flex items-center justify-center gap-2 mb-6" aria-label="AgriSmart home">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-brand-primary text-white shadow-soft"><Sprout className="w-6 h-6" /></div>
          <span className="text-xl font-bold text-brand-text">AgriSmart</span>
        </Link>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-5 sm:p-8 shadow-lift">
            <div className="text-center mb-6">
              <Badge variant="primary" className="mb-3">Demo access</Badge>
              <h1 className="text-xl sm:text-2xl font-bold text-brand-text mb-1">{t('auth.selectRole')}</h1>
              <p className="text-sm text-brand-muted max-w-xl mx-auto">Choose a workspace. Farmer includes guided onboarding. Other roles open with complete seeded demo data.</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-3 sm:gap-4 mb-6" role="radiogroup" aria-label="Choose account role">
              {roles.map((roleOption) => {
                const selected = selectedRole === roleOption.role;
                return (
                  <button type="button"
                    key={roleOption.role}
                    onClick={() => setSelectedRole(roleOption.role)}
                    role="radio"
                    aria-checked={selected}
                    className={cn(
                      'text-left p-4 sm:p-5 rounded-xl border-2 transition-all',
                      selected
                        ? 'border-brand-primary bg-brand-soft shadow-soft -translate-y-0.5'
                        : 'border-brand-border hover:border-brand-primary/45 bg-brand-card hover:shadow-soft',
                    )}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className={cn('flex items-center justify-center w-12 h-12 rounded-xl shrink-0 transition-colors', selected ? 'bg-brand-primary text-white' : 'bg-brand-soft text-brand-primary')}>{roleOption.icon}</div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-semibold text-brand-text">{roleOption.title}</h3>
                          {selected && <CheckCircle2 className="w-4 h-4 text-brand-primary shrink-0" />}
                        </div>
                        <p className="text-xs text-brand-muted mt-1 leading-relaxed">{roleOption.desc}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {roleOption.features.map((feature) => <span key={feature} className="text-[10px] px-2 py-1 rounded-full bg-brand-cream text-brand-muted font-medium">{feature}</span>)}
                    </div>
                  </button>
                );
              })}
            </div>

            <AlertBanner
              type="info"
              title="Sandbox account setup"
              message="This demo uses fictional identities and transactions. It does not submit real KYC, banking, or payment data."
            />

            <div className="flex flex-col sm:flex-row gap-3 mt-5">
              <Button className="flex-1" disabled={!selectedRole} onClick={continueWithRole} icon={<ArrowRight className="w-4 h-4" />}>
                {selectedRole === 'farmer' ? 'Continue to guided onboarding' : selectedRole ? `Open ${selectedRole} workspace` : 'Select a role to continue'}
              </Button>
              <Link to="/login" className="btn-outline px-4 py-2.5 text-sm text-center">{t('nav.login')}</Link>
            </div>

            <div className="mt-4 flex items-start gap-2 text-xs text-brand-muted">
              <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <p>Your selected demo session now persists after a browser refresh until you log out.</p>
            </div>
          </Card>
        </motion.div>
        <p className="text-center text-xs text-brand-muted mt-4">{t('footer.sandboxDisclaimer')}</p>
      </div>
    </div>
  );
}
