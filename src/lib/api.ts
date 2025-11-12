const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || '/api'

function getToken(): string | null {
  try {
    const raw = localStorage.getItem('auth.token')
    return raw || null
  } catch {
    return null
  }
}

function withAuthHeaders(headers: Record<string, string> = {}) {
  const token = getToken()
  if (token) {
    return { ...headers, Authorization: `Bearer ${token}` }
  }
  return headers
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {}
  // Only set Content-Type when we actually send a body
  if (init && 'body' in init && init.body != null) {
    headers['Content-Type'] = 'application/json'
  }
  const mergedHeaders = withAuthHeaders({ ...headers, ...(init?.headers as any) })
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: mergedHeaders,
  })
  if (!res.ok) {
    try {
      const body = await res.json()
      const msg = body?.message || body?.error || res.statusText || `Request failed: ${res.status}`
      throw new Error(msg)
    } catch {
      throw new Error(`Request failed: ${res.status}`)
    }
  }
  const body = await res.json()
  // Backend returns { success, data, message, pagination }
  return body.data as T
}

async function requestFull<T>(path: string, init?: RequestInit): Promise<{ data: T; pagination?: any; message?: string; success?: boolean }> {
  const headers: Record<string, string> = {}
  if (init && 'body' in init && init.body != null) {
    headers['Content-Type'] = 'application/json'
  }
  const mergedHeaders = withAuthHeaders({ ...headers, ...(init?.headers as any) })
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: mergedHeaders,
  })
  if (!res.ok) {
    try {
      const body = await res.json()
      const msg = body?.message || body?.error || res.statusText || `Request failed: ${res.status}`
      throw new Error(msg)
    } catch {
      throw new Error(`Request failed: ${res.status}`)
    }
  }
  const body = await res.json()
  return body as { data: T; pagination?: any; message?: string; success?: boolean }
}

// Public (no-auth) requests to avoid preflight for simple GETs
async function requestPublic<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    // Accept is a simple header; omit Content-Type for GET
    headers: { Accept: 'application/json', ...(init?.headers as any) },
    method: init?.method || 'GET',
    ...init,
  })
  if (!res.ok) throw new Error(`Request failed: ${res.status}`)
  const body = await res.json()
  return body.data as T
}

async function requestPublicFull<T>(path: string, init?: RequestInit): Promise<{ data: T; pagination?: any; message?: string; success?: boolean }> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { Accept: 'application/json', ...(init?.headers as any) },
    method: init?.method || 'GET',
    ...init,
  })
  if (!res.ok) throw new Error(`Request failed: ${res.status}`)
  const body = await res.json()
  return body as { data: T; pagination?: any; message?: string; success?: boolean }
}

export interface ApiArtwork {
  id: string
  title: string
  description?: string
  imageUrl: string
  additionalImages?: string
  type: string
  price: number
  stock: number
  width?: number
  height?: number
  depth?: number
  unit?: string
  materials?: string
  year?: number
  status: 'available' | 'sold' | 'reserved' | 'hidden'
  isActive: boolean
  isFeatured: boolean
  viewCount: number
  rating: number
  reviewCount: number
  createdAt: string
  updatedAt: string
  category?: { id: string; name: string }
  artist?: { id: string; name: string }
}

export interface ApiArtist {
  id: string
  name: string
  bio?: string
  avatar?: string
  studio?: string
  location?: string
  specialties?: string
  yearsOfExperience?: number
  education?: string
  awards?: string
  status: 'active' | 'inactive' | 'pending'
  isActive: boolean
  totalArtworks: number
  totalSales: number
  createdAt: string
  updatedAt: string
  artworks?: ApiArtwork[]
}

export interface ApiCategory {
  id: string
  name: string
  slug: string
  description?: string
  imageUrl?: string
  sortOrder: number
  isActive: boolean
  createdAt: string
  updatedAt: string
  // Optional relation count mapped from backend
  artworkCount?: number
}

export interface ApiUser {
  id: string
  name: string
  email: string
  phone?: string
  location?: string
  role: string
  status: string
  isActive?: boolean
  createdAt: string
}

export interface ApiReview {
  id: string
  artworkId: string
  userId: string
  rating: number
  comment: string
  createdAt: string
  user?: { id: string; name: string; avatar?: string }
}

export interface ApiOrderItemInput { artworkId: string; quantity?: number }

export interface ApiOrder {
  id: string
  orderNumber: string
  userId: string
  items: Array<{ id: string; artwork: ApiArtwork; quantity: number; price: number; subtotal: number }>
  totalAmount: number
  status: string
  paymentStatus: string
  paymentMethod?: string
  createdAt: string
  updatedAt: string
}

// Fetchers
export const api = {
  featuredArtworks: (limit = 6) => requestPublic<ApiArtwork[]>(`/artworks/featured?limit=${limit}`),
  artworksByArtist: (artistId: string, limit = 30) => request<ApiArtwork[]>(`/artworks/artist/${artistId}?limit=${limit}`),
  featuredArtists: (limit = 6) => requestPublic<ApiArtist[]>(`/artists/featured?limit=${limit}`),
  artists: (params?: { page?: number; limit?: number; status?: string; search?: string }) => {
    const ps = new URLSearchParams()
    if (params?.page) ps.set('page', String(params.page))
    if (params?.limit) ps.set('limit', String(params.limit))
    if (params?.status) ps.set('status', params.status)
    if (params?.search) ps.set('search', params.search)
    const qs = ps.toString() ? `?${ps.toString()}` : ''
    return requestPublic<ApiArtist[]>(`/artists${qs}`)
  },
  artistById: (id: string) => request<ApiArtist>(`/artists/${id}`),
  categories: (limit = 8) => requestPublic<ApiCategory[]>(`/categories?limit=${limit}`),

  // Artworks list with filters and pagination
  artworks: (params?: { page?: number; limit?: number; category?: string; artist?: string; status?: string; type?: string; minPrice?: number; maxPrice?: number; sortBy?: string; sortOrder?: 'ASC' | 'DESC'; search?: string }) => {
    const ps = new URLSearchParams()
    if (params?.page) ps.set('page', String(params.page))
    if (params?.limit) ps.set('limit', String(params.limit))
    if (params?.category) ps.set('category', params.category)
    if (params?.artist) ps.set('artist', params.artist)
    if (params?.status) ps.set('status', params.status)
    if (params?.type) ps.set('type', params.type)
    if (params?.minPrice != null) ps.set('minPrice', String(params.minPrice))
    if (params?.maxPrice != null) ps.set('maxPrice', String(params.maxPrice))
    if (params?.sortBy) ps.set('sortBy', params.sortBy)
    if (params?.sortOrder) ps.set('sortOrder', params.sortOrder)
    if (params?.search) ps.set('search', params.search)
    const qs = ps.toString() ? `?${ps.toString()}` : ''
    return requestFull<ApiArtwork[]>(`/artworks${qs}`)
  },
  artworkById: (id: string) => request<ApiArtwork & { reviews?: ApiReview[]; isFavorited?: boolean }>(`/artworks/${id}`),
  artworkReviews: (id: string, params?: { page?: number; limit?: number }) => {
    const ps = new URLSearchParams()
    if (params?.page) ps.set('page', String(params.page))
    if (params?.limit) ps.set('limit', String(params.limit))
    const qs = ps.toString() ? `?${ps.toString()}` : ''
    return requestFull<ApiReview[]>(`/artworks/${id}/reviews${qs}`)
  },
  createReview: (id: string, payload: { rating: number; comment: string }) => request<ApiReview>(`/artworks/${id}/reviews`, {
    method: 'POST',
    body: JSON.stringify(payload)
  }),

  // Auth
  register: (payload: { name: string; email: string; password: string; phone?: string; location?: string; role?: string }) => request<{ user: ApiUser; token: string; refreshToken: string }>(`/users/register`, {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  login: (email: string, password: string) => request<{ user: ApiUser; token: string; refreshToken: string }>(`/users/login`, {
    method: 'POST',
    body: JSON.stringify({ email, password })
  }),
  refreshToken: (refreshToken: string) => request<{ token: string; refreshToken: string }>(`/users/refresh-token`, {
    method: 'POST',
    body: JSON.stringify({ refreshToken })
  }),
  profile: () => request<ApiUser>(`/users/profile`),

  // Admin - Users
  adminUsers: (params?: { page?: number; limit?: number; role?: string; status?: string; search?: string }) => {
    const ps = new URLSearchParams()
    if (params?.page) ps.set('page', String(params.page))
    if (params?.limit) ps.set('limit', String(params.limit))
    if (params?.role) ps.set('role', params.role)
    if (params?.status) ps.set('status', params.status)
    if (params?.search) ps.set('search', params.search)
    const qs = ps.toString() ? `?${ps.toString()}` : ''
    return requestFull<ApiUser[]>(`/users${qs}`)
  },
  adminUpdateUserStatus: (id: string, payload: { status?: 'active' | 'inactive' | 'pending'; isActive?: boolean }) => request<{ id: string; status: string; isActive: boolean }>(`/users/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  }),
  adminDeleteUser: (id: string) => request<null>(`/users/${id}`, { method: 'DELETE' }),

  // Admin - Categories
  adminCategories: () => request<ApiCategory[]>('/categories'),
  createCategory: (payload: {
    name: string
    slug: string
    description?: string
    imageUrl?: string
    sortOrder?: number
    isActive?: boolean
  }) => request<ApiCategory>('/categories', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  updateCategory: (id: string, payload: {
    name?: string
    slug?: string
    description?: string
    imageUrl?: string
    sortOrder?: number
    isActive?: boolean
  }) => request<ApiCategory>(`/categories/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }),
  deleteCategory: (id: string) => request<null>(`/categories/${id}`, { method: 'DELETE' }),

  // Admin - Artworks
  adminArtworks: (params?: { page?: number; limit?: number; category?: string; artist?: string; status?: 'available' | 'reserved' | 'sold' | 'hidden'; type?: string; minPrice?: number; maxPrice?: number; sortBy?: string; sortOrder?: 'ASC' | 'DESC'; search?: string }) => {
    // Alias to artworks but kept for clarity
    return api.artworks(params)
  },
  adminUpdateArtworkStatus: (id: string, status: 'available' | 'reserved' | 'sold' | 'hidden') => request<ApiArtwork>(`/artworks/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  }),
  adminDeleteArtwork: (id: string) => request<null>(`/artworks/${id}`, { method: 'DELETE' }),

  adminArtists: (params?: { page?: number; limit?: number; status?: 'active' | 'inactive' | 'pending'; search?: string }) => {
    const ps = new URLSearchParams()
    if (params?.page) ps.set('page', String(params.page))
    if (params?.limit) ps.set('limit', String(params.limit))
    if (params?.status) ps.set('status', params.status)
    if (params?.search) ps.set('search', params.search)
    const qs = ps.toString() ? `?${ps.toString()}` : ''
    return requestFull<ApiArtist[]>(`/artists${qs}`)
  },
  createArtist: (payload: {
    name: string
    bio?: string
    avatar?: string
    studio?: string
    location?: string
    specialties?: string
    yearsOfExperience?: number
    education?: string
    awards?: string
    status?: 'active' | 'inactive' | 'pending'
    isActive?: boolean
    userId?: string
  }) => request<ApiArtist>('/artists', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  updateArtist: (id: string, payload: {
    name?: string
    bio?: string
    avatar?: string
    studio?: string
    location?: string
    specialties?: string
    yearsOfExperience?: number
    education?: string
    awards?: string
    status?: 'active' | 'inactive' | 'pending'
    isActive?: boolean
    userId?: string
  }) => request<ApiArtist>(`/artists/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  }),
  deleteArtist: (id: string) => request<null>(`/artists/${id}`, { method: 'DELETE' }),
  updateArtistStatus: (id: string, status: 'active' | 'inactive' | 'pending') => request<ApiArtist>(`/artists/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  }),

  // Uploads
  uploadImage: async (file: File): Promise<{ url: string; filename: string }> => {
    const form = new FormData()
    form.append('image', file)
    const res = await fetch(`${API_BASE}/uploads/image`, {
      method: 'POST',
      headers: withAuthHeaders(),
      body: form,
    })
    if (!res.ok) throw new Error(`Upload failed: ${res.status}`)
    const body = await res.json()
    return body.data
  },
  uploadImages: async (files: File[]): Promise<Array<{ url: string; filename: string }>> => {
    const form = new FormData()
    files.forEach(f => form.append('images', f))
    const res = await fetch(`${API_BASE}/uploads/images`, {
      method: 'POST',
      headers: withAuthHeaders(),
      body: form,
    })
    if (!res.ok) throw new Error(`Upload failed: ${res.status}`)
    const body = await res.json()
    return body.data.files
  },

  // Create artwork (admin/artist)
  createArtwork: (payload: {
    title: string
    description?: string
    imageUrl: string
    additionalImages?: string
    type?: string
    price: number | string
    stock: number | string
    width?: number
    height?: number
    depth?: number
    unit?: string
    materials?: string
    year?: number
    categoryId?: string
    artistId?: string
  }) => request<ApiArtwork>(`/artworks`, {
    method: 'POST',
    body: JSON.stringify({
      ...payload,
      // Avoid sending empty strings for optional FKs
      categoryId: payload.categoryId ? String(payload.categoryId) : undefined,
      artistId: payload.artistId ? String(payload.artistId) : undefined,
      price: Number(payload.price),
      stock: Number(payload.stock),
    })
  }),

  // Orders
  createOrder: (items: ApiOrderItemInput[], notes?: string) => request<ApiOrder>(`/orders`, {
    method: 'POST',
    body: JSON.stringify({ items, notes })
  }),
}

// Mappers to frontend types
import type { Artwork, Artist, Category, User, Review, Order } from '@/types'

export function mapArtwork(a: ApiArtwork): Artwork {
  function parseAdditionalImages(input?: string): string[] {
    if (!input) return []
    // Try JSON array first
    try {
      const arr = JSON.parse(input)
      if (Array.isArray(arr)) return arr.filter((u) => typeof u === 'string' && u)
    } catch {}
    // Fallback: comma-separated string
    return String(input)
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
  }

  const images = Array.from(
    new Set([a.imageUrl, ...parseAdditionalImages(a.additionalImages)].filter(Boolean))
  )

  return {
    id: a.id,
    title: a.title,
    artistId: a.artist?.id || '',
    artistName: a.artist?.name || '',
    category: a.category?.name || '',
    price: Number(a.price || 0),
    year: a.year || new Date(a.createdAt).getFullYear(),
    dimensions: { width: Number(a.width || 0), height: Number(a.height || 0), depth: a.depth ? Number(a.depth) : undefined },
    material: a.materials || '',
    description: a.description || '',
    images,
    status: (a.status === 'hidden' ? 'available' : a.status) as Artwork['status'],
    createdAt: new Date(a.createdAt).toISOString(),
    updatedAt: new Date(a.updatedAt).toISOString(),
  }
}

export function mapArtist(ar: ApiArtist): Artist {
  return {
    id: ar.id,
    name: ar.name,
    bio: ar.bio || '',
    avatar: ar.avatar || '',
    specialty: ar.specialties || '',
    location: ar.location || '',
    email: '',
    phone: '',
    website: '',
    socialLinks: {},
    artworks: (ar.artworks?.map(a => a.id) || Array.from({ length: Math.max(0, ar.totalArtworks || 0) }).map(() => '')),
    verified: ar.status === 'active',
    createdAt: new Date(ar.createdAt).toISOString(),
  }
}

export function mapCategory(c: ApiCategory): Category {
  return {
    id: c.id,
    name: c.name,
    description: c.description || '',
    image: c.imageUrl || '',
    count: typeof c.artworkCount === 'number' ? c.artworkCount : 0,
  }
}

export function mapUser(u: ApiUser): User {
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    avatar: '',
    phone: u.phone || '',
    address: undefined,
    role: u.role === 'artist' ? 'artist' : u.role === 'admin' ? 'admin' : 'user',
    status: (u.status as any) || undefined,
    isActive: typeof u.isActive === 'boolean' ? u.isActive : undefined,
    favorites: [],
    createdAt: new Date(u.createdAt).toISOString(),
  }
}

export function mapReview(r: ApiReview): Review {
  return {
    id: r.id,
    artworkId: r.artworkId,
    userId: r.userId,
    userName: r.user?.name || '',
    rating: r.rating,
    comment: r.comment,
    createdAt: new Date(r.createdAt).toISOString(),
  }
}

export function mapOrder(o: ApiOrder): Order {
  const firstItem = o.items?.[0]
  return {
    id: o.id,
    userId: o.userId,
    artworkId: firstItem?.artwork?.id || '',
    artworkTitle: firstItem?.artwork?.title || '',
    artistId: firstItem?.artwork?.artist?.id || '',
    price: Number(firstItem?.price || o.totalAmount || 0),
    status: (o.status as Order['status']) || 'pending',
    shippingAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
    },
    paymentMethod: o.paymentMethod || 'card',
    paymentStatus: (o.paymentStatus as Order['paymentStatus']) || 'pending',
    createdAt: new Date(o.createdAt).toISOString(),
    updatedAt: new Date(o.updatedAt).toISOString(),
  }
}
