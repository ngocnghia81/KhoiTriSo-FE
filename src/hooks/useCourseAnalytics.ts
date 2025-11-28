import { useState, useEffect } from 'react';
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch';

export interface ChartPoint {
  Date: string;
  Amount: number;
}

export interface ProgressDistribution {
  '0-25': number;
  '26-50': number;
  '51-75': number;
  '76-100': number;
}

export interface LessonEngagement {
  LessonId: number;
  CompletionRate: number;
}

export interface AssignmentPerformance {
  AssignmentId: number;
  AverageScore: number;
  CompletionRate: number;
}

export interface CourseAnalytics {
  CourseId: number;
  TotalEnrollments: number;
  ActiveStudents: number;
  CompletionRate: number;
  AverageProgress: number;
  Rating: number;
  TotalRevenue: number;
  EnrollmentTrend: ChartPoint[];
  ProgressDistribution: ProgressDistribution;
  LessonEngagement: LessonEngagement[];
  AssignmentPerformance: AssignmentPerformance[];
}

export const useCourseAnalytics = (courseId: number | null, period: string = '30d') => {
  const { authenticatedFetch } = useAuthenticatedFetch();
  const [data, setData] = useState<CourseAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!courseId) {
      setData(null);
      return;
    }

    const fetchAnalytics = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await authenticatedFetch(`/api/analytics/courses/${courseId}?period=${period}`);
        const result = await response.json();
        
        if (response.ok && result.Result) {
          setData(result.Result);
        } else {
          setError(result.Message || 'Failed to fetch course analytics');
        }
      } catch (err) {
        setError('Failed to fetch course analytics');
        console.error('Error fetching course analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [courseId, period, authenticatedFetch]);

  return { data, loading, error };
};

