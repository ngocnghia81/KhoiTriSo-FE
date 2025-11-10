import { useState, useEffect, useCallback } from 'react';
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch';

export interface Instructor {
  Id: number;
  Username: string;
  Email: string;
  FullName?: string;
  Avatar?: string;
  Phone?: string;
  Address?: string;
  SocialLinks?: string;
  TeacherStaticPagePath?: string;
  TeacherAdditionalInfo?: string;
  IsActive: boolean;
  EmailVerified: boolean;
  LastLogin?: string;
  CreatedAt: string;
  TotalCourses: number;
  TotalBooks: number;
  TotalLearningPaths: number;
  TotalStudents: number;
  TotalEarnings: number;
  AverageRating: number;
}

export interface InstructorListResponse {
  Items: Instructor[];
  Total: number;
  Page: number;
  PageSize: number;
}

export interface InstructorAnalytics {
  InstructorId: number;
  InstructorName: string;
  Avatar?: string;
  TotalCourses: number;
  TotalBooks: number;
  TotalLearningPaths: number;
  TotalStudents: number;
  TotalRevenue: number;
  TotalEarnings: number;
  AverageRating: number;
  CoursePerformance: CoursePerformance[];
  MonthlyEarnings: MonthlyEarning[];
  StudentFeedback: FeedbackSummary;
  EnrollmentTrend: ChartPoint[];
  RevenueTrend: ChartPoint[];
  TopCourses: TopContent[];
  TopBooks: TopContent[];
}

export interface CoursePerformance {
  CourseId: number;
  Title: string;
  Enrollments: number;
  Revenue: number;
}

export interface MonthlyEarning {
  Month: string;
  Earnings: number;
}

export interface FeedbackSummary {
  Positive: number;
  Neutral: number;
  Negative: number;
}

export interface ChartPoint {
  Date: string;
  Amount: number;
}

export interface TopContent {
  Id: number;
  Title: string;
  Thumbnail?: string;
  Enrollments: number;
  Revenue: number;
  Rating: number;
}

export const useInstructors = (
  search?: string,
  isActive?: boolean,
  page: number = 1,
  pageSize: number = 20
) => {
  const { authenticatedFetch } = useAuthenticatedFetch();
  const [data, setData] = useState<InstructorListResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInstructors = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (isActive !== undefined) params.append('isActive', isActive.toString());
      params.append('page', page.toString());
      params.append('pageSize', pageSize.toString());

      const response = await authenticatedFetch(`/api/instructor?${params}`);
      const result = await response.json();

      if (response.ok && result.Result) {
        setData(result.Result);
      } else {
        setError(result.Message || 'Failed to fetch instructors');
      }
    } catch (err) {
      setError('Failed to fetch instructors');
    } finally {
      setLoading(false);
    }
  }, [search, isActive, page, pageSize, authenticatedFetch]);

  useEffect(() => {
    fetchInstructors();
  }, [fetchInstructors]);

  return { data, loading, error, refetch: fetchInstructors };
};

export const useInstructorDetail = (id: number) => {
  const { authenticatedFetch } = useAuthenticatedFetch();
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await authenticatedFetch(`/api/instructor/${id}`);
        const result = await response.json();

        if (response.ok && result.Result) {
          setData(result.Result);
        } else {
          setError(result.Message || 'Failed to fetch instructor detail');
        }
      } catch (err) {
        setError('Failed to fetch instructor detail');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchDetail();
    }
  }, [id, authenticatedFetch]);

  return { data, loading, error };
};

export const useInstructorAnalytics = (id: number, period: string = '30d') => {
  const { authenticatedFetch } = useAuthenticatedFetch();
  const [data, setData] = useState<InstructorAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await authenticatedFetch(`/api/instructor/${id}/analytics?period=${period}`);
        const result = await response.json();

        if (response.ok && result.Result) {
          setData(result.Result);
        } else {
          setError(result.Message || 'Failed to fetch instructor analytics');
        }
      } catch (err) {
        setError('Failed to fetch instructor analytics');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchAnalytics();
    }
  }, [id, period, authenticatedFetch]);

  return { data, loading, error };
};

export const useFeaturedInstructors = (limit: number = 10) => {
  const { authenticatedFetch } = useAuthenticatedFetch();
  const [data, setData] = useState<Instructor[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeatured = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await authenticatedFetch(`/api/instructor/featured?limit=${limit}`);
        const result = await response.json();

        if (response.ok && result.Result) {
          setData(result.Result);
        } else {
          setError(result.Message || 'Failed to fetch featured instructors');
        }
      } catch (err) {
        setError('Failed to fetch featured instructors');
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, [limit, authenticatedFetch]);

  return { data, loading, error };
};
