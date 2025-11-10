# Book Frontend Integration

## Tổng quan
Đã tích hợp hoàn chỉnh Book API vào frontend cho học viên với các tính năng:
- Khám phá và tìm kiếm sách
- Kích hoạt sách bằng mã
- Đọc sách và luyện tập
- Quản lý sách cá nhân

## Files đã tạo

### 1. API Service (`src/services/bookApi.ts`)
- `BookApiService` class với tất cả API methods
- Type definitions cho Book, BookChapter, BookQuestion
- Error handling và retry mechanism
- Data mapping từ PascalCase sang camelCase

### 2. Hooks (`src/hooks/useBooks.ts`)
- `useBooks` - Lấy danh sách sách với filters
- `useBook` - Lấy chi tiết một sách
- `useBookChapters` - Lấy danh sách chương
- `useBookQuestions` - Lấy câu hỏi luyện tập
- `useMyBooks` - Lấy sách đã kích hoạt
- `useBookActivation` - Kích hoạt sách

### 3. Components
- `BookList` - Danh sách sách với filters và search
- `BookActivation` - Form kích hoạt sách bằng mã
- `BookReader` - Interface đọc sách và luyện tập
- `BooksPage` - Trang chính tích hợp tất cả

## Tính năng chính

### 📚 Thư viện sách
- Tìm kiếm sách theo tên, tác giả
- Lọc theo danh mục, giá cả
- Sắp xếp theo nhiều tiêu chí
- Hiển thị thông tin chi tiết

### 🔑 Kích hoạt sách
- Nhập mã kích hoạt
- Validate mã trước khi kích hoạt
- Thông báo thành công/thất bại
- Hướng dẫn sử dụng

### 📖 Đọc sách
- Danh sách chương
- Đọc nội dung từng chương
- Luyện tập với câu hỏi
- Navigation dễ dàng

### 👤 Sách của tôi
- Danh sách sách đã kích hoạt
- Truy cập nhanh vào sách
- Thống kê cá nhân

## API Endpoints được sử dụng

### Books
- `GET /api/books` - Danh sách sách
- `GET /api/books/{id}` - Chi tiết sách
- `GET /api/books/{id}/chapters` - Danh sách chương
- `GET /api/books/{id}/questions` - Câu hỏi

### Activation
- `GET /api/books/activation-codes/{code}/validate` - Validate mã
- `POST /api/books/activate` - Kích hoạt sách
- `GET /api/books/my-books` - Sách của tôi

## Cách sử dụng

### 1. Import và sử dụng
```tsx
import BooksPage from '../pages/BooksPage';

// Trong router
<Route path="/books" element={<BooksPage />} />
```

### 2. Sử dụng hooks riêng lẻ
```tsx
import { useBooks, useBookActivation } from '../hooks/useBooks';

const { books, loading, error } = useBooks({ search: 'toán' });
const { validateCode, activateBook } = useBookActivation();
```

### 3. Sử dụng API service trực tiếp
```tsx
import { bookApiService } from '../services/bookApi';

const books = await bookApiService.getBooks({ search: 'toán' });
const result = await bookApiService.activateBook('ABC123');
```

## Error Handling

- **Retry mechanism** cho network failures
- **Safe JSON parsing** tránh lỗi parse
- **Detailed error messages** cho debugging
- **Loading states** cho UX tốt hơn
- **Empty states** khi không có data

## Responsive Design

- **Mobile-first** approach
- **Grid layout** cho danh sách sách
- **Collapsible sidebar** trên mobile
- **Touch-friendly** buttons và interactions

## Authentication

- Sử dụng JWT token từ localStorage
- Auto-refresh token khi expired
- Redirect về login khi unauthorized

## Testing

### Manual Testing
1. Mở `/books` page
2. Test tìm kiếm và filter
3. Test kích hoạt sách với mã hợp lệ
4. Test đọc sách và luyện tập
5. Test responsive trên mobile

### API Testing
```bash
# Test get books
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:8080/api/books?search=toán"

# Test validate code
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:8080/api/books/activation-codes/ABC123/validate"

# Test activate book
curl -X POST \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"activationCode":"ABC123"}' \
  "http://localhost:8080/api/books/activate"
```

## Future Enhancements

- [ ] Offline reading support
- [ ] Bookmark và notes
- [ ] Progress tracking
- [ ] Social features (reviews, ratings)
- [ ] Advanced search filters
- [ ] Reading statistics
- [ ] Export/print functionality
