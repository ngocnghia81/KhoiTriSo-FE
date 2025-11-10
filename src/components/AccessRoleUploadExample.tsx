'use client';

import { useState } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { AccessRole, AccessRoleSelector, AccessRoleInfoCard } from '@/components/AccessRoleSelector';

export function AccessRoleUploadExample() {
  const [selectedRole, setSelectedRole] = useState<AccessRole>('GUEST');
  const [uploadResults, setUploadResults] = useState<Array<{
    key: string;
    url: string;
    role: AccessRole;
    timestamp: Date;
  }>>([]);

  const handleUploadSuccess = (result: { key: string; url: string }) => {
    setUploadResults(prev => [...prev, {
      ...result,
      role: selectedRole,
      timestamp: new Date()
    }]);
  };

  const handleUploadError = (error: string) => {
    console.error('Upload error:', error);
  };

  const getFolderForRole = (role: AccessRole): string => {
    switch (role) {
      case 'GUEST': return 'public';
      case 'Student': return 'student-uploads';
      case 'Teacher': return 'teacher-uploads';
      case 'Admin': return 'admin-uploads';
      default: return 'uploads';
    }
  };

  const getAcceptForRole = (role: AccessRole): string => {
    switch (role) {
      case 'GUEST': return '.pdf,.jpg,.png';
      case 'Student': return '.docx,.pdf,.txt,.jpg,.png';
      case 'Teacher': return '.docx,.pdf,.pptx,.mp4,.jpg,.png';
      case 'Admin': return '*';
      default: return '*';
    }
  };

  const getMaxSizeForRole = (role: AccessRole): number => {
    switch (role) {
      case 'GUEST': return 10 * 1024 * 1024; // 10MB
      case 'Student': return 50 * 1024 * 1024; // 50MB
      case 'Teacher': return 100 * 1024 * 1024; // 100MB
      case 'Admin': return 500 * 1024 * 1024; // 500MB
      default: return 50 * 1024 * 1024;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Upload với Access Roles</h1>
        <p className="text-gray-600">
          Demo upload với các quyền truy cập khác nhau từ database
        </p>
      </div>

      {/* Access Role Configuration */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Cấu hình Quyền Truy Cập</h2>
        
        <div className="space-y-4">
          <AccessRoleSelector 
            selectedRole={selectedRole}
            onRoleChange={setSelectedRole}
          />
          
          <AccessRoleInfoCard role={selectedRole} />
          
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Cấu hình Upload:</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Thư mục:</span> {getFolderForRole(selectedRole)}
              </div>
              <div>
                <span className="font-medium">File types:</span> {getAcceptForRole(selectedRole)}
              </div>
              <div>
                <span className="font-medium">Max size:</span> {Math.round(getMaxSizeForRole(selectedRole) / 1024 / 1024)}MB
              </div>
              <div>
                <span className="font-medium">Access Role:</span> {selectedRole}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Component */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload File</h2>
        
        <FileUpload
          onUploadComplete={handleUploadSuccess}
          onUploadError={handleUploadError}
          accept={getAcceptForRole(selectedRole)}
          maxSize={getMaxSizeForRole(selectedRole)}
          folder={getFolderForRole(selectedRole)}
          accessRole={selectedRole}
          multiple={false}
        />
      </div>

      {/* Upload Results */}
      {uploadResults.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Results</h2>
          
          <div className="space-y-3">
            {uploadResults.map((result, index) => (
              <div key={index} className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 font-medium text-sm">
                        {result.role.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        File uploaded as {result.role}
                      </p>
                      <p className="text-xs text-gray-500">
                        Key: {result.key}
                      </p>
                      <p className="text-xs text-gray-500">
                        Uploaded: {result.timestamp.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <a
                      href={result.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800 underline"
                    >
                      View File
                    </a>
                    <button
                      onClick={() => {
                        console.log('File details:', {
                          key: result.key,
                          url: result.url,
                          role: result.role,
                          folder: getFolderForRole(result.role)
                        });
                        alert(`File ready!\nRole: ${result.role}\nKey: ${result.key}\nFolder: ${getFolderForRole(result.role)}`);
                      }}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      Use File
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Database Access Roles Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-800 mb-2">Database Access Roles:</h3>
        <div className="text-sm text-blue-700 space-y-1">
          <p><strong>GUEST:</strong> Khách truy cập - Upload file công khai</p>
          <p><strong>Student:</strong> Học sinh - Upload bài tập, tài liệu học</p>
          <p><strong>Teacher:</strong> Giáo viên - Upload bài giảng, đề thi</p>
          <p><strong>Admin:</strong> Quản trị viên - Upload file hệ thống</p>
        </div>
      </div>
    </div>
  );
}
