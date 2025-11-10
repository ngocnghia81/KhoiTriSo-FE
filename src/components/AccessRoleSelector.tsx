'use client';

import { AccessRole } from '@/hooks/useUpload';

export interface AccessRoleInfo {
  role: AccessRole;
  description: string;
  useCase: string;
  folder: string;
}

export const ACCESS_ROLES: AccessRoleInfo[] = [
  {
    role: 'GUEST',
    description: 'Khách truy cập',
    useCase: 'Upload file công khai, không cần đăng nhập',
    folder: 'public'
  },
  {
    role: 'Student',
    description: 'Học sinh',
    useCase: 'Upload bài tập, bài nộp, tài liệu học tập',
    folder: 'student-uploads'
  },
  {
    role: 'Teacher',
    description: 'Giáo viên',
    useCase: 'Upload bài giảng, đề thi, tài liệu giảng dạy',
    folder: 'teacher-uploads'
  },
  {
    role: 'Admin',
    description: 'Quản trị viên',
    useCase: 'Upload file hệ thống, backup, cấu hình',
    folder: 'admin-uploads'
  }
];

export function AccessRoleSelector({ 
  selectedRole, 
  onRoleChange 
}: { 
  selectedRole: AccessRole; 
  onRoleChange: (role: AccessRole) => void; 
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Quyền truy cập file
      </label>
      <div className="grid grid-cols-2 gap-2">
        {ACCESS_ROLES.map((roleInfo) => (
          <button
            key={roleInfo.role}
            onClick={() => onRoleChange(roleInfo.role)}
            className={`p-3 text-left rounded-lg border transition-colors ${
              selectedRole === roleInfo.role
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="font-medium text-sm">{roleInfo.role}</div>
            <div className="text-xs text-gray-500 mt-1">{roleInfo.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

export function AccessRoleInfoCard({ role }: { role: AccessRole }) {
  const roleInfo = ACCESS_ROLES.find(r => r.role === role);
  
  if (!roleInfo) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
      <div className="flex items-center space-x-2 mb-2">
        <span className="font-medium text-blue-800">{roleInfo.role}</span>
        <span className="text-sm text-blue-600">({roleInfo.description})</span>
      </div>
      <p className="text-sm text-blue-700 mb-1">{roleInfo.useCase}</p>
      <p className="text-xs text-blue-600">Thư mục: {roleInfo.folder}</p>
    </div>
  );
}
