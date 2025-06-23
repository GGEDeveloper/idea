// User entity types
export interface User {
  user_id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  company_name?: string;
  clerk_id?: string;
  created_at: Date;
  updated_at: Date;
  role_name: string;
  role_id: string;
}

// User for authentication (includes password_hash)
export interface UserAuth extends Omit<User, 'role_id'> {
  password_hash: string;
  permissions: string[];
}

// User for session (no password_hash, includes permissions)
export interface UserSession extends Omit<User, 'role_id'> {
  permissions: string[];
}

// User creation data
export interface CreateUserData {
  email: string;
  first_name?: string;
  last_name?: string;
  company_name?: string;
  role_id: string;
  password: string;
  clerk_id?: string;
}

// User update data
export interface UpdateUserData {
  email?: string;
  first_name?: string;
  last_name?: string;
  company_name?: string;
  role_id?: string;
}

// User search filters
export interface UserFilters {
  search?: string;
  role?: string;
}

// Pagination options
export interface PaginationOptions {
  page?: number;
  limit?: number;
}

// User list response
export interface UserListResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
} 