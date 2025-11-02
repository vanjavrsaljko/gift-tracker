export interface User {
  _id: string;
  name: string;
  email: string;
  token: string;
}

export interface Contact {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  notes?: string;
  interests: string[];
  giftIdeas: GiftIdea[];
}

export interface GiftIdea {
  _id: string;
  name: string;
  notes: string;
  purchased: boolean;
}

export interface WishlistItem {
  _id: string;
  name: string;
  description?: string;
  link?: string;
  price?: number;
  reserved: boolean;
  reservedBy?: string;
}

export interface Wishlist {
  _id: string;
  name: string;
  description?: string;
  visibility: 'public' | 'private';
  items: WishlistItem[];
  createdAt?: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

export interface PublicWishlist {
  userName: string;
  wishlists: {
    _id: string;
    name: string;
    description?: string;
    items: WishlistItem[];
  }[];
}
