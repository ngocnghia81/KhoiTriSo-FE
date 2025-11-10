import { useState, useCallback } from 'react';
import { message } from 'antd';
import { assignmentApiService, ValidationResult, ImportResult } from '../services/assignmentApi';

export const useWordImport = (lessonId: number) => {
  const [file, setFile] = useState<File | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  const validateFile = useCallback(async (file: File): Promise<ValidationResult | null> => {
    try {
      setIsValidating(true);
      
      const result = await assignmentApiService.validateWordFile(file);
      setValidationResult(result);
      return result;
    } catch (error) {
      console.error('Validation error:', error);
      message.error('Lỗi khi validate file: ' + (error as Error).message);
      return null;
    } finally {
      setIsValidating(false);
    }
  }, []);

  const importFile = useCallback(async (file: File): Promise<ImportResult | null> => {
    try {
      setIsImporting(true);
      
      const result = await assignmentApiService.importFromWord(file, lessonId);
      setImportResult(result);
      return result;
    } catch (error) {
      console.error('Import error:', error);
      message.error('Lỗi khi import file: ' + (error as Error).message);
      return null;
    } finally {
      setIsImporting(false);
    }
  }, [lessonId]);

  const handleFileSelect = useCallback(async (selectedFile: File) => {
    // Reset previous results
    setValidationResult(null);
    setImportResult(null);
    setFile(selectedFile);

    // Validate file
    const validation = await validateFile(selectedFile);
    if (validation) {
      if (validation.isValid) {
        message.success(`File hợp lệ! Ước tính ${validation.estimatedQuestionCount} câu hỏi`);
      } else {
        message.error('File không hợp lệ');
      }
    }
  }, [validateFile]);

  const handleImport = useCallback(async () => {
    if (!file || !validationResult?.isValid) {
      message.error('Vui lòng chọn file hợp lệ trước');
      return;
    }

    const result = await importFile(file);
    if (result) {
      message.success(`Import thành công! Đã import ${result.questionsImported} câu hỏi`);
    }
    
    return result;
  }, [file, validationResult, importFile]);

  const resetForm = useCallback(() => {
    setFile(null);
    setValidationResult(null);
    setImportResult(null);
  }, []);

  return {
    file,
    validationResult,
    isValidating,
    isImporting,
    importResult,
    handleFileSelect,
    handleImport,
    resetForm,
    validateFile,
    importFile
  };
};
