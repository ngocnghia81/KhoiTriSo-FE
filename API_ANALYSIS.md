# Phân tích API cần thiết cho hệ thống Khởi Trí Số

## Tổng quan
Dựa trên mô tả chi tiết về hệ thống giáo dục trực tuyến "Khởi Trí Số", đây là phân tích các API controllers hiện có và các API cần bổ sung.

## API Controllers hiện có

### ✅ Đã có và hoạt động tốt:
1. **AuthController** - Xác thực và phân quyền
2. **CategoryController** - Quản lý danh mục
3. **CoursesController** - Quản lý khóa học
4. **LessonsController** - Quản lý bài học
5. **LiveClassesController** - Lớp học trực tuyến
6. **UserController** - Quản lý người dùng cơ bản
7. **AdminController** - Quản lý admin
8. **AnalyticsController** - Thống kê và báo cáo
9. **NotificationController** - Thông báo
10. **SystemSettingController** - Cài đặt hệ thống
11. **UploadController** - Upload file
12. **CourseTestController** - Bài tập và kiểm tra
13. **ReviewsController** - Đánh giá
14. **DiscussionController** - Thảo luận bài học

## API Controllers cần bổ sung

### ✅ **Đã hoàn thành:**

#### **ForumController** - Diễn đàn MongoDB (HOÀN THÀNH)
- ✅ **MongoDB Integration** - Sử dụng MongoDB cho Forum data
- ✅ **Full CRUD Operations** - Questions, Answers, Comments
- ✅ **Advanced Features** - Vote system, Bookmarks, Categories, Tags
- ✅ **Search & Filter** - Text search, category filter, tag filter
- ✅ **Pagination** - Efficient data loading
- ✅ **Soft Delete** - Data preservation
- ✅ **Real-time Stats** - Vote counts, view counts, answer counts
- ✅ **Admin Controls** - Category và Tag management
- ✅ **User Experience** - Bookmark, vote, comment features

**Tính năng chính:**
- **Questions Management** - Tạo, sửa, xóa, tìm kiếm câu hỏi
- **Answers System** - Trả lời, chấp nhận câu trả lời tốt nhất
- **Comments** - Bình luận trên câu hỏi và câu trả lời
- **Vote System** - Vote up/down với unique constraint
- **Bookmark System** - Đánh dấu câu hỏi quan tâm
- **Categories & Tags** - Phân loại và gắn thẻ
- **Statistics** - Thống kê forum tổng quan

### 🔴 Cần thiết và quan trọng:

#### 1. **BooksController** - Quản lý sách điện tử
```csharp
[ApiController]
[Route("api/books")]
public class BooksController : ControllerBase
{
    // GET /api/books - Danh sách sách
    // GET /api/books/{id} - Chi tiết sách
    // POST /api/books - Tạo sách mới
    // PUT /api/books/{id} - Cập nhật sách
    // DELETE /api/books/{id} - Xóa sách
    
    // GET /api/books/{id}/questions - Câu hỏi trong sách
    // POST /api/books/{id}/questions - Thêm câu hỏi
    // PUT /api/books/{id}/questions/{questionId} - Cập nhật câu hỏi
    
    // GET /api/books/{id}/solutions - Lời giải video/text
    // POST /api/books/{id}/solutions - Thêm lời giải
    // PUT /api/books/{id}/solutions/{solutionId} - Cập nhật lời giải
    
    // GET /api/books/{id}/activation-codes - Mã kích hoạt
    // POST /api/books/{id}/activation-codes/generate - Tạo mã kích hoạt
    // PUT /api/books/{id}/activation-codes/{code}/activate - Kích hoạt mã
    // GET /api/books/activation-codes/{code}/validate - Kiểm tra mã
}
```

#### 2. **ActivationCodeController** - Quản lý mã kích hoạt
```csharp
[ApiController]
[Route("api/activation-codes")]
public class ActivationCodeController : ControllerBase
{
    // GET /api/activation-codes - Danh sách mã
    // GET /api/activation-codes/{code} - Chi tiết mã
    // POST /api/activation-codes/validate - Kiểm tra mã
    // POST /api/activation-codes/{code}/activate - Kích hoạt mã
    // GET /api/activation-codes/{code}/usage-history - Lịch sử sử dụng
    
    // POST /api/activation-codes/bulk-generate - Tạo hàng loạt
    // PUT /api/activation-codes/{id}/extend - Gia hạn mã
    // DELETE /api/activation-codes/{id} - Vô hiệu hóa mã
}
```

#### **ForumController** - Diễn đàn và câu hỏi (✅ ĐÃ HOÀN THÀNH)
```csharp
[ApiController]
[Route("api/forum")]
public class ForumController : ControllerBase
{
    // === QUESTIONS ===
    // GET /api/forum/questions - Danh sách câu hỏi (với filter, search, pagination)
    // GET /api/forum/questions/{id} - Chi tiết câu hỏi (tự động tăng views)
    // POST /api/forum/questions - Tạo câu hỏi mới
    // PUT /api/forum/questions/{id} - Cập nhật câu hỏi
    // DELETE /api/forum/questions/{id} - Xóa câu hỏi (soft delete)
    
    // === ANSWERS ===
    // GET /api/forum/questions/{questionId}/answers - Câu trả lời của câu hỏi
    // POST /api/forum/questions/{questionId}/answers - Trả lời câu hỏi
    // PUT /api/forum/answers/{id} - Cập nhật câu trả lời
    // DELETE /api/forum/answers/{id} - Xóa câu trả lời
    // POST /api/forum/answers/{id}/accept - Chấp nhận câu trả lời tốt nhất
    
    // === COMMENTS ===
    // GET /api/forum/{parentType}/{parentId}/comments - Bình luận (question/answer)
    // POST /api/forum/comments - Tạo bình luận
    // PUT /api/forum/comments/{id} - Cập nhật bình luận
    // DELETE /api/forum/comments/{id} - Xóa bình luận
    
    // === CATEGORIES ===
    // GET /api/forum/categories - Danh mục forum
    // POST /api/forum/categories - Tạo danh mục (Admin only)
    // PUT /api/forum/categories/{id} - Cập nhật danh mục (Admin only)
    // DELETE /api/forum/categories/{id} - Xóa danh mục (Admin only)
    
    // === TAGS ===
    // GET /api/forum/tags - Tags phổ biến
    // POST /api/forum/tags - Tạo tag (Admin only)
    // PUT /api/forum/tags/{id} - Cập nhật tag (Admin only)
    // DELETE /api/forum/tags/{id} - Xóa tag (Admin only)
    
    // === VOTES ===
    // POST /api/forum/votes - Vote up/down (questions, answers, comments)
    // GET /api/forum/{targetType}/{targetId}/votes - Lấy số vote
    
    // === BOOKMARKS ===
    // POST /api/forum/bookmarks - Bookmark câu hỏi
    // DELETE /api/forum/bookmarks/{questionId} - Bỏ bookmark
    // GET /api/forum/bookmarks - Danh sách bookmark của user
    // GET /api/forum/questions/{questionId}/bookmarked - Kiểm tra bookmark status
    
    // === STATISTICS ===
    // GET /api/forum/stats - Thống kê forum tổng quan
}
```

#### 3. **StaticPageController** - Quản lý trang tĩnh
```csharp
[ApiController]
[Route("api/static-pages")]
public class StaticPageController : ControllerBase
{
    // GET /api/static-pages - Danh sách trang
    // GET /api/static-pages/{id} - Chi tiết trang
    // GET /api/static-pages/slug/{slug} - Lấy theo slug
    // POST /api/static-pages - Tạo trang mới
    // PUT /api/static-pages/{id} - Cập nhật trang
    // DELETE /api/static-pages/{id} - Xóa trang
    
    // PUT /api/static-pages/{id}/publish - Xuất bản trang
    // PUT /api/static-pages/{id}/unpublish - Bỏ xuất bản
    // PUT /api/static-pages/{id}/archive - Lưu trữ
    
    // GET /api/static-pages/types/{type} - Trang theo loại
    // GET /api/static-pages/seo-analysis - Phân tích SEO
    // POST /api/static-pages/generate-sitemap - Tạo sitemap
}
```

#### 4. **InstructorController** - Quản lý giảng viên
```csharp
[ApiController]
[Route("api/instructors")]
public class InstructorController : ControllerBase
{
    // GET /api/instructors - Danh sách giảng viên
    // GET /api/instructors/{id} - Chi tiết giảng viên
    // POST /api/instructors - Tạo hồ sơ giảng viên
    // PUT /api/instructors/{id} - Cập nhật hồ sơ
    // DELETE /api/instructors/{id} - Xóa giảng viên
    
    // GET /api/instructors/{id}/courses - Khóa học của giảng viên
    // GET /api/instructors/{id}/students - Học viên của giảng viên
    // GET /api/instructors/{id}/earnings - Thu nhập giảng viên
    
    // PUT /api/instructors/{id}/feature - Đánh dấu giảng viên tiêu biểu
    // GET /api/instructors/featured - Giảng viên tiêu biểu
    // GET /api/instructors/{id}/analytics - Thống kê giảng viên
}
```

#### 5. **AssignmentController** - Quản lý bài tập và kiểm tra
```csharp
[ApiController]
[Route("api/assignments")]
public class AssignmentController : ControllerBase
{
    // GET /api/assignments - Danh sách bài tập
    // GET /api/assignments/{id} - Chi tiết bài tập
    // POST /api/assignments - Tạo bài tập mới
    // PUT /api/assignments/{id} - Cập nhật bài tập
    // DELETE /api/assignments/{id} - Xóa bài tập
    
    // POST /api/assignments/import-word - Import từ Word
    // GET /api/assignments/{id}/questions - Câu hỏi trong bài tập
    // POST /api/assignments/{id}/questions - Thêm câu hỏi
    // PUT /api/assignments/{id}/questions/{questionId} - Cập nhật câu hỏi
    
    // GET /api/assignments/{id}/submissions - Bài nộp
    // POST /api/assignments/{id}/submit - Nộp bài
    // GET /api/assignments/{id}/results - Kết quả bài tập
    // PUT /api/assignments/{id}/grade - Chấm điểm
    
    // GET /api/assignments/templates - Mẫu bài tập
    // POST /api/assignments/validate-word - Kiểm tra file Word
}
```

#### 6. **AIController** - AI học tập
```csharp
[ApiController]
[Route("api/ai")]
public class AIController : ControllerBase
{
    // POST /api/ai/pronunciation/analyze - Phân tích phát âm
    // POST /api/ai/pronunciation/feedback - Phản hồi phát âm
    // GET /api/ai/pronunciation/history - Lịch sử luyện phát âm
    
    // POST /api/ai/learning-analysis - Phân tích học tập
    // GET /api/ai/personalization/recommendations - Gợi ý cá nhân hóa
    // POST /api/ai/personalization/update-profile - Cập nhật hồ sơ học tập
    
    // POST /api/ai/chatbot/ask - Hỏi chatbot
    // GET /api/ai/chatbot/history - Lịch sử chat
    // POST /api/ai/chatbot/feedback - Đánh giá chatbot
    
    // GET /api/ai/analytics - Thống kê AI
    // POST /api/ai/content/generate - Tạo nội dung AI
}
```

#### 7. **OrderController** - Quản lý đơn hàng
```csharp
[ApiController]
[Route("api/orders")]
public class OrderController : ControllerBase
{
    // GET /api/orders - Danh sách đơn hàng
    // GET /api/orders/{id} - Chi tiết đơn hàng
    // POST /api/orders - Tạo đơn hàng
    // PUT /api/orders/{id} - Cập nhật đơn hàng
    // DELETE /api/orders/{id} - Hủy đơn hàng
    
    // PUT /api/orders/{id}/status - Cập nhật trạng thái
    // POST /api/orders/{id}/payment - Xử lý thanh toán
    // POST /api/orders/{id}/refund - Hoàn tiền
    
    // GET /api/orders/user/{userId} - Đơn hàng của user
    // GET /api/orders/analytics - Thống kê đơn hàng
}
```

#### 8. **PaymentController** - Thanh toán
```csharp
[ApiController]
[Route("api/payments")]
public class PaymentController : ControllerBase
{
    // POST /api/payments/create - Tạo giao dịch
    // POST /api/payments/process - Xử lý thanh toán
    // GET /api/payments/{id} - Chi tiết giao dịch
    // POST /api/payments/{id}/refund - Hoàn tiền
    
    // GET /api/payments/methods - Phương thức thanh toán
    // POST /api/payments/webhook - Webhook thanh toán
    // GET /api/payments/analytics - Thống kê thanh toán
}
```

#### 9. **CouponController** - Mã giảm giá
```csharp
[ApiController]
[Route("api/coupons")]
public class CouponController : ControllerBase
{
    // GET /api/coupons - Danh sách mã giảm giá
    // GET /api/coupons/{id} - Chi tiết mã
    // POST /api/coupons - Tạo mã mới
    // PUT /api/coupons/{id} - Cập nhật mã
    // DELETE /api/coupons/{id} - Xóa mã
    
    // POST /api/coupons/validate - Kiểm tra mã
    // POST /api/coupons/{code}/apply - Áp dụng mã
    // GET /api/coupons/{id}/usage - Lịch sử sử dụng
}
```

### 🟡 Cần mở rộng từ API hiện có:

#### 1. **CoursesController** - Bổ sung thêm:
```csharp
// GET /api/courses/free - Khóa học miễn phí
// GET /api/courses/paid - Khóa học trả phí
// GET /api/courses/pending - Khóa học chờ duyệt
// PUT /api/courses/{id}/approve - Duyệt khóa học
// PUT /api/courses/{id}/reject - Từ chối khóa học
// GET /api/courses/{id}/static-page - Trang tĩnh khóa học
// POST /api/courses/{id}/generate-static-page - Tạo trang tĩnh
```

#### 2. **UserController** - Bổ sung thêm:
```csharp
// GET /api/users/{id}/learning-path - Lộ trình học tập
// GET /api/users/{id}/progress - Tiến độ học tập
// GET /api/users/{id}/certificates - Chứng chỉ
// POST /api/users/{id}/upload-assignment - Upload bài tập
// GET /api/users/{id}/assignments - Bài tập đã nộp
```

#### 3. **AnalyticsController** - Bổ sung thêm:
```csharp
// GET /api/analytics/seo - Thống kê SEO
// GET /api/analytics/books - Thống kê sách
// GET /api/analytics/forum - Thống kê forum
// GET /api/analytics/static-pages - Thống kê trang tĩnh
// GET /api/analytics/ai-usage - Thống kê AI
```

## Cơ sở dữ liệu cần bổ sung

### 1. **Books & ActivationCodes**
```sql
-- Bảng Books
CREATE TABLE Books (
    Id INT PRIMARY KEY IDENTITY,
    Title NVARCHAR(500) NOT NULL,
    Description NVARCHAR(MAX),
    Author NVARCHAR(200),
    Publisher NVARCHAR(200),
    ISBN NVARCHAR(50),
    Price DECIMAL(10,2),
    Thumbnail NVARCHAR(500),
    TotalQuestions INT DEFAULT 0,
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    UpdatedAt DATETIME2 DEFAULT GETDATE()
);

-- Bảng BookQuestions
CREATE TABLE BookQuestions (
    Id INT PRIMARY KEY IDENTITY,
    BookId INT FOREIGN KEY REFERENCES Books(Id),
    QuestionId NVARCHAR(50) NOT NULL,
    QuestionText NVARCHAR(MAX),
    QuestionImage NVARCHAR(500),
    AnswerText NVARCHAR(MAX),
    AnswerImage NVARCHAR(500),
    VideoUrl NVARCHAR(500),
    CreatedAt DATETIME2 DEFAULT GETDATE()
);

-- Bảng ActivationCodes
CREATE TABLE ActivationCodes (
    Id INT PRIMARY KEY IDENTITY,
    Code NVARCHAR(100) UNIQUE NOT NULL,
    BookId INT FOREIGN KEY REFERENCES Books(Id),
    QuestionId NVARCHAR(50),
    IsUsed BIT DEFAULT 0,
    UsedBy INT FOREIGN KEY REFERENCES Users(Id),
    UsedAt DATETIME2,
    ExpiresAt DATETIME2 NOT NULL,
    CreatedAt DATETIME2 DEFAULT GETDATE()
);
```

### 2. **Forum (MongoDB) - ✅ ĐÃ HOÀN THÀNH**
```javascript
// Database: KhoiTriSoForum
// Collections: questions, answers, comments, tags, categories, votes, bookmarks

// Collection: questions
{
  _id: ObjectId,
  title: String,           // Tiêu đề câu hỏi
  content: String,         // Nội dung câu hỏi
  userId: Number,         // ID người dùng (link với PostgreSQL Users)
  userName: String,       // Tên người dùng
  userAvatar: String,     // Avatar người dùng
  tags: [String],         // Mảng tags
  categoryId: String,     // ID danh mục
  categoryName: String,   // Tên danh mục
  views: Number,          // Số lượt xem
  votes: Number,          // Tổng số vote
  answersCount: Number,   // Số câu trả lời
  isSolved: Boolean,      // Đã giải quyết
  isPinned: Boolean,      // Được ghim
  isClosed: Boolean,      // Đã đóng
  attachments: [{         // File đính kèm
    fileName: String,
    fileUrl: String,
    fileSize: Number,
    fileType: String,
    uploadedAt: Date
  }],
  createdAt: Date,
  updatedAt: Date,
  lastActivityAt: Date,
  isDeleted: Boolean      // Soft delete
}

// Collection: answers
{
  _id: ObjectId,
  questionId: String,     // ID câu hỏi
  content: String,        // Nội dung câu trả lời
  userId: Number,         // ID người dùng
  userName: String,       // Tên người dùng
  userAvatar: String,     // Avatar người dùng
  votes: Number,          // Số vote
  isAccepted: Boolean,    // Được chấp nhận
  attachments: [Object],  // File đính kèm
  createdAt: Date,
  updatedAt: Date,
  isDeleted: Boolean      // Soft delete
}

// Collection: comments
{
  _id: ObjectId,
  parentId: String,       // ID parent (question hoặc answer)
  parentType: Number,     // 1: Question, 2: Answer
  content: String,        // Nội dung bình luận
  userId: Number,         // ID người dùng
  userName: String,       // Tên người dùng
  userAvatar: String,     // Avatar người dùng
  votes: Number,          // Số vote
  attachments: [Object], // File đính kèm
  createdAt: Date,
  updatedAt: Date,
  isDeleted: Boolean      // Soft delete
}

// Collection: categories
{
  _id: ObjectId,
  name: String,           // Tên danh mục
  description: String,    // Mô tả
  color: String,          // Màu sắc
  icon: String,           // Icon
  questionsCount: Number, // Số câu hỏi
  isActive: Boolean,      // Trạng thái
  sortOrder: Number,      // Thứ tự sắp xếp
  createdAt: Date,
  updatedAt: Date
}

// Collection: tags
{
  _id: ObjectId,
  name: String,           // Tên tag
  description: String,    // Mô tả
  color: String,          // Màu sắc
  questionsCount: Number, // Số câu hỏi
  isActive: Boolean,      // Trạng thái
  createdAt: Date,
  updatedAt: Date
}

// Collection: votes
{
  _id: ObjectId,
  targetId: String,       // ID đối tượng được vote
  targetType: Number,     // 1: Question, 2: Answer, 3: Comment
  userId: Number,         // ID người vote
  voteType: Number,       // 1: Up, -1: Down
  createdAt: Date
}

// Collection: bookmarks
{
  _id: ObjectId,
  questionId: String,     // ID câu hỏi
  userId: Number,         // ID người dùng
  createdAt: Date
}
```

### 3. **StaticPages**
```sql
-- Bảng StaticPages
CREATE TABLE StaticPages (
    Id INT PRIMARY KEY IDENTITY,
    Title NVARCHAR(500) NOT NULL,
    Slug NVARCHAR(200) UNIQUE NOT NULL,
    Content NVARCHAR(MAX),
    Excerpt NVARCHAR(1000),
    Type NVARCHAR(50), -- course, instructor, question, general
    Status NVARCHAR(20) DEFAULT 'draft', -- draft, published, archived
    SeoTitle NVARCHAR(200),
    SeoDescription NVARCHAR(500),
    SeoKeywords NVARCHAR(500),
    AuthorId INT FOREIGN KEY REFERENCES Users(Id),
    Views INT DEFAULT 0,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    UpdatedAt DATETIME2 DEFAULT GETDATE(),
    PublishedAt DATETIME2,
    LastModifiedBy INT FOREIGN KEY REFERENCES Users(Id),
    LastModifiedAt DATETIME2
);
```

### 4. **Instructors**
```sql
-- Bảng Instructors
CREATE TABLE Instructors (
    Id INT PRIMARY KEY IDENTITY,
    UserId INT FOREIGN KEY REFERENCES Users(Id),
    Bio NVARCHAR(MAX),
    Specialization NVARCHAR(200),
    Education NVARCHAR(500),
    Experience INT,
    Achievements NVARCHAR(MAX),
    DemoVideoUrl NVARCHAR(500),
    Avatar NVARCHAR(500),
    IsFeatured BIT DEFAULT 0,
    Rating DECIMAL(3,2) DEFAULT 0,
    TotalStudents INT DEFAULT 0,
    TotalCourses INT DEFAULT 0,
    TotalEarnings DECIMAL(12,2) DEFAULT 0,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    UpdatedAt DATETIME2 DEFAULT GETDATE()
);
```

### 5. **AI Learning**
```sql
-- Bảng AIPronunciationSessions
CREATE TABLE AIPronunciationSessions (
    Id INT PRIMARY KEY IDENTITY,
    UserId INT FOREIGN KEY REFERENCES Users(Id),
    Text NVARCHAR(500),
    AudioUrl NVARCHAR(500),
    Score DECIMAL(5,2),
    Feedback NVARCHAR(MAX),
    CreatedAt DATETIME2 DEFAULT GETDATE()
);

-- Bảng AIChatSessions
CREATE TABLE AIChatSessions (
    Id INT PRIMARY KEY IDENTITY,
    UserId INT FOREIGN KEY REFERENCES Users(Id),
    Question NVARCHAR(MAX),
    Answer NVARCHAR(MAX),
    Rating INT,
    CreatedAt DATETIME2 DEFAULT GETDATE()
);
```

## Thứ tự phát triển API (Frontend Integration Priority)

### 🚀 **Phase 1 - Core Features (Làm ngay):**
1. **BooksController** + **ActivationCodeController** - Core feature sách điện tử
2. **InstructorController** - Quản lý giảng viên (cần cho trang instructor profiles)
3. **StaticPageController** - SEO pages (course pages, instructor profiles)

### 🔥 **Phase 2 - E-commerce (Làm tiếp):**
4. **OrderController** - Quản lý đơn hàng
5. **PaymentController** - Thanh toán
6. **CouponController** - Mã giảm giá

### 🔶 **Phase 3 - Learning Features (Mở rộng):**
7. **AssignmentController** - Bài tập và kiểm tra (mở rộng từ CourseTestController)
8. **AIController** - AI học tập (pronunciation, chatbot)

### 🔵 **Phase 4 - Advanced Features (Sau cùng):**
9. **Advanced Analytics** - Thống kê nâng cao và AI insights
10. **Performance Optimization** - Caching, CDN, monitoring

## Chi tiết từng Phase

### 🚀 **Phase 1 - Core Features (Tuần 1-2)**
**Lý do ưu tiên:** Đây là tính năng core của hệ thống, cần có để demo và test

#### **1. BooksController + ActivationCodeController**
- **Frontend cần:** Trang sách điện tử, trang kích hoạt mã
- **API endpoints:** CRUD books, generate/validate activation codes
- **Database:** Books, BookQuestions, ActivationCodes tables
- **Tính năng:** Upload sách, tạo mã kích hoạt, xem lời giải video

#### **2. InstructorController**
- **Frontend cần:** Trang instructor profiles, danh sách giảng viên
- **API endpoints:** CRUD instructors, featured instructors, analytics
- **Database:** Instructors table (JSON data)
- **Tính năng:** Hồ sơ giảng viên, khóa học của giảng viên, thu nhập

#### **3. StaticPageController**
- **Frontend cần:** SEO pages cho courses, instructors, questions
- **API endpoints:** CRUD static pages, publish/unpublish, SEO analysis
- **Database:** StaticPages table
- **Tính năng:** Tạo trang tĩnh, SEO optimization, sitemap generation

### 🔥 **Phase 2 - E-commerce (Tuần 3-4)**
**Lý do ưu tiên:** Cần có để monetize hệ thống, tích hợp thanh toán

#### **4. OrderController**
- **Frontend cần:** Trang đơn hàng, lịch sử mua hàng
- **API endpoints:** CRUD orders, status updates, user orders
- **Database:** Orders, OrderItems tables
- **Tính năng:** Tạo đơn hàng, theo dõi trạng thái, lịch sử

#### **5. PaymentController**
- **Frontend cần:** Trang thanh toán, xử lý payment
- **API endpoints:** Create payment, process payment, refund
- **Integration:** VNPay, Stripe, PayPal
- **Tính năng:** Thanh toán online, webhook, hoàn tiền

#### **6. CouponController**
- **Frontend cần:** Áp dụng mã giảm giá trong checkout
- **API endpoints:** CRUD coupons, validate, apply
- **Database:** Coupons, CouponUsage tables
- **Tính năng:** Tạo mã giảm giá, kiểm tra hợp lệ, áp dụng

### 🔶 **Phase 3 - Learning Features (Tuần 5-6)**
**Lý do ưu tiên:** Mở rộng tính năng học tập, tăng engagement

#### **7. AssignmentController**
- **Frontend cần:** Trang bài tập, nộp bài, chấm điểm
- **API endpoints:** CRUD assignments, submit, grade
- **Integration:** Word document processing
- **Tính năng:** Import từ Word, tạo bài tập, chấm điểm tự động

#### **8. AIController**
- **Frontend cần:** Luyện phát âm, chatbot học tập
- **API endpoints:** Pronunciation analysis, chatbot chat
- **Integration:** AI services (OpenAI, Google Speech)
- **Tính năng:** Phân tích phát âm, chatbot hỗ trợ học tập

### 🔵 **Phase 4 - Advanced Features (Tuần 7-8)**
**Lý do ưu tiên:** Tối ưu hóa và phân tích nâng cao

#### **9. Advanced Analytics**
- **Frontend cần:** Dashboard analytics, báo cáo chi tiết
- **API endpoints:** Learning analytics, user behavior, performance
- **Database:** Analytics tables, data warehouse
- **Tính năng:** Phân tích học tập, dự đoán performance, insights

#### **10. Performance Optimization**
- **Frontend cần:** Faster loading, better UX
- **Technologies:** Redis caching, CDN, monitoring
- **Tính năng:** Caching, image optimization, performance monitoring

## Frontend Integration Roadmap

### 📱 **Phase 1 - Core Pages (Tuần 1-2)**
```
Frontend Pages cần tạo:
├── /books - Trang sách điện tử
├── /books/[id] - Chi tiết sách
├── /books/activate - Kích hoạt mã
├── /instructors - Danh sách giảng viên
├── /instructors/[id] - Profile giảng viên
├── /instructors/featured - Giảng viên tiêu biểu
├── /static-pages/[slug] - Trang tĩnh SEO
└── /admin/static-pages - Quản lý trang tĩnh
```

### 🛒 **Phase 2 - E-commerce Pages (Tuần 3-4)**
```
Frontend Pages cần tạo:
├── /cart - Giỏ hàng
├── /checkout - Thanh toán
├── /orders - Đơn hàng của tôi
├── /orders/[id] - Chi tiết đơn hàng
├── /admin/orders - Quản lý đơn hàng
├── /admin/coupons - Quản lý mã giảm giá
└── /payment/[id] - Trang thanh toán
```

### 📚 **Phase 3 - Learning Pages (Tuần 5-6)**
```
Frontend Pages cần tạo:
├── /assignments - Bài tập
├── /assignments/[id] - Chi tiết bài tập
├── /assignments/[id]/submit - Nộp bài
├── /ai/pronunciation - Luyện phát âm
├── /ai/chatbot - Chatbot học tập
└── /admin/assignments - Quản lý bài tập
```

### 📊 **Phase 4 - Analytics Pages (Tuần 7-8)**
```
Frontend Pages cần tạo:
├── /admin/analytics - Dashboard analytics
├── /admin/analytics/learning - Phân tích học tập
├── /admin/analytics/users - Phân tích người dùng
├── /admin/analytics/performance - Hiệu suất hệ thống
└── /admin/settings/performance - Cài đặt performance
```

## API Dependencies

### 🔗 **Dependencies giữa các API:**
```
BooksController
├── Depends on: UserController (for user info)
├── Depends on: UploadController (for file uploads)
└── Provides: Activation codes for users

InstructorController
├── Depends on: UserController (for user profiles)
├── Depends on: CoursesController (for instructor courses)
└── Provides: Instructor data for static pages

StaticPageController
├── Depends on: InstructorController (for instructor pages)
├── Depends on: CoursesController (for course pages)
└── Provides: SEO pages for search engines

OrderController
├── Depends on: BooksController (for book orders)
├── Depends on: CoursesController (for course orders)
├── Depends on: UserController (for user orders)
└── Provides: Order data for PaymentController

PaymentController
├── Depends on: OrderController (for order processing)
├── Depends on: CouponController (for discount calculation)
└── Provides: Payment status for OrderController
```

### 📋 **Frontend Components cần tạo:**
```
Components Library:
├── BookCard - Hiển thị sách
├── InstructorCard - Hiển thị giảng viên
├── OrderCard - Hiển thị đơn hàng
├── PaymentForm - Form thanh toán
├── CouponInput - Input mã giảm giá
├── AssignmentCard - Hiển thị bài tập
├── AIPronunciation - Component luyện phát âm
├── AIChatbot - Component chatbot
└── AnalyticsChart - Component biểu đồ
```

## Kết luận

### ✅ **Đã hoàn thành:**
- **ForumController** với MongoDB - Tính năng diễn đàn hỏi đáp đầy đủ với vote, bookmark, categories, tags
- **Các API cơ bản** - Auth, Courses, Lessons, Users, Admin, Analytics, Notifications, etc.

### 🔄 **Đang phát triển:**
- **BooksController** + **ActivationCodeController** - Core feature sách điện tử và mã kích hoạt
- **StaticPageController** - SEO và trang tĩnh
- **InstructorController** - Quản lý giảng viên

### 📋 **Cần bổ sung:**
Cần bổ sung thêm khoảng **6-8 controllers mới** để hoàn thiện hệ thống theo mô tả. Ưu tiên phát triển các tính năng core trước, sau đó mở rộng các tính năng nâng cao.

### 🗄️ **Database Architecture:**
- **PostgreSQL** - Dữ liệu chính (Users, Courses, Lessons, Orders, etc.)
- **MongoDB** - Forum và dữ liệu phi cấu trúc (Questions, Answers, Comments, Votes, Bookmarks)
- **Hybrid approach** - Tận dụng ưu điểm của cả hai hệ thống

### 🚀 **Next Steps theo Roadmap:**

#### **Tuần 1-2: Phase 1 - Core Features**
1. ✅ **BooksController** + **ActivationCodeController** - Core feature sách điện tử
2. ✅ **InstructorController** - Quản lý giảng viên và profiles
3. ✅ **StaticPageController** - SEO pages cho courses và instructors

#### **Tuần 3-4: Phase 2 - E-commerce**
4. ✅ **OrderController** - Quản lý đơn hàng
5. ✅ **PaymentController** - Tích hợp thanh toán VNPay
6. ✅ **CouponController** - Mã giảm giá và marketing

#### **Tuần 5-6: Phase 3 - Learning Features**
7. ✅ **AssignmentController** - Bài tập và kiểm tra
8. ✅ **AIController** - AI học tập (pronunciation, chatbot)

#### **Tuần 7-8: Phase 4 - Advanced Features**
9. ✅ **Advanced Analytics** - Thống kê nâng cao
10. ✅ **Performance Optimization** - Caching và monitoring

### 📋 **Frontend Development Plan:**
- **Phase 1:** Tạo core pages (books, instructors, static pages)
- **Phase 2:** Tạo e-commerce pages (cart, checkout, orders)
- **Phase 3:** Tạo learning pages (assignments, AI features)
- **Phase 4:** Tạo analytics pages và optimization
