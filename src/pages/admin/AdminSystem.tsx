// AgriSmart — Admin System Health
import { ScoreGauge,Sparkline } from '@/components/charts';
import { Badge,Card,SectionHeader,StatCard } from '@/components/ui';
import { useAppStore } from '@/store';
import { Activity,CheckCircle2,Cpu,Database,Globe,HardDrive,Radio,Server,Wifi,Zap } from 'lucide-react';
import { useEffect,useMemo,useState } from 'react';

export function AdminSystem() {
  const { lowBandwidth, reducedMotion } = useAppStore();
  const [cpuUsage, setCpuUsage] = useState(34);
  const [memUsage, setMemUsage] = useState(56);
  const [apiLatency, setApiLatency] = useState(142);

  useEffect(() => {
    const interval = setInterval(() => {
      setCpuUsage(25 + Math.floor(Math.random() * 30));
      setMemUsage(45 + Math.floor(Math.random() * 25));
      setApiLatency(120 + Math.floor(Math.random() * 60));
    }, lowBandwidth ? 12_000 : reducedMotion ? 8_000 : 3_000);
    return () => clearInterval(interval);
  }, [lowBandwidth, reducedMotion]);

  const sparkData = useMemo(() => Array.from({ length: 30 }, (_, i) => 32 + Math.sin(i / 4) * 10 + ((i * 3) % 5)), []);
  const memSpark = useMemo(() => Array.from({ length: 30 }, (_, i) => 52 + Math.cos(i / 5) * 8 + ((i * 5) % 4)), []);
  const latencySpark = useMemo(() => Array.from({ length: 30 }, (_, i) => 142 + Math.sin(i / 3) * 20 + ((i * 7) % 10)), []);

  const services = [
    { name: 'API Server (NestJS)', status: 'operational', uptime: '99.98%', icon: <Server className="w-5 h-5" /> },
    { name: 'PostgreSQL + TimescaleDB', status: 'operational', uptime: '99.99%', icon: <Database className="w-5 h-5" /> },
    { name: 'Redis Cache', status: 'operational', uptime: '99.97%', icon: <Zap className="w-5 h-5" /> },
    { name: 'MQTT Broker', status: 'operational', uptime: '99.95%', icon: <Radio className="w-5 h-5" /> },
    { name: 'WebSocket Gateway', status: 'operational', uptime: '99.96%', icon: <Wifi className="w-5 h-5" /> },
    { name: 'S3 / MinIO Storage', status: 'operational', uptime: '99.99%', icon: <HardDrive className="w-5 h-5" /> },
    { name: 'Blockchain RPC (Polygon)', status: 'operational', uptime: '99.93%', icon: <Globe className="w-5 h-5" /> },
    { name: 'BullMQ Job Queue', status: 'operational', uptime: '99.98%', icon: <Activity className="w-5 h-5" /> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div><h1 className="text-xl font-bold text-brand-text">🖥️ System Health</h1><p className="text-sm text-brand-muted">Monitor platform infrastructure and services</p></div>
        <Badge variant="success" icon={<span className="w-1.5 h-1.5 rounded-full bg-brand-success animate-pulse" />}>All Systems Operational</Badge>
      </div>

      {/* Top metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="CPU Usage" value={cpuUsage} unit="%" icon={<Cpu className="w-5 h-5" />} accent={cpuUsage > 70 ? 'error' : 'primary'} />
        <StatCard label="Memory" value={memUsage} unit="%" icon={<Database className="w-5 h-5" />} accent={memUsage > 80 ? 'warning' : 'sky'} />
        <StatCard label="API Latency" value={apiLatency} unit="ms" icon={<Activity className="w-5 h-5" />} accent={apiLatency > 200 ? 'warning' : 'success'} />
        <StatCard label="Uptime" value="99.97" unit="%" icon={<CheckCircle2 className="w-5 h-5" />} accent="success" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Live charts */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-5">
            <SectionHeader title="CPU Usage — Last 30 Minutes" icon={<Cpu className="w-5 h-5" />} action={<Badge variant={cpuUsage > 70 ? 'error' : 'success'}>{cpuUsage}%</Badge>} />
            <Sparkline data={sparkData} color="#124C35" height={80} />
          </Card>
          <Card className="p-5">
            <SectionHeader title="Memory Usage" icon={<Database className="w-5 h-5" />} action={<Badge variant={memUsage > 80 ? 'warning' : 'success'}>{memUsage}%</Badge>} />
            <Sparkline data={memSpark} color="#397EAC" height={80} />
          </Card>
          <Card className="p-5">
            <SectionHeader title="API Response Time" icon={<Activity className="w-5 h-5" />} action={<Badge variant={apiLatency > 200 ? 'warning' : 'success'}>{apiLatency}ms</Badge>} />
            <Sparkline data={latencySpark} color="#C87B25" height={80} />
          </Card>
        </div>

        {/* Right: Services list */}
        <div className="space-y-4">
          <Card className="p-5 text-center">
            <SectionHeader title="Overall Health" icon={<Server className="w-5 h-5" />} />
            <ScoreGauge score={98} label="Healthy" height={130} />
          </Card>

          <Card className="p-5">
            <SectionHeader title="Service Status" icon={<Server className="w-5 h-5" />} />
            <div className="space-y-2">
              {services.map(s => (
                <div key={s.name} className="flex items-center justify-between p-2.5 rounded-lg border border-brand-border">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-brand-primary shrink-0">{s.icon}</span>
                    <span className="text-xs font-medium text-brand-text truncate">{s.name}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-brand-muted">{s.uptime}</span>
                    <span className="w-2 h-2 rounded-full bg-brand-success animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <SectionHeader title="Queue Status" icon={<Activity className="w-5 h-5" />} />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-brand-muted">Sensor ingestion</span><span className="font-medium text-brand-text">3 pending</span></div>
              <div className="flex justify-between"><span className="text-brand-muted">Notification dispatch</span><span className="font-medium text-brand-text">12 pending</span></div>
              <div className="flex justify-between"><span className="text-brand-muted">Report generation</span><span className="font-medium text-brand-text">1 pending</span></div>
              <div className="flex justify-between"><span className="text-brand-muted">Blockchain indexing</span><span className="font-medium text-brand-text">0 pending</span></div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
