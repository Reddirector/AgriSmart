// ============================================================
// AgriSmart — Farmer Offers Page
// ============================================================
import { AlertBanner,Badge,Button,Card,EmptyState,StatCard,Tabs } from '@/components/ui';
import { getUserData } from '@/data/seed';
import { formatDate,timeAgo } from '@/lib/utils';
import { useCurrentUser } from '@/store';
import type { BuyerOffer } from '@/types';
import { motion } from 'framer-motion';
import { CheckCircle2,Clock,MessageSquare,Tag,XCircle } from 'lucide-react';
import { useState } from 'react';

export function FarmerOffers() {
  const user = useCurrentUser();
  const data = user ? getUserData(user.id) : null;
  const [tab, setTab] = useState('pending');
  const [offerRecords, setOfferRecords] = useState<BuyerOffer[]>(() => data?.offers.map((offer) => ({ ...offer })) || []);
  const [statusMessage, setStatusMessage] = useState('');

  if (!data) return null;

  const pending = offerRecords.filter((offer) => offer.status === 'pending' || offer.status === 'negotiating');
  const accepted = offerRecords.filter((offer) => offer.status === 'accepted');
  const rejected = offerRecords.filter((offer) => offer.status === 'rejected');
  const tabOffers = tab === 'pending' ? pending : tab === 'accepted' ? accepted : rejected;

  const updateOfferStatus = (offer: BuyerOffer, status: BuyerOffer['status']) => {
    setOfferRecords((current) => current.map((item) => item.id === offer.id ? { ...item, status } : item));
    const action = status === 'accepted' ? 'accepted' : status === 'rejected' ? 'declined' : 'moved to negotiation';
    setStatusMessage(`${offer.buyerName}'s offer was ${action} in the sandbox.`);
    if (status === 'accepted') setTab('accepted');
    if (status === 'rejected') setTab('rejected');
  };

  return (
    <div className="space-y-6">
      <div><h1 className="text-xl font-bold text-brand-text">🏷️ Buyer Offers</h1><p className="text-sm text-brand-muted">Review and respond to offers on your listings</p></div>

      {statusMessage && <AlertBanner type="success" title="Offer updated" message={statusMessage} onClose={() => setStatusMessage('')} />}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard label="Pending" value={pending.length} icon={<Clock className="w-5 h-5" />} accent="saffron" />
        <StatCard label="Accepted" value={accepted.length} icon={<CheckCircle2 className="w-5 h-5" />} accent="success" />
        <StatCard label="Rejected" value={rejected.length} icon={<XCircle className="w-5 h-5" />} accent="error" />
      </div>

      <Tabs tabs={[{ id: 'pending', label: 'Pending', count: pending.length }, { id: 'accepted', label: 'Accepted', count: accepted.length }, { id: 'rejected', label: 'Rejected', count: rejected.length }]} active={tab} onChange={setTab} />

      <div className="space-y-3">
        {tabOffers.map((offer, index) => (
          <motion.div key={offer.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
            <Card className="p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-brand-saffron/10 text-brand-saffron flex items-center justify-center"><Tag className="w-5 h-5" /></div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-brand-text">{offer.buyerName}</p>
                      {offer.status === 'negotiating' && <Badge variant="info">Negotiating</Badge>}
                    </div>
                    <p className="text-xs text-brand-muted">{offer.quantity} quintal · Delivery: {offer.deliveryLocation}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-brand-primary">₹{offer.offeredPrice.toLocaleString('en-IN')}</p>
                  <p className="text-xs text-brand-muted">per quintal</p>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-3">
                <div><span className="text-brand-muted">Delivery Date:</span><br /><span className="font-medium text-brand-text">{formatDate(offer.deliveryDate)}</span></div>
                <div><span className="text-brand-muted">Payment Terms:</span><br /><span className="font-medium text-brand-text">{offer.paymentTerms}</span></div>
                <div><span className="text-brand-muted">Inspection:</span><br /><span className="font-medium text-brand-text">{offer.inspectionRequired ? 'Required' : 'Not required'}</span></div>
                <div><span className="text-brand-muted">Received:</span><br /><span className="font-medium text-brand-text">{timeAgo(offer.createdAt)}</span></div>
              </div>
              {tab === 'pending' && (
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" icon={<CheckCircle2 className="w-4 h-4" />} onClick={() => updateOfferStatus(offer, 'accepted')}>Accept Offer</Button>
                  <Button variant="outline" size="sm" icon={<MessageSquare className="w-4 h-4" />} onClick={() => updateOfferStatus(offer, 'negotiating')}>{offer.status === 'negotiating' ? 'Continue Negotiation' : 'Negotiate'}</Button>
                  <Button variant="ghost" size="sm" icon={<XCircle className="w-4 h-4" />} onClick={() => updateOfferStatus(offer, 'rejected')}>Decline</Button>
                </div>
              )}
              {tab === 'accepted' && <Badge variant="success" icon={<CheckCircle2 className="w-3 h-3" />}>Accepted · Ready to create agreement</Badge>}
            </Card>
          </motion.div>
        ))}
        {tabOffers.length === 0 && <Card><EmptyState icon={<Tag className="w-8 h-8" />} title={`No ${tab} offers`} message="Offers from buyers will appear here." /></Card>}
      </div>
    </div>
  );
}
