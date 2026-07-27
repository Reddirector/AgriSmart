import { AlertBanner,Badge,Button,Card,EmptyState,StatCard,Tabs,Textarea } from '@/components/ui';
import { buyerOffers } from '@/data/seed';
import { timeAgo } from '@/lib/utils';
import { useCurrentUser } from '@/store';
import { AnimatePresence,motion } from 'framer-motion';
import { CheckCircle2,Clock,MessageSquare,Send,Tag,X } from 'lucide-react';
import { useState } from 'react';

export function BuyerOffers() {
  const user = useCurrentUser();
  const [tab, setTab] = useState('pending');
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  if (!user) return null;

  const offers = buyerOffers.filter((offer) => offer.buyerId === user.id);
  const pending = offers.filter((offer) => offer.status === 'pending' || offer.status === 'negotiating');
  const accepted = offers.filter((offer) => offer.status === 'accepted');
  const tabOffers = tab === 'pending' ? pending : accepted;
  const selectedOffer = offers.find((offer) => offer.id === selectedOfferId) || null;

  const sendMessage = () => {
    if (!selectedOffer || messageText.trim().length < 3) return;
    setStatusMessage(`Message saved for offer #${selectedOffer.id.slice(-3)}. Connect messaging APIs for live delivery.`);
    setMessageText('');
    setSelectedOfferId(null);
  };

  return (
    <div className="space-y-6">
      <div><h1 className="page-heading">🤝 My Offers</h1><p className="page-subtitle">Track offers submitted to farmers and keep negotiation notes together.</p></div>
      {statusMessage && <AlertBanner type="success" title="Message recorded" message={statusMessage} onClose={() => setStatusMessage('')} />}
      <div className="grid grid-cols-2 gap-3"><StatCard label="Pending" value={pending.length} icon={<Clock className="h-5 w-5" />} accent="saffron" /><StatCard label="Accepted" value={accepted.length} icon={<CheckCircle2 className="h-5 w-5" />} accent="success" /></div>
      <Tabs tabs={[{ id: 'pending', label: 'Pending', count: pending.length }, { id: 'accepted', label: 'Accepted', count: accepted.length }]} active={tab} onChange={setTab} />

      <AnimatePresence>
        {selectedOffer && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <Card className="p-4 sm:p-5">
              <div className="mb-4 flex items-start justify-between gap-3"><div><h2 className="text-lg font-bold text-brand-text">Message about offer #{selectedOffer.id.slice(-3)}</h2><p className="text-sm text-brand-muted">Mention delivery, price, inspection, or payment terms.</p></div><Button variant="ghost" size="sm" onClick={() => setSelectedOfferId(null)} aria-label="Close message form" icon={<X className="h-4 w-4" />} /></div>
              <Textarea label="Message" value={messageText} onChange={(event) => setMessageText(event.target.value)} placeholder="Write a clear note for the farmer…" error={messageText.length > 0 && messageText.trim().length < 3 ? 'Enter at least 3 characters.' : undefined} />
              <div className="mt-4 flex justify-end"><Button onClick={sendMessage} disabled={messageText.trim().length < 3} icon={<Send className="h-4 w-4" />}>Save message</Button></div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-3">
        {tabOffers.map((offer, index) => (
          <motion.div key={offer.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}>
            <Card className="p-4">
              <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-sm font-semibold text-brand-text">Offer #{offer.id.slice(-3)}</p><p className="text-xs text-brand-muted">{offer.quantity} quintal · {offer.deliveryLocation}</p></div><div className="sm:text-right"><p className="text-lg font-bold text-brand-primary">₹{offer.offeredPrice.toLocaleString('en-IN')}</p><Badge variant={offer.status === 'accepted' ? 'success' : 'warning'}>{offer.status}</Badge></div></div>
              <div className="flex flex-col gap-2 border-t border-brand-border/60 pt-3 text-xs text-brand-muted sm:flex-row sm:items-center sm:justify-between"><div className="flex flex-wrap gap-x-4 gap-y-1"><span>Delivery: {offer.deliveryDate}</span><span>{timeAgo(offer.createdAt)}</span></div><Button variant="ghost" size="sm" onClick={() => { setSelectedOfferId(offer.id); setMessageText(''); }} icon={<MessageSquare className="h-3.5 w-3.5" />}>Message</Button></div>
            </Card>
          </motion.div>
        ))}
        {tabOffers.length === 0 && <Card><EmptyState icon={<Tag className="h-8 w-8" />} title={`No ${tab} offers`} message="Browse the marketplace to make offers." /></Card>}
      </div>
    </div>
  );
}
