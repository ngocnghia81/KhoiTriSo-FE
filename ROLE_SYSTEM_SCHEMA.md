# Role System & Commission Schema - Khởi Trí Số

## 🎯 Mô hình hệ thống

### **Roles trong hệ thống:**
1. **Admin** - Quản lý toàn bộ hệ thống, phê duyệt nội dung
2. **Instructor** - Tạo khóa học, sách ID, nhận chiết khấu
3. **Student** - Học viên mua khóa học và sách

## 🗄️ Database Schema Updates

### **1. Users Table (PostgreSQL) - Cập nhật**
```sql
-- Thêm columns mới cho Users table
ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'student';
ALTER TABLE users ADD COLUMN instructor_status VARCHAR(20) DEFAULT 'pending'; -- pending, approved, rejected, suspended
ALTER TABLE users ADD COLUMN instructor_bio TEXT;
ALTER TABLE users ADD COLUMN instructor_qualifications JSONB;
ALTER TABLE users ADD COLUMN instructor_bank_info JSONB;
ALTER TABLE users ADD COLUMN commission_rate DECIMAL(5,2) DEFAULT 30.00; -- 30% default commission
ALTER TABLE users ADD COLUMN total_earnings DECIMAL(12,2) DEFAULT 0.00;
ALTER TABLE users ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE users ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Indexes
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_instructor_status ON users(instructor_status);
```

### **2. Instructor Applications Table**
```sql
CREATE TABLE instructor_applications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  application_status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
  bio TEXT NOT NULL,
  qualifications JSONB NOT NULL,
  experience_years INTEGER,
  specialization VARCHAR(100),
  portfolio_url VARCHAR(255),
  id_document_url VARCHAR(255),
  degree_document_url VARCHAR(255),
  
  -- Bank information
  bank_name VARCHAR(100),
  bank_account_number VARCHAR(50),
  bank_account_name VARCHAR(100),
  
  -- Admin review
  reviewed_by INTEGER REFERENCES users(id),
  reviewed_at TIMESTAMP,
  rejection_reason TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_instructor_applications_user ON instructor_applications(user_id);
CREATE INDEX idx_instructor_applications_status ON instructor_applications(application_status);
```

### **3. Courses Table - Cập nhật**
```sql
-- Thêm columns cho approval system
ALTER TABLE courses ADD COLUMN instructor_id INTEGER REFERENCES users(id);
ALTER TABLE courses ADD COLUMN approval_status VARCHAR(20) DEFAULT 'draft'; -- draft, pending, approved, rejected, suspended
ALTER TABLE courses ADD COLUMN reviewed_by INTEGER REFERENCES users(id);
ALTER TABLE courses ADD COLUMN reviewed_at TIMESTAMP;
ALTER TABLE courses ADD COLUMN rejection_reason TEXT;
ALTER TABLE courses ADD COLUMN commission_rate DECIMAL(5,2) DEFAULT 30.00;
ALTER TABLE courses ADD COLUMN total_revenue DECIMAL(12,2) DEFAULT 0.00;
ALTER TABLE courses ADD COLUMN instructor_earnings DECIMAL(12,2) DEFAULT 0.00;

-- Indexes
CREATE INDEX idx_courses_instructor ON courses(instructor_id);
CREATE INDEX idx_courses_approval_status ON courses(approval_status);
```

### **4. Books Table - Cập nhật**
```sql
-- Thêm columns cho approval system
ALTER TABLE books ADD COLUMN instructor_id INTEGER REFERENCES users(id);
ALTER TABLE books ADD COLUMN approval_status VARCHAR(20) DEFAULT 'draft'; -- draft, pending, approved, rejected, suspended
ALTER TABLE books ADD COLUMN reviewed_by INTEGER REFERENCES users(id);
ALTER TABLE books ADD COLUMN reviewed_at TIMESTAMP;
ALTER TABLE books ADD COLUMN rejection_reason TEXT;
ALTER TABLE books ADD COLUMN commission_rate DECIMAL(5,2) DEFAULT 30.00;
ALTER TABLE books ADD COLUMN total_revenue DECIMAL(12,2) DEFAULT 0.00;
ALTER TABLE books ADD COLUMN instructor_earnings DECIMAL(12,2) DEFAULT 0.00;

-- Indexes
CREATE INDEX idx_books_instructor ON books(instructor_id);
CREATE INDEX idx_books_approval_status ON books(approval_status);
```

### **5. Course Enrollments Table - Cập nhật**
```sql
-- Thêm commission tracking
ALTER TABLE course_enrollments ADD COLUMN commission_amount DECIMAL(10,2) DEFAULT 0.00;
ALTER TABLE course_enrollments ADD COLUMN commission_paid BOOLEAN DEFAULT FALSE;
ALTER TABLE course_enrollments ADD COLUMN commission_paid_at TIMESTAMP;
```

### **6. Book Purchases Table - Cập nhật**
```sql
-- Thêm commission tracking
ALTER TABLE book_purchases ADD COLUMN commission_amount DECIMAL(10,2) DEFAULT 0.00;
ALTER TABLE book_purchases ADD COLUMN commission_paid BOOLEAN DEFAULT FALSE;
ALTER TABLE book_purchases ADD COLUMN commission_paid_at TIMESTAMP;
```

### **7. Commission Transactions Table**
```sql
CREATE TABLE commission_transactions (
  id SERIAL PRIMARY KEY,
  instructor_id INTEGER REFERENCES users(id),
  transaction_type VARCHAR(20), -- course_enrollment, book_purchase
  reference_id INTEGER, -- enrollment_id or purchase_id
  
  -- Financial details
  original_amount DECIMAL(10,2) NOT NULL,
  commission_rate DECIMAL(5,2) NOT NULL,
  commission_amount DECIMAL(10,2) NOT NULL,
  
  -- Status
  status VARCHAR(20) DEFAULT 'pending', -- pending, paid, cancelled
  paid_at TIMESTAMP,
  payment_method VARCHAR(50),
  transaction_reference VARCHAR(100),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_commission_instructor ON commission_transactions(instructor_id);
CREATE INDEX idx_commission_status ON commission_transactions(status);
CREATE INDEX idx_commission_type ON commission_transactions(transaction_type);
```

### **8. Content Reviews Table**
```sql
CREATE TABLE content_reviews (
  id SERIAL PRIMARY KEY,
  content_type VARCHAR(20), -- course, book
  content_id INTEGER NOT NULL,
  instructor_id INTEGER REFERENCES users(id),
  reviewer_id INTEGER REFERENCES users(id),
  
  -- Review details
  status VARCHAR(20), -- pending, approved, rejected, changes_requested
  review_notes TEXT,
  quality_score INTEGER CHECK (quality_score >= 1 AND quality_score <= 5),
  
  -- Checklist items
  content_quality_check BOOLEAN DEFAULT FALSE,
  technical_accuracy_check BOOLEAN DEFAULT FALSE,
  language_grammar_check BOOLEAN DEFAULT FALSE,
  copyright_check BOOLEAN DEFAULT FALSE,
  pricing_appropriateness_check BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_content_reviews_content ON content_reviews(content_type, content_id);
CREATE INDEX idx_content_reviews_status ON content_reviews(status);
```

### **9. Instructor Earnings Summary Table**
```sql
CREATE TABLE instructor_earnings_summary (
  id SERIAL PRIMARY KEY,
  instructor_id INTEGER REFERENCES users(id),
  month INTEGER,
  year INTEGER,
  
  -- Course earnings
  course_enrollments_count INTEGER DEFAULT 0,
  course_revenue DECIMAL(12,2) DEFAULT 0.00,
  course_commission DECIMAL(12,2) DEFAULT 0.00,
  
  -- Book earnings
  book_sales_count INTEGER DEFAULT 0,
  book_revenue DECIMAL(12,2) DEFAULT 0.00,
  book_commission DECIMAL(12,2) DEFAULT 0.00,
  
  -- Total
  total_revenue DECIMAL(12,2) DEFAULT 0.00,
  total_commission DECIMAL(12,2) DEFAULT 0.00,
  commission_paid DECIMAL(12,2) DEFAULT 0.00,
  commission_pending DECIMAL(12,2) DEFAULT 0.00,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(instructor_id, month, year)
);

CREATE INDEX idx_earnings_summary_instructor ON instructor_earnings_summary(instructor_id);
CREATE INDEX idx_earnings_summary_period ON instructor_earnings_summary(year, month);
```

## 🔐 Permission System

### **Role Permissions:**
```javascript
const PERMISSIONS = {
  ADMIN: [
    'manage_all_users',
    'approve_instructors',
    'review_content',
    'manage_commissions',
    'view_all_analytics',
    'system_settings'
  ],
  INSTRUCTOR: [
    'create_courses',
    'manage_own_courses',
    'create_books',
    'manage_own_books',
    'view_own_analytics',
    'manage_own_profile',
    'withdraw_earnings'
  ],
  STUDENT: [
    'enroll_courses',
    'purchase_books',
    'view_own_progress',
    'manage_own_profile'
  ]
};
```

## 💰 Commission Calculation System

### **Commission Flow:**
1. **Student mua khóa học/sách** → Tạo transaction
2. **Tính commission** theo rate của instructor
3. **Admin review** và approve payment
4. **Transfer** tiền cho instructor

### **Commission Rates:**
- **Default**: 30% cho instructor, 70% cho platform
- **Top instructors**: Có thể negotiate rate cao hơn
- **Promotional periods**: Rate đặc biệt

### **Payment Schedule:**
- **Monthly payout** - Ngày 15 hàng tháng
- **Minimum threshold** - 500,000 VND
- **Payment methods** - Bank transfer, E-wallet

## 🔄 Workflow Processes

### **1. Instructor Registration:**
```
Student → Apply → Upload Documents → Admin Review → Approved/Rejected
```

### **2. Course Creation:**
```
Instructor → Create Course → Submit for Review → Admin Review → Approved/Rejected → Published
```

### **3. Commission Payment:**
```
Student Purchase → Calculate Commission → Monthly Summary → Admin Approve → Transfer Payment
```

## 📊 Analytics & Reporting

### **Instructor Dashboard:**
- Earnings overview
- Course/Book performance
- Student engagement
- Payment history

### **Admin Dashboard:**
- Pending approvals
- Revenue analytics
- Instructor performance
- Commission payouts

## 🚀 API Endpoints Structure

### **Instructor Management:**
- `POST /api/instructor/apply` - Đăng ký làm instructor
- `GET /api/instructor/profile` - Xem profile instructor
- `PUT /api/instructor/profile` - Cập nhật profile

### **Content Management:**
- `POST /api/courses` - Tạo khóa học mới
- `PUT /api/courses/:id/submit` - Submit để review
- `GET /api/courses/my-courses` - Danh sách khóa học của instructor

### **Commission Management:**
- `GET /api/commissions/earnings` - Xem earnings
- `POST /api/commissions/withdraw` - Yêu cầu rút tiền
- `GET /api/commissions/history` - Lịch sử commission

### **Admin Approval:**
- `GET /api/admin/pending-instructors` - DS instructor chờ duyệt
- `PUT /api/admin/approve-instructor/:id` - Phê duyệt instructor
- `GET /api/admin/pending-content` - Nội dung chờ duyệt
- `PUT /api/admin/approve-content/:type/:id` - Phê duyệt nội dung

Đây là foundation cho hệ thống role-based với instructor marketplace! 🎉
