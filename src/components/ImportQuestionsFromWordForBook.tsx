'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAIGenerateQuestions, AIGeneratedQuestion } from '@/hooks/useAssignments';
import { useUpload } from '@/hooks/useUpload';
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch';
import { X } from 'lucide-react';

declare global {
  interface Window {
    MathJax?: any;
  }
}

interface ImportQuestionsFromWordForBookProps {
  bookId: number;
  chapterId: number;
  onClose: () => void;
  onImported: () => void;
}

export function ImportQuestionsFromWordForBook({ bookId, chapterId, onClose, onImported }: ImportQuestionsFromWordForBookProps) {
  const { authenticatedFetch } = useAuthenticatedFetch();
  const { generateFromWord, loading: generating, error: genError } = useAIGenerateQuestions();
  const { uploadFileWithPresign, uploading: uploadingFile } = useUpload();
  const [file, setFile] = useState<File | null>(null);
  const [questions, setQuestions] = useState<AIGeneratedQuestion[]>([]);
  const [step, setStep] = useState<'upload' | 'preview'>('upload');
  const [error, setError] = useState<string | null>(null);
  const [inserting, setInserting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Vui lòng chọn file Word');
      return;
    }

    try {
      setError(null);
      const result = await uploadFileWithPresign(file, {
        folder: 'word-imports',
        accessRole: 'GUEST',
      });

      if (result.success && result.url) {
        const genResult = await generateFromWord(result.url);
        if (genResult.success && genResult.data) {
          // Map questions và thêm chapterId, đồng thời chuẩn hóa Options
          const questionsWithChapter = genResult.data.map((q: AIGeneratedQuestion) => {
            // Chuẩn hóa Options: đảm bảo có cả OptionText và Content
            const normalizedOptions = (q.Options || []).map((opt: any) => ({
              ...opt,
              OptionText: opt.OptionText || opt.Content || '',
              Content: opt.Content || opt.OptionText || '',
            }));
            
            return {
              ...q,
              ChapterId: chapterId,
              Options: normalizedOptions,
            };
          });
          setQuestions(questionsWithChapter);
          setStep('preview');
        } else {
          setError(genResult.error || 'Không thể tạo câu hỏi từ file Word');
        }
      } else {
        setError(result.error || 'Upload file thất bại');
      }
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra');
    }
  };

  const handleImport = async () => {
    if (questions.length === 0) {
      setError('Không có câu hỏi để import');
      return;
    }

    try {
      setInserting(true);
      setError(null);

      // Chuẩn hóa questions trước khi gửi: chuyển Content thành OptionText
      const normalizedQuestions = questions.map((q) => {
        const normalizedOptions = (q.Options || []).map((opt: any) => ({
          OptionText: opt.OptionText || opt.Content || '',
          IsCorrect: opt.IsCorrect || false,
          PointsValue: opt.PointsValue || 0,
          OrderIndex: opt.OrderIndex || 0,
        }));

        return {
          QuestionContent: q.QuestionContent || '',
          QuestionType: q.QuestionType ?? 0,
          DifficultyLevel: q.DifficultyLevel ?? 1,
          DefaultPoints: q.DefaultPoints ?? 1,
          ExplanationContent: q.ExplanationContent || '',
          ChapterId: q.ChapterId || chapterId,
          Options: normalizedOptions,
        };
      });

      const response = await authenticatedFetch(`/api/books/${bookId}/questions/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ Questions: normalizedQuestions }),
      });

      const result = await response.json();
      if (response.ok && result.Result) {
        onImported();
        onClose();
      } else {
        throw new Error(result.Message || 'Import thất bại');
      }
    } catch (err: any) {
      setError(err.message || 'Import thất bại');
    } finally {
      setInserting(false);
    }
  };

  const updateQuestion = (index: number, patch: Partial<AIGeneratedQuestion>) => {
    setQuestions(prev => prev.map((q, i) => i === index ? { ...q, ...patch } : q));
  };

  const updateOption = (qIndex: number, oIndex: number, field: 'OptionText' | 'Content' | 'IsCorrect', value: any) => {
    setQuestions(prev => prev.map((q, i) => {
      if (i !== qIndex) return q;
      const options = [...(q.Options || [])];
      if (field === 'IsCorrect' && value) {
        // Nếu chọn đúng, bỏ chọn tất cả các lựa chọn khác (chỉ cho QuestionType 0 - trắc nghiệm)
        if (q.QuestionType === 0) {
          options.forEach((opt, idx) => {
            opt.IsCorrect = idx === oIndex;
          });
        } else {
          // Với QuestionType 1 (đúng/sai), cho phép chọn nhiều
          options[oIndex] = { ...options[oIndex], [field]: value };
        }
      } else {
        // Cập nhật OptionText hoặc Content
        const updatedOption = { ...options[oIndex] };
        if (field === 'OptionText' || field === 'Content') {
          updatedOption.OptionText = value;
          updatedOption.Content = value; // Đồng bộ cả hai
        } else {
          updatedOption[field] = value;
        }
        options[oIndex] = updatedOption;
      }
      return { ...q, Options: options };
    }));
  };

  // Lấy text của option (hỗ trợ cả OptionText và Content)
  const getOptionText = (opt: any) => {
    return opt.OptionText || opt.Content || '';
  };

  // Load MathJax với config cho cả TeX lẫn MathML
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
      if (src && src.startsWith('data:image')) {
        // Giữ nguyên base64 image
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

  // Typeset lại MathML sau khi content được render
  useEffect(() => {
    if (step === 'preview' && questions.length > 0) {
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
  }, [step, questions]);

  const removeQuestion = (index: number) => {
    setQuestions(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Import câu hỏi từ Word</CardTitle>
              <CardDescription>
                Upload file Word để tự động tạo câu hỏi cho chương này
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
              {error}
            </div>
          )}

          {step === 'upload' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Chọn file Word (.docx)</label>
                <Input
                  type="file"
                  accept=".docx,.doc"
                  onChange={handleFileChange}
                  disabled={uploadingFile || generating}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleUpload}
                  disabled={!file || uploadingFile || generating}
                  className="bg-gradient-to-r from-blue-500 to-purple-600"
                >
                  {uploadingFile ? 'Đang upload...' : generating ? 'Đang xử lý...' : 'Upload và tạo câu hỏi'}
                </Button>
                <Button variant="outline" onClick={onClose}>
                  Hủy
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Đã tạo {questions.length} câu hỏi từ file Word
                </p>
                <Button variant="outline" onClick={() => setStep('upload')}>
                  Upload file khác
                </Button>
              </div>

              <div className="space-y-4 max-h-[500px] overflow-y-auto">
                {questions.map((q, qi) => (
                  <Card key={qi}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">Câu hỏi {qi + 1}</h4>
                            <span className={`text-xs px-2 py-1 rounded ${
                              q.QuestionType === 0 ? 'bg-blue-100 text-blue-700' :
                              q.QuestionType === 1 ? 'bg-purple-100 text-purple-700' :
                              q.QuestionType === 3 ? 'bg-gray-100 text-gray-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                              {q.QuestionType === 0 ? 'Trắc nghiệm' :
                               q.QuestionType === 1 ? 'Đúng/Sai' :
                               q.QuestionType === 3 ? 'Tiêu đề' :
                               `Loại ${q.QuestionType}`}
                            </span>
                          </div>
                          {q.QuestionType === 3 && (
                            <p className="text-xs text-gray-500 italic">Câu hỏi phân loại - không cần lựa chọn</p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeQuestion(qi)}
                          className="text-red-600"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Nội dung câu hỏi</label>
                          <div className="border rounded-lg p-3 bg-gray-50 min-h-[100px] mb-2">
                            <div 
                              className="prose max-w-none question-content"
                              dangerouslySetInnerHTML={{ __html: renderQuestionContent(q.QuestionContent || '') }}
                              ref={(el) => {
                                if (el) {
                                  // Typeset MathML sau khi element được render
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
                          <Textarea
                            value={q.QuestionContent || ''}
                            onChange={(e) => updateQuestion(qi, { QuestionContent: e.target.value })}
                            rows={4}
                            placeholder="Nhập hoặc chỉnh sửa nội dung câu hỏi..."
                            className="text-xs font-mono"
                          />
                        </div>

                        {q.QuestionType !== 3 && (
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            {q.QuestionType === 0 ? 'Các lựa chọn (Trắc nghiệm - chọn 1 đáp án đúng)' : 
                             q.QuestionType === 1 ? 'Các khẳng định (Đúng/Sai - có thể chọn nhiều)' :
                             'Nội dung'}
                          </label>
                          {(!q.Options || q.Options.length === 0) ? (
                            <p className="text-sm text-gray-500 italic">Chưa có lựa chọn nào</p>
                          ) : (
                            <div className="space-y-2">
                              {(q.Options || []).map((opt, oi) => {
                                const optionText = getOptionText(opt);
                                const optionLabel = q.QuestionType === 1 
                                  ? `${String.fromCharCode(97 + oi)}):` // a), b), c), d)
                                  : `${String.fromCharCode(65 + oi)}:`; // A:, B:, C:, D:
                                
                                return (
                                  <div key={oi} className="flex items-start gap-2 p-2 border rounded hover:bg-gray-50">
                                    <span className="font-medium text-blue-600 mt-2 min-w-[32px]">
                                      {optionLabel}
                                    </span>
                                    <div className="flex-1">
                                      <div className="border rounded p-2 bg-white mb-2">
                                        <div 
                                          className="prose max-w-none text-sm option-content"
                                          dangerouslySetInnerHTML={{ __html: renderQuestionContent(optionText) }}
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
                                      <Textarea
                                        value={optionText}
                                        onChange={(e) => updateOption(qi, oi, 'Content', e.target.value)}
                                        placeholder={`Nhập ${q.QuestionType === 1 ? 'khẳng định' : 'lựa chọn'} ${optionLabel}`}
                                        className="text-xs font-mono"
                                        rows={2}
                                      />
                                    </div>
                                    <label className="flex items-center gap-1 text-sm mt-2 cursor-pointer">
                                      <input
                                        type={q.QuestionType === 0 ? "radio" : "checkbox"}
                                        name={q.QuestionType === 0 ? `correct-${qi}` : `correct-${qi}-${oi}`}
                                        checked={opt.IsCorrect || false}
                                        onChange={(e) => updateOption(qi, oi, 'IsCorrect', e.target.checked)}
                                        className="w-4 h-4"
                                      />
                                      <span className={opt.IsCorrect ? 'text-green-600 font-medium' : 'text-gray-600'}>
                                        {q.QuestionType === 1 ? 'Đúng' : 'Đúng'}
                                      </span>
                                    </label>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                        )}

                        <div>
                          <label className="block text-sm font-medium mb-2">Giải thích</label>
                          <div className="border rounded-lg p-3 bg-blue-50 mb-2 min-h-[60px]">
                            <div 
                              className="prose max-w-none text-sm explanation-content"
                              dangerouslySetInnerHTML={{ __html: renderQuestionContent(q.ExplanationContent || '') }}
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
                          <Textarea
                            value={q.ExplanationContent || ''}
                            onChange={(e) => updateQuestion(qi, { ExplanationContent: e.target.value })}
                            rows={2}
                            placeholder="Nhập giải thích..."
                            className="text-xs font-mono"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <Button
                  onClick={handleImport}
                  disabled={inserting || questions.length === 0}
                  className="bg-gradient-to-r from-blue-500 to-purple-600"
                >
                  {inserting ? 'Đang import...' : `Import ${questions.length} câu hỏi`}
                </Button>
                <Button variant="outline" onClick={onClose}>
                  Hủy
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      <style jsx global>{`
        .question-content,
        .option-content,
        .explanation-content {
          line-height: 1.6;
        }
        .question-content math,
        .option-content math,
        .explanation-content math {
          display: inline-block;
          margin: 0 2px;
          vertical-align: middle;
        }
        .question-content math[display="block"],
        .option-content math[display="block"],
        .explanation-content math[display="block"] {
          display: block;
          margin: 10px 0;
          text-align: center;
        }
        .question-content img,
        .option-content img,
        .explanation-content img {
          max-width: 100%;
          height: auto;
          display: block;
          margin: 10px 0;
        }
        /* Đảm bảo MathJax có thể process MathML */
        .question-content,
        .option-content,
        .explanation-content {
          /* MathJax sẽ tự động process các thẻ math */
        }
      `}</style>
    </div>
  );
}

