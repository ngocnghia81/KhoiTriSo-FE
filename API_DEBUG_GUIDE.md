# API Error Debugging Guide

## Lỗi "Unexpected end of JSON input"

### Nguyên nhân
Lỗi này xảy ra khi:
1. Server trả về response rỗng
2. Server trả về response không phải JSON (HTML, text, etc.)
3. Response bị cắt ngắn do network issues
4. Server trả về status code lỗi nhưng client vẫn cố parse JSON

### Giải pháp đã implement

#### 1. Safe JSON Parsing (`src/utils/apiHelpers.ts`)
```typescript
export async function safeJsonParse<T = any>(response: Response): Promise<T> {
  // Check if response is ok
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  // Check if response has content-type JSON
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    throw new Error('Response is not JSON');
  }
  
  // Check if response has content
  const text = await response.text();
  if (!text.trim()) {
    throw new Error('Empty response');
  }
  
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(`Invalid JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
```

#### 2. Enhanced Error Handling
- Kiểm tra response status trước khi parse
- Kiểm tra content-type header
- Kiểm tra response có content không
- Wrap JSON.parse trong try-catch

#### 3. API Debugger Component
Sử dụng `ApiDebugger` component để debug:
```tsx
import ApiDebugger from '../components/ApiDebugger';

<ApiDebugger baseUrl="http://localhost:8080" />
```

### Cách debug

#### 1. Kiểm tra Network Tab
- Mở DevTools → Network
- Xem response status code
- Xem response headers (content-type)
- Xem response body

#### 2. Sử dụng API Debugger
- Test Courses API để kiểm tra kết nối
- Test Auth API để kiểm tra authentication
- Xem debug information chi tiết

#### 3. Kiểm tra Server Logs
```bash
# Kiểm tra logs của backend
tail -f KhoiTriSo/Logs/access-20251023.log
tail -f KhoiTriSo/Logs/error-20251023.log
```

### Common Issues & Solutions

#### Issue 1: 404 Not Found
```
HTTP error! status: 404
```
**Solution:** Kiểm tra URL endpoint có đúng không

#### Issue 2: 401 Unauthorized
```
HTTP error! status: 401
```
**Solution:** Kiểm tra token authentication

#### Issue 3: 500 Internal Server Error
```
HTTP error! status: 500
```
**Solution:** Kiểm tra server logs, có thể có lỗi trong backend

#### Issue 4: Empty Response
```
Empty response
```
**Solution:** Server không trả về data, kiểm tra backend logic

#### Issue 5: Non-JSON Response
```
Response is not JSON
```
**Solution:** Server trả về HTML error page thay vì JSON

### Updated Files

1. **`src/utils/apiHelpers.ts`** - Safe JSON parsing utilities
2. **`src/hooks/useCourses.ts`** - Updated to use safe parsing
3. **`src/services/assignmentApi.ts`** - Updated API service
4. **`src/hooks/useWordImport.ts`** - Updated hook
5. **`src/components/ApiDebugger.tsx`** - Debug component
6. **`src/pages/WordImportDemo.tsx`** - Updated demo page

### Testing

1. Mở `/word-import-demo`
2. Sử dụng API Debugger để test connection
3. Kiểm tra console logs để xem error details
4. Test với file Word để verify flow

### Best Practices

1. **Luôn kiểm tra response.ok** trước khi parse JSON
2. **Kiểm tra content-type** header
3. **Sử dụng try-catch** cho JSON.parse
4. **Log error details** để debug
5. **Sử dụng API Debugger** khi có vấn đề
6. **Kiểm tra server logs** để xem backend errors
