export interface Artwork {
  id: string;
  title: string;
  artistId: string;
  artistName: string;
  category: string;
  price: number;
  year: number;
  dimensions: {
    width: number;
    height: number;
    depth?: number;
  };
  material: string;
  description: string;
  images: string[];
  status: 'available' | 'reserved' | 'sold';
  createdAt: string;
  updatedAt: string;
}

export interface Artist {
  id: string;
  name: string;
  bio: string;
  avatar: string;
  // 补充可选字段以匹配前端使用与后端映射
  specialty?: string;
  location?: string;
  email: string;
  phone: string;
  website?: string;
  socialLinks?: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
  };
  artworks: string[];
  verified: boolean;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  phone?: string;
  address?: Address;
  role: 'user' | 'artist' | 'admin';
  status?: 'active' | 'inactive' | 'pending';
  isActive?: boolean;
  favorites: string[];
  createdAt: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface Order {
  id: string;
  userId: string;
  artworkId: string;
  artworkTitle: string;
  artistId: string;
  price: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: Address;
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'failed';
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
  count: number;
}

export interface CartItem {
  artwork: Artwork;
  quantity: number;
}

export interface Review {
  id: string;
  artworkId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}