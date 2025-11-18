'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useBatchInsertQuestions, AIGeneratedQuestion } from '@/hooks/useAssignments';

export default function ReviewGeneratedPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id ? parseInt(params.id as string) : 0;
  const storageKey = `generated_questions_assignment_${id}`;
  const { batchInsert, loading: inserting, error } = useBatchInsertQuestions();
  const [advanced, setAdvanced] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const [questions, setQuestions] = useState<AIGeneratedQuestion[]>([]);
  const [showMathKb, setShowMathKb] = useState(false);
  const [mathTarget, setMathTarget] = useState<{ q: number; field: 'QuestionContent'|'ExplanationContent'|'OptionText'; o?: number; token?: string } | null>(null);
  
  // Điểm theo từng question type (0: Trắc nghiệm, 1: Đúng/Sai, 2: Tự luận ngắn)
  const [pointsByType, setPointsByType] = useState<Record<number, number>>({
    0: 0, // Trắc nghiệm
    1: 0, // Đúng/Sai
    2: 0, // Tự luận ngắn
  });

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(storageKey);
      console.log('Review page - Loading from sessionStorage:', storageKey, 'Raw:', raw ? 'exists' : 'null');
      if (raw) {
        const parsed = JSON.parse(raw);
        const loadedQuestions = parsed.questions || [];
        console.log('Review page - Loaded questions count:', loadedQuestions.length);
        // Đảm bảo mặc định không có điểm (set về 0)
        const questionsWithoutPoints = loadedQuestions.map((q: AIGeneratedQuestion) => ({
          ...q,
          DefaultPoints: 0,
        }));
        setQuestions(questionsWithoutPoints);
        console.log('Review page - Questions set:', questionsWithoutPoints.length);
      } else {
        console.warn('Review page - No data in sessionStorage for key:', storageKey);
      }
    } catch (error) {
      console.error('Review page - Error loading from sessionStorage:', error);
    }
  }, [storageKey]);

  // Tính số lượng câu hỏi theo từng loại (không tính tiêu đề)
  const questionCountsByType = React.useMemo(() => {
    const counts: Record<number, number> = { 0: 0, 1: 0, 2: 0 };
    questions.forEach(q => {
      if (q.QuestionType !== 3 && q.QuestionType >= 0 && q.QuestionType <= 2) {
        counts[q.QuestionType] = (counts[q.QuestionType] || 0) + 1;
      }
    });
    return counts;
  }, [questions]);


  // Khi thay đổi điểm theo loại, tự động chia lại
  useEffect(() => {
    // Chỉ chạy nếu questions đã được load (tránh chạy khi questions rỗng)
    if (questions.length === 0) return;
    
    // Tính lại questionCountsByType trực tiếp trong useEffect để tránh dependency loop
    const counts: Record<number, number> = { 0: 0, 1: 0, 2: 0 };
    questions.forEach(q => {
      if (q.QuestionType !== 3 && q.QuestionType >= 0 && q.QuestionType <= 2) {
        counts[q.QuestionType] = (counts[q.QuestionType] || 0) + 1;
      }
    });
    
    // Chỉ chia nếu có ít nhất 1 loại có điểm > 0
    const hasAnyPoints = Object.values(pointsByType).some(p => p > 0);
    if (hasAnyPoints) {
      const updatedQuestions = questions.map(q => {
        // Bỏ qua tiêu đề
        if (q.QuestionType === 3) return q;
        
        const type = q.QuestionType;
        const totalPointsForType = pointsByType[type] || 0;
        const countForType = counts[type] || 1;
        
        // Chia đều điểm cho các câu trong cùng loại
        const pointsPerQuestion = countForType > 0 ? totalPointsForType / countForType : 0;
        
        // Chỉ update nếu điểm thay đổi (tránh vòng lặp)
        const newPoints = pointsPerQuestion > 0 ? pointsPerQuestion : 0;
        if (Math.abs((q.DefaultPoints || 0) - newPoints) < 0.001) {
          return q; // Không thay đổi
        }
        
        return {
          ...q,
          DefaultPoints: newPoints,
        } as AIGeneratedQuestion;
      });
      
      // Chỉ set nếu có thay đổi
      const hasChanges = updatedQuestions.some((q, i) => {
        if (q.QuestionType === 3) return false;
        return Math.abs((q.DefaultPoints || 0) - (questions[i].DefaultPoints || 0)) >= 0.001;
      });
      
      if (hasChanges) {
        setQuestions(updatedQuestions);
      }
    } else {
      // Nếu tất cả = 0, xóa điểm của tất cả câu (set về 0)
      const hasNonZeroPoints = questions.some(q => q.QuestionType !== 3 && (q.DefaultPoints || 0) > 0);
      if (hasNonZeroPoints) {
        const updatedQuestions = questions.map(q => {
          if (q.QuestionType === 3) return q; // Bỏ qua tiêu đề
          return {
            ...q,
            DefaultPoints: 0, // Set về 0 thay vì undefined để tránh lỗi type
          } as AIGeneratedQuestion;
        });
        setQuestions(updatedQuestions);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pointsByType]); // Chỉ phụ thuộc vào pointsByType, không phụ thuộc questionCountsByType

  // Tính tổng điểm hiện tại
  const totalPoints = React.useMemo(() => {
    return Object.values(pointsByType).reduce((sum, p) => sum + (p || 0), 0);
  }, [pointsByType]);

  // MathJax loader
  useEffect(() => {
    const w = window as any;
    if (!w.MathJax) {
      w.MathJax = {
        loader: { load: ['input/mml', 'output/chtml'] },
        options: { renderActions: { addMenu: [0, '', ''] } },
      };
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/mml-chtml.js';
      s.async = true; document.head.appendChild(s);
    }
  }, []);
  useEffect(() => {
    const w = window as any; w.MathJax?.typesetPromise?.();
  }, [questions]);

  // MathLive when open editor (dynamic import from npm)
  useEffect(() => {
    if (!showMathKb) return;
    (async () => { try { (window as any).mathlive = { fontsDirectory: 'https://unpkg.com/mathlive/dist/fonts' }; await import('mathlive'); } catch {} })();
    setTimeout(() => {
      try {
        const mf: any = document.getElementById('ml-field');
        if (mf) {
          mf.setOptions?.({ virtualKeyboardMode: 'manual', virtualKeyboards: 'all symbols roman letters functions arrows calculus trigonometry geometry sets derivatives integrals' });
          mf.focus?.();
          if (typeof mf.showVirtualKeyboard === 'function') mf.showVirtualKeyboard();
          if (typeof mf.executeCommand === 'function') mf.executeCommand('showVirtualKeyboard');
        }
      } catch {}
    }, 200);
  }, [showMathKb]);

  // Khi modal bật và token là MathML, setValue vào math-field popup
  useEffect(() => {
    if (!showMathKb || !mathTarget?.token) return;
    const token = mathTarget.token;
    if (token.startsWith('<math')) {
      setTimeout(() => {
        try {
          const mf: any = document.getElementById('ml-field');
          if (mf && mf.setValue) mf.setValue(token, { format: 'math-ml' });
        } catch {}
      }, 100);
    }
  }, [showMathKb, mathTarget?.token]);

  const updateQuestion = (i: number, patch: Partial<AIGeneratedQuestion>) => {
    setQuestions(prev => prev.map((q, idx) => idx === i ? { ...q, ...patch } : q));
  };
  const updateOption = (qi: number, oi: number, field: 'OptionText'|'IsCorrect', val: any) => {
    setQuestions(prev => prev.map((q, i) => {
      if (i !== qi) return q; const opts = [...(q.Options||[])];
      opts[oi] = { ...opts[oi], [field]: val }; return { ...q, Options: opts };
    }));
  };

  // Helper function to get question type name
  const getQuestionTypeName = (type: number): string => {
    switch (type) {
      case 0: return 'Trắc nghiệm';
      case 1: return 'Đúng/Sai';
      case 2: return 'Tự luận ngắn';
      case 3: return 'Tiêu đề';
      default: return `Loại ${type}`;
    }
  };

  // Validation function for DefaultPoints (matching backend logic)
  const validateDefaultPoints = (questions: AIGeneratedQuestion[]): { valid: boolean; error?: string } => {
    // Lọc bỏ QuestionType 3 (tiêu đề) vì tiêu đề không có điểm
    const actualQuestions = questions.filter(q => q.QuestionType !== 3);
    
    if (actualQuestions.length === 0) {
      return { valid: false, error: 'Không có câu hỏi để import' };
    }

    const questionsWithPoints = actualQuestions.filter(
      q => q.DefaultPoints != null && q.DefaultPoints > 0
    );
    const questionsWithoutPoints = actualQuestions.filter(
      q => q.DefaultPoints == null || q.DefaultPoints <= 0 || q.DefaultPoints === 0
    );

    // Rule 3.1: All questions must either all have DefaultPoints OR all don't have DefaultPoints
    if (questionsWithPoints.length > 0 && questionsWithoutPoints.length > 0) {
      return {
        valid: false,
        error: 'Nếu đã nhập điểm cho một số câu, bạn phải nhập điểm cho tất cả các câu. Hoặc để trống tất cả để hệ thống tự động tính điểm.'
      };
    }

    // If all have DefaultPoints, validate that total = 10
    if (questionsWithPoints.length === actualQuestions.length) {
      const totalPoints = questionsWithPoints.reduce((sum, q) => sum + (q.DefaultPoints || 0), 0);
      if (Math.abs(totalPoints - 10) > 0.01) {
        return {
          valid: false,
          error: `Tổng điểm của tất cả các câu hỏi phải bằng 10. Hiện tại: ${totalPoints.toFixed(2)}`
        };
      }
    }

    return { valid: true };
  };

  const publish = async () => {
    setValidationError(null);
    
    // Validate DefaultPoints before sending
    const validation = validateDefaultPoints(questions);
    if (!validation.valid) {
      setValidationError(validation.error || 'Validation thất bại');
      return;
    }

    // Normalize questions: đảm bảo GroupTitle (QuestionType === 3) luôn có DefaultPoints = 0
    const normalizedQuestions = questions.map(q => ({
      ...q,
      DefaultPoints: q.QuestionType === 3 ? 0 : q.DefaultPoints
    }));

    const res = await batchInsert(id, { Questions: normalizedQuestions });
    if (res.success) {
      try { sessionStorage.removeItem(storageKey); } catch {}
      router.push(`/dashboard/assignments/${id}`);
    }
  };

  // Rich token rendering and click handling
  const renderRich = (s?: string) => {
    if (!s) return '';
    let out = s;
    out = out.replace(/\[!b:\$(.*?)\$\]/g, '<strong>$1</strong>');
    out = out.replace(/\[!i:\$(.*?)\$\]/g, '<em>$1</em>');
    out = out.replace(/\[!sub:\$(.*?)\$\]/g, '<sub>$1</sub>');
    out = out.replace(/\[!m:\$(.*?)\$\]/g, (_m, p1) => {
      const payload = String(p1 || '').trim();
      if (payload.startsWith('<math')) return payload;
      const token = `[!m:$${payload}$]`;
      return `<span class=\"editable-math\" data-token=\"${token}\">[Công thức]</span>`;
    });
    out = out.replace(/\[img:\$(.*?)\$\]/g, (_m, p1) => `<span class=\"inline-img\" data-img=\"$${String(p1||'')}$\">[Hình]</span>`);
    return out;
  };

  const openMathEditor = (qi: number, field: 'QuestionContent'|'ExplanationContent'|'OptionText', oi?: number, seed?: string) => {
    setMathTarget({ q: qi, field, o: oi });
    setShowMathKb(true);
    setTimeout(() => {
      try { const mf: any = document.getElementById('ml-field'); if (mf && seed) mf.setValue?.(seed, { format: 'math-ml' }); } catch {}
    }, 50);
  };

  const onPreviewClick = (qi: number, field: 'QuestionContent'|'ExplanationContent', e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const tokenHost = target.closest('.editable-math') as HTMLElement | null;
    if (tokenHost) {
      const token = tokenHost.getAttribute('data-token') || '';
      setMathTarget({ q: qi, field, token });
      setShowMathKb(true);
      return;
    }
    // If clicked directly on rendered MathML, capture its outerHTML as token
    const mathEl = target.closest('math') as HTMLElement | null;
    if (mathEl) {
      const token = mathEl.outerHTML;
      setMathTarget({ q: qi, field, token });
      setShowMathKb(true);
      // Seed editor with existing MathML
      setTimeout(() => {
        try { const mf: any = document.getElementById('ml-field'); if (mf) mf.setValue?.(token, { format: 'math-ml' }); } catch {}
      }, 50);
    }
  };

  // Đảm bảo MathML luôn được beautify, giữ định dạng tốt nhất
  function beautifyMathML(mml: string, token?: string) {
    if (!mml) return '';
    let out = mml;
    // Xử lý display nếu math cũ là display block
    if (token && token.startsWith('<math') && /display="block"/.test(token)) {
      out = out.replace(/<math([^>]*)>/, (m, attrs) => `<math${attrs.includes('display=') ? attrs : attrs+' display="block"'}>`);
    } else {
      out = out.replace(/<math([^>]*)display="block"/, '<math$1');
    }
    // Chuẩn hóa: loại bỏ whitespace thừa, chèn tag cần thiết (không quá tích cực)
    out = out.replace(/\s{2,}/g, ' ');
    // Có thể format đẹp thêm ở đây nếu muốn
    return out;
  }

  const setMathFromEditor = () => {
    try {
      const mf: any = document.getElementById('ml-field');
      let mml: string = mf?.getValue?.('math-ml') || '';
      if (!mathTarget || !mml) return setShowMathKb(false);
      // Xử lý beautify mathml
      mml = beautifyMathML(mml, mathTarget.token);
      const { q, field, o, token } = mathTarget;
      if (field === 'QuestionContent') {
        const content = questions[q].QuestionContent || '';
        const newContent = token ? content.replace(token, mml) : mml;
        updateQuestion(q, { QuestionContent: newContent } as any);
      } else if (field === 'ExplanationContent') {
        const content = questions[q].ExplanationContent || '';
        const newContent = token ? content.replace(token, mml) : mml;
        updateQuestion(q, { ExplanationContent: newContent } as any);
      } else if (field === 'OptionText' && o !== undefined) {
        const content = questions[q].Options?.[o]?.OptionText || '';
        const newContent = token ? content.replace(token, mml) : mml;
        updateOption(q, o, 'OptionText', newContent);
      }
    } finally { setShowMathKb(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold">Xem lại và chỉnh sửa câu hỏi</h1>
          <div className="flex gap-2">
            <Button variant={advanced ? 'default' : 'outline'} onClick={() => setAdvanced(a => !a)}>
              {advanced ? 'Ẩn chế độ chuyên sâu' : 'Bật chế độ chuyên sâu'}
            </Button>
            <Button variant="outline" onClick={() => router.push(`/dashboard/assignments/${id}`)}>Hủy</Button>
            <Button onClick={publish} disabled={inserting}>{inserting ? 'Đang xuất bản...' : 'Xuất bản'}</Button>
          </div>
        </div>
        {validationError && <div className="mb-3 p-3 bg-red-50 border border-red-200 text-sm text-red-700">{validationError}</div>}
        {error && <div className="mb-3 p-3 bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>}

        {/* Phân bổ điểm theo loại câu hỏi */}
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

        {/* One-column, liền mạch: preview + click-to-edit + quick fields */}
        <div className="space-y-4">
          {questions.map((q, qi) => {
            // Tính số thứ tự câu hỏi (không đếm QuestionType 3 - tiêu đề)
            const questionNumber = questions.slice(0, qi + 1).filter(q => q.QuestionType !== 3).length;
            
            // QuestionType 3 = Tiêu đề: hiển thị như header, không phải câu hỏi
            if (q.QuestionType === 3) {
              return (
                <div key={qi} className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-semibold text-blue-700">📌 TIÊU ĐỀ</div>
                    <div className="flex items-center gap-2">
                      {advanced && (
                        <Input className="w-16" type="number" title="Loại" value={q.QuestionType} onChange={e => updateQuestion(qi, { QuestionType: parseInt(e.target.value||'3') } as any)} />
                      )}
                      <Button size="sm" variant="outline" onClick={() => setQuestions(prev => prev.filter((_, i) => i !== qi))}>Xóa</Button>
                    </div>
                  </div>
                  <div className="text-lg font-bold text-blue-900 cursor-pointer" onClick={(e) => onPreviewClick(qi, 'QuestionContent', e)} dangerouslySetInnerHTML={{ __html: renderRich(q.QuestionContent) }} />
                </div>
              );
            }

            // Các loại câu hỏi khác
            return (
              <div key={qi} className="bg-white border rounded p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium">Câu {questionNumber}</div>
                  <div className="flex items-center gap-2">
                    {advanced ? (
                      <Input className="w-16" type="number" title="Loại" value={q.QuestionType} onChange={e => updateQuestion(qi, { QuestionType: parseInt(e.target.value||'1') } as any)} />
                    ) : (
                      <div className="text-xs px-2 py-1 bg-gray-100 rounded" title={`Loại: ${getQuestionTypeName(q.QuestionType)}`}>
                        {getQuestionTypeName(q.QuestionType)}
                      </div>
                    )}
                    {advanced ? (
                      <Input className="w-16" type="number" title="Độ khó" value={q.DifficultyLevel} onChange={e => updateQuestion(qi, { DifficultyLevel: parseInt(e.target.value||'1') } as any)} />
                    ) : (
                      <div className="text-xs px-2 py-1 bg-gray-100 rounded" title={`Độ khó: ${q.DifficultyLevel}`}>
                        {q.DifficultyLevel}
                      </div>
                    )}
                    <Input 
                      className="w-20" 
                      type="number" 
                      step="0.1" 
                      title="Điểm" 
                      value={q.DefaultPoints && q.DefaultPoints > 0 ? q.DefaultPoints : ''} 
                      onChange={e => {
                        const value = parseFloat(e.target.value);
                        updateQuestion(qi, { DefaultPoints: isNaN(value) ? 0 : value } as any);
                      }} 
                    />
                    <Button size="sm" variant="outline" onClick={() => setQuestions(prev => prev.filter((_, i) => i !== qi))}>Xóa</Button>
                  </div>
                </div>

                <div className="prose max-w-none cursor-pointer" onClick={(e) => onPreviewClick(qi, 'QuestionContent', e)} dangerouslySetInnerHTML={{ __html: renderRich(q.QuestionContent) }} />

              {/* Render options khác nhau tùy theo loại câu hỏi */}
              {q.QuestionType === 2 ? (
                // Loại tự luận ngắn (ShortAnswer): hiển thị đáp số từ optionText (phân tách bởi "|")
                q.Options?.length ? (
                  <div className="mt-2">
                    <div className="text-xs text-gray-500 mb-1">Đáp số:</div>
                    {q.Options.map((o, oi) => (
                      <div key={oi} className="flex items-start gap-2">
                        <div className="flex-1 prose max-w-none cursor-pointer" onClick={() => openMathEditor(qi, 'OptionText', oi, o.OptionText)} dangerouslySetInnerHTML={{ __html: renderRich(o.OptionText) }} />
                      </div>
                    ))}
                  </div>
                ) : null
              ) : q.Options?.length ? (
                // Loại trắc nghiệm/đúng-sai: render options với checkbox
                <div className="mt-2 space-y-2">
                  {q.Options.map((o, oi) => (
                    <div key={oi} className="flex items-start gap-2">
                      <div className="text-sm w-5">{String.fromCharCode(65+oi)}.</div>
                      <div className="flex-1 prose max-w-none cursor-pointer" onClick={() => openMathEditor(qi, 'OptionText', oi, o.OptionText)} dangerouslySetInnerHTML={{ __html: renderRich(o.OptionText) }} />
                      <label className="text-sm inline-flex items-center gap-1">
                        <input type="checkbox" checked={!!o.IsCorrect} onChange={e => updateOption(qi, oi, 'IsCorrect', e.target.checked)} /> Đúng
                      </label>
                    </div>
                  ))}
                </div>
              ) : null}

                {q.ExplanationContent ? (
                  <div className="mt-3">
                    <div className="text-xs text-gray-500">Lời giải</div>
                    <div className="prose max-w-none cursor-pointer" onClick={(e) => onPreviewClick(qi, 'ExplanationContent', e)} dangerouslySetInnerHTML={{ __html: renderRich(q.ExplanationContent) }} />
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>

        {showMathKb && (
          <div className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl p-0">
              <div className="border-b px-7 py-4 flex items-center justify-between">
                <div className="font-bold text-base">Soạn thảo công thức</div>
                <button className="text-lg px-1 py-0.5" aria-label="Đóng" onClick={() => setShowMathKb(false)}>✕</button>
              </div>
              <div className="px-7 pt-6 pb-2 flex flex-col items-center">
                <div style={{ width: '100%' }}>
                  <math-field 
                    id="ml-field" 
                    style={{ fontSize: '2rem', minHeight: 70, width: '100%' }}
                    virtual-keyboard-mode="manual"
                    virtual-keyboards="all symbols roman letters functions arrows calculus trigonometry geometry sets derivatives integrals"
                  ></math-field>
                </div>
              </div>
              {/* Bàn phím CASIO do mathlive render dưới */}
              <div className="w-full min-h-[210px] flex items-center px-2 mb-2">
                {/* mathlive tự render keyboard global */}
              </div>
              <div className="border-t px-6 py-4 flex justify-end gap-2 items-center bg-gray-50">
                <Button size="sm" variant="outline" onClick={() => setShowMathKb(false)}>Hủy</Button>
                <Button className="!ml-2 text-base px-7 py-2" onClick={setMathFromEditor}>Chèn</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


