'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import {
  QuestionMarkCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  MagnifyingGlassIcon,
  ChatBubbleLeftRightIcon,
  PhoneIcon,
  EnvelopeIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

interface FAQItem {
  id: number;
  category: string;
  question: string;
  answer: string;
  isPopular?: boolean;
}

const faqCategories = [
  { id: 'all', name: 'Tất cả', count: 24 },
  { id: 'general', name: 'Câu hỏi chung', count: 8 },
  { id: 'courses', name: 'Khóa học', count: 6 },
  { id: 'payment', name: 'Thanh toán', count: 4 },
  { id: 'books', name: 'Sách điện tử', count: 3 },
  { id: 'technical', name: 'Kỹ thuật', count: 3 }
];

const faqData: FAQItem[] = [
  {
    id: 1,
    category: 'general',
    question: 'Khởi Trí Số là gì?',
    answer: 'Khởi Trí Số là nền tảng giáo dục trực tuyến hàng đầu Việt Nam, cung cấp các khóa học chất lượng cao và sách điện tử tương tác. Chúng tôi cam kết mang đến trải nghiệm học tập hiệu quả và tiện lợi cho mọi học viên.',
    isPopular: true
  },
  {
    id: 2,
    category: 'general',
    question: 'Làm thế nào để đăng ký tài khoản?',
    answer: 'Bạn có thể đăng ký tài khoản miễn phí bằng cách nhấp vào nút "Đăng ký" trên trang chủ. Chỉ cần cung cấp email và tạo mật khẩu, bạn sẽ có thể truy cập ngay vào các khóa học miễn phí và tính năng cơ bản của nền tảng.',
    isPopular: true
  },
  {
    id: 3,
    category: 'courses',
    question: 'Các khóa học có miễn phí không?',
    answer: 'Chúng tôi cung cấp cả khóa học miễn phí và trả phí. Các khóa học miễn phí bao gồm nội dung cơ bản và video giới thiệu. Khóa học trả phí sẽ có nội dung đầy đủ, bài tập thực hành, chứng chỉ hoàn thành và hỗ trợ trực tiếp từ giảng viên.',
    isPopular: true
  },
  {
    id: 4,
    category: 'courses',
    question: 'Tôi có thể học mọi lúc mọi nơi không?',
    answer: 'Có, tất cả các khóa học đều được thiết kế để bạn có thể học mọi lúc mọi nơi. Bạn có thể truy cập từ máy tính, tablet hoặc điện thoại thông minh. Tiến độ học tập sẽ được lưu tự động và đồng bộ trên tất cả thiết bị.'
  },
  {
    id: 5,
    category: 'courses',
    question: 'Sau khi mua khóa học, tôi có thể truy cập bao lâu?',
    answer: 'Sau khi mua khóa học, bạn sẽ có quyền truy cập trọn đời vào nội dung khóa học. Bạn có thể xem lại bài giảng bất cứ lúc nào và nhận được các cập nhật mới của khóa học miễn phí.'
  },
  {
    id: 6,
    category: 'payment',
    question: 'Các phương thức thanh toán nào được hỗ trợ?',
    answer: 'Chúng tôi hỗ trợ nhiều phương thức thanh toán: thẻ tín dụng/ghi nợ (Visa, Mastercard), ví điện tử (MoMo, ZaloPay, VNPay), chuyển khoản ngân hàng và thanh toán tại cửa hàng tiện lợi.',
    isPopular: true
  },
  {
    id: 7,
    category: 'payment',
    question: 'Tôi có thể hoàn tiền không?',
    answer: 'Chúng tôi có chính sách hoàn tiền trong vòng 30 ngày nếu bạn không hài lòng với khóa học. Điều kiện áp dụng: chưa hoàn thành quá 30% nội dung khóa học và có lý do chính đáng.'
  },
  {
    id: 8,
    category: 'books',
    question: 'Sách điện tử hoạt động như thế nào?',
    answer: 'Sách điện tử của chúng tôi được tích hợp với video giải bài tập chi tiết. Mỗi câu hỏi trong sách có mã ID riêng, bạn chỉ cần nhập mã để xem video giải thích. Thời gian truy cập là 2 năm kể từ khi kích hoạt.',
    isPopular: true
  },
  {
    id: 9,
    category: 'books',
    question: 'Làm thế nào để kích hoạt sách điện tử?',
    answer: 'Sau khi mua sách, bạn sẽ nhận được mã kích hoạt. Truy cập trang "Kích hoạt sách", nhập mã kích hoạt và làm theo hướng dẫn. Sau khi kích hoạt thành công, bạn có thể truy cập ngay vào nội dung số.'
  },
  {
    id: 10,
    category: 'technical',
    question: 'Tôi gặp lỗi khi xem video, phải làm sao?',
    answer: 'Nếu gặp lỗi khi xem video, hãy thử các bước sau: 1) Kiểm tra kết nối internet, 2) Tải lại trang, 3) Thử trình duyệt khác, 4) Xóa cache và cookies. Nếu vẫn không được, liên hệ bộ phận hỗ trợ kỹ thuật.'
  },
  {
    id: 11,
    category: 'technical',
    question: 'Ứng dụng mobile có sẵn không?',
    answer: 'Hiện tại chúng tôi đang phát triển ứng dụng mobile cho iOS và Android. Trong thời gian chờ đợi, bạn có thể sử dụng trình duyệt mobile để truy cập, giao diện đã được tối ưu cho thiết bị di động.'
  },
  {
    id: 12,
    category: 'general',
    question: 'Làm thế nào để liên hệ hỗ trợ?',
    answer: 'Bạn có thể liên hệ hỗ trợ qua: Email: support@khoitriso.com, Hotline: 1900-123-456 (24/7), Chat trực tuyến trên website, hoặc gửi tin nhắn qua fanpage Facebook của chúng tôi.'
  }
];

export default function FAQPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [openItems, setOpenItems] = useState<number[]>([]);

  const filteredFAQs = faqData.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const popularFAQs = faqData.filter(faq => faq.isPopular);

  const toggleFAQ = (id: number) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
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
                  <span className="text-gray-500">Câu hỏi thường gặp</span>
                </div>
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto">
            <QuestionMarkCircleIcon className="h-16 w-16 mx-auto mb-6 opacity-80" />
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">
              Câu hỏi thường gặp
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              Tìm câu trả lời cho những thắc mắc phổ biến về Khởi Trí Số. 
              Nếu không tìm thấy câu trả lời, hãy liên hệ với chúng tôi.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm kiếm câu hỏi..."
                  className="w-full px-6 py-4 pr-14 text-gray-900 bg-white rounded-xl focus:ring-4 focus:ring-white/20 focus:outline-none text-lg"
                />
                <button className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-600">
                  <MagnifyingGlassIcon className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Danh mục
              </h3>
              <ul className="space-y-2">
                {faqCategories.map((category) => (
                  <li key={category.id}>
                    <button
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full text-left flex justify-between items-center py-2 px-3 rounded-lg transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-blue-100 text-blue-700 font-semibold'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <span>{category.name}</span>
                      <span className="text-sm bg-gray-200 px-2 py-1 rounded">
                        {category.count}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>

              {/* Popular Questions */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Câu hỏi phổ biến
                </h3>
                <ul className="space-y-3">
                  {popularFAQs.slice(0, 5).map((faq) => (
                    <li key={faq.id}>
                      <button
                        onClick={() => {
                          setSelectedCategory('all');
                          setSearchTerm('');
                          toggleFAQ(faq.id);
                        }}
                        className="text-left text-sm text-blue-600 hover:text-blue-700 line-clamp-2"
                      >
                        {faq.question}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Results Info */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {searchTerm ? `Kết quả tìm kiếm cho "${searchTerm}"` : 
                 selectedCategory === 'all' ? 'Tất cả câu hỏi' : 
                 faqCategories.find(c => c.id === selectedCategory)?.name}
              </h2>
              <p className="text-gray-600">
                Tìm thấy {filteredFAQs.length} câu hỏi
              </p>
            </div>

            {/* FAQ List */}
            <div className="space-y-4">
              {filteredFAQs.map((faq) => (
                <div key={faq.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  <button
                    onClick={() => toggleFAQ(faq.id)}
                    className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      {faq.isPopular && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
                          Phổ biến
                        </span>
                      )}
                      <h3 className="font-semibold text-gray-900">
                        {faq.question}
                      </h3>
                    </div>
                    {openItems.includes(faq.id) ? (
                      <ChevronUpIcon className="h-5 w-5 text-gray-500 flex-shrink-0" />
                    ) : (
                      <ChevronDownIcon className="h-5 w-5 text-gray-500 flex-shrink-0" />
                    )}
                  </button>
                  
                  {openItems.includes(faq.id) && (
                    <div className="px-6 pb-4 border-t border-gray-100">
                      <div className="pt-4">
                        <p className="text-gray-700 leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Empty State */}
            {filteredFAQs.length === 0 && (
              <div className="text-center py-16">
                <QuestionMarkCircleIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Không tìm thấy câu hỏi
                </h3>
                <p className="text-gray-600 mb-6">
                  Hãy thử thay đổi từ khóa tìm kiếm hoặc danh mục
                </p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                  }}
                  className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Xem tất cả câu hỏi
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contact Support Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Vẫn cần hỗ trợ?
            </h2>
            <p className="text-lg text-gray-600">
              Đội ngũ hỗ trợ của chúng tôi luôn sẵn sàng giúp đỡ bạn 24/7
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Live Chat */}
            <div className="text-center p-6 bg-blue-50 rounded-2xl">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ChatBubbleLeftRightIcon className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Chat trực tuyến
              </h3>
              <p className="text-gray-600 mb-4">
                Trò chuyện trực tiếp với đội ngũ hỗ trợ
              </p>
              <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                Bắt đầu chat
                <ArrowRightIcon className="ml-2 h-4 w-4" />
              </button>
            </div>

            {/* Email Support */}
            <div className="text-center p-6 bg-green-50 rounded-2xl">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <EnvelopeIcon className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Email hỗ trợ
              </h3>
              <p className="text-gray-600 mb-4">
                Gửi email và nhận phản hồi trong 24h
              </p>
              <a
                href="mailto:support@khoitriso.com"
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
              >
                Gửi email
                <ArrowRightIcon className="ml-2 h-4 w-4" />
              </a>
            </div>

            {/* Phone Support */}
            <div className="text-center p-6 bg-purple-50 rounded-2xl">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <PhoneIcon className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Hotline 24/7
              </h3>
              <p className="text-gray-600 mb-4">
                Gọi điện trực tiếp để được hỗ trợ ngay
              </p>
              <a
                href="tel:1900123456"
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors"
              >
                1900-123-456
                <ArrowRightIcon className="ml-2 h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Sẵn sàng bắt đầu học tập?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Khám phá hàng trăm khóa học chất lượng cao và bắt đầu hành trình học tập của bạn ngay hôm nay
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/courses"
              className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors shadow-lg"
            >
              Xem khóa học
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Link>
            <Link
              href="/books"
              className="inline-flex items-center px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-blue-600 transition-colors"
            >
              Khám phá sách điện tử
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
