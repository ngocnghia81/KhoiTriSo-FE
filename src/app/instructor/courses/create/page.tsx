import { Metadata } from 'next';
import {
  AcademicCapIcon,
  PhotoIcon,
  VideoCameraIcon,
  DocumentTextIcon,
  TagIcon,
  CurrencyDollarIcon,
  ClockIcon,
  UserGroupIcon,
  InformationCircleIcon,
  PlusIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

export const metadata: Metadata = {
  title: 'Tạo khóa học mới - Instructor',
  description: 'Tạo khóa học mới với các bài học và nội dung phong phú',
};

export default function CreateCoursePage() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Tạo khóa học mới</h1>
          <p className="mt-2 text-sm text-gray-700">
            Tạo khóa học chất lượng cao để chia sẻ kiến thức với học viên
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none space-x-3">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-xl bg-gray-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-gray-500 transition-all duration-200"
          >
            Lưu nháp
          </button>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-green-500 transition-all duration-200"
          >
            Gửi phê duyệt
          </button>
        </div>
      </div>

      <form className="space-y-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white shadow-sm rounded-lg border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Thông tin cơ bản</h3>
              </div>
              <div className="p-6 space-y-6">
                {/* Course Title */}
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    Tên khóa học *
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="title"
                      id="title"
                      className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500"
                      placeholder="Ví dụ: Toán học nâng cao lớp 12"
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Tên khóa học nên rõ ràng và mô tả chính xác nội dung
                  </p>
                </div>

                {/* Course Description */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Mô tả khóa học *
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="description"
                      name="description"
                      rows={4}
                      className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500"
                      placeholder="Mô tả chi tiết về nội dung, mục tiêu và lợi ích của khóa học..."
                    />
                  </div>
                </div>

                {/* Category and Level */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                      Danh mục *
                    </label>
                    <select
                      id="category"
                      name="category"
                      className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="">Chọn danh mục</option>
                      <option value="math">Toán học</option>
                      <option value="physics">Vật lý</option>
                      <option value="chemistry">Hóa học</option>
                      <option value="biology">Sinh học</option>
                      <option value="literature">Ngữ văn</option>
                      <option value="english">Tiếng Anh</option>
                      <option value="history">Lịch sử</option>
                      <option value="geography">Địa lý</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="level" className="block text-sm font-medium text-gray-700">
                      Cấp độ *
                    </label>
                    <select
                      id="level"
                      name="level"
                      className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="">Chọn cấp độ</option>
                      <option value="beginner">Cơ bản</option>
                      <option value="intermediate">Trung bình</option>
                      <option value="advanced">Nâng cao</option>
                      <option value="expert">Chuyên gia</option>
                    </select>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
                    Từ khóa
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="tags"
                      id="tags"
                      className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500"
                      placeholder="Nhập từ khóa, cách nhau bằng dấu phẩy"
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Ví dụ: toán-12, đạo-hàm, nâng-cao
                  </p>
                </div>
              </div>
            </div>

            {/* Course Content */}
            <div className="bg-white shadow-sm rounded-lg border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Nội dung khóa học</h3>
                  <button
                    type="button"
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200"
                  >
                    <PlusIcon className="h-4 w-4 mr-1" />
                    Thêm chương
                  </button>
                </div>
              </div>
              <div className="p-6">
                {/* Sample chapter */}
                <div className="border border-gray-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-md font-medium text-gray-900">Chương 1: Giới thiệu</h4>
                    <button className="text-gray-400 hover:text-red-500">
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Tên chương"
                      className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 text-sm"
                    />
                    
                    {/* Lessons in chapter */}
                    <div className="ml-4 space-y-2">
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <VideoCameraIcon className="h-5 w-5 text-blue-500" />
                        <input
                          type="text"
                          placeholder="Tên bài học"
                          className="flex-1 border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 text-sm"
                        />
                        <input
                          type="text"
                          placeholder="Thời lượng"
                          className="w-24 border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 text-sm"
                        />
                        <button className="text-gray-400 hover:text-red-500">
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </div>
                      
                      <button
                        type="button"
                        className="flex items-center text-sm text-green-600 hover:text-green-800 ml-3"
                      >
                        <PlusIcon className="h-4 w-4 mr-1" />
                        Thêm bài học
                      </button>
                    </div>
                  </div>
                </div>

                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                  <AcademicCapIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">
                    Thêm chương và bài học để xây dựng nội dung khóa học
                  </p>
                </div>
              </div>
            </div>

            {/* Course Media */}
            <div className="bg-white shadow-sm rounded-lg border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Hình ảnh & Video</h3>
              </div>
              <div className="p-6 space-y-6">
                {/* Course Thumbnail */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ảnh đại diện khóa học *
                  </label>
                  <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-green-400 transition-colors">
                    <div className="space-y-1 text-center">
                      <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label htmlFor="thumbnail" className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-green-500">
                          <span>Tải lên ảnh</span>
                          <input id="thumbnail" name="thumbnail" type="file" className="sr-only" accept="image/*" />
                        </label>
                        <p className="pl-1">hoặc kéo thả</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, GIF tối đa 10MB
                      </p>
                    </div>
                  </div>
                </div>

                {/* Preview Video */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Video giới thiệu
                  </label>
                  <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-green-400 transition-colors">
                    <div className="space-y-1 text-center">
                      <VideoCameraIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label htmlFor="preview-video" className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-green-500">
                          <span>Tải lên video</span>
                          <input id="preview-video" name="preview-video" type="file" className="sr-only" accept="video/*" />
                        </label>
                        <p className="pl-1">hoặc kéo thả</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        MP4, MOV, AVI tối đa 100MB
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pricing */}
            <div className="bg-white shadow-sm rounded-lg border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Giá & Thời lượng</h3>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                    Giá bán *
                  </label>
                  <div className="mt-1 relative rounded-lg shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <CurrencyDollarIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      name="price"
                      id="price"
                      className="block w-full pl-10 border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                      placeholder="299000"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">VND</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="original-price" className="block text-sm font-medium text-gray-700">
                    Giá gốc (tùy chọn)
                  </label>
                  <div className="mt-1 relative rounded-lg shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <CurrencyDollarIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      name="original-price"
                      id="original-price"
                      className="block w-full pl-10 border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                      placeholder="399000"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">VND</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
                    Thời lượng *
                  </label>
                  <div className="mt-1 relative rounded-lg shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <ClockIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="duration"
                      id="duration"
                      className="block w-full pl-10 border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                      placeholder="40 giờ"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="max-students" className="block text-sm font-medium text-gray-700">
                    Số học viên tối đa
                  </label>
                  <div className="mt-1 relative rounded-lg shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <UserGroupIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      name="max-students"
                      id="max-students"
                      className="block w-full pl-10 border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                      placeholder="100"
                    />
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    Để trống nếu không giới hạn
                  </p>
                </div>
              </div>
            </div>

            {/* Publishing Options */}
            <div className="bg-white shadow-sm rounded-lg border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Tùy chọn xuất bản</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="auto-publish"
                      name="auto-publish"
                      type="checkbox"
                      className="focus:ring-green-500 h-4 w-4 text-green-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="auto-publish" className="font-medium text-gray-700">
                      Tự động xuất bản
                    </label>
                    <p className="text-gray-500">
                      Khóa học sẽ được xuất bản ngay sau khi được phê duyệt
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="allow-preview"
                      name="allow-preview"
                      type="checkbox"
                      className="focus:ring-green-500 h-4 w-4 text-green-600 border-gray-300 rounded"
                      defaultChecked
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="allow-preview" className="font-medium text-gray-700">
                      Cho phép xem trước
                    </label>
                    <p className="text-gray-500">
                      Học viên có thể xem một số bài học miễn phí
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="certificate"
                      name="certificate"
                      type="checkbox"
                      className="focus:ring-green-500 h-4 w-4 text-green-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="certificate" className="font-medium text-gray-700">
                      Cấp chứng chỉ
                    </label>
                    <p className="text-gray-500">
                      Học viên sẽ nhận chứng chỉ khi hoàn thành khóa học
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Help */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <InformationCircleIcon className="h-5 w-5 text-blue-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    Mẹo tạo khóa học chất lượng
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Tên khóa học nên rõ ràng và hấp dẫn</li>
                      <li>Mô tả chi tiết giá trị mà học viên nhận được</li>
                      <li>Cấu trúc bài học logic và dễ theo dõi</li>
                      <li>Video chất lượng cao với âm thanh rõ ràng</li>
                      <li>Bổ sung tài liệu và bài tập thực hành</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
