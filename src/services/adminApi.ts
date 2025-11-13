import {
  safeJsonParse,
  isSuccessfulResponse,
  extractResult,
  extractMessage,
  retryRequest,
  fetchWithAutoRefresh,
} from '@/utils/apiHelpers';

export interface CreateUserRequest {
  email: string;
  username?: string;
  fullName?: string;
  phone?: string;
  role: number; // 0 = Student, 1 = Teacher, 2 = Admin
  password?: string;
  sendEmail?: boolean;
}

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  fullName?: string;
  phone?: string;
  role: number;
  roleName?: string;
  isActive: boolean;
  emailVerified: boolean;
  authProvider?: string;
  createdAt: string;
  updatedAt?: string;
}

class AdminApiService {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

  private getAuthHeaders() {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    if (!token) return {} as HeadersInit;
    return { 'Authorization': `Bearer ${token}` } as HeadersInit;
  }

  async createUser(request: CreateUserRequest): Promise<AdminUser> {
    const response = await retryRequest(async () =>
      fetchWithAutoRefresh(`${this.baseUrl}/api/admin/users/create`, {
        method: 'POST',
        headers: { ...this.getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      })
    );

    const parsed = await safeJsonParse(response);
    if (!isSuccessfulResponse(parsed)) throw new Error(extractMessage(parsed));
    const result = extractResult(parsed);
    return this.mapUser(result);
  }

  private mapUser(user: any): AdminUser {
    return {
      id: user.Id || user.id,
      username: user.Username || user.username,
      email: user.Email || user.email,
      fullName: user.FullName || user.fullName,
      phone: user.Phone || user.phone,
      role: user.Role || user.role || 0,
      roleName: user.RoleName || user.roleName,
      isActive: user.IsActive ?? user.isActive ?? true,
      emailVerified: user.EmailVerified ?? user.emailVerified ?? false,
      authProvider: user.AuthProvider || user.authProvider,
      createdAt: user.CreatedAt || user.createdAt,
      updatedAt: user.UpdatedAt || user.updatedAt,
    };
  }
}

export const adminApi = new AdminApiService();

