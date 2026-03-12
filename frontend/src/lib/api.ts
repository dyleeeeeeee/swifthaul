const API_BASE = (import.meta as ImportMeta & { env: Record<string, string> }).env?.VITE_API_BASE ?? 'https://api.swifthaul.workers.dev/api'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('sh_token')
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Request failed' }))
    throw new Error((err as { message?: string }).message || 'Request failed')
  }
  return res.json()
}

export const api = {
  track: (id: string) => request<TrackingResult>(`/track/${id}`),
  adminLogin: (email: string, password: string) =>
    request<{ token: string; admin: { id: string; email: string; name: string } }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  getParcels: (params?: string) =>
    request<ParcelsResponse>(`/parcels${params ? `?${params}` : ''}`),
  createParcel: (data: CreateParcelInput) =>
    request<{ id: string; status: string }>('/parcels', { method: 'POST', body: JSON.stringify(data) }),
  updateParcel: (id: string, data: Partial<Parcel>) =>
    request<{ success: boolean }>(`/parcels/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteParcel: (id: string) =>
    request<{ success: boolean }>(`/parcels/${id}`, { method: 'DELETE' }),
  addTrackingEvent: (parcelId: string, data: TrackingEventInput) =>
    request<{ success: boolean }>(`/events/${parcelId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getAnalytics: () => request<Analytics>('/analytics'),
  getAdmins: () => request<{ admins: AdminUser[] }>('/admins'),
  createAdmin: (data: { email: string; name: string; password: string }) =>
    request<AdminUser>('/admins', { method: 'POST', body: JSON.stringify(data) }),
  deleteAdmin: (id: string) =>
    request<{ success: boolean }>(`/admins/${id}`, { method: 'DELETE' }),
}

export interface Parcel {
  id: string
  sender_name: string
  sender_address: string
  sender_country: string
  receiver_name: string
  receiver_address: string
  receiver_country: string
  weight_kg: number
  dimensions: string
  service_type: string
  declared_value: number
  current_status: string
  eta: string
  created_at: string
  updated_at: string
}

export interface TrackingEvent {
  id: number
  parcel_id: string
  event_type: string
  location: string
  description: string
  timestamp: string
}

export interface TrackingResult {
  parcel: Parcel
  events: TrackingEvent[]
}

export interface ParcelsResponse {
  parcels: Parcel[]
  total: number
  page: number
  pageSize: number
}

export interface CreateParcelInput {
  sender_name: string
  sender_address: string
  sender_country: string
  receiver_name: string
  receiver_address: string
  receiver_country: string
  weight_kg: number
  dimensions: string
  service_type: string
  declared_value: number
  eta?: string
}

export interface AdminUser {
  id: string
  email: string
  name: string
  created_at: string
}

export interface TrackingEventInput {
  event_type: string
  location: string
  description: string
  timestamp?: string
}

export interface Analytics {
  totalParcels: number
  inTransit: number
  deliveredToday: number
  exceptions: number
  shipmentsOverTime: Array<{ date: string; count: number }>
  statusBreakdown: Array<{ status: string; count: number }>
  topCountries: Array<{ country: string; count: number }>
  avgDeliveryTime: Array<{ date: string; days: number }>
  exceptionRate: Array<{ date: string; rate: number }>
  revenueByService: Array<{ service: string; value: number }>
  recentActivity: Array<{
    id: string
    parcel_id: string
    event_type: string
    location: string
    timestamp: string
    current_status: string
  }>
}
