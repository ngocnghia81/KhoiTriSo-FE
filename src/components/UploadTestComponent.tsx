'use client';

import { useState } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { CheckCircleIcon, ExclamationTriangleIcon, DocumentIcon } from '@heroicons/react/24/outline';
import { AccessRole, AccessRoleSelector, AccessRoleInfoCard } from '@/components/AccessRoleSelector';
import { API_URLS } from '@/lib/api-config';

export function UploadTestComponent() {
  const [uploadResults, setUploadResults] = useState<Array<{
    key: string;
    url: string;
    timestamp: Date;
  }>>([]);
  const [selectedAccessRole, setSelectedAccessRole] = useState<AccessRole>('GUEST');

  const handleUploadSuccess = (result: { key: string; url: string }) => {
    setUploadResults(prev => [...prev, {
      ...result,
      timestamp: new Date()
    }]);
  };

  const handleUploadError = (error: string) => {
    console.error('Upload error:', error);
  };

  const testPresignApi = async () => {
    try {
      const response = await fetch(API_URLS.UPLOAD_PRESIGN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          FileName: 'test-file.docx',
          ContentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          Folder: 'test',
          AccessRole: selectedAccessRole
        })
      });

      const data = await response.json();
      console.log('Presign API Response:', data);
      
      if (data.Result) {
        alert(`Presign URL generated successfully!\nUpload URL: ${data.Result.UploadUrl}\nKey: ${data.Result.Key}`);
      } else {
        alert('Failed to get presign URL');
      }
    } catch (error) {
      console.error('Presign API test failed:', error);
      alert('Presign API test failed: ' + error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Upload Test với Presign API</h1>
        <p className="text-gray-600">
          Test upload flow với API presign thực tế từ backend
        </p>
      </div>

      {/* Test Presign API Button */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-800 mb-2">Test Presign API</h3>
        <p className="text-sm text-blue-700 mb-3">
          Click để test API presign và xem response trong console
        </p>
        <button
          onClick={testPresignApi}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Test Presign API
        </button>
      </div>

      {/* Access Role Selector */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Cấu hình Upload</h2>
        
        <div className="space-y-4">
          <AccessRoleSelector 
            selectedRole={selectedAccessRole}
            onRoleChange={setSelectedAccessRole}
          />
          
          <AccessRoleInfoCard role={selectedAccessRole} />
        </div>
      </div>

      {/* Upload Component */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Files</h2>
        
        <FileUpload
          onUploadComplete={handleUploadSuccess}
          onUploadError={handleUploadError}
          accept=".docx,.pdf,.txt"
          maxSize={50 * 1024 * 1024} // 50MB
          folder="test"
          accessRole={selectedAccessRole}
          multiple={true}
        />
      </div>

      {/* Upload Results */}
      {uploadResults.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Results</h2>
          
          <div className="space-y-3">
            {uploadResults.map((result, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <CheckCircleIcon className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      File uploaded successfully
                    </p>
                    <p className="text-xs text-gray-500">
                      Key: {result.key}
                    </p>
                    <p className="text-xs text-gray-500">
                      Uploaded at: {result.timestamp.toLocaleString()}
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
                      // Example: Call API with the file URL
                      console.log('Calling API with file URL:', result.url);
                      console.log('File Key:', result.key);
                      // You would implement your actual API call here
                      alert(`File ready for API call!\nURL: ${result.url}\nKey: ${result.key}`);
                    }}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    Use File
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* API Flow Documentation */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-800 mb-2">Upload Flow:</h3>
        <ol className="text-sm text-gray-700 space-y-1">
          <li>1. <strong>Presign Request:</strong> POST /api/upload/presign với FileName, ContentType, Folder, AccessRole</li>
          <li>2. <strong>Presign Response:</strong> Nhận UploadUrl, Key, UploadId, ExpiresIn, AccessRole</li>
          <li>3. <strong>Direct Upload:</strong> Upload file trực tiếp đến UploadUrl</li>
          <li>4. <strong>Upload Success:</strong> File được lưu với Key, có thể dùng URL để gọi API khác</li>
        </ol>
        
        <div className="mt-3 p-3 bg-white rounded border">
          <h4 className="text-xs font-medium text-gray-600 mb-1">Example Presign Response:</h4>
          <pre className="text-xs text-gray-500 overflow-x-auto">
{`{
  "Message": "Đã tạo URL tải lên thành công",
  "MessageCode": "PRESIGNED_URL_GENERATED", 
  "Result": {
    "UploadUrl": "http://127.0.0.1:8787/upload/...",
    "Key": "2abe24ce835946d89b73f2a2b2a6e0bd-string",
    "UploadId": "2abe24ce835946d89b73f2a2b2a6e0bd",
    "ExpiresIn": 900,
    "AccessRole": "string"
  }
}`}
          </pre>
        </div>
      </div>
    </div>
  );
}
