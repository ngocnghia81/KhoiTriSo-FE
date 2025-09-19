import { Metadata } from 'next';
import {
  Cog6ToothIcon,
  BellIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  GlobeAltIcon,
  EnvelopeIcon,
  KeyIcon,
  UserIcon,
  BuildingOfficeIcon,
  PhoneIcon,
  MapPinIcon,
  CreditCardIcon,
  CloudArrowUpIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

export const metadata: Metadata = {
  title: 'Cài đặt hệ thống - Admin Dashboard',
  description: 'Cấu hình và quản lý cài đặt hệ thống',
};

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Cài đặt hệ thống</h1>
          <p className="mt-2 text-sm text-gray-700">
            Quản lý cấu hình và tùy chỉnh hệ thống
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-all duration-200"
          >
            Lưu thay đổi
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            <a
              href="#general"
              className="bg-blue-50 border-blue-500 text-blue-700 hover:bg-blue-50 hover:text-blue-700 group border-l-4 px-3 py-2 flex items-center text-sm font-medium"
            >
              <Cog6ToothIcon className="text-blue-500 mr-3 flex-shrink-0 h-5 w-5" />
              Cài đặt chung
            </a>
            <a
              href="#company"
              className="border-transparent text-gray-900 hover:bg-gray-50 hover:text-gray-900 group border-l-4 px-3 py-2 flex items-center text-sm font-medium"
            >
              <BuildingOfficeIcon className="text-gray-400 group-hover:text-gray-500 mr-3 flex-shrink-0 h-5 w-5" />
              Thông tin công ty
            </a>
            <a
              href="#payment"
              className="border-transparent text-gray-900 hover:bg-gray-50 hover:text-gray-900 group border-l-4 px-3 py-2 flex items-center text-sm font-medium"
            >
              <CurrencyDollarIcon className="text-gray-400 group-hover:text-gray-500 mr-3 flex-shrink-0 h-5 w-5" />
              Thanh toán
            </a>
            <a
              href="#notifications"
              className="border-transparent text-gray-900 hover:bg-gray-50 hover:text-gray-900 group border-l-4 px-3 py-2 flex items-center text-sm font-medium"
            >
              <BellIcon className="text-gray-400 group-hover:text-gray-500 mr-3 flex-shrink-0 h-5 w-5" />
              Thông báo
            </a>
            <a
              href="#security"
              className="border-transparent text-gray-900 hover:bg-gray-50 hover:text-gray-900 group border-l-4 px-3 py-2 flex items-center text-sm font-medium"
            >
              <ShieldCheckIcon className="text-gray-400 group-hover:text-gray-500 mr-3 flex-shrink-0 h-5 w-5" />
              Bảo mật
            </a>
            <a
              href="#integrations"
              className="border-transparent text-gray-900 hover:bg-gray-50 hover:text-gray-900 group border-l-4 px-3 py-2 flex items-center text-sm font-medium"
            >
              <GlobeAltIcon className="text-gray-400 group-hover:text-gray-500 mr-3 flex-shrink-0 h-5 w-5" />
              Tích hợp
            </a>
          </nav>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* General Settings */}
          <div id="general" className="bg-white shadow-sm rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Cài đặt chung</h3>
              <p className="mt-1 text-sm text-gray-500">
                Cấu hình cơ bản của hệ thống và thông tin website
              </p>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="site-name" className="block text-sm font-medium text-gray-700">
                    Tên website
                  </label>
                  <input
                    type="text"
                    name="site-name"
                    id="site-name"
                    defaultValue="Khởi Trí Số"
                    className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="site-url" className="block text-sm font-medium text-gray-700">
                    URL website
                  </label>
                  <input
                    type="url"
                    name="site-url"
                    id="site-url"
                    defaultValue="https://khoitriso.com"
                    className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="site-description" className="block text-sm font-medium text-gray-700">
                  Mô tả website
                </label>
                <textarea
                  id="site-description"
                  name="site-description"
                  rows={3}
                  defaultValue="Nền tảng giáo dục trực tuyến hàng đầu Việt Nam"
                  className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="timezone" className="block text-sm font-medium text-gray-700">
                    Múi giờ
                  </label>
                  <select
                    id="timezone"
                    name="timezone"
                    className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Asia/Ho_Chi_Minh">Việt Nam (UTC+7)</option>
                    <option value="Asia/Bangkok">Thailand (UTC+7)</option>
                    <option value="Asia/Singapore">Singapore (UTC+8)</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="language" className="block text-sm font-medium text-gray-700">
                    Ngôn ngữ mặc định
                  </label>
                  <select
                    id="language"
                    name="language"
                    className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="vi">Tiếng Việt</option>
                    <option value="en">English</option>
                    <option value="zh">中文</option>
                  </select>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="maintenance-mode"
                    name="maintenance-mode"
                    type="checkbox"
                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="maintenance-mode" className="font-medium text-gray-700">
                    Chế độ bảo trì
                  </label>
                  <p className="text-gray-500">
                    Kích hoạt để hiển thị trang bảo trì cho người dùng
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Company Information */}
          <div id="company" className="bg-white shadow-sm rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Thông tin công ty</h3>
              <p className="mt-1 text-sm text-gray-500">
                Thông tin liên hệ và pháp lý của công ty
              </p>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="company-name" className="block text-sm font-medium text-gray-700">
                    Tên công ty
                  </label>
                  <input
                    type="text"
                    name="company-name"
                    id="company-name"
                    defaultValue="Công ty TNHH Khởi Trí Số"
                    className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="tax-code" className="block text-sm font-medium text-gray-700">
                    Mã số thuế
                  </label>
                  <input
                    type="text"
                    name="tax-code"
                    id="tax-code"
                    defaultValue="0123456789"
                    className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                  Địa chỉ
                </label>
                <textarea
                  id="address"
                  name="address"
                  rows={2}
                  defaultValue="123 Đường ABC, Phường XYZ, Quận 1, TP.HCM"
                  className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Số điện thoại
                  </label>
                  <div className="mt-1 relative rounded-lg shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <PhoneIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      id="phone"
                      defaultValue="+84 123 456 789"
                      className="block w-full pl-10 border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email liên hệ
                  </label>
                  <div className="mt-1 relative rounded-lg shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      defaultValue="contact@khoitriso.com"
                      className="block w-full pl-10 border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Settings */}
          <div id="payment" className="bg-white shadow-sm rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Cài đặt thanh toán</h3>
              <p className="mt-1 text-sm text-gray-500">
                Cấu hình các phương thức thanh toán và chiết khấu
              </p>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">Phương thức thanh toán</h4>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      id="vnpay"
                      name="payment-methods"
                      type="checkbox"
                      defaultChecked
                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                    <label htmlFor="vnpay" className="ml-3 text-sm font-medium text-gray-700">
                      VNPay
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="momo"
                      name="payment-methods"
                      type="checkbox"
                      defaultChecked
                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                    <label htmlFor="momo" className="ml-3 text-sm font-medium text-gray-700">
                      MoMo
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="zalopay"
                      name="payment-methods"
                      type="checkbox"
                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                    <label htmlFor="zalopay" className="ml-3 text-sm font-medium text-gray-700">
                      ZaloPay
                    </label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="default-commission" className="block text-sm font-medium text-gray-700">
                    Tỷ lệ chiết khấu mặc định (%)
                  </label>
                  <input
                    type="number"
                    name="default-commission"
                    id="default-commission"
                    defaultValue="30"
                    min="0"
                    max="100"
                    className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="min-withdrawal" className="block text-sm font-medium text-gray-700">
                    Số tiền rút tối thiểu (VND)
                  </label>
                  <input
                    type="number"
                    name="min-withdrawal"
                    id="min-withdrawal"
                    defaultValue="500000"
                    className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="payout-schedule" className="block text-sm font-medium text-gray-700">
                  Lịch thanh toán
                </label>
                <select
                  id="payout-schedule"
                  name="payout-schedule"
                  className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="monthly">Hàng tháng (Ngày 15)</option>
                  <option value="biweekly">2 tuần một lần</option>
                  <option value="weekly">Hàng tuần</option>
                </select>
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div id="security" className="bg-white shadow-sm rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Cài đặt bảo mật</h3>
              <p className="mt-1 text-sm text-gray-500">
                Cấu hình bảo mật và quyền truy cập hệ thống
              </p>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="session-timeout" className="block text-sm font-medium text-gray-700">
                    Thời gian hết hạn phiên (phút)
                  </label>
                  <input
                    type="number"
                    name="session-timeout"
                    id="session-timeout"
                    defaultValue="60"
                    className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="max-login-attempts" className="block text-sm font-medium text-gray-700">
                    Số lần đăng nhập sai tối đa
                  </label>
                  <input
                    type="number"
                    name="max-login-attempts"
                    id="max-login-attempts"
                    defaultValue="5"
                    className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="two-factor"
                      name="two-factor"
                      type="checkbox"
                      defaultChecked
                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="two-factor" className="font-medium text-gray-700">
                      Xác thực hai yếu tố (2FA)
                    </label>
                    <p className="text-gray-500">
                      Yêu cầu xác thực hai yếu tố cho tài khoản admin
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="password-policy"
                      name="password-policy"
                      type="checkbox"
                      defaultChecked
                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="password-policy" className="font-medium text-gray-700">
                      Chính sách mật khẩu mạnh
                    </label>
                    <p className="text-gray-500">
                      Yêu cầu mật khẩu tối thiểu 8 ký tự, bao gồm chữ hoa, số và ký tự đặc biệt
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="ip-whitelist"
                      name="ip-whitelist"
                      type="checkbox"
                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="ip-whitelist" className="font-medium text-gray-700">
                      Danh sách IP được phép
                    </label>
                    <p className="text-gray-500">
                      Chỉ cho phép truy cập admin từ các IP được chỉ định
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              type="button"
              className="bg-white py-2 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-3"
            >
              Hủy
            </button>
            <button
              type="button"
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Lưu cài đặt
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
