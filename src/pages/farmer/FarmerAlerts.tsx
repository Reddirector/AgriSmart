// ============================================================
// AgriSmart — Farmer Alerts Page
// ============================================================
import { AlertBanner,Badge,Button,Card,EmptyState,SectionHeader,StatCard,Tabs } from '@/components/ui';
import { getUserData } from '@/data/seed';
import { cn,timeAgo } from '@/lib/utils';
import { useCurrentUser } from '@/store';
import { motion } from 'framer-motion';
import { AlertCircle,AlertTriangle,Battery,Bell,CheckCircle2,Droplets,Info,Plus,Radio,ShieldCheck,Thermometer,Zap } from 'lucide-react';
import { useState,type ReactNode } from 'react';

type RuleSeverity = 'critical' | 'warning' | 'info';
interface AlertRule { id: string; sensor: string; condition: string; severity: RuleSeverity; enabled: boolean; }

const initialRules: AlertRule[] = [
  { id: 'rule-moisture', sensor: 'Soil Moisture', condition: 'Below 25%', severity: 'warning', enabled: true },
  { id: 'rule-temperature', sensor: 'Air Temperature', condition: 'Above 40°C', severity: 'critical', enabled: true },
  { id: 'rule-water', sensor: 'Water Level', condition: 'Below 15%', severity: 'critical', enabled: true },
  { id: 'rule-battery', sensor: 'Device Battery', condition: 'Below 20%', severity: 'info', enabled: true },
  { id: 'rule-signature', sensor: 'Data Signature', condition: 'Validation failed', severity: 'critical', enabled: true },
];

export function FarmerAlerts() {
  const user = useCurrentUser();
  const data = user ? getUserData(user.id) : null;
  const [tab, setTab] = useState('active');
  const [acknowledged, setAcknowledged] = useState<Set<string>>(new Set());
  const [rules, setRules] = useState(initialRules);
  const [ruleMessage, setRuleMessage] = useState('');

  if (!data) return null;
  const alerts = data.alerts;
  const active = alerts.filter((alert) => !alert.acknowledged && !acknowledged.has(alert.id));
  const acknowledgedAlerts = alerts.filter((alert) => alert.acknowledged || acknowledged.has(alert.id));
  const tabAlerts = tab === 'active' ? active : acknowledgedAlerts;

  const critical = alerts.filter((alert) => alert.severity === 'critical');
  const warning = alerts.filter((alert) => alert.severity === 'warning');
  const info = alerts.filter((alert) => alert.severity === 'info');

  const alertIcons: Record<string, ReactNode> = {
    low_soil_moisture: <Droplets className="w-4 h-4" />,
    extreme_heat: <Thermometer className="w-4 h-4" />,
    device_offline: <Radio className="w-4 h-4" />,
    sensor_anomaly: <AlertCircle className="w-4 h-4" />,
    water_shortage: <Droplets className="w-4 h-4" />,
    low_battery: <Battery className="w-4 h-4" />,
    signature_failure: <ShieldCheck className="w-4 h-4" />,
    contract_condition_breach: <AlertTriangle className="w-4 h-4" />,
  };

  const addDemoRule = () => {
    if (rules.some((rule) => rule.id === 'rule-rainfall')) {
      setRuleMessage('The demo rainfall rule already exists.');
      return;
    }
    setRules((current) => [...current, { id: 'rule-rainfall', sensor: 'Rainfall', condition: 'Above 80 mm/day', severity: 'warning', enabled: true }]);
    setRuleMessage('A demo rainfall rule was added.');
  };

  const toggleRule = (ruleId: string) => {
    setRules((current) => current.map((rule) => rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule));
    setRuleMessage('Rule status updated for this demo session.');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-heading">🔔 Alerts & Notifications</h1>
        <p className="page-subtitle">Review sensor anomalies, acknowledge resolved events, and control the rules that create new alerts.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard label="Critical" value={critical.length} icon={<AlertTriangle className="w-5 h-5" />} accent="error" />
        <StatCard label="Warning" value={warning.length} icon={<AlertCircle className="w-5 h-5" />} accent="saffron" />
        <StatCard label="Info" value={info.length} icon={<Info className="w-5 h-5" />} accent="sky" />
      </div>

      <Tabs tabs={[{ id: 'active', label: 'Active', count: active.length }, { id: 'acknowledged', label: 'Acknowledged', count: acknowledgedAlerts.length }]} active={tab} onChange={setTab} />

      <div className="space-y-3">
        {tabAlerts.map((alert, index) => (
          <motion.div key={alert.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.04 }}>
            <Card className={cn('p-4 border-l-4', alert.severity === 'critical' ? 'border-l-brand-error' : alert.severity === 'warning' ? 'border-l-brand-warning' : 'border-l-brand-sky')}>
              <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center shrink-0', alert.severity === 'critical' ? 'bg-brand-error/10 text-brand-error' : alert.severity === 'warning' ? 'bg-brand-warning/10 text-brand-warning' : 'bg-brand-sky/10 text-brand-sky')}>
                  {alertIcons[alert.type] || <Bell className="w-5 h-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <Badge variant={alert.severity === 'critical' ? 'error' : alert.severity === 'warning' ? 'warning' : 'info'}>{alert.severity}</Badge>
                    <span className="text-xs text-brand-muted">{timeAgo(alert.timestamp)}</span>
                  </div>
                  <p className="text-sm text-brand-text leading-relaxed">{alert.message}</p>
                  {alert.deviceId && <p className="text-xs text-brand-muted mt-1">Device: {alert.deviceId}</p>}
                </div>
                {tab === 'active' && (
                  <Button className="sm:self-center" variant="ghost" size="sm" onClick={() => setAcknowledged((current) => new Set(current).add(alert.id))} icon={<CheckCircle2 className="w-4 h-4" />}>Acknowledge</Button>
                )}
              </div>
            </Card>
          </motion.div>
        ))}
        {tabAlerts.length === 0 && <Card><EmptyState icon={<Bell className="w-8 h-8" />} title={tab === 'active' ? 'No active alerts' : 'No acknowledged alerts'} message={tab === 'active' ? 'All monitored conditions are within their configured ranges.' : 'Alerts appear here after you acknowledge them.'} /></Card>}
      </div>

      <Card className="p-5">
        <SectionHeader
          title="Alert Rules Configuration"
          subtitle="Switch rules on or off. These controls update the current demo session."
          icon={<Zap className="w-5 h-5" />}
          action={<Button variant="outline" size="sm" onClick={addDemoRule} icon={<Plus className="w-4 h-4" />}>Add demo rule</Button>}
        />
        {ruleMessage && <div className="mb-4"><AlertBanner type="success" title={ruleMessage} onClose={() => setRuleMessage('')} /></div>}
        <div className="space-y-2">
          {rules.map((rule) => (
            <div key={rule.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border border-brand-border bg-brand-card">
              <div className="flex flex-wrap items-center gap-2 min-w-0">
                <span className="text-sm font-semibold text-brand-text">{rule.sensor}</span>
                <span className="text-xs text-brand-muted">{rule.condition}</span>
                <Badge variant={rule.severity === 'critical' ? 'error' : rule.severity === 'warning' ? 'warning' : 'info'}>{rule.severity}</Badge>
              </div>
              <button type="button"
                onClick={() => toggleRule(rule.id)}
                className={cn('relative w-11 h-6 rounded-full transition-colors shrink-0', rule.enabled ? 'bg-brand-primary' : 'bg-brand-border')}
                aria-label={`${rule.enabled ? 'Disable' : 'Enable'} ${rule.sensor} rule`}
                aria-pressed={rule.enabled}
              >
                <span className={cn('absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform', rule.enabled ? 'translate-x-6' : 'translate-x-1')} />
              </button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
