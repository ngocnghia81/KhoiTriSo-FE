import { safeJsonParse, isSuccessfulResponse, extractResult, extractMessage } from '@/utils/apiHelpers';

export interface LiveClassDTO {
  id: number;
  courseId: number;
  instructorId: number;
  title: string;
  description: string;
  meetingUrl: string;
  meetingId: string;
  meetingPassword?: string;
  scheduledAt: string;
  durationMinutes: number;
  maxParticipants?: number;
  status: number; // 1: Scheduled, 2: Live, 3: Ended, 4: Cancelled
  recordingUrl?: string;
  recordingStatus: number;
  chatEnabled: boolean;
  recordingEnabled: boolean;
}

export interface CreateLiveClassRequest {
  courseId: number;
  instructorId: number;
  title: string;
  description: string;
  meetingUrl: string;
  meetingId: string;
  meetingPassword?: string;
  scheduledAt: string; // ISO string
  durationMinutes: number;
  maxParticipants?: number;
  status: number; // Default: 1 (Scheduled)
  recordingUrl?: string;
  recordingStatus?: number; // Default: 0
  chatEnabled?: boolean; // Default: true
  recordingEnabled?: boolean; // Default: true
}

export interface PagedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

class LiveClassApiService {
  private baseUrl = '/api/live-classes';

  async getLiveClasses(
    authenticatedFetch: (url: string, options?: RequestInit) => Promise<Response>,
    params?: {
      courseId?: number;
      status?: number;
      upcoming?: boolean;
      page?: number;
      pageSize?: number;
    }
  ): Promise<PagedResult<LiveClassDTO>> {
    const queryParams = new URLSearchParams();
    if (params?.courseId) queryParams.append('courseId', params.courseId.toString());
    if (params?.status !== undefined) queryParams.append('status', params.status.toString());
    if (params?.upcoming !== undefined) queryParams.append('upcoming', params.upcoming.toString());
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const url = `${this.baseUrl}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await authenticatedFetch(url);

    const result = await safeJsonParse(response);
    if (!isSuccessfulResponse(result)) {
      throw new Error(extractMessage(result) || 'Failed to fetch live classes');
    }

    const extracted = extractResult<any>(result);
    if (!extracted) {
      throw new Error('No data received from API');
    }

    // Backend returns: { Items: [...], Total: number, Page: number, PageSize: number, TotalPages: number }
    const items = extracted.Items || extracted.items || [];
    const total = extracted.Total || extracted.total || 0;
    const page = extracted.Page || extracted.page || params?.page || 1;
    const pageSize = extracted.PageSize || extracted.pageSize || params?.pageSize || 20;
    const totalPages = extracted.TotalPages || extracted.totalPages || Math.ceil(total / pageSize);

    return {
      items: Array.isArray(items) ? items : [],
      total,
      page,
      pageSize,
      totalPages,
    };
  }

  async getLiveClassById(
    authenticatedFetch: (url: string, options?: RequestInit) => Promise<Response>,
    id: number
  ): Promise<LiveClassDTO> {
    const response = await authenticatedFetch(`${this.baseUrl}/${id}`);

    const result = await safeJsonParse(response);
    if (!isSuccessfulResponse(result)) {
      throw new Error(extractMessage(result) || 'Failed to fetch live class');
    }

    const data = extractResult<LiveClassDTO>(result);
    if (!data) {
      throw new Error('No data received from API');
    }
    return data;
  }

  async createLiveClass(
    authenticatedFetch: (url: string, options?: RequestInit) => Promise<Response>,
    request: CreateLiveClassRequest
  ): Promise<LiveClassDTO> {
    const response = await authenticatedFetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    const result = await safeJsonParse(response);
    if (!isSuccessfulResponse(result)) {
      throw new Error(extractMessage(result) || 'Failed to create live class');
    }

    const data = extractResult<LiveClassDTO>(result);
    if (!data) {
      throw new Error('No data received from API');
    }
    return data;
  }

  async updateLiveClass(
    authenticatedFetch: (url: string, options?: RequestInit) => Promise<Response>,
    id: number,
    request: Partial<CreateLiveClassRequest>
  ): Promise<LiveClassDTO> {
    const response = await authenticatedFetch(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    const result = await safeJsonParse(response);
    if (!isSuccessfulResponse(result)) {
      throw new Error(extractMessage(result) || 'Failed to update live class');
    }

    const data = extractResult<LiveClassDTO>(result);
    if (!data) {
      throw new Error('No data received from API');
    }
    return data;
  }

  async deleteLiveClass(
    authenticatedFetch: (url: string, options?: RequestInit) => Promise<Response>,
    id: number
  ): Promise<void> {
    const response = await authenticatedFetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
    });

    const result = await safeJsonParse(response);
    if (!isSuccessfulResponse(result)) {
      throw new Error(extractMessage(result) || 'Failed to delete live class');
    }
  }
}

export const liveClassApiService = new LiveClassApiService();

