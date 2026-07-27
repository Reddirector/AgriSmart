// ============================================================
// AgriSmart — Buyer Marketplace (Search + Filter + Make Offer)
// ============================================================
import { AlertBanner,Badge,Button,Card,EmptyState,Input,Select,VerificationBadge } from '@/components/ui';
import { produceListings } from '@/data/seed';
import { translate } from '@/i18n';
import { toDateInputValue } from '@/lib/utils';
import { useCurrentUser } from '@/store';
import { motion } from 'framer-motion';
import { CheckCircle2,Radio,Save,Search,ShieldCheck,Star,Tag,X } from 'lucide-react';
import { useEffect,useMemo,useState,type MouseEvent } from 'react';

export function BuyerMarketplace() {
  const user = useCurrentUser();
  const [search, setSearch] = useState('');
  const [filterCrop, setFilterCrop] = useState('');
  const [filterState, setFilterState] = useState('');
  const [filterGrade, setFilterGrade] = useState('');
  const [filterVerified, setFilterVerified] = useState(false);
  const [selectedListing, setSelectedListing] = useState<string | null>(null);
  const [showOffer, setShowOffer] = useState(false);
  const [savedListingIds, setSavedListingIds] = useState<string[]>([]);
  const [offerError, setOfferError] = useState('');
  const [offerSuccess, setOfferSuccess] = useState('');
  const [offer, setOffer] = useState({ price: '', quantity: '', deliveryLocation: 'Surat, Gujarat', deliveryDate: '', paymentTerms: '', inspectionRequired: true });
  const t = (k: string) => translate(k, user?.language || 'en');
  const today = toDateInputValue();

  const crops = [...new Set(produceListings.map(l => l.crop))];
  const states = [...new Set(produceListings.map(l => l.farmerState))];

  const filtered = useMemo(() => produceListings.filter(l => {
    if (search && !l.crop.toLowerCase().includes(search.toLowerCase()) && !l.farmerName.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterCrop && l.crop !== filterCrop) return false;
    if (filterState && l.farmerState !== filterState) return false;
    if (filterGrade && l.qualityGrade !== filterGrade) return false;
    if (filterVerified && !l.verified) return false;
    return true;
  }), [search, filterCrop, filterState, filterGrade, filterVerified]);

  const selected = produceListings.find(l => l.id === selectedListing);

  useEffect(() => {
    if (!showOffer) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setShowOffer(false);
    };
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [showOffer]);

  const openOffer = (listingId: string) => {
    const listing = produceListings.find((item) => item.id === listingId);
    if (!listing) return;
    setSelectedListing(listingId);
    setOffer({
      price: String(listing.minPrice),
      quantity: String(listing.quantity),
      deliveryLocation: 'Surat, Gujarat',
      deliveryDate: '',
      paymentTerms: '',
      inspectionRequired: true,
    });
    setOfferError('');
    setShowOffer(true);
  };

  const submitOffer = () => {
    if (!selected) return;
    const price = Number(offer.price);
    const quantity = Number(offer.quantity);
    if (!Number.isFinite(price) || price <= 0) { setOfferError('Enter a valid offered price.'); return; }
    if (!Number.isFinite(quantity) || quantity <= 0 || quantity > selected.quantity) { setOfferError(`Enter a quantity between 1 and ${selected.quantity} ${selected.unit}.`); return; }
    if (!offer.deliveryLocation.trim()) { setOfferError('Enter a delivery location.'); return; }
    if (!offer.deliveryDate) { setOfferError('Select a delivery date.'); return; }
    if (offer.deliveryDate < today) { setOfferError('Delivery date cannot be in the past.'); return; }
    if (!offer.paymentTerms) { setOfferError('Select payment terms.'); return; }
    setOfferSuccess(`Offer submitted to ${selected.farmerName} for ${quantity} ${selected.unit} of ${selected.crop}.`);
    setShowOffer(false);
  };

  const toggleSaved = (listingId: string) => {
    setSavedListingIds((current) => current.includes(listingId) ? current.filter((id) => id !== listingId) : [...current, listingId]);
  };

  return (
    <div className="space-y-6">
      <div><h1 className="text-xl font-bold text-brand-text">{t('market.title')}</h1><p className="text-sm text-brand-muted">Search verified farmers and make offers</p></div>
      {offerSuccess && <AlertBanner type="success" title="Offer added to your sandbox queue" message={offerSuccess} onClose={() => setOfferSuccess('')} />}

      {/* Search & Filters */}
      <Card className="p-4">
        <div className="grid gap-3 mb-3 sm:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_9rem_9rem_8rem]">
          <div className="min-w-0 sm:col-span-2 xl:col-span-1"><Input aria-label="Search marketplace listings" placeholder={t('market.searchPlaceholder')} icon={<Search className="w-4 h-4" />} value={search} onChange={e => setSearch(e.target.value)} /></div>
          <div className="min-w-0"><Select aria-label="Filter listings by crop" options={crops.map(c => ({ value: c, label: c }))} placeholder={t('market.filterCrop')} value={filterCrop} onChange={e => setFilterCrop(e.target.value)} /></div>
          <div className="min-w-0"><Select aria-label="Filter listings by state" options={states.map(s => ({ value: s, label: s }))} placeholder={t('market.filterState')} value={filterState} onChange={e => setFilterState(e.target.value)} /></div>
          <div className="min-w-0"><Select aria-label="Filter listings by grade" options={[{value:'A',label:'Grade A'},{value:'B',label:'Grade B'},{value:'C',label:'Grade C'}]} placeholder={t('market.filterGrade')} value={filterGrade} onChange={e => setFilterGrade(e.target.value)} /></div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={filterVerified} onChange={e => setFilterVerified(e.target.checked)} className="rounded border-brand-border" />
            <span className="flex items-center gap-1 text-brand-text"><ShieldCheck className="w-4 h-4 text-brand-success" /> {t('market.filterVerified')}</span>
          </label>
          <Badge variant="muted">{filtered.length} results</Badge>
          {(filterCrop || filterState || filterGrade || filterVerified || search) && (
            <Button variant="ghost" size="sm" onClick={() => { setSearch(''); setFilterCrop(''); setFilterState(''); setFilterGrade(''); setFilterVerified(false); }}>Clear filters</Button>
          )}
        </div>
      </Card>

      {/* Listings grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((l, i) => (
          <motion.div key={l.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
            <Card hover className="p-4" >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-11 h-11 rounded-lg bg-brand-soft text-brand-primary flex items-center justify-center text-xl">🌾</div>
                  <div>
                    <p className="text-sm font-semibold text-brand-text">{l.crop}</p>
                    <p className="text-xs text-brand-muted">{l.variety}</p>
                  </div>
                </div>
                <Badge variant={l.qualityGrade === 'A' ? 'success' : l.qualityGrade === 'B' ? 'warning' : 'muted'}>Grade {l.qualityGrade}</Badge>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                <div><span className="text-brand-muted">Qty:</span> <span className="font-medium text-brand-text">{l.quantity} {l.unit}</span></div>
                <div><span className="text-brand-muted">Min:</span> <span className="font-medium text-brand-text">₹{l.minPrice}/{l.unit}</span></div>
                <div><span className="text-brand-muted">Harvest:</span> <span className="font-medium text-brand-text">{l.harvestDate}</span></div>
                <div><span className="text-brand-muted">Location:</span> <span className="font-medium text-brand-text">{l.farmerState}</span></div>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap mb-3">
                <VerificationBadge status={l.verified ? 'verified' : 'pending'} />
                {l.sensorSupported && <Badge variant="info" icon={<Radio className="w-3 h-3" />}>IoT Data</Badge>}
                {l.certifications.map(c => <Badge key={c} variant="muted">{c}</Badge>)}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-brand-border/50">
                <div className="flex items-center gap-1 text-xs"><Star className="w-3 h-3 text-brand-saffron fill-brand-saffron" /><span className="text-brand-text">4.{7 + (i % 3)}</span></div>
                <div className="flex gap-1.5">
                  <Button variant="ghost" size="sm" icon={<Save className="w-3.5 h-3.5" />} onClick={() => toggleSaved(l.id)} aria-pressed={savedListingIds.includes(l.id)}>{savedListingIds.includes(l.id) ? 'Saved' : 'Save'}</Button>
                  <Button size="sm" icon={<Tag className="w-3.5 h-3.5" />} onClick={() => openOffer(l.id)}>{t('market.makeOffer')}</Button>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && <Card><EmptyState icon={<Search className="w-8 h-8" />} title={t('market.noResults')} message="Try adjusting your filters or search terms." /></Card>}

      {/* Offer modal */}
      {showOffer && selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4 bg-brand-dark/55"
          onMouseDown={(event: MouseEvent<HTMLDivElement>) => { if (event.target === event.currentTarget) setShowOffer(false); }}
          role="presentation"
        >
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md my-auto" role="dialog" aria-modal="true" aria-labelledby="offer-dialog-title">
            <Card className="p-6 shadow-lift">
              <div className="flex items-center justify-between mb-4">
                <h3 id="offer-dialog-title" className="text-base font-bold text-brand-text">Make an Offer</h3>
                <button type="button" onClick={() => setShowOffer(false)} className="w-8 h-8 rounded-lg hover:bg-brand-soft flex items-center justify-center" aria-label="Close offer form"><X className="w-4 h-4" /></button>
              </div>
              <div className="p-3 rounded-lg bg-brand-soft/30 mb-4">
                <p className="text-sm font-semibold text-brand-text">{selected.crop} · {selected.variety}</p>
                <p className="text-xs text-brand-muted">{selected.farmerName} · {selected.quantity} {selected.unit} · Min ₹{selected.minPrice}/{selected.unit}</p>
              </div>
              <div className="space-y-3">
                {offerError && <AlertBanner type="error" title="Check the offer" message={offerError} />}
                <Input label={`Offered Price (₹/${selected.unit})`} type="number" min="1" value={offer.price} onChange={(event) => { setOfferError(''); setOffer((current) => ({ ...current, price: event.target.value })); }} />
                <Input label={`Quantity (${selected.unit})`} type="number" min="1" max={selected.quantity} value={offer.quantity} onChange={(event) => { setOfferError(''); setOffer((current) => ({ ...current, quantity: event.target.value })); }} />
                <Input label="Delivery Location" placeholder="e.g. Surat, Gujarat" value={offer.deliveryLocation} onChange={(event) => { setOfferError(''); setOffer((current) => ({ ...current, deliveryLocation: event.target.value })); }} />
                <Input label="Delivery Date" type="date" min={today} value={offer.deliveryDate} onChange={(event) => { setOfferError(''); setOffer((current) => ({ ...current, deliveryDate: event.target.value })); }} />
                <Select label="Payment Terms" options={[{value:'30_adv',label:'30% advance, 70% on delivery'},{value:'100_del',label:'100% on delivery'},{value:'50_50',label:'50% advance, 50% on inspection'}]} placeholder="Select payment terms" value={offer.paymentTerms} onChange={(event) => { setOfferError(''); setOffer((current) => ({ ...current, paymentTerms: event.target.value })); }} />
                <label className="flex items-center gap-2 text-sm text-brand-text cursor-pointer">
                  <input type="checkbox" checked={offer.inspectionRequired} onChange={(event) => setOffer((current) => ({ ...current, inspectionRequired: event.target.checked }))} className="rounded border-brand-border" /> Require field inspection
                </label>
              </div>
              <div className="flex gap-2 mt-4">
                <Button className="flex-1" icon={<CheckCircle2 className="w-4 h-4" />} onClick={submitOffer}>Submit Offer</Button>
                <Button variant="outline" onClick={() => setShowOffer(false)}>Cancel</Button>
              </div>
              <p className="text-xs text-brand-muted text-center mt-3">Sandbox: Offer will be simulated. No real transactions.</p>
            </Card>
          </motion.div>
        </div>
      )}
    </div>
  );
}
