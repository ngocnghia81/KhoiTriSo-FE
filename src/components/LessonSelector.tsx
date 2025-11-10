import React, { useState, useEffect } from 'react';
import { useCourseLessons } from '@/hooks/useLessons';

export interface LessonSelectorProps {
  courseId: number;
  selectedLessonId?: number;
  onLessonSelect: (lessonId: number) => void;
  disabled?: boolean;
}

export function LessonSelector({ 
  courseId, 
  selectedLessonId, 
  onLessonSelect, 
  disabled = false 
}: LessonSelectorProps) {
  const { lessons, loading, error } = useCourseLessons(courseId);
  const [isOpen, setIsOpen] = useState(false);

  console.log('LessonSelector - courseId:', courseId, 'lessons:', lessons, 'loading:', loading, 'error:', error);
  console.log('LessonSelector - lessons length:', lessons.length);
  console.log('LessonSelector - lessons details:', lessons.map(l => ({ id: l.id, title: l.title })));
  console.log('LessonSelector - will render:', lessons.length > 0 ? 'dropdown' : 'no lessons message');

  const selectedLesson = lessons.find(lesson => lesson.id === selectedLessonId);

  const handleLessonClick = (lessonId: number) => {
    onLessonSelect(lessonId);
    setIsOpen(false);
  };

  if (loading) {
    return (
      <div className="w-full">
        <div className="animate-pulse bg-gray-200 h-10 rounded-md"></div>
        <p className="text-sm text-gray-500 mt-1">Đang tải danh sách bài học...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full">
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-sm text-red-600">Lỗi: {error}</p>
        </div>
      </div>
    );
  }

  if (lessons.length === 0) {
    return (
      <div className="w-full">
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
          <p className="text-sm text-yellow-600">Không có bài học nào trong khóa học này</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Chọn bài học
      </label>
      
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          disabled={disabled}
          className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          <span className="block truncate">
            {selectedLesson ? selectedLesson.title : 'Chọn bài học...'}
          </span>
          <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <svg
              className={`h-5 w-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </span>
        </button>

        {isOpen && (
          <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none">
            {lessons.map((lesson) => (
              <button
                key={lesson.id}
                type="button"
                onClick={() => handleLessonClick(lesson.id)}
                className={`w-full text-left px-3 py-2 hover:bg-blue-50 ${
                  selectedLessonId === lesson.id ? 'bg-blue-100 text-blue-900' : 'text-gray-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="truncate">{lesson.title}</span>
                  {lesson.orderIndex && (
                    <span className="text-xs text-gray-500 ml-2">
                      Bài {lesson.orderIndex}
                    </span>
                  )}
                </div>
                {lesson.description && (
                  <p className="text-xs text-gray-500 mt-1 truncate">
                    {lesson.description}
                  </p>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedLesson && (
        <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-800">
            <strong>Đã chọn:</strong> {selectedLesson.title}
          </p>
          {selectedLesson.description && (
            <p className="text-xs text-blue-600 mt-1">
              {selectedLesson.description}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
