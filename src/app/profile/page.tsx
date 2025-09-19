'use client';

import { useState } from 'react';
import {
  UserCircleIcon,
  CameraIcon,
  PencilIcon,
  EyeIcon,
  EyeSlashIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarIcon,
  AcademicCapIcon,
  BookOpenIcon,
  TrophyIcon,
  StarIcon,
  ClockIcon,
  ShieldCheckIcon,
  BellIcon,
  CreditCardIcon,
  KeyIcon
} from '@heroicons/react/24/outline';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: 'Nguyễn Văn',
    lastName: 'An',
    email: 'student@khoitriso.com',
    phone: '0123456789',
    dateOfBirth: '1995-05-15',
    address: '123 Đường ABC, Phường XYZ, Quận 1, TP.HCM',
    bio: 'Tôi là một học viên đam mê học tập và khám phá kiến thức mới. Hiện đang theo học nhiều khóa học về Toán học và Khoa học máy tính.',
    avatar: '',
    role: 'student'
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    courseUpdates: true,
    promotions: false,
    weeklyDigest: true,
    pushNotifications: true
  });

  // Mock user stats
  const userStats = {
    coursesCompleted: 12,
    coursesInProgress: 3,
    totalStudyHours: 156,
    certificates: 8,
    averageRating: 4.8,
    streak: 15
  };

  // Mock recent activity
  const recentActivity = [
    {
      id: 1,
      type: 'course_completed',
      title: 'Hoàn thành khóa học "Toán học nâng cao lớp 12"',
      date: '2024-01-20',
      icon: TrophyIcon,
      color: 'text-green-600 bg-green-100'
    },
    {
      id: 2,
      type: 'certificate_earned',
      title: 'Nhận chứng chỉ "Vật lý thí nghiệm"',
      date: '2024-01-18',
      icon: AcademicCapIcon,
      color: 'text-blue-600 bg-blue-100'
    },
    {
      id: 3,
      type: 'book_purchased',
      title: 'Mua sách "Tuyển tập đề thi THPT 2024"',
      date: '2024-01-15',
      icon: BookOpenIcon,
      color: 'text-purple-600 bg-purple-100'
    }
  ];

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(false);
    // Handle profile update logic here
    alert('Cập nhật thông tin thành công!');
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle password change logic here
    alert('Đổi mật khẩu thành công!');
    setShowChangePassword(false);
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const handleNotificationChange = (key: string) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev]
    }));
  };

  const tabs = [
    { id: 'profile', name: 'Thông tin cá nhân', icon: UserCircleIcon },
    { id: 'security', name: 'Bảo mật', icon: ShieldCheckIcon },
    { id: 'notifications', name: 'Thông báo', icon: BellIcon },
    { id: 'billing', name: 'Thanh toán', icon: CreditCardIcon }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 mb-6">
          <div className="px-6 py-4">
            <div className="flex items-center">
              <div className="relative">
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <UserCircleIcon className="h-12 w-12 text-white" />
                </div>
                <button className="absolute bottom-0 right-0 bg-white rounded-full p-1.5 shadow-sm border border-gray-300 hover:bg-gray-50">
                  <CameraIcon className="h-4 w-4 text-gray-600" />
                </button>
              </div>
              <div className="ml-6">
                <h1 className="text-2xl font-bold text-gray-900">
                  {profileData.firstName} {profileData.lastName}
                </h1>
                <p className="text-sm text-gray-500">{profileData.email}</p>
                <div className="flex items-center mt-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Học viên
                  </span>
                  <div className="ml-4 flex items-center text-sm text-gray-500">
                    <StarIcon className="h-4 w-4 mr-1 text-yellow-400" />
                    {userStats.averageRating} điểm
                  </div>
                  <div className="ml-4 flex items-center text-sm text-gray-500">
                    <ClockIcon className="h-4 w-4 mr-1" />
                    {userStats.totalStudyHours} giờ học
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <nav className="space-y-1 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    {tab.name}
                  </button>
                );
              })}
            </nav>

            {/* Stats Card */}
            <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Thống kê học tập</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Khóa học hoàn thành</span>
                  <span className="text-sm font-medium">{userStats.coursesCompleted}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Đang học</span>
                  <span className="text-sm font-medium">{userStats.coursesInProgress}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Chứng chỉ</span>
                  <span className="text-sm font-medium">{userStats.certificates}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Chuỗi ngày học</span>
                  <span className="text-sm font-medium text-green-600">{userStats.streak} ngày</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="bg-white shadow-sm rounded-lg border border-gray-200">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900">Thông tin cá nhân</h3>
                      <button
                        onClick={() => setIsEditing(!isEditing)}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <PencilIcon className="h-4 w-4 mr-2" />
                        {isEditing ? 'Hủy' : 'Chỉnh sửa'}
                      </button>
                    </div>
                  </div>
                  <div className="p-6">
                    <form onSubmit={handleProfileUpdate}>
                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Họ và tên lót</label>
                          <input
                            type="text"
                            value={profileData.firstName}
                            onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                            disabled={!isEditing}
                            className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">Tên</label>
                          <input
                            type="text"
                            value={profileData.lastName}
                            onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                            disabled={!isEditing}
                            className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">Email</label>
                          <div className="mt-1 relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                              type="email"
                              value={profileData.email}
                              disabled
                              className="block w-full pl-10 border-gray-300 rounded-lg shadow-sm bg-gray-50 text-gray-500"
                            />
                          </div>
                          <p className="mt-1 text-sm text-gray-500">Email không thể thay đổi</p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">Số điện thoại</label>
                          <div className="mt-1 relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <PhoneIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                              type="tel"
                              value={profileData.phone}
                              onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                              disabled={!isEditing}
                              className="block w-full pl-10 border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">Ngày sinh</label>
                          <div className="mt-1 relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <CalendarIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                              type="date"
                              value={profileData.dateOfBirth}
                              onChange={(e) => setProfileData({...profileData, dateOfBirth: e.target.value})}
                              disabled={!isEditing}
                              className="block w-full pl-10 border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                            />
                          </div>
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-sm font-medium text-gray-700">Địa chỉ</label>
                          <div className="mt-1 relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <MapPinIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                              type="text"
                              value={profileData.address}
                              onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                              disabled={!isEditing}
                              className="block w-full pl-10 border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                            />
                          </div>
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-sm font-medium text-gray-700">Giới thiệu bản thân</label>
                          <textarea
                            rows={3}
                            value={profileData.bio}
                            onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                            disabled={!isEditing}
                            className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                          />
                        </div>
                      </div>

                      {isEditing && (
                        <div className="mt-6 flex justify-end space-x-3">
                          <button
                            type="button"
                            onClick={() => setIsEditing(false)}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                          >
                            Hủy
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                          >
                            Lưu thay đổi
                          </button>
                        </div>
                      )}
                    </form>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white shadow-sm rounded-lg border border-gray-200">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Hoạt động gần đây</h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {recentActivity.map((activity) => {
                        const Icon = activity.icon;
                        return (
                          <div key={activity.id} className="flex items-start">
                            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${activity.color}`}>
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                              <p className="text-sm text-gray-500">
                                {new Date(activity.date).toLocaleDateString('vi-VN')}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div className="bg-white shadow-sm rounded-lg border border-gray-200">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Bảo mật tài khoản</h3>
                  </div>
                  <div className="p-6 space-y-6">
                    {/* Change Password */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="text-md font-medium text-gray-900">Mật khẩu</h4>
                          <p className="text-sm text-gray-500">Cập nhật mật khẩu để bảo mật tài khoản</p>
                        </div>
                        <button
                          onClick={() => setShowChangePassword(!showChangePassword)}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
                        >
                          <KeyIcon className="h-4 w-4 mr-2" />
                          Đổi mật khẩu
                        </button>
                      </div>

                      {showChangePassword && (
                        <form onSubmit={handlePasswordChange} className="space-y-4 bg-gray-50 p-4 rounded-lg">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Mật khẩu hiện tại</label>
                            <input
                              type="password"
                              value={passwordData.currentPassword}
                              onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                              className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Mật khẩu mới</label>
                            <input
                              type="password"
                              value={passwordData.newPassword}
                              onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                              className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Xác nhận mật khẩu mới</label>
                            <input
                              type="password"
                              value={passwordData.confirmPassword}
                              onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                              className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                              required
                            />
                          </div>
                          <div className="flex justify-end space-x-3">
                            <button
                              type="button"
                              onClick={() => setShowChangePassword(false)}
                              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                              Hủy
                            </button>
                            <button
                              type="submit"
                              className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                            >
                              Cập nhật mật khẩu
                            </button>
                          </div>
                        </form>
                      )}
                    </div>

                    {/* Two-Factor Authentication */}
                    <div className="border-t border-gray-200 pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-md font-medium text-gray-900">Xác thực hai yếu tố (2FA)</h4>
                          <p className="text-sm text-gray-500">Tăng cường bảo mật với xác thực hai yếu tố</p>
                        </div>
                        <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50">
                          Kích hoạt
                        </button>
                      </div>
                    </div>

                    {/* Login Sessions */}
                    <div className="border-t border-gray-200 pt-6">
                      <h4 className="text-md font-medium text-gray-900 mb-4">Phiên đăng nhập</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="text-sm font-medium text-gray-900">Chrome trên Windows</p>
                            <p className="text-sm text-gray-500">IP: 192.168.1.1 • Hiện tại</p>
                          </div>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Đang hoạt động
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="text-sm font-medium text-gray-900">Safari trên iPhone</p>
                            <p className="text-sm text-gray-500">IP: 192.168.1.5 • 2 giờ trước</p>
                          </div>
                          <button className="text-sm text-red-600 hover:text-red-800">Đăng xuất</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="bg-white shadow-sm rounded-lg border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Cài đặt thông báo</h3>
                </div>
                <div className="p-6 space-y-6">
                  <div className="space-y-4">
                    {Object.entries(notifications).map(([key, value]) => {
                      const labels = {
                        emailNotifications: 'Thông báo email',
                        courseUpdates: 'Cập nhật khóa học',
                        promotions: 'Khuyến mãi và ưu đãi',
                        weeklyDigest: 'Bản tin hàng tuần',
                        pushNotifications: 'Thông báo đẩy'
                      };
                      const descriptions = {
                        emailNotifications: 'Nhận thông báo qua email',
                        courseUpdates: 'Thông báo khi có bài học mới hoặc cập nhật khóa học',
                        promotions: 'Nhận thông tin về các chương trình khuyến mãi',
                        weeklyDigest: 'Tổng hợp hoạt động học tập hàng tuần',
                        pushNotifications: 'Thông báo trực tiếp trên thiết bị'
                      };

                      return (
                        <div key={key} className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">
                              {labels[key as keyof typeof labels]}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {descriptions[key as keyof typeof descriptions]}
                            </p>
                          </div>
                          <button
                            onClick={() => handleNotificationChange(key)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              value ? 'bg-blue-600' : 'bg-gray-200'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                value ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Billing Tab */}
            {activeTab === 'billing' && (
              <div className="space-y-6">
                <div className="bg-white shadow-sm rounded-lg border border-gray-200">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Thông tin thanh toán</h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-6">
                      {/* Payment Methods */}
                      <div>
                        <h4 className="text-md font-medium text-gray-900 mb-4">Phương thức thanh toán</h4>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                                <CreditCardIcon className="h-4 w-4 text-blue-600" />
                              </div>
                              <div className="ml-3">
                                <p className="text-sm font-medium text-gray-900">**** **** **** 1234</p>
                                <p className="text-sm text-gray-500">Visa • Hết hạn 12/2025</p>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <button className="text-sm text-blue-600 hover:text-blue-800">Chỉnh sửa</button>
                              <button className="text-sm text-red-600 hover:text-red-800">Xóa</button>
                            </div>
                          </div>
                          <button className="w-full flex items-center justify-center px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:border-gray-400 hover:text-gray-700">
                            + Thêm phương thức thanh toán
                          </button>
                        </div>
                      </div>

                      {/* Billing History */}
                      <div className="border-t border-gray-200 pt-6">
                        <h4 className="text-md font-medium text-gray-900 mb-4">Lịch sử thanh toán</h4>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="text-sm font-medium text-gray-900">Toán học nâng cao lớp 12</p>
                              <p className="text-sm text-gray-500">20/01/2024</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-gray-900">₫299,000</p>
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Thành công
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="text-sm font-medium text-gray-900">Sách bài tập Toán 12</p>
                              <p className="text-sm text-gray-500">15/01/2024</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-gray-900">₫150,000</p>
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Thành công
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
