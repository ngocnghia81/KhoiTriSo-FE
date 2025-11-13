'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { forumApiService, ForumQuestion, ForumAnswer, ForumComment } from '@/services/forumApi';
import { useAuth } from '@/contexts/AuthContext';
import { 
  ArrowLeftIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ChatBubbleLeftRightIcon,
  EyeIcon,
  CheckCircleIcon,
  ClockIcon,
  TagIcon,
  BookmarkIcon,
  PencilIcon,
  TrashIcon,
  FlagIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolidIcon, BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';
import { RichTextEditor } from '@/components/RichTextEditor';

// Format time ago helper
const formatTimeAgo = (dateString: string): string => {
  try {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'vừa xong';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} tháng trước`;
    return `${Math.floor(diffInSeconds / 31536000)} năm trước`;
  } catch {
    return dateString;
  }
};

export default function QuestionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const questionId = params?.id as string;

  const [question, setQuestion] = useState<ForumQuestion | null>(null);
  const [answers, setAnswers] = useState<ForumAnswer[]>([]);
  const [comments, setComments] = useState<Record<string, ForumComment[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Answer form
  const [showAnswerForm, setShowAnswerForm] = useState(false);
  const [answerContent, setAnswerContent] = useState('');
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  
  // Comment forms
  const [showCommentForms, setShowCommentForms] = useState<Record<string, boolean>>({});
  const [commentContents, setCommentContents] = useState<Record<string, string>>({});
  const [submittingComments, setSubmittingComments] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (questionId) {
      loadQuestion();
      loadAnswers();
    }
  }, [questionId]);

  const loadQuestion = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await forumApiService.getQuestionById(questionId);
      setQuestion(data);
    } catch (err: any) {
      setError(err.message || 'Không thể tải câu hỏi');
      console.error('Error loading question:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadAnswers = async () => {
    try {
      const data = await forumApiService.getAnswers(questionId);
      setAnswers(data);
      
      // Load comments for each answer
      const commentsMap: Record<string, ForumComment[]> = {};
      for (const answer of data) {
        try {
          const answerComments = await forumApiService.getComments(2, answer.id); // 2 = Answer
          commentsMap[answer.id] = answerComments;
        } catch (err) {
          commentsMap[answer.id] = [];
        }
      }
      setComments(commentsMap);
      
      // Load comments for question
      try {
        const questionComments = await forumApiService.getComments(1, questionId); // 1 = Question
        commentsMap[questionId] = questionComments;
        setComments(commentsMap);
      } catch (err) {
        // Ignore
      }
    } catch (err: any) {
      console.error('Error loading answers:', err);
    }
  };

  const handleVote = async (targetId: string, targetType: number, voteType: number) => {
    if (!user?.id) {
      alert('Vui lòng đăng nhập để vote');
      return;
    }

    try {
      await forumApiService.vote({
        targetId,
        targetType,
        userId: parseInt(user.id) || 0,
        voteType,
      });
      await loadQuestion();
      await loadAnswers();
    } catch (err: any) {
      alert(err.message || 'Không thể vote');
    }
  };

  const handleAcceptAnswer = async (answerId: string) => {
    if (!user?.id || !question) {
      return;
    }

    if (parseInt(user.id) !== question.userId) {
      alert('Chỉ người đặt câu hỏi mới có thể chấp nhận câu trả lời');
      return;
    }

    try {
      await forumApiService.acceptAnswer(answerId);
      await loadQuestion();
      await loadAnswers();
    } catch (err: any) {
      alert(err.message || 'Không thể chấp nhận câu trả lời');
    }
  };

  const handleSubmitAnswer = async () => {
    if (!user?.id || !answerContent.trim()) {
      alert('Vui lòng nhập nội dung câu trả lời');
      return;
    }

    try {
      setSubmittingAnswer(true);
      await forumApiService.createAnswer(questionId, {
        content: answerContent,
        userId: parseInt(user.id) || 0,
        userName: user.name || 'User',
        userAvatar: user.avatar,
      });
      setAnswerContent('');
      setShowAnswerForm(false);
      await loadAnswers();
      await loadQuestion();
    } catch (err: any) {
      alert(err.message || 'Không thể gửi câu trả lời');
    } finally {
      setSubmittingAnswer(false);
    }
  };

  const handleSubmitComment = async (parentId: string, parentType: number) => {
    if (!user?.id || !commentContents[parentId]?.trim()) {
      alert('Vui lòng nhập nội dung bình luận');
      return;
    }

    try {
      setSubmittingComments(prev => ({ ...prev, [parentId]: true }));
      await forumApiService.createComment({
        parentId,
        parentType,
        content: commentContents[parentId],
        userId: parseInt(user.id) || 0,
        userName: user.name || 'User',
        userAvatar: user.avatar,
      });
      setCommentContents(prev => ({ ...prev, [parentId]: '' }));
      setShowCommentForms(prev => ({ ...prev, [parentId]: false }));
      await loadAnswers();
    } catch (err: any) {
      alert(err.message || 'Không thể gửi bình luận');
    } finally {
      setSubmittingComments(prev => ({ ...prev, [parentId]: false }));
    }
  };

  const handleDeleteQuestion = async () => {
    if (!confirm('Bạn có chắc chắn muốn xóa câu hỏi này?')) return;

    try {
      await forumApiService.deleteQuestion(questionId);
      router.push('/dashboard/forum/questions');
    } catch (err: any) {
      alert(err.message || 'Không thể xóa câu hỏi');
    }
  };

  const handleDeleteAnswer = async (answerId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa câu trả lời này?')) return;

    try {
      await forumApiService.deleteAnswer(answerId);
      await loadAnswers();
      await loadQuestion();
    } catch (err: any) {
      alert(err.message || 'Không thể xóa câu trả lời');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải câu hỏi...</p>
        </div>
      </div>
    );
  }

  if (error || !question) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Không tìm thấy câu hỏi'}</p>
          <Link
            href="/dashboard/forum/questions"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Quay lại danh sách
          </Link>
        </div>
      </div>
    );
  }

  const isQuestionOwner = user?.id && parseInt(user.id) === question.userId;
  const sortedAnswers = [...answers].sort((a, b) => {
    if (a.isAccepted) return -1;
    if (b.isAccepted) return 1;
    return b.voteCount - a.voteCount;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/dashboard/forum/questions"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Quay lại danh sách
          </Link>
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">{question.title}</h1>
            {isQuestionOwner && (
              <div className="flex gap-2">
                <Link
                  href={`/dashboard/forum/questions/${questionId}/edit`}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                >
                  <PencilIcon className="h-4 w-4" />
                </Link>
                <button
                  onClick={handleDeleteQuestion}
                  className="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Question */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex gap-4 p-6">
            {/* Vote Column */}
            <div className="flex flex-col items-center gap-2 min-w-[60px]">
              <button
                onClick={() => handleVote(question.id, 1, 1)}
                className="p-2 hover:bg-gray-100 rounded transition-colors"
                title="Upvote"
              >
                <ArrowUpIcon className="h-6 w-6 text-gray-400 hover:text-blue-600" />
              </button>
              <div className="text-2xl font-semibold text-gray-700">{question.voteCount}</div>
              <button
                onClick={() => handleVote(question.id, 1, -1)}
                className="p-2 hover:bg-gray-100 rounded transition-colors"
                title="Downvote"
              >
                <ArrowDownIcon className="h-6 w-6 text-gray-400 hover:text-red-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded transition-colors" title="Bookmark">
                <BookmarkIcon className="h-5 w-5 text-gray-400 hover:text-yellow-500" />
              </button>
            </div>

            {/* Content Column */}
            <div className="flex-1">
              <div 
                className="prose prose-sm max-w-none mb-4"
                dangerouslySetInnerHTML={{ __html: question.content }}
              />

              {/* Tags */}
              {question.tags && question.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {question.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-50 text-blue-700"
                    >
                      <TagIcon className="h-3 w-3 mr-1" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Meta */}
              <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-4">
                  <span>{question.userName}</span>
                  <span className="flex items-center gap-1">
                    <ClockIcon className="h-4 w-4" />
                    {formatTimeAgo(question.createdAt)}
                  </span>
                  {question.categoryName && (
                    <span className="px-2 py-1 bg-gray-100 rounded">{question.categoryName}</span>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <EyeIcon className="h-4 w-4" />
                    {question.viewCount} lượt xem
                  </span>
                  {question.isSolved && (
                    <span className="inline-flex items-center gap-1 text-green-600">
                      <CheckCircleSolidIcon className="h-4 w-4" />
                      Đã giải quyết
                    </span>
                  )}
                </div>
              </div>

              {/* Question Comments */}
              {comments[questionId] && comments[questionId].length > 0 && (
                <div className="mt-4 space-y-2">
                  {comments[questionId].map((comment) => (
                    <div key={comment.id} className="text-sm text-gray-600 pl-4 border-l-2 border-gray-200">
                      <div dangerouslySetInnerHTML={{ __html: comment.content }} />
                      <div className="mt-1 text-xs text-gray-500">
                        {comment.userName} • {formatTimeAgo(comment.createdAt)}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Comment to Question */}
              {user && (
                <div className="mt-4">
                  {showCommentForms[questionId] ? (
                    <div className="space-y-2">
                      <textarea
                        value={commentContents[questionId] || ''}
                        onChange={(e) => setCommentContents(prev => ({ ...prev, [questionId]: e.target.value }))}
                        placeholder="Thêm bình luận..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSubmitComment(questionId, 1)}
                          disabled={submittingComments[questionId]}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                        >
                          {submittingComments[questionId] ? 'Đang gửi...' : 'Gửi'}
                        </button>
                        <button
                          onClick={() => {
                            setShowCommentForms(prev => ({ ...prev, [questionId]: false }));
                            setCommentContents(prev => ({ ...prev, [questionId]: '' }));
                          }}
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                        >
                          Hủy
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowCommentForms(prev => ({ ...prev, [questionId]: true }))}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Thêm bình luận
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Answers */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-gray-900">
              {answers.length} {answers.length === 1 ? 'Câu trả lời' : 'Câu trả lời'}
            </h2>
            {!question.isSolved && user && (
              <button
                onClick={() => setShowAnswerForm(!showAnswerForm)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Trả lời
              </button>
            )}
          </div>

          {/* Answer Form */}
          {showAnswerForm && user && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Câu trả lời của bạn</h3>
              <RichTextEditor
                value={answerContent}
                onChange={setAnswerContent}
                placeholder="Nhập câu trả lời của bạn..."
              />
              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleSubmitAnswer}
                  disabled={submittingAnswer}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {submittingAnswer ? 'Đang gửi...' : 'Gửi câu trả lời'}
                </button>
                <button
                  onClick={() => {
                    setShowAnswerForm(false);
                    setAnswerContent('');
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                >
                  Hủy
                </button>
              </div>
            </div>
          )}

          {/* Answers List */}
          <div className="space-y-4">
            {sortedAnswers.map((answer) => {
              const isAnswerOwner = user?.id && parseInt(user.id) === answer.userId;
              return (
                <div
                  key={answer.id}
                  className={`bg-white rounded-lg shadow-sm border ${
                    answer.isAccepted ? 'border-green-500' : 'border-gray-200'
                  }`}
                >
                  <div className="flex gap-4 p-6">
                    {/* Vote Column */}
                    <div className="flex flex-col items-center gap-2 min-w-[60px]">
                      <button
                        onClick={() => handleVote(answer.id, 2, 1)}
                        className="p-2 hover:bg-gray-100 rounded transition-colors"
                        title="Upvote"
                      >
                        <ArrowUpIcon className="h-6 w-6 text-gray-400 hover:text-blue-600" />
                      </button>
                      <div className="text-2xl font-semibold text-gray-700">{answer.voteCount}</div>
                      <button
                        onClick={() => handleVote(answer.id, 2, -1)}
                        className="p-2 hover:bg-gray-100 rounded transition-colors"
                        title="Downvote"
                      >
                        <ArrowDownIcon className="h-6 w-6 text-gray-400 hover:text-red-600" />
                      </button>
                      {isQuestionOwner && !question.isSolved && (
                        <button
                          onClick={() => handleAcceptAnswer(answer.id)}
                          className={`p-2 rounded transition-colors ${
                            answer.isAccepted
                              ? 'bg-green-100 text-green-600'
                              : 'hover:bg-gray-100 text-gray-400'
                          }`}
                          title="Chấp nhận câu trả lời"
                        >
                          <CheckCircleIcon className="h-6 w-6" />
                        </button>
                      )}
                      {answer.isAccepted && (
                        <div className="text-green-600 font-semibold text-xs">Đã chấp nhận</div>
                      )}
                    </div>

                    {/* Content Column */}
                    <div className="flex-1">
                      <div 
                        className="prose prose-sm max-w-none mb-4"
                        dangerouslySetInnerHTML={{ __html: answer.content }}
                      />

                      {/* Meta */}
                      <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-200">
                        <div className="flex items-center gap-4">
                          <span>{answer.userName}</span>
                          <span className="flex items-center gap-1">
                            <ClockIcon className="h-4 w-4" />
                            {formatTimeAgo(answer.createdAt)}
                          </span>
                        </div>
                        {isAnswerOwner && (
                          <div className="flex gap-2">
                            <button className="text-blue-600 hover:text-blue-800">
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteAnswer(answer.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Answer Comments */}
                      {comments[answer.id] && comments[answer.id].length > 0 && (
                        <div className="mt-4 space-y-2">
                          {comments[answer.id].map((comment) => (
                            <div key={comment.id} className="text-sm text-gray-600 pl-4 border-l-2 border-gray-200">
                              <div dangerouslySetInnerHTML={{ __html: comment.content }} />
                              <div className="mt-1 text-xs text-gray-500">
                                {comment.userName} • {formatTimeAgo(comment.createdAt)}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add Comment to Answer */}
                      {user && (
                        <div className="mt-4">
                          {showCommentForms[answer.id] ? (
                            <div className="space-y-2">
                              <textarea
                                value={commentContents[answer.id] || ''}
                                onChange={(e) => setCommentContents(prev => ({ ...prev, [answer.id]: e.target.value }))}
                                placeholder="Thêm bình luận..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows={3}
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleSubmitComment(answer.id, 2)}
                                  disabled={submittingComments[answer.id]}
                                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                                >
                                  {submittingComments[answer.id] ? 'Đang gửi...' : 'Gửi'}
                                </button>
                                <button
                                  onClick={() => {
                                    setShowCommentForms(prev => ({ ...prev, [answer.id]: false }));
                                    setCommentContents(prev => ({ ...prev, [answer.id]: '' }));
                                  }}
                                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                                >
                                  Hủy
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => setShowCommentForms(prev => ({ ...prev, [answer.id]: true }))}
                              className="text-sm text-blue-600 hover:text-blue-800"
                            >
                              Thêm bình luận
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {answers.length === 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <ChatBubbleLeftRightIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Chưa có câu trả lời</h3>
              <p className="text-gray-600 mb-6">Hãy là người đầu tiên trả lời câu hỏi này!</p>
              {user && !question.isSolved && (
                <button
                  onClick={() => setShowAnswerForm(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Trả lời
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

