// ============================================================
// AgriSmart — Public Footer
// ============================================================
import { translate } from '@/i18n';
import { useAppStore } from '@/store';
import { AlertTriangle,ShieldCheck,Smartphone,Sprout } from 'lucide-react';
import { Link } from 'react-router-dom';

export function PublicFooter() {
  const { locale } = useAppStore();
  const t = (k: string) => translate(k, locale);

  const sections = [
    { title: t('footer.product'), links: [
      { label: t('nav.howItWorks'), path: '/how-it-works' },
      { label: t('nav.farmerSolutions'), path: '/farmer-solutions' },
      { label: t('nav.buyerSolutions'), path: '/buyer-solutions' },
      { label: t('nav.iotMonitoring'), path: '/iot-monitoring' },
      { label: t('nav.pricing'), path: '/pricing' },
    ]},
    { title: t('footer.company'), links: [
      { label: t('nav.about'), path: '/about' },
      { label: t('nav.contact'), path: '/contact' },
      { label: t('nav.languages'), path: '/languages' },
    ]},
    { title: t('footer.legal'), links: [
      { label: t('nav.privacy'), path: '/privacy' },
      { label: t('nav.terms'), path: '/terms' },
    ]},
  ];

  return (
    <footer className="bg-brand-dark text-white/80 mt-20">
      {/* Sandbox disclaimer */}
      <div className="bg-brand-saffron/15 border-b border-white/10">
        <div className="section py-3 flex items-center gap-2 text-sm text-brand-saffron">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{t('footer.sandboxDisclaimer')}</span>
        </div>
      </div>

      <div className="section py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-brand-primary">
                <Sprout className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-white">AgriSmart</span>
            </Link>
            <p className="text-sm text-white/60 leading-relaxed mb-4">
              Smart farming and agricultural trade platform built around trust infrastructure.
              Verified farms, secure agreements, and reliable payments.
            </p>
            <div className="flex items-center gap-4 text-xs text-white/50">
              <span className="flex items-center gap-1"><ShieldCheck className="w-4 h-4" /> WCAG 2.2 AA</span>
              <span className="flex items-center gap-1"><Smartphone className="w-4 h-4" /> PWA Ready</span>
            </div>
          </div>

          {/* Link sections */}
          {sections.map(section => (
            <div key={section.title}>
              <h4 className="text-sm font-semibold text-white mb-3">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map(link => (
                  <li key={link.path}>
                    <Link to={link.path} className="text-sm text-white/60 hover:text-white transition-colors">{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/50">© 2026 AgriSmart. {t('footer.rights')}</p>
          <p className="text-xs text-white/40">Built for Indian agriculture · Polygon Amoy testnet · Sandbox demo</p>
        </div>
      </div>
    </footer>
  );
}
