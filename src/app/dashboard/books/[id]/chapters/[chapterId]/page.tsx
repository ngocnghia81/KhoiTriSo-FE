'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save, Trash2, Eye, EyeOff, Plus, Edit, X, FileQuestion, FileUp, Search, Hash } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RichTextEditor } from '@/components/RichTextEditor';
import { ImportQuestionsFromWordForBook } from '@/components/ImportQuestionsFromWordForBook';
import { LatexEditor } from '@/components/LatexRenderer';
import { bookApiService, BookChapter, BookQuestion } from '@/services/bookApi';
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch';

export default function BookChapterDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { authenticatedFetch } = useAuthenticatedFetch();
  const bookId = params?.id ? parseInt(params.id as string) : null;
  const chapterId = params?.chapterId ? parseInt(params.chapterId as string) : null;

  const [chapter, setChapter] = useState<BookChapter | null>(null);
  const [bookTitle, setBookTitle] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<BookQuestion[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<number | null>(null);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [showImportWord, setShowImportWord] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'number' | 'question' | 'answer'>('number');
  const [highlightedQuestionId, setHighlightedQuestionId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    orderIndex: 0,
    isPublished: false,
  });

  const [questionForm, setQuestionForm] = useState({
    question: '',
    questionType: 1, // 1: Multiple choice, 2: True/False, etc.
    options: ['', '', '', ''] as string[],
    correctAnswer: '',
    explanation: '',
    difficulty: 1, // 1: Easy, 2: Medium, 3: Hard
  });

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

  // Typeset MathML sau khi questions được render
  useEffect(() => {
    if (questions.length > 0) {
      const w = window as any;
      if (w && w.MathJax && typeof w.MathJax.typesetPromise === 'function') {
        // Đợi DOM render xong rồi mới typeset
        const timer = setTimeout(() => {
          w.MathJax.typesetPromise().catch((err: any) => {
            console.warn('MathJax typeset error:', err);
          });
        }, 300);
        return () => clearTimeout(timer);
      }
    }
  }, [questions]);

  useEffect(() => {
    if (!bookId || !chapterId) {
      setError('ID sách hoặc chương không hợp lệ');
      setLoading(false);
      return;
    }

    const fetchChapterData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch book title
        try {
          const book = await bookApiService.getBookById(bookId);
          setBookTitle(book.title);
        } catch (err) {
          console.warn('Could not load book title:', err);
        }

        // Fetch chapters to find the specific chapter
        const chapters = await bookApiService.getBookChapters(bookId);
        const foundChapter = chapters.find((ch: BookChapter) => ch.id === chapterId);

        if (!foundChapter) {
          setError('Không tìm thấy chương này');
          setLoading(false);
          return;
        }

        setChapter(foundChapter);
        setFormData({
          title: foundChapter.title || '',
          content: foundChapter.content || '',
          orderIndex: foundChapter.orderIndex || 0,
          isPublished: foundChapter.isPublished || false,
        });

        // Fetch questions for this chapter
        await fetchChapterQuestions();
      } catch (err: any) {
        console.error('Error fetching chapter:', err);
        setError(err.message || 'Không thể tải thông tin chương');
      } finally {
        setLoading(false);
      }
    };

    fetchChapterData();
  }, [bookId, chapterId]);

  const fetchChapterQuestions = async () => {
    if (!bookId || !chapterId) return;

    try {
      setLoadingQuestions(true);
      const allQuestions = await bookApiService.getBookQuestions(bookId, 1, 1000);
      
      // Filter questions by chapter
      const chapterQuestions = allQuestions.filter((q: BookQuestion) => {
        const qChapterId = q.chapterId ?? (q as any).ChapterId;
        return qChapterId === chapterId;
      });

      setQuestions(chapterQuestions);
    } catch (err: any) {
      console.error('Error fetching questions:', err);
      setQuestions([]);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleSave = async () => {
    if (!bookId || !chapterId) return;

    try {
      setSaving(true);
      setError(null);

      // Build request body, only include description if it has content
      const requestBody: any = {
        title: formData.title,
        orderIndex: formData.orderIndex,
      };

      // Only include description if content is not empty (trim to handle whitespace)
      const trimmedContent = formData.content?.trim() || '';
      if (trimmedContent.length > 0) {
        requestBody.description = trimmedContent;
      } else {
        // If content is empty, send empty string to clear description
        // But ensure it's at least an empty string, not null
        requestBody.description = '';
      }

      const response = await authenticatedFetch(
        `/api/books/${bookId}/chapters/${chapterId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Không thể cập nhật chương');
      }

      const result = await response.json();
      console.log('Chapter updated successfully:', result);

      // Navigate back to book detail page
      router.push(`/dashboard/books/${bookId}`);
    } catch (err: any) {
      console.error('Error updating chapter:', err);
      setError(err.message || 'Không thể cập nhật chương');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!bookId || !chapterId) return;
    if (!confirm('Bạn có chắc chắn muốn xóa chương này?')) return;

    try {
      setSaving(true);
      setError(null);

      const response = await authenticatedFetch(
        `/api/books/${bookId}/chapters/${chapterId}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Không thể xóa chương');
      }

      // Navigate back to book detail page
      router.push(`/dashboard/books/${bookId}`);
    } catch (err: any) {
      console.error('Error deleting chapter:', err);
      setError(err.message || 'Không thể xóa chương');
      setSaving(false);
    }
  };

  const handleSaveQuestion = async (questionId?: number) => {
    if (!bookId) return;

    try {
      setSaving(true);
      setError(null);

      const questionData = {
        questionContent: questionForm.question,
        questionType: questionForm.questionType,
        options: questionForm.options.filter(opt => opt.trim() !== ''),
        correctAnswer: questionForm.correctAnswer,
        explanation: questionForm.explanation,
        difficulty: questionForm.difficulty,
        chapterId: chapterId,
        orderIndex: questions.length + 1,
      };

      let response;
      if (questionId) {
        // Update existing question
        response = await authenticatedFetch(
          `/api/books/${bookId}/questions/${questionId}`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(questionData),
          }
        );
      } else {
        // Create new question
        response = await authenticatedFetch(
          `/api/books/${bookId}/questions`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(questionData),
          }
        );
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Không thể lưu câu hỏi');
      }

      // Refresh questions
      await fetchChapterQuestions();
      setEditingQuestionId(null);
      setShowAddQuestion(false);
      setQuestionForm({
        question: '',
        questionType: 1,
        options: ['', '', '', ''],
        correctAnswer: '',
        explanation: '',
        difficulty: 1,
      });
    } catch (err: any) {
      console.error('Error saving question:', err);
      setError(err.message || 'Không thể lưu câu hỏi');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteQuestion = async (questionId: number) => {
    if (!bookId || !confirm('Bạn có chắc chắn muốn xóa câu hỏi này?')) return;

    try {
      setSaving(true);
      const response = await authenticatedFetch(
        `/api/books/${bookId}/questions/${questionId}`,
        { method: 'DELETE' }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Không thể xóa câu hỏi');
      }

      await fetchChapterQuestions();
    } catch (err: any) {
      console.error('Error deleting question:', err);
      setError(err.message || 'Không thể xóa câu hỏi');
    } finally {
      setSaving(false);
    }
  };

  const startEditQuestion = (question: BookQuestion) => {
    setEditingQuestionId(question.id);
    setQuestionForm({
      question: question.question || question.QuestionContent || '',
      questionType: question.questionType || question.QuestionType || 1,
      options: question.options?.map(opt => opt.optionText || opt.OptionText || '') || ['', '', '', ''],
      correctAnswer: question.correctAnswer || '',
      explanation: question.explanation || question.explanationContent || question.ExplanationContent || '',
      difficulty: question.difficulty || question.DifficultyLevel || 1,
    });
  };

  // Filter questions based on search
  const filteredQuestions = React.useMemo(() => {
    if (!searchQuery.trim()) return questions;

    const query = searchQuery.trim().toLowerCase();
    
    if (searchType === 'number') {
      // Tìm theo số câu hỏi
      const questionNumber = parseInt(query);
      if (!isNaN(questionNumber) && questionNumber > 0 && questionNumber <= questions.length) {
        return [questions[questionNumber - 1]].filter(Boolean);
      }
      return [];
    } else if (searchType === 'question') {
      // Tìm theo nội dung câu hỏi
      return questions.filter(q => {
        const questionText = (q.question || q.QuestionContent || '').toLowerCase();
        // Remove HTML tags for searching
        const textOnly = questionText.replace(/<[^>]*>/g, '');
        return textOnly.includes(query);
      });
    } else if (searchType === 'answer') {
      // Tìm theo đáp án (trong các lựa chọn)
      return questions.filter(q => {
        if (!q.options || q.options.length === 0) return false;
        return q.options.some(opt => {
          const optionText = (opt.optionText || opt.OptionText || '').toLowerCase();
          const textOnly = optionText.replace(/<[^>]*>/g, '');
          return textOnly.includes(query);
        });
      });
    }
    
    return questions;
  }, [questions, searchQuery, searchType]);

  // Scroll to question when search result is found
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setHighlightedQuestionId(null);
      return;
    }

    if (filteredQuestions.length > 0) {
      const firstMatch = filteredQuestions[0];
      setHighlightedQuestionId(firstMatch.id);
      
      // Scroll to the question
      setTimeout(() => {
        const element = document.getElementById(`question-${firstMatch.id}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Highlight effect
          element.classList.add('ring-4', 'ring-blue-400', 'ring-opacity-50');
          setTimeout(() => {
            element.classList.remove('ring-4', 'ring-blue-400', 'ring-opacity-50');
          }, 2000);
        }
      }, 100);
    } else {
      setHighlightedQuestionId(null);
    }
  };

  // Auto search when query changes
  useEffect(() => {
    if (searchQuery.trim()) {
      if (filteredQuestions.length > 0) {
        const firstMatch = filteredQuestions[0];
        setHighlightedQuestionId(firstMatch.id);
        
        // Scroll to the question
        setTimeout(() => {
          const element = document.getElementById(`question-${firstMatch.id}`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // Highlight effect
            element.classList.add('ring-4', 'ring-blue-400', 'ring-opacity-50');
            setTimeout(() => {
              element.classList.remove('ring-4', 'ring-blue-400', 'ring-opacity-50');
            }, 2000);
          }
        }, 100);
      } else {
        setHighlightedQuestionId(null);
      }
    } else {
      setHighlightedQuestionId(null);
    }
  }, [searchQuery, searchType, filteredQuestions]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !chapter) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-600">{error}</p>
              <Button
                variant="outline"
                onClick={() => router.push(`/dashboard/books/${bookId}`)}
                className="mt-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Quay lại
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <>
      <style jsx global>{`
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
      `}</style>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push(`/dashboard/books/${bookId}`)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {bookTitle && `${bookTitle} - `}Chương {chapter?.orderIndex || formData.orderIndex}
            </h1>
            <p className="text-gray-600 mt-2">Chỉnh sửa nội dung chương</p>
          </div>
        </div>

        {error && (
          <Card className="border-red-200 bg-red-50 mb-6">
            <CardContent className="pt-6">
              <p className="text-red-600">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Chapter Form */}
        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-md mb-6">
          <CardHeader>
            <CardTitle>Thông tin chương</CardTitle>
            <CardDescription>
              Cập nhật thông tin và nội dung của chương
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Title */}
            <div>
              <Label htmlFor="title">Tiêu đề chương</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="Nhập tiêu đề chương..."
                className="mt-1"
              />
            </div>

            {/* Order Index */}
            <div>
              <Label htmlFor="orderIndex">Thứ tự chương</Label>
              <Input
                id="orderIndex"
                type="number"
                value={formData.orderIndex}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    orderIndex: parseInt(e.target.value) || 0,
                  }))
                }
                className="mt-1"
                min={1}
              />
            </div>

            {/* Content */}
            <div>
              <Label htmlFor="content">Nội dung chương</Label>
              <div className="mt-1">
                <RichTextEditor
                  value={formData.content}
                  onChange={(value) =>
                    setFormData((prev) => ({ ...prev, content: value }))
                  }
                  placeholder="Nhập nội dung chương..."
                  className="bg-white"
                />
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Bạn có thể sử dụng các công cụ định dạng để làm nổi bật nội dung (in đậm, in nghiêng, gạch chân, v.v.)
              </p>
            </div>

            {/* Published Status */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                {formData.isPublished ? (
                  <Eye className="w-5 h-5 text-green-600" />
                ) : (
                  <EyeOff className="w-5 h-5 text-gray-400" />
                )}
                <div>
                  <Label htmlFor="isPublished" className="text-base font-medium">
                    Trạng thái xuất bản
                  </Label>
                  <p className="text-sm text-gray-500">
                    {formData.isPublished
                      ? 'Chương này đã được xuất bản'
                      : 'Chương này đang ở chế độ nháp'}
                  </p>
                </div>
              </div>
              <Switch
                id="isPublished"
                checked={formData.isPublished}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, isPublished: checked }))
                }
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t">
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={saving}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Xóa chương
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving || !formData.title.trim()}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Questions Section */}
        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-md mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileQuestion className="w-5 h-5" />
                  Câu hỏi ({questions.length})
                </CardTitle>
                <CardDescription>
                  Quản lý các câu hỏi trong chương này
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowImportWord(true)}
                  className="border-blue-500 text-blue-600 hover:bg-blue-50"
                >
                  <FileUp className="w-4 h-4 mr-2" />
                  Import từ Word
                </Button>
                <Button
                  onClick={() => {
                    setShowAddQuestion(true);
                    setEditingQuestionId(null);
                    setQuestionForm({
                      question: '',
                      questionType: 1,
                      options: ['', '', '', ''],
                      correctAnswer: '',
                      explanation: '',
                      difficulty: 1,
                    });
                  }}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm câu hỏi
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Search Bar */}
            {questions.length > 0 && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
                <div className="flex flex-col md:flex-row gap-3">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        placeholder={
                          searchType === 'number'
                            ? 'Nhập số câu hỏi (ví dụ: 5)'
                            : searchType === 'question'
                            ? 'Tìm kiếm trong nội dung câu hỏi...'
                            : 'Tìm kiếm trong đáp án...'
                        }
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleSearch();
                          }
                        }}
                      />
                    </div>
                  </div>
                  <Select value={searchType} onValueChange={(value: 'number' | 'question' | 'answer') => setSearchType(value)}>
                    <SelectTrigger className="w-full md:w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="number">
                        <div className="flex items-center gap-2">
                          <Hash className="w-4 h-4" />
                          Theo số
                        </div>
                      </SelectItem>
                      <SelectItem value="question">
                        <div className="flex items-center gap-2">
                          <FileQuestion className="w-4 h-4" />
                          Theo đề
                        </div>
                      </SelectItem>
                      <SelectItem value="answer">
                        <div className="flex items-center gap-2">
                          <Search className="w-4 h-4" />
                          Theo đáp án
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {searchQuery && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchQuery('');
                        setHighlightedQuestionId(null);
                      }}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Xóa
                    </Button>
                  )}
                </div>
                {searchQuery && (
                  <div className={`mt-2 text-sm ${filteredQuestions.length > 0 ? 'text-gray-600' : 'text-red-600'}`}>
                    {filteredQuestions.length > 0 
                      ? `Tìm thấy ${filteredQuestions.length} câu hỏi`
                      : 'Không tìm thấy câu hỏi nào'}
                  </div>
                )}
              </div>
            )}

            {loadingQuestions ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Đang tải câu hỏi...</p>
              </div>
            ) : questions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileQuestion className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Chưa có câu hỏi nào trong chương này</p>
              </div>
            ) : searchQuery && filteredQuestions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Search className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Không tìm thấy câu hỏi nào phù hợp với "{searchQuery}"</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setSearchQuery('');
                    setHighlightedQuestionId(null);
                  }}
                >
                  <X className="w-4 h-4 mr-2" />
                  Xóa bộ lọc
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {(searchQuery ? filteredQuestions : questions).map((question, index) => {
                  const originalIndex = questions.findIndex(q => q.id === question.id);
                  return (
                    <div 
                      key={question.id} 
                      id={`question-${question.id}`}
                      className={`border rounded-lg p-4 transition-all ${
                        highlightedQuestionId === question.id 
                          ? 'ring-4 ring-blue-400 ring-opacity-50 bg-blue-50' 
                          : 'bg-white'
                      }`}
                    >
                    {editingQuestionId === question.id ? (
                      <QuestionEditForm
                        questionForm={questionForm}
                        setQuestionForm={setQuestionForm}
                        onSave={() => handleSaveQuestion(question.id)}
                        onCancel={() => {
                          setEditingQuestionId(null);
                          setQuestionForm({
                            question: '',
                            questionType: 1,
                            options: ['', '', '', ''],
                            correctAnswer: '',
                            explanation: '',
                            difficulty: 1,
                          });
                        }}
                        saving={saving}
                      />
                    ) : (
                      <div>
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline">Câu {originalIndex >= 0 ? originalIndex + 1 : index + 1}</Badge>
                              <Badge
                                className={
                                  question.difficulty === 1
                                    ? 'bg-green-100 text-green-700'
                                    : question.difficulty === 2
                                    ? 'bg-yellow-100 text-yellow-700'
                                    : 'bg-red-100 text-red-700'
                                }
                              >
                                {question.difficulty === 1
                                  ? 'Dễ'
                                  : question.difficulty === 2
                                  ? 'Trung bình'
                                  : 'Khó'}
                              </Badge>
                            </div>
                            <div 
                              className="prose max-w-none question-content text-base mb-3"
                              dangerouslySetInnerHTML={{ 
                                __html: renderQuestionContent(question.question || question.QuestionContent || '') 
                              }}
                              ref={(el) => {
                                if (el) {
                                  // Typeset MathML sau khi element được render
                                  const typeset = () => {
                                    const w = window as any;
                                    if (w.MathJax && typeof w.MathJax.typesetPromise === 'function') {
                                      const mathElements = el.querySelectorAll('math');
                                      if (mathElements.length > 0) {
                                        w.MathJax.typesetPromise(mathElements as any).catch(() => {});
                                      } else {
                                        // Nếu không có math elements, vẫn typeset để đảm bảo
                                        w.MathJax.typesetPromise([el] as any).catch(() => {});
                                      }
                                    }
                                  };
                                  // Typeset ngay lập tức và sau một delay
                                  typeset();
                                  setTimeout(typeset, 100);
                                  setTimeout(typeset, 300);
                                }
                              }}
                            />
                            {question.options && question.options.length > 0 && (
                              <div className="space-y-2 mb-2">
                                {question.options.map((opt, optIdx) => {
                                  const optionText = opt.optionText || opt.OptionText || '';
                                  return (
                                    <div
                                      key={optIdx}
                                      className={`text-sm p-3 rounded border ${
                                        (opt.isCorrect || opt.IsCorrect) &&
                                        'bg-green-50 border-green-200'
                                      }`}
                                    >
                                      <div className="flex items-start gap-2">
                                        <span className="font-medium text-blue-600 min-w-[24px]">
                                          {String.fromCharCode(65 + optIdx)}.
                                        </span>
                                        <div 
                                          className="flex-1 prose max-w-none option-content text-sm"
                                          dangerouslySetInnerHTML={{ 
                                            __html: renderQuestionContent(optionText) 
                                          }}
                                          ref={(el) => {
                                            if (el) {
                                              setTimeout(() => {
                                                const w = window as any;
                                                if (w.MathJax && typeof w.MathJax.typesetPromise === 'function') {
                                                  const mathElements = el.querySelectorAll('math');
                                                  if (mathElements.length > 0) {
                                                    w.MathJax.typesetPromise(mathElements as any).catch(() => {});
                                                  }
                                                }
                                              }, 100);
                                            }
                                          }}
                                        />
                                        {(opt.isCorrect || opt.IsCorrect) && (
                                          <Badge className="ml-2 bg-green-600 shrink-0">Đúng</Badge>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                            {(question.explanation || question.explanationContent || question.ExplanationContent) && (
                              <div className="mt-3 p-3 bg-gray-50 rounded border">
                                <p className="text-sm font-medium text-gray-700 mb-2">Giải thích:</p>
                                <div 
                                  className="prose max-w-none explanation-content text-sm text-gray-600"
                                  dangerouslySetInnerHTML={{ 
                                    __html: renderQuestionContent(
                                      question.explanation || 
                                      question.explanationContent || 
                                      question.ExplanationContent || 
                                      ''
                                    ) 
                                  }}
                                  ref={(el) => {
                                    if (el) {
                                      setTimeout(() => {
                                        const w = window as any;
                                        if (w.MathJax && typeof w.MathJax.typesetPromise === 'function') {
                                          const mathElements = el.querySelectorAll('math');
                                          if (mathElements.length > 0) {
                                            w.MathJax.typesetPromise(mathElements as any).catch(() => {});
                                          }
                                        }
                                      }, 100);
                                    }
                                  }}
                                />
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2 ml-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => startEditQuestion(question)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteQuestion(question.id)}
                              disabled={saving}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  );
                })}
              </div>
            )}

            {/* Add Question Form */}
            {showAddQuestion && (
              <div className="mt-6 border-t pt-6">
                <QuestionEditForm
                  questionForm={questionForm}
                  setQuestionForm={setQuestionForm}
                  onSave={() => handleSaveQuestion()}
                  onCancel={() => {
                    setShowAddQuestion(false);
                    setQuestionForm({
                      question: '',
                      questionType: 1,
                      options: ['', '', '', ''],
                      correctAnswer: '',
                      explanation: '',
                      difficulty: 1,
                    });
                  }}
                  saving={saving}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Import Word Modal */}
        {showImportWord && bookId && chapterId && (
          <ImportQuestionsFromWordForBook
            bookId={bookId}
            chapterId={chapterId}
            onClose={() => setShowImportWord(false)}
            onImported={() => {
              setShowImportWord(false);
              fetchChapterQuestions();
            }}
          />
        )}

        {/* Chapter Info */}
        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-md">
          <CardHeader>
            <CardTitle>Thông tin chi tiết</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">ID chương</p>
                <p className="font-medium">{chapterId || chapter?.id || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">ID sách</p>
                <p className="font-medium">{bookId || chapter?.bookId || 'N/A'}</p>
              </div>
              {chapter && (
                <>
                  <div>
                    <p className="text-sm text-gray-500">Ngày tạo</p>
                    <p className="font-medium">
                      {chapter.createdAt
                        ? new Date(chapter.createdAt).toLocaleDateString('vi-VN')
                        : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Trạng thái</p>
                    <Badge
                      className={
                        formData.isPublished
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }
                    >
                      {formData.isPublished ? 'Đã xuất bản' : 'Nháp'}
                    </Badge>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  );
}

// Question Edit Form Component
function QuestionEditForm({
  questionForm,
  setQuestionForm,
  onSave,
  onCancel,
  saving,
}: {
  questionForm: {
    question: string;
    questionType: number;
    options: string[];
    correctAnswer: string;
    explanation: string;
    difficulty: number;
  };
  setQuestionForm: React.Dispatch<React.SetStateAction<any>>;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
}) {
  return (
    <div className="space-y-4 p-4 border rounded-lg bg-white">
      <div>
        <Label>
          Nội dung câu hỏi <span className="text-red-500">*</span>
        </Label>
        <div className="mt-1">
          <LatexEditor
            value={questionForm.question}
            onChange={(value) =>
              setQuestionForm((prev: any) => ({ ...prev, question: value }))
            }
            placeholder="Nhập câu hỏi... Sử dụng $x^2 + y^2 = z^2$ cho công thức toán học"
            rows={4}
          />
          <p className="text-xs text-gray-500 mt-1">
            💡 Hỗ trợ LaTeX: Sử dụng $...$ cho inline và $$...$$ cho block math. Ví dụ: {'$x^2$'}, {'$\\frac{a}{b}$'}, {'$\\sqrt{x}$'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Loại câu hỏi</Label>
          <Select
            value={questionForm.questionType.toString()}
            onValueChange={(value) =>
              setQuestionForm((prev: any) => ({ ...prev, questionType: parseInt(value) }))
            }
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Trắc nghiệm</SelectItem>
              <SelectItem value="1">Đúng/Sai</SelectItem>
              <SelectItem value="3">Tiêu đề</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Độ khó</Label>
          <Select
            value={questionForm.difficulty.toString()}
            onValueChange={(value) =>
              setQuestionForm((prev: any) => ({ ...prev, difficulty: parseInt(value) }))
            }
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Dễ</SelectItem>
              <SelectItem value="2">Trung bình</SelectItem>
              <SelectItem value="3">Khó</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {questionForm.questionType !== 3 && (
        <div>
          <Label>Các lựa chọn</Label>
          <div className="space-y-2 mt-1">
            {questionForm.options.map((opt, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="w-6 text-sm font-medium pt-2">
                  {String.fromCharCode(65 + idx)}.
                </span>
                <div className="flex-1">
                  <LatexEditor
                    value={opt}
                    onChange={(value) => {
                      const newOptions = [...questionForm.options];
                      newOptions[idx] = value;
                      setQuestionForm((prev: any) => ({ ...prev, options: newOptions }));
                    }}
                    placeholder={`Lựa chọn ${String.fromCharCode(65 + idx)}...`}
                    rows={2}
                  />
                </div>
                <div className="pt-2">
                  <input
                    type={questionForm.questionType === 0 ? "radio" : "checkbox"}
                    name="correctAnswer"
                    checked={
                      questionForm.questionType === 0
                        ? questionForm.correctAnswer === String.fromCharCode(65 + idx)
                        : questionForm.correctAnswer?.includes(String.fromCharCode(65 + idx))
                    }
                    onChange={() => {
                      if (questionForm.questionType === 0) {
                        // Radio: chỉ chọn một
                        setQuestionForm((prev: any) => ({
                          ...prev,
                          correctAnswer: String.fromCharCode(65 + idx),
                        }));
                      } else {
                        // Checkbox: có thể chọn nhiều
                        const current = questionForm.correctAnswer || '';
                        const letter = String.fromCharCode(65 + idx);
                        const newAnswer = current.includes(letter)
                          ? current.replace(letter, '')
                          : current + letter;
                        setQuestionForm((prev: any) => ({
                          ...prev,
                          correctAnswer: newAnswer,
                        }));
                      }
                    }}
                    className="w-4 h-4"
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Chọn đáp án đúng bằng cách click vào ô bên cạnh mỗi lựa chọn
          </p>
        </div>
      )}

      <div>
        <Label>Giải thích</Label>
        <div className="mt-1">
          <LatexEditor
            value={questionForm.explanation}
            onChange={(value) =>
              setQuestionForm((prev: any) => ({ ...prev, explanation: value }))
            }
            placeholder="Nhập giải thích cho câu trả lời... (có thể dùng công thức toán học)"
            rows={3}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2 border-t">
        <Button variant="outline" onClick={onCancel} disabled={saving}>
          <X className="w-4 h-4 mr-2" />
          Hủy
        </Button>
        <Button 
          onClick={onSave} 
          disabled={saving || !questionForm.question.trim()}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Đang lưu...' : 'Lưu'}
        </Button>
      </div>
    </div>
  );
}

