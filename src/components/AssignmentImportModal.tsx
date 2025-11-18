'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateAssignment } from '@/hooks/useAssignments';
import { useAIGenerateQuestions } from '@/hooks/useAssignments';
import { useUpload } from '@/hooks/useUpload';
import { useAuth } from '@/contexts/AuthContext';
import { XMarkIcon, DocumentArrowUpIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

interface AssignmentImportModalProps {
  initialLessonId: number;
  onClose: () => void;
  onImported: () => void;
}

export function AssignmentImportModal({ initialLessonId, onClose, onImported }: AssignmentImportModalProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { createAssignment, loading: creatingAssignment } = useCreateAssignment();
  const { generateFromWord, loading: generating } = useAIGenerateQuestions();
  const { uploadFileWithPresign, uploading: uploadingFile } = useUpload();
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        alert('Vui lòng chọn file Word (.docx)');
        return;
      }
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      setError('Vui lòng chọn file Word');
      return;
    }
    if (!initialLessonId) {
      setError('Vui lòng chọn bài học');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Step 1: Tạo assignment mới với title từ tên file
      const fileNameWithoutExt = selectedFile.name.replace(/\.docx?$/i, '');
      const assignmentTitle = fileNameWithoutExt || 'Bài tập mới';
      
      const createResult = await createAssignment({
        lessonId: initialLessonId,
        title: assignmentTitle,
        description: `Bài tập được import từ file: ${selectedFile.name}`,
        maxScore: 10,
        timeLimit: undefined,
        maxAttempts: 1,
        showAnswersAfter: 0, // Sau khi nộp bài
        dueDate: undefined,
        isPublished: false,
        passingScore: undefined,
        shuffleQuestions: false,
        shuffleOptions: false,
      });

      if (!createResult.success || !createResult.data) {
        throw new Error(createResult.error || 'Không thể tạo bài tập');
      }

      const assignmentId = createResult.data.id;

      // Step 2: Tạo filename mới với timestamp + userid để tránh trùng
      const timestamp = Date.now();
      const userId = user?.id || 'unknown';
      const fileExtension = selectedFile.name.split('.').pop() || 'docx';
      const newFileName = `${timestamp}_${userId}.${fileExtension}`;
      
      // Tạo File mới với tên mới
      const renamedFile = new File([selectedFile], newFileName, { type: selectedFile.type });

      // Step 3: Upload file Word to Cloudflare Workers
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

      // Step 4: Generate questions from Word file using AI
      const generateResult = await generateFromWord(uploadResult.url);
      
      if (!generateResult.success || !generateResult.data) {
        throw new Error(generateResult.error || 'Không thể tạo câu hỏi từ file');
      }

      // Step 5: Normalize questions (same logic as ImportQuestionsFromWord)
      const stripChoicePrefix = (s: string) => (s || '').replace(/^\s*[A-Da-d]\s*[:.\-]\s*/,'').trim();
      const hasMathMLFragment = (s: string) => /<\s*(mfrac|msup|msub|mi|mn|mo)\b/i.test(s) && !/<\s*math\b/i.test(s);
      const wrapMathML = (s: string) => {
        if (!s) return s;
        if (hasMathMLFragment(s)) {
          return `<math xmlns="http://www.w3.org/1998/Math/MathML">${s}</math>`;
        }
        return s;
      };

      const toAppQuestion = (q: unknown) => {
        const qData = q as { QuestionContent?: string; content?: string; ExplanationContent?: string; Explanation?: string; Options?: unknown[]; ContentOptions?: unknown[]; DefaultPoints?: number; QuestionType?: number };
        const questionContent = qData.QuestionContent ?? qData.content ?? '';
        const explanation = qData.ExplanationContent ?? qData.Explanation ?? '';
        const optionsSource = Array.isArray(qData.Options) ? qData.Options : (Array.isArray(qData.ContentOptions) ? qData.ContentOptions : []);
        const options = optionsSource.map((o: unknown, oi: number) => {
          const oData = o as { OptionText?: string; Content?: string; content?: string; IsCorrect?: boolean; isCorrect?: boolean; OrderIndex?: number };
          return {
            OptionText: stripChoicePrefix(wrapMathML(oData.OptionText ?? oData.Content ?? oData.content ?? '')),
            IsCorrect: !!(oData.IsCorrect ?? oData.isCorrect),
            OrderIndex: oData.OrderIndex ?? oi
          };
        });
        return {
          ...qData,
          QuestionContent: wrapMathML(questionContent),
          ExplanationContent: wrapMathML(explanation),
          DefaultPoints: qData.DefaultPoints ?? 1,
          QuestionType: qData.QuestionType,
          Options: options
        };
      };

      const normalized = (generateResult.data as unknown[]).map(toAppQuestion);
      // Không filter QuestionType 3 (tiêu đề) vì review page cần hiển thị cả tiêu đề
      const filtered = normalized;

      // Step 6: Save to sessionStorage and redirect to review page
      try {
        const key = `generated_questions_assignment_${assignmentId}`;
        console.log('Saving to sessionStorage:', key, 'Questions count:', filtered.length);
        sessionStorage.setItem(key, JSON.stringify({ questions: filtered }));
      } catch (e) {
        console.error('Failed to save to sessionStorage:', e);
      }

      // Redirect to review page
      const pathname = window.location.pathname;
      const isInstructor = pathname.includes('/instructor');
      const reviewPath = isInstructor 
        ? `/instructor/assignments/${assignmentId}/review-generated`
        : `/dashboard/assignments/${assignmentId}/review-generated`;
      
      router.push(reviewPath);
      onImported();
      onClose();
    } catch (err) {
      console.error('Import error:', err);
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi import file');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setError(null);
    onClose();
  };

  const isLoading = loading || creatingAssignment || generating || uploadingFile;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Import Bài tập từ Word
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* File Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chọn file Word (.docx)
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors">
              <div className="space-y-1 text-center">
                <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                  >
                    <span>Chọn file</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      accept=".docx"
                      onChange={handleFileChange}
                      className="sr-only"
                    />
                  </label>
                  <p className="pl-1">hoặc kéo thả vào đây</p>
                </div>
                <p className="text-xs text-gray-500">
                  Chỉ hỗ trợ file .docx
                </p>
              </div>
            </div>
            
            {selectedFile && (
              <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
                <div className="flex items-center">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-green-800">
                      ✓ Đã chọn: {selectedFile.name}
                    </p>
                    <p className="text-xs text-green-600">
                      Kích thước: {(selectedFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Format Guide */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Hướng dẫn format:</h4>
            <div className="text-xs text-gray-600 space-y-1 bg-gray-50 p-3 rounded-md">
              <p>• <strong>Câu hỏi:</strong> <code className="bg-white px-1 rounded">Câu 1: Nội dung câu hỏi?</code></p>
              <p>• <strong>Đáp án:</strong> <code className="bg-white px-1 rounded">A. Đáp án A</code></p>
              <p>• <strong>LaTeX:</strong> <code className="bg-white px-1 rounded">$E = mc^2$</code></p>
              <p>• <strong>Đáp án đúng:</strong> <code className="bg-white px-1 rounded">Đáp án: A</code></p>
              <p>• <strong>Giải thích:</strong> <code className="bg-white px-1 rounded">Giải thích: Nội dung giải thích</code></p>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-4 border rounded-lg bg-red-50 border-red-200">
              <div className="flex items-center">
                  <XCircleIcon className="h-5 w-5 text-red-500 mr-2" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-800">Lỗi</p>
                  <p className="text-xs text-red-600">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Hủy
            </button>
              <button
                onClick={handleImport}
              disabled={!selectedFile || !initialLessonId || isLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
              {isLoading ? 'Đang xử lý...' : 'Import bài tập'}
              </button>
          </div>
        </div>
      </div>
    </div>
  );
}