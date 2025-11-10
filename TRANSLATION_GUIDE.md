# Hướng dẫn sử dụng hệ thống đa ngôn ngữ

## Tổng quan

Hệ thống đa ngôn ngữ đã được thiết lập với:
- ✅ Tiếng Việt (vi) - Ngôn ngữ mặc định
- ✅ Tiếng Anh (en)

## Cấu trúc

```
src/
├── locales/
│   ├── vi.ts          # Bản dịch tiếng Việt (nguồn type)
│   ├── en.ts          # Bản dịch tiếng Anh
│   └── navigation.ts  # Bản dịch cho navigation
├── contexts/
│   └── LanguageContext.tsx  # Context quản lý ngôn ngữ
└── hooks/
    └── useTranslation.ts    # Hook để sử dụng translations
```

## Cách sử dụng trong Component

### 1. Import hook

```tsx
import { useTranslation } from '@/hooks/useTranslation';
```

### 2. Sử dụng trong component

```tsx
export default function MyComponent() {
  const { t, language } = useTranslation();
  
  return (
    <div>
      <h1>{t.users.title}</h1>
      <p>{t.users.subtitle}</p>
      <button>{t.common.save}</button>
    </div>
  );
}
```

## Cấu trúc Translation Keys

### Common (Chung)
```tsx
t.common.loading      // "Đang tải..." / "Loading..."
t.common.error        // "Lỗi" / "Error"
t.common.success      // "Thành công" / "Success"
t.common.save         // "Lưu" / "Save"
t.common.cancel       // "Hủy" / "Cancel"
t.common.delete       // "Xóa" / "Delete"
t.common.edit         // "Sửa" / "Edit"
t.common.view         // "Xem" / "View"
t.common.search       // "Tìm kiếm" / "Search"
t.common.filter       // "Lọc" / "Filter"
```

### Users (Người dùng)
```tsx
t.users.title              // "Quản lý Người dùng" / "User Management"
t.users.subtitle           // Subtitle
t.users.searchPlaceholder  // Placeholder cho search
t.users.name               // "Họ tên" / "Full Name"
t.users.email              // "Email"
t.users.role               // "Vai trò" / "Role"
t.users.status             // "Trạng thái" / "Status"
t.users.active             // "Hoạt động" / "Active"
t.users.inactive           // "Không hoạt động" / "Inactive"
```

### Courses (Khóa học)
```tsx
t.courses.title            // "Quản lý Khóa học" / "Course Management"
t.courses.courseName       // "Tên khóa học" / "Course Name"
t.courses.instructor       // "Giảng viên" / "Instructor"
t.courses.students         // "Học viên" / "Students"
```

### Books (Sách)
```tsx
t.books.title              // "Quản lý Sách điện tử" / "E-Book Management"
t.books.bookName           // "Tên sách" / "Book Name"
t.books.author             // "Tác giả" / "Author"
```

## Thêm Translation mới

### 1. Thêm vào file vi.ts

```typescript
export const vi = {
  // ... existing translations
  
  // Module mới
  myModule: {
    title: 'Tiêu đề',
    description: 'Mô tả',
    action: 'Hành động',
  },
};
```

### 2. Thêm vào file en.ts (phải khớp cấu trúc)

```typescript
export const en: Translations = {
  // ... existing translations
  
  // Module mới
  myModule: {
    title: 'Title',
    description: 'Description',
    action: 'Action',
  },
};
```

## Chuyển đổi ngôn ngữ

Người dùng có thể chuyển đổi ngôn ngữ thông qua component `LanguageSwitcher` trong sidebar.

```tsx
// Component LanguageSwitcher đã được tích hợp sẵn trong DashboardSidebar
<LanguageSwitcher />
```

## Ví dụ hoàn chỉnh

### Trước khi dùng translation:

```tsx
export default function UsersPage() {
  return (
    <div>
      <h1>Quản lý người dùng</h1>
      <button>Tạo người dùng</button>
      <p>Đang tải...</p>
    </div>
  );
}
```

### Sau khi dùng translation:

```tsx
import { useTranslation } from '@/hooks/useTranslation';

export default function UsersPage() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t.users.title}</h1>
      <button>{t.users.create}</button>
      <p>{t.common.loading}</p>
    </div>
  );
}
```

## Các trang đã được cập nhật

- ✅ `/dashboard/users` - Quản lý người dùng
- ✅ `/dashboard/instructors` - Quản lý giảng viên
- ✅ `/dashboard/users/analytics` - Thống kê người dùng
- ✅ Sidebar navigation

## Các trang cần cập nhật

Bạn cần áp dụng translation cho các trang sau:

1. `/dashboard` - Dashboard chính
2. `/dashboard/courses` - Quản lý khóa học
3. `/dashboard/books` - Quản lý sách
4. `/dashboard/categories` - Quản lý danh mục
5. `/dashboard/assignments` - Quản lý bài tập
6. `/dashboard/forum` - Quản lý diễn đàn
7. `/dashboard/settings` - Cài đặt
8. Và các trang khác...

## Best Practices

1. **Luôn sử dụng translation keys** thay vì hardcode text
2. **Đặt tên keys rõ ràng** và có cấu trúc
3. **Nhóm theo module** để dễ quản lý
4. **Kiểm tra cả 2 ngôn ngữ** sau khi thêm translation mới
5. **Sử dụng TypeScript** để đảm bảo type safety

## Lưu ý

- File `vi.ts` là nguồn type (`Translations`), nên thêm vào đây trước
- File `en.ts` phải khớp hoàn toàn cấu trúc với `vi.ts`
- Nếu thiếu key nào, TypeScript sẽ báo lỗi
- Ngôn ngữ được lưu trong localStorage và persist qua các session
