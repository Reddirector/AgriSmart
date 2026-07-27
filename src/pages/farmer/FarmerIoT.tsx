// ============================================================
// AgriSmart — Farmer IoT Dashboard (Real-time + Historical)
// ============================================================
import { MultiSensorChart,SensorChart } from '@/components/charts';
import { AlertBanner,Badge,Button,Card,EmptyState,Input,SectionHeader,Select,StatCard,Tabs,VerificationBadge } from '@/components/ui';
import { generateSensorHistory,getUserData } from '@/data/seed';
import { cn,downloadCsv,generateLiveReading,sensorIcons,sensorLabels,timeAgo } from '@/lib/utils';
import { useAppStore,useCurrentUser } from '@/store';
import type { Device } from '@/types';
import { motion } from 'framer-motion';
import {
Activity,Battery,
Cpu,
Download,
Gauge,
MapPin,
Plus,
Radio,
RefreshCw,
Settings,
Wifi,
Zap
} from 'lucide-react';
import { useEffect,useMemo,useState } from 'react';

export function FarmerIoT() {
  const user = useCurrentUser();
  const { lowBandwidth } = useAppStore();
  const data = user ? getUserData(user.id) : null;
  const [activeTab, setActiveTab] = useState<'realtime' | 'historical' | 'devices' | 'map'>('realtime');
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [selectedSensor, setSelectedSensor] = useState<string>('soil_moisture');
  const [liveReadings, setLiveReadings] = useState<Record<string, { value: number; unit: string }>>({});
  const [pumpOn, setPumpOn] = useState(false);
  const [deviceRecords, setDeviceRecords] = useState<Device[]>(() => data?.devices.map((device) => ({ ...device, sensors: [...device.sensors], location: { ...device.location } })) || []);
  const [showRegister, setShowRegister] = useState(false);
  const [registerForm, setRegisterForm] = useState({ name: '', model: '', farmId: data?.farms[0]?.id || '' });
  const [configureId, setConfigureId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState('');

  const devices = deviceRecords;
  const currentDevice = devices.find(d => d.id === selectedDevice) || devices[0];

  // Generate live readings
  useEffect(() => {
    if (!currentDevice) return;
    const update = () => {
      const readings: Record<string, { value: number; unit: string }> = {};
      currentDevice.sensors.forEach(s => { readings[s] = generateLiveReading(s); });
      setLiveReadings(readings);
    };
    update();
    const interval = setInterval(update, lowBandwidth ? 10_000 : 3_000);
    return () => clearInterval(interval);
  }, [currentDevice?.id, lowBandwidth]);

  // Historical data
  const history = useMemo(() => {
    if (!currentDevice) return [];
    return generateSensorHistory(currentDevice.id, 30);
  }, [currentDevice?.id]);

  const sensorHistory = history.filter(h => h.sensorType === selectedSensor);

  // Multi-sensor comparison data
  const multiSeries = useMemo(() => {
    if (!currentDevice) return [];
    const sensors = currentDevice.sensors.slice(0, 3);
    const colors = ['#124C35', '#C87B25', '#397EAC'];
    return sensors.map((s, i) => ({
      name: sensorLabels[s] || s,
      color: colors[i],
      data: history.filter(h => h.sensorType === s).map(h => ({ time: h.timestamp, value: h.value })),
    }));
  }, [currentDevice?.id, history]);

  if (!data || !user) return null;

  const registerDevice = () => {
    if (!registerForm.name.trim() || !registerForm.model.trim() || !registerForm.farmId) {
      setStatusMessage('Enter a device name, model, and farm before registering.');
      return;
    }
    const farm = data.farms.find((item) => item.id === registerForm.farmId) || data.farms[0];
    const device: Device = {
      id: `device-demo-${Date.now()}`,
      farmId: registerForm.farmId,
      zoneId: farm?.zones[0]?.id || 'zone-demo',
      name: registerForm.name.trim(),
      model: registerForm.model.trim(),
      firmware: '1.0.0-demo',
      battery: 100,
      connectivity: 'online',
      lastSeen: new Date().toISOString(),
      sensors: ['soil_moisture', 'air_temperature', 'humidity', 'battery'],
      location: { lat: farm?.lat || 20.5937, lng: farm?.lng || 78.9629 },
      certificateVerified: false,
    };
    setDeviceRecords((current) => [device, ...current]);
    setSelectedDevice(device.id);
    setRegisterForm({ name: '', model: '', farmId: data.farms[0]?.id || '' });
    setShowRegister(false);
    setStatusMessage(`${device.name} registered in sandbox mode.`);
  };

  const runDiagnostics = (deviceId: string) => {
    setDeviceRecords((current) => current.map((device) => device.id === deviceId ? { ...device, connectivity: 'online', lastSeen: new Date().toISOString(), battery: Math.max(device.battery, 25) } : device));
    setStatusMessage('Diagnostics completed. Connectivity and last-seen time were refreshed.');
  };


  const onlineCount = devices.filter(d => d.connectivity === 'online').length;
  const offlineCount = devices.filter(d => d.connectivity === 'offline').length;
  const avgBattery = devices.length > 0 ? Math.round(devices.reduce((s, d) => s + d.battery, 0) / devices.length) : 0;
  const avgConfidence = 92;

  const handleExport = () => {
    if (!currentDevice) return;
    const headers = ['Timestamp', 'Sensor Type', 'Value', 'Unit', 'Confidence', 'Validation'];
    const rows = history.map(h => [h.timestamp, h.sensorType, h.value, h.unit, h.confidence.toFixed(2), h.validationStatus]);
    downloadCsv(`sensor-history-${currentDevice.id}.csv`, headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-brand-text">📡 IoT Dashboard</h1>
          <p className="text-sm text-brand-muted">Real-time sensor monitoring · {devices.length} devices</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" icon={<Download className="w-4 h-4" />} onClick={handleExport}>Export CSV</Button>
          <Button size="sm" icon={<Plus className="w-4 h-4" />} onClick={() => setShowRegister((open) => !open)}>{showRegister ? 'Close form' : 'Register device'}</Button>
        </div>
      </div>

      {statusMessage && <AlertBanner type={statusMessage.startsWith('Enter') ? 'error' : 'success'} title={statusMessage.startsWith('Enter') ? 'Device details incomplete' : 'IoT updated'} message={statusMessage} onClose={() => setStatusMessage('')} />}

      {showRegister && (
        <Card className="p-4 sm:p-5">
          <SectionHeader title="Register IoT device" subtitle="Creates a local demo device and assigns it to a farm." icon={<Radio className="h-5 w-5" />} />
          <div className="grid gap-4 sm:grid-cols-3">
            <Input label="Device name" value={registerForm.name} onChange={(event) => setRegisterForm((current) => ({ ...current, name: event.target.value }))} placeholder="North field sensor" />
            <Input label="Model" value={registerForm.model} onChange={(event) => setRegisterForm((current) => ({ ...current, model: event.target.value }))} placeholder="KT-Sense 4" />
            <Select label="Farm" value={registerForm.farmId} onChange={(event) => setRegisterForm((current) => ({ ...current, farmId: event.target.value }))} options={data.farms.map((farm) => ({ value: farm.id, label: farm.name }))} placeholder="Select farm" />
          </div>
          <div className="mt-4 flex justify-end"><Button onClick={registerDevice} icon={<Plus className="h-4 w-4" />}>Register device</Button></div>
        </Card>
      )}

      {devices.length === 0 ? (
        <Card><EmptyState icon={<Radio className="h-10 w-10" />} title="No IoT devices connected" message="Register a sensor to start live monitoring." action={<Button onClick={() => setShowRegister(true)} icon={<Plus className="h-4 w-4" />}>Register device</Button>} /></Card>
      ) : (
        <>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Online Devices" value={onlineCount} unit={`/ ${devices.length}`} icon={<Wifi className="w-5 h-5" />} accent="success" />
        <StatCard label="Offline Devices" value={offlineCount} icon={<Radio className="w-5 h-5" />} accent="error" />
        <StatCard label="Avg Battery" value={avgBattery} unit="%" icon={<Battery className="w-5 h-5" />} accent="saffron" />
        <StatCard label="Data Confidence" value={avgConfidence} unit="%" icon={<Gauge className="w-5 h-5" />} accent="primary" />
      </div>

      {/* Device selector */}
      <Card className="p-4">
        <div className="flex items-center gap-3 flex-wrap">
          <label htmlFor="iot-device-select" className="text-sm font-medium text-brand-text">Device:</label>
          <select id="iot-device-select" className="input max-w-xs" value={selectedDevice || currentDevice?.id || ''} onChange={e => setSelectedDevice(e.target.value)}>
            {devices.map(d => <option key={d.id} value={d.id}>{d.name} · {d.id}</option>)}
          </select>
          {currentDevice && (
            <div className="flex items-center gap-2 ml-auto">
              <Badge variant={currentDevice.connectivity === 'online' ? 'success' : currentDevice.connectivity === 'degraded' ? 'warning' : 'error'}>
                {currentDevice.connectivity}
              </Badge>
              <Badge variant="muted" icon={<Battery className="w-3 h-3" />}>{currentDevice.battery}%</Badge>
              {currentDevice.certificateVerified && <VerificationBadge status="verified" />}
            </div>
          )}
        </div>
      </Card>

      {/* Tabs */}
      <Tabs
        tabs={[
          { id: 'realtime', label: 'Real-time' },
          { id: 'historical', label: 'Historical' },
          { id: 'devices', label: 'Devices', count: devices.length },
          { id: 'map', label: 'Farm Map' },
        ]}
        active={activeTab}
        onChange={(id) => setActiveTab(id as typeof activeTab)}
      />

      {/* Real-time tab */}
      {activeTab === 'realtime' && currentDevice && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {/* Sensor cards grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {currentDevice.sensors.map(sensor => {
              const reading = liveReadings[sensor];
              return (
                <motion.div key={sensor} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <Card className="p-4" hover onClick={() => setSelectedSensor(sensor)}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-brand-muted">{sensorLabels[sensor] || sensor}</span>
                      <span className="text-lg">{sensorIcons[sensor] || '📡'}</span>
                    </div>
                    <motion.p key={reading?.value} initial={{ opacity: 0.5 }} animate={{ opacity: 1 }} className={cn('text-xl font-bold tabular-nums', selectedSensor === sensor ? 'text-brand-primary' : 'text-brand-text')}>
                      {reading?.value || '—'}<span className="text-xs font-normal text-brand-muted ml-1">{reading?.unit}</span>
                    </motion.p>
                    <div className="mt-2 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-success animate-pulse" />
                      <span className="text-[10px] text-brand-muted">Live · 94% confidence</span>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Live chart for selected sensor */}
          <Card className="p-5">
            <SectionHeader title={`${sensorLabels[selectedSensor] || selectedSensor} — Live`} icon={<Activity className="w-5 h-5" />} action={<Badge variant="success" icon={<span className="w-1.5 h-1.5 rounded-full bg-brand-success animate-pulse" />}>Real-time</Badge>} />
            <SensorChart data={sensorHistory.slice(-20).map(h => ({ timestamp: h.timestamp, value: h.value, unit: h.unit }))} sensorType={selectedSensor} height={220} />
          </Card>

          {/* Irrigation control (simulation) */}
          <Card className="p-5">
            <SectionHeader title="Irrigation Controls (Simulation)" icon={<Zap className="w-5 h-5" />} action={<Badge variant="warning">Simulation Mode</Badge>} />
            <div className="flex items-center justify-between p-4 rounded-lg bg-brand-cream/50 border border-brand-border">
              <div className="flex items-center gap-3">
                <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', pumpOn ? 'bg-brand-sky/20 text-brand-sky' : 'bg-brand-muted/10 text-brand-muted')}>
                  <Zap className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-brand-text">Irrigation Pump</p>
                  <p className="text-xs text-brand-muted">{pumpOn ? 'Running · Flow: 12.5 L/min' : 'Stopped'}</p>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={pumpOn}
                aria-label={pumpOn ? 'Turn irrigation pump off' : 'Turn irrigation pump on'}
                onClick={() => setPumpOn(!pumpOn)}
                className={cn('relative w-14 h-7 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/30', pumpOn ? 'bg-brand-primary' : 'bg-brand-border')}
              >
                <span className={cn('absolute top-1 w-5 h-5 rounded-full bg-white transition-transform', pumpOn ? 'translate-x-7' : 'translate-x-1')} />
              </button>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Historical tab */}
      {activeTab === 'historical' && currentDevice && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <Card className="p-5">
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <label htmlFor="iot-sensor-select" className="text-sm font-medium">Sensor:</label>
              <select id="iot-sensor-select" className="input max-w-xs" value={selectedSensor} onChange={e => setSelectedSensor(e.target.value)}>
                {currentDevice.sensors.map(s => <option key={s} value={s}>{sensorLabels[s] || s}</option>)}
              </select>
              <label htmlFor="iot-range-select" className="text-sm font-medium ml-2">Range:</label>
              <select id="iot-range-select" className="input max-w-[120px]" defaultValue="30">
                <option value="7">7 days</option>
                <option value="30">30 days</option>
                <option value="90">90 days</option>
              </select>
              <Button variant="outline" size="sm" icon={<Download className="w-3.5 h-3.5" />} onClick={handleExport} className="ml-auto">Export</Button>
            </div>
            <SensorChart data={sensorHistory.map(h => ({ timestamp: h.timestamp, value: h.value, unit: h.unit }))} sensorType={selectedSensor} height={260} />
          </Card>

          {/* Multi-sensor comparison */}
          <Card className="p-5">
            <SectionHeader title="Sensor Comparison" subtitle="Compare up to 3 sensors" icon={<Activity className="w-5 h-5" />} />
            <MultiSensorChart series={multiSeries} height={240} />
          </Card>

          {/* Sensor metadata */}
          <Card className="p-5">
            <SectionHeader title="Sensor Data Details" icon={<Cpu className="w-5 h-5" />} />
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-brand-border">
                  <th className="text-left py-2 px-3 text-xs font-semibold text-brand-muted">Timestamp</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-brand-muted">Sensor</th>
                  <th className="text-right py-2 px-3 text-xs font-semibold text-brand-muted">Value</th>
                  <th className="text-right py-2 px-3 text-xs font-semibold text-brand-muted">Confidence</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-brand-muted">Signature</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-brand-muted">Status</th>
                </tr></thead>
                <tbody>
                  {history.slice(-8).reverse().map((h, i) => (
                    <tr key={i} className="border-b border-brand-border/40 hover:bg-brand-soft/20">
                      <td className="py-2 px-3 text-xs text-brand-muted">{new Date(h.timestamp).toLocaleString('en-IN')}</td>
                      <td className="py-2 px-3 text-xs text-brand-text">{sensorLabels[h.sensorType] || h.sensorType}</td>
                      <td className="py-2 px-3 text-right text-xs font-medium text-brand-text">{h.value} {h.unit}</td>
                      <td className="py-2 px-3 text-right text-xs text-brand-text">{(h.confidence * 100).toFixed(0)}%</td>
                      <td className="py-2 px-3 text-xs font-mono text-brand-muted">{h.signature}</td>
                      <td className="py-2 px-3"><Badge variant={h.validationStatus === 'valid' ? 'success' : 'warning'}>{h.validationStatus}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Devices tab */}
      {activeTab === 'devices' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            {devices.map(d => (
              <Card key={d.id} className="p-4" hover>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', d.connectivity === 'online' ? 'bg-brand-success/10 text-brand-success' : 'bg-brand-error/10 text-brand-error')}>
                      <Radio className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-brand-text">{d.name}</p>
                      <p className="text-xs text-brand-muted">{d.model} · {d.id}</p>
                    </div>
                  </div>
                  <Badge variant={d.connectivity === 'online' ? 'success' : d.connectivity === 'degraded' ? 'warning' : 'error'}>{d.connectivity}</Badge>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center mb-3">
                  <div className="p-1.5 rounded bg-brand-cream/50"><Battery className="w-3.5 h-3.5 mx-auto text-brand-saffron mb-0.5" /><p className="text-xs font-medium">{d.battery}%</p></div>
                  <div className="p-1.5 rounded bg-brand-cream/50"><Cpu className="w-3.5 h-3.5 mx-auto text-brand-muted mb-0.5" /><p className="text-xs font-medium">{d.firmware}</p></div>
                  <div className="p-1.5 rounded bg-brand-cream/50"><Gauge className="w-3.5 h-3.5 mx-auto text-brand-primary mb-0.5" /><p className="text-xs font-medium">{d.sensors.length}</p></div>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-brand-muted">Last seen: {timeAgo(d.lastSeen)}</span>
                  <Button variant="ghost" size="sm" icon={<Settings className="w-3.5 h-3.5" />} onClick={() => setConfigureId(configureId === d.id ? null : d.id)}>{configureId === d.id ? 'Close' : 'Configure'}</Button>
                </div>
                {configureId === d.id && (
                  <div className="mt-3 rounded-lg border border-brand-border bg-brand-cream/50 p-3">
                    <p className="text-xs font-semibold text-brand-text">Device controls</p>
                    <p className="mt-1 text-xs leading-relaxed text-brand-muted">Diagnostics refresh the demo connection state. Production controls require signed device commands.</p>
                    <Button className="mt-3 w-full" variant="outline" size="sm" onClick={() => runDiagnostics(d.id)} icon={<RefreshCw className="h-3.5 w-3.5" />}>Run diagnostics</Button>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </motion.div>
      )}

      {/* Map tab */}
      {activeTab === 'map' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-5">
            <SectionHeader title="Farm Map & Sensor Locations" icon={<MapPin className="w-5 h-5" />} />
            <div className="rounded-xl border border-brand-border bg-brand-soft/30 h-[400px] flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=%2240%22 height=%2240%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Crect width=%2240%22 height=%2240%22 fill=%22none%22 stroke=%22%23176B47%22 stroke-width=%220.5%22/%3E%3C/svg%3E")' }} />
              <div className="relative text-center">
                <MapPin className="w-12 h-12 text-brand-primary mx-auto mb-2" />
                <p className="text-sm font-medium text-brand-text">Interactive Farm Map</p>
                <p className="text-xs text-brand-muted mt-1">Leaflet/Mapbox integration point</p>
                <p className="text-xs text-brand-muted">{devices.length} sensors across {data?.farms.length} farms</p>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
        </>
      )}
    </div>
  );
}
