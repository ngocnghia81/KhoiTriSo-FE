'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch';
import { safeJsonParse, isSuccessfulResponse, extractResult, extractMessage } from '@/utils/apiHelpers';
import {
  PlayCircleIcon,
  LockClosedIcon,
  CheckCircleIcon,
  ClockIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  BookOpenIcon,
  DocumentTextIcon,
  XMarkIcon,
  ChatBubbleLeftRightIcon,
  PaperClipIcon,
  ArrowDownTrayIcon,
  HeartIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleIconSolid, HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import AssignmentList from '@/components/AssignmentList';

interface Lesson {
  id: number;
  title: string;
  description: string;
  videoUrl: string;
  videoDuration: number;
  lessonOrder: number;
  isPublished: boolean;
  isFree: boolean;
  courseId: number;
  course?: {
    id: number;
    title: string;
    thumbnail?: string;
  };
  userProgress?: {
    isCompleted: boolean;
    watchTime: number;
    lastAccessed: string;
  };
}

interface CourseLesson {
  id: number;
  title: string;
  description: string;
  videoUrl: string;
  videoDuration: number;
  lessonOrder: number;
  isPublished: boolean;
  isFree: boolean;
  userProgress?: {
    isCompleted: boolean;
    watchTime: number;
    lastAccessed: string;
  };
}

interface CourseDetail {
  id: number;
  title: string;
  thumbnail?: string;
  lessons: CourseLesson[];
  isFree: boolean;
  isEnrolled: boolean;
}

export default function LessonPlayerPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { authenticatedFetch } = useAuthenticatedFetch();
  const courseId = params?.id ? parseInt(params.id as string) : null;
  const lessonId = params?.lessonId ? parseInt(params.lessonId as string) : null;

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set([0]));
  const [videoProgress, setVideoProgress] = useState(0);
  const [isVideoCompleted, setIsVideoCompleted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [materials, setMaterials] = useState<any[]>([]);
  const [discussions, setDiscussions] = useState<any[]>([]);
  const [discussionsLoading, setDiscussionsLoading] = useState(false);
  const [materialsLoading, setMaterialsLoading] = useState(false);
  const [newDiscussionContent, setNewDiscussionContent] = useState('');
  const [newDiscussionTimestamp, setNewDiscussionTimestamp] = useState<number | null>(null);
  const [submittingDiscussion, setSubmittingDiscussion] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState<{ [key: number]: string }>({});
  const [submittingReply, setSubmittingReply] = useState<{ [key: number]: boolean }>({});
  const [expandedReplies, setExpandedReplies] = useState<Set<number>>(new Set());

  const videoRef = useRef<HTMLVideoElement>(null);
  const progressSaveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [hasInitializedLessonProgress, setHasInitializedLessonProgress] = useState(false);

  useEffect(() => {
    if (!courseId || !lessonId) {
      setError('ID khóa học hoặc bài học không hợp lệ');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch lesson details
        const lessonResponse = await authenticatedFetch(`/api/lessons/${lessonId}`);
        const lessonResult = await safeJsonParse(lessonResponse);

        if (isSuccessfulResponse(lessonResult)) {
          const lessonData = extractResult(lessonResult);
          if (!lessonData) {
            throw new Error('Không tìm thấy bài học');
          }

          const transformedLesson: Lesson = {
            id: lessonData.Id || lessonData.id,
            title: lessonData.Title || lessonData.title,
            description: lessonData.Description || lessonData.description,
            videoUrl: lessonData.VideoUrl || lessonData.videoUrl,
            videoDuration: lessonData.VideoDuration || lessonData.videoDuration || 0,
            lessonOrder: lessonData.LessonOrder || lessonData.lessonOrder,
            isPublished: lessonData.IsPublished || lessonData.isPublished,
            isFree: lessonData.IsFree || lessonData.isFree,
            courseId: lessonData.CourseId || lessonData.courseId,
            course: lessonData.Course ? {
              id: lessonData.Course.Id || lessonData.Course.id,
              title: lessonData.Course.Title || lessonData.Course.title,
              thumbnail: lessonData.Course.Thumbnail || lessonData.Course.thumbnail,
            } : undefined,
            userProgress: lessonData.UserProgress ? {
              isCompleted: lessonData.UserProgress.IsCompleted || lessonData.UserProgress.isCompleted,
              watchTime: lessonData.UserProgress.WatchTime || lessonData.UserProgress.watchTime,
              lastAccessed: lessonData.UserProgress.LastAccessed || lessonData.UserProgress.lastAccessed,
            } : undefined,
          };

          setLesson(transformedLesson);

          // Load video progress if exists
          if (isAuthenticated && transformedLesson.userProgress) {
            setCurrentTime(transformedLesson.userProgress.watchTime);
            setIsVideoCompleted(transformedLesson.userProgress.isCompleted);
            // Mark as initialized since progress already exists
            setHasInitializedLessonProgress(true);
          }

          // Fetch video progress
          if (isAuthenticated) {
            try {
              const progressResponse = await authenticatedFetch(`/api/lessons/${lessonId}/video-progress`);
              const progressResult = await safeJsonParse(progressResponse);
              if (isSuccessfulResponse(progressResult)) {
                const progressData = extractResult(progressResult);
                if (progressData) {
                  const position = progressData.VideoPosition || progressData.videoPosition || 0;
                  const videoDuration = progressData.VideoDuration || progressData.videoDuration || transformedLesson.videoDuration;
                  setCurrentTime(position);
                  setDuration(videoDuration);
                  setIsVideoCompleted(progressData.IsCompleted || progressData.isCompleted || false);
                }
              }
            } catch (err) {
              console.warn('Could not load video progress:', err);
            }
          }
        } else {
          setError(extractMessage(lessonResult) || 'Không thể tải bài học');
        }

        // Fetch course with lessons for sidebar
        const courseResponse = await authenticatedFetch(`/api/courses/${courseId}`);
        const courseResult = await safeJsonParse(courseResponse);

        if (isSuccessfulResponse(courseResult)) {
          const courseData = extractResult(courseResult);
          if (courseData) {
            const transformedCourse: CourseDetail = {
              id: courseData.Id || courseData.id,
              title: courseData.Title || courseData.title,
              thumbnail: courseData.Thumbnail || courseData.thumbnail,
              isFree: courseData.IsFree || courseData.isFree,
              isEnrolled: courseData.IsEnrolled || courseData.isEnrolled,
              lessons: (courseData.Lessons || courseData.lessons || []).map((l: any) => ({
                id: l.Id || l.id,
                title: l.Title || l.title,
                description: l.Description || l.description,
                videoUrl: l.VideoUrl || l.videoUrl,
                  videoDuration: l.VideoDuration || l.videoDuration || 0,
                lessonOrder: l.LessonOrder || l.lessonOrder,
                isPublished: l.IsPublished || l.isPublished,
                isFree: l.IsFree || l.isFree,
                userProgress: l.UserProgress ? {
                  isCompleted: l.UserProgress.IsCompleted || l.UserProgress.isCompleted,
                  watchTime: l.UserProgress.WatchTime || l.UserProgress.watchTime,
                  lastAccessed: l.UserProgress.LastAccessed || l.UserProgress.lastAccessed,
                } : undefined,
              })),
            };
            setCourse(transformedCourse);
          }
        }
      } catch (err) {
        console.error('Error fetching lesson:', err);
        setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    fetchMaterials();
    fetchDiscussions();
  }, [courseId, lessonId, authenticatedFetch, isAuthenticated]);

  const fetchMaterials = async () => {
    if (!lessonId) return;
    
    try {
      setMaterialsLoading(true);
      const response = await authenticatedFetch(`/api/lessons/${lessonId}/materials`);
      const result = await safeJsonParse(response);
      
      if (isSuccessfulResponse(result)) {
        const materialsData = extractResult(result);
        let materialsArray = [];
        
        if (Array.isArray(materialsData)) {
          materialsArray = materialsData;
        } else if (materialsData?.Items || materialsData?.items) {
          materialsArray = materialsData.Items || materialsData.items;
        } else if (materialsData?.Materials || materialsData?.materials) {
          materialsArray = materialsData.Materials || materialsData.materials;
        }
        
        const transformedMaterials = materialsArray.map((m: any) => ({
          id: m.Id || m.id,
          title: m.Title || m.title,
          fileName: m.FileName || m.fileName,
          filePath: m.FilePath || m.filePath,
          fileUrl: m.FileUrl || m.fileUrl || m.FilePath || m.filePath,
          fileType: m.FileType || m.fileType,
          fileSize: m.FileSize || m.fileSize || 0,
          downloadCount: m.DownloadCount || m.downloadCount || 0,
          createdAt: m.CreatedAt || m.createdAt,
        }));
        
        setMaterials(transformedMaterials);
      }
    } catch (err) {
      console.error('Error fetching materials:', err);
    } finally {
      setMaterialsLoading(false);
    }
  };

  const fetchDiscussions = async () => {
    if (!lessonId) return;
    
    try {
      setDiscussionsLoading(true);
      const response = await authenticatedFetch(`/api/lessons/${lessonId}/discussions?page=1&pageSize=50&sortBy=createdAt&sortOrder=desc`);
      const result = await safeJsonParse(response);
      
      if (isSuccessfulResponse(result)) {
        const discussionsData = extractResult(result);
        let discussionsArray = [];
        
        if (Array.isArray(discussionsData)) {
          discussionsArray = discussionsData;
        } else if (discussionsData?.Items || discussionsData?.items) {
          discussionsArray = discussionsData.Items || discussionsData.items;
        }
        
        const transformedDiscussions = discussionsArray.map((d: any) => ({
          id: d.Id || d.id,
          lessonId: d.LessonId || d.lessonId,
          userId: d.UserId || d.userId,
          user: d.User || d.user ? {
            fullName: (d.User || d.user).FullName || (d.User || d.user).fullName,
            avatar: (d.User || d.user).Avatar || (d.User || d.user).avatar,
          } : undefined,
          parentId: d.ParentId || d.parentId,
          content: d.Content || d.content,
          videoTimestamp: d.VideoTimestamp || d.videoTimestamp,
          isInstructor: d.IsInstructor || d.isInstructor || false,
          likeCount: d.LikeCount || d.likeCount || 0,
          isLikedByMe: d.IsLikedByMe || d.isLikedByMe || false,
          createdAt: d.CreatedAt || d.createdAt,
          updatedAt: d.UpdatedAt || d.updatedAt,
          replies: (d.Replies || d.replies || []).map((r: any) => ({
            id: r.Id || r.id,
            userId: r.UserId || r.userId,
            user: r.User || r.user ? {
              fullName: (r.User || r.user).FullName || (r.User || r.user).fullName,
              avatar: (r.User || r.user).Avatar || (r.User || r.user).avatar,
            } : undefined,
            content: r.Content || r.content,
            isInstructor: r.IsInstructor || r.isInstructor || false,
            likeCount: r.LikeCount || r.likeCount || 0,
            isLikedByMe: r.IsLikedByMe || r.isLikedByMe || false,
            createdAt: r.CreatedAt || r.createdAt,
          })),
        }));
        
        setDiscussions(transformedDiscussions);
      }
    } catch (err) {
      console.error('Error fetching discussions:', err);
    } finally {
      setDiscussionsLoading(false);
    }
  };

  const handleCreateDiscussion = async () => {
    if (!isAuthenticated || !lessonId) {
      toast.error('Vui lòng đăng nhập để bình luận');
      return;
    }

    if (!newDiscussionContent.trim()) {
      toast.error('Vui lòng nhập nội dung bình luận');
      return;
    }

    try {
      setSubmittingDiscussion(true);
      const response = await authenticatedFetch(`/api/lessons/${lessonId}/discussions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newDiscussionContent,
          videoTimestamp: newDiscussionTimestamp,
        }),
      });

      const result = await safeJsonParse(response);
      if (isSuccessfulResponse(result)) {
        toast.success('Đã đăng bình luận');
        setNewDiscussionContent('');
        setNewDiscussionTimestamp(null);
        fetchDiscussions();
      } else {
        toast.error('Không thể đăng bình luận');
      }
    } catch (err) {
      console.error('Error creating discussion:', err);
      toast.error('Có lỗi xảy ra khi đăng bình luận');
    } finally {
      setSubmittingDiscussion(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: vi });
    } catch {
      return dateString;
    }
  };

  const handleTimestampClick = (timestamp: number | null) => {
    if (timestamp !== null && videoRef.current) {
      videoRef.current.currentTime = timestamp;
      videoRef.current.play();
    }
    setNewDiscussionTimestamp(timestamp);
  };

  const handleLikeDiscussion = async (discussionId: number, isReply: boolean = false) => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để like');
      return;
    }

    try {
      const response = await authenticatedFetch(`/api/discussions/${discussionId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await safeJsonParse(response);
      if (isSuccessfulResponse(result)) {
        const likeData = extractResult(result);
        if (likeData) {
          // Update discussion in state
          setDiscussions(prev => prev.map(d => {
            if (d.id === discussionId) {
              return {
                ...d,
                likeCount: likeData.LikeCount || likeData.likeCount || 0,
                isLikedByMe: likeData.IsLiked || likeData.isLiked || false,
              };
            }
            // Update reply
            const updatedReplies = d.replies?.map((r: any) => {
              if (r.id === discussionId) {
                return {
                  ...r,
                  likeCount: likeData.LikeCount || likeData.likeCount || 0,
                  isLikedByMe: likeData.IsLiked || likeData.isLiked || false,
                };
              }
              return r;
            });
            return { ...d, replies: updatedReplies };
          }));
        }
      } else {
        toast.error('Không thể like bình luận');
      }
    } catch (err) {
      console.error('Error liking discussion:', err);
      toast.error('Có lỗi xảy ra khi like');
    }
  };

  const handleReplyClick = (discussionId: number) => {
    setReplyingTo(replyingTo === discussionId ? null : discussionId);
    if (!replyContent[discussionId]) {
      setReplyContent(prev => ({ ...prev, [discussionId]: '' }));
    }
  };

  const handleCreateReply = async (discussionId: number) => {
    if (!isAuthenticated || !lessonId) {
      toast.error('Vui lòng đăng nhập để trả lời');
      return;
    }

    const content = replyContent[discussionId]?.trim();
    if (!content) {
      toast.error('Vui lòng nhập nội dung trả lời');
      return;
    }

    try {
      setSubmittingReply(prev => ({ ...prev, [discussionId]: true }));
      const response = await authenticatedFetch(`/api/discussions/${discussionId}/replies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: content,
        }),
      });

      const result = await safeJsonParse(response);
      if (isSuccessfulResponse(result)) {
        toast.success('Đã đăng trả lời');
        setReplyContent(prev => ({ ...prev, [discussionId]: '' }));
        setReplyingTo(null);
        fetchDiscussions();
      } else {
        toast.error('Không thể đăng trả lời');
      }
    } catch (err) {
      console.error('Error creating reply:', err);
      toast.error('Có lỗi xảy ra khi đăng trả lời');
    } finally {
      setSubmittingReply(prev => ({ ...prev, [discussionId]: false }));
    }
  };

  const toggleReplies = (discussionId: number) => {
    setExpandedReplies(prev => {
      const newSet = new Set(prev);
      if (newSet.has(discussionId)) {
        newSet.delete(discussionId);
      } else {
        newSet.add(discussionId);
      }
      return newSet;
    });
  };

  // Define saveProgress function for UserVideoProgress
  const saveProgressRef = useRef<((position: number, videoDuration: number, completed: boolean) => Promise<void>) | null>(null);

  useEffect(() => {
    saveProgressRef.current = async (position: number, videoDuration: number, completed: boolean) => {
      if (!isAuthenticated || !lessonId) return;

      try {
        const watchPercentage = videoDuration > 0 ? (position / videoDuration) * 100 : 0;
        
        await authenticatedFetch(`/api/lessons/${lessonId}/video-progress`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            videoPosition: position,
            videoDuration: videoDuration,
            watchPercentage: watchPercentage,
            isCompleted: completed || watchPercentage >= 90,
          }),
        });
      } catch (err) {
        console.error('Error saving video progress:', err);
      }
    };
  }, [isAuthenticated, lessonId, authenticatedFetch]);

  // Define saveLessonProgress function for UserLessonProgress
  const saveLessonProgressRef = useRef<((watchTime: number, isCompleted: boolean) => Promise<void>) | null>(null);

  useEffect(() => {
    saveLessonProgressRef.current = async (watchTime: number, isCompleted: boolean) => {
      if (!isAuthenticated || !lessonId) return;

      try {
        await authenticatedFetch(`/api/lessons/${lessonId}/progress`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            watchTime: Math.floor(watchTime), // Convert to integer seconds
            isCompleted: isCompleted,
          }),
        });
      } catch (err) {
        console.error('Error saving lesson progress:', err);
      }
    };
  }, [isAuthenticated, lessonId, authenticatedFetch]);

  // Auto-save progress
  useEffect(() => {
    if (!isAuthenticated || !lessonId) return;

    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      const current = video.currentTime;
      const total = video.duration || duration;
      
      setCurrentTime(current);
      if (total > 0 && total !== duration) {
        setDuration(total);
      }
      
      if (total > 0) {
        const percentage = (current / total) * 100;
        setVideoProgress(percentage);
        
        // Mark as completed if watched 90% or more
        if (percentage >= 90 && !isVideoCompleted) {
          setIsVideoCompleted(true);
          saveProgressRef.current?.(current, total, true).catch(console.error);
          // Update UserLessonProgress: completed = true
          saveLessonProgressRef.current?.(current, true).catch(console.error);
        }
      }
    };

    const handleLoadedMetadata = () => {
      const total = video.duration;
      setDuration(total);
      // Resume from saved position
      if (currentTime > 0 && currentTime < total) {
        video.currentTime = currentTime;
      }
    };

    // Initialize UserLessonProgress when video starts playing for the first time
    const handlePlay = () => {
      if (!hasInitializedLessonProgress && video.duration > 0) {
        // Create UserLessonProgress with initial watchTime = 0
        saveLessonProgressRef.current?.(0, false).catch(console.error);
        setHasInitializedLessonProgress(true);
      }
    };

    video.addEventListener('play', handlePlay);

    const handleEnded = () => {
      if (video.duration > 0) {
        const total = video.duration;
        saveProgressRef.current?.(total, total, true).catch(console.error);
        // Update UserLessonProgress: completed = true, watchTime = total
        saveLessonProgressRef.current?.(total, true).catch(console.error);
        setIsVideoCompleted(true);
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('ended', handleEnded);

    // Auto-save progress every 10 seconds
    progressSaveIntervalRef.current = setInterval(() => {
      if (video && !video.paused && video.duration > 0) {
        const current = video.currentTime;
        const total = video.duration;
        // Update UserVideoProgress
        saveProgressRef.current?.(current, total, false).catch(console.error);
        // Update UserLessonProgress (watchTime, chưa completed nếu chưa đạt 90%)
        const percentage = (current / total) * 100;
        saveLessonProgressRef.current?.(current, percentage >= 90).catch(console.error);
      }
    }, 10000);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('play', handlePlay);
      if (progressSaveIntervalRef.current) {
        clearInterval(progressSaveIntervalRef.current);
      }
    };
  }, [isAuthenticated, lessonId, duration, currentTime, isVideoCompleted, hasInitializedLessonProgress]);

  const formatDuration = (seconds: number | undefined | null) => {
    // Validate input
    if (!seconds || isNaN(seconds) || seconds < 0) {
      return '0:00';
    }
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const stripHtml = (html: string | undefined | null): string => {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '').trim();
  };

  const canViewAllLessons = course?.isFree || course?.isEnrolled;

  // Hiển thị tất cả bài học, sắp xếp theo thứ tự
  const sortedLessons = course?.lessons
    .sort((a, b) => a.lessonOrder - b.lessonOrder) || [];

  const currentLessonIndex = sortedLessons.findIndex(l => l.id === lessonId);
  const nextLesson = currentLessonIndex >= 0 && currentLessonIndex < sortedLessons.length - 1
    ? sortedLessons[currentLessonIndex + 1]
    : null;
  const prevLesson = currentLessonIndex > 0
    ? sortedLessons[currentLessonIndex - 1]
    : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Đang tải bài học...</p>
        </div>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <XMarkIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy bài học</h2>
            <p className="text-gray-600 mb-6">{error || 'Bài học không tồn tại'}</p>
            <Button asChild>
              <Link href={`/courses/${courseId}`}>Quay lại khóa học</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <BookOpenIcon className="h-5 w-5" />
              </Button>
              <Link href={`/courses/${courseId}`} className="text-sm text-gray-600 hover:text-blue-600">
                {course?.title || 'Khóa học'}
              </Link>
              <ChevronRightIcon className="h-4 w-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-900">{stripHtml(lesson.title)}</span>
            </div>
            <div className="flex items-center gap-2">
              {lesson.userProgress?.isCompleted && (
                <Badge className="bg-green-100 text-green-700 border-green-200">
                  <CheckCircleIconSolid className="h-3 w-3 mr-1" />
                  Đã hoàn thành
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Main Content */}
        <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'lg:mr-80' : ''}`}>
          {/* Video Player */}
          <div className="bg-black">
            <div className="relative aspect-video max-w-7xl mx-auto">
              {lesson.videoUrl ? (
                <video
                  ref={videoRef}
                  src={lesson.videoUrl}
                  controls
                  className="w-full h-full"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-900">
                  <div className="text-center">
                    <PlayCircleIcon className="h-24 w-24 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">Video chưa có sẵn</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Lesson Info */}
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 bg-white">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-900">{stripHtml(lesson.title)}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center">
                  <ClockIcon className="h-4 w-4 mr-1" />
                  {formatDuration(lesson.videoDuration)}
                </span>
              </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Tổng quan</TabsTrigger>
                <TabsTrigger value="assignments">Bài tập</TabsTrigger>
                <TabsTrigger value="materials">Tài liệu ({materials.length})</TabsTrigger>
                <TabsTrigger value="discussions">Hỏi & Đáp ({discussions.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6">
                {lesson.description && (
                  <div className="prose max-w-none">
                    <p className="text-gray-700 whitespace-pre-wrap">{stripHtml(lesson.description)}</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="assignments" className="mt-6">
                <AssignmentList lessonId={lessonId!} courseId={courseId!} />
              </TabsContent>

              <TabsContent value="materials" className="mt-6">
                {materialsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Đang tải tài liệu...</p>
                  </div>
                ) : materials.length === 0 ? (
                  <div className="text-center py-12">
                    <PaperClipIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Chưa có tài liệu đính kèm</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {materials.map((material) => (
                      <Card key={material.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <DocumentTextIcon className="h-5 w-5 text-blue-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-gray-900 truncate">{material.title}</h4>
                                <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                                  <span>{material.fileName}</span>
                                  <span>•</span>
                                  <span>{formatFileSize(material.fileSize)}</span>
                                  {material.downloadCount > 0 && (
                                    <>
                                      <span>•</span>
                                      <span>{material.downloadCount} lượt tải</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                            <Button
                              asChild
                              variant="outline"
                              size="sm"
                              className="ml-4"
                            >
                              <a
                                href={material.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                download
                              >
                                <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                                Tải xuống
                              </a>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="discussions" className="mt-6">
                {/* Create Discussion Form */}
                {isAuthenticated && (
                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle className="text-lg">Đặt câu hỏi</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <Textarea
                          placeholder="Nhập câu hỏi của bạn về bài học này..."
                          value={newDiscussionContent}
                          onChange={(e) => setNewDiscussionContent(e.target.value)}
                          rows={4}
                          className="resize-none"
                        />
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {videoRef.current && videoRef.current.duration > 0 && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleTimestampClick(Math.floor(videoRef.current?.currentTime || 0))}
                                className="text-xs"
                              >
                                <ClockIcon className="h-4 w-4 mr-1" />
                                Gắn thời gian: {formatDuration(Math.floor(videoRef.current?.currentTime || 0))}
                              </Button>
                            )}
                            {newDiscussionTimestamp !== null && (
                              <Badge variant="outline" className="text-xs">
                                {formatDuration(newDiscussionTimestamp)}
                                <button
                                  onClick={() => setNewDiscussionTimestamp(null)}
                                  className="ml-2 text-gray-500 hover:text-gray-700"
                                >
                                  <XMarkIcon className="h-3 w-3" />
                                </button>
                              </Badge>
                            )}
                          </div>
                          <Button
                            onClick={handleCreateDiscussion}
                            disabled={submittingDiscussion || !newDiscussionContent.trim()}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            {submittingDiscussion ? 'Đang đăng...' : 'Đăng câu hỏi'}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Discussions List */}
                {discussionsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Đang tải bình luận...</p>
                  </div>
                ) : discussions.length === 0 ? (
                  <div className="text-center py-12">
                    <ChatBubbleLeftRightIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Chưa có câu hỏi nào</p>
                    {!isAuthenticated && (
                      <p className="text-sm text-gray-500 mt-2">Đăng nhập để đặt câu hỏi đầu tiên</p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {discussions.map((discussion) => (
                      <Card key={discussion.id}>
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <div className="flex-shrink-0">
                              {discussion.user?.avatar ? (
                                <Image
                                  src={discussion.user.avatar}
                                  alt={discussion.user.fullName}
                                  width={40}
                                  height={40}
                                  className="rounded-full"
                                  unoptimized
                                />
                              ) : (
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                  <UserIcon className="h-5 w-5 text-blue-600" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-semibold text-gray-900">
                                  {discussion.user?.fullName || 'Người dùng'}
                                </span>
                                {discussion.isInstructor && (
                                  <Badge className="bg-blue-600 text-white text-xs">Giảng viên</Badge>
                                )}
                                {discussion.videoTimestamp !== null && discussion.videoTimestamp !== undefined && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-auto p-1 text-xs text-blue-600 hover:text-blue-700"
                                    onClick={() => handleTimestampClick(discussion.videoTimestamp)}
                                  >
                                    <ClockIcon className="h-3 w-3 mr-1" />
                                    {formatDuration(discussion.videoTimestamp)}
                                  </Button>
                                )}
                                <span className="text-sm text-gray-500 ml-auto">
                                  {formatDate(discussion.createdAt)}
                                </span>
                              </div>
                              <p className="text-gray-700 mb-4 whitespace-pre-wrap">{discussion.content}</p>
                              
                              {/* Actions */}
                              <div className="flex items-center gap-4 mt-3">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleLikeDiscussion(discussion.id)}
                                  className={`text-gray-600 hover:text-red-600 ${discussion.isLikedByMe ? 'text-red-600' : ''}`}
                                >
                                  {discussion.isLikedByMe ? (
                                    <HeartIconSolid className="h-4 w-4 text-red-600 mr-1" />
                                  ) : (
                                    <HeartIcon className="h-4 w-4 mr-1" />
                                  )}
                                  {discussion.likeCount > 0 && <span>{discussion.likeCount}</span>}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleReplyClick(discussion.id)}
                                  className="text-gray-600 hover:text-blue-600"
                                >
                                  <ChatBubbleLeftRightIcon className="h-4 w-4 mr-1" />
                                  Trả lời
                                </Button>
                              </div>

                              {/* Reply Form */}
                              {replyingTo === discussion.id && (
                                <div className="mt-4 pl-4 border-l-2 border-blue-200">
                                  <div className="space-y-3">
                                    <Textarea
                                      placeholder="Viết trả lời..."
                                      value={replyContent[discussion.id] || ''}
                                      onChange={(e) => setReplyContent(prev => ({ ...prev, [discussion.id]: e.target.value }))}
                                      rows={3}
                                      className="resize-none"
                                    />
                                    <div className="flex items-center justify-end gap-2">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                          setReplyingTo(null);
                                          setReplyContent(prev => ({ ...prev, [discussion.id]: '' }));
                                        }}
                                      >
                                        Hủy
                                      </Button>
                                      <Button
                                        size="sm"
                                        onClick={() => handleCreateReply(discussion.id)}
                                        disabled={submittingReply[discussion.id] || !replyContent[discussion.id]?.trim()}
                                        className="bg-blue-600 hover:bg-blue-700"
                                      >
                                        {submittingReply[discussion.id] ? 'Đang đăng...' : 'Trả lời'}
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Replies */}
                              {discussion.replies && discussion.replies.length > 0 && (
                                <div className="mt-4 space-y-3">
                                  {discussion.replies.length > 2 && !expandedReplies.has(discussion.id) ? (
                                    <>
                                      {discussion.replies.slice(0, 2).map((reply: any) => (
                                        <div key={reply.id} className="flex items-start gap-3 pl-4 border-l-2 border-gray-200">
                                          <div className="flex-shrink-0">
                                            {reply.user?.avatar ? (
                                              <Image
                                                src={reply.user.avatar}
                                                alt={reply.user.fullName}
                                                width={32}
                                                height={32}
                                                className="rounded-full"
                                                unoptimized
                                              />
                                            ) : (
                                              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                                <UserIcon className="h-4 w-4 text-gray-600" />
                                              </div>
                                            )}
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                              <span className="text-sm font-medium text-gray-900">
                                                {reply.user?.fullName || 'Người dùng'}
                                              </span>
                                              {reply.isInstructor && (
                                                <Badge className="bg-blue-600 text-white text-xs">GV</Badge>
                                              )}
                                              <span className="text-xs text-gray-500">
                                                {formatDate(reply.createdAt)}
                                              </span>
                                            </div>
                                            <p className="text-sm text-gray-700 whitespace-pre-wrap mb-2">{reply.content}</p>
                                            <div className="flex items-center gap-3">
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleLikeDiscussion(reply.id, true)}
                                                className={`text-xs text-gray-600 hover:text-red-600 ${reply.isLikedByMe ? 'text-red-600' : ''}`}
                                              >
                                                {reply.isLikedByMe ? (
                                                  <HeartIconSolid className="h-3 w-3 text-red-600 mr-1" />
                                                ) : (
                                                  <HeartIcon className="h-3 w-3 mr-1" />
                                                )}
                                                {reply.likeCount > 0 && <span>{reply.likeCount}</span>}
                                              </Button>
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleReplyClick(reply.id)}
                                                className="text-xs text-gray-600 hover:text-blue-600"
                                              >
                                                <ChatBubbleLeftRightIcon className="h-3 w-3 mr-1" />
                                                Trả lời
                                              </Button>
                                            </div>
                                            {/* Reply to reply form */}
                                            {replyingTo === reply.id && (
                                              <div className="mt-3 pl-4 border-l-2 border-blue-200">
                                                <div className="space-y-2">
                                                  <Textarea
                                                    placeholder="Viết trả lời..."
                                                    value={replyContent[reply.id] || ''}
                                                    onChange={(e) => setReplyContent(prev => ({ ...prev, [reply.id]: e.target.value }))}
                                                    rows={2}
                                                    className="resize-none text-sm"
                                                  />
                                                  <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                      variant="ghost"
                                                      size="sm"
                                                      onClick={() => {
                                                        setReplyingTo(null);
                                                        setReplyContent(prev => ({ ...prev, [reply.id]: '' }));
                                                      }}
                                                      className="text-xs"
                                                    >
                                                      Hủy
                                                    </Button>
                                                    <Button
                                                      size="sm"
                                                      onClick={() => handleCreateReply(reply.id)}
                                                      disabled={submittingReply[reply.id] || !replyContent[reply.id]?.trim()}
                                                      className="bg-blue-600 hover:bg-blue-700 text-xs"
                                                    >
                                                      {submittingReply[reply.id] ? 'Đang đăng...' : 'Trả lời'}
                                                    </Button>
                                                  </div>
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      ))}
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => toggleReplies(discussion.id)}
                                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                                      >
                                        {expandedReplies.has(discussion.id) ? (
                                          <>
                                            <ChevronUpIcon className="h-4 w-4 mr-1" />
                                            Thu gọn
                                          </>
                                        ) : (
                                          <>
                                            <ChevronDownIcon className="h-4 w-4 mr-1" />
                                            Xem thêm {discussion.replies.length - 2} trả lời
                                          </>
                                        )}
                                      </Button>
                                    </>
                                  ) : (
                                    discussion.replies.map((reply: any) => (
                                      <div key={reply.id} className="flex items-start gap-3 pl-4 border-l-2 border-gray-200">
                                        <div className="flex-shrink-0">
                                          {reply.user?.avatar ? (
                                            <Image
                                              src={reply.user.avatar}
                                              alt={reply.user.fullName}
                                              width={32}
                                              height={32}
                                              className="rounded-full"
                                              unoptimized
                                            />
                                          ) : (
                                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                              <UserIcon className="h-4 w-4 text-gray-600" />
                                            </div>
                                          )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center gap-2 mb-1">
                                            <span className="text-sm font-medium text-gray-900">
                                              {reply.user?.fullName || 'Người dùng'}
                                            </span>
                                            {reply.isInstructor && (
                                              <Badge className="bg-blue-600 text-white text-xs">GV</Badge>
                                            )}
                                            <span className="text-xs text-gray-500">
                                              {formatDate(reply.createdAt)}
                                            </span>
                                          </div>
                                          <p className="text-sm text-gray-700 whitespace-pre-wrap mb-2">{reply.content}</p>
                                          <div className="flex items-center gap-3">
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => handleLikeDiscussion(reply.id, true)}
                                              className={`text-xs text-gray-600 hover:text-red-600 ${reply.isLikedByMe ? 'text-red-600' : ''}`}
                                            >
                                              {reply.isLikedByMe ? (
                                                <HeartIconSolid className="h-3 w-3 text-red-600 mr-1" />
                                              ) : (
                                                <HeartIcon className="h-3 w-3 mr-1" />
                                              )}
                                              {reply.likeCount > 0 && <span>{reply.likeCount}</span>}
                                            </Button>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => handleReplyClick(reply.id)}
                                              className="text-xs text-gray-600 hover:text-blue-600"
                                            >
                                              <ChatBubbleLeftRightIcon className="h-3 w-3 mr-1" />
                                              Trả lời
                                            </Button>
                                          </div>
                                          {/* Reply to reply form */}
                                          {replyingTo === reply.id && (
                                            <div className="mt-3 pl-4 border-l-2 border-blue-200">
                                              <div className="space-y-2">
                                                <Textarea
                                                  placeholder="Viết trả lời..."
                                                  value={replyContent[reply.id] || ''}
                                                  onChange={(e) => setReplyContent(prev => ({ ...prev, [reply.id]: e.target.value }))}
                                                  rows={2}
                                                  className="resize-none text-sm"
                                                />
                                                <div className="flex items-center justify-end gap-2">
                                                  <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                      setReplyingTo(null);
                                                      setReplyContent(prev => ({ ...prev, [reply.id]: '' }));
                                                    }}
                                                    className="text-xs"
                                                  >
                                                    Hủy
                                                  </Button>
                                                  <Button
                                                    size="sm"
                                                    onClick={() => handleCreateReply(reply.id)}
                                                    disabled={submittingReply[reply.id] || !replyContent[reply.id]?.trim()}
                                                    className="bg-blue-600 hover:bg-blue-700 text-xs"
                                                  >
                                                    {submittingReply[reply.id] ? 'Đang đăng...' : 'Trả lời'}
                                                  </Button>
                                                </div>
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    ))
                                  )}
                                  {discussion.replies.length > 2 && expandedReplies.has(discussion.id) && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => toggleReplies(discussion.id)}
                                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                                    >
                                      <ChevronUpIcon className="h-4 w-4 mr-1" />
                                      Thu gọn
                                    </Button>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200 mt-6">
              {prevLesson ? (
                <Button
                  asChild
                  variant="outline"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <Link href={`/courses/${courseId}/lessons/${prevLesson.id}`}>
                    <ChevronRightIcon className="h-4 w-4 mr-2 rotate-180" />
                    Bài trước
                  </Link>
                </Button>
              ) : (
                <div></div>
              )}

              {nextLesson ? (
                <Button
                  asChild
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Link href={`/courses/${courseId}/lessons/${nextLesson.id}`}>
                    Bài tiếp theo
                    <ChevronRightIcon className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              ) : (
                <Button
                  asChild
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Link href={`/courses/${courseId}`}>
                    Hoàn thành khóa học
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar - Course Content */}
        {sidebarOpen && (
          <div className="fixed right-0 top-16 bottom-0 w-80 bg-white border-l border-gray-200 overflow-y-auto z-40 shadow-lg">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">Nội dung khóa học</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(false)}
                  className="text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                >
                  <XMarkIcon className="h-5 w-5" />
                </Button>
              </div>

              <div className="space-y-1">
                {sortedLessons.map((l, index) => {
                  const isCurrent = l.id === lessonId;
                  const canView = l.isFree || canViewAllLessons;
                  const isCompleted = l.userProgress?.isCompleted;

                  return (
                    <div
                      key={l.id}
                      className={`block p-3 rounded-lg transition-all ${
                        isCurrent
                          ? 'bg-blue-600 text-white shadow-md'
                          : canView
                          ? 'bg-gray-50 hover:bg-gray-100 text-gray-900 border border-gray-200'
                          : 'bg-gray-100 opacity-60 text-gray-500 cursor-not-allowed border border-gray-200'
                      }`}
                    >
                      {canView ? (
                        <Link
                          href={`/courses/${courseId}/lessons/${l.id}`}
                          className="block"
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-0.5">
                              {isCompleted ? (
                                <CheckCircleIconSolid className={`h-5 w-5 ${isCurrent ? 'text-white' : 'text-green-600'}`} />
                              ) : (
                                <PlayCircleIcon className={`h-5 w-5 ${isCurrent ? 'text-white' : 'text-gray-500'}`} />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <span className={`text-sm font-medium ${isCurrent ? 'text-white' : 'text-gray-900'}`}>
                                  {index + 1}. {stripHtml(l.title)}
                                </span>
                              </div>
                              <div className={`flex items-center gap-2 text-xs ${isCurrent ? 'text-blue-100' : 'text-gray-500'}`}>
                                <span className="flex items-center">
                                  <ClockIcon className="h-3 w-3 mr-1" />
                                  {formatDuration(l.videoDuration)}
                                </span>
                                {l.isFree && (
                                  <Badge className={`text-xs ${isCurrent ? 'bg-green-500 text-white' : 'bg-green-100 text-green-700'}`}>
                                    Miễn phí
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </Link>
                      ) : (
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-0.5">
                            <LockClosedIcon className="h-5 w-5 text-gray-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium text-gray-500">
                                {index + 1}. {stripHtml(l.title)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                              <span className="flex items-center">
                                <ClockIcon className="h-3 w-3 mr-1" />
                                {formatDuration(l.videoDuration)}
                              </span>
                              <span className="flex items-center gap-1">
                                <LockClosedIcon className="h-3 w-3" />
                                <span>Yêu cầu đăng ký</span>
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Sidebar Toggle Button (when closed) */}
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="fixed right-4 top-20 bg-white text-gray-700 p-2 rounded-lg shadow-lg border border-gray-200 hover:bg-gray-50 z-40"
          >
            <BookOpenIcon className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
}

