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
  linkedUserId?: string;
  linkedAt?: string;
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
  bought: boolean;
}

export interface Wishlist {
  _id: string;
  name: string;
  description?: string;
  visibility: 'public' | 'private';
  sharedWith?: string[];
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
    visibility: 'public' | 'private';
    isShared?: boolean;
    items: WishlistItem[];
  }[];
}

// Friend types
export interface Friend {
  _id: string;
  friendId: string;
  name: string;
  email: string;
  groups: string[];
  acceptedAt: Date;
}

export interface FriendRequest {
  _id: string;
  requestedBy: {
    _id: string;
    name: string;
    email: string;
  };
  requestedAt: Date;
}

export interface UserSearchResult {
  _id: string;
  name: string;
  email: string;
  friendshipStatus: 'pending' | 'accepted' | 'declined' | null;
  friendshipId: string | null;
}

// Contact-Friend linking types
export interface LinkSuggestion {
  contact: Contact;
  friend: Friend;
  matchReason: 'email' | 'manual';
}

export interface ContactData {
  interests: string[];
  giftIdeas: GiftIdea[];
}
