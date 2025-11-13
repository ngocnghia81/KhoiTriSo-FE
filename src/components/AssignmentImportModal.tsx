'use client';

import React, { useState } from 'react';
import { useCourseLessons } from '@/hooks/useLessons';
import { useImportAssignment } from '@/hooks/useLessons';
import { XMarkIcon, DocumentArrowUpIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

interface AssignmentImportModalProps {
  initialLessonId: number;
  onClose: () => void;
  onImported: () => void;
}

export function AssignmentImportModal({ initialLessonId, onClose, onImported }: AssignmentImportModalProps) {
  const { importAssignment, loading } = useImportAssignment();
  const [selectedLessonId, setSelectedLessonId] = useState<number>(initialLessonId);
  const [courseId, setCourseId] = useState<number>();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<{
    success: boolean;
    message: string;
    data?: any;
  } | null>(null);

  const { lessons, loading: lessonsLoading, error: lessonsError } = useCourseLessons(courseId || 0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        alert('Vui lòng chọn file Word (.docx)');
        return;
      }
      setSelectedFile(file);
      setImportResult(null);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      alert('Vui lòng chọn file Word');
      return;
    }
    if (!selectedLessonId) {
      alert('Vui lòng chọn bài học');
      return;
    }

    try {
      const result = await importAssignment(selectedLessonId, selectedFile);
      
      if (result.success) {
        setImportResult({
          success: true,
          message: 'Import thành công',
          data: result.data
        });
        onImported();
      } else {
        setImportResult({
          success: false,
          message: result.error || 'Import thất bại'
        });
      }
    } catch (error) {
      console.error('Import error:', error);
      setImportResult({
        success: false,
        message: 'Có lỗi xảy ra khi import file'
      });
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setImportResult(null);
    onClose();
  };

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
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Bước 1: Chọn khóa học và bài học</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chọn khóa học *
                </label>
                <input
                  type="number"
                  placeholder="Nhập ID khóa học"
                  value={courseId ?? ''}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    setCourseId(Number.isNaN(value) ? undefined : value);
                    setSelectedLessonId(0);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chọn bài học *
                </label>
                {courseId ? (
                  lessonsLoading ? (
                    <p className="text-sm text-gray-500">Đang tải danh sách bài học…</p>
                  ) : lessonsError ? (
                    <p className="text-sm text-red-600">{lessonsError}</p>
                  ) : lessons.length > 0 ? (
                    <select
                      value={selectedLessonId || ''}
                      onChange={(e) => setSelectedLessonId(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Chọn bài học...</option>
                      {lessons.map((lesson) => (
                        <option key={lesson.id} value={lesson.id}>
                          {lesson.title}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-sm text-gray-500">Không tìm thấy bài học nào.</p>
                  )
                ) : (
                  <p className="text-sm text-gray-500">Vui lòng nhập ID khóa học trước.</p>
                )}
              </div>
            </div>
          </div>

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

          {/* Import Result */}
          {importResult && (
            <div className={`p-4 border rounded-lg ${
              importResult.success 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center">
                {importResult.success ? (
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                ) : (
                  <XCircleIcon className="h-5 w-5 text-red-500 mr-2" />
                )}
                <div className="flex-1">
                  <p className={`text-sm font-medium ${
                    importResult.success ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {importResult.success ? 'Import thành công!' : 'Import thất bại'}
                  </p>
                  <p className={`text-xs ${
                    importResult.success ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {importResult.message}
                  </p>
                  {importResult.success && importResult.data && (
                    <div className="mt-2 text-xs text-green-600">
                      <p>Assignment ID: {importResult.data.assignmentId}</p>
                      <p>Số câu hỏi: {importResult.data.questionCount}</p>
                      {importResult.data.warnings && importResult.data.warnings.length > 0 && (
                        <div className="mt-1">
                          <p className="font-medium">Cảnh báo:</p>
                          <ul className="list-disc list-inside">
                            {importResult.data.warnings.map((warning: string, index: number) => (
                              <li key={index}>{warning}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {importResult?.success ? 'Đóng' : 'Hủy'}
            </button>
            {!importResult?.success && (
              <button
                onClick={handleImport}
                disabled={!selectedFile || loading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Đang import...' : 'Import bài tập'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}