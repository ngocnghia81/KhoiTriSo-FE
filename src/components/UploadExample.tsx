'use client';

import { useState } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export function UploadExample() {
  const [uploadResults, setUploadResults] = useState<Array<{
    key: string;
    url: string;
    timestamp: Date;
  }>>([]);

  const handleUploadSuccess = (result: { key: string; url: string }) => {
    setUploadResults(prev => [...prev, {
      ...result,
      timestamp: new Date()
    }]);
  };

  const handleUploadError = (error: string) => {
    console.error('Upload error:', error);
    // You could add a toast notification here
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">File Upload Example</h1>
        <p className="text-gray-600">
          This example demonstrates the complete upload flow: FE calls BE for presign URL, 
          FE uploads file and receives response, then FE can call API with the file URL.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Files</h2>
        
        <FileUpload
          onUploadComplete={handleUploadSuccess}
          onUploadError={handleUploadError}
          accept="*"
          maxSize={50 * 1024 * 1024} // 50MB
          folder="examples"
          accessRole="GUEST"
          multiple={true}
        />
      </div>

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
                      // You would implement your actual API call here
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

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-800 mb-2">Upload Flow:</h3>
        <ol className="text-sm text-blue-700 space-y-1">
          <li>1. Frontend calls <code className="bg-blue-100 px-1 rounded">/api/upload/presign</code> to get presign URL</li>
          <li>2. Frontend uploads file directly to the presign URL</li>
          <li>3. Frontend receives upload confirmation with file key/URL</li>
          <li>4. Frontend can now call other APIs passing the file URL</li>
        </ol>
      </div>
    </div>
  );
}
