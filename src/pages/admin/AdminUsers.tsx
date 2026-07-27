// AgriSmart — Admin Users
import { AlertBanner,Badge,Button,Card,EmptyState,Input,Select,StatCard,Tabs,VerificationBadge } from '@/components/ui';
import { users } from '@/data/seed';
import { formatDate,timeAgo } from '@/lib/utils';
import type { User } from '@/types';
import { AnimatePresence,motion } from 'framer-motion';
import { Ban,Building2,CheckCircle2,ClipboardCheck,Eye,Search,ShieldCheck,Sprout,UserCog,Users } from 'lucide-react';
import { useMemo,useState,type ReactNode } from 'react';

export function AdminUsers() {
  const [userRecords, setUserRecords] = useState<User[]>(() => users.map((user) => ({ ...user })));
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [tab, setTab] = useState('all');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [suspendedUserIds, setSuspendedUserIds] = useState<Set<string>>(new Set());
  const [statusMessage, setStatusMessage] = useState('');

  const filtered = useMemo(() => userRecords.filter((user) => {
    const query = search.trim().toLowerCase();
    if (query && !user.name.toLowerCase().includes(query) && !user.email.toLowerCase().includes(query) && !user.phone.includes(query)) return false;
    if (filterRole && user.role !== filterRole) return false;
    if (filterStatus && user.identityVerified !== filterStatus) return false;
    return true;
  }), [filterRole, filterStatus, search, userRecords]);

  const tabUsers = tab === 'pending' ? filtered.filter((user) => user.identityVerified === 'pending') : tab === 'verified' ? filtered.filter((user) => user.identityVerified === 'verified') : filtered;

  const roleIcons: Record<string, ReactNode> = {
    farmer: <Sprout className="w-4 h-4" />,
    buyer: <Building2 className="w-4 h-4" />,
    verifier: <ClipboardCheck className="w-4 h-4" />,
    admin: <UserCog className="w-4 h-4" />,
  };

  const approveUser = (user: User) => {
    setUserRecords((current) => current.map((item) => item.id === user.id ? { ...item, identityVerified: 'verified' } : item));
    setStatusMessage(`${user.name} was approved in the sandbox.`);
  };

  const toggleSuspension = (user: User) => {
    const suspended = suspendedUserIds.has(user.id);
    setSuspendedUserIds((current) => {
      const next = new Set(current);
      if (suspended) next.delete(user.id); else next.add(user.id);
      return next;
    });
    setStatusMessage(`${user.name} was ${suspended ? 'restored' : 'suspended'} in the sandbox.`);
  };

  return (
    <div className="space-y-6">
      <div><h1 className="text-xl font-bold text-brand-text">👥 User Management</h1><p className="text-sm text-brand-muted">Manage all platform users, roles, and verification status</p></div>
      {statusMessage && <AlertBanner type="success" title="User record updated" message={statusMessage} onClose={() => setStatusMessage('')} />}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Total Users" value={userRecords.length} icon={<Users className="w-5 h-5" />} />
        <StatCard label="Farmers" value={userRecords.filter((user) => user.role === 'farmer').length} icon={<Sprout className="w-5 h-5" />} accent="primary" />
        <StatCard label="Buyers" value={userRecords.filter((user) => user.role === 'buyer').length} icon={<Building2 className="w-5 h-5" />} accent="saffron" />
        <StatCard label="Pending Verify" value={userRecords.filter((user) => user.identityVerified === 'pending').length} icon={<ShieldCheck className="w-5 h-5" />} accent="warning" />
      </div>

      <Card className="p-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_9rem_11rem]">
          <div className="min-w-0 sm:col-span-2 lg:col-span-1"><Input aria-label="Search users" placeholder="Search by name, email, or phone…" icon={<Search className="w-4 h-4" />} value={search} onChange={(event) => setSearch(event.target.value)} /></div>
          <div className="min-w-0"><Select aria-label="Filter by role" options={[{ value: 'farmer', label: 'Farmers' }, { value: 'buyer', label: 'Buyers' }, { value: 'verifier', label: 'Verifiers' }, { value: 'admin', label: 'Admins' }]} placeholder="All Roles" value={filterRole} onChange={(event) => setFilterRole(event.target.value)} /></div>
          <div className="min-w-0"><Select aria-label="Filter by verification status" options={[{ value: 'verified', label: 'Verified' }, { value: 'pending', label: 'Pending' }, { value: 'unverified', label: 'Unverified' }, { value: 'rejected', label: 'Rejected' }]} placeholder="All Status" value={filterStatus} onChange={(event) => setFilterStatus(event.target.value)} /></div>
        </div>
      </Card>

      <Tabs tabs={[{ id: 'all', label: 'All Users', count: filtered.length }, { id: 'pending', label: 'Pending Verification', count: filtered.filter((user) => user.identityVerified === 'pending').length }, { id: 'verified', label: 'Verified', count: filtered.filter((user) => user.identityVerified === 'verified').length }]} active={tab} onChange={setTab} />

      <div className="space-y-2">
        {tabUsers.map((user, index) => {
          const suspended = suspendedUserIds.has(user.id);
          return (
            <motion.div key={user.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }}>
              <Card className={suspended ? 'p-4 border-brand-error/35 bg-brand-error/[0.02]' : 'p-4'}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-soft text-brand-primary flex items-center justify-center text-sm font-bold">{user.name.charAt(0)}</div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-brand-text truncate">{user.name}</p>
                        <Badge variant="muted" icon={roleIcons[user.role]}>{user.role}</Badge>
                        {suspended && <Badge variant="error">Suspended</Badge>}
                      </div>
                      <p className="text-xs text-brand-muted truncate">{user.email} · {user.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <VerificationBadge status={user.identityVerified} />
                    {user.state && <Badge variant="muted">{user.state}</Badge>}
                    <span className="text-xs text-brand-muted">Joined: {formatDate(user.createdAt)}</span>
                    <Button variant="ghost" size="sm" icon={<Eye className="w-3.5 h-3.5" />} onClick={() => setSelectedUserId(selectedUserId === user.id ? null : user.id)} aria-expanded={selectedUserId === user.id}>View</Button>
                    {user.identityVerified === 'pending' && <Button variant="secondary" size="sm" icon={<CheckCircle2 className="w-3.5 h-3.5" />} onClick={() => approveUser(user)}>Approve</Button>}
                    <Button variant="ghost" size="sm" className={suspended ? 'text-brand-success hover:bg-brand-success/10' : 'text-brand-error hover:bg-brand-error/10'} icon={suspended ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />} onClick={() => toggleSuspension(user)}>{suspended ? 'Restore' : 'Suspend'}</Button>
                  </div>
                </div>
                <AnimatePresence>
                  {selectedUserId === user.id && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                      <div className="mt-4 grid gap-3 border-t border-brand-border pt-4 text-xs sm:grid-cols-2 lg:grid-cols-4">
                        <div><p className="text-brand-muted">User ID</p><p className="font-mono text-brand-text">{user.id}</p></div>
                        <div><p className="text-brand-muted">District</p><p className="font-medium text-brand-text">{user.district || 'Not provided'}</p></div>
                        <div><p className="text-brand-muted">KCC status</p><p className="font-medium capitalize text-brand-text">{user.kccStatus}</p></div>
                        <div><p className="text-brand-muted">Last active</p><p className="font-medium text-brand-text">{timeAgo(user.lastActive)}</p></div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          );
        })}
        {tabUsers.length === 0 && <Card><EmptyState icon={<Users className="w-8 h-8" />} title="No users found" message="Try adjusting your filters." /></Card>}
      </div>
    </div>
  );
}
