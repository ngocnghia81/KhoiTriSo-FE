'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAIGenerateQuestions, useBatchInsertQuestions, AIGeneratedQuestion } from '@/hooks/useAssignments';
import { useUpload } from '@/hooks/useUpload';
import { useAuth } from '@/contexts/AuthContext';

interface ImportQuestionsFromWordProps {
  assignmentId: number;
  onClose: () => void;
  onImported: () => void;
}

export function ImportQuestionsFromWord({ assignmentId, onClose, onImported }: ImportQuestionsFromWordProps) {
  const router = useRouter();
  const { user } = useAuth();
  const insertAtCursor = (el: HTMLTextAreaElement | HTMLInputElement, before: string, after: string = '') => {
    const start = el.selectionStart ?? el.value.length;
    const end = el.selectionEnd ?? el.value.length;
    const selected = el.value.slice(start, end);
    const newValue = el.value.slice(0, start) + before + selected + after + el.value.slice(end);
    el.value = newValue;
    const caret = start + before.length + selected.length;
    el.setSelectionRange(caret, caret);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.focus();
  };

  const MATHML_NS = 'http://www.w3.org/1998/Math/MathML';

  const [showMathKb, setShowMathKb] = useState(false);
  type MathTarget = { type: 'el'; el: HTMLInputElement | HTMLTextAreaElement } | { type: 'model'; qi: number; field: 'QuestionContent' | 'ExplanationContent' | 'OptionText'; oi?: number; seed?: string };
  const [mathKbTarget, setMathKbTarget] = useState<MathTarget | null>(null);

  const MathToolbar = ({ targetRef }: { targetRef: React.RefObject<HTMLTextAreaElement | HTMLInputElement> }) => (
    <div className="flex flex-wrap gap-2 text-xs mt-2">
      <Button type="button" variant="outline" size="sm" onClick={() => targetRef.current && insertAtCursor(targetRef.current, `<math xmlns="${MATHML_NS}"><mi>x</mi><mo>=</mo><mn>1</mn></math>`)}>Inline math</Button>
      <Button type="button" variant="outline" size="sm" onClick={() => targetRef.current && insertAtCursor(targetRef.current, `\n<math xmlns="${MATHML_NS}"><mrow><mi>y</mi><mo>=</mo><mfrac><mn>1</mn><mi>x</mi></mfrac></mrow></math>\n`)}>Block math</Button>
      <Button type="button" variant="outline" size="sm" onClick={() => targetRef.current && insertAtCursor(targetRef.current, `<math xmlns="${MATHML_NS}"><mfrac><mi>a</mi><mi>b</mi></mfrac></math>`)}>mfrac</Button>
      <Button type="button" variant="outline" size="sm" onClick={() => targetRef.current && insertAtCursor(targetRef.current, `<math xmlns="${MATHML_NS}"><msqrt><mi>x</mi></msqrt></math>`)}>sqrt</Button>
      <Button type="button" variant="outline" size="sm" onClick={() => targetRef.current && insertAtCursor(targetRef.current, `<math xmlns="${MATHML_NS}"><msup><mi>x</mi><mn>2</mn></msup></math>`)}>x^2</Button>
      <Button type="button" variant="outline" size="sm" onClick={() => targetRef.current && insertAtCursor(targetRef.current, `<math xmlns="${MATHML_NS}"><msub><mi>x</mi><mn>1</mn></msub></math>`)}>x_1</Button>
      <Button type="button" variant="outline" size="sm" onClick={() => targetRef.current && insertAtCursor(targetRef.current, `<math xmlns="${MATHML_NS}"><mo>∑</mo><msub><mi>i</mi><mn>1</mn></msub><msup><mi>n</mi><mn>k</mn></msup></math>`)}>sum</Button>
      <Button type="button" variant="outline" size="sm" onClick={() => targetRef.current && insertAtCursor(targetRef.current, `<math xmlns="${MATHML_NS}"><mo>∫</mo><msub><mn>0</mn></msub><msup><mn>1</mn></msup><mrow><mo>(</mo><mn>2</mn><mi>x</mi><mo>)</mo><msup><mn>3</mn></msup><mi>d</mi><mi>x</mi></mrow></math>`)}>∫</Button>
      <Button type="button" variant="default" size="sm" onClick={() => { if (targetRef.current) { setMathKbTarget({ type: 'el', el: targetRef.current }); setShowMathKb(true); } }}>Bàn phím CASIO</Button>
    </div>
  );

  const EditorWithMathToolbar = ({
    value,
    onChange,
    placeholder,
    rows = 3,
    multiline = true
  }: {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => void;
    placeholder?: string;
    rows?: number;
    multiline?: boolean;
  }) => {
    const ref = React.useRef<HTMLTextAreaElement | HTMLInputElement>(null);
    return (
      <div>
        {multiline ? (
          <Textarea ref={ref as any} value={value} placeholder={placeholder} onChange={onChange as any} rows={rows} />
        ) : (
          <Input ref={ref as any} value={value} placeholder={placeholder} onChange={onChange as any} />
        )}
        <MathToolbar targetRef={ref as any} />
      </div>
    );
  };
  const { generateFromWord, loading: generating, error: genError } = useAIGenerateQuestions();
  const { batchInsert, loading: inserting, error: insertError } = useBatchInsertQuestions();
  const { uploadFileWithPresign, uploading: uploadingFile } = useUpload();
  const [file, setFile] = useState<File | null>(null);
  const [questions, setQuestions] = useState<AIGeneratedQuestion[]>([]);
  const [step, setStep] = useState<'upload' | 'preview'>('upload');
  const [error, setError] = useState<string | null>(null);
  const [showEditor, setShowEditor] = useState<boolean>(false);
  const [excludedCount, setExcludedCount] = useState<number>(0);

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

  // Helpers to normalize MathML for rendering without mutating user input
  const htmlDecode = (s: string) => {
    if (!s) return s;
    return s
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&');
  };

  // Always ensure correct MathML namespace. Patch for all MathML tags missing the recommended xmlns.
  function ensureMathNamespace(s: string) {
    if (!s) return s;
    // Nếu đã đúng xmlns thì giữ nguyên
    if (/<math\s[^>]*xmlns=("|')http:\/\/www\.w3\.org\/1998\/Math\/MathML("|')/.test(s)) return s;
    // Nếu là <math ...> mà thiếu xmlns, thì thêm vào đúng chỗ
    return s.replace(/<math(\s|>)/, '<math xmlns="http://www.w3.org/1998/Math/MathML"$1');
  }

  const looksLikeFragment = (s: string) => /<\s*(mfrac|msup|msub|mi|mn|mo)\b/i.test(s) && !/<\s*math\b/i.test(s);

  const stripMathMLTagsToText = (s: string) => s
    .replace(/<\/?(math|mrow|mi|mn|mo|msup|msub|mfrac|msqrt)[^>]*>/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  // Helper: nhận diện dòng văn bản là công thức toán học đơn giản
  const mathyLine = (l: string) =>
    /^[\d\s\+\-\*/=\^\(\)xya-zA-Z,.;:<>∪∩∞√ΣΔ∫δλμπθρσχα-ωΑ-Ω±≤≥∞\[\]]+$/.test(l) && /[=\^\+\-∫√]/.test(l);

  // Helper: gộp các dòng quá ngắn (ký tự lẻ làm bẩn layout)
  const compactLines = (lines: string[]): string[] => {
    const out: string[] = [];
    let buf = '';
    for (let i = 0; i < lines.length; ++i) {
      const l = lines[i].trim();
      // MathML giữ nguyên dòng riêng
      if (/<\s*math\b[^>]*>/.test(l)) {
        if (buf) out.push(buf); buf = '';
        out.push(l);
        continue;
      }
      // Nếu là dòng trắng: xả buff
      if (!l) { if (buf) out.push(buf); buf = ''; continue; }
      // Nếu quá ngắn: nhập thêm vào buff
      if (l.length <= 2 && !mathyLine(l) && !/[:,.;=]/.test(l)) {
        buf += l;
        continue;
      }
      // Nếu buff có rồi thì nối vào trước dòng dài
      if (buf) { out.push(buf); buf = ''; }
      out.push(l);
    }
    if (buf) out.push(buf);
    return out;
  };

  const normalizeMathForRender = (raw: string) => {
    if (!raw) return '';
    const s = htmlDecode(raw.trim()).replace(/\r?\n|\r/g, '\n').replace(/\s+/g, ' ');
    // Patch cho các fragment đặc biệt do AI/backend trả lỗi
    if (/^mfrac$/i.test(s)) return '<math xmlns="http://www.w3.org/1998/Math/MathML"><mfrac><mn>1</mn><mn>2</mn></mfrac></math>';
    if (/^msup$/i.test(s)) return '<math xmlns="http://www.w3.org/1998/Math/MathML"><msup><mi>x</mi><mn>2</mn></msup></math>';
    if (/^mover$/i.test(s)) return '<math xmlns="http://www.w3.org/1998/Math/MathML"><mover><mi>x</mi><mo>¯</mo></mover></math>';
    if (/^msub$/i.test(s)) return '<math xmlns="http://www.w3.org/1998/Math/MathML"><msub><mi>x</mi><mn>1</mn></msub></math>';
    if (/math input error/i.test(s)) return '<span style="color: red">[Lỗi công thức toán học]</span>';
    // Gộp dòng như trước, sau đó smart join only for text
    const groupedLines = compactLines(s.split('\n'));
    // Render lại: MathML từng block => giữ liền, text thì join <br/>
    let result = '';
    for (const line of groupedLines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      // MathML thì add liền, KHÔNG chèn <br/>
      if (/^<math/i.test(trimmed)) {
        result += trimmed;
      } else {
        // Text thường thì xuống dòng cho dễ đọc
        result += trimmed + '<br/>';
      }
    }
    // Xoá <br/> cuối cùng nếu có
    result = result.replace(/(<br\/>)+$/g, '');
    return result;
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
  };

  const handleGenerate = async () => {
    if (!file) {
      setError('Vui lòng chọn file .docx');
      return;
    }
    setError(null);
    
    try {
      // Step 1: Tạo filename mới với timestamp + userid để tránh trùng
      const timestamp = Date.now();
      const userId = user?.id || 'unknown';
      const fileExtension = file.name.split('.').pop() || 'docx';
      const newFileName = `${timestamp}_${userId}.${fileExtension}`;
      
      // Tạo File mới với tên mới
      const renamedFile = new File([file], newFileName, { type: file.type });
      
      // Step 2: Upload file to Cloudflare Workers
      console.log('Uploading Word file to Cloudflare Workers...');
      const uploadResult = await uploadFileWithPresign(renamedFile, {
        folder: 'word-imports',
        accessRole: 'GUEST',
        onProgress: (progress) => {
          console.log(`Upload progress: ${progress.percentage}%`);
        }
      });

      if (!uploadResult.success || !uploadResult.url) {
        throw new Error(uploadResult.error || 'Upload file thất bại');
      }

      console.log('File uploaded successfully, URL:', uploadResult.url);

      // Step 3: Send FileUrl to AI API
      const res = await generateFromWord(uploadResult.url);
      if (res.success && res.data) {
      // Initialize OrderIndex and default points if missing
      const stripChoicePrefix = (s: string) => (s || '').replace(/^\s*[A-Da-d]\s*[:.\-]\s*/,'').trim();
      const hasMathMLFragment = (s: string) => /<\s*(mfrac|msup|msub|mi|mn|mo)\b/i.test(s) && !/<\s*math\b/i.test(s);
      const wrapMathML = (s: string) => {
        if (!s) return s;
        if (hasMathMLFragment(s)) {
          return `<math xmlns="http://www.w3.org/1998/Math/MathML">${s}</math>`;
        }
        return s;
      };

      const toAppQuestion = (q: any, idx: number) => {
        // Accept both old and new response shapes
        const questionContent = q.QuestionContent ?? q.content ?? '';
        const explanation = q.ExplanationContent ?? q.Explanation ?? '';
        const optionsSource = Array.isArray(q.Options) ? q.Options : (Array.isArray(q.ContentOptions) ? q.ContentOptions : []);
        const options = optionsSource.map((o: any, oi: number) => ({
          OptionText: stripChoicePrefix(wrapMathML(o.OptionText ?? o.Content ?? o.content ?? '')),
          IsCorrect: !!(o.IsCorrect ?? o.isCorrect),
          OrderIndex: o.OrderIndex ?? oi
        }));
        return {
          ...q,
          QuestionContent: wrapMathML(questionContent),
          ExplanationContent: wrapMathML(explanation),
          DefaultPoints: q.DefaultPoints ?? 1,
          QuestionType: q.QuestionType,
          Options: options
        } as AIGeneratedQuestion as any;
      };

      const normalized = (res.data as any[]).map(toAppQuestion);
      // Giữ lại tất cả questions, kể cả QuestionType 3 (tiêu đề)
      const filtered = normalized;
      setExcludedCount(0); // Không loại bỏ gì nữa
      // Lưu vào sessionStorage và chuyển sang trang review để chỉnh sửa lần cuối
      try {
        const key = `generated_questions_assignment_${assignmentId}`;
        sessionStorage.setItem(key, JSON.stringify({ questions: filtered }));
      } catch {}
      
      // Detect dashboard or instructor route
      const pathname = window.location.pathname;
      const isInstructor = pathname.includes('/instructor');
      const reviewPath = isInstructor 
        ? `/instructor/assignments/${assignmentId}/review-generated`
        : `/dashboard/assignments/${assignmentId}/review-generated`;
      
      router.push(reviewPath);
      return;
      } else {
        setError(res.error || 'Không thể tạo câu hỏi từ file');
      }
    } catch (err) {
      console.error('Error in handleGenerate:', err);
      setError(err instanceof Error ? err.message : 'Lỗi khi xử lý file');
    }
  };

  const removeQuestionAt = (index: number) => {
    setQuestions(prev => prev.filter((_, i) => i !== index));
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

  // Nạp MathLive bằng npm khi mở bàn phím lần đầu
  useEffect(() => {
    if (!showMathKb) return;
    if (typeof window === 'undefined') return;
    (async () => {
      try {
        // Fix fonts path for Next.js: load from CDN
        (window as any).mathlive = { fontsDirectory: 'https://unpkg.com/mathlive/dist/fonts' };
        await import('mathlive');
      } catch {}
    })();
    // seed value if provided
    setTimeout(() => {
      try {
        const mf: any = document.getElementById('ml-field');
        const seed = (mathKbTarget as any)?.seed;
        if (mf && seed) mf.setValue?.(seed, { format: 'math-ml' });
        if (mf) {
          mf.setOptions?.({
            virtualKeyboardMode: 'manual',
            virtualKeyboards: 'all symbols roman letters functions arrows calculus trigonometry geometry sets derivatives integrals',
          });
          mf.focus?.();
          if (typeof mf.showVirtualKeyboard === 'function') mf.showVirtualKeyboard();
          if (typeof mf.executeCommand === 'function') mf.executeCommand('showVirtualKeyboard');
        }
      } catch {}
    }, 200);
  }, [showMathKb]);

  // Khi modal bật và token là MathML, setValue vào math-field
  useEffect(() => {
    if (!showMathKb || !(mathKbTarget as any)?.token) return;
    const token = (mathKbTarget as any).token;
    if (typeof token === 'string' && token.startsWith('<math')) {
      setTimeout(() => {
        try {
          const mf: any = document.getElementById('ml-field');
          if (mf && mf.setValue) mf.setValue(token, { format: 'math-ml' });
        } catch {}
      }, 100);
    }
  }, [showMathKb, (mathKbTarget as any)?.token]);

  useEffect(() => {
    const w = window as any;
    if (w && w.MathJax && typeof w.MathJax.typesetPromise === 'function') {
      w.MathJax.typesetPromise?.();
    }
  }, [questions, step, showEditor]);

  const updateQuestion = (index: number, patch: Partial<AIGeneratedQuestion>) => {
    setQuestions(prev => prev.map((q, i) => i === index ? { ...q, ...patch } : q));
  };

  const updateOption = (qIndex: number, oIndex: number, field: 'OptionText' | 'IsCorrect', value: any) => {
    setQuestions(prev => prev.map((q, i) => {
      if (i !== qIndex) return q;
      const options = [...(q.Options || [])];
      options[oIndex] = { ...options[oIndex], [field]: value };
      return { ...q, Options: options };
    }));
  };

  const addOption = (qIndex: number) => {
    setQuestions(prev => prev.map((q, i) => {
      if (i !== qIndex) return q;
      const options = [...(q.Options || [])];
      options.push({ OptionText: '', IsCorrect: false, OrderIndex: options.length });
      return { ...q, Options: options };
    }));
  };

  const removeOption = (qIndex: number, oIndex: number) => {
    setQuestions(prev => prev.map((q, i) => {
      if (i !== qIndex) return q;
      const options = (q.Options || []).filter((_, idx) => idx !== oIndex).map((o, idx) => ({ ...o, OrderIndex: idx }));
      return { ...q, Options: options };
    }));
  };

  // Validation function for DefaultPoints (matching backend logic)
  const validateDefaultPoints = (questions: AIGeneratedQuestion[]): { valid: boolean; error?: string } => {
    if (questions.length === 0) {
      return { valid: false, error: 'Không có câu hỏi để import' };
    }

    const questionsWithPoints = questions.filter(
      q => q.DefaultPoints != null && q.DefaultPoints > 0
    );
    const questionsWithoutPoints = questions.filter(
      q => q.DefaultPoints == null || q.DefaultPoints <= 0
    );

    // Rule 3.1: All questions must either all have DefaultPoints OR all don't have DefaultPoints
    if (questionsWithPoints.length > 0 && questionsWithoutPoints.length > 0) {
      return {
        valid: false,
        error: 'Nếu đã nhập điểm cho một số câu, bạn phải nhập điểm cho tất cả các câu. Hoặc để trống tất cả để hệ thống tự động tính điểm.'
      };
    }

    // If all have DefaultPoints, validate that total = 10
    if (questionsWithPoints.length === questions.length) {
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

  const handleImport = async () => {
    if (questions.length === 0) {
      setError('Không có câu hỏi để import');
      return;
    }

    // Validate DefaultPoints before sending
    const validation = validateDefaultPoints(questions);
    if (!validation.valid) {
      setError(validation.error || 'Validation thất bại');
      return;
    }

    const req = { Questions: questions };
    const res = await batchInsert(assignmentId, req);
    if (res.success) {
      onImported();
      // Chuyển đến trang chi tiết/biên tập bài tập để người dùng chỉnh sửa ngay
      // Detect dashboard or instructor route
      const pathname = window.location.pathname;
      const isInstructor = pathname.includes('/instructor');
      const detailPath = isInstructor 
        ? `/instructor/assignments/${assignmentId}`
        : `/dashboard/assignments/${assignmentId}`;
      
      router.push(detailPath);
    } else {
      setError(res.error || 'Import thất bại');
    }
  };

  // Render MathML as returned from backend without modification
  function safeMathML(content: string | undefined) {
    return (content ?? '').trim();
  }

  // Open math editor from preview
  const openMathEditor = (qi: number, field: 'QuestionContent' | 'ExplanationContent' | 'OptionText', oi?: number, seed?: string) => {
    setMathKbTarget({ type: 'model', qi, field, oi, seed });
    setShowMathKb(true);
  };

  // Rich text: [!b:$...$], [!i:$...$], [!sub:$...$], [img:$key$], [!m:$...$]
  const renderRich = (s?: string) => {
    if (!s) return '';
    let out = s;
    out = out.replace(/\[!b:\$(.*?)\$\]/g, '<strong>$1</strong>');
    out = out.replace(/\[!i:\$(.*?)\$\]/g, '<em>$1</em>');
    out = out.replace(/\[!sub:\$(.*?)\$\]/g, '<sub>$1</sub>');
    // math token: if payload looks like <math ...> use it, else keep a clickable placeholder
    out = out.replace(/\[!m:\$(.*?)\$\]/g, (_m, p1) => {
      const payload = String(p1 || '').trim();
      if (payload.startsWith('<math')) return payload; // already MathML
      const token = `[!m:$${payload}$]`;
      return `<span class="editable-math" data-token="${token}">[Công thức]</span>`;
    });
    // simple image token pass-through (user có thể đã thay bằng base64)
    out = out.replace(/\[img:\$(.*?)\$\]/g, (_m, p1) => `<span class="inline-img" data-img="$${String(p1||'')}$">[Hình]</span>`);
    return out;
  };

  // Delegate click to editable math tokens; if token exists, open CASIO and seed if possible
  const onPreviewClick = (qi: number, field: 'QuestionContent' | 'ExplanationContent', e: React.MouseEvent<HTMLDivElement>) => {
    const host = (e.target as HTMLElement).closest('.editable-math') as HTMLElement | null;
    if (host) {
      const token = host.getAttribute('data-token') || '';
      setMathKbTarget({ type: 'model', qi, field } as any);
      (setMathKbTarget as any)((prev: any) => ({ ...prev, token }));
      setShowMathKb(true);
      return;
    }
    const mathEl = (e.target as HTMLElement).closest('math') as HTMLElement | null;
    if (mathEl) {
      const token = mathEl.outerHTML;
      setMathKbTarget({ type: 'model', qi, field } as any);
      (setMathKbTarget as any)((prev: any) => ({ ...prev, token }));
      setShowMathKb(true);
      setTimeout(() => {
        try { const mf: any = document.getElementById('ml-field'); if (mf) mf.setValue?.(token, { format: 'math-ml' }); } catch {}
      }, 50);
    }
  };

  return (
    <div className="py-8">
      <div className="mx-auto p-6 w-full max-w-5xl rounded-md bg-white border shadow-sm">
        {/* Compact math styles */}
        <style>{`
          .prose .mjx-chtml { line-height: 1.2; }
        `}</style>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Import câu hỏi từ file Word</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>✕</Button>
        </div>

        {(error || genError || insertError) && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
            {error || genError || insertError}
          </div>
        )}

        {step === 'upload' && (
          <Card>
            <CardHeader>
              <CardTitle>Tải lên file .docx</CardTitle>
              <CardDescription>Chọn file Word chứa danh sách câu hỏi để AI phân tích</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input type="file" accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={handleFileChange} />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={onClose}>Hủy</Button>
                  <Button onClick={handleGenerate} disabled={!file || generating || uploadingFile}>
                    {uploadingFile ? 'Đang tải lên...' : generating ? 'Đang phân tích...' : 'Phân tích'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 'preview' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">Chế độ: {showEditor ? 'Chỉnh sửa' : 'Xem chính thức (ẩn văn bản thô)'}</div>
              <Button variant="outline" size="sm" onClick={() => setShowEditor(v => !v)}>
                {showEditor ? 'Chỉ hiển thị bản chính thức' : 'Bật chỉnh sửa'}
              </Button>
            </div>
            {excludedCount > 0 && (
              <div className="p-3 text-sm text-gray-700 bg-amber-50 border border-amber-200 rounded">
                Đã bỏ {excludedCount} mục không phải câu hỏi (chỉ thị/tiêu đề).
              </div>
            )}
            {questions.map((q, qi) => (
              <Card key={qi}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Câu {qi + 1}</CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => removeQuestionAt(qi)}>Xóa câu này</Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Nội dung câu hỏi</label>
                    {showEditor && (
                      <EditorWithMathToolbar
                        value={q.QuestionContent}
                        onChange={(e) => updateQuestion(qi, { QuestionContent: (e.target as HTMLTextAreaElement).value })}
                        rows={4}
                        multiline
                      />
                    )}
                    <div className="mt-2 rounded border p-3 bg-gray-50" onClick={(e) => onPreviewClick(qi, 'QuestionContent', e)}>
                      <div className="text-xs text-gray-500 mb-1">Xem trước</div>
                      <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: renderRich(q.QuestionContent) }} />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Loại</label>
                      {showEditor ? (
                        <Input type="number" value={q.QuestionType} onChange={(e) => updateQuestion(qi, { QuestionType: parseInt(e.target.value || '1') })} />
                      ) : (
                        <div className="text-sm text-gray-700 p-2 border rounded bg-gray-50">{getQuestionTypeName(q.QuestionType)}</div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Độ khó</label>
                      {showEditor ? (
                        <Input type="number" value={q.DifficultyLevel} onChange={(e) => updateQuestion(qi, { DifficultyLevel: parseInt(e.target.value || '1') })} />
                      ) : (
                        <div className="text-sm text-gray-700 p-2 border rounded bg-gray-50">{q.DifficultyLevel}</div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Điểm</label>
                      {showEditor ? (
                        <Input type="number" step="0.1" value={q.DefaultPoints} onChange={(e) => updateQuestion(qi, { DefaultPoints: parseFloat(e.target.value || '1') })} />
                      ) : (
                        <div className="text-sm text-gray-700 p-2 border rounded bg-gray-50">{q.DefaultPoints}</div>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Giải thích</label>
                    {showEditor && (
                      <EditorWithMathToolbar
                        value={q.ExplanationContent || ''}
                        onChange={(e) => updateQuestion(qi, { ExplanationContent: (e.target as HTMLTextAreaElement).value })}
                        rows={3}
                        multiline
                      />
                    )}
                    <div className="mt-2 rounded border p-3 bg-gray-50" onClick={(e) => onPreviewClick(qi, 'ExplanationContent', e)}>
                      <div className="text-xs text-gray-500 mb-1">Xem trước</div>
                      <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: renderRich(q.ExplanationContent) }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium">Đáp án</label>
                      {showEditor && (
                        <Button type="button" variant="outline" size="sm" onClick={() => addOption(qi)}>Thêm đáp án</Button>
                      )}
                    </div>
                    <div className="space-y-2">
                      {(q.Options || []).map((opt, oi) => (
                        <div key={oi} className="flex flex-col gap-2">
                          {showEditor && (
                            <div className="flex flex-col gap-2">
                              <EditorWithMathToolbar
                                value={opt.OptionText || ''}
                                onChange={(e) => updateOption(qi, oi, 'OptionText', (e.target as HTMLInputElement | HTMLTextAreaElement).value)}
                                multiline={false}
                              />
                              <div className="flex items-center gap-2">
                                <label className="text-sm flex items-center gap-1">
                                  <input type="checkbox" checked={!!opt.IsCorrect} onChange={(e) => updateOption(qi, oi, 'IsCorrect', e.target.checked)} />
                                  Đúng
                                </label>
                                <Button type="button" variant="ghost" size="sm" onClick={() => removeOption(qi, oi)}>Xóa</Button>
                              </div>
                            </div>
                          )}
                          <div className="rounded border p-2 bg-gray-50">
                            <div className="text-xs text-gray-500 mb-1">Đáp án {oi + 1} {opt.IsCorrect ? '(đúng)' : ''}</div>
                            <div className="prose max-w-none flex items-center gap-1 cursor-pointer" onClick={() => openMathEditor(qi, 'OptionText', oi, opt.OptionText || '')} dangerouslySetInnerHTML={{ __html: renderRich(String((opt.OptionText || '').replace(/<!---->/g, '').trim())) }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setStep('upload')} disabled={inserting}>Quay lại</Button>
              <Button onClick={handleImport} disabled={inserting || questions.length === 0}>{inserting ? 'Đang import...' : 'Xác nhận import'}</Button>
            </div>
          </div>
        )}

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
                <Button className="!ml-2 text-base px-7 py-2" onClick={() => {
                  try {
                    const mf: any = document.getElementById('ml-field');
                    const mml: string = mf?.getValue?.('math-ml') || '';
                    if (mml && mathKbTarget) {
                      if (mathKbTarget.type === 'el') {
                        insertAtCursor(mathKbTarget.el, mml);
                      } else if (mathKbTarget.type === 'model') {
                        const { qi, field, o } = mathKbTarget as any;
                        if (field === 'QuestionContent') {
                          const content = questions[qi].QuestionContent || '';
                          const token = (mathKbTarget as any).token as string | undefined;
                          const newContent = token ? content.replace(token, mml) : mml;
                          updateQuestion(qi, { QuestionContent: newContent } as any);
                        } else if (field === 'ExplanationContent') {
                          const content = questions[qi].ExplanationContent || '';
                          const token = (mathKbTarget as any).token as string | undefined;
                          const newContent = token ? content.replace(token, mml) : mml;
                          updateQuestion(qi, { ExplanationContent: newContent } as any);
                        } else if (field === 'OptionText' && o !== undefined) {
                          const content = questions[qi].Options?.[o]?.OptionText || '';
                          const token = (mathKbTarget as any).token as string | undefined;
                          const newContent = token ? content.replace(token, mml) : mml;
                          updateOption(qi, o, 'OptionText', newContent);
                        }
                      }
                    }
                  } catch {}
                  setShowMathKb(false);
                }}>Chèn</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


