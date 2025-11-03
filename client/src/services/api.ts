import axios from 'axios';
import { User, Contact, Wishlist, WishlistItem, PublicWishlist, Friend, FriendRequest, UserSearchResult } from '../types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  register: async (name: string, email: string, password: string): Promise<User> => {
    const { data } = await api.post('/users', { name, email, password });
    return data;
  },

  login: async (email: string, password: string): Promise<User> => {
    const { data } = await api.post('/users/login', { email, password });
    return data;
  },

  getProfile: async (): Promise<User> => {
    const { data } = await api.get('/users/profile');
    return data;
  },

  updateProfile: async (updates: Partial<User>): Promise<User> => {
    const { data } = await api.put('/users/profile', updates);
    return data;
  },
};

// Contacts API
export const contactsAPI = {
  getAll: async (): Promise<Contact[]> => {
    const { data } = await api.get('/contacts');
    return data;
  },

  getById: async (id: string): Promise<Contact> => {
    const { data } = await api.get(`/contacts/${id}`);
    return data;
  },

  create: async (contact: Partial<Contact>): Promise<Contact> => {
    const { data } = await api.post('/contacts', contact);
    return data;
  },

  update: async (id: string, contact: Partial<Contact>): Promise<Contact> => {
    const { data } = await api.put(`/contacts/${id}`, contact);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/contacts/${id}`);
  },

  addGiftIdea: async (contactId: string, giftIdea: { name: string; notes: string }) => {
    const { data } = await api.post(`/contacts/${contactId}/gift-ideas`, giftIdea);
    return data;
  },

  updateGiftIdea: async (contactId: string, giftIdeaId: string, giftIdea: { name: string; notes: string }) => {
    const { data} = await api.put(`/contacts/${contactId}/gift-ideas/${giftIdeaId}/update`, giftIdea);
    return data;
  },

  deleteGiftIdea: async (contactId: string, giftIdeaId: string) => {
    const { data } = await api.delete(`/contacts/${contactId}/gift-ideas/${giftIdeaId}`);
    return data;
  },

  toggleGiftIdeaPurchased: async (contactId: string, giftIdeaId: string) => {
    const { data } = await api.put(`/contacts/${contactId}/gift-ideas/${giftIdeaId}`);
    return data;
  },
};

// Wishlist API
export const wishlistAPI = {
  // Wishlist CRUD
  getAllWishlists: async (): Promise<Wishlist[]> => {
    const { data } = await api.get('/wishlists');
    return data;
  },

  createWishlist: async (wishlist: { name: string; description?: string; visibility?: 'public' | 'private' }): Promise<Wishlist> => {
    const { data } = await api.post('/wishlists', wishlist);
    return data;
  },

  updateWishlist: async (id: string, wishlist: { name?: string; description?: string; visibility?: 'public' | 'private' }): Promise<Wishlist> => {
    const { data } = await api.put(`/wishlists/${id}`, wishlist);
    return data;
  },

  deleteWishlist: async (id: string): Promise<void> => {
    await api.delete(`/wishlists/${id}`);
  },

  // Wishlist Items CRUD
  getWishlistItems: async (wishlistId: string): Promise<WishlistItem[]> => {
    const { data } = await api.get(`/wishlists/${wishlistId}/items`);
    return data;
  },

  createItem: async (wishlistId: string, item: Partial<WishlistItem>): Promise<WishlistItem> => {
    const { data } = await api.post(`/wishlists/${wishlistId}/items`, item);
    return data;
  },

  updateItem: async (wishlistId: string, itemId: string, item: Partial<WishlistItem>): Promise<WishlistItem> => {
    const { data } = await api.put(`/wishlists/${wishlistId}/items/${itemId}`, item);
    return data;
  },

  deleteItem: async (wishlistId: string, itemId: string): Promise<void> => {
    await api.delete(`/wishlists/${wishlistId}/items/${itemId}`);
  },

  // Public and Reserve
  getPublic: async (userId: string): Promise<PublicWishlist> => {
    const { data } = await api.get(`/wishlists/public/${userId}`);
    return data;
  },

  reserve: async (wishlistId: string, itemId: string, userId?: string): Promise<void> => {
    await api.put(`/wishlists/${wishlistId}/items/${itemId}/reserve`, { userId });
  },

  // Wishlist sharing
  share: async (wishlistId: string, friendIds: string[]): Promise<{ message: string; sharedWith: string[] }> => {
    const { data } = await api.post(`/wishlists/${wishlistId}/share`, { friendIds });
    return data;
  },

  unshare: async (wishlistId: string, friendId: string): Promise<{ message: string; sharedWith: string[] }> => {
    const { data } = await api.delete(`/wishlists/${wishlistId}/share/${friendId}`);
    return data;
  },

  getSharedWith: async (wishlistId: string): Promise<{ _id: string; name: string; email: string }[]> => {
    const { data } = await api.get(`/wishlists/${wishlistId}/shared`);
    return data;
  },
};

// Friend API
export const friendAPI = {
  // Get all friends
  getAll: async (): Promise<Friend[]> => {
    const { data } = await api.get('/friends');
    return data;
  },

  // Get pending friend requests
  getRequests: async (): Promise<FriendRequest[]> => {
    const { data } = await api.get('/friends/requests');
    return data;
  },

  // Send friend request
  sendRequest: async (email: string): Promise<{ message: string; request: any }> => {
    const { data } = await api.post('/friends/request', { email });
    return data;
  },

  // Accept friend request
  accept: async (requestId: string): Promise<{ message: string; friendship: any }> => {
    const { data } = await api.put(`/friends/${requestId}/accept`);
    return data;
  },

  // Decline friend request
  decline: async (requestId: string): Promise<{ message: string }> => {
    const { data } = await api.put(`/friends/${requestId}/decline`);
    return data;
  },

  // Remove friend
  remove: async (friendshipId: string): Promise<{ message: string }> => {
    const { data } = await api.delete(`/friends/${friendshipId}`);
    return data;
  },

  // Search users
  search: async (query: string): Promise<UserSearchResult[]> => {
    const { data } = await api.get(`/friends/search?q=${encodeURIComponent(query)}`);
    return data;
  },

  // Add friend to groups
  addToGroups: async (friendshipId: string, groups: string[]): Promise<{ message: string; groups: string[] }> => {
    const { data } = await api.post(`/friends/${friendshipId}/groups`, { groups });
    return data;
  },

  // Remove friend from group
  removeFromGroup: async (friendshipId: string, groupName: string): Promise<{ message: string; groups: string[] }> => {
    const { data } = await api.delete(`/friends/${friendshipId}/groups/${groupName}`);
    return data;
  },
};

export default api;
