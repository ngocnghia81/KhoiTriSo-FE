'use client';

import { API_URLS } from '@/lib/api-config';

export function ApiUrlTest() {
  const testApiUrl = () => {
    console.log('API Base URL:', process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api');
    console.log('Upload Presign URL:', API_URLS.UPLOAD_PRESIGN);
    console.log('Expected URL:', 'http://localhost:8080/api/upload/presign');
    
    alert(`Upload API URL: ${API_URLS.UPLOAD_PRESIGN}\n\nThis should point to your backend on port 8080.`);
  };

  return (
    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <h3 className="text-sm font-medium text-blue-800 mb-2">API URL Test</h3>
      <p className="text-sm text-blue-700 mb-3">
        Click to verify the upload API URL is pointing to the correct backend port (8080)
      </p>
      <button
        onClick={testApiUrl}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Test API URL
      </button>
    </div>
  );
}
