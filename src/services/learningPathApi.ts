import {
  safeJsonParse,
  isSuccessfulResponse,
  extractResult,
  extractMessage,
  retryRequest,
  fetchWithAutoRefresh,
} from '@/utils/apiHelpers';

export interface LearningPath {
  id: number;
  title: string;
  description: string;
  thumbnail?: string;
  instructorId: number;
  instructor?: {
    id: number;
    name: string;
    avatar?: string;
    bio?: string;
  };
  categoryId?: number;
  category?: {
    id: number;
    name: string;
  };
  estimatedDuration?: number;
  difficultyLevel: number;
  difficultyLevelName: string;
  price: number;
  isPublished: boolean;
  isActive: boolean;
  approvalStatus: number;
  approvalStatusName: string;
  qualityScore?: number;
  reviewNotes?: string;
  courseCount: number;
  enrollmentCount: number;
  isEnrolled: boolean;
  createdAt: string;
  updatedAt?: string;
  courses?: LearningPathCourse[];
}

export interface LearningPathCourse {
  id: number;
  courseId: number;
  course?: {
    id: number;
    title: string;
    thumbnail?: string;
    price: number;
  };
  orderIndex: number;
  isRequired: boolean;
}

export interface AddCourseToLearningPathRequest {
  courseId: number;
  orderIndex: number;
  isRequired: boolean;
}

export interface UpdateLearningPathCourseRequest {
  orderIndex?: number;
  isRequired?: boolean;
}

export interface CreateLearningPathRequest {
  title: string;
  description: string;
  thumbnail?: string;
  categoryId: number;
  estimatedDuration?: number;
  difficultyLevel: number;
  price: number;
}

export interface UpdateLearningPathRequest {
  title?: string;
  description?: string;
  thumbnail?: string;
  categoryId?: number;
  estimatedDuration?: number;
  difficultyLevel?: number;
  price?: number;
}

export interface PagedLearningPathResult {
  items: LearningPath[];
  total: number;
  page: number;
  pageSize: number;
}

export interface LearningPathAnalyticsOverview {
  totalLearningPaths: number;
  publishedLearningPaths: number;
  pendingApproval: number;
  draftLearningPaths: number;
  totalCoursesInPaths: number;
  averageCoursesPerPath: number;
  averagePrice: number;
  totalEnrollments: number;
  activeEnrollments: number;
  completedEnrollments: number;
  averageProgress: number;
}

export interface LearningPathCategoryStat {
  categoryId: number | null;
  categoryName: string;
  learningPathCount: number;
  enrollmentCount: number;
  averagePrice: number;
  averageCoursesPerPath: number;
}

export interface LearningPathSummaryItem {
  id: number;
  title: string;
  thumbnail?: string;
  instructorName: string;
  enrollmentCount: number;
  courseCount: number;
  price: number;
  averageProgress: number;
  completedCount: number;
}

export interface LearningPathEnrollmentTrendItem {
  date: string;
  newEnrollments: number;
  completed: number;
  active: number;
}

export interface LearningPathDifficultyStat {
  difficulty: string;
  learningPathCount: number;
  enrollmentCount: number;
}

export interface LearningPathInstructorStat {
  instructorId: number;
  instructorName: string;
  avatar?: string;
  learningPathCount: number;
  totalEnrollments: number;
  averageCoursesPerPath: number;
  averagePrice: number;
}

export interface LearningPathAnalytics {
  overview: LearningPathAnalyticsOverview;
  categoryStats: LearningPathCategoryStat[];
  topLearningPaths: LearningPathSummaryItem[];
  enrollmentTrends: LearningPathEnrollmentTrendItem[];
  difficultyDistribution: LearningPathDifficultyStat[];
  topInstructors: LearningPathInstructorStat[];
}

type LanguageCode = 'vi' | 'en';

const mapLearningPathCourse = (course: any): LearningPathCourse => {
  const nestedCourse = course.course ?? course.Course ?? null;

  return {
    id: course.id ?? course.Id,
    courseId: course.courseId ?? course.CourseId,
    course: nestedCourse
      ? {
          id: nestedCourse.id ?? nestedCourse.Id,
          title: nestedCourse.title ?? nestedCourse.Title ?? '',
          thumbnail: nestedCourse.thumbnail ?? nestedCourse.Thumbnail,
          price: nestedCourse.price ?? nestedCourse.Price ?? 0,
        }
      : undefined,
    orderIndex: course.orderIndex ?? course.OrderIndex ?? 0,
    isRequired: course.isRequired ?? course.IsRequired ?? false,
  };
};

const mapLearningPath = (data: any): LearningPath => ({
  id: data.id ?? data.Id,
  title: data.title ?? data.Title,
  description: data.description ?? data.Description,
  thumbnail: data.thumbnail ?? data.Thumbnail,
  instructorId: data.instructorId ?? data.InstructorId,
  instructor: data.instructor ?? data.Instructor
    ? {
        id: data.instructor?.id ?? data.instructor?.Id,
        name: data.instructor?.name ?? data.instructor?.Name ?? '',
        avatar: data.instructor?.avatar ?? data.instructor?.Avatar,
        bio: data.instructor?.bio ?? data.instructor?.Bio,
      }
    : undefined,
  categoryId: data.categoryId ?? data.CategoryId,
  category: data.category ?? data.Category
    ? {
        id: data.category?.id ?? data.category?.Id,
        name: data.category?.name ?? data.category?.Name ?? '',
      }
    : undefined,
  estimatedDuration: data.estimatedDuration ?? data.EstimatedDuration,
  difficultyLevel: data.difficultyLevel ?? data.DifficultyLevel ?? 0,
  difficultyLevelName: data.difficultyLevelName ?? data.DifficultyLevelName ?? '',
  price: data.price ?? data.Price ?? 0,
  isPublished: data.isPublished ?? data.IsPublished ?? false,
  isActive: data.isActive ?? data.IsActive ?? false,
  approvalStatus: data.approvalStatus ?? data.ApprovalStatus ?? 0,
  approvalStatusName: data.approvalStatusName ?? data.ApprovalStatusName ?? '',
  qualityScore: data.qualityScore ?? data.QualityScore,
  reviewNotes: data.reviewNotes ?? data.ReviewNotes,
  courseCount: data.courseCount ?? data.CourseCount ?? 0,
  enrollmentCount: data.enrollmentCount ?? data.EnrollmentCount ?? 0,
  isEnrolled: data.isEnrolled ?? data.IsEnrolled ?? false,
  createdAt: data.createdAt ?? data.CreatedAt,
  updatedAt: data.updatedAt ?? data.UpdatedAt,
  courses: Array.isArray(data.courses ?? data.Courses)
    ? (data.courses ?? data.Courses).map(mapLearningPathCourse)
    : undefined,
});

const mapLearningPathAnalytics = (data: any): LearningPathAnalytics => {
  const overviewSource = data.overview ?? data.Overview ?? {};
  const categoryStatsSource =
    data.categoryStats ?? data.CategoryStats ?? data.Overview?.CategoryStats ?? [];
  const topLearningPathsSource =
    data.topLearningPaths ?? data.TopLearningPaths ?? [];
  const enrollmentTrendsSource =
    data.enrollmentTrends ?? data.EnrollmentTrends ?? [];
  const difficultyDistributionSource =
    data.difficultyDistribution ?? data.DifficultyDistribution ?? [];
  const topInstructorsSource =
    data.topInstructors ?? data.TopInstructors ?? [];

  const overview: LearningPathAnalyticsOverview = {
    totalLearningPaths:
      overviewSource.totalLearningPaths ??
      overviewSource.TotalLearningPaths ??
      0,
    publishedLearningPaths:
      overviewSource.publishedLearningPaths ??
      overviewSource.PublishedLearningPaths ??
      0,
    pendingApproval:
      overviewSource.pendingApproval ??
      overviewSource.PendingApproval ??
      0,
    draftLearningPaths:
      overviewSource.draftLearningPaths ??
      overviewSource.DraftLearningPaths ??
      0,
    totalCoursesInPaths:
      overviewSource.totalCoursesInPaths ??
      overviewSource.TotalCoursesInPaths ??
      0,
    averageCoursesPerPath:
      overviewSource.averageCoursesPerPath ??
      overviewSource.AverageCoursesPerPath ??
      0,
    averagePrice:
      overviewSource.averagePrice ??
      overviewSource.AveragePrice ??
      0,
    totalEnrollments:
      overviewSource.totalEnrollments ??
      overviewSource.TotalEnrollments ??
      0,
    activeEnrollments:
      overviewSource.activeEnrollments ??
      overviewSource.ActiveEnrollments ??
      0,
    completedEnrollments:
      overviewSource.completedEnrollments ??
      overviewSource.CompletedEnrollments ??
      0,
    averageProgress:
      overviewSource.averageProgress ??
      overviewSource.AverageProgress ??
      0,
  };

  const categoryStats: LearningPathCategoryStat[] = Array.isArray(categoryStatsSource)
    ? categoryStatsSource.map((item: any) => ({
        categoryId: item.categoryId ?? item.CategoryId ?? null,
        categoryName: item.categoryName ?? item.CategoryName ?? 'Không phân loại',
        learningPathCount: item.learningPathCount ?? item.LearningPathCount ?? 0,
        enrollmentCount: item.enrollmentCount ?? item.EnrollmentCount ?? 0,
        averagePrice: item.averagePrice ?? item.AveragePrice ?? 0,
        averageCoursesPerPath:
          item.averageCoursesPerPath ?? item.AverageCoursesPerPath ?? 0,
      }))
    : [];

  const topLearningPaths: LearningPathSummaryItem[] = Array.isArray(topLearningPathsSource)
    ? topLearningPathsSource.map((item: any) => ({
        id: item.id ?? item.Id ?? 0,
        title: item.title ?? item.Title ?? '',
        thumbnail: item.thumbnail ?? item.Thumbnail,
        instructorName: item.instructorName ?? item.InstructorName ?? 'Ẩn danh',
        enrollmentCount: item.enrollmentCount ?? item.EnrollmentCount ?? 0,
        courseCount: item.courseCount ?? item.CourseCount ?? 0,
        price: item.price ?? item.Price ?? 0,
        averageProgress: item.averageProgress ?? item.AverageProgress ?? 0,
        completedCount: item.completedCount ?? item.CompletedCount ?? 0,
      }))
    : [];

  const enrollmentTrends: LearningPathEnrollmentTrendItem[] = Array.isArray(enrollmentTrendsSource)
    ? enrollmentTrendsSource.map((item: any) => ({
        date: item.date ?? item.Date ?? '',
        newEnrollments: item.newEnrollments ?? item.NewEnrollments ?? 0,
        completed: item.completed ?? item.Completed ?? 0,
        active: item.active ?? item.Active ?? 0,
      }))
    : [];

  const difficultyDistribution: LearningPathDifficultyStat[] = Array.isArray(difficultyDistributionSource)
    ? difficultyDistributionSource.map((item: any) => ({
        difficulty: item.difficulty ?? item.Difficulty ?? '',
        learningPathCount: item.learningPathCount ?? item.LearningPathCount ?? 0,
        enrollmentCount: item.enrollmentCount ?? item.EnrollmentCount ?? 0,
      }))
    : [];

  const topInstructors: LearningPathInstructorStat[] = Array.isArray(topInstructorsSource)
    ? topInstructorsSource.map((item: any) => ({
        instructorId: item.instructorId ?? item.InstructorId ?? 0,
        instructorName: item.instructorName ?? item.InstructorName ?? 'Ẩn danh',
        avatar: item.avatar ?? item.Avatar,
        learningPathCount: item.learningPathCount ?? item.LearningPathCount ?? 0,
        totalEnrollments: item.totalEnrollments ?? item.TotalEnrollments ?? 0,
        averageCoursesPerPath:
          item.averageCoursesPerPath ?? item.AverageCoursesPerPath ?? 0,
        averagePrice: item.averagePrice ?? item.AveragePrice ?? 0,
      }))
    : [];

  return {
    overview,
    categoryStats,
    topLearningPaths,
    enrollmentTrends,
    difficultyDistribution,
    topInstructors,
  };
};

class LearningPathApiService {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

  private getLanguage(): LanguageCode {
    if (typeof window === 'undefined') {
      return 'vi';
    }

    try {
      const stored = localStorage.getItem('lang');
      if (stored === 'en') return 'en';

      const cookieLang = document.cookie
        .split('; ')
        .find((row) => row.startsWith('lang='))?.split('=')[1];

      if (cookieLang === 'en') return 'en';
    } catch {
      // ignore
    }

    return 'vi';
  }

  private getAuthHeaders() {
    const headers: Record<string, string> = {
      'Accept-Language': this.getLanguage(),
    };

    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers as HeadersInit;
  }

  async getLearningPaths(params: {
    categoryId?: number;
    level?: number;
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    instructorId?: number;
  } = {}): Promise<PagedLearningPathResult> {
    const urlParams = new URLSearchParams();
    if (params.categoryId !== undefined) urlParams.append('category', String(params.categoryId));
    if (params.level !== undefined) urlParams.append('level', String(params.level));
    if (params.page) urlParams.append('page', String(params.page));
    if (params.pageSize) urlParams.append('pageSize', String(params.pageSize));
    if (params.sortBy) urlParams.append('sortBy', params.sortBy);
    if (params.sortOrder) urlParams.append('sortOrder', params.sortOrder);
    if (params.instructorId !== undefined) urlParams.append('instructorId', String(params.instructorId));

    const url = `${this.baseUrl}/api/learning-paths${urlParams.toString() ? `?${urlParams.toString()}` : ''}`;

    const response = await retryRequest(async () =>
      fetchWithAutoRefresh(url, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      })
    );

    const parsed = await safeJsonParse(response);
    if (!isSuccessfulResponse(parsed)) {
      throw new Error(extractMessage(parsed));
    }

    const result = extractResult(parsed);
    const items = Array.isArray(result?.Items)
      ? result.Items
      : Array.isArray(result?.items)
        ? result.items
        : Array.isArray(result?.Result?.Items)
          ? result.Result.Items
          : [];

    const total =
      result?.Total ??
      result?.total ??
      result?.Result?.Total ??
      result?.Result?.total ??
      items.length;
    const page = result?.Page ?? result?.page ?? result?.Result?.Page ?? result?.Result?.page ?? 1;
    const pageSize =
      result?.PageSize ??
      result?.pageSize ??
      result?.Result?.PageSize ??
      result?.Result?.pageSize ??
      20;

    return {
      items: items.map(mapLearningPath),
      total,
      page,
      pageSize,
    };
  }

  async getLearningPathAnalytics(days = 30): Promise<LearningPathAnalytics> {
    const response = await retryRequest(async () =>
      fetchWithAutoRefresh(`${this.baseUrl}/api/learning-paths/analytics?days=${days}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      })
    );

    const parsed = await safeJsonParse(response);
    if (!isSuccessfulResponse(parsed)) {
      throw new Error(extractMessage(parsed));
    }

    const result = extractResult(parsed);
    return mapLearningPathAnalytics(result);
  }

  async getLearningPathById(id: number): Promise<LearningPath> {
    const response = await retryRequest(async () =>
      fetchWithAutoRefresh(`${this.baseUrl}/api/learning-paths/${id}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      })
    );

    const parsed = await safeJsonParse(response);
    if (!isSuccessfulResponse(parsed)) {
      throw new Error(extractMessage(parsed));
    }

    const result = extractResult(parsed);
    return mapLearningPath(result);
  }

  async createLearningPath(data: CreateLearningPathRequest): Promise<LearningPath> {
    const response = await retryRequest(async () =>
      fetchWithAutoRefresh(`${this.baseUrl}/api/learning-paths`, {
        method: 'POST',
        headers: { ...this.getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
    );

    const parsed = await safeJsonParse(response);
    if (!isSuccessfulResponse(parsed)) {
      throw new Error(extractMessage(parsed));
    }

    const result = extractResult(parsed);
    return mapLearningPath(result);
  }

  async updateLearningPath(id: number, data: UpdateLearningPathRequest): Promise<LearningPath> {
    const response = await retryRequest(async () =>
      fetchWithAutoRefresh(`${this.baseUrl}/api/learning-paths/${id}`, {
        method: 'PUT',
        headers: { ...this.getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
    );

    const parsed = await safeJsonParse(response);
    if (!isSuccessfulResponse(parsed)) {
      throw new Error(extractMessage(parsed));
    }

    const result = extractResult(parsed);
    return mapLearningPath(result);
  }

  async deleteLearningPath(id: number): Promise<boolean> {
    const response = await retryRequest(async () =>
      fetchWithAutoRefresh(`${this.baseUrl}/api/learning-paths/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      })
    );

    const parsed = await safeJsonParse(response);
    if (!isSuccessfulResponse(parsed)) {
      throw new Error(extractMessage(parsed));
    }

    const result = extractResult(parsed);
    if (result === true || result === 'true') return true;
    return result?.Success === true;
  }

  async restoreLearningPath(id: number): Promise<LearningPath> {
    const response = await retryRequest(async () =>
      fetchWithAutoRefresh(`${this.baseUrl}/api/admin/learning-paths/${id}/restore`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
      })
    );

    const parsed = await safeJsonParse(response);
    if (!isSuccessfulResponse(parsed)) {
      throw new Error(extractMessage(parsed));
    }

    const result = extractResult(parsed);
    return mapLearningPath(result);
  }

  async getLearningPathCourses(id: number): Promise<LearningPathCourse[]> {
    const response = await retryRequest(async () =>
      fetchWithAutoRefresh(`${this.baseUrl}/api/learning-paths/${id}/courses`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      })
    );

    const parsed = await safeJsonParse(response);
    if (!isSuccessfulResponse(parsed)) {
      throw new Error(extractMessage(parsed));
    }

    const result = extractResult(parsed);
    const courses =
      Array.isArray(result?.courses) ||
      Array.isArray(result?.Courses)
        ? result.courses ?? result.Courses
        : Array.isArray(result)
          ? result
          : [];

    return courses.map(mapLearningPathCourse);
  }

  async addCourseToLearningPath(id: number, data: AddCourseToLearningPathRequest): Promise<LearningPathCourse> {
    const response = await retryRequest(async () =>
      fetchWithAutoRefresh(`${this.baseUrl}/api/learning-paths/${id}/courses`, {
        method: 'POST',
        headers: { ...this.getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
    );

    const parsed = await safeJsonParse(response);
    if (!isSuccessfulResponse(parsed)) {
      throw new Error(extractMessage(parsed));
    }

    const result = extractResult(parsed);
    return mapLearningPathCourse(result);
  }

  async updateLearningPathCourse(
    learningPathId: number,
    courseId: number,
    data: UpdateLearningPathCourseRequest
  ): Promise<LearningPathCourse> {
    const response = await retryRequest(async () =>
      fetchWithAutoRefresh(`${this.baseUrl}/api/learning-paths/${learningPathId}/courses/${courseId}`, {
        method: 'PUT',
        headers: { ...this.getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
    );

    const parsed = await safeJsonParse(response);
    if (!isSuccessfulResponse(parsed)) {
      throw new Error(extractMessage(parsed));
    }

    const result = extractResult(parsed);
    return mapLearningPathCourse(result);
  }

  async removeLearningPathCourse(learningPathId: number, courseId: number): Promise<boolean> {
    const response = await retryRequest(async () =>
      fetchWithAutoRefresh(`${this.baseUrl}/api/learning-paths/${learningPathId}/courses/${courseId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      })
    );

    const parsed = await safeJsonParse(response);
    if (!isSuccessfulResponse(parsed)) {
      throw new Error(extractMessage(parsed));
    }

    const result = extractResult(parsed);
    return result === true || result === 'true' || (result?.Success ?? false) === true;
  }
}

export const learningPathApi = new LearningPathApiService();


