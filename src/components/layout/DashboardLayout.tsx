// ============================================================
// AgriSmart — Dashboard Layout (Sidebar + Topbar + Bottom Nav)
// ============================================================
import { PageTransition,VerificationBadge } from '@/components/ui';
import { notifications as allNotifications } from '@/data/seed';
import { locales,translate } from '@/i18n';
import { cn } from '@/lib/utils';
import { useAppStore,useCurrentUser } from '@/store';
import { AnimatePresence,motion } from 'framer-motion';
import {
Accessibility,
AlertTriangle,
Bell,
ClipboardCheck,
FileText,
Globe,
Info,
LayoutDashboard,
LogOut,
MapPin,
Menu,
Plane,
Radio,
ScanSearch,
Server,
ShieldCheck,
Sprout,
Store,
Tag,
Users,
Wallet,
X,
} from 'lucide-react';
import { useEffect,useRef,useState,type ReactNode } from 'react';
import { Link,Navigate,Outlet,useLocation,useNavigate } from 'react-router-dom';

interface NavItem { key: string; path: string; icon: ReactNode; emoji: string; }

const navByRole: Record<string, NavItem[]> = {
  farmer: [
    { key: 'nav.dashboard', path: '/farmer', icon: <LayoutDashboard className="w-5 h-5" />, emoji: '🏡' },
    { key: 'nav.farms', path: '/farmer/farms', icon: <MapPin className="w-5 h-5" />, emoji: '🌾' },
    { key: 'nav.iot', path: '/farmer/iot', icon: <Radio className="w-5 h-5" />, emoji: '📡' },
    { key: 'nav.cropHealth', path: '/farmer/crop-health', icon: <ScanSearch className="w-5 h-5" />, emoji: '🌿' },
    { key: 'nav.drones', path: '/farmer/drones', icon: <Plane className="w-5 h-5" />, emoji: '🚁' },
    { key: 'nav.marketplace', path: '/farmer/marketplace', icon: <Store className="w-5 h-5" />, emoji: '🧺' },
    { key: 'nav.offers', path: '/farmer/offers', icon: <Tag className="w-5 h-5" />, emoji: '🏷️' },
    { key: 'nav.agreements', path: '/farmer/agreements', icon: <FileText className="w-5 h-5" />, emoji: '📄' },
    { key: 'nav.payments', path: '/farmer/payments', icon: <Wallet className="w-5 h-5" />, emoji: '💳' },
    { key: 'nav.verification', path: '/farmer/verification', icon: <ShieldCheck className="w-5 h-5" />, emoji: '✅' },
    { key: 'nav.alerts', path: '/farmer/alerts', icon: <Bell className="w-5 h-5" />, emoji: '🔔' },
  ],
  buyer: [
    { key: 'nav.dashboard', path: '/buyer', icon: <LayoutDashboard className="w-5 h-5" />, emoji: '📊' },
    { key: 'nav.marketplace', path: '/buyer/marketplace', icon: <Store className="w-5 h-5" />, emoji: '🛒' },
    { key: 'nav.offers', path: '/buyer/offers', icon: <Tag className="w-5 h-5" />, emoji: '🤝' },
    { key: 'nav.agreements', path: '/buyer/agreements', icon: <FileText className="w-5 h-5" />, emoji: '📑' },
    { key: 'nav.payments', path: '/buyer/payments', icon: <Wallet className="w-5 h-5" />, emoji: '💰' },
    { key: 'nav.verification', path: '/buyer/verification', icon: <ShieldCheck className="w-5 h-5" />, emoji: '🛡️' },
  ],
  verifier: [
    { key: 'nav.dashboard', path: '/verifier', icon: <LayoutDashboard className="w-5 h-5" />, emoji: '🧭' },
    { key: 'nav.inspections', path: '/verifier/inspections', icon: <ClipboardCheck className="w-5 h-5" />, emoji: '🔍' },
    { key: 'nav.farms', path: '/verifier/farms', icon: <MapPin className="w-5 h-5" />, emoji: '🗺️' },
    { key: 'nav.verification', path: '/verifier/verification', icon: <ShieldCheck className="w-5 h-5" />, emoji: '✅' },
  ],
  admin: [
    { key: 'nav.dashboard', path: '/admin', icon: <LayoutDashboard className="w-5 h-5" />, emoji: '🧠' },
    { key: 'nav.users', path: '/admin/users', icon: <Users className="w-5 h-5" />, emoji: '👥' },
    { key: 'nav.agreements', path: '/admin/agreements', icon: <FileText className="w-5 h-5" />, emoji: '📚' },
    { key: 'nav.disputes', path: '/admin/disputes', icon: <AlertTriangle className="w-5 h-5" />, emoji: '⚖️' },
    { key: 'nav.systemHealth', path: '/admin/system', icon: <Server className="w-5 h-5" />, emoji: '🖥️' },
    { key: 'nav.auditLogs', path: '/admin/audit', icon: <FileText className="w-5 h-5" />, emoji: '🧾' },
  ],
};

const bottomNavByRole: Record<string, NavItem[]> = {
  farmer: [
    { key: 'nav.dashboard', path: '/farmer', icon: <LayoutDashboard className="w-5 h-5" />, emoji: '🏡' },
    { key: 'nav.cropHealth', path: '/farmer/crop-health', icon: <ScanSearch className="w-5 h-5" />, emoji: '🌿' },
    { key: 'nav.drones', path: '/farmer/drones', icon: <Plane className="w-5 h-5" />, emoji: '🚁' },
    { key: 'nav.marketplace', path: '/farmer/marketplace', icon: <Store className="w-5 h-5" />, emoji: '🧺' },
    { key: 'nav.agreements', path: '/farmer/agreements', icon: <FileText className="w-5 h-5" />, emoji: '📄' },
  ],
  buyer: [
    { key: 'nav.dashboard', path: '/buyer', icon: <LayoutDashboard className="w-5 h-5" />, emoji: '📊' },
    { key: 'nav.marketplace', path: '/buyer/marketplace', icon: <Store className="w-5 h-5" />, emoji: '🛒' },
    { key: 'nav.offers', path: '/buyer/offers', icon: <Tag className="w-5 h-5" />, emoji: '🤝' },
    { key: 'nav.agreements', path: '/buyer/agreements', icon: <FileText className="w-5 h-5" />, emoji: '📑' },
  ],
  verifier: [
    { key: 'nav.dashboard', path: '/verifier', icon: <LayoutDashboard className="w-5 h-5" />, emoji: '🧭' },
    { key: 'nav.inspections', path: '/verifier/inspections', icon: <ClipboardCheck className="w-5 h-5" />, emoji: '🔍' },
    { key: 'nav.farms', path: '/verifier/farms', icon: <MapPin className="w-5 h-5" />, emoji: '🗺️' },
    { key: 'nav.verification', path: '/verifier/verification', icon: <ShieldCheck className="w-5 h-5" />, emoji: '✅' },
  ],
  admin: [
    { key: 'nav.dashboard', path: '/admin', icon: <LayoutDashboard className="w-5 h-5" />, emoji: '🧠' },
    { key: 'nav.users', path: '/admin/users', icon: <Users className="w-5 h-5" />, emoji: '👥' },
    { key: 'nav.agreements', path: '/admin/agreements', icon: <FileText className="w-5 h-5" />, emoji: '📚' },
    { key: 'nav.systemHealth', path: '/admin/system', icon: <Server className="w-5 h-5" />, emoji: '🖥️' },
  ],
};

export function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useCurrentUser();
  const {
    role,
    locale,
    setLocale,
    logout,
    sidebarOpen,
    setSidebarOpen,
    lowBandwidth,
    reducedMotion,
    highContrast,
    largeText,
    toggleLowBandwidth,
    toggleReducedMotion,
    toggleHighContrast,
    toggleLargeText,
  } = useAppStore();
  const [langOpen, setLangOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [a11yOpen, setA11yOpen] = useState(false);
  const [demoNoticeOpen, setDemoNoticeOpen] = useState(true);
  const [readNotificationIds, setReadNotificationIds] = useState<Set<string>>(new Set());
  const langRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const a11yRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const t = (key: string) => translate(key, locale);

  useEffect(() => {
    setLangOpen(false);
    setNotifOpen(false);
    setA11yOpen(false);
    setSidebarOpen(false);
    const focusFrame = window.requestAnimationFrame(() => mainRef.current?.focus({ preventScroll: true }));
    return () => window.cancelAnimationFrame(focusFrame);
  }, [location.pathname, setSidebarOpen]);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  useEffect(() => {
    const closePopovers = (event: MouseEvent) => {
      const target = event.target as Node;
      if (langRef.current && !langRef.current.contains(target)) setLangOpen(false);
      if (notifRef.current && !notifRef.current.contains(target)) setNotifOpen(false);
      if (a11yRef.current && !a11yRef.current.contains(target)) setA11yOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setLangOpen(false);
      setNotifOpen(false);
      setA11yOpen(false);
      setSidebarOpen(false);
    };
    document.addEventListener('mousedown', closePopovers);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closePopovers);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [setSidebarOpen]);

  if (!user || !role) return <Navigate to="/login" replace />;

  const navItems = navByRole[role] || [];
  const bottomItems = bottomNavByRole[role] || [];
  const userNotifications = allNotifications.filter((notification) => notification.userId === user.id);
  const unreadCount = userNotifications.filter((notification) => !notification.read && !readNotificationIds.has(notification.id)).length;
  const currentLang = locales.find((language) => language.code === locale);
  const activeItem = [...navItems].reverse().find((item) => location.pathname === item.path || location.pathname.startsWith(`${item.path}/`)) || navItems[0];
  const activeTitle = activeItem ? t(activeItem.key) : t('nav.dashboard');

  const isActivePath = (path: string) => location.pathname === path || (path !== `/${role}` && location.pathname.startsWith(`${path}/`));

  return (
    <div className="min-h-screen bg-brand-cream flex">
      <div key={location.key || location.pathname} className="route-progress" aria-hidden="true" />
      <aside className="hidden lg:flex flex-col w-64 bg-gradient-to-b from-brand-card via-brand-card to-brand-purple/[0.045] border-r border-brand-border fixed left-0 top-0 bottom-0 z-30">
        <div className="flex items-center gap-2 p-4 border-b border-brand-border h-16">
          <Link to="/" className="flex items-center gap-2" aria-label="AgriSmart home">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-brand-primary text-white shadow-soft">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-lg font-bold text-brand-text leading-tight">AgriSmart</span>
              <span className="block text-[10px] uppercase tracking-widest text-brand-muted">Trusted agriculture</span>
            </div>
          </Link>
        </div>

        <div className="mx-3 mt-3 rounded-lg bg-brand-soft/70 px-3 py-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-brand-primary">{role} workspace {role === 'farmer' ? '🌱' : role === 'buyer' ? '🛒' : role === 'verifier' ? '🔎' : '⚙️'}</p>
          <p className="mt-0.5 text-xs text-brand-muted">Seeded sandbox data</p>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1" aria-label={`${role} navigation`}>
          {navItems.map((item) => {
            const isActive = isActivePath(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all',
                  isActive
                    ? 'bg-gradient-to-r from-brand-primary to-brand-teal text-white shadow-soft'
                    : 'text-brand-muted hover:text-brand-primary hover:bg-brand-soft',
                )}
              >
                <span className={cn('transition-transform group-hover:scale-105', isActive && 'text-white')}>{item.icon}</span>
                <span>{t(item.key)}</span>
                <span className="ml-auto text-sm opacity-80" aria-hidden="true">{item.emoji}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-brand-border">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-9 h-9 rounded-full bg-brand-soft text-brand-primary flex items-center justify-center text-sm font-bold">
              {user.name.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-brand-text truncate">{user.name}</p>
              <p className="text-xs text-brand-muted capitalize">{role} demo account</p>
            </div>
          </div>
          <button type="button"
            onClick={() => { logout(); navigate('/'); }}
            className="mt-2 w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-brand-muted hover:bg-brand-error/10 hover:text-brand-error transition-colors"
          >
            <LogOut className="w-4 h-4" /> {t('nav.logout')}
          </button>
        </div>
      </aside>

      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Close navigation"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 z-40 bg-brand-dark/55 lg:hidden cursor-default"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.22 }}
              className="fixed left-0 top-0 bottom-0 z-50 w-72 max-w-[85vw] bg-brand-card shadow-lift lg:hidden flex flex-col"
              aria-label="Mobile navigation"
            >
              <div className="flex items-center justify-between p-4 border-b border-brand-border h-16">
                <Link to="/" className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-brand-primary text-white"><Sprout className="w-5 h-5" /></div>
                  <span className="text-lg font-bold">AgriSmart</span>
                </Link>
                <button type="button" onClick={() => setSidebarOpen(false)} className="icon-button" aria-label="Close menu"><X className="w-5 h-5" /></button>
              </div>
              <div className="mx-3 mt-3 rounded-lg bg-brand-soft/70 px-3 py-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-brand-primary">{role} workspace {role === 'farmer' ? '🌱' : role === 'buyer' ? '🛒' : role === 'verifier' ? '🔎' : '⚙️'}</p>
                <p className="mt-0.5 text-xs text-brand-muted">Seeded sandbox data</p>
              </div>
              <nav className="flex-1 overflow-y-auto p-3 space-y-1">
                {navItems.map((item) => {
                  const isActive = isActivePath(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      aria-current={isActive ? 'page' : undefined}
                      className={cn(
                        'flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-semibold transition-colors',
                        isActive ? 'bg-gradient-to-r from-brand-primary to-brand-teal text-white' : 'text-brand-muted hover:bg-brand-soft hover:text-brand-primary',
                      )}
                    >
                      {item.icon}<span>{t(item.key)}</span><span className="ml-auto" aria-hidden="true">{item.emoji}</span>
                    </Link>
                  );
                })}
              </nav>
              <div className="p-3 border-t border-brand-border safe-bottom">
                <button type="button" onClick={() => { logout(); navigate('/'); }} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-brand-muted hover:bg-brand-error/10 hover:text-brand-error">
                  <LogOut className="w-4 h-4" /> {t('nav.logout')}
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
        <header className="sticky top-0 z-20 glass border-b border-brand-border/70 min-h-16 flex items-center justify-between px-4 sm:px-6 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button type="button" onClick={() => setSidebarOpen(true)} className="icon-button lg:hidden" aria-label="Open menu" aria-expanded={sidebarOpen}>
              <Menu className="w-5 h-5" />
            </button>
            <Link to="/" className="lg:hidden flex items-center gap-2" aria-label="AgriSmart home">
              <div className="w-8 h-8 rounded-lg bg-brand-primary text-white flex items-center justify-center"><Sprout className="w-4 h-4" /></div>
            </Link>
            <div className="min-w-0">
              <p className="text-sm font-bold text-brand-text truncate">{activeTitle}</p>
              <p className="hidden sm:block text-xs text-brand-muted truncate">
                {t('dash.greeting')}, {user.name.split(' ')[0]} · {role} workspace
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="hidden md:flex items-center gap-1.5 mr-1">
              <VerificationBadge status={user.identityVerified} />
              {user.kccStatus !== 'unverified' && <VerificationBadge status={user.kccStatus} />}
            </div>

            <div className="relative" ref={notifRef}>
              <button type="button"
                onClick={() => { setNotifOpen((open) => !open); setLangOpen(false); setA11yOpen(false); }}
                className="icon-button relative"
                aria-label={`Notifications, ${unreadCount} unread`}
                aria-expanded={notifOpen}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-4 h-4 px-1 rounded-full bg-brand-error text-white text-[10px] font-bold flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              <AnimatePresence>
                {notifOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.98 }}
                    className="absolute right-0 top-full mt-2 card w-80 max-w-[calc(100vw-2rem)] shadow-lift z-50 max-h-[70vh] overflow-y-auto"
                  >
                    <div className="sticky top-0 bg-brand-card p-3 border-b border-brand-border flex items-center justify-between z-10">
                      <div>
                        <span className="block text-sm font-semibold">{t('nav.notifications')}</span>
                        <span className="block text-xs text-brand-muted">Open an item to view its related page</span>
                      </div>
                      <button type="button" onClick={() => setReadNotificationIds(new Set(userNotifications.map((notification) => notification.id)))} disabled={unreadCount === 0} className="text-xs font-semibold text-brand-primary disabled:text-brand-muted disabled:cursor-not-allowed">{unreadCount === 0 ? 'All read' : 'Mark all read'}</button>
                    </div>
                    {userNotifications.slice(0, 8).map((notification) => {
                      const isUnread = !notification.read && !readNotificationIds.has(notification.id);
                      return (
                        <button type="button"
                          key={notification.id}
                          onClick={() => {
                            setReadNotificationIds((current) => new Set(current).add(notification.id));
                            setNotifOpen(false);
                            if (notification.deepLink) navigate(notification.deepLink);
                          }}
                          className={cn(
                            'w-full text-left p-3 border-b border-brand-border/60 hover:bg-brand-soft/60 transition-colors',
                            isUnread && 'bg-brand-soft/35',
                          )}
                        >
                          <div className="flex items-start gap-2">
                            <span className={cn('w-2 h-2 rounded-full mt-1.5 shrink-0', isUnread ? 'bg-brand-primary' : 'bg-brand-border')} />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-brand-text">{notification.title}</p>
                              <p className="text-xs text-brand-muted mt-0.5 line-clamp-2">{notification.message}</p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                    {userNotifications.length === 0 && <p className="p-6 text-sm text-brand-muted text-center">No notifications yet</p>}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="relative" ref={langRef}>
              <button type="button"
                onClick={() => { setLangOpen((open) => !open); setNotifOpen(false); setA11yOpen(false); }}
                className="flex min-h-10 items-center gap-1.5 px-2.5 rounded-lg hover:bg-brand-soft text-sm transition-colors"
                aria-label={t('a11y.languageSelect')}
                aria-expanded={langOpen}
              >
                <Globe className="w-4 h-4" />
                <span className="hidden sm:inline text-xs font-semibold">{currentLang?.nativeName}</span>
              </button>
              <AnimatePresence>
                {langOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.98 }}
                    className="absolute right-0 top-full mt-2 card p-2 w-52 shadow-lift max-h-72 overflow-y-auto z-50"
                  >
                    <p className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-widest text-brand-muted">Language</p>
                    {locales.map((language) => (
                      <button type="button"
                        key={language.code}
                        onClick={() => { setLocale(language.code); setLangOpen(false); }}
                        className={cn(
                          'w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-sm hover:bg-brand-soft',
                          locale === language.code && 'bg-brand-soft text-brand-primary font-semibold',
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
                onClick={() => { setA11yOpen((open) => !open); setLangOpen(false); setNotifOpen(false); }}
                className={cn('icon-button', (lowBandwidth || reducedMotion || highContrast || largeText) && 'bg-brand-soft text-brand-primary')}
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
                      <button type="button" key={option.label} onClick={option.action} className="w-full flex items-center justify-between gap-4 py-2 text-left" aria-pressed={option.value}>
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
          </div>
        </header>

        {demoNoticeOpen && (
          <div className="px-4 sm:px-6 pt-4 max-w-7xl w-full mx-auto">
            <div className="flex items-start gap-3 rounded-xl border border-brand-primary/20 bg-brand-primary/[0.055] px-4 py-3 text-brand-text">
              <Info className="w-4 h-4 mt-0.5 text-brand-primary shrink-0" />
              <p className="text-xs sm:text-sm flex-1">
                <span className="font-semibold">✨ Guided workspace.</span> Crop scans, mapping, and mission records use the connected API when configured and a local-first fallback otherwise. Live aircraft, chemical treatment, payment, and identity actions still require approved external services.
              </p>
              <button type="button" onClick={() => setDemoNoticeOpen(false)} className="rounded-md p-1 text-brand-muted hover:bg-brand-soft hover:text-brand-primary" aria-label="Dismiss demo notice">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        <main
          ref={mainRef}
          className="flex-1 p-4 sm:p-6 lg:p-8 pb-28 lg:pb-8 max-w-7xl w-full mx-auto"
          id="main-content"
          tabIndex={-1}
          aria-live="polite"
        >
          <PageTransition key={location.key || location.pathname} className="dashboard-content">
            <Outlet />
          </PageTransition>
        </main>

        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-brand-card/95 border-t border-brand-border glass safe-bottom" aria-label="Bottom navigation">
          <div className="flex items-center justify-around min-h-16 px-1">
            {bottomItems.map((item) => {
              const isActive = isActivePath(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'flex flex-col items-center justify-center gap-0.5 px-2 py-1.5 rounded-lg transition-colors min-w-[64px]',
                    isActive ? 'bg-brand-soft text-brand-primary' : 'text-brand-muted hover:text-brand-primary',
                  )}
                >
                  <span className="relative">{item.icon}<span className="absolute -right-2 -top-2 text-[9px]" aria-hidden="true">{item.emoji}</span></span>
                  <span className="text-[10px] font-semibold max-w-[4rem] truncate">{t(item.key).split(' ')[0]}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
