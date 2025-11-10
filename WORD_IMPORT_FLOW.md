# Word Import Flow Implementation

## Tổng quan
Đã implement flow import bài tập từ file Word với 2 bước:
1. **Validate** file Word trước
2. **Import** bài tập nếu file hợp lệ

## Files đã tạo/cập nhật

### Frontend Components
- `src/components/WordImportManager.tsx` - Component chính để import Word
- `src/hooks/useWordImport.ts` - Custom hook quản lý logic import
- `src/services/assignmentApi.ts` - API service cho assignment
- `src/pages/WordImportDemo.tsx` - Page demo để test

### Backend (đã có sẵn)
- `Controllers/AssignmentController.cs` - Controller với endpoints validate và import

## API Endpoints

### 1. Validate Word File
```
POST /api/assignments/validate-word
Content-Type: multipart/form-data

Body:
- file: File Word (.docx/.doc)
```

**Response:**
```json
{
  "result": {
    "isValid": true,
    "errors": [],
    "warnings": [],
    "estimatedQuestionCount": 10,
    "fileInfo": "Assignment.docx (2.5MB)"
  },
  "message": "File hợp lệ",
  "success": true
}
```

### 2. Import Word File
```
POST /api/assignments/import-word
Content-Type: multipart/form-data

Body:
- file: File Word (.docx/.doc)
- lessonId: number
```

**Response:**
```json
{
  "result": {
    "assignmentId": 123,
    "questionsImported": 10,
    "status": "success"
  },
  "message": "Import thành công",
  "success": true
}
```

## Cách sử dụng

### 1. Import Component
```tsx
import WordImportManager from '../components/WordImportManager';

<WordImportManager 
  lessonId={1}
  onImportSuccess={(result) => {
    console.log('Import successful:', result);
  }}
/>
```

### 2. Sử dụng Hook
```tsx
import { useWordImport } from '../hooks/useWordImport';

const {
  file,
  validationResult,
  isValidating,
  isImporting,
  importResult,
  handleFileSelect,
  handleImport,
  resetForm
} = useWordImport(lessonId);
```

### 3. Sử dụng API Service
```tsx
import { assignmentApiService } from '../services/assignmentApi';

// Validate file
const validation = await assignmentApiService.validateWordFile(file);

// Import file
const result = await assignmentApiService.importFromWord(file, lessonId);
```

## Flow hoạt động

1. **User chọn file** → Component tự động gọi validate API
2. **Validate thành công** → Hiển thị thông tin file và nút Import
3. **User nhấn Import** → Gọi import API
4. **Import thành công** → Hiển thị kết quả và cho phép import file khác

## Error Handling

- **File không hợp lệ**: Hiển thị danh sách lỗi từ validation
- **Import thất bại**: Hiển thị thông báo lỗi
- **Network error**: Hiển thị thông báo lỗi kết nối
- **Unauthorized**: Redirect về login

## Testing

1. Mở page `/word-import-demo`
2. Chọn file Word (.docx)
3. Xem kết quả validation
4. Nếu hợp lệ, nhấn Import
5. Xem kết quả import

## Lưu ý

- Cần có JWT token trong localStorage
- File phải có định dạng .docx hoặc .doc
- lessonId phải tồn tại trong database
- User phải có quyền admin hoặc teacher
