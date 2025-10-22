'use client';

import { useAuth } from '@/contexts/AuthContext';

export default function DashboardFooter() {
  const { user } = useAuth();

  return (
    <footer className="bg-white border-t border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <span>© 2024 Khởi Trí Số. Tất cả quyền được bảo lưu.</span>
          <span>•</span>
          <span>Phiên bản 1.0.0</span>
        </div>
        
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <span>Đăng nhập với tư cách: <strong>{user?.name || 'Admin'}</strong></span>
          <span>•</span>
          <span>Vai trò: <strong>
            {user?.role === 'admin' ? 'Quản trị viên' : 
             user?.role === 'instructor' ? 'Giảng viên' : 'Học viên'}
          </strong></span>
        </div>
      </div>
    </footer>
  );
}

