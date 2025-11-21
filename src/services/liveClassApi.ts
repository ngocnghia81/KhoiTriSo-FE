import { safeJsonParse, isSuccessfulResponse, extractResult, extractMessage } from '@/utils/apiHelpers';

export interface LiveClassDTO {
  id: number;
  courseId: number;
  courseTitle?: string;
  instructorId: number;
  instructorName?: string;
  title: string;
  description: string;
  meetingUrl: string;
  meetingId: string;
  meetingPassword?: string;
  scheduledAt: string;
  durationMinutes: number;
  maxParticipants?: number;
  status: number; // 0: Scheduled, 1: Live, 2: Completed, 3: Cancelled
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

export interface LiveClassParticipantDto {
  id: number;
  userId: number;
  username: string;
  fullName?: string;
  avatar?: string;
  joinedAt: string;
  attendanceDuration: number;
}

class LiveClassApiService {
  private baseUrl = '/api/live-classes';

  private normalize(item: any): LiveClassDTO {
    return {
      id: item.id ?? item.Id,
      courseId: item.courseId ?? item.CourseId,
      courseTitle: item.courseTitle ?? item.CourseTitle,
      instructorId: item.instructorId ?? item.InstructorId,
      instructorName: item.instructorName ?? item.InstructorName,
      title: item.title ?? item.Title ?? '',
      description: item.description ?? item.Description ?? '',
      meetingUrl: item.meetingUrl ?? item.MeetingUrl ?? '',
      meetingId: item.meetingId ?? item.MeetingId ?? '',
      meetingPassword: item.meetingPassword ?? item.MeetingPassword,
      scheduledAt: item.scheduledAt ?? item.ScheduledAt ?? '',
      durationMinutes: item.durationMinutes ?? item.DurationMinutes ?? 0,
      maxParticipants: item.maxParticipants ?? item.MaxParticipants ?? undefined,
      status: item.status ?? item.Status ?? 0,
      recordingUrl: item.recordingUrl ?? item.RecordingUrl ?? '',
      recordingStatus: item.recordingStatus ?? item.RecordingStatus ?? 0,
      chatEnabled: item.chatEnabled ?? item.ChatEnabled ?? false,
      recordingEnabled: item.recordingEnabled ?? item.RecordingEnabled ?? false,
    };
  }

  async getLiveClasses(
    authenticatedFetch: (url: string, options?: RequestInit) => Promise<Response>,
    params?: {
      courseId?: number;
      status?: number;
      upcoming?: boolean;
      page?: number;
      pageSize?: number;
      instructorId?: number;
    }
  ): Promise<PagedResult<LiveClassDTO>> {
    const queryParams = new URLSearchParams();
    if (params?.courseId) queryParams.append('courseId', params.courseId.toString());
    if (params?.status !== undefined) queryParams.append('status', params.status.toString());
    if (params?.upcoming !== undefined) queryParams.append('upcoming', params.upcoming.toString());
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    if (params?.instructorId) queryParams.append('instructorId', params.instructorId.toString());

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
    const total = extracted.Total ?? extracted.total ?? 0;
    const page = extracted.Page ?? extracted.page ?? params?.page ?? 1;
    const pageSize = extracted.PageSize ?? extracted.pageSize ?? params?.pageSize ?? 20;
    const totalPages = extracted.TotalPages ?? extracted.totalPages ?? Math.ceil(total / pageSize);

    const normalizedItems: LiveClassDTO[] = Array.isArray(items)
      ? items.map((item) => this.normalize(item))
      : [];

    return {
      items: normalizedItems,
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

    const data = extractResult<any>(result);
    if (!data) {
      throw new Error('No data received from API');
    }
    return this.normalize(data);
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

    const data = extractResult<any>(result);
    if (!data) {
      throw new Error('No data received from API');
    }
    return this.normalize(data);
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

    const data = extractResult<any>(result);
    if (!data) {
      throw new Error('No data received from API');
    }
    return this.normalize(data);
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

  async startLiveClass(
    authenticatedFetch: (url: string, options?: RequestInit) => Promise<Response>,
    id: number
  ): Promise<LiveClassDTO> {
    const response = await authenticatedFetch(`${this.baseUrl}/${id}/start`, {
      method: 'POST',
    });

    const result = await safeJsonParse(response);
    if (!isSuccessfulResponse(result)) {
      throw new Error(extractMessage(result) || 'Failed to start live class');
    }

    const data = extractResult<any>(result);
    if (!data) {
      throw new Error('No data received from API');
    }

    return this.normalize(data);
  }

  async endLiveClass(
    authenticatedFetch: (url: string, options?: RequestInit) => Promise<Response>,
    id: number
  ): Promise<LiveClassDTO> {
    const response = await authenticatedFetch(`${this.baseUrl}/${id}/end`, {
      method: 'POST',
    });

    const result = await safeJsonParse(response);
    if (!isSuccessfulResponse(result)) {
      throw new Error(extractMessage(result) || 'Failed to end live class');
    }

    const data = extractResult<any>(result);
    if (!data) {
      throw new Error('No data received from API');
    }

    return this.normalize(data);
  }

  async getParticipants(
    authenticatedFetch: (url: string, options?: RequestInit) => Promise<Response>,
    id: number
  ): Promise<LiveClassParticipantDto[]> {
    const response = await authenticatedFetch(`${this.baseUrl}/${id}/participants`);

    const result = await safeJsonParse(response);
    if (!isSuccessfulResponse(result)) {
      throw new Error(extractMessage(result) || 'Failed to fetch participants');
    }

    const data = extractResult<any>(result);
    if (!data) {
      return [];
    }

    const participants: any[] = Array.isArray(data) ? data : [];
    return participants.map((p: any) => ({
      id: p.id ?? p.Id ?? 0,
      userId: p.userId ?? p.UserId ?? 0,
      username: p.username ?? p.Username ?? '',
      fullName: p.fullName ?? p.FullName,
      avatar: p.avatar ?? p.Avatar,
      joinedAt: p.joinedAt ?? p.JoinedAt ?? '',
      attendanceDuration: p.attendanceDuration ?? p.AttendanceDuration ?? 0,
    }));
  }

  async joinLiveClass(
    authenticatedFetch: (url: string, options?: RequestInit) => Promise<Response>,
    id: number
  ): Promise<LiveClassDTO> {
    const response = await authenticatedFetch(`${this.baseUrl}/${id}/join`, {
      method: 'POST',
    });

    const result = await safeJsonParse(response);
    if (!isSuccessfulResponse(result)) {
      throw new Error(extractMessage(result) || 'Failed to join live class');
    }

    const data = extractResult<any>(result);
    if (!data) {
      throw new Error('No data received from API');
    }
    return this.normalize(data);
  }
}

export const liveClassApiService = new LiveClassApiService();

