'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import {
  BookOpenIcon,
  KeyIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  DocumentTextIcon,
  VideoCameraIcon,
  ArrowRightIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/24/outline';

interface ActivationForm {
  activationCode: string;
  questionId?: string;
}

interface ActivatedBook {
  title: string;
  expiryDate: Date;
  accessUrl: string;
}

const features = [
  {
    name: 'Video giải bài tập',
    description: 'Video giải chi tiết từng câu hỏi trong sách với giọng giảng dễ hiểu',
    icon: VideoCameraIcon,
  },
  {
    name: 'Lời giải chi tiết',
    description: 'Lời giải bằng text và hình ảnh cho từng bài tập',
    icon: DocumentTextIcon,
  },
  {
    name: 'Tra cứu nhanh',
    description: 'Tra cứu nhanh bài tập theo mã ID được gán cho từng câu hỏi',
    icon: MagnifyingGlassIcon,
  },
  {
    name: 'Truy cập 2 năm',
    description: 'Thời gian truy cập dài hạn để bạn ôn tập khi cần thiết',
    icon: ClockIcon,
  },
];

const guideSteps = [
  {
    step: 1,
    title: 'Tìm mã kích hoạt',
    description: 'Mã kích hoạt được in trong sách hoặc gửi qua email khi bạn mua sách online'
  },
  {
    step: 2,
    title: 'Nhập mã kích hoạt',
    description: 'Nhập chính xác mã kích hoạt vào ô bên trên và nhấn "Kích hoạt ngay"'
  },
  {
    step: 3,
    title: 'Truy cập nội dung',
    description: 'Sau khi kích hoạt, bạn có thể truy cập video giải bài tập trong 2 năm'
  }
];

const faqData = [
  {
    question: 'Tôi không tìm thấy mã kích hoạt ở đâu?',
    answer: 'Mã kích hoạt thường được in ở trang đầu hoặc trang cuối của sách. Nếu mua online, mã sẽ được gửi qua email.'
  },
  {
    question: 'Mã kích hoạt có thể sử dụng bao nhiều lần?',
    answer: 'Mỗi mã kích hoạt chỉ có thể sử dụng 1 lần duy nhất và gắn với 1 tài khoản.'
  },
  {
    question: 'Sau 2 năm tôi có thể gia hạn không?',
    answer: 'Hiện tại hệ thống chưa hỗ trợ gia hạn. Bạn cần mua sách mới để có mã kích hoạt mới.'
  }
];

export default function BookActivationPage() {
  const [formData, setFormData] = useState<ActivationForm>({
    activationCode: '',
    questionId: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isActivated, setIsActivated] = useState(false);
  const [activatedBook, setActivatedBook] = useState<ActivatedBook | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: keyof ActivationForm, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: field === 'activationCode' ? value.toUpperCase() : value
    }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.activationCode.trim()) {
      setError('Vui lòng nhập mã kích hoạt');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock successful activation
      // Create expiry date (only runs on client after user action, so no hydration issue)
      const expiryDate = new Date();
      expiryDate.setFullYear(expiryDate.getFullYear() + 2);
      
      const mockBook: ActivatedBook = {
        title: 'Sách Toán học lớp 12 - Nâng cao',
        expiryDate,
        accessUrl: formData.questionId 
          ? `/books/content?code=${formData.activationCode}&question=${formData.questionId}`
          : `/books/content?code=${formData.activationCode}`
      };

      setActivatedBook(mockBook);
      setIsActivated(true);
    } catch (err) {
      setError('Có lỗi xảy ra khi kích hoạt. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isActivated && activatedBook) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Breadcrumb */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <nav className="flex" aria-label="Breadcrumb">
              <ol className="inline-flex items-center space-x-1 md:space-x-3">
                <li className="inline-flex items-center">
                  <Link href="/" className="text-gray-700 hover:text-blue-600">
                    Trang chủ
                  </Link>
                </li>
                <li>
                  <div className="flex items-center">
                    <span className="mx-2 text-gray-400">/</span>
                    <span className="text-gray-500">Kích hoạt sách</span>
                  </div>
                </li>
              </ol>
            </nav>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
            {/* Success Icon */}
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircleIcon className="h-12 w-12 text-green-600" />
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Kích hoạt thành công!
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Bạn đã kích hoạt thành công sách điện tử. Thời gian sử dụng: <strong>2 năm</strong>
            </p>

            {/* Book Info */}
            <div className="bg-gray-50 rounded-2xl p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {activatedBook.title}
              </h2>
              <p className="text-gray-600">
                Hạn sử dụng: <span className="font-semibold">
                  {activatedBook.expiryDate.toLocaleDateString('vi-VN')}
                </span>
              </p>
            </div>

            {/* Action Button */}
            <Link
              href={activatedBook.accessUrl}
              className="inline-flex items-center px-8 py-4 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors shadow-lg"
            >
              Truy cập sách ngay
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <Link href="/" className="text-gray-700 hover:text-blue-600">
                  Trang chủ
                </Link>
              </li>
              <li>
                <div className="flex items-center">
                  <span className="mx-2 text-gray-400">/</span>
                  <span className="text-gray-500">Kích hoạt sách</span>
                </div>
              </li>
            </ol>
          </nav>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Main Activation Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpenIcon className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Kích hoạt sách điện tử
            </h1>
            <p className="text-lg text-gray-600">
              Nhập mã kích hoạt để truy cập video giải bài tập và nội dung số trong 2 năm
            </p>
          </div>

          {/* Activation Form */}
          <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <div className="space-y-6">
              <div>
                <label htmlFor="activationCode" className="block text-sm font-semibold text-gray-900 mb-2">
                  Mã kích hoạt
                </label>
                <input
                  type="text"
                  id="activationCode"
                  value={formData.activationCode}
                  onChange={(e) => handleInputChange('activationCode', e.target.value)}
                  placeholder="Nhập mã kích hoạt (VD: KTS2024001234)"
                  maxLength={20}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                  required
                />
                <p className="mt-2 text-sm text-gray-600">
                  Mã kích hoạt được in trong sách hoặc gửi qua email khi mua online
                </p>
              </div>

              <div>
                <label htmlFor="questionId" className="block text-sm font-semibold text-gray-900 mb-2">
                  Mã câu hỏi (tùy chọn)
                </label>
                <input
                  type="text"
                  id="questionId"
                  value={formData.questionId}
                  onChange={(e) => handleInputChange('questionId', e.target.value)}
                  placeholder="Nhập mã câu hỏi (VD: [0001])"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="mt-2 text-sm text-gray-600">
                  Để truy cập trực tiếp vào câu hỏi cụ thể
                </p>
              </div>

              {error && (
                <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
                  <ExclamationTriangleIcon className="h-5 w-5" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center px-6 py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Đang kích hoạt...
                  </>
                ) : (
                  <>
                    <KeyIcon className="h-5 w-5 mr-2" />
                    Kích hoạt ngay
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* How to Use Guide */}
        <div className="bg-white rounded-3xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Hướng dẫn sử dụng
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {guideSteps.map((step) => (
              <div key={step.step} className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-lg">{step.step}</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="bg-white rounded-3xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Bạn sẽ được truy cập
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature) => (
              <div key={feature.name} className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <feature.icon className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {feature.name}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-white rounded-3xl shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Câu hỏi thường gặp
          </h2>
          <div className="space-y-6 max-w-2xl mx-auto">
            {faqData.map((faq, index) => (
              <details key={index} className="group">
                <summary className="flex justify-between items-center cursor-pointer bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {faq.question}
                  </h3>
                  <div className="ml-6 flex-shrink-0">
                    <QuestionMarkCircleIcon className="h-5 w-5 text-gray-400 group-open:rotate-180 transition-transform" />
                  </div>
                </summary>
                <div className="mt-4 px-4 pb-4">
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </div>

      {/* Background decorative elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-32 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-32 w-96 h-96 bg-gradient-to-tr from-purple-400/10 to-pink-400/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-blue-200/20 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-24 h-24 bg-purple-200/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
      </div>
    </div>
  );
}