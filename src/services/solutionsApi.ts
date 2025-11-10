import { safeJsonParse, isSuccessfulResponse, extractResult, extractMessage, retryRequest, fetchWithAutoRefresh } from '@/utils/apiHelpers';

export interface Solution {
  id: number;
  questionContent: string;
  explanationContent?: string;
  videoUrl?: string;
  questionType: number;
  difficultyLevel: number;
  options?: any[];
}

class SolutionsApiService {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  private CLOUDFLARE_WORKER_URL = 'https://khoitriso-upload-worker.quang159258.workers.dev';

  private getAuthHeaders() {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    if (!token) return {} as HeadersInit;
    return { 'Authorization': `Bearer ${token}` } as HeadersInit;
  }

  async getSolutions(params: { bookId?: number; questionId?: number; page?: number; pageSize?: number } = {}): Promise<any> {
    const urlParams = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) urlParams.append(k, String(v));
    });
    const url = `${this.baseUrl}/api/solutions${urlParams.toString() ? `?${urlParams.toString()}` : ''}`;

    const response = await retryRequest(async () => fetchWithAutoRefresh(url, {
      headers: { 'Content-Type': 'application/json', ...this.getAuthHeaders() }
    }));

    const parsed = await safeJsonParse(response);
    if (!isSuccessfulResponse(parsed)) throw new Error(extractMessage(parsed));
    return extractResult(parsed);
  }

  async updateSolution(questionId: number, data: { explanationContent?: string; videoUrl?: string }): Promise<any> {
    const response = await retryRequest(async () => fetchWithAutoRefresh(`${this.baseUrl}/api/solutions/${questionId}`, {
      method: 'PUT',
      headers: { ...this.getAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }));

    const parsed = await safeJsonParse(response);
    if (!isSuccessfulResponse(parsed)) throw new Error(extractMessage(parsed));
    return extractResult(parsed);
  }

  /**
   * Get presign URL from backend
   */
  private async getPresignUrl(fileName: string, contentType: string, folder: string = 'solution-videos', accessRole: string = 'GUEST'): Promise<{ uploadUrl: string; fileKey: string; publicUrl: string }> {
    const response = await retryRequest(async () => fetchWithAutoRefresh(`${this.baseUrl}/api/Upload/presign`, {
      method: 'POST',
      headers: { ...this.getAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ FileName: fileName, ContentType: contentType, Folder: folder, AccessRole: accessRole })
    }));

    const parsed = await safeJsonParse(response);
    console.log('Presign response:', parsed);
    
    const messageCode = parsed.MessageCode || parsed.messageCode;
    const hasResult = parsed.result || parsed.Result;
    const isSuccess = (messageCode === 'SUCCESS' || 
                      messageCode === 'PRESIGNED_URL_GENERATED' ||
                      (parsed.Message && parsed.Message.includes('thành công'))) &&
                      hasResult;
    
    if (!isSuccess) {
      console.error('Presign API error:', parsed);
      throw new Error(extractMessage(parsed));
    }
    
    const result = extractResult(parsed);
    console.log('Presign result:', result);
    
    let uploadUrl = result?.uploadUrl || result?.UploadUrl || result?.presignedUrl || result?.PresignedUrl;
    const fileKey = result?.fileKey || result?.FileKey || result?.key || result?.Key;
    let publicUrl = result?.publicUrl || result?.PublicUrl;
    
    if (!uploadUrl) {
      throw new Error('UploadUrl not returned from presign API');
    }
    
    // Replace localhost with Cloudflare Workers URL
    if (uploadUrl.includes('127.0.0.1') || uploadUrl.includes('localhost') || uploadUrl.includes(':8787')) {
      console.log('Replacing localhost URL with Cloudflare Workers URL');
      uploadUrl = uploadUrl.replace(/https?:\/\/[^\/]+/, this.CLOUDFLARE_WORKER_URL);
    }
    
    // Construct public URL if not provided
    if (!publicUrl) {
      const accessPath = accessRole === 'GUEST' ? 'public' : accessRole.toLowerCase();
      publicUrl = `${this.CLOUDFLARE_WORKER_URL}/files/${accessPath}/${folder}/${fileKey}`;
      console.log('Constructed publicUrl:', publicUrl);
    } else {
      // Replace localhost in publicUrl too
      if (publicUrl.includes('127.0.0.1') || publicUrl.includes('localhost') || publicUrl.includes(':8787')) {
        publicUrl = publicUrl.replace(/https?:\/\/[^\/]+/, this.CLOUDFLARE_WORKER_URL);
      }
    }
    
    return {
      uploadUrl,
      fileKey: fileKey || '',
      publicUrl
    };
  }

  /**
   * Upload video file using presign URL
   * Returns the public URL of the uploaded file
   */
  async uploadVideo(file: File, folder: string = 'solution-videos', accessRole: string = 'GUEST'): Promise<string> {
    // Step 1: Get presign URL
    const { uploadUrl, publicUrl } = await this.getPresignUrl(file.name, file.type, folder, accessRole);
    
    console.log('Uploading video to:', uploadUrl);
    console.log('File size:', file.size, 'bytes');
    console.log('File type:', file.type);
    console.log('File name:', file.name);
    
    // Step 2: Upload file using XMLHttpRequest
    // Worker expects FormData (c.req.formData()), not raw binary
    return new Promise<string>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      xhr.open('PUT', uploadUrl);
      
      // Worker reads from FormData: const formData = await c.req.formData(); const file = formData.get('file')
      // So we need to send as multipart/form-data
      const formData = new FormData();
      formData.append('file', file);
      
      // Don't set Content-Type header - browser will set it automatically with boundary for FormData
      
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          // Try to parse response JSON to get FileUrl from worker
          let finalUrl = publicUrl;
          try {
            const responseText = xhr.responseText;
            if (responseText) {
              const responseJson = JSON.parse(responseText);
              // Worker returns { FileUrl: "...", ... }
              if (responseJson.FileUrl || responseJson.fileUrl) {
                finalUrl = responseJson.FileUrl || responseJson.fileUrl;
                console.log('Got FileUrl from worker response:', finalUrl);
              }
            }
          } catch (e) {
            console.log('No JSON response, using constructed publicUrl:', finalUrl);
          }
          console.log('Video uploaded successfully, final URL:', finalUrl);
          resolve(finalUrl);
        } else {
          let errorMessage = `Upload failed: ${xhr.status} ${xhr.statusText}`;
          
          try {
            const errorJson = JSON.parse(xhr.responseText);
            console.error('Upload error details:', errorJson);
            console.error('Error messageCode:', errorJson.messageCode);
            console.error('Error details:', errorJson.details);
            
            if (errorJson.details?.error) {
              errorMessage = errorJson.details.error;
            } else if (errorJson.message) {
              errorMessage = errorJson.message;
            } else if (errorJson.errorCode) {
              errorMessage = errorJson.errorCode;
            }
            
            // Add specific error messages for common issues
            if (errorJson.messageCode === 'MISSING_TOKEN' || errorJson.errorCode === 'MISSING_UPLOAD_TOKEN') {
              errorMessage = 'JWT token không hợp lệ. Vui lòng kiểm tra cấu hình JWT secret giữa backend và worker.';
            } else if (errorJson.messageCode === 'INVALID_FILE_KEY') {
              errorMessage = 'File key không khớp với token.';
            } else if (errorJson.messageCode === 'INVALID_FILE_FORMAT') {
              errorMessage = errorJson.details?.message || 'Định dạng file không hợp lệ.';
            } else if (errorJson.messageCode === 'UPLOAD_FAILED') {
              errorMessage = errorJson.details?.error || 'Upload thất bại. Vui lòng thử lại.';
            }
          } catch {
            console.error('Upload failed:', {
              status: xhr.status,
              statusText: xhr.statusText,
              responseText: xhr.responseText
            });
          }
          
          reject(new Error(errorMessage));
        }
      };
      
      xhr.onerror = () => {
        reject(new Error('Upload failed: Network error'));
      };
      
      xhr.onabort = () => {
        reject(new Error('Upload aborted'));
      };
      
      // Send FormData - worker expects c.req.formData()
      xhr.send(formData);
    });
  }
}

export const solutionsApi = new SolutionsApiService();
