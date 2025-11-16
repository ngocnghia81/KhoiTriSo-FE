"use client";
import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch';
import { useAuth } from '@/contexts/AuthContext';
import {
  lessonApiService,
  DiscussionResponseDto,
  CreateLessonDiscussionRequest,
  CreateLessonDiscussionReplyRequest,
  UpdateLessonDiscussionRequest,
} from '@/services/lessonApi';
import {
  ArrowLeftIcon,
  ChatBubbleLeftRightIcon,
  PencilIcon,
  TrashIcon,
  HeartIcon,
  PaperAirplaneIcon,
  XMarkIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import { RichTextEditor } from '@/components/RichTextEditor';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

function DiscussionsClient() {
  const { authenticatedFetch } = useAuthenticatedFetch();
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const courseId = params?.id as string;
  const lessonId = params?.lessonId as string;

  const [discussions, setDiscussions] = useState<DiscussionResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lesson, setLesson] = useState<any>(null);
  const [showDiscussionForm, setShowDiscussionForm] = useState(false);
  const [newDiscussionContent, setNewDiscussionContent] = useState('');
  const [submittingDiscussion, setSubmittingDiscussion] = useState(false);
  const [editingDiscussionId, setEditingDiscussionId] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [replyingToId, setReplyingToId] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Load lesson info
  useEffect(() => {
    const loadLesson = async () => {
      if (!lessonId) return;

      try {
        const resp = await authenticatedFetch(`/api/lessons/${lessonId}`);
        const data = await resp.json();

        if (resp.ok) {
          const lessonData = data?.Result?.Result ?? data?.Result ?? data;
          setLesson(lessonData);
        }
      } catch (err) {
        console.error('Error loading lesson:', err);
      }
    };

    loadLesson();
  }, [lessonId, authenticatedFetch]);

  // Load discussions
  const loadDiscussions = useCallback(async () => {
    if (!lessonId) return;

    try {
      setLoading(true);
      setError(null);
      const result = await lessonApiService.getLessonDiscussions(authenticatedFetch, parseInt(lessonId), {
        page,
        pageSize: 20,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });
      setDiscussions(result.items);
      setTotalPages(result.totalPages);
    } catch (err: any) {
      console.error('Error loading discussions:', err);
      setError(err?.message || 'Không thể tải thảo luận');
    } finally {
      setLoading(false);
    }
  }, [lessonId, authenticatedFetch, page]);

  useEffect(() => {
    loadDiscussions();
  }, [loadDiscussions]);

  const handleSubmitDiscussion = async () => {
    if (!lessonId || !newDiscussionContent.trim()) return;

    try {
      setSubmittingDiscussion(true);
      const request: CreateLessonDiscussionRequest = {
        content: newDiscussionContent.trim(),
      };

      await lessonApiService.createLessonDiscussion(authenticatedFetch, parseInt(lessonId), request);
      setNewDiscussionContent('');
      setShowDiscussionForm(false);
      await loadDiscussions();
    } catch (err: any) {
      console.error('Error creating discussion:', err);
      alert(err?.message || 'Không thể tạo thảo luận');
    } finally {
      setSubmittingDiscussion(false);
    }
  };

  const handleEditDiscussion = (discussion: DiscussionResponseDto) => {
    setEditingDiscussionId(discussion.id);
    setEditingContent(discussion.content);
  };

  const handleCancelEdit = () => {
    setEditingDiscussionId(null);
    setEditingContent('');
  };

  const handleSaveEdit = async (discussionId: number) => {
    if (!editingContent.trim()) return;

    try {
      const request: UpdateLessonDiscussionRequest = {
        content: editingContent.trim(),
      };

      await lessonApiService.updateLessonDiscussion(authenticatedFetch, discussionId, request);
      setEditingDiscussionId(null);
      setEditingContent('');
      await loadDiscussions();
    } catch (err: any) {
      console.error('Error updating discussion:', err);
      alert(err?.message || 'Không thể cập nhật thảo luận');
    }
  };

  const handleDeleteDiscussion = async (discussionId: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa thảo luận này?')) return;

    try {
      await lessonApiService.deleteLessonDiscussion(authenticatedFetch, discussionId);
      await loadDiscussions();
    } catch (err: any) {
      console.error('Error deleting discussion:', err);
      alert(err?.message || 'Không thể xóa thảo luận');
    }
  };

  const handleStartReply = (discussionId: number) => {
    setReplyingToId(discussionId);
    setReplyContent('');
  };

  const handleCancelReply = () => {
    setReplyingToId(null);
    setReplyContent('');
  };

  const handleSubmitReply = async (discussionId: number) => {
    if (!replyContent.trim()) return;

    try {
      setSubmittingReply(true);
      const request: CreateLessonDiscussionReplyRequest = {
        content: replyContent.trim(),
      };

      await lessonApiService.createDiscussionReply(authenticatedFetch, discussionId, request);
      setReplyingToId(null);
      setReplyContent('');
      await loadDiscussions();
    } catch (err: any) {
      console.error('Error creating reply:', err);
      alert(err?.message || 'Không thể tạo phản hồi');
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleToggleLike = async (discussionId: number) => {
    try {
      await lessonApiService.toggleDiscussionLike(authenticatedFetch, discussionId);
      await loadDiscussions();
    } catch (err: any) {
      console.error('Error toggling like:', err);
    }
  };

  const canEdit = (discussion: DiscussionResponseDto) => {
    if (!user) return false;
    return user.id && discussion.userId && user.id.toString() === discussion.userId.toString();
  };

  const canDelete = (discussion: DiscussionResponseDto) => {
    if (!user) return false;
    // Cho phép xóa nếu là owner hoặc là admin/instructor
    if (user.id && discussion.userId && user.id.toString() === discussion.userId.toString()) return true;
    const userRole = String(user.role ?? '').toLowerCase();
    if (userRole === 'admin' || userRole === 'instructor' || userRole === 'teacher') return true;
    return false;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            onClick={() => router.push(`/instructor/courses/${courseId}/lessons/${lessonId}`)}
            variant="ghost"
            size="sm"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Thảo luận - {lesson?.Title || lesson?.title || 'Bài học'}
            </h1>
            <p className="text-sm text-gray-500 mt-1">Quản lý thảo luận và câu hỏi về bài học</p>
          </div>
        </div>
        {user && !showDiscussionForm && (
          <Button onClick={() => setShowDiscussionForm(true)} size="sm">
            <ChatBubbleLeftRightIcon className="h-4 w-4 mr-2" />
            Thêm thảo luận
          </Button>
        )}
      </div>

      {/* Error */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-4 text-red-600">{error}</CardContent>
        </Card>
      )}

      {/* Discussion Form */}
      {showDiscussionForm && (
        <Card>
          <CardHeader>
            <CardTitle>Tạo thảo luận mới</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nội dung thảo luận <span className="text-red-500">*</span>
              </label>
              <RichTextEditor
                value={newDiscussionContent}
                onChange={setNewDiscussionContent}
                placeholder="Nhập câu hỏi hoặc ý kiến của bạn..."
                className="bg-white"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleSubmitDiscussion}
                disabled={!newDiscussionContent.trim() || submittingDiscussion}
                size="sm"
              >
                {submittingDiscussion ? 'Đang gửi...' : 'Gửi thảo luận'}
              </Button>
              <Button onClick={() => {
                setShowDiscussionForm(false);
                setNewDiscussionContent('');
              }} variant="outline" size="sm">
                Hủy
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Discussions List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChatBubbleLeftRightIcon className="h-5 w-5" />
            Danh sách thảo luận ({discussions.length})
          </CardTitle>
          <CardDescription>Tất cả câu hỏi và thảo luận về bài học này</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-20 w-full" />
                </div>
              ))}
            </div>
          ) : discussions.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <ChatBubbleLeftRightIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Chưa có thảo luận nào</p>
              {user && !showDiscussionForm && (
                <Button
                  onClick={() => setShowDiscussionForm(true)}
                  variant="outline"
                  size="sm"
                  className="mt-4"
                >
                  Bắt đầu thảo luận
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {discussions.map((discussion) => (
                <div key={discussion.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      {discussion.user.avatar ? (
                        <img
                          src={discussion.user.avatar}
                          alt={discussion.user.fullName}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                          {discussion.user.fullName.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Header */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-gray-900">{discussion.user.fullName}</p>
                          {discussion.isInstructor && (
                            <Badge variant="secondary" className="text-xs">
                              Giảng viên
                            </Badge>
                          )}
                          <span className="text-xs text-gray-400">
                            {new Date(discussion.createdAt).toLocaleString('vi-VN', {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {/* Edit/Delete buttons - chỉ hiện cho owner hoặc admin */}
                          {canEdit(discussion) && !editingDiscussionId && (
                            <Button
                              onClick={() => handleEditDiscussion(discussion)}
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </Button>
                          )}
                          {canDelete(discussion) && !editingDiscussionId && (
                            <Button
                              onClick={() => handleDeleteDiscussion(discussion.id)}
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-red-600 hover:text-red-700"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Content - Edit mode or View mode */}
                      {editingDiscussionId === discussion.id ? (
                        <div className="space-y-3">
                          <RichTextEditor
                            value={editingContent}
                            onChange={setEditingContent}
                            placeholder="Nhập nội dung thảo luận..."
                            className="bg-white"
                          />
                          <div className="flex items-center gap-2">
                            <Button
                              onClick={() => handleSaveEdit(discussion.id)}
                              disabled={!editingContent.trim()}
                              size="sm"
                            >
                              <CheckIcon className="h-4 w-4 mr-1" />
                              Lưu
                            </Button>
                            <Button onClick={handleCancelEdit} variant="outline" size="sm">
                              <XMarkIcon className="h-4 w-4 mr-1" />
                              Hủy
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div
                            className="text-sm text-gray-700 whitespace-pre-wrap break-words prose prose-sm max-w-none mb-2"
                            dangerouslySetInnerHTML={{ __html: discussion.content }}
                          />
                          {discussion.videoTimestamp !== undefined && discussion.videoTimestamp !== null && (
                            <div className="mt-2 text-xs text-blue-600">
                              Video: {Math.floor(discussion.videoTimestamp / 60)}:{(discussion.videoTimestamp % 60).toString().padStart(2, '0')}
                            </div>
                          )}
                        </>
                      )}

                      {/* Actions */}
                      {editingDiscussionId !== discussion.id && (
                        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-200">
                          <button
                            onClick={() => handleToggleLike(discussion.id)}
                            className={`flex items-center gap-1 text-xs ${
                              discussion.isLikedByMe ? 'text-red-600' : 'text-gray-500 hover:text-red-600'
                            }`}
                          >
                            <HeartIcon className={`h-4 w-4 ${discussion.isLikedByMe ? 'fill-current' : ''}`} />
                            {discussion.likeCount > 0 && <span>{discussion.likeCount}</span>}
                          </button>
                          {user && replyingToId !== discussion.id && (
                            <button
                              onClick={() => handleStartReply(discussion.id)}
                              className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-600"
                            >
                              <PaperAirplaneIcon className="h-4 w-4" />
                              Trả lời
                            </button>
                          )}
                        </div>
                      )}

                      {/* Reply Form */}
                      {replyingToId === discussion.id && (
                        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-2">
                              Phản hồi
                            </label>
                            <RichTextEditor
                              value={replyContent}
                              onChange={setReplyContent}
                              placeholder="Nhập phản hồi của bạn..."
                              className="bg-white"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              onClick={() => handleSubmitReply(discussion.id)}
                              disabled={!replyContent.trim() || submittingReply}
                              size="sm"
                            >
                              {submittingReply ? 'Đang gửi...' : 'Gửi phản hồi'}
                            </Button>
                            <Button onClick={handleCancelReply} variant="outline" size="sm">
                              Hủy
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Replies */}
                      {discussion.replies && discussion.replies.length > 0 && (
                        <div className="mt-4 ml-4 pl-4 border-l-2 border-gray-300 space-y-3">
                          {discussion.replies.map((reply) => (
                            <div key={reply.id} className="flex items-start gap-2">
                              <div className="flex-shrink-0">
                                {reply.user.avatar ? (
                                  <img
                                    src={reply.user.avatar}
                                    alt={reply.user.fullName}
                                    className="w-8 h-8 rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center text-white text-xs font-semibold">
                                    {reply.user.fullName.charAt(0).toUpperCase()}
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                  <div className="flex items-center gap-2">
                                    <p className="text-xs font-medium text-gray-900">{reply.user.fullName}</p>
                                    {reply.isInstructor && (
                                      <Badge variant="secondary" className="text-xs px-1">
                                        GV
                                      </Badge>
                                    )}
                                    <span className="text-xs text-gray-400">
                                      {new Date(reply.createdAt).toLocaleString('vi-VN', {
                                        month: '2-digit',
                                        day: '2-digit',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                      })}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    {canEdit(reply) && (
                                      <Button
                                        onClick={() => handleEditDiscussion(reply)}
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0"
                                      >
                                        <PencilIcon className="h-3 w-3" />
                                      </Button>
                                    )}
                                    {canDelete(reply) && (
                                      <Button
                                        onClick={() => handleDeleteDiscussion(reply.id)}
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                                      >
                                        <TrashIcon className="h-3 w-3" />
                                      </Button>
                                    )}
                                  </div>
                                </div>
                                {editingDiscussionId === reply.id ? (
                                  <div className="space-y-2">
                                    <RichTextEditor
                                      value={editingContent}
                                      onChange={setEditingContent}
                                      placeholder="Nhập nội dung phản hồi..."
                                      className="bg-white"
                                    />
                                    <div className="flex items-center gap-2">
                                      <Button
                                        onClick={() => handleSaveEdit(reply.id)}
                                        disabled={!editingContent.trim()}
                                        size="sm"
                                        className="h-7"
                                      >
                                        <CheckIcon className="h-3 w-3 mr-1" />
                                        Lưu
                                      </Button>
                                      <Button onClick={handleCancelEdit} variant="outline" size="sm" className="h-7">
                                        <XMarkIcon className="h-3 w-3 mr-1" />
                                        Hủy
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  <div
                                    className="text-xs text-gray-700 whitespace-pre-wrap break-words prose prose-xs max-w-none"
                                    dangerouslySetInnerHTML={{ __html: reply.content }}
                                  />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <p className="text-sm text-gray-600">
                Trang {page} / {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Trước
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Sau
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function DiscussionsPage() {
  return <DiscussionsClient />;
}

