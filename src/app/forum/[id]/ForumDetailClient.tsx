'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  TrashIcon,
  PencilIcon,
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

interface ForumDetailClientProps {
  initialQuestion?: ForumQuestion;
  initialAnswers?: ForumAnswer[];
  initialComments?: Record<string, ForumComment[]>;
  questionId: string;
}

export default function ForumDetailClient({ 
  initialQuestion, 
  initialAnswers, 
  initialComments,
  questionId 
}: ForumDetailClientProps) {
  const router = useRouter();
  const { user } = useAuth();

  const [question, setQuestion] = useState<ForumQuestion | null>(initialQuestion || null);
  const [answers, setAnswers] = useState<ForumAnswer[]>(initialAnswers || []);
  const [comments, setComments] = useState<Record<string, ForumComment[]>>(initialComments || {});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userVotes, setUserVotes] = useState<Record<string, number>>({}); // key: "targetType-targetId" -> voteType
  const [isBookmarked, setIsBookmarked] = useState(false);
  
  // Answer form
  const [showAnswerForm, setShowAnswerForm] = useState(false);
  const [answerContent, setAnswerContent] = useState('');
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  
  // Comment forms
  const [showCommentForms, setShowCommentForms] = useState<Record<string, boolean>>({});
  const [commentContents, setCommentContents] = useState<Record<string, string>>({});
  const [submittingComments, setSubmittingComments] = useState<Record<string, boolean>>({});

  // Load MathJax để render MathML
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const w = window as Window & { MathJax?: unknown };
    if (!w.MathJax) {
      w.MathJax = {
        loader: { load: ['input/mml', 'input/tex', 'output/chtml'] },
        options: {
          renderActions: { addMenu: [0, '', ''] },
          skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code'],
          ignoreHtmlClass: 'tex2jax_ignore',
          processHtmlClass: 'tex2jax_process',
        },
        chtml: { scale: 1, displayAlign: "center" },
        startup: {
          ready: () => {
            if (w.MathJax && typeof w.MathJax === 'object' && 'startup' in w.MathJax) {
              const mj = w.MathJax as { startup?: { defaultReady?: () => void } };
              mj.startup?.defaultReady?.();
            }
          },
        },
      } as unknown;
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/mml-chtml.js';
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);

  // Render HTML content với MathML và images
  const renderQuestionContent = (content: string) => {
    if (!content) return '';
    
    // Tạo một div tạm để parse HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    
    // Xử lý images
    doc.querySelectorAll('img').forEach(img => {
      const src = img.getAttribute('src');
      if (src && (src.startsWith('data:image') || src.startsWith('http'))) {
        // Giữ nguyên base64 image hoặc URL
        img.setAttribute('style', 'max-width: 100%; height: auto; display: block; margin: 10px 0;');
      }
    });
    
    // Đảm bảo MathML có namespace đúng và format đúng
    doc.querySelectorAll('math').forEach(math => {
      if (!math.getAttribute('xmlns')) {
        math.setAttribute('xmlns', 'http://www.w3.org/1998/Math/MathML');
      }
      // Đảm bảo MathML được format đúng để MathJax có thể parse
      math.setAttribute('display', 'inline');
    });
    
    return doc.body.innerHTML;
  };

  // Only load if no initial data provided
  useEffect(() => {
    if (questionId && !initialQuestion) {
      loadQuestion();
      loadAnswers();
      if (user?.id) {
        loadBookmarkStatus();
      }
    } else if (initialQuestion) {
      // Use initial data, no need to fetch
      setLoading(false);
    }
  }, [questionId, user?.id]);

  useEffect(() => {
    if (user?.id && questionId) {
      // Reset userVotes before loading to avoid stale data
      setUserVotes({});
      loadUserVotes();
    } else {
      // Clear userVotes when user logs out or questionId changes
      setUserVotes({});
    }
  }, [user?.id, questionId, answers.length]);

  const loadQuestion = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await forumApiService.getQuestionById(questionId);
      console.log('Question loaded:', { 
        id: data.id, 
        title: data.title, 
        voteCount: data.voteCount,
        viewCount: data.viewCount 
      });
      setQuestion(data);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Không thể tải câu hỏi';
      setError(errorMessage);
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
        } catch {
          commentsMap[answer.id] = [];
        }
      }
      setComments(commentsMap);
      
      // Load comments for question
      try {
        const questionComments = await forumApiService.getComments(1, questionId); // 1 = Question
        commentsMap[questionId] = questionComments;
        setComments(commentsMap);
      } catch {
        // Ignore
      }
    } catch (err: unknown) {
      console.error('Error loading answers:', err);
    }
  };

  const loadUserVotes = async () => {
    if (!user?.id || !questionId) {
      console.log('Cannot load user votes:', { hasUser: !!user?.id, hasQuestionId: !!questionId });
      return;
    }
    try {
      const userId = parseInt(user.id) || 0;
      const votes: Record<string, number> = {};
      
      // Load vote for question
      try {
        const questionVote = await forumApiService.getUserVote(1, questionId, userId);
        console.log('Question vote loaded:', { 
          questionId, 
          voteType: questionVote.voteType,
          hasVote: questionVote.voteType !== null,
          userId 
        });
        if (questionVote.voteType !== null && questionVote.voteType !== undefined) {
          votes[`1-${questionId}`] = questionVote.voteType;
        }
      } catch (err) {
        console.error('Error loading question vote:', err);
      }
      
      // Load votes for answers
      for (const answer of answers) {
        try {
          const answerVote = await forumApiService.getUserVote(2, answer.id, userId);
          if (answerVote.voteType !== null && answerVote.voteType !== undefined) {
            votes[`2-${answer.id}`] = answerVote.voteType;
          }
        } catch {
          // Ignore
        }
      }
      
      console.log('User votes loaded:', votes);
      console.log('Setting userVotes state with:', votes);
      setUserVotes(votes);
    } catch (err: unknown) {
      console.error('Error loading user votes:', err);
    }
  };

  const loadBookmarkStatus = async () => {
    if (!user?.id || !questionId) return;
    try {
      const userId = parseInt(user.id) || 0;
      const bookmarked = await forumApiService.isBookmarked(questionId, userId);
      setIsBookmarked(bookmarked);
    } catch (err) {
      console.error('Error loading bookmark status:', err);
    }
  };

  const handleVote = async (targetId: string, targetType: number, voteType: number) => {
    if (!user?.id) {
      alert('Vui lòng đăng nhập để vote');
      return;
    }

    try {
      const key = `${targetType}-${targetId}`;
      const currentVote = userVotes[key];
      
      // Logic: Mỗi user chỉ có 1 vote (up hoặc down)
      // - Nếu click cùng loại vote đã có → remove vote (toggle)
      // - Nếu click loại vote khác → thay đổi vote (remove cũ, tạo mới)
      let newVoteType: number;
      if (currentVote === voteType) {
        // Click lại cùng nút → remove vote
        newVoteType = 0;
      } else {
        // Click nút khác hoặc chưa có vote → set vote mới
        newVoteType = voteType;
      }
      
      console.log('Voting:', { 
        targetId, 
        targetType, 
        currentVote, 
        voteType, 
        newVoteType,
        userVotes: { ...userVotes },
        key,
        comparison: `currentVote (${currentVote}) === voteType (${voteType}) = ${currentVote === voteType}`,
        note: currentVote === undefined ? 'No existing vote - should create new vote' :
              currentVote === voteType ? 'Same vote type - will remove vote' :
              'Different vote type - will change vote'
      });
      
      // Always send the new vote type (0 to remove, 1 for upvote, -1 for downvote)
      const voteResult = await forumApiService.vote({
        targetId,
        targetType,
        userId: parseInt(user.id) || 0,
        voteType: newVoteType,
      });
      
      console.log('Vote result:', voteResult);
      console.log('Vote explanation:', {
        action: newVoteType === 1 ? 'UPVOTE' : newVoteType === -1 ? 'DOWNVOTE' : 'REMOVE',
        previousVote: currentVote,
        newVote: newVoteType,
        total: voteResult.total,
        note: voteResult.total < 0 ? 'Total is negative - there are more downvotes than upvotes' : 
              voteResult.total === 0 ? 'Total is zero - equal upvotes and downvotes' :
              'Total is positive - more upvotes than downvotes'
      });
      
      // Update local state immediately for better UX
      setUserVotes(prev => {
        const newVotes = { ...prev };
        if (newVoteType === 0) {
          delete newVotes[key];
        } else {
          newVotes[key] = newVoteType;
        }
        return newVotes;
      });
      
      // Update vote count immediately from response
      const total = voteResult.total;
      console.log('Updating vote count:', { targetType, targetId, total, question: !!question, answersCount: answers.length });
      
      // Force update vote count using functional updates
      if (targetType === 1) {
        // Update question vote count
        setQuestion(prev => {
          if (!prev) {
            console.warn('Question is null, cannot update vote count');
            return null;
          }
          const newQuestion = { ...prev, voteCount: total };
          console.log('Question vote count updated:', { old: prev.voteCount, new: total, questionId: prev.id });
          return newQuestion;
        });
      } else if (targetType === 2) {
        // Update answer vote count
        setAnswers(prev => {
          const updated = prev.map(a => {
            if (a.id === targetId) {
              console.log('Answer vote count updated:', { answerId: a.id, old: a.voteCount, new: total });
              return { ...a, voteCount: total };
            }
            return a;
          });
          console.log('Answers updated:', updated.map(a => ({ id: a.id, voteCount: a.voteCount })));
          return updated;
        });
      }
      
      // Reload data to ensure everything is in sync
      // Use longer delay to ensure backend has updated the Votes field
      setTimeout(async () => {
        console.log('Reloading data after vote...');
        await loadQuestion();
        await loadAnswers();
        // Reload user votes to ensure state is correct
        if (user?.id) {
          await loadUserVotes();
        }
        console.log('Data reloaded after vote');
      }, 500);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Không thể vote';
      alert(errorMessage);
      console.error('Vote error:', err);
    }
  };

  const handleBookmark = async () => {
    if (!user?.id || !questionId) return;
    try {
      const userId = parseInt(user.id) || 0;
      if (isBookmarked) {
        await forumApiService.removeBookmark(questionId, userId);
        setIsBookmarked(false);
      } else {
        await forumApiService.addBookmark(questionId, userId);
        setIsBookmarked(true);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Không thể bookmark';
      alert(errorMessage);
    }
  };

  const handleAcceptAnswer = async (answerId: string) => {
    if (!user?.id || !question) {
      return;
    }

    const isOwner = parseInt(user.id) === question.userId;
    const isAdminOrInstructor = user.role === 'admin' || user.role === 'instructor';

    if (!isOwner && !isAdminOrInstructor) {
      alert('Chỉ người đặt câu hỏi, Admin hoặc Instructor mới có thể chấp nhận câu trả lời');
      return;
    }

    try {
      await forumApiService.acceptAnswer(answerId);
      await loadQuestion();
      await loadAnswers();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Không thể chấp nhận câu trả lời';
      alert(errorMessage);
    }
  };

  const handleUnacceptAnswer = async (answerId: string) => {
    if (!user?.id || !question) {
      return;
    }

    const isOwner = parseInt(user.id) === question.userId;
    const isAdminOrInstructor = user.role === 'admin' || user.role === 'instructor';

    if (!isOwner && !isAdminOrInstructor) {
      alert('Chỉ người đặt câu hỏi, Admin hoặc Instructor mới có thể hủy chấp nhận câu trả lời');
      return;
    }

    try {
      await forumApiService.unacceptAnswer(answerId);
      await loadQuestion();
      await loadAnswers();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Không thể hủy chấp nhận câu trả lời';
      alert(errorMessage);
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
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Không thể gửi câu trả lời';
      alert(errorMessage);
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
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Không thể gửi bình luận';
      alert(errorMessage);
    } finally {
      setSubmittingComments(prev => ({ ...prev, [parentId]: false }));
    }
  };

  const handleDeleteQuestion = async () => {
    if (!confirm('Bạn có chắc chắn muốn xóa câu hỏi này?')) return;

    try {
      await forumApiService.deleteQuestion(questionId);
      router.push('/forum');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Không thể xóa câu hỏi';
      alert(errorMessage);
    }
  };

  const handleDeleteAnswer = async (answerId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa câu trả lời này?')) return;

    try {
      await forumApiService.deleteAnswer(answerId);
      await loadAnswers();
      await loadQuestion();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Không thể xóa câu trả lời';
      alert(errorMessage);
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
            href="/forum"
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
  const isAdminOrInstructor = user?.role === 'admin' || user?.role === 'instructor';
  const canAcceptAnswer = isQuestionOwner || isAdminOrInstructor;
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
            href="/forum"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Quay lại danh sách
          </Link>
          <div className="flex items-center justify-between">
            <h1 className={`text-3xl font-bold text-gray-900 ${
              question.isDeleted ? 'line-through opacity-60' : ''
            }`}>
              {question.isDeleted && <span className="mr-2 text-red-500">🗑️</span>}
              {question.title}
            </h1>
            {isQuestionOwner && (
              <button
                onClick={handleDeleteQuestion}
                className="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
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
                className={`p-2 hover:bg-gray-100 rounded transition-colors ${
                  userVotes[`1-${question.id}`] === 1 ? 'bg-blue-50' : ''
                }`}
                title="Upvote"
              >
                <ArrowUpIcon className={`h-6 w-6 ${
                  userVotes[`1-${question.id}`] === 1 ? 'text-blue-600' : 'text-gray-400 hover:text-blue-600'
                }`} />
              </button>
              <div className={`text-2xl font-semibold ${
                question.voteCount > 0 ? 'text-green-600' : 
                question.voteCount < 0 ? 'text-red-600' : 
                'text-gray-700'
              }`}>
                {question.voteCount}
              </div>
              <button
                onClick={() => handleVote(question.id, 1, -1)}
                className={`p-2 hover:bg-gray-100 rounded transition-colors ${
                  userVotes[`1-${question.id}`] === -1 ? 'bg-red-50' : ''
                }`}
                title="Downvote"
              >
                <ArrowDownIcon className={`h-6 w-6 ${
                  userVotes[`1-${question.id}`] === -1 ? 'text-red-600' : 'text-gray-400 hover:text-red-600'
                }`} />
              </button>
              {user && (
                <button 
                  onClick={handleBookmark}
                  className="p-2 hover:bg-gray-100 rounded transition-colors" 
                  title={isBookmarked ? 'Bỏ bookmark' : 'Bookmark'}
                >
                  {isBookmarked ? (
                    <BookmarkSolidIcon className="h-5 w-5 text-yellow-500" />
                  ) : (
                    <BookmarkIcon className="h-5 w-5 text-gray-400 hover:text-yellow-500" />
                  )}
                </button>
              )}
            </div>

            {/* Content Column */}
            <div className="flex-1">
              {question.isDeleted && (
                <div className="mb-2 text-sm text-red-600 font-medium">🗑️ Đã xóa</div>
              )}
              <div 
                className={`prose prose-sm max-w-none mb-4 ${
                  question.isDeleted ? 'line-through opacity-60' : ''
                }`}
                dangerouslySetInnerHTML={{ __html: renderQuestionContent(question.content) }}
                ref={(el) => {
                  if (el) {
                    // Typeset MathML sau khi element được render
                    const typeset = () => {
                      const w = window as Window & { MathJax?: { typesetPromise?: (elements?: unknown) => Promise<unknown> } };
                      if (w.MathJax && typeof w.MathJax.typesetPromise === 'function') {
                        const mathElements = el.querySelectorAll('math');
                        if (mathElements.length > 0) {
                          w.MathJax.typesetPromise(mathElements as unknown).catch(() => {});
                        } else {
                          w.MathJax.typesetPromise([el] as unknown).catch(() => {});
                        }
                      }
                    };
                    typeset();
                    setTimeout(typeset, 100);
                    setTimeout(typeset, 300);
                  }
                }}
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
                      <div 
                        dangerouslySetInnerHTML={{ __html: renderQuestionContent(comment.content) }}
                        ref={(el) => {
                          if (el) {
                            // Typeset MathML sau khi element được render
                            const typeset = () => {
                              const w = window as Window & { MathJax?: { typesetPromise?: (elements?: unknown) => Promise<unknown> } };
                              if (w.MathJax && typeof w.MathJax.typesetPromise === 'function') {
                                const mathElements = el.querySelectorAll('math');
                                if (mathElements.length > 0) {
                                  w.MathJax.typesetPromise(mathElements as unknown).catch(() => {});
                                } else {
                                  w.MathJax.typesetPromise([el] as unknown).catch(() => {});
                                }
                              }
                            };
                            typeset();
                            setTimeout(typeset, 100);
                            setTimeout(typeset, 300);
                          }
                        }}
                      />
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
                      <RichTextEditor
                        value={commentContents[questionId] || ''}
                        onChange={(value) => setCommentContents(prev => ({ ...prev, [questionId]: value }))}
                        placeholder="Thêm bình luận..."
                        className="w-full"
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
                        className={`p-2 hover:bg-gray-100 rounded transition-colors ${
                          userVotes[`2-${answer.id}`] === 1 ? 'bg-blue-50' : ''
                        }`}
                        title="Upvote"
                      >
                        <ArrowUpIcon className={`h-6 w-6 ${
                          userVotes[`2-${answer.id}`] === 1 ? 'text-blue-600' : 'text-gray-400 hover:text-blue-600'
                        }`} />
                      </button>
                      <div className={`text-2xl font-semibold ${
                        answer.voteCount > 0 ? 'text-green-600' : 
                        answer.voteCount < 0 ? 'text-red-600' : 
                        'text-gray-700'
                      }`}>
                        {answer.voteCount}
                      </div>
                      <button
                        onClick={() => handleVote(answer.id, 2, -1)}
                        className={`p-2 hover:bg-gray-100 rounded transition-colors ${
                          userVotes[`2-${answer.id}`] === -1 ? 'bg-red-50' : ''
                        }`}
                        title="Downvote"
                      >
                        <ArrowDownIcon className={`h-6 w-6 ${
                          userVotes[`2-${answer.id}`] === -1 ? 'text-red-600' : 'text-gray-400 hover:text-red-600'
                        }`} />
                      </button>
                      {canAcceptAnswer && !answer.isDeleted && (
                        <>
                          {answer.isAccepted ? (
                            <button
                              onClick={() => handleUnacceptAnswer(answer.id)}
                              className="p-2 rounded transition-colors bg-green-100 text-green-600 hover:bg-green-200"
                              title="Hủy chấp nhận"
                            >
                              <CheckCircleSolidIcon className="h-6 w-6 text-green-600" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleAcceptAnswer(answer.id)}
                              className="p-2 rounded transition-colors hover:bg-gray-100 text-gray-400"
                              title="Chấp nhận câu trả lời"
                            >
                              <CheckCircleIcon className="h-6 w-6" />
                            </button>
                          )}
                        </>
                      )}
                      {answer.isAccepted && (
                        <div className="text-green-600 font-semibold text-xs">✓ Đã chấp nhận</div>
                      )}
                    </div>

                    {/* Content Column */}
                    <div className="flex-1">
                      {answer.isDeleted && (
                        <div className="mb-2 text-sm text-red-600 font-medium">🗑️ Đã xóa</div>
                      )}
                      <div 
                        className={`prose prose-sm max-w-none mb-4 ${
                          answer.isDeleted ? 'line-through opacity-60' : ''
                        }`}
                        dangerouslySetInnerHTML={{ __html: renderQuestionContent(answer.content) }}
                        ref={(el) => {
                          if (el) {
                            // Typeset MathML sau khi element được render
                            const typeset = () => {
                              const w = window as Window & { MathJax?: { typesetPromise?: (elements?: unknown) => Promise<unknown> } };
                              if (w.MathJax && typeof w.MathJax.typesetPromise === 'function') {
                                const mathElements = el.querySelectorAll('math');
                                if (mathElements.length > 0) {
                                  w.MathJax.typesetPromise(mathElements as unknown).catch(() => {});
                                } else {
                                  w.MathJax.typesetPromise([el] as unknown).catch(() => {});
                                }
                              }
                            };
                            typeset();
                            setTimeout(typeset, 100);
                            setTimeout(typeset, 300);
                          }
                        }}
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
                              <div 
                                dangerouslySetInnerHTML={{ __html: renderQuestionContent(comment.content) }}
                                ref={(el) => {
                                  if (el) {
                                    // Typeset MathML sau khi element được render
                                    const typeset = () => {
                                      const w = window as Window & { MathJax?: { typesetPromise?: (elements?: unknown) => Promise<unknown> } };
                                      if (w.MathJax && typeof w.MathJax.typesetPromise === 'function') {
                                        const mathElements = el.querySelectorAll('math');
                                        if (mathElements.length > 0) {
                                          w.MathJax.typesetPromise(mathElements as unknown).catch(() => {});
                                        } else {
                                          w.MathJax.typesetPromise([el] as unknown).catch(() => {});
                                        }
                                      }
                                    };
                                    typeset();
                                    setTimeout(typeset, 100);
                                    setTimeout(typeset, 300);
                                  }
                                }}
                              />
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
                              <RichTextEditor
                                value={commentContents[answer.id] || ''}
                                onChange={(value) => setCommentContents(prev => ({ ...prev, [answer.id]: value }))}
                                placeholder="Thêm bình luận..."
                                className="w-full"
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

