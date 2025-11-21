'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Search,
  Save,
  Video,
  FileText,
  Loader2,
  Upload,
  X
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useBooks } from '@/hooks/useBooks';
import { bookApiService, Book, BookQuestion, BookChapter } from '@/services/bookApi';
import { solutionsApi } from '@/services/solutionsApi';
import { renameFileWithTimestamp } from '@/utils/fileUtils';
import LatexPreview from '@/components/LatexPreview';
import { useAuth } from '@/contexts/AuthContext';

declare global {
  interface Window {
    MathJax?: any;
  }
}

export default function SolutionsPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const userRole = String(user?.role ?? '').toLowerCase();
  const isTeacher = userRole === 'instructor';
  const authorId = isTeacher && user?.id ? Number(user.id) : undefined;

  const [bookQuery, setBookQuery] = useState('');
  const [bookPage, setBookPage] = useState(1);
  const { books: searchBooks, loading: searchLoading, pagination } = useBooks({ 
    page: bookPage, 
    pageSize: 10, 
    search: bookQuery,
    authorId
  }, { enabled: !!isAuthenticated && (!isTeacher || !!authorId) });
  const [selectedBookId, setSelectedBookId] = useState<number | null>(null);

  const totalPages = pagination?.totalPages || 1;
  const [selectedChapterId, setSelectedChapterId] = useState<number | null>(null);
  const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(null);
  const [chapters, setChapters] = useState<BookChapter[]>([]);
  const [questions, setQuestions] = useState<BookQuestion[]>([]);
  const [currentSolution, setCurrentSolution] = useState<BookQuestion | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingChapters, setLoadingChapters] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [explanationContent, setExplanationContent] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);

  useEffect(() => {
    if (selectedBookId) {
      fetchChapters();
    } else {
      setChapters([]);
      setQuestions([]);
      setCurrentSolution(null);
      setSelectedChapterId(null);
      setSelectedQuestionId(null);
    }
  }, [selectedBookId]);

  useEffect(() => {
    if (selectedChapterId) {
      fetchQuestions();
    } else {
      setQuestions([]);
      setCurrentSolution(null);
      setSelectedQuestionId(null);
    }
  }, [selectedChapterId]);

  useEffect(() => {
    if (selectedQuestionId) {
      fetchSolution();
    } else {
      setCurrentSolution(null);
      resetForm();
    }
  }, [selectedQuestionId]);

  // Load MathJax để render MathML
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const w = window as any;
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
            if (w.MathJax && w.MathJax.startup) {
              w.MathJax.startup.defaultReady && w.MathJax.startup.defaultReady();
            }
          },
        },
      };
      const script = document.createElement('script');
      script.src = 'https://polyfill.io/v3/polyfill.min.js?features=es6';
      script.async = true;
      document.head.appendChild(script);
      const mathJaxScript = document.createElement('script');
      mathJaxScript.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/startup.js';
      mathJaxScript.async = true;
      document.head.appendChild(mathJaxScript);
    }
  }, []);

  // Function to render question content with MathML support
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

  // Inject CSS for MathML rendering
  useEffect(() => {
    const styleId = 'mathml-solutions-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .question-content math,
      .option-content math,
      .explanation-content math {
        line-height: 1.5;
        vertical-align: middle;
      }
      .question-content math[display="block"],
      .option-content math[display="block"],
      .explanation-content math[display="block"] {
        display: block;
        text-align: center;
        margin: 10px 0;
      }
      .question-content img,
      .option-content img,
      .explanation-content img {
        max-width: 100%;
        height: auto;
        display: block;
        margin: 10px 0;
      }
      .question-content,
      .option-content,
      .explanation-content {
        line-height: 1.6;
      }
    `;
    document.head.appendChild(style);

    return () => {
      const existingStyle = document.getElementById(styleId);
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, []);

  const fetchChapters = async () => {
    if (!selectedBookId) return;
    try {
      setLoadingChapters(true);
      const data = await bookApiService.getBookChapters(selectedBookId);
      setChapters(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e?.message || 'Không thể tải danh sách chương');
    } finally {
      setLoadingChapters(false);
    }
  };

  const fetchQuestions = async () => {
    if (!selectedBookId || !selectedChapterId) {
      console.log('Missing params:', { selectedBookId, selectedChapterId });
      return;
    }
    try {
      setLoading(true);
      const data = await bookApiService.getBookQuestions(selectedBookId, 1, 100);
      console.log('Fetched questions:', data);
      console.log('Questions count:', Array.isArray(data) ? data.length : 0);
      console.log('Selected chapterId:', selectedChapterId, 'type:', typeof selectedChapterId);
      
      // Filter questions by chapter
      const filteredQuestions = Array.isArray(data) 
        ? data.filter(q => {
            // Try multiple ways to get chapterId
            const chapterId = q.chapterId ?? (q as any).ChapterId ?? (q as any).chapterId ?? null;
            const chapterIdNum = chapterId !== null && chapterId !== undefined ? Number(chapterId) : null;
            const selectedChapterIdNum = Number(selectedChapterId);
            const matches = chapterIdNum !== null && chapterIdNum === selectedChapterIdNum;
            
            console.log('Filtering question:', {
              id: q.id,
              rawChapterId: q.chapterId,
              rawChapterIdCapital: (q as any).ChapterId,
              chapterId,
              chapterIdNum,
              selectedChapterId,
              selectedChapterIdNum,
              matches,
              fullQuestion: q
            });
            
            return matches;
          })
        : [];
      
      console.log('Filtered questions count:', filteredQuestions.length);
      console.log('Filtered questions:', filteredQuestions);
      
      // Always set questions, even if empty
      setQuestions(filteredQuestions);
      
      // Clear error first
      setError(null);
      
      // If no questions match but we have data, show helpful message
      if (filteredQuestions.length === 0 && Array.isArray(data) && data.length > 0) {
        // Find unique chapterIds in all questions
        const allChapterIds = [...new Set(data.map(q => {
          const chId = q.chapterId || (q as any).ChapterId;
          return chId ? Number(chId) : null;
        }).filter(id => id !== null))];
        
        console.warn('No questions matched filter.', {
          selectedChapterId,
          availableChapterIds: allChapterIds,
          allQuestions: data.map(q => ({
            id: q.id,
            chapterId: q.chapterId || (q as any).ChapterId,
            question: (q.question || q.QuestionContent || '').substring(0, 50)
          }))
        });
        
        // Show helpful message
        if (allChapterIds.length > 0) {
          setError(`Không có câu hỏi trong chương ${selectedChapterId}. Các chương có câu hỏi: ${allChapterIds.join(', ')}`);
        } else {
          setError('Chưa có câu hỏi nào trong sách này');
        }
      } else if (filteredQuestions.length > 0) {
        // Clear error if we have questions
        setError(null);
      }
    } catch (e: any) {
      console.error('Error fetching questions:', e);
      setError(e?.message || 'Không thể tải câu hỏi');
    } finally {
      setLoading(false);
    }
  };

  const fetchSolution = async () => {
    if (!selectedQuestionId) return;
    try {
      setLoading(true);
      const result = await solutionsApi.getSolutions({ questionId: selectedQuestionId });
      setCurrentSolution(result);
      // Map from backend response
      const explanation = result.explanationContent || result.ExplanationContent || result.explanation || '';
      const video = result.videoUrl || result.VideoUrl || '';
      setExplanationContent(explanation);
      setVideoUrl(video);
    } catch (e: any) {
      setError(e?.message || 'Không thể tải lời giải');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setExplanationContent('');
    setVideoUrl('');
    setVideoFile(null);
  };

  const handleVideoUpload = async () => {
    if (!videoFile) {
      alert('Vui lòng chọn file video');
      return;
    }

    if (!selectedQuestionId) {
      alert('Vui lòng chọn câu hỏi trước');
      return;
    }

    try {
      setUploadingVideo(true);
      console.log('Starting video upload:', { fileName: videoFile.name, size: videoFile.size, type: videoFile.type });
      
      // Đổi tên file trước khi upload để tránh trùng tên
      const renamedVideoFile = renameFileWithTimestamp(videoFile, user?.id);
      
      // Step 1: Upload video
      const uploadedUrl = await solutionsApi.uploadVideo(renamedVideoFile);
      console.log('Video uploaded successfully, URL:', uploadedUrl);
      
      // Step 2: Automatically update VideoUrl in database
      try {
        await solutionsApi.updateSolution(selectedQuestionId, {
          videoUrl: uploadedUrl
        });
        console.log('VideoUrl updated in database:', uploadedUrl);
        
        // Step 3: Update local state and refresh
        setVideoUrl(uploadedUrl);
        setVideoFile(null); // Clear file after upload
        await fetchSolution(); // Refresh to get updated data
        alert('Upload video và lưu thành công!');
      } catch (updateError) {
        console.error('Error updating VideoUrl:', updateError);
        // Even if update fails, show the uploaded URL
        setVideoUrl(uploadedUrl);
        alert('Upload video thành công nhưng lưu vào database thất bại. Vui lòng lưu lại thủ công.');
      }
    } catch (e: any) {
      console.error('Video upload error:', e);
      alert(e?.message || 'Upload video thất bại');
    } finally {
      setUploadingVideo(false);
    }
  };

  const handleSave = async () => {
    if (!selectedQuestionId) {
      alert('Vui lòng chọn câu hỏi');
      return;
    }

    try {
      setSaving(true);
      await solutionsApi.updateSolution(selectedQuestionId, {
        explanationContent: explanationContent.trim() || undefined,
        videoUrl: videoUrl.trim() || undefined
      });
      alert('Lưu lời giải thành công!');
      await fetchSolution();
    } catch (e: any) {
      alert(e?.message || 'Lưu lời giải thất bại');
    } finally {
      setSaving(false);
    }
  };

  const selectedBook = searchBooks.find(b => b.id === selectedBookId);
  const selectedQuestion = questions.find(q => q.id === selectedQuestionId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-6">
      <div className="relative z-10 max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-3 mb-6">
            <FileText className="w-10 h-10 text-blue-600" />
          Quản Lý Lời Giải
          </h1>

        {/* Book Search */}
        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-md mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              Tìm & Chọn Sách
            </CardTitle>
            <CardDescription>Chọn sách để xem câu hỏi và thêm lời giải</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                  placeholder="Nhập từ khóa tên sách..."
                  value={bookQuery}
                  onChange={(e) => { setBookQuery(e.target.value); setBookPage(1); }}
                className="pl-10"
              />
              </div>
              <div className="text-sm text-gray-500 flex items-center">{searchLoading ? 'Đang tìm...' : `Kết quả: ${searchBooks.length}`}</div>
            </div>

            <div className="mt-4 max-h-80 overflow-y-auto rounded-lg border border-gray-200 bg-white">
              {searchLoading ? (
                <div className="p-4 text-gray-500 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Đang tải...
                </div>
              ) : searchBooks.length === 0 ? (
                <div className="p-4 text-gray-500">Không có kết quả</div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {searchBooks.map((b) => (
                    <li key={b.id}>
                  <button
                        type="button"
                        onClick={() => { 
                          setSelectedBookId(b.id); 
                          setSelectedChapterId(null);
                          setSelectedQuestionId(null); 
                        }}
                        className={`w-full text-left p-3 hover:bg-blue-50 ${selectedBookId === b.id ? 'bg-blue-50' : ''}`}
                      >
                        <div className="font-medium text-gray-900">{b.title}</div>
                        <div className="text-xs text-gray-500">ID: {b.id}</div>
                  </button>
                    </li>
                ))}
                </ul>
              )}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-3">
              <Button 
                variant="outline" 
                disabled={bookPage === 1 || searchLoading} 
                onClick={() => setBookPage((p) => Math.max(1, p - 1))}
              >
                Trang trước
              </Button>
              <div className="text-sm text-gray-500">
                Trang {bookPage} / {totalPages}
              </div>
              <Button 
                variant="outline" 
                disabled={searchLoading || bookPage >= totalPages} 
                onClick={() => setBookPage((p) => Math.min(totalPages, p + 1))}
              >
                Trang sau
              </Button>
            </div>

            {selectedBook && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Sách đã chọn:</span> {selectedBook.title}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Chapters List */}
        {selectedBookId && (
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-md mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                Chọn Chương
              </CardTitle>
              <CardDescription>Chọn chương để xem câu hỏi</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingChapters ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                </div>
              ) : chapters.length === 0 ? (
                <div className="text-center py-8 text-gray-500">Chưa có chương</div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {chapters.map((ch) => (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={() => { 
                        setSelectedChapterId(ch.id); 
                        setSelectedQuestionId(null); 
                      }}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        selectedChapterId === ch.id
                          ? 'bg-blue-50 border-blue-300'
                          : 'bg-white border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{ch.title}</div>
                          {ch.content && (
                            <div className="text-xs text-gray-500 mt-1 line-clamp-2">{ch.content}</div>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Questions List */}
        {selectedBookId && selectedChapterId && (
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-md mb-6">
            <CardHeader>
              <CardTitle>Câu hỏi trong chương</CardTitle>
              <CardDescription>Chọn câu hỏi để xem/thêm lời giải</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                </div>
              ) : questions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="mb-2">Chưa có câu hỏi trong chương này</p>
                  {error && (
                    <div className="text-xs mt-2 text-blue-600 bg-blue-50 p-2 rounded">
                      {error}
                    </div>
                  )}
                  <div className="text-xs mt-2 text-gray-400">
                    Debug: questions.length = {questions.length}, selectedChapterId = {selectedChapterId}
                  </div>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  <div className="text-xs text-gray-400 mb-2">Hiển thị {questions.length} câu hỏi</div>
                  {questions.map((q) => {
                    console.log('Rendering question:', q);
                    return (
                        <button
                      key={q.id}
                      type="button"
                      onClick={() => setSelectedQuestionId(q.id)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        selectedQuestionId === q.id
                          ? 'bg-blue-50 border-blue-300'
                          : 'bg-white border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div 
                            className="font-medium text-gray-900 line-clamp-2 question-content"
                            dangerouslySetInnerHTML={{ 
                              __html: renderQuestionContent(q.question || q.QuestionContent || 'N/A') 
                            }}
                            ref={(el) => {
                              if (el) {
                                const typeset = () => {
                                  const w = window as any;
                                  if (w.MathJax && typeof w.MathJax.typesetPromise === 'function') {
                                    const mathElements = el.querySelectorAll('math');
                                    if (mathElements.length > 0) {
                                      w.MathJax.typesetPromise(mathElements as any).catch(() => {});
                                    } else {
                                      w.MathJax.typesetPromise([el] as any).catch(() => {});
                                    }
                                  }
                                };
                                typeset();
                                setTimeout(typeset, 100);
                                setTimeout(typeset, 300);
                              }
                            }}
                          />
                          <div className="flex items-center gap-2 mt-1">
                            {(q.explanation || q.explanationContent || q.ExplanationContent) ? (
                              <Badge variant="default" className="bg-green-100 text-green-700">Có lời giải</Badge>
                            ) : (
                              <Badge variant="outline">Chưa có lời giải</Badge>
                            )}
                            {(q.videoUrl || q.VideoUrl) ? (
                              <Badge variant="default" className="bg-purple-100 text-purple-700">Có video</Badge>
                            ) : null}
                          </div>
                        </div>
                          </div>
                        </button>
                      );
                    })}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Solution Editor */}
        {selectedQuestionId && selectedQuestion && (
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-md">
            <CardHeader>
              <CardTitle>Lời giải cho câu hỏi</CardTitle>
              <CardDescription>
                <div 
                  className="question-content"
                  dangerouslySetInnerHTML={{ 
                    __html: renderQuestionContent(selectedQuestion.question || selectedQuestion.QuestionContent || 'N/A') 
                  }}
                  ref={(el) => {
                    if (el) {
                      const typeset = () => {
                        const w = window as any;
                        if (w.MathJax && typeof w.MathJax.typesetPromise === 'function') {
                          const mathElements = el.querySelectorAll('math');
                          if (mathElements.length > 0) {
                            w.MathJax.typesetPromise(mathElements as any).catch(() => {});
                          } else {
                            w.MathJax.typesetPromise([el] as any).catch(() => {});
                          }
                        }
                      };
                      typeset();
                      setTimeout(typeset, 100);
                      setTimeout(typeset, 300);
                    }
                  }}
                />
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Explanation Content Editor */}
              <div>
                <Label htmlFor="explanation">Nội dung lời giải (Text/LaTeX)</Label>
                <Textarea
                  id="explanation"
                  value={explanationContent}
                  onChange={(e) => setExplanationContent(e.target.value)}
                  rows={10}
                  placeholder="Nhập lời giải chi tiết cho câu hỏi (hỗ trợ LaTeX)..."
                  className="mt-2 font-mono"
                />
                {explanationContent && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                    <Label className="text-sm mb-2 block">Preview:</Label>
                    <LatexPreview content={explanationContent} />
                  </div>
                )}
                        </div>

              {/* Video Upload */}
              <div>
                <Label>Video hướng dẫn</Label>
                <div className="mt-2 space-y-3">
                  {videoUrl && (
                    <div className="space-y-3">
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Video className="w-5 h-5 text-green-600" />
                          <span className="text-sm text-green-700">Video đã tải lên</span>
                          <a href={videoUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline ml-2">
                            Xem video
                          </a>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => { setVideoUrl(''); setVideoFile(null); }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="rounded-lg overflow-hidden border">
                        <video
                          src={videoUrl}
                          controls
                          className="w-full max-h-96"
                          preload="metadata"
                        >
                          Trình duyệt của bạn không hỗ trợ video.
                        </video>
                      </div>
                    </div>
                  )}
                  
                  {!videoUrl && (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                      <div className="flex flex-col items-center gap-3">
                        <Upload className="w-8 h-8 text-gray-400" />
                        <div className="text-center">
                          <Label htmlFor="video-upload" className="cursor-pointer text-blue-600 hover:text-blue-700">
                            Chọn file video
                    </Label>
                    <Input
                            id="video-upload"
                            type="file"
                            accept="video/*"
                            onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                            className="hidden"
                          />
                          {videoFile && (
                            <div className="mt-2 text-sm text-gray-600">
                              Đã chọn: {videoFile.name} ({(videoFile.size / 1024 / 1024).toFixed(2)} MB)
                            </div>
                          )}
                        </div>
                        {videoFile && (
                          <Button
                            onClick={handleVideoUpload}
                            disabled={uploadingVideo}
                            className="mt-2"
                          >
                            {uploadingVideo ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Đang tải lên...
                              </>
                            ) : (
                              <>
                                <Upload className="w-4 h-4 mr-2" />
                                Tải video lên
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => { setSelectedQuestionId(null); resetForm(); }}>
                      Hủy
                    </Button>
                <Button onClick={handleSave} disabled={saving || uploadingVideo}>
                      {saving ? (
                        <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Đang lưu...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                      Lưu lời giải
                        </>
                      )}
                    </Button>
                  </div>
              </CardContent>
          </Card>
        )}

        {!selectedBookId && (
        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-md">
            <CardContent className="py-12 text-center">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">Vui lòng chọn sách để xem câu hỏi</p>
          </CardContent>
        </Card>
        )}

        {selectedBookId && !selectedChapterId && (
        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-md">
            <CardContent className="py-12 text-center">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">Vui lòng chọn chương để xem câu hỏi</p>
          </CardContent>
        </Card>
        )}
      </div>
    </div>
  );
}
