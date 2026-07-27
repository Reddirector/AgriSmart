// ============================================================
// AgriSmart — Farmer Onboarding (14-step guided flow)
// ============================================================
import { AlertBanner,Badge,Button,Card,Input,Select,VerificationBadge } from '@/components/ui';
import { locales,translate } from '@/i18n';
import { cn } from '@/lib/utils';
import { demoLogin,useAppStore } from '@/store';
import type { Locale } from '@/types';
import { AnimatePresence,motion } from 'framer-motion';
import {
ArrowLeft,
ArrowRight,
Banknote,
CheckCircle2,
CreditCard,
FileText,
Globe,
KeyRound,
Loader2,
MapPin,
Phone,
Radio,
Save,
ShieldCheck,
Sprout,
User,
Wheat
} from 'lucide-react';
import { useState } from 'react';
import { Link,useNavigate } from 'react-router-dom';

const steps = [
  { key: 'onboarding.selectLanguage', icon: <Globe className="w-5 h-5" /> },
  { key: 'onboarding.enterPhone', icon: <Phone className="w-5 h-5" /> },
  { key: 'onboarding.verifyOtp', icon: <KeyRound className="w-5 h-5" /> },
  { key: 'onboarding.personalDetails', icon: <User className="w-5 h-5" /> },
  { key: 'onboarding.selectState', icon: <MapPin className="w-5 h-5" /> },
  { key: 'onboarding.farmLocation', icon: <MapPin className="w-5 h-5" /> },
  { key: 'onboarding.landDetails', icon: <FileText className="w-5 h-5" /> },
  { key: 'onboarding.cropDetails', icon: <Wheat className="w-5 h-5" /> },
  { key: 'onboarding.bankDetails', icon: <Banknote className="w-5 h-5" /> },
  { key: 'onboarding.identityVerification', icon: <ShieldCheck className="w-5 h-5" /> },
  { key: 'onboarding.kccVerification', icon: <CreditCard className="w-5 h-5" /> },
  { key: 'onboarding.connectIot', icon: <Radio className="w-5 h-5" /> },
  { key: 'onboarding.review', icon: <CheckCircle2 className="w-5 h-5" /> },
  { key: 'onboarding.submit', icon: <Sprout className="w-5 h-5" /> },
];

const indianStates = ['Gujarat', 'Uttar Pradesh', 'Telangana', 'Punjab', 'Maharashtra', 'Tamil Nadu', 'Rajasthan', 'Assam', 'Bihar', 'Karnataka', 'West Bengal', 'Andhra Pradesh', 'Kerala', 'Madhya Pradesh', 'Haryana', 'Odisha'];
const crops = ['Wheat', 'Rice', 'Cotton', 'Sugarcane', 'Mustard', 'Maize', 'Potato', 'Tomato', 'Onion', 'Pulses'];
const units = ['quintal', 'kg', 'ton', 'acres'];

export function OnboardingPage() {
  const navigate = useNavigate();
  const { locale, setLocale, setOnboardingStep, onboardingStep, setOnboardingData, onboardingData, resetOnboarding, login } = useAppStore();
  const t = (k: string) => translate(k, locale);

  const initialStep = Math.min(Math.max(onboardingStep || 0, 0), steps.length - 1);
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(onboardingData.otpSent === true || onboardingData.otpSent === 'true');
  const [identityStatus, setIdentityStatus] = useState<'idle' | 'verifying' | 'done'>(onboardingData.identityStatus === 'done' ? 'done' : 'idle');
  const [kccStatus, setKccStatus] = useState<'idle' | 'verifying' | 'done'>(onboardingData.kccStatus === 'done' ? 'done' : 'idle');
  const restoredIotMode = onboardingData.iotMode === 'device' ? 'device' : 'demo';
  const [iotMode, setIotMode] = useState<'device' | 'demo'>(restoredIotMode);
  const [stepError, setStepError] = useState('');
  const [saved, setSaved] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({
    language: locale,
    phone: '',
    otp: '',
    name: '',
    state: '',
    district: '',
    farmName: '',
    area: '',
    crop: '',
    bankName: '',
    accountNumber: '',
    ...Object.fromEntries(Object.entries(onboardingData).map(([k, v]) => [k, String(v)])),
  });

  const update = (key: string, value: string) => {
    setStepError('');
    setSaved(false);
    setFormData(prev => ({ ...prev, [key]: value }));
    setOnboardingData({ [key]: value });
  };

  const validateCurrentStep = () => {
    const requirements: Record<number, string | false> = {
      1: formData.phone.length === 10 ? false : 'Enter a valid 10-digit phone number.',
      2: otpSent && formData.otp.length === 6 ? false : 'Send the sandbox OTP, then enter any 6 digits.',
      3: formData.name.trim() ? false : 'Enter your full name.',
      4: formData.state && formData.district.trim() ? false : 'Select your state and enter your district.',
      5: formData.farmName.trim() ? false : 'Enter a farm name.',
      6: Number(formData.area) > 0 ? false : 'Enter a valid farm area greater than zero.',
      7: formData.crop ? false : 'Select a primary crop.',
      8: formData.bankName.trim() && /^\d{6,18}$/.test(formData.accountNumber || '') && /^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.ifsc || '')
        ? false
        : 'Enter a bank name, a 6 to 18 digit account number, and a valid IFSC code.',
      9: identityStatus === 'done' ? false : 'Complete the sandbox identity verification.',
      10: kccStatus === 'done' ? false : 'Complete the sandbox KCC verification.',
    };
    return requirements[currentStep] || false;
  };

  const next = () => {
    const error = validateCurrentStep();
    if (error) { setStepError(error); return; }
    const nextStep = Math.min(currentStep + 1, steps.length - 1);
    setStepError('');
    setOnboardingStep(nextStep);
    setCurrentStep(nextStep);
  };

  const prev = () => {
    const previousStep = Math.max(0, currentStep - 1);
    setStepError('');
    setOnboardingStep(previousStep);
    setCurrentStep(previousStep);
  };

  const runVerification = (
    setter: (status: 'idle' | 'verifying' | 'done') => void,
    storageKey: 'identityStatus' | 'kccStatus',
  ) => {
    setter('verifying');
    setTimeout(() => {
      setter('done');
      setOnboardingData({ [storageKey]: 'done' });
    }, 1000);
  };

  const sendOtp = () => {
    setOtpSent(true);
    setOnboardingData({ otpSent: true });
  };

  const saveProgress = () => {
    setOnboardingStep(currentStep);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  const handleSubmit = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const userId = demoLogin('farmer');
      if (userId) {
        resetOnboarding();
        login(userId, 'farmer');
        navigate('/farmer');
      }
    }, 1500);
  };

  const progress = ((currentStep + 1) / steps.length) * 100;
  const stepInfo = steps[currentStep];

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-soft via-brand-cream to-brand-soft py-6 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <Link to="/" className="flex items-center justify-center gap-2 mb-4">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-brand-primary text-white"><Sprout className="w-5 h-5" /></div>
          <span className="text-lg font-bold text-brand-text">AgriSmart</span>
        </Link>

        {/* Title */}
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold text-brand-text">{t('onboarding.title')}</h1>
          <p className="text-sm text-brand-muted mt-1">{t('onboarding.step')} {currentStep + 1} {t('onboarding.of')} {steps.length}</p>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-brand-soft text-brand-primary">{stepInfo.icon}</div>
              <span className="text-sm font-medium text-brand-text">{t(stepInfo.key)}</span>
            </div>
            <span className="text-xs text-brand-muted">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 rounded-full bg-brand-border overflow-hidden">
            <motion.div animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }} className="h-full bg-brand-primary rounded-full" />
          </div>
          {/* Step dots */}
          <div className="flex items-center gap-1 mt-3 overflow-x-auto scrollbar-hide">
            {steps.map((_, i) => (
              <div key={i} className={cn('w-2 h-2 rounded-full shrink-0 transition-colors', i <= currentStep ? 'bg-brand-primary' : 'bg-brand-border')} />
            ))}
          </div>
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait">
          <motion.div key={currentStep} initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -14 }} transition={{ duration: 0.18 }}>
            <Card className="p-5 sm:p-6 shadow-soft">
              {stepError && <AlertBanner type="error" title="Complete this step" message={stepError} />}
              {stepError && <div className="h-4" />}
              {/* Step 0: Language */}
              {currentStep === 0 && (
                <div className="space-y-4">
                  <p className="text-sm text-brand-muted">{t('onboarding.selectLanguage')}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {locales.map(l => (
                      <button type="button" key={l.code} onClick={() => { setLocale(l.code as Locale); update('language', l.code); }} className={cn('p-3 rounded-lg border-2 text-center transition-all', formData.language === l.code ? 'border-brand-primary bg-brand-soft' : 'border-brand-border hover:border-brand-primary/50')}>
                        <p className="text-sm font-medium text-brand-text">{l.nativeName}</p>
                        <p className="text-xs text-brand-muted">{l.name}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 1: Phone */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <Input label={t('auth.phone')} placeholder="98765 43210" prefix="+91" icon={<Phone className="w-4 h-4" />} value={formData.phone} onChange={e => update('phone', e.target.value.replace(/\D/g, '').slice(0, 10))} />
                  <AlertBanner type="info" title="Sandbox Mode" message="Enter any phone number. OTP will be simulated." />
                </div>
              )}

              {/* Step 2: OTP */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  {!otpSent ? (
                    <Button className="w-full" onClick={sendOtp} icon={<KeyRound className="w-4 h-4" />}>{t('auth.sendOtp')}</Button>
                  ) : (
                    <>
                      <Badge variant="info" className="mb-2">OTP Sent (Sandbox) — Enter any 6 digits</Badge>
                      <Input label={t('auth.otp')} placeholder="000000" value={formData.otp} onChange={e => update('otp', e.target.value.replace(/\D/g, '').slice(0, 6))} maxLength={6} />
                    </>
                  )}
                </div>
              )}

              {/* Step 3: Personal Details */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <Input label="Full Name" placeholder="e.g. Rajesh Patel" value={formData.name} onChange={e => update('name', e.target.value)} />
                  <Input label="Email Address" type="email" placeholder="you@example.com" hint={t('common.optional')} value={formData.email || ''} onChange={e => update('email', e.target.value)} />
                </div>
              )}

              {/* Step 4: State & District */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <Select label="State" placeholder="Select your state" options={indianStates.map(s => ({ value: s, label: s }))} value={formData.state} onChange={e => update('state', e.target.value)} />
                  <Input label="District" placeholder="e.g. Ahmedabad" value={formData.district} onChange={e => update('district', e.target.value)} />
                </div>
              )}

              {/* Step 5: Farm Location */}
              {currentStep === 5 && (
                <div className="space-y-4">
                  <Input label="Farm Name" placeholder="e.g. Patel Family Farm" value={formData.farmName} onChange={e => update('farmName', e.target.value)} />
                  <Input label="Village" placeholder="e.g. Sanand" value={formData.village || ''} onChange={e => update('village', e.target.value)} />
                  <div className="rounded-lg border border-brand-border p-4 bg-brand-cream/50">
                    <div className="flex items-center gap-2 mb-2"><MapPin className="w-4 h-4 text-brand-primary" /><span className="text-sm font-medium text-brand-text">GPS Location</span></div>
                    <p className="text-xs text-brand-muted">Location will be captured automatically from your device or entered manually on the farm map.</p>
                  </div>
                </div>
              )}

              {/* Step 6: Land Details */}
              {currentStep === 6 && (
                <div className="space-y-4">
                  <Input label="Total Area (acres)" type="number" placeholder="e.g. 8.5" value={formData.area} onChange={e => update('area', e.target.value)} />
                  <Select label="Land Ownership" options={[{ value: 'owned', label: 'Owned' }, { value: 'leased', label: 'Leased' }, { value: 'shared', label: 'Shared Cultivation' }]} placeholder="Select ownership type" value={formData.ownership || ''} onChange={e => update('ownership', e.target.value)} />
                  <Input label="Land Survey Number" placeholder="e.g. 123/45A" hint={t('common.optional')} value={formData.surveyNo || ''} onChange={e => update('surveyNo', e.target.value)} />
                </div>
              )}

              {/* Step 7: Crop Details */}
              {currentStep === 7 && (
                <div className="space-y-4">
                  <Select label="Primary Crop" options={crops.map(c => ({ value: c, label: c }))} placeholder="Select crop" value={formData.crop} onChange={e => update('crop', e.target.value)} />
                  <Input label="Crop Variety" placeholder="e.g. HD 2967" value={formData.variety || ''} onChange={e => update('variety', e.target.value)} />
                  <Select label="Unit" options={units.map(u => ({ value: u, label: u }))} placeholder="Select unit" value={formData.unit || ''} onChange={e => update('unit', e.target.value)} />
                </div>
              )}

              {/* Step 8: Bank Details */}
              {currentStep === 8 && (
                <div className="space-y-4">
                  <Input label="Bank Name" placeholder="e.g. State Bank of India" value={formData.bankName} onChange={e => update('bankName', e.target.value)} />
                  <Input label="Account Number" inputMode="numeric" placeholder="XXXXXX1234" hint="Account number will be masked after verification" value={formData.accountNumber || ''} onChange={e => update('accountNumber', e.target.value.replace(/\D/g, '').slice(0, 18))} />
                  <Input label="IFSC Code" placeholder="e.g. SBIN0001234" value={formData.ifsc || ''} onChange={e => update('ifsc', e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 11))} />
                  <AlertBanner type="info" title="Sandbox Mode" message="Bank details are not verified or stored in the demo." />
                </div>
              )}

              {/* Step 9: Identity Verification */}
              {currentStep === 9 && (
                <div className="space-y-4">
                  <div className="rounded-lg border border-brand-border p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <ShieldCheck className="w-6 h-6 text-brand-primary" />
                      <div><h3 className="text-sm font-semibold text-brand-text">Aadhaar Verification (Sandbox)</h3><p className="text-xs text-brand-muted">Mock verification — not connected to UIDAI</p></div>
                    </div>
                    <Input label="Aadhaar Last 4 Digits" inputMode="numeric" placeholder="1234" maxLength={4} value={formData.aadhaarLast4 || ''} onChange={e => update('aadhaarLast4', e.target.value.replace(/\D/g, '').slice(0, 4))} hint="Only the last four digits are used in this sandbox flow" />
                    <label className="flex items-center gap-2 mt-3 text-sm text-brand-text cursor-pointer">
                      <input type="checkbox" className="rounded border-brand-border" checked={formData.identityConsent === 'yes'} onChange={e => update('identityConsent', e.target.checked ? 'yes' : 'no')} /> {t('verify.consent')}
                    </label>
                  </div>
                  {identityStatus === 'idle' && <Button className="w-full" disabled={formData.identityConsent !== 'yes' || (formData.aadhaarLast4 || '').length !== 4} onClick={() => runVerification(setIdentityStatus, 'identityStatus')} icon={<ShieldCheck className="w-4 h-4" />}>Start Verification</Button>}
                  {identityStatus === 'verifying' && <div className="flex items-center justify-center gap-2 py-3"><Loader2 className="w-5 h-5 animate-spin text-brand-primary" /><span className="text-sm text-brand-muted">Running sandbox verification…</span></div>}
                  {identityStatus === 'done' && <AlertBanner type="success" title="Identity Verified (Sandbox)" message="Mock verification completed. No Aadhaar data was transmitted." />}
                  <AlertBanner type="warning" title={t('verify.sandboxNotice')} />
                </div>
              )}

              {/* Step 10: KCC Verification */}
              {currentStep === 10 && (
                <div className="space-y-4">
                  <div className="rounded-lg border border-brand-border p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <CreditCard className="w-6 h-6 text-brand-primary" />
                      <div><h3 className="text-sm font-semibold text-brand-text">Kisan Credit Card Verification (Sandbox)</h3><p className="text-xs text-brand-muted">Mock KCC verification — not connected to any bank</p></div>
                    </div>
                    <Input label="KCC Number" placeholder="Enter KCC number" hint="Only verification status will be stored" value={formData.kcc || ''} onChange={e => update('kcc', e.target.value.toUpperCase().slice(0, 24))} />
                  </div>
                  {kccStatus !== 'done' && <Button variant="secondary" className="w-full" loading={kccStatus === 'verifying'} disabled={(formData.kcc || '').trim().length < 4} onClick={() => runVerification(setKccStatus, 'kccStatus')} icon={<CreditCard className="w-4 h-4" />}>Verify KCC Status</Button>}
                  {kccStatus === 'done' && <AlertBanner type="success" title="KCC Verified (Sandbox)" message="Mock KCC verification completed without contacting a bank." />}
                </div>
              )}

              {/* Step 11: IoT Device */}
              {currentStep === 11 && (
                <div className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-3" role="radiogroup" aria-label="Choose IoT data source">
                    <button type="button" onClick={() => { setIotMode('device'); update('iotMode', 'device'); }} role="radio" aria-checked={iotMode === 'device'} className={cn('p-5 rounded-xl border-2 text-center transition-all', iotMode === 'device' ? 'border-brand-primary bg-brand-soft shadow-soft' : 'border-brand-border hover:border-brand-primary/50')}>
                      <Radio className="w-8 h-8 text-brand-primary mx-auto mb-2" />
                      <p className="text-sm font-semibold text-brand-text">Connect IoT Device</p>
                      <p className="text-xs text-brand-muted mt-1">Prepare a physical sensor registration flow</p>
                    </button>
                    <button type="button" onClick={() => { setIotMode('demo'); update('iotMode', 'demo'); }} role="radio" aria-checked={iotMode === 'demo'} className={cn('p-5 rounded-xl border-2 text-center transition-all', iotMode === 'demo' ? 'border-brand-primary bg-brand-soft shadow-soft' : 'border-brand-border hover:border-brand-primary/50')}>
                      <Sprout className="w-8 h-8 text-brand-saffron mx-auto mb-2" />
                      <p className="text-sm font-semibold text-brand-text">Demo Mode</p>
                      <p className="text-xs text-brand-muted mt-1">Use preloaded realistic sensor data</p>
                    </button>
                  </div>
                  <AlertBanner type="info" title={iotMode === 'demo' ? 'Demo data selected' : 'Device registration selected'} message={iotMode === 'demo' ? 'The dashboard will load simulated readings from pre-configured devices and farms.' : 'This patch prepares the UI only. Real device provisioning will require a backend registration endpoint.'} />
                </div>
              )}

              {/* Step 12: Review */}
              {currentStep === 12 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-brand-text mb-2">Review Your Information</h3>
                  {[
                    ['Language', locales.find(l => l.code === formData.language)?.nativeName || 'English'],
                    ['Phone', `+91 ${formData.phone || '98765-43210'}`],
                    ['Name', formData.name || 'Rajesh Patel'],
                    ['State', formData.state || 'Gujarat'],
                    ['Farm Name', formData.farmName || 'Patel Family Farm'],
                    ['Area', `${formData.area || '8.5'} acres`],
                    ['Primary Crop', formData.crop || 'Cotton'],
                    ['Bank', formData.bankName || 'State Bank of India'],
                  ].map(([label, value]) => (
                    <div key={label} className="flex items-center justify-between py-2 border-b border-brand-border/50">
                      <span className="text-sm text-brand-muted">{label}</span>
                      <span className="text-sm font-medium text-brand-text">{value}</span>
                    </div>
                  ))}
                  <div className="flex items-center gap-2 pt-2">
                    <VerificationBadge status={identityStatus === 'done' ? 'verified' : 'pending'} />
                    <VerificationBadge status={kccStatus === 'done' ? 'verified' : 'pending'} />
                    <span className="text-xs text-brand-muted">Identity and KCC status shown from saved sandbox verification</span>
                  </div>
                </div>
              )}

              {/* Step 13: Submit */}
              {currentStep === 13 && (
                <div className="text-center py-6">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.1 }} className="flex items-center justify-center w-16 h-16 rounded-full bg-brand-success/10 text-brand-success mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8" />
                  </motion.div>
                  <h3 className="text-lg font-bold text-brand-text mb-2">Ready to Submit!</h3>
                  <p className="text-sm text-brand-muted mb-6">Your farmer profile is complete. Click submit to access your dashboard.</p>
                  <Button size="lg" className="w-full" onClick={handleSubmit} loading={loading} icon={!loading ? <Sprout className="w-5 h-5" /> : undefined}>
                    {loading ? 'Setting up your account…' : t('onboarding.submit')}
                  </Button>
                </div>
              )}
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        {currentStep < 13 && (
          <div className="flex items-center justify-between mt-4 gap-3">
            <Button variant="outline" onClick={prev} disabled={currentStep === 0} icon={<ArrowLeft className="w-4 h-4" />}>{t('common.back')}</Button>
            <button type="button" onClick={saveProgress} className="text-sm font-medium text-brand-muted hover:text-brand-primary flex items-center gap-1.5" aria-live="polite">
              {saved ? <CheckCircle2 className="w-3.5 h-3.5 text-brand-success" /> : <Save className="w-3.5 h-3.5" />} {saved ? 'Saved' : t('onboarding.saveContinue')}
            </button>
            <Button onClick={next} icon={<ArrowRight className="w-4 h-4" />}>{t('common.next')}</Button>
          </div>
        )}

        <p className="text-center text-xs text-brand-muted mt-4">{t('onboarding.progressSaved')}</p>
      </div>
    </div>
  );
}
