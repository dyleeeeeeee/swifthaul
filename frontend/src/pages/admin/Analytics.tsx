import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell
} from 'recharts'
import { api, Analytics as AnalyticsType } from '../../lib/api'

const CHART_COLORS = ['#00e5ff', '#7c4dff', '#ff6d00', '#00e676', '#ff1744']

const MOCK: Partial<AnalyticsType> = {
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
  topCountries: [
    { country: 'United States', count: 3842 },
    { country: 'United Kingdom', count: 2103 },
    { country: 'Germany', count: 1876 },
    { country: 'France', count: 1432 },
    { country: 'Japan', count: 1198 },
  ],
  shipmentsOverTime: Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    count: Math.floor(300 + Math.random() * 200),
  })),
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="glass p-6"
    >
      <h3 className="text-sm font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>{title}</h3>
      {children}
    </motion.div>
  )
}

const tooltipStyle = {
  contentStyle: {
    background: 'rgba(10,15,30,0.95)',
    border: '1px solid rgba(0,229,255,0.2)',
    borderRadius: '12px',
    color: '#00e5ff',
  },
  labelStyle: { color: 'rgba(240,244,255,0.55)', fontSize: '11px' },
}

export default function Analytics() {
  const { data = MOCK } = useQuery<Partial<AnalyticsType>>({
    queryKey: ['analytics'],
    queryFn: api.getAnalytics,
    placeholderData: MOCK,
  })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl" style={{ color: 'var(--text-primary)' }}>ANALYTICS</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Performance metrics and trend analysis.</p>
      </div>

      {/* Row 1 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <ChartCard title="Shipments — Last 30 Days">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data.shipmentsOverTime} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="cyanGrad2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00e5ff" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#00e5ff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'rgba(240,244,255,0.28)' }} axisLine={false} tickLine={false} interval={6} />
              <YAxis tick={{ fontSize: 10, fill: 'rgba(240,244,255,0.28)' }} axisLine={false} tickLine={false} />
              <Tooltip {...tooltipStyle} />
              <Area type="monotone" dataKey="count" stroke="#00e5ff" strokeWidth={2} fill="url(#cyanGrad2)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Avg Delivery Time (Days)">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data.avgDeliveryTime} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'rgba(240,244,255,0.28)' }} axisLine={false} tickLine={false} interval={3} />
              <YAxis tick={{ fontSize: 10, fill: 'rgba(240,244,255,0.28)' }} axisLine={false} tickLine={false} domain={[0, 6]} />
              <Tooltip {...tooltipStyle} />
              <Line type="monotone" dataKey="days" stroke="#7c4dff" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <ChartCard title="Revenue by Service Type ($)">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.revenueByService} margin={{ top: 5, right: 5, bottom: 0, left: -10 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="service" tick={{ fontSize: 10, fill: 'rgba(240,244,255,0.28)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'rgba(240,244,255,0.28)' }} axisLine={false} tickLine={false} />
              <Tooltip {...tooltipStyle} formatter={(v: number) => [`$${v.toLocaleString()}`, 'Revenue']} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {data.revenueByService?.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Exception Rate (%)">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data.exceptionRate} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="redGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ff1744" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#ff1744" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'rgba(240,244,255,0.28)' }} axisLine={false} tickLine={false} interval={3} />
              <YAxis tick={{ fontSize: 10, fill: 'rgba(240,244,255,0.28)' }} axisLine={false} tickLine={false} />
              <Tooltip {...tooltipStyle} formatter={(v: number) => [`${v}%`, 'Exception Rate']} />
              <Area type="monotone" dataKey="rate" stroke="#ff1744" strokeWidth={2} fill="url(#redGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Top Countries */}
      <ChartCard title="Top Destination Countries">
        <div className="space-y-3">
          {data.topCountries?.map((c, i) => {
            const max = data.topCountries?.[0]?.count ?? 1
            return (
              <div key={c.country} className="flex items-center gap-4">
                <div className="w-4 text-xs font-mono text-right" style={{ color: 'var(--text-muted)' }}>{i + 1}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{c.country}</span>
                    <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{c.count.toLocaleString()}</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--glass-bg)' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${(c.count / max) * 100}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: i * 0.1, ease: [0.23, 1, 0.32, 1] }}
                      className="h-full rounded-full"
                      style={{ background: CHART_COLORS[i % CHART_COLORS.length] }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </ChartCard>
    </div>
  )
}
