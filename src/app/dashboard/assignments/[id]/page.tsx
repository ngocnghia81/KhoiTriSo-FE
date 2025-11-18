'use client';

import { useParams } from 'next/navigation';
import React from 'react';
import { useAssignment, useAssignmentResults, useAssignmentQuestions, useRedistributePoints, RedistributePointsRequest } from '@/hooks/useAssignments';
import Link from 'next/link';
import { ArrowLeft, Info, FileQuestion, ClipboardList, BarChart3, RefreshCw, X } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AssignmentQuestionManager } from '@/components/AssignmentQuestionManager';
import { AssignmentSubmissions } from '@/components/AssignmentSubmissions';

export default function AssignmentDetailPage() {
  const params = useParams();
  const id = params?.id ? parseInt(params.id as string) : 0;

  const { assignment, loading, error, refetch: refetchAssignment } = useAssignment(id);
  const { data: results, loading: rLoading, refetch: refetchResults } = useAssignmentResults(id);
  const { questions, refetch: refetchQuestions } = useAssignmentQuestions(id);
  const { redistributePoints, loading: redistributing } = useRedistributePoints();
  const [showRedistributeModal, setShowRedistributeModal] = React.useState(false);
  const [questionPoints, setQuestionPoints] = React.useState<Record<number, number>>({});
  const [pointsByType, setPointsByType] = React.useState<Record<number, number>>({
    0: 0,
    1: 0,
    2: 0,
  });

  // Load MathJax for MathML rendering
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const w = window as any;
    if (!w.MathJax) {
      w.MathJax = {
        loader: { load: ['input/mml', 'output/chtml'] },
        options: {
          renderActions: { addMenu: [0, '', ''] },
          skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code'],
          ignoreHtmlClass: 'tex2jax_ignore',
          processHtmlClass: 'tex2jax_process',
        },
        chtml: { scale: 1, displayAlign: 'center' },
        startup: {
          ready: () => {
            if (w.MathJax && w.MathJax.startup) {
              w.MathJax.startup.defaultReady && w.MathJax.startup.defaultReady();
            }
          },
        },
      };
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/mml-chtml.js';
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);

  // Typeset whenever content changes
  React.useEffect(() => {
    const w = window as any;
    if (w && w.MathJax && typeof w.MathJax.typesetPromise === 'function') {
      w.MathJax.typesetPromise?.();
    }
  }, [assignment]);

  const questionCountsByType = React.useMemo(() => {
    const counts: Record<number, number> = { 0: 0, 1: 0, 2: 0 };
    questions.forEach((q: any) => {
      const questionType = q.QuestionType ?? q.questionType;
      if (questionType !== null && questionType !== undefined && questionType !== 3 && questionType >= 0 && questionType <= 2) {
        counts[questionType] = (counts[questionType] || 0) + 1;
      }
    });
    return counts;
  }, [questions]);

  React.useEffect(() => {
    if (showRedistributeModal && questions.length > 0) {
      const initialPoints: Record<number, number> = {};
      questions.forEach((q: any) => {
        const questionId = q.Id ?? q.id;
        const questionType = q.QuestionType ?? q.questionType;
        if (questionType !== null && questionType !== undefined && questionType !== 3) {
          initialPoints[questionId] = q.DefaultPoints ?? q.defaultPoints ?? 0;
        }
      });
      setQuestionPoints(initialPoints);

      const initialPointsByType: Record<number, number> = { 0: 0, 1: 0, 2: 0 };
      questions.forEach((q: any) => {
        const questionType = q.QuestionType ?? q.questionType;
        if (questionType !== null && questionType !== undefined && questionType !== 3 && questionType >= 0 && questionType <= 2) {
          const points = q.DefaultPoints ?? q.defaultPoints ?? 0;
          initialPointsByType[questionType] = (initialPointsByType[questionType] || 0) + points;
        }
      });
      setPointsByType(initialPointsByType);
    }
  }, [showRedistributeModal, questions]);

  React.useEffect(() => {
    if (showRedistributeModal && questions.length > 0) {
      const counts: Record<number, number> = { 0: 0, 1: 0, 2: 0 };
      questions.forEach((q: any) => {
        const questionType = q.QuestionType ?? q.questionType;
        if (questionType !== null && questionType !== undefined && questionType !== 3 && questionType >= 0 && questionType <= 2) {
          counts[questionType] = (counts[questionType] || 0) + 1;
        }
      });

      const hasAnyPoints = Object.values(pointsByType).some(p => p > 0);
      if (hasAnyPoints) {
        const updatedPoints: Record<number, number> = {};
        questions.forEach((q: any) => {
          const questionId = q.Id ?? q.id;
          const questionType = q.QuestionType ?? q.questionType;
          if (questionType !== null && questionType !== undefined && questionType !== 3 && questionType >= 0 && questionType <= 2) {
            const totalPointsForType = pointsByType[questionType] || 0;
            const countForType = counts[questionType] || 1;
            const pointsPerQuestion = countForType > 0 ? totalPointsForType / countForType : 0;
            updatedPoints[questionId] = pointsPerQuestion > 0 ? pointsPerQuestion : 0;
          }
        });
        setQuestionPoints(prev => {
          const hasChanges = Object.keys(updatedPoints).some(id => {
            const qId = parseInt(id);
            return Math.abs((prev[qId] || 0) - (updatedPoints[qId] || 0)) >= 0.001;
          });
          return hasChanges ? { ...prev, ...updatedPoints } : prev;
        });
      }
    }
  }, [pointsByType, showRedistributeModal, questions]);

  const actualQuestions = React.useMemo(() => {
    return questions.filter((q: any) => {
      const questionType = q.QuestionType ?? q.questionType;
      return questionType !== 3 && questionType !== null && questionType !== undefined;
    });
  }, [questions]);

  const totalPoints = React.useMemo(() => {
    return Object.values(questionPoints).reduce((sum, p) => sum + (p || 0), 0);
  }, [questionPoints]);

  const totalPointsByType = React.useMemo(() => {
    return Object.values(pointsByType).reduce((sum, p) => sum + (p || 0), 0);
  }, [pointsByType]);

  const handleRedistributePoints = async () => {
    const questionPointsList = actualQuestions.map((q: any) => {
      const questionId = q.Id ?? q.id;
      return {
        QuestionId: questionId,
        Points: questionPoints[questionId] ?? 0
      };
    });

    const request: RedistributePointsRequest = {
      QuestionPoints: questionPointsList
    };

    const result = await redistributePoints(id, request);
    if (result.success) {
      alert('Chia điểm lại thành công!');
      setShowRedistributeModal(false);
      refetchAssignment();
      refetchResults();
      refetchQuestions();
    } else {
      alert(result.error || 'Chia điểm lại thất bại');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải thông tin bài tập...</p>
        </div>
      </div>
    );
  }

  if (error || !assignment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <p className="text-red-600 text-center">{error || 'Không tìm thấy bài tập'}</p>
            <div className="mt-4 text-center">
              <Link href="/dashboard/assignments" className="text-blue-600 hover:underline">
                Quay lại danh sách
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const showAnswersAfterLabels: Record<number, string> = {
    0: 'Sau khi nộp bài',
    1: 'Sau khi chấm',
    2: 'Không bao giờ'
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link 
            href="/dashboard/assignments" 
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại danh sách
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{assignment.title}</h1>
              {assignment.description && (
                <div
                  className="mt-2 prose prose-sm text-gray-600 max-w-none"
                  dangerouslySetInnerHTML={{ __html: assignment.description }}
                />
              )}
            </div>
            <div className="flex gap-2">
              <Badge variant={assignment.isPublished ? "default" : "secondary"}>
                {assignment.isPublished ? 'Đã xuất bản' : 'Chưa xuất bản'}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowRedistributeModal(true)}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Chia điểm lại
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Info className="w-4 h-4" />
              Tổng quan
            </TabsTrigger>
            <TabsTrigger value="questions" className="flex items-center gap-2">
              <FileQuestion className="w-4 h-4" />
              Câu hỏi
            </TabsTrigger>
            <TabsTrigger value="submissions" className="flex items-center gap-2">
              <ClipboardList className="w-4 h-4" />
              Bài nộp
            </TabsTrigger>
            <TabsTrigger value="results" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Kết quả
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Thông tin cơ bản</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Điểm tối đa:</span>
                    <span className="font-medium">{assignment.maxScore}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Số lần làm bài:</span>
                    <span className="font-medium">{assignment.maxAttempts}</span>
                  </div>
                  {assignment.timeLimit && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Thời gian:</span>
                      <span className="font-medium">{assignment.timeLimit} phút</span>
                    </div>
                  )}
                  {assignment.passingScore !== null && assignment.passingScore !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Điểm đạt:</span>
                      <span className="font-medium">{assignment.passingScore}%</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Cài đặt</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Hiển thị đáp án:</span>
                    <span className="text-sm">
                      {showAnswersAfterLabels[assignment.showAnswersAfter] || 'Không xác định'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Xáo trộn câu hỏi:</span>
                    <Badge variant={assignment.shuffleQuestions ? "default" : "outline"}>
                      {assignment.shuffleQuestions ? 'Có' : 'Không'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Xáo trộn đáp án:</span>
                    <Badge variant={assignment.shuffleOptions ? "default" : "outline"}>
                      {assignment.shuffleOptions ? 'Có' : 'Không'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Thời gian</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {assignment.dueDate && (
                    <div>
                      <span className="text-sm text-gray-600">Hạn nộp:</span>
                      <p className="font-medium mt-1">
                        {new Date(assignment.dueDate).toLocaleDateString('vi-VN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  )}
                  <div>
                    <span className="text-sm text-gray-600">Tạo lúc:</span>
                    <p className="text-sm mt-1">
                      {new Date(assignment.createdAt).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Cập nhật:</span>
                    <p className="text-sm mt-1">
                      {new Date(assignment.updatedAt).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {assignment.lesson && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Bài học liên quan</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-medium">{assignment.lesson.title}</p>
                  {assignment.lesson.description && (
                    <p className="text-sm text-gray-600 mt-1">{assignment.lesson.description}</p>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Questions Tab */}
          <TabsContent value="questions">
            <AssignmentQuestionManager assignmentId={id} />
          </TabsContent>

          {/* Submissions Tab */}
          <TabsContent value="submissions">
            <AssignmentSubmissions assignmentId={id} />
          </TabsContent>

          {/* Results Tab */}
          <TabsContent value="results">
            <Card>
              <CardHeader>
                <CardTitle>Thống kê kết quả</CardTitle>
                <CardDescription>Xem tổng quan về kết quả của bài tập này</CardDescription>
              </CardHeader>
              <CardContent>
                {rLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-sm text-gray-600">Đang tải...</p>
                  </div>
                ) : results ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-gray-600">Tổng số câu hỏi</p>
                        <p className="text-2xl font-bold text-blue-600 mt-1">
                          {results.TotalQuestions || results.totalQuestions || 0}
                        </p>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg">
                        <p className="text-sm text-gray-600">Tổng số lần làm</p>
                        <p className="text-2xl font-bold text-green-600 mt-1">
                          {results.TotalAttempts || results.totalAttempts || 0}
                        </p>
                      </div>
                      <div className="p-4 bg-yellow-50 rounded-lg">
                        <p className="text-sm text-gray-600">Điểm trung bình</p>
                        <p className="text-2xl font-bold text-yellow-600 mt-1">
                          {results.AverageScore || results.averageScore 
                            ? `${(results.AverageScore || results.averageScore).toFixed(1)}/${results.MaxScore || results.maxScore || 100}`
                            : 'N/A'}
                        </p>
                      </div>
                      <div className="p-4 bg-purple-50 rounded-lg">
                        <p className="text-sm text-gray-600">Điểm cao nhất</p>
                        <p className="text-2xl font-bold text-purple-600 mt-1">
                          {(() => {
                            const best = (results.BestScore ?? results.bestScore);
                            const max = (results.MaxScore ?? results.maxScore ?? 100);
                            return typeof best === 'number' ? `${best.toFixed(1)}/${max}` : 'N/A';
                          })()}
                        </p>
                      </div>
                    </div>

                    {results.PassingScore !== null && results.PassingScore !== undefined && (
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">Tỷ lệ đạt:</p>
                        <p className="text-lg font-semibold">
                          {results.IsPassed || results.isPassed ? (
                            <Badge className="bg-green-100 text-green-700">Đạt</Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-700">Chưa đạt</Badge>
                          )}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Điểm đạt yêu cầu: {results.PassingScore || results.passingScore}%
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">Chưa có dữ liệu kết quả</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {showRedistributeModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-6 border w-full max-w-4xl shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Chia điểm lại cho câu hỏi</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowRedistributeModal(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="mb-6 p-4 bg-white border rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Phân bổ điểm theo loại câu hỏi</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Trắc nghiệm (Loại 0)
                    <span className="text-xs text-gray-500 ml-1">({questionCountsByType[0]} câu)</span>
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={pointsByType[0] || ''}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value) || 0;
                      setPointsByType(prev => ({ ...prev, 0: value }));
                    }}
                    className="w-full"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Đúng/Sai (Loại 1)
                    <span className="text-xs text-gray-500 ml-1">({questionCountsByType[1]} câu)</span>
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={pointsByType[1] || ''}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value) || 0;
                      setPointsByType(prev => ({ ...prev, 1: value }));
                    }}
                    className="w-full"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tự luận ngắn (Loại 2)
                    <span className="text-xs text-gray-500 ml-1">({questionCountsByType[2]} câu)</span>
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={pointsByType[2] || ''}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value) || 0;
                      setPointsByType(prev => ({ ...prev, 2: value }));
                    }}
                    className="w-full"
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <span className="font-medium">Tổng điểm: </span>
                  <span className={Math.abs(totalPointsByType - 10) < 0.01 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                    {totalPointsByType.toFixed(2)} / 10.00
                  </span>
                </div>
                {Math.abs(totalPointsByType - 10) >= 0.01 && (
                  <div className="text-xs text-red-600">
                    Tổng điểm phải bằng 10
                  </div>
                )}
              </div>
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm">
                  <span className="font-medium">Tổng điểm (từng câu): </span>
                  <span className={Math.abs(totalPoints - 10) < 0.01 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                    {totalPoints.toFixed(2)} / 10.00
                  </span>
                </div>
                {Math.abs(totalPoints - 10) >= 0.01 && (
                  <div className="text-xs text-red-600">
                    Tổng điểm phải bằng 10
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3 mb-6 max-h-[60vh] overflow-y-auto">
              {actualQuestions.map((q: any, index: number) => {
                const questionId = q.Id ?? q.id;
                const questionType = q.QuestionType ?? q.questionType;
                const questionContent = q.QuestionContent ?? q.questionContent ?? '';
                const questionNumber = index + 1;

                return (
                  <Card key={questionId} className="border-l-4 border-l-blue-500">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium">Câu {questionNumber}</span>
                            <Badge variant="outline">
                              {questionType === 0 ? 'Trắc nghiệm' : questionType === 1 ? 'Đúng/Sai' : questionType === 2 ? 'Tự luận ngắn' : `Loại ${questionType}`}
                            </Badge>
                          </div>
                          <div 
                            className="prose prose-sm max-w-none text-sm"
                            dangerouslySetInnerHTML={{ __html: questionContent.substring(0, 200) + (questionContent.length > 200 ? '...' : '') }}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            step="0.1"
                            min="0"
                            max="10"
                            className="w-24"
                            value={questionPoints[questionId] ?? ''}
                            onChange={(e) => {
                              const value = parseFloat(e.target.value) || 0;
                              setQuestionPoints(prev => ({
                                ...prev,
                                [questionId]: value
                              }));
                            }}
                            placeholder="0"
                          />
                          <span className="text-sm text-gray-500">điểm</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowRedistributeModal(false)}>
                Hủy
              </Button>
              <Button 
                onClick={handleRedistributePoints} 
                disabled={redistributing || Math.abs(totalPoints - 10) >= 0.01}
              >
                {redistributing ? 'Đang lưu...' : 'Lưu điểm'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


