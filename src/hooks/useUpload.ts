'use client';

import { useState } from 'react';
import { useAuthenticatedApi } from './useAuthenticatedApi';
import { API_URLS } from '@/lib/api-config';

export type AccessRole = 'GUEST' | 'Student' | 'Teacher' | 'Admin';

export interface PresignRequest {
  fileName: string;
  contentType: string;
  folder?: string;
  accessRole?: AccessRole;
}

export interface PresignResponse {
  UploadUrl: string;
  Key: string;
  UploadId: string;
  ExpiresIn: number;
  AccessRole: string;
  PublicUrl?: string;
}

export interface PresignApiResponse {
  Message: string;
  MessageCode: string;
  Result: PresignResponse;
  Error: string | null;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UploadResult {
  success: boolean;
  key?: string;
  url?: string;
  error?: string;
}

export function useUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const { authenticatedFetch } = useAuthenticatedApi();
  const CLOUDFLARE_WORKER_URL = 'https://khoitriso-upload-worker.quang159258.workers.dev';

  const getPresignUrl = async (request: PresignRequest): Promise<PresignResponse | null> => {
    try {
      const response = await authenticatedFetch(API_URLS.UPLOAD_PRESIGN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          FileName: request.fileName,
          ContentType: request.contentType,
          Folder: request.folder || 'uploads',
          AccessRole: request.accessRole || 'GUEST'
        }),
      });

      if (response.ok) {
        const data: PresignApiResponse = await response.json();
        if (data.Result) {
          // Replace localhost with Cloudflare Workers URL
          let uploadUrl = data.Result.UploadUrl;
          let publicUrl = data.Result.PublicUrl;
          
          // Replace localhost in uploadUrl
          if (uploadUrl.includes('127.0.0.1') || uploadUrl.includes('localhost') || uploadUrl.includes(':8787')) {
            console.log('Replacing localhost URL with Cloudflare Workers URL');
            uploadUrl = uploadUrl.replace(/https?:\/\/[^\/]+/, CLOUDFLARE_WORKER_URL);
          }
          
          // Don't construct publicUrl with folder - worker will return correct FileUrl in response
          // The PublicUrl from backend might not match actual file location
          // We'll use FileUrl from worker response instead
          if (!publicUrl) {
            // Only construct if really needed, but prefer FileUrl from worker response
            const accessPath = (request.accessRole || 'GUEST') === 'GUEST' ? 'public' : (request.accessRole || 'GUEST').toLowerCase();
            publicUrl = `${CLOUDFLARE_WORKER_URL}/files/${accessPath}/${data.Result.Key}`;
            console.log('Constructed publicUrl (fallback):', publicUrl);
          } else {
            // Replace localhost in publicUrl too
            if (publicUrl.includes('127.0.0.1') || publicUrl.includes('localhost') || publicUrl.includes(':8787')) {
              publicUrl = publicUrl.replace(/https?:\/\/[^\/]+/, CLOUDFLARE_WORKER_URL);
            }
          }
          
          return {
            ...data.Result,
            UploadUrl: uploadUrl,
            PublicUrl: publicUrl
          };
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error getting presign URL:', error);
      return null;
    }
  };

  const uploadFile = async (
    file: File,
    presignData: PresignResponse,
    onProgress?: (progress: UploadProgress) => void,
    useBinary: boolean = false
  ): Promise<UploadResult> => {
    setUploading(true);
    setProgress({ loaded: 0, total: file.size, percentage: 0 });

    try {
      const xhr = new XMLHttpRequest();

      // Set up progress tracking
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progressData = {
            loaded: event.loaded,
            total: event.total,
            percentage: Math.round((event.loaded / event.total) * 100)
          };
          setProgress(progressData);
          onProgress?.(progressData);
        }
      });

      // Set up promise for upload completion
      const uploadPromise = new Promise<UploadResult>((resolve, reject) => {
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            // Worker response contains FileUrl which is the correct URL
            let finalUrl = presignData.PublicUrl;
            try {
              const responseText = xhr.responseText;
              if (responseText) {
                const responseJson = JSON.parse(responseText);
                // Worker returns { FileUrl: "...", Key: "...", ... }
                // FileUrl is the correct URL without folder prefix in path
                if (responseJson.FileUrl || responseJson.fileUrl) {
                  finalUrl = responseJson.FileUrl || responseJson.fileUrl;
                  console.log('Got FileUrl from worker response:', finalUrl);
                }
              }
            } catch (e) {
              console.log('No JSON response, using presign PublicUrl:', finalUrl);
            }
            
            // Fallback: construct URL if FileUrl not available
            if (!finalUrl) {
              finalUrl = presignData.UploadUrl.split('/upload/')[0] + '/files/public/' + presignData.Key;
              console.log('Constructed fallback URL:', finalUrl);
            }
            
            resolve({
              success: true,
              key: presignData.Key,
              url: finalUrl
            });
          } else {
            let errorMessage = `Upload failed with status ${xhr.status}`;
            try {
              const errorJson = JSON.parse(xhr.responseText);
              errorMessage = errorJson.details?.error || errorJson.message || errorMessage;
            } catch {
              // Ignore parse errors
            }
            reject(new Error(errorMessage));
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Upload failed'));
        });

        xhr.addEventListener('abort', () => {
          reject(new Error('Upload aborted'));
        });
      });

      // Start upload
      xhr.open('PUT', presignData.UploadUrl);
      
      // Worker expects FormData (c.req.formData()), not raw binary
      // Create FormData and append file - browser will set Content-Type automatically
      const formData = new FormData();
      formData.append('file', file);
      
      // Don't set Content-Type header - browser will set it automatically with boundary for FormData
      xhr.send(formData);

      const result = await uploadPromise;
      return result;

    } catch (error) {
      console.error('Upload error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      };
    } finally {
      setUploading(false);
      setProgress(null);
    }
  };

  const uploadFileWithPresign = async (
    file: File,
    options: {
      folder?: string;
      accessRole?: AccessRole;
      onProgress?: (progress: UploadProgress) => void;
      useBinary?: boolean;
    } = {}
  ): Promise<UploadResult> => {
    try {
      // Step 1: Get presign URL
      const presignData = await getPresignUrl({
        fileName: file.name,
        contentType: file.type || 'application/octet-stream',
        folder: options.folder,
        accessRole: options.accessRole
      });

      if (!presignData) {
        return {
          success: false,
          error: 'Failed to get presign URL'
        };
      }

      // Step 2: Upload file
      const uploadResult = await uploadFile(file, presignData, options.onProgress, options.useBinary);
      
      return uploadResult;

    } catch (error) {
      console.error('Upload with presign error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      };
    }
  };

  const cancelUpload = () => {
    // Note: This would need to be implemented with a ref to the XMLHttpRequest
    // For now, we'll just reset the state
    setUploading(false);
    setProgress(null);
  };

  return {
    uploading,
    progress,
    uploadFileWithPresign,
    getPresignUrl,
    uploadFile,
    cancelUpload
  };
}
