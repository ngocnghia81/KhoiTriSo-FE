import { safeJsonParse, isSuccessfulResponse, extractResult, extractMessage } from '../utils/apiHelpers';

export interface ApiResponse<T> {
  success?: boolean;
  Success?: boolean;
  result?: T;
  Result?: T;
  message?: string;
  Message?: string;
  error?: any;
  Error?: any;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  estimatedQuestionCount: number;
  fileInfo: string;
}

export interface ImportResult {
  assignmentId: number;
  questionsImported: number;
  status: string;
}

class AssignmentApiService {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
    };
  }

  /**
   * Validate Word file before import
   */
  async validateWordFile(file: File): Promise<ValidationResult> {
    const fileBuffer = await file.arrayBuffer();
    
    const response = await fetch(`${this.baseUrl}/api/assignments/validate-word`, {
      method: 'POST',
      headers: {
        ...this.getAuthHeaders(),
        'Content-Type': 'application/octet-stream',
        'X-File-Name': file.name,
        'X-Content-Type': file.type
      },
      body: fileBuffer
    });
    
    const result = await safeJsonParse(response);
    
    if (isSuccessfulResponse(result)) {
      const extracted = extractResult(result);
      if (!extracted) {
        throw new Error('No result data received');
      }
      return extracted;
    } else {
      throw new Error(extractMessage(result));
    }
  }

  /**
   * Import assignment from Word file
   */
  async importFromWord(file: File, lessonId: number): Promise<ImportResult> {
    const fileBuffer = await file.arrayBuffer();
    
    const response = await fetch(`${this.baseUrl}/api/assignments/import-word?lessonId=${lessonId}`, {
      method: 'POST',
      headers: {
        ...this.getAuthHeaders(),
        'Content-Type': 'application/octet-stream',
        'X-File-Name': file.name,
        'X-Content-Type': file.type
      },
      body: fileBuffer
    });
    
    const result = await safeJsonParse(response);
    
    if (isSuccessfulResponse(result)) {
      const extracted = extractResult(result);
      if (!extracted) {
        throw new Error('No result data received');
      }
      return extracted;
    } else {
      throw new Error(extractMessage(result));
    }
  }

  /**
   * Get assignment templates
   */
  async getAssignmentTemplates(): Promise<ApiResponse<any[]>> {
    const response = await fetch(`${this.baseUrl}/api/assignments/templates`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  }

  /**
   * Get assignments by lesson
   */
  async getAssignments(lessonId?: number): Promise<ApiResponse<any[]>> {
    const url = lessonId 
      ? `${this.baseUrl}/api/assignments?lessonId=${lessonId}`
      : `${this.baseUrl}/api/assignments`;
      
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  }
}

export const assignmentApiService = new AssignmentApiService();
