'use client';

import { useState, useEffect } from 'react';
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch';
import { safeJsonParse, isSuccessfulResponse, extractResult, extractMessage } from '@/utils/apiHelpers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DocumentTextIcon, 
  ClockIcon, 
  CheckCircleIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleIconSolid } from '@heroicons/react/24/solid';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import Link from 'next/link';
import { toast } from 'sonner';

interface Assignment {
  id: number;
  lessonId: number;
  title: string;
  description: string;
  maxScore: number;
  timeLimit?: number;
  maxAttempts: number;
  dueDate?: string;
  isPublished: boolean;
  passingScore?: number;
  userAttempts?: Array<{
    id: number;
    score?: number;
    isCompleted: boolean;
    startedAt: string;
  }>;
}

interface AssignmentListProps {
  lessonId: number;
  courseId: number;
}

export default function AssignmentList({ lessonId, courseId }: AssignmentListProps) {
  const { authenticatedFetch } = useAuthenticatedFetch();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAssignments();
  }, [lessonId]);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await authenticatedFetch(`/api/assignments?lessonId=${lessonId}&isPublished=true&page=1&pageSize=100`);
      const result = await safeJsonParse(response);

      if (isSuccessfulResponse(result)) {
        const data = extractResult(result);
        let assignmentsArray = [];
        
        if (Array.isArray(data)) {
          assignmentsArray = data;
        } else if (data?.Items || data?.items) {
          assignmentsArray = data.Items || data.items;
        }

        const transformedAssignments = assignmentsArray.map((a: any) => ({
          id: a.Id || a.id,
          lessonId: a.LessonId || a.lessonId,
          title: a.Title || a.title,
          description: a.Description || a.description,
          maxScore: a.MaxScore || a.maxScore || 0,
          timeLimit: a.TimeLimit || a.timeLimit,
          maxAttempts: a.MaxAttempts || a.maxAttempts || 1,
          dueDate: a.DueDate || a.dueDate,
          isPublished: a.IsPublished ?? a.isPublished ?? false,
          passingScore: a.PassingScore || a.passingScore,
          userAttempts: (a.UserAttempts || a.userAttempts || []).map((ua: any) => ({
            id: ua.Id || ua.id,
            score: ua.Score || ua.score,
            isCompleted: ua.IsCompleted ?? ua.isCompleted ?? false,
            startedAt: ua.StartedAt || ua.startedAt,
          })),
        }));

        setAssignments(transformedAssignments);
      } else {
        setError(extractMessage(result) || 'Không thể tải danh sách bài tập');
      }
    } catch (err) {
      console.error('Error fetching assignments:', err);
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return null;
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: vi });
    } catch {
      return dateString;
    }
  };

  const getBestScore = (assignment: Assignment) => {
    if (!assignment.userAttempts || assignment.userAttempts.length === 0) return null;
    const scores = assignment.userAttempts
      .filter(a => a.isCompleted && a.score !== null && a.score !== undefined)
      .map(a => a.score!);
    return scores.length > 0 ? Math.max(...scores) : null;
  };

  const getAttemptCount = (assignment: Assignment) => {
    return assignment.userAttempts?.length || 0;
  };

  const canAttempt = (assignment: Assignment) => {
    const attemptCount = getAttemptCount(assignment);
    return attemptCount < assignment.maxAttempts;
  };

  const isPassed = (assignment: Assignment) => {
    const bestScore = getBestScore(assignment);
    if (bestScore === null || !assignment.passingScore) return null;
    return bestScore >= assignment.passingScore;
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Đang tải bài tập...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="text-red-600 text-center">
            <p className="font-medium">Lỗi tải bài tập</p>
            <p className="text-sm mt-1">{error}</p>
            <Button 
              onClick={fetchAssignments} 
              variant="outline" 
              className="mt-4 border-red-300 text-red-600 hover:bg-red-100"
            >
              Thử lại
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (assignments.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Chưa có bài tập nào cho bài học này</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {assignments.map((assignment) => {
        const bestScore = getBestScore(assignment);
        const attemptCount = getAttemptCount(assignment);
        const passed = isPassed(assignment);
        const canDo = canAttempt(assignment);
        const isOverdue = assignment.dueDate && new Date(assignment.dueDate) < new Date();

        return (
          <Card key={assignment.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-2">{assignment.title}</CardTitle>
                  {assignment.description && (
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                      {assignment.description}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                    <Badge variant="outline" className="text-xs">
                      Điểm tối đa: {assignment.maxScore}
                    </Badge>
                    {assignment.passingScore && (
                      <Badge variant="outline" className="text-xs">
                        Điểm đạt: {assignment.passingScore}
                      </Badge>
                    )}
                    {assignment.timeLimit && (
                      <span className="flex items-center gap-1">
                        <ClockIcon className="h-4 w-4" />
                        {assignment.timeLimit} phút
                      </span>
                    )}
                    <span>Số lần làm: {attemptCount}/{assignment.maxAttempts}</span>
                    {assignment.dueDate && (
                      <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
                        Hạn nộp: {formatDate(assignment.dueDate)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 ml-4">
                  {bestScore !== null && (
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Điểm cao nhất</div>
                      <div className={`text-2xl font-bold ${passed ? 'text-green-600' : 'text-blue-600'}`}>
                        {bestScore}/{assignment.maxScore}
                      </div>
                    </div>
                  )}
                  {passed === true && (
                    <Badge className="bg-green-600 text-white">
                      <CheckCircleIconSolid className="h-3 w-3 mr-1" />
                      Đã đạt
                    </Badge>
                  )}
                  {passed === false && (
                    <Badge variant="outline" className="border-orange-300 text-orange-700">
                      Chưa đạt
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {!canDo && (
                    <Badge variant="outline" className="text-xs text-gray-500">
                      Đã hết lượt làm bài
                    </Badge>
                  )}
                  {isOverdue && (
                    <Badge variant="outline" className="text-xs text-red-600 border-red-300">
                      Đã quá hạn
                    </Badge>
                  )}
                </div>
                <Button
                  asChild
                  variant={canDo ? "default" : "outline"}
                  disabled={!canDo}
                  className={canDo ? "bg-blue-600 hover:bg-blue-700" : ""}
                >
                  <Link href={`/courses/${courseId}/lessons/${lessonId}/assignments/${assignment.id}`}>
                    {bestScore !== null ? 'Xem lại' : 'Làm bài'}
                    <ArrowRightIcon className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
