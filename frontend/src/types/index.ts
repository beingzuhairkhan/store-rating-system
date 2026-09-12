export type Role = 'ADMIN' | 'USER' | 'STORE_OWNER';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: Role;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

export interface Store {
  id: string;
  name: string;
  email: string;
  address: string;
  averageRating: number | null;
  userRating?: number | null;
  ratingCount?: number;
  ownerId?: string;
  ownerName?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  address: string;
  role: Role;
}

export interface Rating {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  storeId: string;
  storeName?: string;
  rating: number;
  updatedAt?: string;
  createdAt?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

export interface DashboardStats {
  totalUsers: number;
  totalStores: number;
  totalRatings: number;
}

export interface OwnerDashboard {
  storeName: string;
  averageRating: number | null;
  totalRatings: number;
  ratings: Rating[];
}

export interface OwnerStore {
  id: string;
  name: string;
  email: string;
  address: string;
  averageRating: number | null;
  totalRatings: number;
}
