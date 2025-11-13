'use client';

import { useState, useRef, useCallback } from 'react';
import { useUpload } from '@/hooks/useUpload';
import { 
  CloudArrowUpIcon, 
  DocumentIcon, 
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { AccessRole } from '@/hooks/useUpload';

export interface FileUploadProps {
  onUploadComplete?: (result: { key: string; url: string }) => void;
  onUploadError?: (error: string) => void;
  accept?: string;
  maxSize?: number; // in bytes
  folder?: string;
  accessRole?: AccessRole;
  className?: string;
  disabled?: boolean;
  multiple?: boolean;
  useBinary?: boolean; // Use binary upload instead of FormData
}

export function FileUpload({
  onUploadComplete,
  onUploadError,
  accept = '*',
  maxSize = 10 * 1024 * 1024, // 10MB default
  folder = 'uploads',
  accessRole = 'GUEST',
  className = '',
  disabled = false,
  multiple = false,
  useBinary = false
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadResults, setUploadResults] = useState<Array<{
    file: File;
    result: { success: boolean; key?: string; url?: string; error?: string };
  }>>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploading, progress, uploadFileWithPresign } = useUpload();

  const validateFile = (file: File): string | null => {
    if (file.size > maxSize) {
      return `File ${file.name} is too large. Maximum size is ${Math.round(maxSize / 1024 / 1024)}MB`;
    }
    return null;
  };

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return;

    const fileArray = Array.from(files);
    const validFiles: File[] = [];
    const errors: string[] = [];

    fileArray.forEach(file => {
      const error = validateFile(file);
      if (error) {
        errors.push(error);
      } else {
        validFiles.push(file);
      }
    });

    if (errors.length > 0) {
      onUploadError?.(errors.join(', '));
    }

    if (validFiles.length > 0) {
      if (multiple) {
        setSelectedFiles(prev => [...prev, ...validFiles]);
      } else {
        setSelectedFiles(validFiles);
      }
    }
  }, [maxSize, multiple, onUploadError]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (disabled) return;
    
    handleFiles(e.dataTransfer.files);
  }, [disabled, handleFiles]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  }, [handleFiles]);

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setUploadResults(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async () => {
    if (selectedFiles.length === 0) return;

    const results = [];
    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      const result = await uploadFileWithPresign(file, {
        folder,
        accessRole,
        useBinary,
        onProgress: (progress) => {
          // You could add individual file progress tracking here
        }
      });

      results.push({ file, result });

      if (result.success) {
        onUploadComplete?.({ key: result.key!, url: result.url! });
      } else {
        onUploadError?.(result.error || 'Upload failed');
      }
    }

    setUploadResults(results);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Drop Zone */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
          dragActive 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileInput}
          className="hidden"
          disabled={disabled}
        />
        
        <div className="text-center">
          <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-4">
            <p className="text-sm text-gray-600">
              <span className="font-medium text-blue-600 hover:text-blue-500">
                Click to upload
              </span>
              {' '}or drag and drop
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {accept !== '*' ? `Accept: ${accept}` : 'Any file type'} • Max {formatFileSize(maxSize)}
            </p>
          </div>
        </div>
      </div>

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Selected Files:</h4>
          {selectedFiles.map((file, index) => {
            const uploadResult = uploadResults.find(r => r.file === file);
            return (
              <div key={`${file.name}-${index}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <DocumentIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {uploadResult && (
                    <>
                      {uploadResult.result.success ? (
                        <CheckCircleIcon className="h-5 w-5 text-green-500" />
                      ) : (
                        <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
                      )}
                    </>
                  )}
                  
                  <button
                    onClick={() => removeFile(index)}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    disabled={uploading}
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload Progress */}
      {uploading && progress && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Uploading...</span>
            <span>{progress.percentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Upload Button */}
      {selectedFiles.length > 0 && !uploading && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            uploadFiles();
          }}
          disabled={disabled}
          className="w-full inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <CloudArrowUpIcon className="h-4 w-4 mr-2" />
          Upload {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''}
        </button>
      )}

      {/* Upload Results */}
      {uploadResults.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Upload Results:</h4>
          {uploadResults.map((result, index) => (
            <div key={index} className={`p-3 rounded-lg ${
              result.result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center space-x-2">
                {result.result.success ? (
                  <CheckCircleIcon className="h-5 w-5 text-green-500" />
                ) : (
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
                )}
                <div>
                  <p className="text-sm font-medium text-gray-900">{result.file.name}</p>
                  {result.result.success ? (
                    <p className="text-xs text-green-600">Upload successful</p>
                  ) : (
                    <p className="text-xs text-red-600">{result.result.error}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
