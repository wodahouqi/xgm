import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Artwork, User, CartItem, Order } from '@/types'

interface AppState {
  // 用户相关
  currentUser: User | null
  isAuthenticated: boolean
  
  // 艺术品相关
  artworks: Artwork[]
  featuredArtworks: Artwork[]
  
  // 购物车
  cart: CartItem[]
  
  // 订单
  orders: Order[]
  
  // 加载状态
  loading: boolean
  
  // 方法
  setCurrentUser: (user: User | null) => void
  setArtworks: (artworks: Artwork[]) => void
  setFeaturedArtworks: (artworks: Artwork[]) => void
  addToCart: (artwork: Artwork) => void
  removeFromCart: (artworkId: string) => void
  clearCart: () => void
  addOrder: (order: Order) => void
  setLoading: (loading: boolean) => void
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      currentUser: null,
      isAuthenticated: false,
      artworks: [],
      featuredArtworks: [],
      cart: [],
      orders: [],
      loading: false,
      
      setCurrentUser: (user) => set({ currentUser: user, isAuthenticated: !!user }),
      setArtworks: (artworks) => set({ artworks }),
      setFeaturedArtworks: (artworks) => set({ featuredArtworks: artworks }),
      
      addToCart: (artwork) => set((state) => {
        const existingItem = state.cart.find(item => item.artwork.id === artwork.id)
        if (existingItem) {
          return {
            cart: state.cart.map(item =>
              item.artwork.id === artwork.id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            )
          }
        }
        return { cart: [...state.cart, { artwork, quantity: 1 }] }
      }),
      
      removeFromCart: (artworkId) => set((state) => ({
        cart: state.cart.filter(item => item.artwork.id !== artworkId)
      })),
      
      clearCart: () => set({ cart: [] }),
      
      addOrder: (order) => set((state) => ({
        orders: [...state.orders, order]
      })),
      
      setLoading: (loading) => set({ loading })
    }),
    {
      name: 'artwork-booking-store'
    }
  )
)