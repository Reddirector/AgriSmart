// ============================================================
// AgriSmart — Public Header with Navigation & Language Selector
// ============================================================
import { locales,translate } from '@/i18n';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store';
import { AnimatePresence,motion } from 'framer-motion';
import { Accessibility,ChevronDown,Globe,Menu,Sprout,X } from 'lucide-react';
import { useEffect,useRef,useState } from 'react';
import { Link,useLocation } from 'react-router-dom';

const publicNavItems = [
  { key: 'nav.home', path: '/' },
  { key: 'nav.howItWorks', path: '/how-it-works' },
  { key: 'nav.farmerSolutions', path: '/farmer-solutions' },
  { key: 'nav.buyerSolutions', path: '/buyer-solutions' },
  { key: 'nav.iotMonitoring', path: '/iot-monitoring' },
  { key: 'nav.securePayments', path: '/secure-payments' },
  { key: 'nav.identityVerification', path: '/identity-verification' },
  { key: 'nav.trustValidation', path: '/trust-validation' },
  { key: 'nav.pricing', path: '/pricing' },
  { key: 'nav.about', path: '/about' },
  { key: 'nav.contact', path: '/contact' },
];

export function PublicHeader() {
  const location = useLocation();
  const {
    locale,
    setLocale,
    lowBandwidth,
    reducedMotion,
    highContrast,
    toggleLowBandwidth,
    toggleReducedMotion,
    toggleHighContrast,
    toggleLargeText,
    largeText,
  } = useAppStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [a11yOpen, setA11yOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const a11yRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);
  const t = (key: string) => translate(key, locale);

  useEffect(() => {
    setMobileOpen(false);
    setLangOpen(false);
    setA11yOpen(false);
    setMoreOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  useEffect(() => {
    const closeMenus = (event: MouseEvent) => {
      const target = event.target as Node;
      if (langRef.current && !langRef.current.contains(target)) setLangOpen(false);
      if (a11yRef.current && !a11yRef.current.contains(target)) setA11yOpen(false);
      if (moreRef.current && !moreRef.current.contains(target)) setMoreOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setMobileOpen(false);
      setLangOpen(false);
      setA11yOpen(false);
      setMoreOpen(false);
    };
    document.addEventListener('mousedown', closeMenus);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeMenus);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, []);

  const currentLang = locales.find((language) => language.code === locale);

  return (
    <>
      <header className="sticky top-0 z-50 glass border-b border-brand-border/70">
        <div className="section flex items-center justify-between h-16 gap-3">
          <Link to="/" className="flex items-center gap-2 shrink-0" aria-label="AgriSmart home">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-brand-primary text-white shadow-soft">
              <Sprout className="w-5 h-5" />
            </div>
            <div className="hidden sm:block">
              <span className="block text-lg font-bold text-brand-text leading-none">AgriSmart</span>
              <span className="block mt-1 text-[9px] uppercase tracking-widest text-brand-muted">Trusted agriculture</span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-0.5 flex-1 justify-center" aria-label="Public navigation">
            {publicNavItems.slice(0, 7).map((item) => {
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  aria-current={active ? 'page' : undefined}
                  className={cn('nav-link text-xs', active && 'nav-link-active')}
                >
                  {t(item.key)}
                </Link>
              );
            })}
            <div className="relative" ref={moreRef}>
              <button type="button"
                onClick={() => setMoreOpen((open) => !open)}
                className={cn('nav-link text-xs flex items-center gap-1', publicNavItems.slice(7).some((item) => location.pathname === item.path) && 'nav-link-active')}
                aria-expanded={moreOpen}
                aria-haspopup="menu"
              >
                More <ChevronDown className={cn('w-3 h-3 transition-transform', moreOpen && 'rotate-180')} />
              </button>
              <AnimatePresence>
                {moreOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.98 }}
                    className="absolute right-0 top-full mt-2 card p-2 w-52 shadow-lift"
                    role="menu"
                  >
                    {publicNavItems.slice(7).map((item) => {
                      const active = location.pathname === item.path;
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          role="menuitem"
                          aria-current={active ? 'page' : undefined}
                          className={cn('block px-3 py-2 rounded-lg text-sm hover:bg-brand-soft hover:text-brand-primary transition-colors', active && 'bg-brand-soft text-brand-primary font-semibold')}
                        >
                          {t(item.key)}
                        </Link>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </nav>

          <div className="flex items-center gap-1.5 shrink-0">
            <div className="relative" ref={langRef}>
              <button type="button"
                onClick={() => { setLangOpen((open) => !open); setA11yOpen(false); setMoreOpen(false); }}
                className="flex min-h-10 items-center gap-1.5 px-2.5 rounded-lg text-sm text-brand-text hover:bg-brand-soft transition-colors"
                aria-label={t('a11y.languageSelect')}
                aria-expanded={langOpen}
              >
                <Globe className="w-4 h-4" />
                <span className="hidden sm:inline text-xs font-semibold">{currentLang?.nativeName}</span>
                <ChevronDown className={cn('w-3 h-3 transition-transform', langOpen && 'rotate-180')} />
              </button>
              <AnimatePresence>
                {langOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.98 }}
                    className="absolute right-0 top-full mt-2 card p-2 w-56 shadow-lift max-h-80 overflow-y-auto z-50"
                  >
                    <p className="px-2 py-1 text-xs font-semibold text-brand-muted uppercase">Select language</p>
                    {locales.map((language) => (
                      <button type="button"
                        key={language.code}
                        onClick={() => { setLocale(language.code); setLangOpen(false); }}
                        className={cn(
                          'w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-sm transition-colors',
                          locale === language.code ? 'bg-brand-soft text-brand-primary font-semibold' : 'hover:bg-brand-soft',
                        )}
                      >
                        <span>{language.nativeName}</span>
                        <span className="text-xs text-brand-muted">{language.name}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="relative" ref={a11yRef}>
              <button type="button"
                onClick={() => { setA11yOpen((open) => !open); setLangOpen(false); setMoreOpen(false); }}
                className={cn('icon-button', (lowBandwidth || highContrast || reducedMotion || largeText) && 'bg-brand-soft text-brand-primary')}
                aria-label="Accessibility settings"
                aria-expanded={a11yOpen}
              >
                <Accessibility className="w-4 h-4" />
              </button>
              <AnimatePresence>
                {a11yOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.98 }}
                    className="absolute right-0 top-full mt-2 card p-3 w-64 shadow-lift z-50"
                  >
                    <p className="text-xs font-semibold text-brand-muted uppercase mb-2">Accessibility</p>
                    {[
                      { label: t('a11y.lowBandwidth'), value: lowBandwidth, action: toggleLowBandwidth },
                      { label: t('a11y.reducedMotion'), value: reducedMotion, action: toggleReducedMotion },
                      { label: t('a11y.highContrast'), value: highContrast, action: toggleHighContrast },
                      { label: t('a11y.largeText'), value: largeText, action: toggleLargeText },
                    ].map((option) => (
                      <button type="button"
                        key={option.label}
                        onClick={option.action}
                        className="w-full flex items-center justify-between gap-4 py-2 text-left"
                        aria-pressed={option.value}
                      >
                        <span className="text-sm font-medium text-brand-text">{option.label}</span>
                        <span className={cn('relative w-10 h-5 rounded-full transition-colors shrink-0', option.value ? 'bg-brand-primary' : 'bg-brand-border')}>
                          <span className={cn('absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform', option.value ? 'translate-x-5' : 'translate-x-0.5')} />
                        </span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link to="/login" className="btn-outline hidden sm:inline-flex px-4 py-2 text-sm">{t('nav.login')}</Link>
            <Link to="/register" className="btn-primary hidden sm:inline-flex px-4 py-2 text-sm">{t('nav.register')}</Link>

            <button type="button"
              onClick={() => setMobileOpen(true)}
              className="icon-button lg:hidden"
              aria-label={t('a11y.toggleMenu')}
              aria-expanded={mobileOpen}
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Close menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-50 bg-brand-dark/55 lg:hidden cursor-default"
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.22 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-80 max-w-[88vw] bg-brand-card shadow-lift lg:hidden overflow-y-auto safe-bottom"
              aria-label="Mobile menu"
            >
              <div className="sticky top-0 bg-brand-card flex items-center justify-between p-4 border-b border-brand-border z-10">
                <div>
                  <span className="block font-bold text-brand-text">Menu</span>
                  <span className="block text-xs text-brand-muted">Explore AgriSmart</span>
                </div>
                <button type="button" onClick={() => setMobileOpen(false)} className="icon-button" aria-label="Close menu"><X className="w-5 h-5" /></button>
              </div>
              <nav className="p-3 space-y-1">
                {publicNavItems.map((item) => {
                  const active = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'block px-3 py-3 rounded-lg text-sm font-semibold transition-colors',
                        active ? 'bg-brand-primary text-white' : 'text-brand-text hover:bg-brand-soft hover:text-brand-primary',
                      )}
                    >
                      {t(item.key)}
                    </Link>
                  );
                })}
                <div className="pt-3 mt-3 border-t border-brand-border space-y-2">
                  <Link to="/login" className="btn-outline w-full">{t('nav.login')}</Link>
                  <Link to="/register" className="btn-primary w-full">{t('nav.register')}</Link>
                </div>
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
