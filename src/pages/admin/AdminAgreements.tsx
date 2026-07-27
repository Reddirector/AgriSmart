import { Badge,Button,Card,EmptyState,Input,StatCard,Tabs } from '@/components/ui';
import { tradeAgreements } from '@/data/seed';
import { formatDate,stateColor,truncateHash } from '@/lib/utils';
import { AnimatePresence,motion } from 'framer-motion';
import { AlertTriangle,ChevronDown,ChevronUp,FileText,Link2,Search } from 'lucide-react';
import { useState } from 'react';

export function AdminAgreements() {
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = tradeAgreements.filter((agreement) => {
    const query = search.trim().toLowerCase();
    return !query || agreement.crop.toLowerCase().includes(query) || agreement.farmerName.toLowerCase().includes(query) || agreement.buyerName.toLowerCase().includes(query) || agreement.id.toLowerCase().includes(query);
  });
  const tabAgreements = tab === 'active' ? filtered.filter((agreement) => !['completed', 'cancelled'].includes(agreement.state)) : tab === 'disputed' ? filtered.filter((agreement) => agreement.state === 'disputed') : filtered;

  return (
    <div className="space-y-6">
      <div><h1 className="page-heading">📚 All Agreements</h1><p className="page-subtitle">Audit trade state, escrow, delivery terms, and blockchain references.</p></div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"><StatCard label="Total" value={tradeAgreements.length} icon={<FileText className="h-5 w-5" />} /><StatCard label="Active" value={tradeAgreements.filter((agreement) => !['completed','cancelled'].includes(agreement.state)).length} icon={<FileText className="h-5 w-5" />} accent="primary" /><StatCard label="Completed" value={tradeAgreements.filter((agreement) => agreement.state === 'completed').length} icon={<FileText className="h-5 w-5" />} accent="success" /><StatCard label="Disputed" value={tradeAgreements.filter((agreement) => agreement.state === 'disputed').length} icon={<AlertTriangle className="h-5 w-5" />} accent="error" /></div>
      <Card className="p-4"><Input label="Search agreements" placeholder="Crop, farmer, buyer, or agreement ID" icon={<Search className="h-4 w-4" />} value={search} onChange={(event) => setSearch(event.target.value)} /></Card>
      <Tabs tabs={[{ id: 'all', label: 'All', count: filtered.length }, { id: 'active', label: 'Active', count: filtered.filter((agreement) => !['completed','cancelled'].includes(agreement.state)).length }, { id: 'disputed', label: 'Disputed', count: filtered.filter((agreement) => agreement.state === 'disputed').length }]} active={tab} onChange={setTab} />
      <div className="space-y-3">
        {tabAgreements.map((agreement, index) => {
          const state = stateColor(agreement.state);
          const expanded = selectedId === agreement.id;
          return (
            <motion.div key={agreement.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }}>
              <Card className="p-4">
                <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div className="flex min-w-0 items-start gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand-primary"><FileText className="h-5 w-5" /></div><div className="min-w-0"><p className="text-sm font-semibold text-brand-text">{agreement.crop} · {agreement.quantity} {agreement.unit}</p><p className="text-xs text-brand-muted">{agreement.farmerName} → {agreement.buyerName}</p></div></div><div className="flex flex-wrap items-center gap-2"><Badge className={`${state.bg} ${state.text}`}>{state.label}</Badge><span className="text-lg font-bold text-brand-text">₹{agreement.totalValue.toLocaleString('en-IN')}</span></div></div>
                <div className="flex flex-col gap-2 border-t border-brand-border/60 pt-3 text-xs text-brand-muted sm:flex-row sm:items-center"><span>Created: {formatDate(agreement.createdAt)}</span><span>Delivery: {formatDate(agreement.deliveryDate)}</span><span className="flex items-center gap-1"><Link2 className="h-3 w-3" /> {truncateHash(agreement.agreementHash)}</span><Badge variant="info">Polygon Amoy</Badge><Button variant="ghost" size="sm" className="sm:ml-auto" onClick={() => setSelectedId(expanded ? null : agreement.id)} aria-expanded={expanded} icon={expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}>{expanded ? 'Hide details' : 'View details'}</Button></div>
                <AnimatePresence initial={false}>{expanded && <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden"><div className="mt-4 grid gap-3 border-t border-brand-border pt-4 text-sm sm:grid-cols-2 lg:grid-cols-4"><div><p className="text-xs text-brand-muted">Agreement ID</p><p className="mt-1 font-medium text-brand-text">{agreement.id}</p></div><div><p className="text-xs text-brand-muted">Escrow</p><p className="mt-1 font-medium text-brand-text">₹{agreement.escrowAmount.toLocaleString('en-IN')}</p></div><div><p className="text-xs text-brand-muted">Quality</p><p className="mt-1 font-medium text-brand-text">{agreement.qualityConditions}</p></div><div><p className="text-xs text-brand-muted">Updated</p><p className="mt-1 font-medium text-brand-text">{formatDate(agreement.updatedAt)}</p></div></div></motion.div>}</AnimatePresence>
              </Card>
            </motion.div>
          );
        })}
        {tabAgreements.length === 0 && <Card><EmptyState icon={<FileText className="h-8 w-8" />} title="No agreements found" message="Adjust the search or select another status tab." /></Card>}
      </div>
    </div>
  );
}
