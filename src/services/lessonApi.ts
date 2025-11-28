import { safeJsonParse, isSuccessfulResponse, extractResult, extractMessage } from '@/utils/apiHelpers';

export interface LessonMaterialDto {
  id: number;
  lessonId: number;
  title: string;
  fileName: string;
  filePath: string;
  fileType: string;
  fileSize: number;
  downloadCount: number;
  fileUrl?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateLessonMaterialRequest {
  lessonId: number;
  title: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
}

export interface UpdateLessonMaterialRequest {
  title?: string;
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
}

export interface DiscussionResponseDto {
  id: number;
  lessonId: number;
  userId: number;
  user: {
    fullName: string;
    avatar?: string;
  };
  parentId?: number;
  content: string;
  videoTimestamp?: number;
  isInstructor: boolean;
  likeCount: number;
  isLikedByMe: boolean;
  isHidden: boolean;
  createdAt: string;
  updatedAt?: string;
  replies: DiscussionResponseDto[];
}

export interface CreateLessonDiscussionRequest {
  content: string;
  videoTimestamp?: number;
}

export interface UpdateLessonDiscussionRequest {
  content: string;
}

export interface CreateLessonDiscussionReplyRequest {
  content: string;
  videoTimestamp?: number;
}

export interface PagedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

class LessonApiService {
  private baseUrl = '/api/lessons';

  private normalizeMaterial(item: any): LessonMaterialDto {
    return {
      id: item.id ?? item.Id ?? 0,
      lessonId: item.lessonId ?? item.LessonId ?? 0,
      title: item.title ?? item.Title ?? '',
      fileName: item.fileName ?? item.FileName ?? '',
      filePath: item.filePath ?? item.FilePath ?? '',
      fileType: item.fileType ?? item.FileType ?? '',
      fileSize: item.fileSize ?? item.FileSize ?? 0,
      downloadCount: item.downloadCount ?? item.DownloadCount ?? 0,
      fileUrl: item.fileUrl ?? item.FileUrl ?? item.filePath ?? item.FilePath,
      createdAt: item.createdAt ?? item.CreatedAt ?? '',
      updatedAt: item.updatedAt ?? item.UpdatedAt,
    };
  }

  private normalizeDiscussion(item: any): DiscussionResponseDto {
    return {
      id: item.id ?? item.Id ?? 0,
      lessonId: item.lessonId ?? item.LessonId ?? 0,
      userId: item.userId ?? item.UserId ?? 0,
      user: {
        fullName: item.user?.fullName ?? item.User?.FullName ?? '',
        avatar: item.user?.avatar ?? item.User?.Avatar,
      },
      parentId: item.parentId ?? item.ParentId,
      content: item.content ?? item.Content ?? '',
      videoTimestamp: item.videoTimestamp ?? item.VideoTimestamp,
      isInstructor: item.isInstructor ?? item.IsInstructor ?? false,
      likeCount: item.likeCount ?? item.LikeCount ?? 0,
      isLikedByMe: item.isLikedByMe ?? item.IsLikedByMe ?? false,
      isHidden: item.isHidden ?? item.IsHidden ?? false,
      createdAt: item.createdAt ?? item.CreatedAt ?? '',
      updatedAt: item.updatedAt ?? item.UpdatedAt,
      replies: (item.replies ?? item.Replies ?? []).map((r: any) => this.normalizeDiscussion(r)),
    };
  }

  // Materials APIs
  async getLessonMaterials(
    authenticatedFetch: (url: string, options?: RequestInit) => Promise<Response>,
    lessonId: number
  ): Promise<LessonMaterialDto[]> {
    const response = await authenticatedFetch(`${this.baseUrl}/${lessonId}/materials`);

    const result = await safeJsonParse(response);
    if (!isSuccessfulResponse(result)) {
      throw new Error(extractMessage(result) || 'Failed to fetch lesson materials');
    }

    const data = extractResult<any>(result);
    if (!data) {
      return [];
    }

    const materials: any[] = Array.isArray(data) ? data : [];
    return materials.map((m: any) => this.normalizeMaterial(m));
  }

  async createLessonMaterial(
    authenticatedFetch: (url: string, options?: RequestInit) => Promise<Response>,
    lessonId: number,
    request: CreateLessonMaterialRequest
  ): Promise<LessonMaterialDto> {
    const response = await authenticatedFetch(`${this.baseUrl}/${lessonId}/materials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    const result = await safeJsonParse(response);
    if (!isSuccessfulResponse(result)) {
      throw new Error(extractMessage(result) || 'Failed to create lesson material');
    }

    const data = extractResult<any>(result);
    if (!data) {
      throw new Error('No data received from API');
    }

    return this.normalizeMaterial(data);
  }

  async updateLessonMaterial(
    authenticatedFetch: (url: string, options?: RequestInit) => Promise<Response>,
    lessonId: number,
    materialId: number,
    request: UpdateLessonMaterialRequest
  ): Promise<LessonMaterialDto> {
    const response = await authenticatedFetch(`${this.baseUrl}/${lessonId}/materials/${materialId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    const result = await safeJsonParse(response);
    if (!isSuccessfulResponse(result)) {
      throw new Error(extractMessage(result) || 'Failed to update lesson material');
    }

    const data = extractResult<any>(result);
    if (!data) {
      throw new Error('No data received from API');
    }

    return this.normalizeMaterial(data);
  }

  async deleteLessonMaterial(
    authenticatedFetch: (url: string, options?: RequestInit) => Promise<Response>,
    lessonId: number,
    materialId: number
  ): Promise<void> {
    const response = await authenticatedFetch(`${this.baseUrl}/${lessonId}/materials/${materialId}`, {
      method: 'DELETE',
    });

    const result = await safeJsonParse(response);
    if (!isSuccessfulResponse(result)) {
      throw new Error(extractMessage(result) || 'Failed to delete lesson material');
    }
  }

  // Discussions APIs
  async getLessonDiscussions(
    authenticatedFetch: (url: string, options?: RequestInit) => Promise<Response>,
    lessonId: number,
    params?: {
      page?: number;
      pageSize?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    }
  ): Promise<PagedResult<DiscussionResponseDto>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const url = `${this.baseUrl}/${lessonId}/discussions${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await authenticatedFetch(url);

    const result = await safeJsonParse(response);
    if (!isSuccessfulResponse(result)) {
      throw new Error(extractMessage(result) || 'Failed to fetch lesson discussions');
    }

    const data = extractResult<any>(result);
    if (!data) {
      throw new Error('No data received from API');
    }

    // Backend returns: { Items: [...], Total: number, Page: number, PageSize: number, TotalPages: number }
    const items = data.Items || data.items || [];
    const total = data.Total ?? data.total ?? 0;
    const page = data.Page ?? data.page ?? params?.page ?? 1;
    const pageSize = data.PageSize ?? data.pageSize ?? params?.pageSize ?? 20;
    const totalPages = data.TotalPages ?? data.totalPages ?? Math.ceil(total / pageSize);

    const discussions: DiscussionResponseDto[] = Array.isArray(items)
      ? items.map((item: any) => this.normalizeDiscussion(item))
      : [];

    return {
      items: discussions,
      total,
      page,
      pageSize,
      totalPages,
    };
  }

  async createLessonDiscussion(
    authenticatedFetch: (url: string, options?: RequestInit) => Promise<Response>,
    lessonId: number,
    request: CreateLessonDiscussionRequest
  ): Promise<DiscussionResponseDto> {
    const response = await authenticatedFetch(`${this.baseUrl}/${lessonId}/discussions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    const result = await safeJsonParse(response);
    if (!isSuccessfulResponse(result)) {
      throw new Error(extractMessage(result) || 'Failed to create lesson discussion');
    }

    const data = extractResult<any>(result);
    if (!data) {
      throw new Error('No data received from API');
    }

    return this.normalizeDiscussion(data);
  }

  async updateLessonDiscussion(
    authenticatedFetch: (url: string, options?: RequestInit) => Promise<Response>,
    discussionId: number,
    request: UpdateLessonDiscussionRequest
  ): Promise<DiscussionResponseDto> {
    const response = await authenticatedFetch(`/api/discussions/${discussionId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    const result = await safeJsonParse(response);
    if (!isSuccessfulResponse(result)) {
      throw new Error(extractMessage(result) || 'Failed to update lesson discussion');
    }

    const data = extractResult<any>(result);
    if (!data) {
      throw new Error('No data received from API');
    }

    return this.normalizeDiscussion(data);
  }

  async deleteLessonDiscussion(
    authenticatedFetch: (url: string, options?: RequestInit) => Promise<Response>,
    discussionId: number
  ): Promise<void> {
    const response = await authenticatedFetch(`/api/discussions/${discussionId}`, {
      method: 'DELETE',
    });

    const result = await safeJsonParse(response);
    if (!isSuccessfulResponse(result)) {
      throw new Error(extractMessage(result) || 'Failed to delete lesson discussion');
    }
  }

  async createDiscussionReply(
    authenticatedFetch: (url: string, options?: RequestInit) => Promise<Response>,
    discussionId: number,
    request: CreateLessonDiscussionReplyRequest
  ): Promise<DiscussionResponseDto> {
    const response = await authenticatedFetch(`/api/discussions/${discussionId}/replies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    const result = await safeJsonParse(response);
    if (!isSuccessfulResponse(result)) {
      throw new Error(extractMessage(result) || 'Failed to create discussion reply');
    }

    const data = extractResult<any>(result);
    if (!data) {
      throw new Error('No data received from API');
    }

    return this.normalizeDiscussion(data);
  }

  async toggleDiscussionLike(
    authenticatedFetch: (url: string, options?: RequestInit) => Promise<Response>,
    discussionId: number
  ): Promise<{ likeCount: number; isLiked: boolean }> {
    const response = await authenticatedFetch(`/api/discussions/${discussionId}/like`, {
      method: 'POST',
    });

    const result = await safeJsonParse(response);
    if (!isSuccessfulResponse(result)) {
      throw new Error(extractMessage(result) || 'Failed to toggle discussion like');
    }

    const data = extractResult<any>(result);
    if (!data) {
      throw new Error('No data received from API');
    }

    return {
      likeCount: data.likeCount ?? data.LikeCount ?? 0,
      isLiked: data.isLiked ?? data.IsLiked ?? false,
    };
  }

  // Progress APIs
  async updateLessonProgress(
    authenticatedFetch: (url: string, options?: RequestInit) => Promise<Response>,
    lessonId: number,
    request: {
      watchTime: number;
      isCompleted: boolean;
      videoPosition?: number;
    }
  ): Promise<any> {
    const response = await authenticatedFetch(`${this.baseUrl}/${lessonId}/progress`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    const result = await safeJsonParse(response);
    if (!isSuccessfulResponse(result)) {
      throw new Error(extractMessage(result) || 'Failed to update lesson progress');
    }

    return extractResult<any>(result);
  }

  async getVideoProgress(
    authenticatedFetch: (url: string, options?: RequestInit) => Promise<Response>,
    lessonId: number
  ): Promise<{
    videoPosition: number;
    videoDuration: number;
    watchPercentage: number;
    isCompleted: boolean;
    lastWatchedAt: string;
  }> {
    const response = await authenticatedFetch(`${this.baseUrl}/${lessonId}/video-progress`);

    const result = await safeJsonParse(response);
    if (!isSuccessfulResponse(result)) {
      throw new Error(extractMessage(result) || 'Failed to get video progress');
    }

    const data = extractResult<any>(result);
    if (!data) {
      // Return default zero progress if not found
      return {
        videoPosition: 0,
        videoDuration: 0,
        watchPercentage: 0,
        isCompleted: false,
        lastWatchedAt: new Date().toISOString(),
      };
    }

    return {
      videoPosition: data.videoPosition ?? data.VideoPosition ?? 0,
      videoDuration: data.videoDuration ?? data.VideoDuration ?? 0,
      watchPercentage: data.watchPercentage ?? data.WatchPercentage ?? 0,
      isCompleted: data.isCompleted ?? data.IsCompleted ?? false,
      lastWatchedAt: data.lastWatchedAt ?? data.LastWatchedAt ?? new Date().toISOString(),
    };
  }

  async updateVideoProgress(
    authenticatedFetch: (url: string, options?: RequestInit) => Promise<Response>,
    lessonId: number,
    request: {
      videoPosition: number;
      videoDuration: number;
      watchPercentage: number;
      isCompleted: boolean;
    }
  ): Promise<any> {
    // Convert to integers as backend expects int for VideoPosition and VideoDuration
    const body = {
      videoPosition: Math.floor(request.videoPosition),
      videoDuration: Math.floor(request.videoDuration),
      watchPercentage: request.watchPercentage,
      isCompleted: request.isCompleted,
    };

    const response = await authenticatedFetch(`${this.baseUrl}/${lessonId}/video-progress`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const result = await safeJsonParse(response);
    if (!isSuccessfulResponse(result)) {
      throw new Error(extractMessage(result) || 'Failed to update video progress');
    }

    return extractResult<any>(result);
  }
}

export const lessonApiService = new LessonApiService();

