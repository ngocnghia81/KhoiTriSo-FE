import { useState, useEffect } from 'react';
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch';

export interface AssignmentAnalytics {
  AssignmentId: number;
  AssignmentTitle: string;
  LessonId: number;
  LessonTitle?: string;
  CourseId: number;
  CourseTitle?: string;
  TotalSubmissions: number;
  UniqueUsers: number;
  TotalQuestions: number;
  MaxScore: number;
  PassingScore?: number;
  AverageScore?: number;
  MedianScore?: number;
  HighestScore?: number;
  LowestScore?: number;
  CompletionRate: number;
  PassRate: number;
  AverageTimeSpent: number;
  ScoreDistribution: {
    Excellent: number;
    Good: number;
    Average: number;
    Poor: number;
  };
  SubmissionTrend: Array<{
    Date: string;
    Amount: number;
  }>;
  QuestionPerformance: Array<{
    QuestionId: number;
    QuestionText?: string;
    TotalAttempts: number;
    CorrectAnswers: number;
    CorrectRate: number;
    AveragePointsEarned: number;
    MaxPoints: number;
  }>;
  AttemptStats: {
    TotalAttempts: number;
    CompletedAttempts: number;
    IncompleteAttempts: number;
    PassedAttempts: number;
    FailedAttempts: number;
    AverageAttemptsPerUser: number;
  };
}

export const useAssignmentAnalytics = (assignmentId: number | null) => {
  const { authenticatedFetch } = useAuthenticatedFetch();
  const [data, setData] = useState<AssignmentAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!assignmentId) {
      setData(null);
      return;
    }

    const fetchAnalytics = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await authenticatedFetch(`/api/analytics/assignments/${assignmentId}`);
        const result = await response.json();
        
        if (response.ok && result.Result) {
          setData(result.Result);
        } else {
          setError(result.Message || 'Failed to fetch assignment analytics');
        }
      } catch (err) {
        setError('Failed to fetch assignment analytics');
        console.error('Error fetching assignment analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [assignmentId, authenticatedFetch]);

  return { data, loading, error };
};

