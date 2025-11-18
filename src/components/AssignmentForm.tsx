'use client';

import React, { useState } from 'react';
import { RichTextEditor } from '@/components/RichTextEditor';
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { API_URLS } from '@/lib/api-config';

interface Assignment {
  id: number;
  lessonId: number;
  title: string;
  description?: string;
  maxScore: number;
  timeLimit?: number;
  maxAttempts?: number;
  showAnswersAfter?: number;
  dueDate?: string;
  isPublished: boolean;
  passingScore?: number;
  shuffleQuestions?: boolean;
  shuffleOptions?: boolean;
}

interface AssignmentFormProps {
  lessonId: number;
  assignment?: Assignment | null;
  onClose: () => void;
  onSaved: () => void;
}

export function AssignmentForm({ lessonId, assignment, onClose, onSaved }: AssignmentFormProps) {
  const { authenticatedFetch } = useAuthenticatedApi();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: assignment?.title || '',
    description: assignment?.description || '',
    timeLimit: assignment?.timeLimit || 60,
    maxAttempts: assignment?.maxAttempts || 1,
    showAnswersAfter: assignment?.showAnswersAfter !== undefined ? assignment.showAnswersAfter : 1, // 0 = Immediately (Sau khi nộp bài)
    dueDate: assignment?.dueDate ? assignment.dueDate.split('T')[0] : '',
    isPublished: assignment?.isPublished || false,
    passingScore: assignment?.passingScore || 50,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const isEdit = assignment && typeof assignment.id === 'number' && !Number.isNaN(assignment.id);
      const url = isEdit
        ? `${API_URLS.ASSIGNMENTS_BY_ID_BASE}/${assignment!.id}`
        : API_URLS.ASSIGNMENTS_BASE;
      
      const method = isEdit ? 'PUT' : 'POST';
      
      // Format payload với PascalCase như backend yêu cầu
      // ShowAnswersAfter enum: 0 = Immediately, 1 = AfterDue, 2 = Never
      const payload = {
        LessonId: lessonId || 0,
        Title: formData.title || '',
        Description: formData.description || '',
        MaxScore: 10, // Mặc định 10 điểm
        TimeLimit: formData.timeLimit || null,
        MaxAttempts: formData.maxAttempts || 1,
        ShowAnswersAfter: formData.showAnswersAfter, // 0 = Sau khi nộp bài, 1 = Sau khi chấm, 2 = Không bao giờ
        DueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
        IsPublished: formData.isPublished !== undefined ? formData.isPublished : false,
        PassingScore: formData.passingScore !== null && formData.passingScore !== undefined ? formData.passingScore : null,
        ShuffleQuestions: false, // BE chưa hỗ trợ
        ShuffleOptions: false, // BE chưa hỗ trợ
      };

      // Debug: Log payload để verify format
      console.log('Assignment Payload:', JSON.stringify(payload, null, 2));

      const response = await authenticatedFetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        onSaved();
      } else {
        const errorData = await response.json();
        setError(errorData.Message || 'Có lỗi xảy ra');
      }
    } catch {
      setError('Có lỗi xảy ra khi lưu bài tập');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' 
        ? (e.target as HTMLInputElement).checked
        : type === 'number' 
        ? Number(value)
        : value
    }));
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {assignment ? 'Chỉnh sửa Bài tập' : 'Tạo Bài tập mới'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tiêu đề bài tập *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Nhập tiêu đề bài tập"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mô tả
            </label>
            <RichTextEditor
              value={formData.description}
              onChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  description: value,
                }))
              }
              placeholder="Mô tả chi tiết về bài tập"
            />
          </div>

          {/* Time Limit */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Thời gian (phút)
            </label>
            <input
              type="number"
              name="timeLimit"
              value={formData.timeLimit}
              onChange={handleChange}
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="mt-1 text-xs text-gray-500">Điểm tối đa: 10 (mặc định)</p>
          </div>

          {/* Attempts and Passing Score */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số lần làm bài
              </label>
              <input
                type="number"
                name="maxAttempts"
                value={formData.maxAttempts}
                onChange={handleChange}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Điểm đạt (0-100)
              </label>
              <input
                type="number"
                name="passingScore"
                value={formData.passingScore}
                onChange={handleChange}
                min="0"
                max="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hạn nộp bài
            </label>
            <input
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Show Answers After */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hiển thị đáp án
            </label>
            <select
              name="showAnswersAfter"
              value={formData.showAnswersAfter}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={0}>Sau khi nộp bài</option>
              <option value={1}>Sau khi chấm</option>
              <option value={2}>Không bao giờ</option>
            </select>
          </div>

          {/* Options */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Tùy chọn
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="isPublished"
                  checked={formData.isPublished}
                  onChange={handleChange}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Xuất bản ngay</span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Đang lưu...' : (assignment ? 'Cập nhật' : 'Tạo bài tập')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}