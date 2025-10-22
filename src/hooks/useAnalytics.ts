import { useState, useEffect } from 'react';
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch';

export interface ChartPoint {
  Date: string;
  Amount: number;
}

export interface TopCourse {
  Id: number;
  Title: string;
  Enrollments: number;
}

export interface TopBook {
  Id: number;
  Title: string;
  Sales: number;
}

export interface TopLearningPath {
  Id: number;
  Title: string;
  Enrollments: number;
}

export interface DashboardAnalytics {
  TotalUsers: number;
  ActiveUsers: number;
  NewRegistrations: number;
  TotalCourses: number;
  TotalBooks: number;
  TotalLearningPaths: number;
  TotalRevenue: number;
  RevenueGrowth: number;
  UserGrowth: ChartPoint[];
  RevenueChart: ChartPoint[];
  TopCourses: TopCourse[];
  TopBooks: TopBook[];
  TopLearningPaths: TopLearningPath[];
}

export const useAnalytics = (period: string = '30d') => {
  const { authenticatedFetch } = useAuthenticatedFetch();
  const [data, setData] = useState<DashboardAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await authenticatedFetch(`/api/analytics/dashboard?period=${period}`);
        const result = await response.json();
        
        if (response.ok && result.Result) {
          setData(result.Result);
        } else {
          setError(result.Message || 'Failed to fetch analytics');
        }
      } catch (err) {
        setError('Failed to fetch analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [period, authenticatedFetch]);

  return { data, loading, error };
};





