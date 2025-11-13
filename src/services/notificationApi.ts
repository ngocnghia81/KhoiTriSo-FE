import { safeJsonParse, isSuccessfulResponse, extractResult, extractMessage, retryRequest, throttleRequest, fetchWithAutoRefresh } from '@/utils/apiHelpers';

export interface NotificationItem {
  id: number;
  userId: number;
  title: string;
  content?: string;
  type?: number;
  priority?: number;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationPagedResponse {
  data: NotificationItem[];
  total: number;
  unreadCount: number;
  page: number;
  pageSize: number;
}

class NotificationApiService {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

  private getAuthHeaders() {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    if (!token) return {} as HeadersInit;
    return { 'Authorization': `Bearer ${token}` } as HeadersInit;
  }

  async getUserNotifications(params: { isRead?: boolean; type?: number; priority?: number; page?: number; pageSize?: number } = {}): Promise<NotificationPagedResponse> {
    const urlParams = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) urlParams.append(k, String(v));
    });
    const url = `${this.baseUrl}/api/Notifications${urlParams.toString() ? `?${urlParams.toString()}` : ''}`;

    const response = await throttleRequest(`notifications-${JSON.stringify(params)}`, async () => {
      return await retryRequest(async () => fetchWithAutoRefresh(url, { 
        method: 'GET',
        headers: { 'Content-Type': 'application/json', ...this.getAuthHeaders() } 
      }));
    });

    const parsed = await safeJsonParse(response);
    if (!isSuccessfulResponse(parsed)) throw new Error(extractMessage(parsed));
    const extracted = extractResult(parsed) || {};

    // Handle common shapes:
    // 1) { Data: [...], Total, UnreadCount, Page, PageSize }
    // 2) { data: [...], total, unreadCount, page, pageSize }
    // 3) { Items: [...], ... } or nested data blocks
    let items: any[] = [];
    let total = 0;
    let unreadCount = 0;
    let page = params.page ?? 1;
    let pageSize = params.pageSize ?? 20;

    if (Array.isArray((extracted as any).Data)) {
      items = (extracted as any).Data;
      total = (extracted as any).Total ?? items.length;
      unreadCount = (extracted as any).UnreadCount ?? 0;
      page = (extracted as any).Page ?? page;
      pageSize = (extracted as any).PageSize ?? pageSize;
    } else if (Array.isArray((extracted as any).data)) {
      items = (extracted as any).data;
      total = (extracted as any).total ?? items.length;
      unreadCount = (extracted as any).unreadCount ?? 0;
      page = (extracted as any).page ?? page;
      pageSize = (extracted as any).pageSize ?? pageSize;
    } else {
      const dataBlock = (extracted as any).Data || (extracted as any).data || extracted;
      const possibleItems = dataBlock.Items || dataBlock.items || dataBlock.Data || dataBlock.data || [];
      items = Array.isArray(possibleItems) ? possibleItems : [];
      total = dataBlock.Total ?? dataBlock.total ?? items.length;
      unreadCount = dataBlock.UnreadCount ?? dataBlock.unreadCount ?? 0;
      page = dataBlock.Page ?? dataBlock.page ?? page;
      pageSize = dataBlock.PageSize ?? dataBlock.pageSize ?? pageSize;
    }

    return {
      data: Array.isArray(items) ? items.map(this.mapNotification) : [],
      total,
      unreadCount,
      page,
      pageSize,
    };
  }

  async markAsRead(id: number): Promise<boolean> {
    const res = await retryRequest(async () => fetchWithAutoRefresh(`${this.baseUrl}/api/Notifications/${id}/mark-read`, {
      method: 'PUT',
      headers: this.getAuthHeaders()
    }));
    const parsed = await safeJsonParse(res);
    if (!isSuccessfulResponse(parsed)) throw new Error(extractMessage(parsed));
    const extracted = extractResult(parsed);
    return extracted === true || extracted?.Success === true;
  }

  async markAllAsRead(): Promise<number> {
    const res = await retryRequest(async () => fetchWithAutoRefresh(`${this.baseUrl}/api/Notifications/mark-all-read`, {
      method: 'PUT',
      headers: this.getAuthHeaders()
    }));
    const parsed = await safeJsonParse(res);
    if (!isSuccessfulResponse(parsed)) throw new Error(extractMessage(parsed));
    const extracted = extractResult(parsed);
    return extracted?.Count || extracted || 0;
  }

  async createNotification(payload: { userId: number; title: string; content?: string; type?: number; priority?: number }): Promise<any> {
    const res = await retryRequest(async () => fetchWithAutoRefresh(`${this.baseUrl}/api/Notifications`, {
      method: 'POST',
      headers: { ...this.getAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }));
    const parsed = await safeJsonParse(res);
    if (!isSuccessfulResponse(parsed)) throw new Error(extractMessage(parsed));
    return extractResult(parsed);
  }

  async broadcastAll(payload: { title: string; message: string; type: number; priority?: number; actionUrl?: string; sendEmail?: boolean }): Promise<any> {
    const res = await retryRequest(async () => fetchWithAutoRefresh(`${this.baseUrl}/api/Notifications/broadcast/all`, {
      method: 'POST',
      headers: { ...this.getAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }));
    const parsed = await safeJsonParse(res);
    if (!isSuccessfulResponse(parsed)) throw new Error(extractMessage(parsed));
    return extractResult(parsed);
  }

  async broadcastRole(role: string, payload: { title: string; message: string; type: number; priority?: number; actionUrl?: string; sendEmail?: boolean }): Promise<any> {
    const res = await retryRequest(async () => fetchWithAutoRefresh(`${this.baseUrl}/api/Notifications/broadcast/role/${role}`, {
      method: 'POST',
      headers: { ...this.getAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }));
    const parsed = await safeJsonParse(res);
    if (!isSuccessfulResponse(parsed)) throw new Error(extractMessage(parsed));
    return extractResult(parsed);
  }

  async getNotification(id: number): Promise<NotificationItem> {
    const res = await retryRequest(async () => fetchWithAutoRefresh(`${this.baseUrl}/api/Notifications/${id}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    }));
    const parsed = await safeJsonParse(res);
    if (!isSuccessfulResponse(parsed)) throw new Error(extractMessage(parsed));
    const extracted = extractResult(parsed);
    return this.mapNotification(extracted);
  }

  private mapNotification(n: any): NotificationItem {
    return {
      id: n.id || n.Id,
      userId: n.userId || n.UserId,
      title: n.title || n.Title,
      content: n.content || n.Content || n.message || n.Message,
      type: n.type || n.Type,
      priority: n.priority || n.Priority,
      isRead: n.isRead ?? n.IsRead ?? false,
      createdAt: n.createdAt || n.CreatedAt,
    };
  }
}

export const notificationApi = new NotificationApiService();


