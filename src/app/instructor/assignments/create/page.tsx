'use client';

import { useState } from 'react';
import { 
  ArrowLeftIcon,
  PlusIcon,
  TrashIcon,
  DocumentArrowUpIcon,
  DocumentTextIcon,
  QuestionMarkCircleIcon,
  ClockIcon,
  AcademicCapIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

interface Question {
  id: string;
  content: string;
  type: 'single' | 'multiple';
  options: {
    id: string;
    content: string;
    isCorrect: boolean;
  }[];
  points: number;
  explanation: string;
  difficultyLevel: 'easy' | 'medium' | 'hard';
}

interface AssignmentFormData {
  title: string;
  description: string;
  courseId: string;
  lessonId: string;
  type: 'quiz' | 'homework' | 'exam';
  timeLimit: number;
  maxAttempts: number;
  dueDate: string;
  showAnswersAfter: 'immediately' | 'after_due' | 'never';
  isPublished: boolean;
}

const mockCourses = [
  { id: '1', title: 'Toán học lớp 12' },
  { id: '2', title: 'Vật lý lớp 12' },
  { id: '3', title: 'Hóa học lớp 12' }
];

const mockLessons = [
  { id: '1', title: 'Chương 1: Hàm số', courseId: '1' },
  { id: '2', title: 'Chương 2: Đạo hàm', courseId: '1' },
  { id: '3', title: 'Chương 1: Động học', courseId: '2' },
  { id: '4', title: 'Chương 2: Động lực học', courseId: '2' }
];

export default function CreateAssignmentPage() {
  const [formData, setFormData] = useState<AssignmentFormData>({
    title: '',
    description: '',
    courseId: '',
    lessonId: '',
    type: 'quiz',
    timeLimit: 60,
    maxAttempts: 1,
    dueDate: '',
    showAnswersAfter: 'after_due',
    isPublished: false
  });

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentStep, setCurrentStep] = useState<'basic' | 'questions' | 'settings'>('basic');
  const [importMethod, setImportMethod] = useState<'manual' | 'file'>('manual');

  const filteredLessons = mockLessons.filter(lesson => lesson.courseId === formData.courseId);

  const addQuestion = () => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      content: '',
      type: 'single',
      options: [
        { id: '1', content: '', isCorrect: false },
        { id: '2', content: '', isCorrect: false },
        { id: '3', content: '', isCorrect: false },
        { id: '4', content: '', isCorrect: false }
      ],
      points: 1,
      explanation: '',
      difficultyLevel: 'medium'
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (questionId: string, updates: Partial<Question>) => {
    setQuestions(questions.map(q => 
      q.id === questionId ? { ...q, ...updates } : q
    ));
  };

  const deleteQuestion = (questionId: string) => {
    setQuestions(questions.filter(q => q.id !== questionId));
  };

  const updateOption = (questionId: string, optionId: string, content: string) => {
    setQuestions(questions.map(q => 
      q.id === questionId 
        ? {
            ...q,
            options: q.options.map(opt => 
              opt.id === optionId ? { ...opt, content } : opt
            )
          }
        : q
    ));
  };

  const toggleCorrectOption = (questionId: string, optionId: string) => {
    setQuestions(questions.map(q => 
      q.id === questionId 
        ? {
            ...q,
            options: q.type === 'single'
              ? q.options.map(opt => ({ ...opt, isCorrect: opt.id === optionId }))
              : q.options.map(opt => 
                  opt.id === optionId ? { ...opt, isCorrect: !opt.isCorrect } : opt
                )
          }
        : q
    ));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Simulate file processing
      alert('Tính năng import từ file Word sẽ được triển khai trong phiên bản tiếp theo');
    }
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.courseId || questions.length === 0) {
      alert('Vui lòng điền đầy đủ thông tin và thêm ít nhất 1 câu hỏi');
      return;
    }
    
    // Simulate API call
    alert('Bài tập đã được tạo thành công!');
    // Redirect to assignments list
  };

  const renderBasicInfo = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tên bài tập *
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Nhập tên bài tập..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Mô tả
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Mô tả về bài tập này..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Khóa học *
          </label>
          <select
            value={formData.courseId}
            onChange={(e) => setFormData({ ...formData, courseId: e.target.value, lessonId: '' })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Chọn khóa học</option>
            {mockCourses.map(course => (
              <option key={course.id} value={course.id}>{course.title}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bài học
          </label>
          <select
            value={formData.lessonId}
            onChange={(e) => setFormData({ ...formData, lessonId: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={!formData.courseId}
          >
            <option value="">Chọn bài học</option>
            {filteredLessons.map(lesson => (
              <option key={lesson.id} value={lesson.id}>{lesson.title}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Loại bài tập
        </label>
        <div className="grid grid-cols-3 gap-4">
          {[
            { value: 'quiz', label: 'Quiz', icon: QuestionMarkCircleIcon, desc: 'Câu hỏi ngắn, nhanh' },
            { value: 'homework', label: 'Bài tập', icon: AcademicCapIcon, desc: 'Bài tập về nhà' },
            { value: 'exam', label: 'Kiểm tra', icon: ClockIcon, desc: 'Bài kiểm tra chính thức' }
          ].map((type) => (
            <div
              key={type.value}
              className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                formData.type === type.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setFormData({ ...formData, type: type.value as 'quiz' | 'homework' | 'exam' })}
            >
              <type.icon className="h-8 w-8 text-blue-600 mb-2" />
              <h3 className="font-medium text-gray-900">{type.label}</h3>
              <p className="text-sm text-gray-500">{type.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderQuestions = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">
          Câu hỏi ({questions.length})
        </h3>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <input
              type="radio"
              id="manual"
              name="importMethod"
              checked={importMethod === 'manual'}
              onChange={() => setImportMethod('manual')}
              className="text-blue-600"
            />
            <label htmlFor="manual" className="text-sm text-gray-700">Tạo thủ công</label>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="radio"
              id="file"
              name="importMethod"
              checked={importMethod === 'file'}
              onChange={() => setImportMethod('file')}
              className="text-blue-600"
            />
            <label htmlFor="file" className="text-sm text-gray-700">Import từ Word</label>
          </div>
        </div>
      </div>

      {importMethod === 'file' && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-4">
            <label htmlFor="file-upload" className="cursor-pointer">
              <span className="mt-2 block text-sm font-medium text-gray-900">
                Tải lên file Word
              </span>
              <span className="mt-1 block text-xs text-gray-500">
                Hỗ trợ định dạng .docx (tối đa 10MB)
              </span>
            </label>
            <input
              id="file-upload"
              name="file-upload"
              type="file"
              accept=".docx,.doc"
              className="sr-only"
              onChange={handleFileUpload}
            />
          </div>
          <div className="mt-4">
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <DocumentArrowUpIcon className="h-5 w-5 mr-2 text-gray-400" />
              Chọn file
            </button>
          </div>
          <p className="mt-2 text-xs text-blue-600">
            <Link href="/instructor/assignments/template" className="hover:underline">
              Tải xuống mẫu file Word
            </Link>
          </p>
        </div>
      )}

      {importMethod === 'manual' && (
        <div className="space-y-6">
          <button
            type="button"
            onClick={addQuestion}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Thêm câu hỏi
          </button>

          {questions.map((question, index) => (
            <div key={question.id} className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <h4 className="text-lg font-medium text-gray-900">
                  Câu {index + 1}
                </h4>
                <button
                  onClick={() => deleteQuestion(question.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nội dung câu hỏi *
                  </label>
                  <textarea
                    value={question.content}
                    onChange={(e) => updateQuestion(question.id, { content: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Nhập nội dung câu hỏi..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Loại câu hỏi
                    </label>
                    <select
                      value={question.type}
                      onChange={(e) => updateQuestion(question.id, { type: e.target.value as 'single' | 'multiple' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="single">Chọn 1 đáp án</option>
                      <option value="multiple">Chọn nhiều đáp án</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Độ khó
                    </label>
                    <select
                      value={question.difficultyLevel}
                      onChange={(e) => updateQuestion(question.id, { difficultyLevel: e.target.value as 'easy' | 'medium' | 'hard' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="easy">Dễ</option>
                      <option value="medium">Trung bình</option>
                      <option value="hard">Khó</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Điểm
                    </label>
                    <input
                      type="number"
                      min="0.5"
                      step="0.5"
                      value={question.points}
                      onChange={(e) => updateQuestion(question.id, { points: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Các lựa chọn
                  </label>
                  <div className="space-y-2">
                    {question.options.map((option, optionIndex) => (
                      <div key={option.id} className="flex items-center space-x-3">
                        <input
                          type={question.type === 'single' ? 'radio' : 'checkbox'}
                          name={`question-${question.id}`}
                          checked={option.isCorrect}
                          onChange={() => toggleCorrectOption(question.id, option.id)}
                          className="text-blue-600"
                        />
                        <span className="text-sm font-medium text-gray-700 w-6">
                          {String.fromCharCode(65 + optionIndex)}.
                        </span>
                        <input
                          type="text"
                          value={option.content}
                          onChange={(e) => updateOption(question.id, option.id, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder={`Lựa chọn ${String.fromCharCode(65 + optionIndex)}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giải thích (tùy chọn)
                  </label>
                  <textarea
                    value={question.explanation}
                    onChange={(e) => updateQuestion(question.id, { explanation: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Giải thích đáp án đúng..."
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Thời gian làm bài (phút)
          </label>
          <input
            type="number"
            min="1"
            value={formData.timeLimit}
            onChange={(e) => setFormData({ ...formData, timeLimit: parseInt(e.target.value) })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Số lần làm tối đa
          </label>
          <input
            type="number"
            min="1"
            max="10"
            value={formData.maxAttempts}
            onChange={(e) => setFormData({ ...formData, maxAttempts: parseInt(e.target.value) })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Hạn nộp bài
        </label>
        <input
          type="datetime-local"
          value={formData.dueDate}
          onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Hiển thị đáp án
        </label>
        <select
          value={formData.showAnswersAfter}
          onChange={(e) => setFormData({ ...formData, showAnswersAfter: e.target.value as 'immediately' | 'after_due' | 'never' })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="immediately">Ngay sau khi nộp bài</option>
          <option value="after_due">Sau khi hết hạn nộp</option>
          <option value="never">Không hiển thị</option>
        </select>
      </div>

      <div className="flex items-center">
        <input
          id="is-published"
          type="checkbox"
          checked={formData.isPublished}
          onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="is-published" className="ml-2 block text-sm text-gray-900">
          Xuất bản ngay sau khi tạo
        </label>
      </div>
    </div>
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <Link
            href="/instructor/assignments"
            className="mr-4 p-2 text-gray-400 hover:text-gray-600"
          >
            <ArrowLeftIcon className="h-6 w-6" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tạo bài tập mới</h1>
            <p className="text-gray-600 mt-1">Tạo bài tập cho học sinh của bạn</p>
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="mb-8">
        <nav aria-label="Progress">
          <ol className="flex items-center">
            {[
              { key: 'basic', name: 'Thông tin cơ bản', icon: DocumentTextIcon },
              { key: 'questions', name: 'Câu hỏi', icon: QuestionMarkCircleIcon },
              { key: 'settings', name: 'Cài đặt', icon: ClockIcon }
            ].map((step, stepIdx) => (
              <li key={step.key} className={`${stepIdx !== 2 ? 'pr-8 sm:pr-20' : ''} relative`}>
                <div className="flex items-center">
                  <button
                    onClick={() => setCurrentStep(step.key as 'basic' | 'questions' | 'settings')}
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                      currentStep === step.key
                        ? 'border-blue-600 bg-blue-600'
                        : 'border-gray-300 bg-white hover:border-gray-400'
                    }`}
                  >
                    <step.icon className={`h-5 w-5 ${
                      currentStep === step.key ? 'text-white' : 'text-gray-500'
                    }`} />
                  </button>
                  <span className={`ml-4 text-sm font-medium ${
                    currentStep === step.key ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    {step.name}
                  </span>
                </div>
                {stepIdx !== 2 && (
                  <div className="absolute top-5 right-0 hidden h-0.5 w-full bg-gray-200 sm:block" />
                )}
              </li>
            ))}
          </ol>
        </nav>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {currentStep === 'basic' && renderBasicInfo()}
        {currentStep === 'questions' && renderQuestions()}
        {currentStep === 'settings' && renderSettings()}

        {/* Navigation */}
        <div className="flex items-center justify-between pt-6 mt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => {
              if (currentStep === 'questions') setCurrentStep('basic');
              if (currentStep === 'settings') setCurrentStep('questions');
            }}
            className={`px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 ${
              currentStep === 'basic' ? 'invisible' : ''
            }`}
          >
            Quay lại
          </button>

          <div className="flex space-x-3">
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Lưu nháp
            </button>
            
            {currentStep === 'settings' ? (
              <button
                type="button"
                onClick={handleSubmit}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
              >
                Tạo bài tập
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  if (currentStep === 'basic') setCurrentStep('questions');
                  if (currentStep === 'questions') setCurrentStep('settings');
                }}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
              >
                Tiếp theo
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
