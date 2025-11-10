import { useState, useEffect } from 'react';
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch';

export interface UserRoleDistribution {
  Students: number;
  Instructors: number;
  Admins: number;
}

export interface AuthProviderStats {
  Provider: string;
  Count: number;
  Percentage: number;
}

export interface ChartPoint {
  Date: string;
  Amount: number;
}

export interface TopActiveUser {
  UserId: number;
  Username: string;
  FullName?: string;
  Avatar?: string;
  ActivityCount: number;
  LastActiveAt?: string;
}

export interface EmailVerificationStats {
  Verified: number;
  Unverified: number;
  VerificationRate: number;
}

export interface GenderDistribution {
  Male: number;
  Female: number;
  Other: number;
  NotSpecified: number;
}

export interface AgeGroupStats {
  AgeGroup: string;
  Count: number;
  Percentage: number;
}

export interface UserAnalytics {
  TotalUsers: number;
  ActiveUsers: number;
  InactiveUsers: number;
  NewUsersThisPeriod: number;
  UserGrowthRate: number;
  RoleDistribution: UserRoleDistribution;
  AuthProviderStats: AuthProviderStats[];
  RegistrationTrend: ChartPoint[];
  ActivityTrend: ChartPoint[];
  TopActiveUsers: TopActiveUser[];
  EmailVerificationStats: EmailVerificationStats;
  GenderDistribution: GenderDistribution;
  AgeGroupStats: AgeGroupStats[];
}

export const useUserAnalytics = (period: string = '30d') => {
  const { authenticatedFetch } = useAuthenticatedFetch();
  const [data, setData] = useState<UserAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserAnalytics = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await authenticatedFetch(`/api/analytics/users?period=${period}`);
        const result = await response.json();
        
        if (response.ok && result.Result) {
          setData(result.Result);
        } else {
          setError(result.Message || 'Failed to fetch user analytics');
        }
      } catch (err) {
        setError('Failed to fetch user analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchUserAnalytics();
  }, [period, authenticatedFetch]);

  return { data, loading, error };
};
