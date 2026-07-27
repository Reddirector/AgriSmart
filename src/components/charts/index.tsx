// ============================================================
// AgriSmart — Chart Components (Recharts)
// ============================================================
import { sensorLabels } from '@/lib/utils';
import { useAppStore } from '@/store';
import { useId,useMemo } from 'react';
import {
Area,
AreaChart,
Bar,
BarChart,
CartesianGrid,
Cell,
Line,
LineChart,
Pie,
PieChart,
RadialBar,
RadialBarChart,
ResponsiveContainer,
Tooltip,
XAxis,YAxis,
} from 'recharts';

const COLORS = {
  primary: '#124C35', dark: '#082A1D', soft: '#DCEAE2', saffron: '#C87B25',
  sky: '#397EAC', success: '#18734B', warning: '#B96F17', error: '#B13D3D',
  muted: '#58665D', border: '#D4DED7',
};

const PIE_COLORS = ['#124C35', '#C87B25', '#397EAC', '#18734B', '#B96F17', '#B13D3D'];

// ── Custom Tooltip ─────────────────────────────────────────
function ChartTooltip({ active, payload, label, unit }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="card p-2.5 shadow-lift text-xs">
      {label && <p className="font-semibold text-brand-text mb-1">{label}</p>}
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-brand-muted">
          <span className="inline-block w-2 h-2 rounded-full mr-1.5" style={{ background: p.color || p.fill }} />
          {p.name}: <span className="font-medium text-brand-text">{p.value}{unit || p.unit || ''}</span>
        </p>
      ))}
    </div>
  );
}

// ── Sensor Time Series Chart ───────────────────────────────
export function SensorChart({ data, sensorType, height = 200 }: { data: { timestamp: string; value: number; unit?: string }[]; sensorType: string; height?: number }) {
  const { lowBandwidth, reducedMotion } = useAppStore();
  const gradientId = `sensor-${useId().replace(/:/g, '')}`;
  const label = sensorLabels[sensorType] || sensorType;
  const chartData = useMemo(() => data.map(d => ({
    time: new Date(d.timestamp).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
    value: d.value,
  })), [data]);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3} />
            <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} vertical={false} />
        <XAxis dataKey="time" tick={{ fontSize: 11, fill: COLORS.muted }} interval={Math.max(0, Math.floor(chartData.length / 6))} />
        <YAxis tick={{ fontSize: 11, fill: COLORS.muted }} />
        <Tooltip content={<ChartTooltip unit={data[0]?.unit || ''} />} />
        <Area type="monotone" dataKey="value" name={label} stroke={COLORS.primary} strokeWidth={2} fill={`url(#${gradientId})`} isAnimationActive={!lowBandwidth && !reducedMotion} animationDuration={lowBandwidth || reducedMotion ? 0 : 400} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ── Multi-Sensor Comparison ────────────────────────────────
export function MultiSensorChart({ series, height = 240 }: { series: { name: string; color: string; data: { time: string; value: number }[] }[]; height?: number }) {
  const { lowBandwidth, reducedMotion } = useAppStore();
  const allTimes = series[0]?.data.map(d => d.time) || [];
  const chartData = allTimes.map((time, i) => {
    const point: any = { time: new Date(time).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) };
    series.forEach(s => { point[s.name] = s.data[i]?.value; });
    return point;
  });

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} vertical={false} />
        <XAxis dataKey="time" tick={{ fontSize: 11, fill: COLORS.muted }} interval={Math.max(0, Math.floor(chartData.length / 6))} />
        <YAxis tick={{ fontSize: 11, fill: COLORS.muted }} />
        <Tooltip content={<ChartTooltip />} />
        {series.map(s => (
          <Line key={s.name} type="monotone" dataKey={s.name} stroke={s.color} strokeWidth={2} dot={false} isAnimationActive={!lowBandwidth && !reducedMotion} animationDuration={lowBandwidth || reducedMotion ? 0 : 400} />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

// ── Simple Bar Chart ───────────────────────────────────────
export function SimpleBarChart({ data, height = 200, color = COLORS.primary }: { data: { label: string; value: number }[]; height?: number; color?: string }) {
  const { lowBandwidth, reducedMotion } = useAppStore();
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: COLORS.muted }} />
        <YAxis tick={{ fontSize: 11, fill: COLORS.muted }} />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: COLORS.soft }} />
        <Bar dataKey="value" fill={color} radius={[6, 6, 0, 0]} isAnimationActive={!lowBandwidth && !reducedMotion} animationDuration={lowBandwidth || reducedMotion ? 0 : 400} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── Donut / Pie Chart ──────────────────────────────────────
export function DonutChart({ data, height = 200 }: { data: { name: string; value: number }[]; height?: number }) {
  const { lowBandwidth, reducedMotion } = useAppStore();
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={2} dataKey="value" isAnimationActive={!lowBandwidth && !reducedMotion}>
          {data.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
        </Pie>
        <Tooltip content={<ChartTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  );
}

// ── Radial Score Gauge ─────────────────────────────────────
export function ScoreGauge({ score, label, height = 160 }: { score: number; label: string; height?: number }) {
  const { lowBandwidth, reducedMotion } = useAppStore();
  const safeScore = Math.max(0, Math.min(100, score));
  const color = safeScore >= 85 ? COLORS.success : safeScore >= 70 ? COLORS.primary : safeScore >= 50 ? COLORS.warning : COLORS.error;
  const data = [{ name: label, value: safeScore, fill: color }];
  return (
    <div className="relative mx-auto w-full max-w-[220px]" style={{ height }} role="img" aria-label={`${label}: ${safeScore} out of 100`}>
      <ResponsiveContainer width="100%" height={height}>
        <RadialBarChart cx="50%" cy="50%" innerRadius="65%" outerRadius="100%" data={data} startAngle={90} endAngle={-270}>
          <RadialBar background={{ fill: COLORS.border }} dataKey="value" cornerRadius={8} isAnimationActive={!lowBandwidth && !reducedMotion} />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-extrabold tabular-nums text-brand-text">{safeScore}<span className="ml-0.5 text-sm font-semibold text-brand-muted">/100</span></span>
        <span className="mt-1 max-w-[9rem] truncate text-center text-xs font-semibold text-brand-muted" title={label}>{label}</span>
      </div>
    </div>
  );
}

// ── Sparkline (mini chart) ─────────────────────────────────
export function Sparkline({ data, color = COLORS.primary, height = 40 }: { data: number[]; color?: string; height?: number }) {
  const { lowBandwidth, reducedMotion } = useAppStore();
  const gradientId = `spark-${useId().replace(/:/g, '')}`;
  const chartData = data.map((v, i) => ({ i, v }));
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={chartData} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.2} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} fill={`url(#${gradientId})`} isAnimationActive={!lowBandwidth && !reducedMotion} animationDuration={lowBandwidth || reducedMotion ? 0 : 300} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
