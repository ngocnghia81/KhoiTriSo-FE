'use client';

import { useState } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export function BinaryUploadTest() {
  const [uploadResults, setUploadResults] = useState<Array<{
    key: string;
    url: string;
    timestamp: Date;
    method: 'binary' | 'formdata';
  }>>([]);
  const [useBinary, setUseBinary] = useState(true);

  const handleUploadSuccess = (result: { key: string; url: string }) => {
    setUploadResults(prev => [...prev, {
      ...result,
      timestamp: new Date(),
      method: useBinary ? 'binary' : 'formdata'
    }]);
  };

  const handleUploadError = (error: string) => {
    console.error('Upload error:', error);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Binary Upload Test</h1>
        <p className="text-gray-600">
          Test upload với binary data như trong hình ảnh API client
        </p>
      </div>

      {/* Upload Method Selection */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Chọn phương thức upload</h2>
        
        <div className="flex items-center space-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="uploadMethod"
              checked={useBinary}
              onChange={() => setUseBinary(true)}
              className="mr-2"
            />
            <span className="text-sm font-medium">Binary Upload (PUT)</span>
            <span className="ml-2 text-xs text-gray-500">Gửi file trực tiếp như binary data</span>
          </label>
          
          <label className="flex items-center">
            <input
              type="radio"
              name="uploadMethod"
              checked={!useBinary}
              onChange={() => setUseBinary(false)}
              className="mr-2"
            />
            <span className="text-sm font-medium">FormData Upload (POST)</span>
            <span className="ml-2 text-xs text-gray-500">Gửi file qua multipart form</span>
          </label>
        </div>

        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-sm font-medium text-blue-800 mb-2">
            {useBinary ? 'Binary Upload' : 'FormData Upload'}
          </h3>
          <div className="text-sm text-blue-700 space-y-1">
            {useBinary ? (
              <>
                <p>• Method: <code className="bg-blue-100 px-1 rounded">PUT</code></p>
                <p>• Content-Type: <code className="bg-blue-100 px-1 rounded">file.type</code></p>
                <p>• Body: <code className="bg-blue-100 px-1 rounded">file (binary)</code></p>
                <p>• Giống như trong hình ảnh API client bạn gửi</p>
              </>
            ) : (
              <>
                <p>• Method: <code className="bg-blue-100 px-1 rounded">POST</code></p>
                <p>• Content-Type: <code className="bg-blue-100 px-1 rounded">multipart/form-data</code></p>
                <p>• Body: <code className="bg-blue-100 px-1 rounded">FormData</code></p>
                <p>• Phương thức truyền thống</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Upload Component */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload File</h2>
        
        <FileUpload
          onUploadComplete={handleUploadSuccess}
          onUploadError={handleUploadError}
          accept="*"
          maxSize={50 * 1024 * 1024} // 50MB
          folder="test"
          accessRole="GUEST"
          multiple={false}
          useBinary={useBinary}
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
                      File uploaded successfully ({result.method})
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
                        method: result.method,
                        timestamp: result.timestamp
                      });
                      alert(`File uploaded via ${result.method}!\nKey: ${result.key}\nURL: ${result.url}`);
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

      {/* API Response Info */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-800 mb-2">Expected API Response:</h3>
        <div className="text-sm text-gray-700">
          <p>Khi upload thành công, API sẽ trả về response như trong hình ảnh:</p>
          <pre className="mt-2 p-3 bg-white rounded border text-xs overflow-x-auto">
{`{
  "Key": "f56cd4a8e90647bf88b85b5944ac516d-string",
  "FileType": "image/png", 
  "FileSize": 259862,
  "AccessRole": "GUEST",
  "FileUrl": "https://khoitriso-upload-worker.quang159258.workers.dev/files/public/...",
  "Language": "en"
}`}
          </pre>
        </div>
      </div>
    </div>
  );
}
