import { AlertBanner,Badge,Button,Card,EmptyState,Input,SectionHeader,Select } from '@/components/ui';
import { getUserData,produceListings } from '@/data/seed';
import { translate } from '@/i18n';
import { toDateInputValue } from '@/lib/utils';
import { useCurrentUser } from '@/store';
import type { ProduceListing } from '@/types';
import { AnimatePresence,motion } from 'framer-motion';
import { CalendarDays,MapPin,Plus,Radio,Save,Search,Store,Tag,X } from 'lucide-react';
import { useMemo,useState,type ReactNode } from 'react';

const emptyForm = { crop: '', variety: '', quantity: '', unit: '', minPrice: '', qualityGrade: '', harvestDate: '', deliveryOptions: '' };

export function FarmerMarketplace() {
  const user = useCurrentUser();
  const data = user ? getUserData(user.id) : null;
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState('');
  const [filterCrop, setFilterCrop] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [message, setMessage] = useState('');
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null);
  const [myListings, setMyListings] = useState<ProduceListing[]>(() => data?.listings.map((listing) => ({ ...listing, deliveryOptions: [...listing.deliveryOptions], certifications: [...listing.certifications], photos: [...listing.photos] })) || []);
  const [marketListings, setMarketListings] = useState<ProduceListing[]>(() => produceListings.map((listing) => ({ ...listing, deliveryOptions: [...listing.deliveryOptions], certifications: [...listing.certifications], photos: [...listing.photos] })));
  const t = (key: string) => translate(key, user?.language || 'en');

  const filtered = useMemo(() => marketListings.filter((listing) => {
    const query = search.trim().toLowerCase();
    if (query && !listing.crop.toLowerCase().includes(query) && !listing.farmerName.toLowerCase().includes(query) && !listing.farmerState.toLowerCase().includes(query)) return false;
    if (filterCrop && listing.crop !== filterCrop) return false;
    return true;
  }), [filterCrop, marketListings, search]);

  const crops = useMemo(() => [...new Set(marketListings.map((listing) => listing.crop))].sort(), [marketListings]);
  const selectedListing = marketListings.find((listing) => listing.id === selectedListingId) || null;
  const today = toDateInputValue();
  const draftKey = user ? `agrismart-listing-draft-${user.id}` : '';
  const legacyDraftKey = user ? `kisantrust-listing-draft-${user.id}` : '';

  if (!user || !data) return null;

  const validateForm = () => {
    const quantity = Number(form.quantity);
    const minPrice = Number(form.minPrice);
    if (!form.crop || !form.variety.trim() || !form.unit || !form.qualityGrade || !form.harvestDate || !form.deliveryOptions.trim()) return 'Complete every listing field.';
    if (!Number.isFinite(quantity) || quantity <= 0) return 'Enter a valid quantity greater than zero.';
    if (!Number.isFinite(minPrice) || minPrice <= 0) return 'Enter a valid minimum price greater than zero.';
    if (form.harvestDate < today) return 'Expected harvest date cannot be in the past.';
    return '';
  };

  const publishListing = () => {
    const error = validateForm();
    if (error) { setFormError(error); return; }
    const listing: ProduceListing = {
      id: `listing-demo-${Date.now()}`,
      farmerId: user.id,
      farmerName: user.name,
      farmerState: user.state || data.farms[0]?.state || 'India',
      crop: form.crop,
      variety: form.variety.trim(),
      quantity: Number(form.quantity),
      unit: form.unit,
      minPrice: Number(form.minPrice),
      qualityGrade: form.qualityGrade as ProduceListing['qualityGrade'],
      harvestDate: form.harvestDate,
      deliveryOptions: form.deliveryOptions.split(',').map((option) => option.trim()).filter(Boolean),
      certifications: ['Pending verification'],
      sensorSupported: data.devices.length > 0,
      verified: false,
      photos: [],
      createdAt: new Date().toISOString(),
    };
    setMyListings((current) => [listing, ...current]);
    setMarketListings((current) => [listing, ...current]);
    setForm(emptyForm);
    setFormError('');
    setShowCreate(false);
    setMessage(`${listing.crop} listing published in sandbox mode.`);
  };

  const saveDraft = () => {
    if (!Object.values(form).some((value) => value.trim())) {
      setFormError('Enter at least one listing detail before saving a draft.');
      return;
    }
    window.localStorage.setItem(draftKey, JSON.stringify(form));
    setFormError('');
    setMessage('Listing draft saved in this browser.');
  };

  const openCreate = () => {
    const saved = window.localStorage.getItem(draftKey) || window.localStorage.getItem(legacyDraftKey);
    if (saved) {
      try {
        setForm({ ...emptyForm, ...JSON.parse(saved) });
        if (!window.localStorage.getItem(draftKey)) window.localStorage.setItem(draftKey, saved);
      } catch {
        setForm(emptyForm);
      }
    }
    setFormError('');
    setShowCreate(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div><h1 className="page-heading">🧺 Marketplace</h1><p className="page-subtitle">Publish produce listings and compare current supply across the network.</p></div>
        <Button icon={<Plus className="h-4 w-4" />} onClick={showCreate ? () => setShowCreate(false) : openCreate}>{showCreate ? 'Close form' : t('market.createListing')}</Button>
      </div>

      {message && <AlertBanner type="success" title="Marketplace updated" message={message} onClose={() => setMessage('')} />}

      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <Card className="p-4 sm:p-5">
              <SectionHeader title="Create sale listing" subtitle="Fields marked here become visible to buyers after publishing." icon={<Plus className="h-5 w-5" />} action={<Button variant="ghost" size="sm" onClick={() => setShowCreate(false)} aria-label="Close listing form" icon={<X className="h-4 w-4" />} />} />
              {formError && <div className="mb-4"><AlertBanner type="error" title="Listing incomplete" message={formError} /></div>}
              <div className="grid gap-4 sm:grid-cols-2">
                <Select label="Crop" value={form.crop} onChange={(event) => setForm((current) => ({ ...current, crop: event.target.value }))} placeholder="Select crop" options={['Wheat','Rice','Cotton','Sugarcane','Mustard','Maize','Potato','Tomato','Onion','Pulses'].map((crop) => ({ value: crop, label: crop }))} />
                <Input label="Variety" value={form.variety} onChange={(event) => setForm((current) => ({ ...current, variety: event.target.value }))} placeholder="HD 2967" />
                <Input label="Quantity" type="number" min="0.1" step="0.1" value={form.quantity} onChange={(event) => setForm((current) => ({ ...current, quantity: event.target.value }))} />
                <Select label="Unit" value={form.unit} onChange={(event) => setForm((current) => ({ ...current, unit: event.target.value }))} options={[{ value: 'quintal', label: 'Quintal' }, { value: 'kg', label: 'Kilogram' }, { value: 'ton', label: 'Ton' }]} placeholder="Select unit" />
                <Input label="Minimum price" type="number" min="1" prefix="₹" value={form.minPrice} onChange={(event) => setForm((current) => ({ ...current, minPrice: event.target.value }))} />
                <Select label="Quality grade" value={form.qualityGrade} onChange={(event) => setForm((current) => ({ ...current, qualityGrade: event.target.value }))} options={[{ value: 'A', label: 'Grade A' }, { value: 'B', label: 'Grade B' }, { value: 'C', label: 'Grade C' }]} placeholder="Select grade" />
                <Input label="Expected harvest date" type="date" min={today} value={form.harvestDate} onChange={(event) => setForm((current) => ({ ...current, harvestDate: event.target.value }))} />
                <Input label="Delivery options" value={form.deliveryOptions} onChange={(event) => setForm((current) => ({ ...current, deliveryOptions: event.target.value }))} placeholder="Farm pickup, delivery within 50 km" hint="Separate multiple options with commas." />
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2"><Badge variant="info" icon={<Radio className="h-3 w-3" />}>{data.devices.length ? 'Sensor data available' : 'No sensor data connected'}</Badge><Badge variant="muted">Photos can be added after publishing</Badge></div>
              <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button variant="outline" onClick={saveDraft} icon={<Save className="h-4 w-4" />}>Save draft</Button>
                <Button onClick={publishListing} icon={<Store className="h-4 w-4" />}>Publish listing</Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <section>
        <SectionHeader title="My listings" subtitle={`${myListings.length} listing${myListings.length === 1 ? '' : 's'}`} icon={<Tag className="h-5 w-5" />} />
        {myListings.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {myListings.map((listing, index) => (
              <motion.div key={listing.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}>
                <ListingCard listing={listing} onDetails={() => setSelectedListingId(listing.id)} />
              </motion.div>
            ))}
          </div>
        ) : <Card><EmptyState icon={<Store className="h-8 w-8" />} title="No listings yet" message="Create your first produce listing to receive buyer offers." action={<Button onClick={openCreate} icon={<Plus className="h-4 w-4" />}>Create listing</Button>} /></Card>}
      </section>

      {selectedListing && (
        <Card className="p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-wide text-brand-muted">Listing details</p><h2 className="mt-1 text-lg font-bold text-brand-text">{selectedListing.crop} · {selectedListing.variety}</h2></div><Button variant="ghost" size="sm" onClick={() => setSelectedListingId(null)} aria-label="Close listing details" icon={<X className="h-4 w-4" />} /></div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><Detail icon={<Tag className="h-4 w-4" />} label="Quantity" value={`${selectedListing.quantity} ${selectedListing.unit}`} /><Detail icon={<Store className="h-4 w-4" />} label="Minimum price" value={`₹${selectedListing.minPrice.toLocaleString('en-IN')}/${selectedListing.unit}`} /><Detail icon={<MapPin className="h-4 w-4" />} label="Location" value={selectedListing.farmerState} /><Detail icon={<CalendarDays className="h-4 w-4" />} label="Harvest" value={selectedListing.harvestDate} /></div>
          <p className="mt-4 text-sm text-brand-muted">Delivery: {selectedListing.deliveryOptions.join(', ') || 'Not specified'}</p>
        </Card>
      )}

      <section>
        <SectionHeader title="Browse market" subtitle="All listings on AgriSmart" icon={<Search className="h-5 w-5" />} />
        <Card className="mb-4 p-4"><div className="flex flex-col gap-3 sm:flex-row"><div className="flex-1"><Input aria-label="Search market listings" placeholder={t('market.searchPlaceholder')} icon={<Search className="h-4 w-4" />} value={search} onChange={(event) => setSearch(event.target.value)} /></div><div className="sm:w-48"><Select aria-label="Filter market listings by crop" options={crops.map((crop) => ({ value: crop, label: crop }))} placeholder="All crops" value={filterCrop} onChange={(event) => setFilterCrop(event.target.value)} /></div></div></Card>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.slice(0, 12).map((listing, index) => <motion.div key={listing.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }}><ListingCard listing={listing} onDetails={() => setSelectedListingId(listing.id)} /></motion.div>)}
        </div>
        {filtered.length === 0 && <Card><EmptyState icon={<Search className="h-8 w-8" />} title={t('market.noResults')} message="Clear the crop filter or search with a different crop, farmer, or state." /></Card>}
      </section>
    </div>
  );
}

function ListingCard({ listing, onDetails }: { listing: ProduceListing; onDetails: () => void }) {
  return (
    <Card hover className="p-4">
      <div className="mb-3 flex items-start justify-between gap-3"><div className="flex min-w-0 items-start gap-2"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-xl">🌾</div><div className="min-w-0"><p className="text-sm font-semibold text-brand-text">{listing.crop} · {listing.quantity} {listing.unit}</p><p className="truncate text-xs text-brand-muted">{listing.farmerName} · {listing.variety}</p></div></div><Badge variant={listing.verified ? 'success' : 'warning'}>{listing.verified ? 'Verified' : 'Pending'}</Badge></div>
      <div className="mb-3 grid grid-cols-2 gap-2 text-xs"><div><span className="text-brand-muted">Min price:</span> <span className="font-medium text-brand-text">₹{listing.minPrice}/{listing.unit}</span></div><div><span className="text-brand-muted">Grade:</span> <span className="font-medium text-brand-text">{listing.qualityGrade}</span></div><div><span className="text-brand-muted">Location:</span> <span className="font-medium text-brand-text">{listing.farmerState}</span></div><div><span className="text-brand-muted">Harvest:</span> <span className="font-medium text-brand-text">{listing.harvestDate}</span></div></div>
      <div className="flex flex-wrap items-center justify-between gap-2"><div className="flex flex-wrap gap-1">{listing.sensorSupported && <Badge variant="info" icon={<Radio className="h-3 w-3" />}>IoT</Badge>}{listing.certifications.slice(0, 1).map((certification) => <Badge key={certification} variant="muted">{certification}</Badge>)}</div><Button variant="secondary" size="sm" onClick={onDetails}>Details</Button></div>
    </Card>
  );
}

function Detail({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return <div className="rounded-lg border border-brand-border bg-brand-cream/50 p-3"><div className="flex items-center gap-2 text-brand-primary">{icon}<span className="text-xs font-semibold uppercase tracking-wide">{label}</span></div><p className="mt-2 text-sm font-semibold text-brand-text">{value}</p></div>;
}
