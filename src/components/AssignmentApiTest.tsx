import React, { useState } from 'react';
import { useImportAssignment, AssignmentImportResult } from '@/hooks/useLessons';
import { API_URLS } from '@/lib/api-config';

export function AssignmentApiTest() {
  const [selectedLessonId, setSelectedLessonId] = useState<number>(1);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<AssignmentImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const { importAssignment, loading } = useImportAssignment();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setSelectedFile(file || null);
    setError(null);
    setImportResult(null);
  };

  const handleImport = async () => {
    if (!selectedFile || !selectedLessonId) {
      setError('Vui lòng chọn bài học và file Word');
      return;
    }

    const result = await importAssignment(selectedLessonId, selectedFile);
    
    if (result.success) {
      setImportResult(result.data!);
      setError(null);
    } else {
      setError(result.error || 'Import thất bại');
      setImportResult(null);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Assignment API Test</h2>
      
      {/* Lesson Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Lesson ID
        </label>
        <input
          type="number"
          value={selectedLessonId}
          onChange={(e) => setSelectedLessonId(parseInt(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Nhập Lesson ID"
        />
      </div>

      {/* File Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Chọn file Word (.docx)
        </label>
        <input
          type="file"
          accept=".docx"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        {selectedFile && (
          <p className="text-sm text-green-600 mt-2">
            ✓ Đã chọn: {selectedFile.name}
          </p>
        )}
      </div>

      {/* Import Button */}
      <div className="mb-6">
        <button
          onClick={handleImport}
          disabled={!selectedFile || !selectedLessonId || loading}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Đang import...' : 'Import Assignment'}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-red-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Success Display */}
      {importResult && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-center mb-2">
            <svg className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p className="text-sm font-medium text-green-800">Import thành công!</p>
          </div>
          
          <div className="text-sm text-green-700">
            <p><strong>Assignment ID:</strong> {importResult.assignmentId}</p>
            <p><strong>Title:</strong> {importResult.assignmentTitle}</p>
            <p><strong>Số câu hỏi:</strong> {importResult.questionCount}</p>
            
            {importResult.warnings.length > 0 && (
              <div className="mt-2">
                <p className="font-medium">Cảnh báo:</p>
                <ul className="list-disc list-inside">
                  {importResult.warnings.map((warning, index) => (
                    <li key={index}>{warning}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {importResult.errors.length > 0 && (
              <div className="mt-2">
                <p className="font-medium">Lỗi:</p>
                <ul className="list-disc list-inside">
                  {importResult.errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* API Endpoints Info */}
      <div className="mt-6 p-4 bg-gray-50 rounded-md">
        <h3 className="text-sm font-medium text-gray-800 mb-2">API Endpoints:</h3>
        <div className="text-xs text-gray-600 space-y-1">
          <p><code>POST {API_URLS.ASSIGNMENTS_IMPORT_WORD}</code> - Import assignment từ Word</p>
          <p><code>GET {API_URLS.ASSIGNMENTS_BASE}</code> - Danh sách assignments</p>
          <p><code>GET {API_URLS.ASSIGNMENTS_TEMPLATES}</code> - Mẫu assignments</p>
          <p><code>POST {API_URLS.ASSIGNMENTS_VALIDATE_WORD}</code> - Validate file Word</p>
        </div>
      </div>
    </div>
  );
}
