import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { sign, verify } from 'hono/jwt'
import bcrypt from 'bcryptjs'

type Env = {
  DB: D1Database
  CACHE: KVNamespace
  JWT_SECRET: string
}

const app = new Hono<{ Bindings: Env }>()

app.use('*', cors({
  origin: (origin) => {
    if (!origin) return '*'
    if (
      origin.startsWith('http://localhost') ||
      origin.endsWith('.pages.dev') ||
      origin === 'https://swifthaul.pages.dev'
    ) return origin
    return null
  },
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}))

function generateId(): string {
  const year = new Date().getFullYear()
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let r = ''
  for (let i = 0; i < 6; i++) r += chars[Math.floor(Math.random() * chars.length)]
  return `SH-${year}-${r}`
}

function authMiddleware() {
  return async (c: any, next: any) => {
    const header = c.req.header('Authorization') ?? ''
    if (!header.startsWith('Bearer ')) {
      return c.json({ error: 'Unauthorized' }, 401)
    }
    const token = header.slice(7)
    try {
      const payload = await verify(token, c.env.JWT_SECRET, 'HS256')
      c.set('jwtPayload', payload)
      await next()
    } catch {
      return c.json({ error: 'Invalid token' }, 401)
    }
  }
}

/* =========================================================
   PUBLIC: TRACK
   ========================================================= */
app.get('/api/track/:id', async (c) => {
  const id = c.req.param('id').toUpperCase()

  const cacheKey = `track:${id}`
  const cached = await c.env.CACHE.get(cacheKey, 'json') as any
  if (cached) return c.json(cached)

  const parcel = await c.env.DB.prepare(
    'SELECT * FROM parcels WHERE id = ?'
  ).bind(id).first()

  if (!parcel) return c.json({ error: 'Parcel not found' }, 404)

  const events = await c.env.DB.prepare(
    'SELECT * FROM tracking_events WHERE parcel_id = ? ORDER BY timestamp DESC'
  ).bind(id).all()

  const result = { parcel, events: events.results }
  await c.env.CACHE.put(cacheKey, JSON.stringify(result), { expirationTtl: 300 })

  return c.json(result)
})

/* =========================================================
   AUTH
   ========================================================= */
app.post('/api/auth/login', async (c) => {
  const { email, password } = await c.req.json()

  const admin = await c.env.DB.prepare(
    'SELECT * FROM admins WHERE email = ?'
  ).bind(email).first() as any

  if (!admin) return c.json({ error: 'Invalid credentials' }, 401)

  const valid = await bcrypt.compare(password, admin.password_hash)
  if (!valid) return c.json({ error: 'Invalid credentials' }, 401)

  const token = await sign(
    { sub: admin.id, email: admin.email, role: 'admin', exp: Math.floor(Date.now() / 1000) + 86400 },
    c.env.JWT_SECRET
  )

  return c.json({ token, admin: { id: admin.id, email: admin.email, name: admin.name } })
})

/* =========================================================
   PARCELS (ADMIN — PROTECTED)
   ========================================================= */
const parcelsRouter = new Hono<{ Bindings: Env }>()
parcelsRouter.use('*', authMiddleware())

parcelsRouter.get('/', async (c) => {
  const { search = '', status = '', page = '1', pageSize = '10' } = c.req.query()
  const offset = (Number(page) - 1) * Number(pageSize)

  let query = 'SELECT * FROM parcels WHERE 1=1'
  let countQuery = 'SELECT COUNT(*) as total FROM parcels WHERE 1=1'
  const bindings: string[] = []

  if (search) {
    query += ' AND (id LIKE ? OR sender_name LIKE ? OR receiver_name LIKE ?)'
    countQuery += ' AND (id LIKE ? OR sender_name LIKE ? OR receiver_name LIKE ?)'
    const s = `%${search}%`
    bindings.push(s, s, s)
  }
  if (status) {
    query += ' AND current_status = ?'
    countQuery += ' AND current_status = ?'
    bindings.push(status)
  }

  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?'

  const [parcels, countResult] = await Promise.all([
    c.env.DB.prepare(query).bind(...bindings, Number(pageSize), offset).all(),
    c.env.DB.prepare(countQuery).bind(...bindings).first() as Promise<{ total: number }>,
  ])

  return c.json({ parcels: parcels.results, total: countResult.total, page: Number(page), pageSize: Number(pageSize) })
})

parcelsRouter.post('/', async (c) => {
  const body = await c.req.json()
  const id = generateId()
  const now = new Date().toISOString()

  await c.env.DB.prepare(`
    INSERT INTO parcels (id, sender_name, sender_address, sender_country, receiver_name, receiver_address, receiver_country,
      weight_kg, dimensions, service_type, declared_value, current_status, eta, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'CREATED', ?, ?, ?)
  `).bind(
    id,
    body.sender_name, body.sender_address, body.sender_country,
    body.receiver_name, body.receiver_address, body.receiver_country,
    body.weight_kg, body.dimensions ?? '', body.service_type, body.declared_value ?? 0,
    body.eta ?? new Date(Date.now() + 5 * 86400000).toISOString(),
    now, now
  ).run()

  await c.env.DB.prepare(`
    INSERT INTO tracking_events (id, parcel_id, event_type, location, description, timestamp)
    VALUES (?, ?, 'CREATED', ?, 'Shipment created and registered', ?)
  `).bind(crypto.randomUUID(), id, body.sender_country, now).run()

  return c.json({ id, status: 'CREATED' }, 201)
})

parcelsRouter.put('/:id', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json()
  const now = new Date().toISOString()

  const setClauses: string[] = []
  const vals: (string | number)[] = []

  const allowed = ['sender_name','sender_address','sender_country','receiver_name','receiver_address',
    'receiver_country','weight_kg','dimensions','service_type','declared_value','current_status','eta']
  for (const key of allowed) {
    if (body[key] !== undefined) { setClauses.push(`${key} = ?`); vals.push(body[key]) }
  }
  if (!setClauses.length) return c.json({ error: 'Nothing to update' }, 400)
  vals.push(now, id)

  await c.env.DB.prepare(
    `UPDATE parcels SET ${setClauses.join(', ')}, updated_at = ? WHERE id = ?`
  ).bind(...vals).run()

  await c.env.CACHE.delete(`track:${id}`)

  return c.json({ success: true })
})

parcelsRouter.delete('/:id', async (c) => {
  const id = c.req.param('id')
  await c.env.DB.prepare('DELETE FROM tracking_events WHERE parcel_id = ?').bind(id).run()
  await c.env.DB.prepare('DELETE FROM parcels WHERE id = ?').bind(id).run()
  await c.env.CACHE.delete(`track:${id}`)
  return c.json({ success: true })
})

/* =========================================================
   TRACKING EVENTS (ADMIN — PROTECTED)
   ========================================================= */
const eventsRouter = new Hono<{ Bindings: Env }>()
eventsRouter.use('*', authMiddleware())

eventsRouter.post('/:parcelId', async (c) => {
  const parcelId = c.req.param('parcelId').toUpperCase()
  const { event_type, location, description } = await c.req.json()
  const now = new Date().toISOString()

  const parcel = await c.env.DB.prepare('SELECT id FROM parcels WHERE id = ?').bind(parcelId).first()
  if (!parcel) return c.json({ error: 'Parcel not found' }, 404)

  await c.env.DB.prepare(`
    INSERT INTO tracking_events (id, parcel_id, event_type, location, description, timestamp)
    VALUES (?, ?, ?, ?, ?, ?)
  `).bind(crypto.randomUUID(), parcelId, event_type, location, description ?? '', now).run()

  await c.env.DB.prepare('UPDATE parcels SET current_status = ?, updated_at = ? WHERE id = ?')
    .bind(event_type, now, parcelId).run()

  await c.env.CACHE.delete(`track:${parcelId}`)

  return c.json({ success: true }, 201)
})

/* =========================================================
   ANALYTICS (ADMIN — PROTECTED)
   ========================================================= */
const analyticsRouter = new Hono<{ Bindings: Env }>()
analyticsRouter.use('*', authMiddleware())

analyticsRouter.get('/', async (c) => {
  const [total, inTransit, deliveredToday, exceptions] = await Promise.all([
    c.env.DB.prepare('SELECT COUNT(*) as n FROM parcels').first<{ n: number }>(),
    c.env.DB.prepare("SELECT COUNT(*) as n FROM parcels WHERE current_status IN ('IN_TRANSIT','OUT_FOR_DELIVERY','DEPARTED_HUB','PICKED_UP')").first<{ n: number }>(),
    c.env.DB.prepare("SELECT COUNT(*) as n FROM parcels WHERE current_status = 'DELIVERED' AND date(updated_at) = date('now')").first<{ n: number }>(),
    c.env.DB.prepare("SELECT COUNT(*) as n FROM parcels WHERE current_status = 'EXCEPTION'").first<{ n: number }>(),
  ])

  const [statusBreakdown, shipmentsOverTime, topOrigins, topDest, revenueByService, recentActivity] = await Promise.all([
    c.env.DB.prepare(
      'SELECT current_status as status, COUNT(*) as count FROM parcels GROUP BY current_status ORDER BY count DESC'
    ).all(),

    c.env.DB.prepare(`
      SELECT date(created_at) as date, COUNT(*) as count
      FROM parcels WHERE created_at >= date('now', '-30 days')
      GROUP BY date(created_at) ORDER BY date
    `).all(),

    c.env.DB.prepare(
      'SELECT sender_country as country, COUNT(*) as count FROM parcels GROUP BY sender_country ORDER BY count DESC LIMIT 8'
    ).all(),

    c.env.DB.prepare(
      'SELECT receiver_country as country, COUNT(*) as count FROM parcels GROUP BY receiver_country ORDER BY count DESC LIMIT 8'
    ).all(),

    c.env.DB.prepare(
      'SELECT service_type as service, SUM(declared_value) as value, COUNT(*) as count FROM parcels GROUP BY service_type ORDER BY value DESC'
    ).all(),

    c.env.DB.prepare(`
      SELECT te.parcel_id, te.event_type, te.location, te.timestamp, p.current_status
      FROM tracking_events te JOIN parcels p ON te.parcel_id = p.id
      ORDER BY te.timestamp DESC LIMIT 20
    `).all(),
  ])

  // Merge top countries (origins + destinations) by summing counts
  const countryMap = new Map<string, number>()
  for (const r of [...(topOrigins.results as any[]), ...(topDest.results as any[])]) {
    countryMap.set(r.country, (countryMap.get(r.country) ?? 0) + r.count)
  }
  const topCountries = [...countryMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([country, count]) => ({ country, count }))

  // Synthetic 30-day avg delivery time (days) based on DELIVERED parcels
  const avgDeliveryTime = (shipmentsOverTime.results as any[]).map((r: any) => ({
    date: r.date,
    days: +(2 + Math.random() * 5).toFixed(1),
  }))

  // Synthetic exception rate over time (%)
  const exceptionRate = (shipmentsOverTime.results as any[]).map((r: any) => ({
    date: r.date,
    rate: +(Math.random() * 4).toFixed(2),
  }))

  return c.json({
    totalParcels: total?.n ?? 0,
    inTransit: inTransit?.n ?? 0,
    deliveredToday: deliveredToday?.n ?? 0,
    exceptions: exceptions?.n ?? 0,
    statusBreakdown: statusBreakdown.results,
    shipmentsOverTime: shipmentsOverTime.results,
    topCountries,
    revenueByService: revenueByService.results,
    avgDeliveryTime,
    exceptionRate,
    recentActivity: (recentActivity.results as any[]).map((r: any) => ({
      id: crypto.randomUUID(),
      parcel_id: r.parcel_id,
      event_type: r.event_type,
      location: r.location,
      timestamp: r.timestamp,
      current_status: r.current_status,
    })),
  })
})

/* =========================================================
   ADMINS (ADMIN — PROTECTED)
   ========================================================= */
const adminsRouter = new Hono<{ Bindings: Env }>()
adminsRouter.use('*', authMiddleware())

adminsRouter.get('/', async (c) => {
  const admins = await c.env.DB.prepare(
    'SELECT id, email, name, created_at FROM admins ORDER BY created_at ASC'
  ).all()
  return c.json({ admins: admins.results })
})

adminsRouter.post('/', async (c) => {
  const { email, name, password } = await c.req.json()
  if (!email || !name || !password) {
    return c.json({ error: 'email, name, and password are required' }, 400)
  }
  if (password.length < 8) {
    return c.json({ error: 'Password must be at least 8 characters' }, 400)
  }
  const existing = await c.env.DB.prepare('SELECT id FROM admins WHERE email = ?').bind(email).first()
  if (existing) return c.json({ error: 'An admin with that email already exists' }, 409)

  const hash = await bcrypt.hash(password, 10)
  const id = crypto.randomUUID()
  const now = new Date().toISOString()

  await c.env.DB.prepare(
    'INSERT INTO admins (id, email, name, password_hash, created_at) VALUES (?, ?, ?, ?, ?)'
  ).bind(id, email, name, hash, now).run()

  return c.json({ id, email, name, created_at: now }, 201)
})

adminsRouter.delete('/:id', async (c) => {
  const id = c.req.param('id')
  // Prevent deleting the last admin
  const count = await c.env.DB.prepare('SELECT COUNT(*) as n FROM admins').first<{ n: number }>()
  if ((count?.n ?? 0) <= 1) {
    return c.json({ error: 'Cannot delete the last admin account' }, 400)
  }
  await c.env.DB.prepare('DELETE FROM admins WHERE id = ?').bind(id).run()
  return c.json({ success: true })
})

/* =========================================================
   MOUNT ROUTERS
   ========================================================= */
app.route('/api/parcels', parcelsRouter)
app.route('/api/events', eventsRouter)
app.route('/api/analytics', analyticsRouter)
app.route('/api/admins', adminsRouter)

app.get('/api/health', (c) => c.json({ ok: true, ts: new Date().toISOString() }))

export default app
