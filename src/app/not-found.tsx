import Link from 'next/link';
import Image from 'next/image';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white">
      {/* Error Section - Style giống template gốc */}
      <section className="ed-error section-gap py-20 lg:py-32">
        <div className="container ed-container mx-auto px-4">
          <div className="flex justify-center">
            <div className="lg:w-2/3 md:w-2/3 w-full">
              <div className="ed-error__inner text-center">
                <div className="ed-error__img mb-12">
                  <Image 
                    src="/images/error-img.svg" 
                    alt="error-img" 
                    width={400}
                    height={300}
                    className="mx-auto"
                    quality={100}
                    unoptimized={true}
                  />
                </div>
                <div className="ed-error__content">
                  <h1 className="text-6xl lg:text-8xl font-bold text-gray-200 mb-4">404</h1>
                  <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-6">
                    Trang không tồn tại
                  </h2>
                  <p className="ed-error__content-text text-lg text-gray-600 max-w-2xl mx-auto mb-8">
                    Có vẻ như bạn đã truy cập vào một trang đã bị xóa hoặc không tồn tại. 
                    Hãy quay về trang chủ để tiếp tục khám phá Khởi Trí Số.
                  </p>
                  <div className="ed-error__btn">
                    <Link 
                      href="/" 
                      className="ed-btn inline-flex items-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
                    >
                      Về trang chủ
                      <ArrowRightIcon className="ml-2 h-5 w-5" />
                    </Link>
                  </div>

                  {/* Quick Links - Thêm vào để phù hợp với platform */}
                  <div className="mt-12 pt-8 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">
                      Hoặc bạn có thể quan tâm:
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      <Link 
                        href="/courses" 
                        className="text-blue-600 hover:text-blue-700 font-medium transition-colors p-4 rounded-lg hover:bg-blue-50"
                      >
                        📚 Xem khóa học
                      </Link>
                      <Link 
                        href="/books/activation" 
                        className="text-blue-600 hover:text-blue-700 font-medium transition-colors p-4 rounded-lg hover:bg-blue-50"
                      >
                        🔑 Kích hoạt sách điện tử
                      </Link>
                      <Link 
                        href="/about" 
                        className="text-blue-600 hover:text-blue-700 font-medium transition-colors p-4 rounded-lg hover:bg-blue-50"
                      >
                        ℹ️ Về chúng tôi
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Background Elements - Style giống template */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-32 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-32 w-96 h-96 bg-gradient-to-tr from-purple-400/10 to-pink-400/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-blue-200/20 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-24 h-24 bg-purple-200/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
      </div>
    </div>
  );
}
