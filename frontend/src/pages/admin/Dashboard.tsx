import { useRef } from 'react'
import { useInView } from 'framer-motion'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import {
  Package, Truck, CheckCircle, AlertTriangle, TrendingUp, TrendingDown
} from 'lucide-react'
import {
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts'
import { api, Analytics } from '../../lib/api'
import { useCountUp } from '../../hooks/useCountUp'
import StatusBadge from '../../components/ui/StatusBadge'
import { formatDate } from '../../lib/utils'

const CHART_COLORS = ['#00e5ff', '#7c4dff', '#ff6d00', '#00e676', '#ff1744']

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="chart-tooltip">
      <p className="text-xs font-mono mb-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
      <p className="text-sm font-semibold" style={{ color: 'var(--accent-primary)' }}>{payload[0].value}</p>
    </div>
  )
}

function KpiCard({ icon: Icon, label, value, delta, color }: {
  icon: React.ElementType; label: string; value: number; delta?: number; color: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true })
  const count = useCountUp(value, 1500, inView)
  const isUp = (delta ?? 0) >= 0

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -4 }}
      className="glass glass-shimmer p-6"
      style={{ willChange: 'transform' }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 glass-sm flex items-center justify-center" style={{ borderRadius: '10px' }}>
          <Icon size={18} style={{ color }} />
        </div>
        {delta !== undefined && (
          <span className={`text-xs font-mono flex items-center gap-1`}
            style={{ color: isUp ? '#00e676' : '#ff1744' }}>
            {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {Math.abs(delta)}%
          </span>
        )}
      </div>
      <p className="text-xs font-mono mb-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
      <p className="font-display text-3xl" style={{ color: 'var(--text-primary)' }}>
        {count.toLocaleString()}
      </p>
    </motion.div>
  )
}

const MOCK_ANALYTICS: Analytics = {
  totalParcels: 12847,
  inTransit: 3421,
  deliveredToday: 847,
  exceptions: 23,
  shipmentsOverTime: Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    count: Math.floor(300 + Math.random() * 200),
  })),
  statusBreakdown: [
    { status: 'IN_TRANSIT', count: 3421 },
    { status: 'DELIVERED', count: 7934 },
    { status: 'CREATED', count: 1246 },
    { status: 'OUT_FOR_DELIVERY', count: 223 },
    { status: 'EXCEPTION', count: 23 },
  ],
  topCountries: [
    { country: 'United States', count: 3842 },
    { country: 'United Kingdom', count: 2103 },
    { country: 'Germany', count: 1876 },
    { country: 'France', count: 1432 },
    { country: 'Japan', count: 1198 },
  ],
  avgDeliveryTime: Array.from({ length: 14 }, (_, i) => ({
    date: new Date(Date.now() - (13 - i) * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    days: +(2.5 + Math.random() * 1.5).toFixed(1),
  })),
  exceptionRate: Array.from({ length: 14 }, (_, i) => ({
    date: new Date(Date.now() - (13 - i) * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    rate: +(0.1 + Math.random() * 0.4).toFixed(2),
  })),
  revenueByService: [
    { service: 'Express', value: 48200 },
    { service: 'Standard', value: 31500 },
    { service: 'Air Freight', value: 22800 },
    { service: 'Ocean', value: 15300 },
    { service: 'Cold Chain', value: 9700 },
  ],
  recentActivity: Array.from({ length: 8 }, (_, i) => ({
    id: String(i),
    parcel_id: `SH-2024-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    event_type: ['IN_TRANSIT', 'DELIVERED', 'OUT_FOR_DELIVERY', 'ARRIVED_HUB'][i % 4],
    location: ['New York, USA', 'London, UK', 'Frankfurt, DE', 'Tokyo, JP'][i % 4],
    timestamp: new Date(Date.now() - i * 3600000).toISOString(),
    current_status: ['IN_TRANSIT', 'DELIVERED', 'OUT_FOR_DELIVERY', 'ARRIVED_HUB'][i % 4],
  })),
}

export default function Dashboard() {
  const { data = MOCK_ANALYTICS } = useQuery<Analytics>({
    queryKey: ['analytics'],
    queryFn: api.getAnalytics,
    placeholderData: MOCK_ANALYTICS,
  })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl" style={{ color: 'var(--text-primary)' }}>DASHBOARD</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          Live operational overview — {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard icon={Package}       label="TOTAL PARCELS"    value={data.totalParcels}    delta={12}  color="var(--accent-primary)" />
        <KpiCard icon={Truck}         label="IN TRANSIT"       value={data.inTransit}        delta={3}   color="var(--accent-secondary)" />
        <KpiCard icon={CheckCircle}   label="DELIVERED TODAY"  value={data.deliveredToday}   delta={8}   color="#00e676" />
        <KpiCard icon={AlertTriangle} label="EXCEPTIONS"       value={data.exceptions}       delta={-15} color="var(--accent-warm)" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Line Chart — shipments over time */}
        <div className="xl:col-span-3 glass p-6">
          <h3 className="text-sm font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>Shipments — Last 30 Days</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data.shipmentsOverTime} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="cyanGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00e5ff" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#00e5ff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'rgba(240,244,255,0.28)' }} axisLine={false} tickLine={false} interval={6} />
              <YAxis tick={{ fontSize: 10, fill: 'rgba(240,244,255,0.28)' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="count" stroke="#00e5ff" strokeWidth={2} fill="url(#cyanGrad)"
                animationDuration={1200} animationEasing="ease-out" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Donut Chart — status breakdown */}
        <div className="xl:col-span-2 glass p-6">
          <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Status Breakdown</h3>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={data.statusBreakdown} dataKey="count" nameKey="status"
                cx="50%" cy="50%" innerRadius={45} outerRadius={70}
                animationDuration={1200} animationEasing="ease-out">
                {data.statusBreakdown.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(v: number, n: string) => [v, n]}
                contentStyle={{ background: 'rgba(10,15,30,0.95)', border: '1px solid rgba(0,229,255,0.2)', borderRadius: '12px' }}
                labelStyle={{ color: 'rgba(240,244,255,0.55)', fontSize: '11px' }}
                itemStyle={{ color: '#00e5ff' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-3 space-y-1.5">
            {data.statusBreakdown.map((s, i) => (
              <div key={s.status} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                  <span style={{ color: 'var(--text-secondary)' }}>{s.status.replace(/_/g, ' ')}</span>
                </div>
                <span className="font-mono" style={{ color: 'var(--text-primary)' }}>{s.count.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="glass p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Recent Activity</h3>
          <button className="text-xs font-mono transition-colors hover:text-white"
            style={{ color: 'var(--accent-primary)' }}>View All →</button>
        </div>
        <div className="space-y-1">
          {data.recentActivity.map(act => (
            <motion.div
              key={act.id}
              whileHover={{ background: 'rgba(255,255,255,0.03)' }}
              className="flex items-center gap-4 px-3 py-3 rounded-xl"
              style={{ cursor: 'default' }}
            >
              <span className="font-mono text-xs shrink-0" style={{ color: 'var(--accent-primary)' }}>
                {act.parcel_id}
              </span>
              <span className="text-xs flex-1" style={{ color: 'var(--text-secondary)' }}>
                {act.event_type.replace(/_/g, ' ')} — {act.location}
              </span>
              <StatusBadge status={act.current_status} size="sm" />
              <span className="text-xs font-mono shrink-0" style={{ color: 'var(--text-muted)' }}>
                {formatDate(act.timestamp)}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
