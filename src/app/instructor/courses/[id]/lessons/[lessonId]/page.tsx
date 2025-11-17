"use client";
import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch';
import { 
  lessonApiService, 
  LessonMaterialDto, 
  DiscussionResponseDto, 
  CreateLessonDiscussionRequest,
  CreateLessonDiscussionReplyRequest,
  UpdateLessonDiscussionRequest
} from '@/services/lessonApi';
import { useAuth } from '@/contexts/AuthContext';
import {
  ArrowLeftIcon,
  DocumentTextIcon,
  VideoCameraIcon,
  ChatBubbleLeftRightIcon,
  PencilIcon,
  PaperClipIcon,
  ClockIcon,
  TrashIcon,
  HeartIcon,
  PaperAirplaneIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { RichTextEditor } from '@/components/RichTextEditor';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

function LessonViewClient() {
  const { authenticatedFetch } = useAuthenticatedFetch();
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const courseId = params?.id as string;
  const lessonId = params?.lessonId as string;

  const [lesson, setLesson] = useState<any>(null);
  const [materials, setMaterials] = useState<LessonMaterialDto[]>([]);
  const [discussions, setDiscussions] = useState<DiscussionResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMaterials, setLoadingMaterials] = useState(false);
  const [loadingDiscussions, setLoadingDiscussions] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDiscussionForm, setShowDiscussionForm] = useState(false);
  const [newDiscussionContent, setNewDiscussionContent] = useState('');
  const [submittingDiscussion, setSubmittingDiscussion] = useState(false);
  const [replyingToId, setReplyingToId] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);
  const [editingDiscussionId, setEditingDiscussionId] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState('');

  // Load lesson data
  useEffect(() => {
    const loadLesson = async () => {
      if (!lessonId) return;

      try {
        setLoading(true);
        setError(null);

        const resp = await authenticatedFetch(`/api/lessons/${lessonId}`);
        const data = await resp.json();

        if (resp.ok) {
          const lessonData = data?.Result?.Result ?? data?.Result ?? data;
          setLesson(lessonData);
        } else {
          setError(data.Message || 'Không thể tải thông tin bài học');
        }
      } catch (err) {
        setError('Có lỗi xảy ra khi tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };

    loadLesson();
  }, [lessonId, authenticatedFetch]);

  // Load materials
  useEffect(() => {
    const loadMaterials = async () => {
      if (!lessonId) return;

      try {
        setLoadingMaterials(true);
        const materialsData = await lessonApiService.getLessonMaterials(authenticatedFetch, parseInt(lessonId));
        setMaterials(materialsData);
      } catch (err) {
        console.error('Error loading materials:', err);
      } finally {
        setLoadingMaterials(false);
      }
    };

    if (lessonId) {
      loadMaterials();
    }
  }, [lessonId, authenticatedFetch]);

  const loadDiscussions = useCallback(async () => {
    if (!lessonId) return;

    try {
      setLoadingDiscussions(true);
      const result = await lessonApiService.getLessonDiscussions(authenticatedFetch, parseInt(lessonId), {
        page: 1,
        pageSize: 50,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });
      setDiscussions(result.items);
    } catch (err) {
      console.error('Error loading discussions:', err);
    } finally {
      setLoadingDiscussions(false);
    }
  }, [lessonId, authenticatedFetch]);

  // Load discussions
  useEffect(() => {
    if (lessonId) {
      loadDiscussions();
    }
  }, [lessonId, loadDiscussions]);

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

  const canEditLesson = lesson && user && (user.role === 'admin' || (user.id && lesson.InstructorId && user.id.toString() === lesson.InstructorId.toString()));

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="bg-white shadow rounded-lg p-6 space-y-6">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error || 'Không tìm thấy bài học'}</p>
          <Button
            onClick={() => router.push(`/instructor/courses/${courseId}/lessons`)}
            variant="outline"
            className="mt-4"
          >
            Quay lại danh sách
          </Button>
        </div>
      </div>
    );
  }

  const lessonTitle = lesson.Title || lesson.title || '';
  const lessonDescription = lesson.Description || lesson.description || '';
  const videoUrl = lesson.VideoUrl || lesson.videoUrl || '';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            onClick={() => router.push(`/instructor/courses/${courseId}/lessons`)}
            variant="ghost"
            size="sm"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{lessonTitle}</h1>
            <p className="text-sm text-gray-500 mt-1">
              Bài học #{lesson.LessonOrder || lesson.lessonOrder || 1}
            </p>
          </div>
        </div>
        {canEditLesson && (
          <Button
            onClick={() => router.push(`/instructor/courses/${courseId}/lessons/${lessonId}/edit`)}
            variant="outline"
          >
            <PencilIcon className="h-4 w-4 mr-2" />
            Chỉnh sửa
          </Button>
        )}
      </div>

      {/* Video Section */}
      {videoUrl && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <VideoCameraIcon className="h-5 w-5" />
              Video bài giảng
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-900 rounded-lg overflow-hidden">
              <video
                src={videoUrl}
                controls
                className="w-full aspect-video"
                preload="metadata"
              >
                Trình duyệt của bạn không hỗ trợ video HTML5.
              </video>
            </div>
            {lesson.VideoDuration || lesson.videoDuration ? (
              <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                <ClockIcon className="h-4 w-4" />
                <span>Thời lượng: {lesson.VideoDuration || lesson.videoDuration} phút</span>
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}

      {/* Description */}
      {lessonDescription && (
        <Card>
          <CardHeader>
            <CardTitle>Mô tả</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: lessonDescription }}
            />
          </CardContent>
        </Card>
      )}

      {/* Materials Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PaperClipIcon className="h-5 w-5" />
            Tài liệu bài học ({materials.length})
          </CardTitle>
          <CardDescription>Danh sách tài liệu và tài nguyên liên quan</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingMaterials ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-xs text-gray-500">Đang tải tài liệu...</p>
            </div>
          ) : materials.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Chưa có tài liệu nào</p>
            </div>
          ) : (
            <div className="space-y-3">
              {materials.map((material) => {
                const fileUrl = material.fileUrl || material.filePath;
                const fileExtension = material.fileName.split('.').pop()?.toLowerCase() || '';
                const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension);
                const isPdf = fileExtension === 'pdf';

                return (
                  <div key={material.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-gray-300 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <DocumentTextIcon className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{material.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {fileUrl && (
                              <a
                                href={fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:text-blue-800 underline"
                              >
                                Tải xuống
                              </a>
                            )}
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs text-gray-500">
                              {(material.fileSize / 1024 / 1024).toFixed(2)} MB
                            </span>
                            {material.downloadCount > 0 && (
                              <>
                                <span className="text-xs text-gray-400">•</span>
                                <span className="text-xs text-gray-500">
                                  {material.downloadCount} lượt tải
                                </span>
                              </>
                            )}
                          </div>
                          {fileUrl && (isImage || isPdf) && (
                            <div className="mt-3 border border-gray-200 rounded overflow-hidden max-w-md">
                              {isImage ? (
                                <img
                                  src={fileUrl}
                                  alt={material.title}
                                  className="w-full h-auto max-h-48 object-contain bg-gray-50"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                  }}
                                />
                              ) : isPdf ? (
                                <div className="bg-gray-50 p-3 text-center">
                                  <DocumentTextIcon className="h-8 w-8 text-gray-400 mx-auto mb-1" />
                                  <p className="text-xs text-gray-600 mb-2">PDF Document</p>
                                  <a
                                    href={fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center px-2 py-1 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
                                  >
                                    Mở PDF
                                  </a>
                                </div>
                              ) : null}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Discussions Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ChatBubbleLeftRightIcon className="h-5 w-5" />
                Thảo luận ({discussions.length})
              </CardTitle>
              <CardDescription>Câu hỏi và thảo luận về bài học này</CardDescription>
            </div>
            {user && !showDiscussionForm && (
              <Button
                onClick={() => setShowDiscussionForm(true)}
                size="sm"
              >
                Thêm thảo luận
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Discussion Form */}
          {showDiscussionForm && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nội dung thảo luận
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
                <Button
                  onClick={() => {
                    setShowDiscussionForm(false);
                    setNewDiscussionContent('');
                  }}
                  variant="outline"
                  size="sm"
                >
                  Hủy
                </Button>
              </div>
            </div>
          )}

          {/* Discussions List */}
          {loadingDiscussions ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-xs text-gray-500">Đang tải thảo luận...</p>
            </div>
          ) : discussions.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
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
            <div className="space-y-4">
              {discussions.map((discussion) => (
                <div key={discussion.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-start gap-3">
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
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
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
                        <div className="flex items-center gap-1">
                          {canEdit(discussion) && editingDiscussionId !== discussion.id && (
                            <Button
                              onClick={() => handleEditDiscussion(discussion)}
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                            >
                              <PencilIcon className="h-3 w-3" />
                            </Button>
                          )}
                          {canDelete(discussion) && editingDiscussionId !== discussion.id && (
                            <Button
                              onClick={() => handleDeleteDiscussion(discussion.id)}
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                            >
                              <TrashIcon className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                      {editingDiscussionId === discussion.id ? (
                        <div className="space-y-2">
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
                              <CheckIcon className="h-3 w-3 mr-1" />
                              Lưu
                            </Button>
                            <Button onClick={handleCancelEdit} variant="outline" size="sm">
                              <XMarkIcon className="h-3 w-3 mr-1" />
                              Hủy
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div
                            className="text-sm text-gray-700 whitespace-pre-wrap break-words prose prose-sm max-w-none"
                            dangerouslySetInnerHTML={{ __html: discussion.content }}
                          />
                          {discussion.videoTimestamp !== undefined && discussion.videoTimestamp !== null && (
                            <div className="mt-2 text-xs text-blue-600">
                              Video: {Math.floor(discussion.videoTimestamp / 60)}:{(discussion.videoTimestamp % 60).toString().padStart(2, '0')}
                            </div>
                          )}
                        </>
                      )}
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
                                        className="h-5 w-5 p-0"
                                      >
                                        <PencilIcon className="h-3 w-3" />
                                      </Button>
                                    )}
                                    {canDelete(reply) && (
                                      <Button
                                        onClick={() => handleDeleteDiscussion(reply.id)}
                                        variant="ghost"
                                        size="sm"
                                        className="h-5 w-5 p-0 text-red-600 hover:text-red-700"
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
        </CardContent>
      </Card>
    </div>
  );
}

export default function LessonViewPage() {
  return <LessonViewClient />;
}

