# Đề xuất cải tiến Database cho Khởi Trí Số

## 🔍 Phân tích Database hiện tại

Database hiện tại đã khá hoàn chỉnh với 20+ bảng, tuy nhiên có thể cải tiến để hỗ trợ tốt hơn cho dashboard và các tính năng mới.

## 🆕 Đề xuất thêm các bảng mới

### 1. **ForumPosts** - Hệ thống diễn đàn
```sql
CREATE TABLE "ForumPosts" (
  "Id" integer PRIMARY KEY NOT NULL,
  "UserId" integer NOT NULL,
  "CategoryId" integer,
  "Title" varchar(200) NOT NULL,
  "Content" text NOT NULL,
  "Tags" jsonb,
  "ViewCount" integer DEFAULT 0,
  "VoteCount" integer DEFAULT 0,
  "AnswerCount" integer DEFAULT 0,
  "AcceptedAnswerId" integer,
  "IsSolved" boolean DEFAULT false,
  "IsSticky" boolean DEFAULT false,
  "IsLocked" boolean DEFAULT false,
  "CreatedBy" text,
  "CreatedAt" timestamp NOT NULL,
  "UpdatedBy" text,
  "UpdatedAt" timestamp,
  
  FOREIGN KEY ("UserId") REFERENCES "Users"("Id"),
  FOREIGN KEY ("CategoryId") REFERENCES "Categories"("Id"),
  FOREIGN KEY ("AcceptedAnswerId") REFERENCES "ForumReplies"("Id")
);
```

### 2. **ForumReplies** - Câu trả lời diễn đàn
```sql
CREATE TABLE "ForumReplies" (
  "Id" integer PRIMARY KEY NOT NULL,
  "PostId" integer NOT NULL,
  "UserId" integer NOT NULL,
  "ParentReplyId" integer, -- For nested replies
  "Content" text NOT NULL,
  "VoteCount" integer DEFAULT 0,
  "IsAccepted" boolean DEFAULT false,
  "CreatedBy" text,
  "CreatedAt" timestamp NOT NULL,
  "UpdatedBy" text,
  "UpdatedAt" timestamp,
  
  FOREIGN KEY ("PostId") REFERENCES "ForumPosts"("Id") ON DELETE CASCADE,
  FOREIGN KEY ("UserId") REFERENCES "Users"("Id"),
  FOREIGN KEY ("ParentReplyId") REFERENCES "ForumReplies"("Id")
);
```

### 3. **ForumVotes** - Hệ thống vote
```sql
CREATE TABLE "ForumVotes" (
  "Id" integer PRIMARY KEY NOT NULL,
  "UserId" integer NOT NULL,
  "PostId" integer,
  "ReplyId" integer,
  "VoteType" integer NOT NULL, -- 1: upvote, -1: downvote
  "CreatedAt" timestamp NOT NULL,
  
  FOREIGN KEY ("UserId") REFERENCES "Users"("Id"),
  FOREIGN KEY ("PostId") REFERENCES "ForumPosts"("Id") ON DELETE CASCADE,
  FOREIGN KEY ("ReplyId") REFERENCES "ForumReplies"("Id") ON DELETE CASCADE,
  
  UNIQUE("UserId", "PostId"),
  UNIQUE("UserId", "ReplyId")
);
```

### 4. **UserActivity** - Theo dõi hoạt động
```sql
CREATE TABLE "UserActivity" (
  "Id" integer PRIMARY KEY NOT NULL,
  "UserId" integer NOT NULL,
  "ActivityType" varchar(50) NOT NULL, -- login, course_complete, forum_post, etc.
  "ResourceId" integer, -- ID của resource liên quan
  "ResourceType" varchar(50), -- course, book, forum_post, etc.
  "Description" varchar(500),
  "IpAddress" varchar(45),
  "UserAgent" varchar(500),
  "CreatedAt" timestamp NOT NULL,
  
  FOREIGN KEY ("UserId") REFERENCES "Users"("Id"),
  INDEX "IX_UserActivity_UserId" ("UserId"),
  INDEX "IX_UserActivity_ActivityType" ("ActivityType"),
  INDEX "IX_UserActivity_CreatedAt" ("CreatedAt")
);
```

### 5. **CourseReviews** - Đánh giá khóa học
```sql
CREATE TABLE "CourseReviews" (
  "Id" integer PRIMARY KEY NOT NULL,
  "CourseId" integer NOT NULL,
  "UserId" integer NOT NULL,
  "Rating" integer NOT NULL CHECK ("Rating" >= 1 AND "Rating" <= 5),
  "Title" varchar(200),
  "Comment" text,
  "IsVerifiedPurchase" boolean DEFAULT false,
  "HelpfulCount" integer DEFAULT 0,
  "CreatedBy" text,
  "CreatedAt" timestamp NOT NULL,
  "UpdatedBy" text,
  "UpdatedAt" timestamp,
  
  FOREIGN KEY ("CourseId") REFERENCES "Courses"("Id") ON DELETE CASCADE,
  FOREIGN KEY ("UserId") REFERENCES "Users"("Id"),
  UNIQUE("CourseId", "UserId")
);
```

### 6. **Tags** - Hệ thống tag
```sql
CREATE TABLE "Tags" (
  "Id" integer PRIMARY KEY NOT NULL,
  "Name" varchar(50) NOT NULL UNIQUE,
  "Slug" varchar(50) NOT NULL UNIQUE,
  "Description" text,
  "Color" varchar(7), -- Hex color code
  "UsageCount" integer DEFAULT 0,
  "IsActive" boolean DEFAULT true,
  "CreatedBy" text,
  "CreatedAt" timestamp NOT NULL,
  "UpdatedBy" text,
  "UpdatedAt" timestamp
);
```

### 7. **ResourceTags** - Many-to-many relationship
```sql
CREATE TABLE "ResourceTags" (
  "Id" integer PRIMARY KEY NOT NULL,
  "TagId" integer NOT NULL,
  "ResourceId" integer NOT NULL,
  "ResourceType" varchar(50) NOT NULL, -- course, book, forum_post, etc.
  "CreatedAt" timestamp NOT NULL,
  
  FOREIGN KEY ("TagId") REFERENCES "Tags"("Id") ON DELETE CASCADE,
  UNIQUE("TagId", "ResourceId", "ResourceType")
);
```

### 8. **Announcements** - Thông báo hệ thống
```sql
CREATE TABLE "Announcements" (
  "Id" integer PRIMARY KEY NOT NULL,
  "Title" varchar(200) NOT NULL,
  "Content" text NOT NULL,
  "Type" integer NOT NULL, -- 1: info, 2: warning, 3: error, 4: success
  "Priority" integer DEFAULT 1, -- 1: low, 2: medium, 3: high, 4: urgent
  "TargetAudience" varchar(50), -- all, students, instructors, admins
  "StartDate" timestamp,
  "EndDate" timestamp,
  "IsActive" boolean DEFAULT true,
  "ViewCount" integer DEFAULT 0,
  "CreatedBy" text,
  "CreatedAt" timestamp NOT NULL,
  "UpdatedBy" text,
  "UpdatedAt" timestamp
);
```

### 9. **UserAnnouncements** - Tracking đã đọc
```sql
CREATE TABLE "UserAnnouncements" (
  "Id" integer PRIMARY KEY NOT NULL,
  "UserId" integer NOT NULL,
  "AnnouncementId" integer NOT NULL,
  "IsRead" boolean DEFAULT false,
  "ReadAt" timestamp,
  
  FOREIGN KEY ("UserId") REFERENCES "Users"("Id"),
  FOREIGN KEY ("AnnouncementId") REFERENCES "Announcements"("Id") ON DELETE CASCADE,
  UNIQUE("UserId", "AnnouncementId")
);
```

### 10. **Analytics** - Thống kê chi tiết
```sql
CREATE TABLE "Analytics" (
  "Id" integer PRIMARY KEY NOT NULL,
  "Date" date NOT NULL,
  "MetricName" varchar(100) NOT NULL,
  "MetricValue" decimal(18,2) NOT NULL,
  "Dimensions" jsonb, -- Flexible dimensions for filtering
  "CreatedAt" timestamp NOT NULL,
  
  INDEX "IX_Analytics_Date_MetricName" ("Date", "MetricName"),
  INDEX "IX_Analytics_MetricName" ("MetricName")
);
```

## 🔧 Cải tiến các bảng hiện có

### 1. **Users** - Thêm fields cho dashboard
```sql
ALTER TABLE "Users" ADD COLUMN "LastActivity" timestamp;
ALTER TABLE "Users" ADD COLUMN "TotalPoints" integer DEFAULT 0;
ALTER TABLE "Users" ADD COLUMN "Reputation" integer DEFAULT 0;
ALTER TABLE "Users" ADD COLUMN "ProfileCompleteness" integer DEFAULT 0;
ALTER TABLE "Users" ADD COLUMN "PreferredLanguage" varchar(10) DEFAULT 'vi';
ALTER TABLE "Users" ADD COLUMN "Timezone" varchar(50) DEFAULT 'Asia/Ho_Chi_Minh';
ALTER TABLE "Users" ADD COLUMN "NotificationSettings" jsonb;
```

### 2. **Courses** - Metadata và tracking
```sql
ALTER TABLE "Courses" ADD COLUMN "Prerequisites" jsonb; -- Array of course IDs
ALTER TABLE "Courses" ADD COLUMN "CompletionCertificate" boolean DEFAULT false;
ALTER TABLE "Courses" ADD COLUMN "EstimatedDuration" integer; -- in hours
ALTER TABLE "Courses" ADD COLUMN "ViewCount" integer DEFAULT 0;
ALTER TABLE "Courses" ADD COLUMN "LastUpdated" timestamp;
ALTER TABLE "Courses" ADD COLUMN "SEOMetadata" jsonb;
```

### 3. **Books** - Enhanced metadata
```sql
ALTER TABLE "Books" ADD COLUMN "Publisher" varchar(200);
ALTER TABLE "Books" ADD COLUMN "PublishDate" date;
ALTER TABLE "Books" ADD COLUMN "Language" varchar(10) DEFAULT 'vi';
ALTER TABLE "Books" ADD COLUMN "PageCount" integer;
ALTER TABLE "Books" ADD COLUMN "FileSize" bigint; -- in bytes
ALTER TABLE "Books" ADD COLUMN "DownloadCount" integer DEFAULT 0;
ALTER TABLE "Books" ADD COLUMN "Rating" decimal(3,2) DEFAULT 0;
ALTER TABLE "Books" ADD COLUMN "ReviewCount" integer DEFAULT 0;
```

## 📊 Indexes for Performance

```sql
-- User activity tracking
CREATE INDEX "IX_UserActivity_UserId_CreatedAt" ON "UserActivity" ("UserId", "CreatedAt" DESC);
CREATE INDEX "IX_UserActivity_ActivityType_CreatedAt" ON "UserActivity" ("ActivityType", "CreatedAt" DESC);

-- Forum performance
CREATE INDEX "IX_ForumPosts_CategoryId_CreatedAt" ON "ForumPosts" ("CategoryId", "CreatedAt" DESC);
CREATE INDEX "IX_ForumPosts_UserId_CreatedAt" ON "ForumPosts" ("UserId", "CreatedAt" DESC);
CREATE INDEX "IX_ForumPosts_Tags" ON "ForumPosts" USING GIN ("Tags");

-- Analytics queries
CREATE INDEX "IX_Analytics_Date_Dimensions" ON "Analytics" ("Date", "Dimensions");
CREATE INDEX "IX_Analytics_MetricName_Date" ON "Analytics" ("MetricName", "Date" DESC);

-- Course and enrollment tracking
CREATE INDEX "IX_CourseEnrollments_UserId_CreatedAt" ON "CourseEnrollments" ("UserId", "CreatedAt" DESC);
CREATE INDEX "IX_CourseEnrollments_CourseId_ProgressPercentage" ON "CourseEnrollments" ("CourseId", "ProgressPercentage");
```

## 🎯 Dashboard Features được hỗ trợ

### 1. **Real-time Analytics**
- User activity tracking
- Course completion rates
- Revenue analytics
- Forum engagement metrics

### 2. **Advanced Reporting**
- Custom date ranges
- Flexible filtering
- Export capabilities
- Automated reports

### 3. **User Management**
- Activity logs
- Reputation system
- Notification preferences
- Role-based permissions

### 4. **Content Management**
- Tag system
- SEO optimization
- Content scheduling
- Performance tracking

### 5. **Forum Management**
- Moderation tools
- Vote system
- Reputation tracking
- Content filtering

## 🔒 Security Enhancements

### 1. **Rate Limiting**
```sql
CREATE TABLE "RateLimits" (
  "Id" integer PRIMARY KEY NOT NULL,
  "UserId" integer,
  "IpAddress" varchar(45),
  "Action" varchar(50) NOT NULL,
  "RequestCount" integer DEFAULT 1,
  "WindowStart" timestamp NOT NULL,
  "WindowEnd" timestamp NOT NULL,
  
  FOREIGN KEY ("UserId") REFERENCES "Users"("Id")
);
```

### 2. **Security Events**
```sql
CREATE TABLE "SecurityEvents" (
  "Id" integer PRIMARY KEY NOT NULL,
  "UserId" integer,
  "EventType" varchar(50) NOT NULL, -- failed_login, suspicious_activity, etc.
  "IpAddress" varchar(45),
  "UserAgent" varchar(500),
  "Details" jsonb,
  "Severity" integer DEFAULT 1, -- 1: low, 2: medium, 3: high, 4: critical
  "CreatedAt" timestamp NOT NULL,
  
  FOREIGN KEY ("UserId") REFERENCES "Users"("Id")
);
```

## 📈 Monitoring và Alerting

### 1. **System Health**
```sql
CREATE TABLE "SystemMetrics" (
  "Id" integer PRIMARY KEY NOT NULL,
  "MetricName" varchar(100) NOT NULL,
  "MetricValue" decimal(18,4) NOT NULL,
  "Unit" varchar(20),
  "Timestamp" timestamp NOT NULL,
  "Tags" jsonb,
  
  INDEX "IX_SystemMetrics_MetricName_Timestamp" ("MetricName", "Timestamp" DESC)
);
```

### 2. **Alert Rules**
```sql
CREATE TABLE "AlertRules" (
  "Id" integer PRIMARY KEY NOT NULL,
  "Name" varchar(200) NOT NULL,
  "MetricName" varchar(100) NOT NULL,
  "Condition" varchar(20) NOT NULL, -- gt, lt, eq, etc.
  "Threshold" decimal(18,4) NOT NULL,
  "Duration" integer NOT NULL, -- seconds
  "IsActive" boolean DEFAULT true,
  "NotificationChannels" jsonb, -- email, slack, etc.
  "CreatedBy" text,
  "CreatedAt" timestamp NOT NULL
);
```

## 🚀 Implementation Priority

### Phase 1 (High Priority)
1. ForumPosts, ForumReplies, ForumVotes
2. UserActivity
3. Analytics
4. User table enhancements

### Phase 2 (Medium Priority)
1. CourseReviews
2. Tags system
3. Announcements
4. Enhanced metadata for Courses/Books

### Phase 3 (Low Priority)
1. Security enhancements
2. System monitoring
3. Advanced analytics
4. Performance optimizations

## 💡 Additional Recommendations

1. **Implement caching strategy** với Redis
2. **Set up monitoring** với Prometheus/Grafana
3. **Add full-text search** với Elasticsearch
4. **Implement CDN** cho static assets
5. **Add backup automation** và disaster recovery
6. **Set up log aggregation** với ELK stack
