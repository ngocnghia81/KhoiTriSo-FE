'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Save,
  FileText,
  Video,
  Upload,
  AlertCircle,
  FileQuestion,
  BookOpen
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { bookApiService, BookQuestion } from '@/services/bookApi';
import { FileUpload } from '@/components/FileUpload';
import { Badge } from '@/components/ui/badge';

export default function CreateSolutionPage() {
  const params = useParams();
  const router = useRouter();
  const bookId = params?.id ? parseInt(params.id as string) : null;
  const questionId = params?.questionId ? parseInt(params.questionId as string) : null;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [question, setQuestion] = useState<BookQuestion | null>(null);

  // Form data
  const [title, setTitle] = useState('');
  const [solutionType, setSolutionType] = useState<'text' | 'video'>('text');
  const [content, setContent] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [wordFileUrl, setWordFileUrl] = useState('');

  useEffect(() => {
    if (bookId && questionId) {
      fetchQuestion();
    }
  }, [bookId, questionId]);

  const fetchQuestion = async () => {
    if (!bookId || !questionId) return;

    try {
      setLoading(true);
      setError(null);

      const questions = await bookApiService.getBookQuestions(bookId, 1, 1000);
      const foundQuestion = questions.find(q => q.id === questionId);

      if (foundQuestion) {
        setQuestion(foundQuestion);
        // Auto-suggest solution type based on difficulty
        if (foundQuestion.difficulty === 3) {
          setSolutionType('video');
        }
      } else {
        setError('Không tìm thấy câu hỏi');
      }
    } catch (err: any) {
      console.error('Error fetching question:', err);
      setError(err.message || 'Không thể tải thông tin câu hỏi');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      alert('Vui lòng nhập tiêu đề!');
      return;
    }

    if (solutionType === 'text' && !content.trim()) {
      alert('Vui lòng nhập nội dung lời giải!');
      return;
    }

    if (solutionType === 'video' && !videoUrl.trim()) {
      alert('Vui lòng upload video hoặc nhập URL video!');
      return;
    }

    try {
      setSaving(true);

      const requestBody = {
        questionId,
        title,
        solutionType,
        content: solutionType === 'text' ? content : null,
        videoUrl: solutionType === 'video' ? videoUrl : null,
        wordFileUrl: wordFileUrl || null
      };

      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      if (!token) {
        alert('Vui lòng đăng nhập!');
        router.push('/auth/login');
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/solutions`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(requestBody)
        }
      );

      const result = await response.json();

      if (response.ok && (result.success || result.Success)) {
        alert('Tạo lời giải thành công!');
        router.push('/dashboard/books/solutions');
      } else {
        throw new Error(result.message || result.Message || 'Không thể tạo lời giải');
      }
    } catch (err: any) {
      console.error('Error creating solution:', err);
      alert(err.message || 'Có lỗi xảy ra khi tạo lời giải');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !question) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-md">
            <CardContent className="p-12 text-center">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Lỗi</h2>
              <p className="text-gray-600 mb-6">{error || 'Không tìm thấy câu hỏi'}</p>
              <Button onClick={() => router.push('/dashboard/books/solutions')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Quay lại
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const difficultyConfig = {
    1: { label: 'Dễ', color: 'bg-green-100 text-green-700' },
    2: { label: 'Trung bình', color: 'bg-yellow-100 text-yellow-700' },
    3: { label: 'Khó', color: 'bg-red-100 text-red-700' }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-6">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 -left-20 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl"
          animate={{ y: [0, -50, 0], x: [0, 30, 0] }}
          transition={{ duration: 20, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 -right-20 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl"
          animate={{ y: [0, 50, 0], x: [0, -30, 0] }}
          transition={{ duration: 25, repeat: Infinity }}
        />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            onClick={() => router.push('/dashboard/books/solutions')}
            variant="ghost"
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>

          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-3">
            <FileText className="w-10 h-10 text-blue-600" />
            Tạo Lời giải
          </h1>
          <p className="text-gray-600 mt-2">Thêm lời giải chi tiết cho câu hỏi</p>
        </div>

        {/* Question Info */}
        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-md mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileQuestion className="w-5 h-5" />
              Câu hỏi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={difficultyConfig[question.difficulty as 1 | 2 | 3]?.color}>
                    {difficultyConfig[question.difficulty as 1 | 2 | 3]?.label}
                  </Badge>
                  {question.difficulty === 3 && (
                    <Badge variant="outline" className="text-yellow-700 border-yellow-300">
                      💡 Nên tạo video giải
                    </Badge>
                  )}
                </div>
                <p className="text-gray-900 font-medium">{question.question}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit}>
          {/* Basic Information */}
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-md mb-6">
            <CardHeader>
              <CardTitle>Thông tin cơ bản</CardTitle>
              <CardDescription>Tiêu đề và loại lời giải</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Title */}
              <div className="grid gap-2">
                <Label htmlFor="title">
                  Tiêu đề <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="VD: Giải chi tiết câu 1 - Lập trình mã nguồn mở"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              {/* Solution Type */}
              <div className="grid gap-2">
                <Label htmlFor="solutionType">
                  Loại lời giải <span className="text-red-500">*</span>
                </Label>
                <Select value={solutionType} onValueChange={(value: 'text' | 'video') => setSolutionType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        <span>Text (Văn bản + LaTeX)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="video">
                      <div className="flex items-center gap-2">
                        <Video className="w-4 h-4" />
                        <span>Video giải</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  {question.difficulty === 3 
                    ? '💡 Câu hỏi khó nên tạo video giải để dễ hiểu hơn'
                    : 'Câu hỏi dễ/trung bình có thể dùng text giải'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Text Solution */}
          {solutionType === 'text' && (
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-md mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Nội dung lời giải
                </CardTitle>
                <CardDescription>
                  Hỗ trợ LaTeX, Markdown và văn bản thông thường
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Content Editor */}
                <div className="grid gap-2">
                  <Label htmlFor="content">
                    Nội dung <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="content"
                    placeholder="Nhập lời giải chi tiết...&#10;&#10;Hỗ trợ LaTeX: $x^2 + y^2 = z^2$&#10;Hoặc block: $$\int_0^1 x^2 dx$$&#10;&#10;Markdown: **bold**, *italic*, `code`"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={15}
                    className="font-mono text-sm"
                    required
                  />
                  <p className="text-xs text-gray-500">
                    💡 Mẹo: Sử dụng $...$ cho inline LaTeX và $$...$$ cho block LaTeX
                  </p>
                </div>

                {/* Word File Upload (Optional) */}
                <div className="grid gap-2">
                  <Label>
                    Upload file Word (tùy chọn)
                  </Label>
                  <FileUpload
                    accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    maxSize={10 * 1024 * 1024}
                    folder="solutions/word"
                    accessRole="GUEST"
                    onUploadComplete={(result) => setWordFileUrl(result.url)}
                    onUploadError={(error) => alert(error)}
                  />
                  {wordFileUrl && (
                    <p className="text-xs text-green-600">✓ Đã tải lên: {wordFileUrl}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    File Word sẽ được lưu trữ để tham khảo, nội dung chính vẫn là text editor bên trên
                  </p>
                </div>

                {/* Preview */}
                {content && (
                  <div className="grid gap-2">
                    <Label>Preview (Đơn giản)</Label>
                    <div className="p-4 bg-gray-50 rounded-lg border-2 border-gray-200 min-h-[100px]">
                      <div className="prose prose-sm max-w-none">
                        {content.split('\n').map((line, idx) => (
                          <p key={idx} className="mb-2">
                            {line || <br />}
                          </p>
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">
                      LaTeX sẽ được render khi hiển thị cho học sinh
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Video Solution */}
          {solutionType === 'video' && (
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-md mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="w-5 h-5" />
                  Video giải
                </CardTitle>
                <CardDescription>
                  Upload video hoặc nhập URL từ YouTube/Vimeo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Video Upload */}
                <div className="grid gap-2">
                  <Label>
                    Upload video <span className="text-red-500">*</span>
                  </Label>
                  <FileUpload
                    accept="video/*,.mp4,.avi,.mov,.wmv"
                    maxSize={500 * 1024 * 1024}
                    folder="solutions/videos"
                    accessRole="GUEST"
                    onUploadComplete={(result) => setVideoUrl(result.url)}
                    onUploadError={(error) => alert(error)}
                  />
                  {videoUrl && (
                    <p className="text-xs text-green-600">✓ Đã tải lên: {videoUrl}</p>
                  )}
                </div>

                {/* Or URL */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500">Hoặc</span>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="videoUrl">URL Video (YouTube, Vimeo, etc.)</Label>
                  <Input
                    id="videoUrl"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                  />
                </div>

                {/* Video Preview */}
                {videoUrl && (
                  <div className="grid gap-2">
                    <Label>Preview</Label>
                    <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
                      {videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be') ? (
                        <iframe
                          src={videoUrl.replace('watch?v=', 'embed/')}
                          className="w-full h-full rounded-lg"
                          allowFullScreen
                        />
                      ) : (
                        <div className="text-white text-center">
                          <Video className="w-12 h-12 mx-auto mb-2" />
                          <p className="text-sm">Video sẽ được hiển thị ở đây</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex gap-4 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/dashboard/books/solutions')}
              disabled={saving}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              disabled={saving}
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Tạo lời giải
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
