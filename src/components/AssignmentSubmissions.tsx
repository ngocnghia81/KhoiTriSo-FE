'use client';

import React, { useState } from 'react';
import { Eye, CheckCircle2, XCircle, Clock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  useAssignmentSubmissions,
  useGradeAssignment,
  AssignmentGradingRequest,
  QuestionGradingRequest
} from '@/hooks/useAssignments';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface AssignmentSubmissionsProps {
  assignmentId: number;
}

interface GradingModalProps {
  submission: any;
  questions: any[];
  onClose: () => void;
  onSave: (data: AssignmentGradingRequest) => Promise<void>;
  loading?: boolean;
}

function GradingModal({ submission, questions, onClose, onSave, loading }: GradingModalProps) {
  const [feedback, setFeedback] = useState(submission.Feedback || submission.feedback || '');
  const [questionGrades, setQuestionGrades] = useState<Record<number, { points: number; feedback: string }>>(() => {
    const grades: Record<number, { points: number; feedback: string }> = {};
    submission.Answers?.forEach((answer: any) => {
      const questionId = answer.QuestionId || answer.questionId;
      if (questionId) {
        grades[questionId] = {
          points: answer.PointsEarned || answer.pointsEarned || 0,
          feedback: answer.Feedback || answer.feedback || ''
        };
      }
    });
    return grades;
  });

  const handleGradeChange = (questionId: number, points: number) => {
    setQuestionGrades(prev => ({
      ...prev,
      [questionId]: {
        points,
        feedback: prev[questionId]?.feedback || ''
      }
    }));
  };

  const handleFeedbackChange = (questionId: number, feedback: string) => {
    setQuestionGrades(prev => ({
      ...prev,
      [questionId]: {
        points: prev[questionId]?.points || 0,
        feedback
      }
    }));
  };

  const handleSubmit = async () => {
    const gradingData: AssignmentGradingRequest = {
      AttemptId: submission.Id || submission.id,
      QuestionGrades: questions.map(q => {
        const questionId = q.Id || q.id;
        const grade = questionGrades[questionId] || { points: 0, feedback: '' };
        return {
          QuestionId: questionId,
          PointsEarned: grade.points,
          Feedback: grade.feedback || undefined
        };
      }),
      Feedback: feedback || undefined
    };

    await onSave(gradingData);
  };

  const getAnswerForQuestion = (questionId: number) => {
    return submission.Answers?.find((a: any) => (a.QuestionId || a.questionId) === questionId);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-6 border w-full max-w-4xl shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Chấm điểm bài nộp
          </h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ✕
          </Button>
        </div>

        <div className="space-y-4 mb-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Lần làm:</span> {submission.AttemptNumber || submission.attemptNumber}
            </div>
            <div>
              <span className="font-medium">Thời gian:</span>{' '}
              {submission.TimeSpent ? `${Math.floor(submission.TimeSpent / 60)} phút` : 'N/A'}
            </div>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          {questions.map((q: any, index: number) => {
            const questionId = q.Id || q.id;
            const answer = getAnswerForQuestion(questionId);
            const grade = questionGrades[questionId] || { points: 0, feedback: '' };
            const maxPoints = q.DefaultPoints || q.defaultPoints || 1;

            return (
              <Card key={questionId} className="border-l-4 border-l-blue-500">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">
                      Câu {index + 1}: {q.QuestionContent || q.questionContent}
                    </CardTitle>
                    <Badge variant="outline">
                      Tối đa: {maxPoints} điểm
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {answer && (
                    <div>
                      <p className="text-sm font-medium mb-2">Câu trả lời:</p>
                      <div className="p-3 bg-gray-50 rounded border">
                        <p className="text-sm">
                          {answer.AnswerText || answer.answerText || 
                           answer.OptionId ? `Đã chọn đáp án ${answer.OptionId}` : 'Không có câu trả lời'}
                        </p>
                        {answer.IsCorrect !== undefined && (
                          <div className="mt-2">
                            {answer.IsCorrect || answer.isCorrect ? (
                              <Badge className="bg-green-100 text-green-700">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Đúng
                              </Badge>
                            ) : (
                              <Badge className="bg-red-100 text-red-700">
                                <XCircle className="w-3 h-3 mr-1" />
                                Sai
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Điểm số (0 - {maxPoints})
                      </label>
                      <Input
                        type="number"
                        value={grade.points}
                        onChange={(e) => handleGradeChange(questionId, parseFloat(e.target.value) || 0)}
                        min="0"
                        max={maxPoints}
                        step="0.1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Nhận xét
                      </label>
                      <Textarea
                        value={grade.feedback}
                        onChange={(e) => handleFeedbackChange(questionId, e.target.value)}
                        placeholder="Nhận xét cho câu trả lời này..."
                        rows={2}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            Nhận xét tổng thể
          </label>
          <Textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Nhận xét chung về bài làm..."
            rows={3}
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Đang lưu...' : 'Lưu điểm'}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function AssignmentSubmissions({ assignmentId }: AssignmentSubmissionsProps) {
  const { data, loading, error, refetch } = useAssignmentSubmissions(assignmentId, 1, 50);
  const { gradeAssignment, loading: grading } = useGradeAssignment();
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);

  const submissions = data?.Items || data?.items || data?.Result || [];

  const handleGrade = async (submission: any) => {
    // Fetch questions for this submission
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/assignments/${assignmentId}/questions`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await response.json();
      if (response.ok && result.Result) {
        setQuestions(Array.isArray(result.Result) ? result.Result : []);
        setSelectedSubmission(submission);
      }
    } catch (err) {
      console.error('Error fetching questions:', err);
    }
  };

  const handleSaveGrade = async (gradingData: AssignmentGradingRequest) => {
    const result = await gradeAssignment(assignmentId, gradingData);
    if (result.success) {
      setSelectedSubmission(null);
      refetch();
    } else {
      alert(result.error || 'Chấm điểm thất bại');
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const getScoreColor = (score?: number, maxScore?: number) => {
    if (!score || !maxScore) return 'text-gray-600';
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-sm text-gray-600">Đang tải bài nộp...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-6">
          <p className="text-red-600">Lỗi: {error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Bài nộp của học sinh</h2>
        <p className="text-sm text-gray-600 mt-1">
          Tổng số bài nộp: {submissions.length}
        </p>
      </div>

      {submissions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">Chưa có bài nộp nào.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lần làm</TableHead>
                  <TableHead>Người làm</TableHead>
                  <TableHead>Bắt đầu</TableHead>
                  <TableHead>Hoàn thành</TableHead>
                  <TableHead>Điểm số</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map((submission: any) => {
                  const attemptId = submission.Id || submission.id;
                  const userId = submission.UserId || submission.userId;
                  const score = submission.Score || submission.score;
                  const maxScore = submission.MaxScore || submission.maxScore || 100;
                  const isCompleted = submission.IsCompleted || submission.isCompleted;
                  const isGraded = submission.IsGraded || submission.isGraded;

                  return (
                    <TableRow key={attemptId}>
                      <TableCell>
                        {submission.AttemptNumber || submission.attemptNumber || 1}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">
                            User #{userId}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDate(submission.StartedAt || submission.startedAt)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {submission.CompletedAt || submission.completedAt 
                          ? formatDate(submission.CompletedAt || submission.completedAt)
                          : <span className="text-gray-400">Chưa hoàn thành</span>}
                      </TableCell>
                      <TableCell>
                        <span className={`font-medium ${getScoreColor(score, maxScore)}`}>
                          {score !== null && score !== undefined 
                            ? `${score}/${maxScore}` 
                            : 'Chưa chấm'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {isCompleted ? (
                            <Badge className="bg-green-100 text-green-700">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Hoàn thành
                            </Badge>
                          ) : (
                            <Badge variant="outline">
                              <Clock className="w-3 h-3 mr-1" />
                              Đang làm
                            </Badge>
                          )}
                          {isGraded && (
                            <Badge variant="secondary">Đã chấm</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {isCompleted && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleGrade(submission)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            {isGraded ? 'Xem/Sửa' : 'Chấm điểm'}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {selectedSubmission && questions.length > 0 && (
        <GradingModal
          submission={selectedSubmission}
          questions={questions}
          onClose={() => setSelectedSubmission(null)}
          onSave={handleSaveGrade}
          loading={grading}
        />
      )}
    </div>
  );
}
