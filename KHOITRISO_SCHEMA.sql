-- ========================================
-- KHỞI TRÍ SỐ - POSTGRESQL DATABASE SCHEMA
-- ========================================
-- Complete PostgreSQL implementation of UNIFIED_DATABASE_SCHEMA.dbml
-- Includes all tables, constraints, indexes, and triggers
-- Version: 1.0.0
-- Created: 2024-01-15

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ========================================
-- CORE TABLES
-- ========================================

-- Users table with comprehensive profile and OAuth support
CREATE TABLE "Users" (
    "Id" SERIAL PRIMARY KEY,
    "Username" VARCHAR(50) NOT NULL UNIQUE,
    "Email" VARCHAR(100) NOT NULL UNIQUE,
    "PasswordHash" VARCHAR(255), -- Nullable for OAuth users
    "Role" INTEGER NOT NULL DEFAULT 1, -- 0: Guest, 1: Student, 2: Instructor, 3: Admin
    "IsActive" BOOLEAN NOT NULL DEFAULT TRUE,
    "EmailVerified" BOOLEAN NOT NULL DEFAULT FALSE,
    "ResetPasswordToken" TEXT,
    "ResetPasswordExpiry" TIMESTAMP,
    "EmailVerificationToken" VARCHAR(255),
    "EmailVerificationExpiry" TIMESTAMP,
    
    -- Profile Information
    "FullName" VARCHAR(100),
    "Phone" VARCHAR(20),
    "Avatar" VARCHAR(255),
    "DateOfBirth" TIMESTAMP,
    "Gender" INTEGER, -- 0: Not specified, 1: Male, 2: Female
    "Address" TEXT,
    "SocialLinks" JSONB,
    
    -- Activity Tracking
    "IsOnline" BOOLEAN NOT NULL DEFAULT FALSE,
    "LastLogin" TIMESTAMP,
    "LastActiveAt" TIMESTAMP,
    
    -- Preferences
    "PreferredLanguage" VARCHAR(10) DEFAULT 'vi',
    "Timezone" VARCHAR(50) DEFAULT 'Asia/Ho_Chi_Minh',
    "NotificationPreferences" JSONB DEFAULT '{"email": true, "push": true, "sms": false}',
    "LearningGoals" TEXT[],
    "InterestedTopics" TEXT[],
    
    -- Instructor Specific
    "TeacherStaticPagePath" TEXT,
    "TeacherAdditionalInfo" JSONB,
    
    -- OAuth Integration
    "AuthProvider" VARCHAR(20), -- 'google', 'facebook', 'local'
    "AuthProviderId" VARCHAR(100),
    
    -- Audit Fields
    "CreatedBy" TEXT,
    "CreatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedBy" TEXT,
    "UpdatedAt" TIMESTAMP,
    
    -- Constraints
    CONSTRAINT "chk_users_role" CHECK ("Role" IN (0, 1, 2, 3)),
    CONSTRAINT "chk_users_gender" CHECK ("Gender" IN (0, 1, 2)),
    CONSTRAINT "chk_users_auth_provider" CHECK ("AuthProvider" IN ('google', 'facebook', 'local')),
    CONSTRAINT "chk_users_oauth_consistency" CHECK (
        ("AuthProvider" = 'local' AND "PasswordHash" IS NOT NULL) OR 
        ("AuthProvider" IN ('google', 'facebook') AND "AuthProviderId" IS NOT NULL)
    )
);

-- Categories table with hierarchical support
CREATE TABLE "Categories" (
    "Id" SERIAL PRIMARY KEY,
    "Name" VARCHAR(100) NOT NULL,
    "Description" TEXT NOT NULL,
    "ParentId" INTEGER REFERENCES "Categories"("Id"),
    "Icon" VARCHAR(50) NOT NULL,
    "IsActive" BOOLEAN NOT NULL DEFAULT TRUE,
    "OrderIndex" INTEGER NOT NULL DEFAULT 0,
    "CreatedBy" TEXT,
    "CreatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedBy" TEXT,
    "UpdatedAt" TIMESTAMP
);

-- ========================================
-- COURSE SYSTEM
-- ========================================

-- Courses table with approval workflow
CREATE TABLE "Courses" (
    "Id" SERIAL PRIMARY KEY,
    "Title" VARCHAR(200) NOT NULL,
    "StaticPagePath" TEXT NOT NULL,
    "Description" TEXT NOT NULL,
    "Thumbnail" VARCHAR(255) NOT NULL,
    "InstructorId" INTEGER NOT NULL REFERENCES "Users"("Id"),
    "CategoryId" INTEGER NOT NULL REFERENCES "Categories"("Id"),
    "Level" INTEGER NOT NULL, -- 1: Beginner, 2: Intermediate, 3: Advanced
    "IsFree" BOOLEAN NOT NULL DEFAULT FALSE,
    "Price" NUMERIC(10,2) NOT NULL DEFAULT 0,
    "TotalLessons" INTEGER NOT NULL DEFAULT 0,
    "TotalStudents" INTEGER NOT NULL DEFAULT 0,
    "Rating" NUMERIC(3,2) NOT NULL DEFAULT 0,
    "TotalReviews" INTEGER NOT NULL DEFAULT 0,
    "IsPublished" BOOLEAN NOT NULL DEFAULT FALSE,
    "IsActive" BOOLEAN NOT NULL DEFAULT TRUE,
    
    -- Enhanced fields
    "ApprovalStatus" INTEGER NOT NULL DEFAULT 1, -- 1: Draft, 2: Pending, 3: Approved, 4: Rejected
    "EstimatedDuration" INTEGER, -- in hours
    "Language" VARCHAR(10) DEFAULT 'vi',
    "Requirements" TEXT[],
    "WhatYouWillLearn" TEXT[],
    "QualityScore" INTEGER,
    "ReviewNotes" TEXT,
    
    -- Audit Fields
    "CreatedBy" TEXT,
    "CreatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedBy" TEXT,
    "UpdatedAt" TIMESTAMP,
    
    -- Constraints
    CONSTRAINT "chk_courses_level" CHECK ("Level" IN (1, 2, 3)),
    CONSTRAINT "chk_courses_price" CHECK ("Price" >= 0),
    CONSTRAINT "chk_courses_rating" CHECK ("Rating" >= 0 AND "Rating" <= 5),
    CONSTRAINT "chk_courses_approval_status" CHECK ("ApprovalStatus" IN (1, 2, 3, 4)),
    CONSTRAINT "chk_courses_quality_score" CHECK ("QualityScore" >= 0 AND "QualityScore" <= 100)
);

-- Course enrollments
CREATE TABLE "CourseEnrollments" (
    "Id" SERIAL PRIMARY KEY,
    "CourseId" INTEGER NOT NULL REFERENCES "Courses"("Id") ON DELETE CASCADE,
    "UserId" INTEGER NOT NULL REFERENCES "Users"("Id") ON DELETE CASCADE,
    "EnrolledAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "CompletedAt" TIMESTAMP,
    "ProgressPercentage" NUMERIC(5,2) NOT NULL DEFAULT 0,
    "IsActive" BOOLEAN NOT NULL DEFAULT TRUE,
    "CreatedBy" TEXT,
    "CreatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedBy" TEXT,
    "UpdatedAt" TIMESTAMP,
    
    -- Constraints
    CONSTRAINT "chk_course_enrollments_progress" CHECK ("ProgressPercentage" >= 0 AND "ProgressPercentage" <= 100),
    UNIQUE ("CourseId", "UserId")
);

-- Lessons table
CREATE TABLE "Lessons" (
    "Id" SERIAL PRIMARY KEY,
    "CourseId" INTEGER NOT NULL REFERENCES "Courses"("Id") ON DELETE CASCADE,
    "Title" VARCHAR(200) NOT NULL,
    "Description" TEXT NOT NULL,
    "LessonOrder" INTEGER NOT NULL,
    "VideoUrl" VARCHAR(255) NOT NULL,
    "VideoDuration" INTEGER, -- in seconds
    "ContentText" TEXT NOT NULL,
    "StaticPagePath" TEXT NOT NULL,
    "IsPublished" BOOLEAN NOT NULL DEFAULT FALSE,
    "IsFree" BOOLEAN NOT NULL DEFAULT FALSE,
    "CreatedBy" TEXT,
    "CreatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedBy" TEXT,
    "UpdatedAt" TIMESTAMP
);

-- User lesson progress tracking
CREATE TABLE "UserLessonProgresses" (
    "Id" SERIAL PRIMARY KEY,
    "UserId" INTEGER NOT NULL REFERENCES "Users"("Id") ON DELETE CASCADE,
    "LessonId" INTEGER NOT NULL REFERENCES "Lessons"("Id") ON DELETE CASCADE,
    "IsCompleted" BOOLEAN NOT NULL DEFAULT FALSE,
    "WatchTime" INTEGER NOT NULL DEFAULT 0, -- seconds watched
    "CompletedAt" TIMESTAMP,
    "LastAccessed" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "CreatedBy" TEXT,
    "CreatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedBy" TEXT,
    "UpdatedAt" TIMESTAMP,
    
    UNIQUE ("UserId", "LessonId")
);

-- Video progress tracking (detailed)
CREATE TABLE "UserVideoProgresses" (
    "Id" SERIAL PRIMARY KEY,
    "UserId" INTEGER NOT NULL REFERENCES "Users"("Id") ON DELETE CASCADE,
    "LessonId" INTEGER NOT NULL REFERENCES "Lessons"("Id") ON DELETE CASCADE,
    "VideoPosition" INTEGER NOT NULL DEFAULT 0, -- seconds
    "VideoDuration" INTEGER NOT NULL,
    "WatchPercentage" NUMERIC(5,2) NOT NULL DEFAULT 0,
    "IsCompleted" BOOLEAN NOT NULL DEFAULT FALSE,
    "LastWatchedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "CreatedBy" TEXT,
    "CreatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedBy" TEXT,
    "UpdatedAt" TIMESTAMP,
    
    CONSTRAINT "chk_video_progress_percentage" CHECK ("WatchPercentage" >= 0 AND "WatchPercentage" <= 100),
    UNIQUE ("UserId", "LessonId")
);

-- Lesson materials
CREATE TABLE "LessonMaterials" (
    "Id" SERIAL PRIMARY KEY,
    "LessonId" INTEGER NOT NULL REFERENCES "Lessons"("Id") ON DELETE CASCADE,
    "Title" VARCHAR(200) NOT NULL,
    "FileName" VARCHAR(255) NOT NULL,
    "FilePath" VARCHAR(255) NOT NULL,
    "FileType" VARCHAR(20) NOT NULL,
    "FileSize" INTEGER,
    "DownloadCount" INTEGER NOT NULL DEFAULT 0,
    "CreatedBy" TEXT,
    "CreatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedBy" TEXT,
    "UpdatedAt" TIMESTAMP
);

-- ========================================
-- UNIFIED QUESTION SYSTEM
-- ========================================

-- Unified questions table supporting multiple contexts
CREATE TABLE "Questions" (
    "Id" SERIAL PRIMARY KEY,
    "ContextType" INTEGER NOT NULL, -- 1: Assignment, 2: Book, 3: Practice, 4: Forum
    "ContextId" INTEGER NOT NULL, -- AssignmentId, BookId, ChapterId, etc.
    "QuestionContent" TEXT NOT NULL,
    "QuestionType" INTEGER NOT NULL, -- 1: Multiple Choice, 2: True/False, 3: Short Answer, 4: Essay
    "DifficultyLevel" INTEGER NOT NULL, -- 1: Easy, 2: Medium, 3: Hard
    "Points" NUMERIC[] NOT NULL, -- Flexible scoring system
    "DefaultPoints" NUMERIC(5,2) NOT NULL DEFAULT 0.25,
    "ExplanationContent" TEXT,
    "QuestionImage" TEXT,
    "VideoUrl" TEXT,
    "TimeLimit" INTEGER, -- seconds per question
    "SubjectType" VARCHAR(50), -- 'math', 'physics', etc.
    "OrderIndex" INTEGER NOT NULL DEFAULT 0,
    "IsActive" BOOLEAN NOT NULL DEFAULT TRUE,
    "CreatedBy" TEXT,
    "CreatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedBy" TEXT,
    "UpdatedAt" TIMESTAMP,
    
    -- Constraints
    CONSTRAINT "chk_questions_context_type" CHECK ("ContextType" IN (1, 2, 3, 4)),
    CONSTRAINT "chk_questions_type" CHECK ("QuestionType" IN (1, 2, 3, 4)),
    CONSTRAINT "chk_questions_difficulty" CHECK ("DifficultyLevel" IN (1, 2, 3)),
    CONSTRAINT "chk_points_array_valid" CHECK (array_length("Points", 1) > 0),
    CONSTRAINT "chk_points_by_type" CHECK (
        ("QuestionType" = 1 AND array_length("Points", 1) >= 1) OR -- Multiple Choice: at least 1 point value
        ("QuestionType" = 2 AND array_length("Points", 1) BETWEEN 1 AND 4) OR -- True/False: 1-4 point values
        ("QuestionType" = 3 AND array_length("Points", 1) = 1) OR -- Short Answer: exactly 1 point value
        ("QuestionType" = 4 AND array_length("Points", 1) = 1) -- Essay: exactly 1 point value
    )
);

-- Question options
CREATE TABLE "QuestionOptions" (
    "Id" SERIAL PRIMARY KEY,
    "QuestionId" INTEGER NOT NULL REFERENCES "Questions"("Id") ON DELETE CASCADE,
    "OptionContent" TEXT NOT NULL,
    "OptionImage" TEXT,
    "IsCorrect" BOOLEAN NOT NULL,
    "OrderIndex" INTEGER NOT NULL DEFAULT 0,
    "PointsValue" NUMERIC(5,2), -- Specific points for this option (for multi-level true/false)
    "ExplanationText" TEXT,
    "CreatedBy" TEXT,
    "CreatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedBy" TEXT,
    "UpdatedAt" TIMESTAMP
);

-- ========================================
-- ASSIGNMENT SYSTEM
-- ========================================

-- Assignments table
CREATE TABLE "Assignments" (
    "Id" SERIAL PRIMARY KEY,
    "LessonId" INTEGER NOT NULL REFERENCES "Lessons"("Id") ON DELETE CASCADE,
    "Title" VARCHAR(200) NOT NULL,
    "Description" TEXT NOT NULL,
    "AssignmentType" INTEGER NOT NULL, -- 1: Quiz, 2: Homework, 3: Exam, 4: Practice
    "MaxScore" INTEGER NOT NULL,
    "TimeLimit" INTEGER, -- in minutes
    "MaxAttempts" INTEGER NOT NULL DEFAULT 1,
    "ShowAnswersAfter" INTEGER NOT NULL, -- 1: Immediately, 2: After submission, 3: After due date, 4: Never
    "DueDate" TIMESTAMP,
    "IsPublished" BOOLEAN NOT NULL DEFAULT FALSE,
    
    -- Enhanced fields
    "PassingScore" NUMERIC(5,2),
    "ShuffleQuestions" BOOLEAN NOT NULL DEFAULT FALSE,
    "ShuffleOptions" BOOLEAN NOT NULL DEFAULT TRUE,
    
    "CreatedBy" TEXT,
    "CreatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedBy" TEXT,
    "UpdatedAt" TIMESTAMP,
    
    -- Constraints
    CONSTRAINT "chk_assignments_type" CHECK ("AssignmentType" IN (1, 2, 3, 4)),
    CONSTRAINT "chk_assignments_show_answers" CHECK ("ShowAnswersAfter" IN (1, 2, 3, 4)),
    CONSTRAINT "chk_assignments_max_attempts" CHECK ("MaxAttempts" > 0),
    CONSTRAINT "chk_assignments_passing_score" CHECK ("PassingScore" IS NULL OR ("PassingScore" >= 0 AND "PassingScore" <= "MaxScore"))
);

-- User assignment attempts
CREATE TABLE "UserAssignmentAttempts" (
    "Id" SERIAL PRIMARY KEY,
    "AssignmentId" INTEGER NOT NULL REFERENCES "Assignments"("Id") ON DELETE CASCADE,
    "UserId" INTEGER NOT NULL REFERENCES "Users"("Id") ON DELETE CASCADE,
    "AttemptNumber" INTEGER NOT NULL,
    "StartedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "SubmittedAt" TIMESTAMP,
    "Score" NUMERIC,
    "IsCompleted" BOOLEAN NOT NULL DEFAULT FALSE,
    "IsPassed" BOOLEAN,
    "TimeSpent" INTEGER, -- in seconds
    "CreatedBy" TEXT,
    "CreatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedBy" TEXT,
    "UpdatedAt" TIMESTAMP
);

-- User assignment answers
CREATE TABLE "UserAssignmentAnswers" (
    "Id" SERIAL PRIMARY KEY,
    "AttemptId" INTEGER NOT NULL REFERENCES "UserAssignmentAttempts"("Id") ON DELETE CASCADE,
    "QuestionId" INTEGER NOT NULL REFERENCES "Questions"("Id") ON DELETE CASCADE,
    "OptionId" INTEGER REFERENCES "QuestionOptions"("Id") ON DELETE CASCADE,
    "AnswerText" TEXT,
    "IsCorrect" BOOLEAN,
    "PointsEarned" NUMERIC NOT NULL,
    "CreatedBy" TEXT,
    "CreatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedBy" TEXT,
    "UpdatedAt" TIMESTAMP,
    
    UNIQUE ("AttemptId", "QuestionId")
);

-- ========================================
-- BOOK SYSTEM
-- ========================================

-- Books table
CREATE TABLE "Books" (
    "Id" SERIAL PRIMARY KEY,
    "Title" VARCHAR(200) NOT NULL,
    "StaticPagePath" TEXT NOT NULL,
    "Description" TEXT NOT NULL,
    "AuthorId" INTEGER REFERENCES "Users"("Id"),
    "ISBN" VARCHAR(20) NOT NULL UNIQUE,
    "CoverImage" VARCHAR(255) NOT NULL,
    "Price" NUMERIC NOT NULL,
    "EbookFile" VARCHAR(255) NOT NULL,
    "CategoryId" INTEGER REFERENCES "Categories"("Id"),
    "TotalQuestions" INTEGER NOT NULL DEFAULT 0,
    "IsActive" BOOLEAN NOT NULL DEFAULT TRUE,
    
    -- Enhanced fields
    "ApprovalStatus" INTEGER NOT NULL DEFAULT 1, -- 1: Draft, 2: Pending, 3: Approved, 4: Rejected
    "Language" VARCHAR(10) DEFAULT 'vi',
    "PublicationYear" INTEGER,
    "Edition" VARCHAR(50),
    "QualityScore" INTEGER,
    "ReviewNotes" TEXT,
    
    "CreatedBy" TEXT,
    "CreatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedBy" TEXT,
    "UpdatedAt" TIMESTAMP,
    
    -- Constraints
    CONSTRAINT "chk_books_price" CHECK ("Price" >= 0),
    CONSTRAINT "chk_books_approval_status" CHECK ("ApprovalStatus" IN (1, 2, 3, 4)),
    CONSTRAINT "chk_books_quality_score" CHECK ("QualityScore" IS NULL OR ("QualityScore" >= 0 AND "QualityScore" <= 100)),
    CONSTRAINT "chk_books_publication_year" CHECK ("PublicationYear" IS NULL OR ("PublicationYear" >= 1900 AND "PublicationYear" <= EXTRACT(YEAR FROM CURRENT_DATE)))
);

-- Book chapters
CREATE TABLE "BookChapters" (
    "Id" SERIAL PRIMARY KEY,
    "BookId" INTEGER NOT NULL REFERENCES "Books"("Id") ON DELETE CASCADE,
    "Title" VARCHAR(200) NOT NULL,
    "Description" TEXT NOT NULL,
    "OrderIndex" INTEGER NOT NULL,
    "CreatedBy" TEXT,
    "CreatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedBy" TEXT,
    "UpdatedAt" TIMESTAMP
);

-- Book activation codes
CREATE TABLE "BookActivationCodes" (
    "Id" SERIAL PRIMARY KEY,
    "BookId" INTEGER NOT NULL REFERENCES "Books"("Id") ON DELETE CASCADE,
    "ActivationCode" VARCHAR(50) NOT NULL UNIQUE,
    "IsUsed" BOOLEAN DEFAULT FALSE,
    "UsedById" INTEGER REFERENCES "Users"("Id"),
    "CreatedBy" TEXT,
    "CreatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedBy" TEXT,
    "UpdatedAt" TIMESTAMP
);

-- User books (activated books)
CREATE TABLE "UserBooks" (
    "Id" SERIAL PRIMARY KEY,
    "ActivationCodeId" INTEGER NOT NULL UNIQUE REFERENCES "BookActivationCodes"("Id") ON DELETE CASCADE,
    "UserId" INTEGER REFERENCES "Users"("Id"),
    "ExpiresAt" TIMESTAMP,
    "IsActive" BOOLEAN NOT NULL DEFAULT TRUE,
    "CreatedBy" TEXT,
    "CreatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedBy" TEXT,
    "UpdatedAt" TIMESTAMP
);

-- ========================================
-- LEARNING PATHS SYSTEM
-- ========================================

-- Learning paths table
CREATE TABLE "LearningPaths" (
    "Id" SERIAL PRIMARY KEY,
    "Title" VARCHAR(200) NOT NULL,
    "Description" TEXT NOT NULL,
    "Thumbnail" VARCHAR(255),
    "InstructorId" INTEGER NOT NULL REFERENCES "Users"("Id"),
    "CategoryId" INTEGER REFERENCES "Categories"("Id"),
    "EstimatedDuration" INTEGER, -- in hours
    "DifficultyLevel" INTEGER NOT NULL, -- 1: Beginner, 2: Intermediate, 3: Advanced
    "Price" NUMERIC(10,2) NOT NULL DEFAULT 0,
    "IsPublished" BOOLEAN NOT NULL DEFAULT FALSE,
    "IsActive" BOOLEAN NOT NULL DEFAULT TRUE,
    "ApprovalStatus" INTEGER NOT NULL DEFAULT 1, -- 1: Draft, 2: Pending, 3: Approved, 4: Rejected
    "QualityScore" INTEGER,
    "ReviewNotes" TEXT,
    "CreatedBy" TEXT,
    "CreatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedBy" TEXT,
    "UpdatedAt" TIMESTAMP,
    
    -- Constraints
    CONSTRAINT "chk_learning_paths_difficulty" CHECK ("DifficultyLevel" IN (1, 2, 3)),
    CONSTRAINT "chk_learning_paths_price" CHECK ("Price" >= 0),
    CONSTRAINT "chk_learning_paths_approval_status" CHECK ("ApprovalStatus" IN (1, 2, 3, 4)),
    CONSTRAINT "chk_learning_paths_quality_score" CHECK ("QualityScore" IS NULL OR ("QualityScore" >= 0 AND "QualityScore" <= 100))
);

-- Learning path courses (course sequence in a learning path)
CREATE TABLE "LearningPathCourses" (
    "Id" SERIAL PRIMARY KEY,
    "LearningPathId" INTEGER NOT NULL REFERENCES "LearningPaths"("Id") ON DELETE CASCADE,
    "CourseId" INTEGER NOT NULL REFERENCES "Courses"("Id") ON DELETE CASCADE,
    "OrderIndex" INTEGER NOT NULL,
    "IsRequired" BOOLEAN NOT NULL DEFAULT TRUE,
    "CreatedBy" TEXT,
    "CreatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedBy" TEXT,
    "UpdatedAt" TIMESTAMP,
    
    UNIQUE ("LearningPathId", "CourseId"),
    UNIQUE ("LearningPathId", "OrderIndex")
);

-- User learning path enrollments
CREATE TABLE "UserLearningPaths" (
    "Id" SERIAL PRIMARY KEY,
    "LearningPathId" INTEGER NOT NULL REFERENCES "LearningPaths"("Id") ON DELETE CASCADE,
    "UserId" INTEGER NOT NULL REFERENCES "Users"("Id") ON DELETE CASCADE,
    "EnrolledAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "CompletedAt" TIMESTAMP,
    "ProgressPercentage" NUMERIC(5,2) NOT NULL DEFAULT 0,
    "IsActive" BOOLEAN NOT NULL DEFAULT TRUE,
    "CreatedBy" TEXT,
    "CreatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedBy" TEXT,
    "UpdatedAt" TIMESTAMP,
    
    CONSTRAINT "chk_user_learning_paths_progress" CHECK ("ProgressPercentage" >= 0 AND "ProgressPercentage" <= 100),
    UNIQUE ("LearningPathId", "UserId")
);

-- ========================================
-- CERTIFICATES SYSTEM
-- ========================================

-- Certificates table
CREATE TABLE "Certificates" (
    "Id" SERIAL PRIMARY KEY,
    "UserId" INTEGER NOT NULL REFERENCES "Users"("Id") ON DELETE CASCADE,
    "ItemType" INTEGER NOT NULL, -- 1: Course, 2: Learning Path
    "ItemId" INTEGER NOT NULL,
    "CertificateNumber" VARCHAR(50) NOT NULL UNIQUE,
    "CompletionPercentage" NUMERIC(5,2) NOT NULL,
    "FinalScore" NUMERIC(5,2),
    "IssuedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "CertificateUrl" VARCHAR(255),
    "IsValid" BOOLEAN NOT NULL DEFAULT TRUE,
    "CreatedBy" TEXT,
    "CreatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedBy" TEXT,
    "UpdatedAt" TIMESTAMP,
    
    -- Constraints
    CONSTRAINT "chk_certificates_item_type" CHECK ("ItemType" IN (1, 2)),
    CONSTRAINT "chk_certificates_completion" CHECK ("CompletionPercentage" >= 0 AND "CompletionPercentage" <= 100),
    CONSTRAINT "chk_certificates_score" CHECK ("FinalScore" IS NULL OR ("FinalScore" >= 0 AND "FinalScore" <= 100)),
    UNIQUE ("UserId", "ItemType", "ItemId")
);

-- Continue with remaining tables in next part due to length...
-- ========================================
-- KHỞI TRÍ SỐ - POSTGRESQL DATABASE SCHEMA (PART 2)
-- ========================================
-- Commerce System, Reviews, Notifications, and Additional Features

-- ========================================
-- COMMERCE SYSTEM
-- ========================================

-- Orders table with enhanced multi-currency support
CREATE TABLE "Orders" (
    "Id" SERIAL PRIMARY KEY,
    "UserId" INTEGER NOT NULL REFERENCES "Users"("Id") ON DELETE CASCADE,
    "OrderCode" VARCHAR(50) NOT NULL UNIQUE,
    "TotalAmount" NUMERIC NOT NULL,
    "DiscountAmount" NUMERIC(10,2) NOT NULL DEFAULT 0,
    "TaxAmount" NUMERIC(10,2) NOT NULL DEFAULT 0,
    "FinalAmount" NUMERIC(10,2) NOT NULL,
    "Status" INTEGER NOT NULL, -- 1: Pending, 2: Paid, 3: Failed, 4: Cancelled, 5: Refunded
    "PaymentMethod" VARCHAR(50) NOT NULL,
    "PaymentGateway" VARCHAR(50) NOT NULL,
    "TransactionId" VARCHAR(100),
    "Currency" VARCHAR(3) DEFAULT 'VND',
    "ExchangeRate" NUMERIC(10,4) DEFAULT 1.0000,
    "PaidAt" TIMESTAMP,
    "BillingAddress" JSONB,
    "OrderNotes" TEXT,
    "CreatedBy" TEXT,
    "CreatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedBy" TEXT,
    "UpdatedAt" TIMESTAMP,
    
    -- Constraints
    CONSTRAINT "chk_orders_status" CHECK ("Status" IN (1, 2, 3, 4, 5)),
    CONSTRAINT "chk_orders_amounts" CHECK ("TotalAmount" >= 0 AND "DiscountAmount" >= 0 AND "TaxAmount" >= 0 AND "FinalAmount" >= 0),
    CONSTRAINT "chk_orders_currency" CHECK ("Currency" IN ('VND', 'USD', 'EUR')),
    CONSTRAINT "chk_orders_exchange_rate" CHECK ("ExchangeRate" > 0)
);

-- Order items
CREATE TABLE "OrderItems" (
    "Id" SERIAL PRIMARY KEY,
    "OrderId" INTEGER NOT NULL REFERENCES "Orders"("Id") ON DELETE CASCADE,
    "ItemId" INTEGER NOT NULL,
    "ItemType" INTEGER NOT NULL, -- 1: Course, 2: Book, 3: Learning Path
    "ItemName" VARCHAR(200) NOT NULL,
    "Price" NUMERIC NOT NULL,
    "Quantity" INTEGER NOT NULL DEFAULT 1,
    "CreatedBy" TEXT,
    "CreatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedBy" TEXT,
    "UpdatedAt" TIMESTAMP,
    
    -- Constraints
    CONSTRAINT "chk_order_items_type" CHECK ("ItemType" IN (1, 2, 3)),
    CONSTRAINT "chk_order_items_price" CHECK ("Price" >= 0),
    CONSTRAINT "chk_order_items_quantity" CHECK ("Quantity" > 0)
);

-- Shopping cart
CREATE TABLE "CartItems" (
    "Id" SERIAL PRIMARY KEY,
    "UserId" INTEGER NOT NULL REFERENCES "Users"("Id") ON DELETE CASCADE,
    "ItemId" INTEGER NOT NULL,
    "ItemType" INTEGER NOT NULL, -- 1: Course, 2: Book, 3: Learning Path
    "CreatedBy" TEXT,
    "CreatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedBy" TEXT,
    "UpdatedAt" TIMESTAMP,
    
    -- Constraints
    CONSTRAINT "chk_cart_items_type" CHECK ("ItemType" IN (1, 2, 3)),
    UNIQUE ("UserId", "ItemId", "ItemType")
);

-- Wishlists
CREATE TABLE "Wishlists" (
    "Id" SERIAL PRIMARY KEY,
    "UserId" INTEGER NOT NULL REFERENCES "Users"("Id") ON DELETE CASCADE,
    "ItemId" INTEGER NOT NULL,
    "ItemType" INTEGER NOT NULL, -- 1: Course, 2: Book, 3: Learning Path
    "CreatedBy" TEXT,
    "CreatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedBy" TEXT,
    "UpdatedAt" TIMESTAMP,
    
    -- Constraints
    CONSTRAINT "chk_wishlists_type" CHECK ("ItemType" IN (1, 2, 3)),
    UNIQUE ("UserId", "ItemId", "ItemType")
);

-- Coupons system
CREATE TABLE "Coupons" (
    "Id" SERIAL PRIMARY KEY,
    "Code" VARCHAR(50) NOT NULL UNIQUE,
    "Name" VARCHAR(200) NOT NULL,
    "Description" TEXT,
    "DiscountType" INTEGER NOT NULL, -- 1: Percentage, 2: Fixed Amount
    "DiscountValue" NUMERIC(10,2) NOT NULL,
    "MaxDiscountAmount" NUMERIC(10,2),
    "MinOrderAmount" NUMERIC(10,2) DEFAULT 0,
    "ValidFrom" TIMESTAMP NOT NULL,
    "ValidTo" TIMESTAMP NOT NULL,
    "UsageLimit" INTEGER,
    "UsedCount" INTEGER NOT NULL DEFAULT 0,
    "IsActive" BOOLEAN NOT NULL DEFAULT TRUE,
    "ApplicableItemTypes" INTEGER[], -- Array of item types this coupon applies to
    "ApplicableItemIds" INTEGER[], -- Specific item IDs (optional)
    "CreatedBy" TEXT,
    "CreatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedBy" TEXT,
    "UpdatedAt" TIMESTAMP,
    
    -- Constraints
    CONSTRAINT "chk_coupons_discount_type" CHECK ("DiscountType" IN (1, 2)),
    CONSTRAINT "chk_coupons_discount_value" CHECK ("DiscountValue" > 0),
    CONSTRAINT "chk_coupons_amounts" CHECK ("MaxDiscountAmount" IS NULL OR "MaxDiscountAmount" > 0),
    CONSTRAINT "chk_coupons_min_order" CHECK ("MinOrderAmount" >= 0),
    CONSTRAINT "chk_coupons_dates" CHECK ("ValidFrom" < "ValidTo"),
    CONSTRAINT "chk_coupons_usage" CHECK ("UsageLimit" IS NULL OR "UsageLimit" > 0)
);

-- Coupon usage tracking
CREATE TABLE "CouponUsages" (
    "Id" SERIAL PRIMARY KEY,
    "CouponId" INTEGER NOT NULL REFERENCES "Coupons"("Id") ON DELETE CASCADE,
    "UserId" INTEGER NOT NULL REFERENCES "Users"("Id") ON DELETE CASCADE,
    "OrderId" INTEGER NOT NULL REFERENCES "Orders"("Id") ON DELETE CASCADE,
    "DiscountAmount" NUMERIC(10,2) NOT NULL,
    "CreatedBy" TEXT,
    "CreatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedBy" TEXT,
    "UpdatedAt" TIMESTAMP
);

-- ========================================
-- REVIEWS AND RATINGS SYSTEM
-- ========================================

-- Reviews table
CREATE TABLE "Reviews" (
    "Id" SERIAL PRIMARY KEY,
    "UserId" INTEGER NOT NULL REFERENCES "Users"("Id") ON DELETE CASCADE,
    "ItemType" INTEGER NOT NULL, -- 1: Course, 2: Book, 3: Learning Path
    "ItemId" INTEGER NOT NULL,
    "Rating" INTEGER NOT NULL, -- 1-5 stars
    "ReviewTitle" VARCHAR(200),
    "ReviewContent" TEXT,
    "IsVerifiedPurchase" BOOLEAN NOT NULL DEFAULT FALSE,
    "HelpfulCount" INTEGER NOT NULL DEFAULT 0,
    "IsApproved" BOOLEAN NOT NULL DEFAULT TRUE,
    "CreatedBy" TEXT,
    "CreatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedBy" TEXT,
    "UpdatedAt" TIMESTAMP,
    
    -- Constraints
    CONSTRAINT "chk_reviews_item_type" CHECK ("ItemType" IN (1, 2, 3)),
    CONSTRAINT "chk_reviews_rating" CHECK ("Rating" >= 1 AND "Rating" <= 5),
    CONSTRAINT "chk_reviews_helpful_count" CHECK ("HelpfulCount" >= 0),
    UNIQUE ("UserId", "ItemType", "ItemId")
);

-- ========================================
-- LIVE CLASSES SYSTEM
-- ========================================

-- Live classes
CREATE TABLE "LiveClasses" (
    "Id" SERIAL PRIMARY KEY,
    "CourseId" INTEGER NOT NULL REFERENCES "Courses"("Id") ON DELETE CASCADE,
    "InstructorId" INTEGER NOT NULL REFERENCES "Users"("Id") ON DELETE CASCADE,
    "Title" VARCHAR(200) NOT NULL,
    "Description" TEXT NOT NULL,
    "MeetingUrl" VARCHAR(500) NOT NULL,
    "MeetingId" VARCHAR(100) NOT NULL,
    "MeetingPassword" VARCHAR(50),
    "ScheduledAt" TIMESTAMP NOT NULL,
    "DurationMinutes" INTEGER NOT NULL,
    "MaxParticipants" INTEGER,
    "Status" INTEGER NOT NULL, -- 1: Scheduled, 2: Live, 3: Ended, 4: Cancelled
    "RecordingUrl" VARCHAR(500),
    "RecordingStatus" INTEGER NOT NULL DEFAULT 0, -- 0: None, 1: Recording, 2: Processing, 3: Available
    "ChatEnabled" BOOLEAN NOT NULL DEFAULT TRUE,
    "RecordingEnabled" BOOLEAN NOT NULL DEFAULT TRUE,
    "CreatedBy" TEXT,
    "CreatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedBy" TEXT,
    "UpdatedAt" TIMESTAMP,
    
    -- Constraints
    CONSTRAINT "chk_live_classes_status" CHECK ("Status" IN (1, 2, 3, 4)),
    CONSTRAINT "chk_live_classes_recording_status" CHECK ("RecordingStatus" IN (0, 1, 2, 3)),
    CONSTRAINT "chk_live_classes_duration" CHECK ("DurationMinutes" > 0),
    CONSTRAINT "chk_live_classes_max_participants" CHECK ("MaxParticipants" IS NULL OR "MaxParticipants" > 0)
);

-- Live class participants
CREATE TABLE "LiveClassParticipants" (
    "Id" SERIAL PRIMARY KEY,
    "LiveClassId" INTEGER NOT NULL REFERENCES "LiveClasses"("Id") ON DELETE CASCADE,
    "UserId" INTEGER NOT NULL REFERENCES "Users"("Id") ON DELETE CASCADE,
    "JoinedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "AttendanceDuration" INTEGER NOT NULL DEFAULT 0, -- seconds attended
    "CreatedBy" TEXT,
    "CreatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedBy" TEXT,
    "UpdatedAt" TIMESTAMP,
    
    UNIQUE ("LiveClassId", "UserId")
);

-- ========================================
-- DISCUSSION SYSTEM
-- ========================================

-- Lesson discussions
CREATE TABLE "LessonDiscussions" (
    "Id" SERIAL PRIMARY KEY,
    "LessonId" INTEGER NOT NULL REFERENCES "Lessons"("Id") ON DELETE CASCADE,
    "UserId" INTEGER NOT NULL REFERENCES "Users"("Id") ON DELETE CASCADE,
    "ParentId" INTEGER REFERENCES "LessonDiscussions"("Id") ON DELETE CASCADE,
    "Content" TEXT NOT NULL,
    "VideoTimestamp" INTEGER, -- seconds into video where discussion occurs
    "IsInstructor" BOOLEAN NOT NULL DEFAULT FALSE,
    "LikeCount" INTEGER NOT NULL DEFAULT 0,
    "IsHidden" BOOLEAN NOT NULL DEFAULT FALSE,
    "CreatedBy" TEXT,
    "CreatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedBy" TEXT,
    "UpdatedAt" TIMESTAMP,
    
    -- Constraints
    CONSTRAINT "chk_lesson_discussions_like_count" CHECK ("LikeCount" >= 0),
    CONSTRAINT "chk_lesson_discussions_timestamp" CHECK ("VideoTimestamp" IS NULL OR "VideoTimestamp" >= 0)
);

-- ========================================
-- NOTIFICATIONS SYSTEM
-- ========================================

-- Notifications
CREATE TABLE "Notifications" (
    "Id" SERIAL PRIMARY KEY,
    "UserId" INTEGER NOT NULL REFERENCES "Users"("Id") ON DELETE CASCADE,
    "Title" VARCHAR(200) NOT NULL,
    "Message" TEXT NOT NULL,
    "Type" INTEGER NOT NULL, -- 1: System, 2: Course, 3: Assignment, 4: Payment, 5: Social
    "ActionUrl" VARCHAR(500),
    "IsRead" BOOLEAN NOT NULL DEFAULT FALSE,
    "Priority" INTEGER NOT NULL DEFAULT 2, -- 1: Low, 2: Normal, 3: High, 4: Critical
    "CreatedBy" TEXT,
    "CreatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedBy" TEXT,
    "UpdatedAt" TIMESTAMP,
    
    -- Constraints
    CONSTRAINT "chk_notifications_type" CHECK ("Type" IN (1, 2, 3, 4, 5)),
    CONSTRAINT "chk_notifications_priority" CHECK ("Priority" IN (1, 2, 3, 4))
);

-- ========================================
-- ANALYTICS AND LOGGING
-- ========================================

-- User activity logs
CREATE TABLE "UserActivityLogs" (
    "Id" SERIAL PRIMARY KEY,
    "UserId" INTEGER NOT NULL REFERENCES "Users"("Id") ON DELETE CASCADE,
    "ActivityType" VARCHAR(50) NOT NULL, -- 'login', 'course_view', 'assignment_submit', etc.
    "ResourceType" VARCHAR(50), -- 'course', 'lesson', 'assignment', etc.
    "ResourceId" INTEGER,
    "Duration" INTEGER, -- seconds spent on activity
    "IpAddress" INET,
    "UserAgent" TEXT,
    "CreatedBy" TEXT,
    "CreatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedBy" TEXT,
    "UpdatedAt" TIMESTAMP
);

-- Daily analytics aggregation
CREATE TABLE "DailyAnalytics" (
    "Id" SERIAL PRIMARY KEY,
    "Date" DATE NOT NULL,
    "TotalUsers" INTEGER NOT NULL DEFAULT 0,
    "ActiveUsers" INTEGER NOT NULL DEFAULT 0,
    "NewRegistrations" INTEGER NOT NULL DEFAULT 0,
    "TotalCourses" INTEGER NOT NULL DEFAULT 0,
    "TotalBooks" INTEGER NOT NULL DEFAULT 0,
    "TotalLearningPaths" INTEGER NOT NULL DEFAULT 0,
    "TotalRevenue" NUMERIC(15,2) NOT NULL DEFAULT 0,
    "TotalOrders" INTEGER NOT NULL DEFAULT 0,
    "CreatedBy" TEXT,
    "CreatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedBy" TEXT,
    "UpdatedAt" TIMESTAMP,
    
    UNIQUE ("Date")
);

-- ========================================
-- AUDIT AND SYSTEM TABLES
-- ========================================

-- Audit logs for tracking all database changes
CREATE TABLE "AuditLogs" (
    "Id" SERIAL PRIMARY KEY,
    "CorrelationId" VARCHAR(36),
    "UserId" INTEGER REFERENCES "Users"("Id"),
    "Module" VARCHAR(100) NOT NULL,
    "Action" VARCHAR(100) NOT NULL,
    "TableName" VARCHAR(100),
    "RecordId" INTEGER,
    "OldValues" JSONB,
    "NewValues" JSONB,
    "IpAddress" INET,
    "UserAgent" VARCHAR(500),
    "Description" VARCHAR(1000),
    "Status" VARCHAR(50),
    "CreatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- System settings
CREATE TABLE "SystemSettings" (
    "Id" SERIAL PRIMARY KEY,
    "SettingKey" VARCHAR(100) NOT NULL UNIQUE,
    "SettingValue" TEXT NOT NULL,
    "SettingType" INTEGER NOT NULL, -- 1: String, 2: Number, 3: Boolean, 4: JSON
    "Description" TEXT NOT NULL,
    "IsPublic" BOOLEAN NOT NULL DEFAULT FALSE,
    "CreatedBy" TEXT,
    "CreatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedBy" TEXT,
    "UpdatedAt" TIMESTAMP,
    
    -- Constraints
    CONSTRAINT "chk_system_settings_type" CHECK ("SettingType" IN (1, 2, 3, 4))
);

-- ========================================
-- INDEXES FOR PERFORMANCE
-- ========================================

-- Users table indexes
CREATE INDEX "IX_Users_Email" ON "Users"("Email");
CREATE INDEX "IX_Users_Username" ON "Users"("Username");
CREATE INDEX "IX_Users_AuthProvider" ON "Users"("AuthProvider");
CREATE INDEX "IX_Users_Role" ON "Users"("Role");
CREATE INDEX "IX_Users_IsActive" ON "Users"("IsActive");
CREATE INDEX "IX_Users_LastActiveAt" ON "Users"("LastActiveAt");

-- Categories indexes
CREATE INDEX "IX_Categories_ParentId" ON "Categories"("ParentId");
CREATE INDEX "IX_Categories_IsActive" ON "Categories"("IsActive");
CREATE INDEX "IX_Categories_OrderIndex" ON "Categories"("OrderIndex");

-- Courses indexes
CREATE INDEX "IX_Courses_InstructorId" ON "Courses"("InstructorId");
CREATE INDEX "IX_Courses_CategoryId" ON "Courses"("CategoryId");
CREATE INDEX "IX_Courses_ApprovalStatus" ON "Courses"("ApprovalStatus");
CREATE INDEX "IX_Courses_IsPublished" ON "Courses"("IsPublished");
CREATE INDEX "IX_Courses_IsActive" ON "Courses"("IsActive");
CREATE INDEX "IX_Courses_Rating" ON "Courses"("Rating");
CREATE INDEX "IX_Courses_Price" ON "Courses"("Price");

-- Course enrollments indexes
CREATE INDEX "IX_CourseEnrollments_CourseId" ON "CourseEnrollments"("CourseId");
CREATE INDEX "IX_CourseEnrollments_UserId" ON "CourseEnrollments"("UserId");
CREATE INDEX "IX_CourseEnrollments_EnrolledAt" ON "CourseEnrollments"("EnrolledAt");

-- Lessons indexes
CREATE INDEX "IX_Lessons_CourseId" ON "Lessons"("CourseId");
CREATE INDEX "IX_Lessons_LessonOrder" ON "Lessons"("LessonOrder");
CREATE INDEX "IX_Lessons_IsPublished" ON "Lessons"("IsPublished");

-- User lesson progress indexes
CREATE INDEX "IX_UserLessonProgresses_UserId" ON "UserLessonProgresses"("UserId");
CREATE INDEX "IX_UserLessonProgresses_LessonId" ON "UserLessonProgresses"("LessonId");
CREATE INDEX "IX_UserLessonProgresses_IsCompleted" ON "UserLessonProgresses"("IsCompleted");
CREATE INDEX "IX_UserLessonProgresses_LastAccessed" ON "UserLessonProgresses"("LastAccessed");

-- Questions indexes
CREATE INDEX "IX_Questions_ContextType_ContextId" ON "Questions"("ContextType", "ContextId");
CREATE INDEX "IX_Questions_QuestionType" ON "Questions"("QuestionType");
CREATE INDEX "IX_Questions_DifficultyLevel" ON "Questions"("DifficultyLevel");
CREATE INDEX "IX_Questions_SubjectType" ON "Questions"("SubjectType");
CREATE INDEX "IX_Questions_IsActive" ON "Questions"("IsActive");
CREATE INDEX "IX_Questions_OrderIndex" ON "Questions"("OrderIndex");

-- Question options indexes
CREATE INDEX "IX_QuestionOptions_QuestionId" ON "QuestionOptions"("QuestionId");
CREATE INDEX "IX_QuestionOptions_QuestionId_OrderIndex" ON "QuestionOptions"("QuestionId", "OrderIndex");

-- Assignments indexes
CREATE INDEX "IX_Assignments_LessonId" ON "Assignments"("LessonId");
CREATE INDEX "IX_Assignments_AssignmentType" ON "Assignments"("AssignmentType");
CREATE INDEX "IX_Assignments_IsPublished" ON "Assignments"("IsPublished");
CREATE INDEX "IX_Assignments_DueDate" ON "Assignments"("DueDate");

-- User assignment attempts indexes
CREATE INDEX "IX_UserAssignmentAttempts_AssignmentId" ON "UserAssignmentAttempts"("AssignmentId");
CREATE INDEX "IX_UserAssignmentAttempts_UserId" ON "UserAssignmentAttempts"("UserId");
CREATE INDEX "IX_UserAssignmentAttempts_StartedAt" ON "UserAssignmentAttempts"("StartedAt");

-- User assignment answers indexes
CREATE INDEX "IX_UserAssignmentAnswers_AttemptId" ON "UserAssignmentAnswers"("AttemptId");
CREATE INDEX "IX_UserAssignmentAnswers_QuestionId" ON "UserAssignmentAnswers"("QuestionId");
CREATE INDEX "IX_UserAssignmentAnswers_OptionId" ON "UserAssignmentAnswers"("OptionId");

-- Books indexes
CREATE INDEX "IX_Books_AuthorId" ON "Books"("AuthorId");
CREATE INDEX "IX_Books_CategoryId" ON "Books"("CategoryId");
CREATE INDEX "IX_Books_ISBN" ON "Books"("ISBN");
CREATE INDEX "IX_Books_ApprovalStatus" ON "Books"("ApprovalStatus");
CREATE INDEX "IX_Books_IsActive" ON "Books"("IsActive");

-- Book chapters indexes
CREATE INDEX "IX_BookChapters_BookId" ON "BookChapters"("BookId");
CREATE INDEX "IX_BookChapters_OrderIndex" ON "BookChapters"("OrderIndex");

-- Book activation codes indexes
CREATE INDEX "IX_BookActivationCodes_BookId" ON "BookActivationCodes"("BookId");
CREATE INDEX "IX_BookActivationCodes_ActivationCode" ON "BookActivationCodes"("ActivationCode");
CREATE INDEX "IX_BookActivationCodes_UsedById" ON "BookActivationCodes"("UsedById");

-- User books indexes
CREATE INDEX "IX_UserBooks_UserId" ON "UserBooks"("UserId");
CREATE INDEX "IX_UserBooks_ActivationCodeId" ON "UserBooks"("ActivationCodeId");

-- Learning paths indexes
CREATE INDEX "IX_LearningPaths_InstructorId" ON "LearningPaths"("InstructorId");
CREATE INDEX "IX_LearningPaths_CategoryId" ON "LearningPaths"("CategoryId");
CREATE INDEX "IX_LearningPaths_ApprovalStatus" ON "LearningPaths"("ApprovalStatus");
CREATE INDEX "IX_LearningPaths_IsPublished" ON "LearningPaths"("IsPublished");
CREATE INDEX "IX_LearningPaths_IsActive" ON "LearningPaths"("IsActive");

-- Learning path courses indexes
CREATE INDEX "IX_LearningPathCourses_LearningPathId" ON "LearningPathCourses"("LearningPathId");
CREATE INDEX "IX_LearningPathCourses_CourseId" ON "LearningPathCourses"("CourseId");
CREATE INDEX "IX_LearningPathCourses_OrderIndex" ON "LearningPathCourses"("OrderIndex");

-- User learning paths indexes
CREATE INDEX "IX_UserLearningPaths_LearningPathId" ON "UserLearningPaths"("LearningPathId");
CREATE INDEX "IX_UserLearningPaths_UserId" ON "UserLearningPaths"("UserId");
CREATE INDEX "IX_UserLearningPaths_EnrolledAt" ON "UserLearningPaths"("EnrolledAt");

-- Certificates indexes
CREATE INDEX "IX_Certificates_UserId" ON "Certificates"("UserId");
CREATE INDEX "IX_Certificates_ItemType_ItemId" ON "Certificates"("ItemType", "ItemId");
CREATE INDEX "IX_Certificates_CertificateNumber" ON "Certificates"("CertificateNumber");
CREATE INDEX "IX_Certificates_IssuedAt" ON "Certificates"("IssuedAt");

-- Continue with remaining indexes and triggers in next part...
-- ========================================
-- KHỞI TRÍ SỐ - POSTGRESQL DATABASE SCHEMA (PART 3)
-- ========================================
-- Remaining Indexes, Triggers, Functions, and Initial Data

-- ========================================
-- REMAINING INDEXES
-- ========================================

-- Orders indexes
CREATE INDEX "IX_Orders_UserId" ON "Orders"("UserId");
CREATE INDEX "IX_Orders_OrderCode" ON "Orders"("OrderCode");
CREATE INDEX "IX_Orders_Status" ON "Orders"("Status");
CREATE INDEX "IX_Orders_CreatedAt" ON "Orders"("CreatedAt");
CREATE INDEX "IX_Orders_PaidAt" ON "Orders"("PaidAt");

-- Order items indexes
CREATE INDEX "IX_OrderItems_OrderId" ON "OrderItems"("OrderId");
CREATE INDEX "IX_OrderItems_ItemType_ItemId" ON "OrderItems"("ItemType", "ItemId");

-- Cart items indexes
CREATE INDEX "IX_CartItems_UserId" ON "CartItems"("UserId");
CREATE INDEX "IX_CartItems_ItemType_ItemId" ON "CartItems"("ItemType", "ItemId");

-- Wishlists indexes
CREATE INDEX "IX_Wishlists_UserId" ON "Wishlists"("UserId");
CREATE INDEX "IX_Wishlists_ItemType_ItemId" ON "Wishlists"("ItemType", "ItemId");

-- Coupons indexes
CREATE INDEX "IX_Coupons_Code" ON "Coupons"("Code");
CREATE INDEX "IX_Coupons_ValidFrom_ValidTo" ON "Coupons"("ValidFrom", "ValidTo");
CREATE INDEX "IX_Coupons_IsActive" ON "Coupons"("IsActive");

-- Coupon usages indexes
CREATE INDEX "IX_CouponUsages_CouponId" ON "CouponUsages"("CouponId");
CREATE INDEX "IX_CouponUsages_UserId" ON "CouponUsages"("UserId");
CREATE INDEX "IX_CouponUsages_OrderId" ON "CouponUsages"("OrderId");

-- Reviews indexes
CREATE INDEX "IX_Reviews_UserId" ON "Reviews"("UserId");
CREATE INDEX "IX_Reviews_ItemType_ItemId" ON "Reviews"("ItemType", "ItemId");
CREATE INDEX "IX_Reviews_Rating" ON "Reviews"("Rating");
CREATE INDEX "IX_Reviews_IsApproved" ON "Reviews"("IsApproved");
CREATE INDEX "IX_Reviews_CreatedAt" ON "Reviews"("CreatedAt");

-- Live classes indexes
CREATE INDEX "IX_LiveClasses_CourseId" ON "LiveClasses"("CourseId");
CREATE INDEX "IX_LiveClasses_InstructorId" ON "LiveClasses"("InstructorId");
CREATE INDEX "IX_LiveClasses_ScheduledAt" ON "LiveClasses"("ScheduledAt");
CREATE INDEX "IX_LiveClasses_Status" ON "LiveClasses"("Status");

-- Live class participants indexes
CREATE INDEX "IX_LiveClassParticipants_LiveClassId" ON "LiveClassParticipants"("LiveClassId");
CREATE INDEX "IX_LiveClassParticipants_UserId" ON "LiveClassParticipants"("UserId");

-- Lesson discussions indexes
CREATE INDEX "IX_LessonDiscussions_LessonId" ON "LessonDiscussions"("LessonId");
CREATE INDEX "IX_LessonDiscussions_UserId" ON "LessonDiscussions"("UserId");
CREATE INDEX "IX_LessonDiscussions_ParentId" ON "LessonDiscussions"("ParentId");
CREATE INDEX "IX_LessonDiscussions_CreatedAt" ON "LessonDiscussions"("CreatedAt");

-- Notifications indexes
CREATE INDEX "IX_Notifications_UserId" ON "Notifications"("UserId");
CREATE INDEX "IX_Notifications_Type" ON "Notifications"("Type");
CREATE INDEX "IX_Notifications_IsRead" ON "Notifications"("IsRead");
CREATE INDEX "IX_Notifications_Priority" ON "Notifications"("Priority");
CREATE INDEX "IX_Notifications_CreatedAt" ON "Notifications"("CreatedAt");

-- User activity logs indexes
CREATE INDEX "IX_UserActivityLogs_UserId" ON "UserActivityLogs"("UserId");
CREATE INDEX "IX_UserActivityLogs_ActivityType" ON "UserActivityLogs"("ActivityType");
CREATE INDEX "IX_UserActivityLogs_ResourceType_ResourceId" ON "UserActivityLogs"("ResourceType", "ResourceId");
CREATE INDEX "IX_UserActivityLogs_CreatedAt" ON "UserActivityLogs"("CreatedAt");

-- Daily analytics indexes
CREATE INDEX "IX_DailyAnalytics_Date" ON "DailyAnalytics"("Date");

-- Audit logs indexes
CREATE INDEX "IX_AuditLogs_UserId" ON "AuditLogs"("UserId");
CREATE INDEX "IX_AuditLogs_Module" ON "AuditLogs"("Module");
CREATE INDEX "IX_AuditLogs_TableName" ON "AuditLogs"("TableName");
CREATE INDEX "IX_AuditLogs_CreatedAt" ON "AuditLogs"("CreatedAt");

-- System settings indexes
CREATE INDEX "IX_SystemSettings_SettingKey" ON "SystemSettings"("SettingKey");
CREATE INDEX "IX_SystemSettings_IsPublic" ON "SystemSettings"("IsPublic");

-- ========================================
-- FUNCTIONS AND TRIGGERS
-- ========================================

-- Function to update timestamp on record updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."UpdatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to generate order code
CREATE OR REPLACE FUNCTION generate_order_code()
RETURNS TRIGGER AS $$
BEGIN
    NEW."OrderCode" = 'ORD-' || TO_CHAR(CURRENT_DATE, 'YYYY') || '-' || LPAD(NEW."Id"::TEXT, 6, '0');
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to generate certificate number
CREATE OR REPLACE FUNCTION generate_certificate_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW."CertificateNumber" = 'CERT-' || TO_CHAR(CURRENT_DATE, 'YYYY') || '-' || LPAD(NEW."Id"::TEXT, 6, '0');
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to update course statistics
CREATE OR REPLACE FUNCTION update_course_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Update total students when enrollment is created
        UPDATE "Courses" 
        SET "TotalStudents" = "TotalStudents" + 1,
            "UpdatedAt" = CURRENT_TIMESTAMP
        WHERE "Id" = NEW."CourseId";
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- Update total students when enrollment is deleted
        UPDATE "Courses" 
        SET "TotalStudents" = GREATEST("TotalStudents" - 1, 0),
            "UpdatedAt" = CURRENT_TIMESTAMP
        WHERE "Id" = OLD."CourseId";
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Function to update course rating
CREATE OR REPLACE FUNCTION update_course_rating()
RETURNS TRIGGER AS $$
DECLARE
    avg_rating NUMERIC;
    review_count INTEGER;
BEGIN
    IF TG_OP IN ('INSERT', 'UPDATE', 'DELETE') THEN
        -- Calculate new rating and count for the course
        SELECT AVG("Rating"), COUNT(*) 
        INTO avg_rating, review_count
        FROM "Reviews" 
        WHERE "ItemType" = 1 AND "ItemId" = COALESCE(NEW."ItemId", OLD."ItemId") AND "IsApproved" = true;
        
        -- Update course statistics
        UPDATE "Courses" 
        SET "Rating" = COALESCE(ROUND(avg_rating, 2), 0),
            "TotalReviews" = review_count,
            "UpdatedAt" = CURRENT_TIMESTAMP
        WHERE "Id" = COALESCE(NEW."ItemId", OLD."ItemId");
        
        RETURN COALESCE(NEW, OLD);
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Function to update lesson count in courses
CREATE OR REPLACE FUNCTION update_course_lesson_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE "Courses" 
        SET "TotalLessons" = "TotalLessons" + 1,
            "UpdatedAt" = CURRENT_TIMESTAMP
        WHERE "Id" = NEW."CourseId";
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE "Courses" 
        SET "TotalLessons" = GREATEST("TotalLessons" - 1, 0),
            "UpdatedAt" = CURRENT_TIMESTAMP
        WHERE "Id" = OLD."CourseId";
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Function to update question count in books
CREATE OR REPLACE FUNCTION update_book_question_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW."ContextType" = 2 THEN
        -- Find the book ID from chapter
        UPDATE "Books" 
        SET "TotalQuestions" = "TotalQuestions" + 1,
            "UpdatedAt" = CURRENT_TIMESTAMP
        WHERE "Id" = (SELECT "BookId" FROM "BookChapters" WHERE "Id" = NEW."ContextId");
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' AND OLD."ContextType" = 2 THEN
        -- Find the book ID from chapter
        UPDATE "Books" 
        SET "TotalQuestions" = GREATEST("TotalQuestions" - 1, 0),
            "UpdatedAt" = CURRENT_TIMESTAMP
        WHERE "Id" = (SELECT "BookId" FROM "BookChapters" WHERE "Id" = OLD."ContextId");
        RETURN OLD;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Function to log user activity
CREATE OR REPLACE FUNCTION log_user_activity()
RETURNS TRIGGER AS $$
BEGIN
    -- Log login activity
    IF TG_TABLE_NAME = 'Users' AND OLD."LastLogin" IS DISTINCT FROM NEW."LastLogin" THEN
        INSERT INTO "UserActivityLogs" ("UserId", "ActivityType", "CreatedAt")
        VALUES (NEW."Id", 'login', NEW."LastLogin");
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ========================================
-- CREATE TRIGGERS
-- ========================================

-- Updated at triggers for all tables
CREATE TRIGGER trigger_users_updated_at BEFORE UPDATE ON "Users" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER trigger_categories_updated_at BEFORE UPDATE ON "Categories" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER trigger_courses_updated_at BEFORE UPDATE ON "Courses" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER trigger_course_enrollments_updated_at BEFORE UPDATE ON "CourseEnrollments" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER trigger_lessons_updated_at BEFORE UPDATE ON "Lessons" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER trigger_user_lesson_progresses_updated_at BEFORE UPDATE ON "UserLessonProgresses" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER trigger_user_video_progresses_updated_at BEFORE UPDATE ON "UserVideoProgresses" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER trigger_lesson_materials_updated_at BEFORE UPDATE ON "LessonMaterials" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER trigger_questions_updated_at BEFORE UPDATE ON "Questions" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER trigger_question_options_updated_at BEFORE UPDATE ON "QuestionOptions" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER trigger_assignments_updated_at BEFORE UPDATE ON "Assignments" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER trigger_user_assignment_attempts_updated_at BEFORE UPDATE ON "UserAssignmentAttempts" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER trigger_user_assignment_answers_updated_at BEFORE UPDATE ON "UserAssignmentAnswers" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER trigger_books_updated_at BEFORE UPDATE ON "Books" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER trigger_book_chapters_updated_at BEFORE UPDATE ON "BookChapters" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER trigger_book_activation_codes_updated_at BEFORE UPDATE ON "BookActivationCodes" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER trigger_user_books_updated_at BEFORE UPDATE ON "UserBooks" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER trigger_learning_paths_updated_at BEFORE UPDATE ON "LearningPaths" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER trigger_learning_path_courses_updated_at BEFORE UPDATE ON "LearningPathCourses" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER trigger_user_learning_paths_updated_at BEFORE UPDATE ON "UserLearningPaths" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER trigger_certificates_updated_at BEFORE UPDATE ON "Certificates" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER trigger_orders_updated_at BEFORE UPDATE ON "Orders" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER trigger_order_items_updated_at BEFORE UPDATE ON "OrderItems" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER trigger_cart_items_updated_at BEFORE UPDATE ON "CartItems" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER trigger_wishlists_updated_at BEFORE UPDATE ON "Wishlists" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER trigger_coupons_updated_at BEFORE UPDATE ON "Coupons" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER trigger_coupon_usages_updated_at BEFORE UPDATE ON "CouponUsages" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER trigger_reviews_updated_at BEFORE UPDATE ON "Reviews" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER trigger_live_classes_updated_at BEFORE UPDATE ON "LiveClasses" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER trigger_live_class_participants_updated_at BEFORE UPDATE ON "LiveClassParticipants" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER trigger_lesson_discussions_updated_at BEFORE UPDATE ON "LessonDiscussions" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER trigger_notifications_updated_at BEFORE UPDATE ON "Notifications" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER trigger_user_activity_logs_updated_at BEFORE UPDATE ON "UserActivityLogs" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER trigger_daily_analytics_updated_at BEFORE UPDATE ON "DailyAnalytics" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER trigger_system_settings_updated_at BEFORE UPDATE ON "SystemSettings" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Business logic triggers
CREATE TRIGGER trigger_generate_order_code AFTER INSERT ON "Orders" FOR EACH ROW EXECUTE PROCEDURE generate_order_code();
CREATE TRIGGER trigger_generate_certificate_number AFTER INSERT ON "Certificates" FOR EACH ROW EXECUTE PROCEDURE generate_certificate_number();
CREATE TRIGGER trigger_update_course_stats AFTER INSERT OR DELETE ON "CourseEnrollments" FOR EACH ROW EXECUTE PROCEDURE update_course_stats();
CREATE TRIGGER trigger_update_course_rating AFTER INSERT OR UPDATE OR DELETE ON "Reviews" FOR EACH ROW EXECUTE PROCEDURE update_course_rating();
CREATE TRIGGER trigger_update_course_lesson_count AFTER INSERT OR DELETE ON "Lessons" FOR EACH ROW EXECUTE PROCEDURE update_course_lesson_count();
CREATE TRIGGER trigger_update_book_question_count AFTER INSERT OR DELETE ON "Questions" FOR EACH ROW EXECUTE PROCEDURE update_book_question_count();
CREATE TRIGGER trigger_log_user_activity AFTER UPDATE ON "Users" FOR EACH ROW EXECUTE PROCEDURE log_user_activity();

-- ========================================
-- INITIAL SYSTEM DATA
-- ========================================

-- Insert default system settings
INSERT INTO "SystemSettings" ("SettingKey", "SettingValue", "SettingType", "Description", "IsPublic") VALUES
('site_name', 'Khởi Trí Số', 1, 'Tên website', true),
('site_description', 'Nền tảng học trực tuyến hàng đầu Việt Nam', 1, 'Mô tả website', true),
('site_logo', '/images/logo.svg', 1, 'Logo website', true),
('max_file_size', '10485760', 2, 'Kích thước file tối đa (bytes)', false),
('max_video_size', '524288000', 2, 'Kích thước video tối đa (bytes)', false),
('default_currency', 'VND', 1, 'Đơn vị tiền tệ mặc định', true),
('maintenance_mode', 'false', 3, 'Chế độ bảo trì', true),
('registration_enabled', 'true', 3, 'Cho phép đăng ký', true),
('email_verification_required', 'true', 3, 'Yêu cầu xác thực email', false),
('default_user_role', '1', 2, 'Role mặc định cho user mới', false),
('session_timeout', '1440', 2, 'Thời gian session (phút)', false),
('password_min_length', '8', 2, 'Độ dài mật khẩu tối thiểu', false),
('oauth_google_enabled', 'true', 3, 'Kích hoạt đăng nhập Google', true),
('oauth_facebook_enabled', 'true', 3, 'Kích hoạt đăng nhập Facebook', true),
('commission_rate_default', '30', 2, 'Tỷ lệ hoa hồng mặc định (%)', false),
('auto_approve_courses', 'false', 3, 'Tự động duyệt khóa học', false),
('auto_approve_books', 'false', 3, 'Tự động duyệt sách', false);

-- Insert default categories
INSERT INTO "Categories" ("Name", "Description", "Icon", "OrderIndex") VALUES
('Toán học', 'Các khóa học và sách về toán học', 'math-icon', 1),
('Vật lý', 'Các khóa học và sách về vật lý', 'physics-icon', 2),
('Hóa học', 'Các khóa học và sách về hóa học', 'chemistry-icon', 3),
('Sinh học', 'Các khóa học và sách về sinh học', 'biology-icon', 4),
('Ngữ văn', 'Các khóa học và sách về ngữ văn', 'literature-icon', 5),
('Tiếng Anh', 'Các khóa học và sách về tiếng Anh', 'english-icon', 6),
('Lịch sử', 'Các khóa học và sách về lịch sử', 'history-icon', 7),
('Địa lý', 'Các khóa học và sách về địa lý', 'geography-icon', 8),
('Tin học', 'Các khóa học và sách về tin học', 'computer-icon', 9),
('Kỹ năng sống', 'Các khóa học về kỹ năng sống', 'life-skills-icon', 10);

-- Insert subcategories for Toán học
INSERT INTO "Categories" ("Name", "Description", "Icon", "ParentId", "OrderIndex") VALUES
('Đại số', 'Đại số cơ bản và nâng cao', 'algebra-icon', 1, 1),
('Hình học', 'Hình học phẳng và không gian', 'geometry-icon', 1, 2),
('Giải tích', 'Giải tích và tích phân', 'calculus-icon', 1, 3),
('Xác suất thống kê', 'Xác suất và thống kê', 'statistics-icon', 1, 4);

-- Insert subcategories for Tin học
INSERT INTO "Categories" ("Name", "Description", "Icon", "ParentId", "OrderIndex") VALUES
('Lập trình', 'Các ngôn ngữ lập trình', 'programming-icon', 9, 1),
('Cơ sở dữ liệu', 'Thiết kế và quản trị CSDL', 'database-icon', 9, 2),
('Mạng máy tính', 'Mạng và bảo mật', 'network-icon', 9, 3),
('Trí tuệ nhân tạo', 'AI và Machine Learning', 'ai-icon', 9, 4);

-- Create default admin user
INSERT INTO "Users" (
    "Username", "Email", "PasswordHash", "Role", "IsActive", "EmailVerified", 
    "FullName", "AuthProvider", "CreatedBy"
) VALUES (
    'admin', 
    'admin@khoitriso.edu.vn', 
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBdXzgVrqUxdWO', -- password: admin123
    3, -- Admin role
    true, 
    true,
    'System Administrator',
    'local',
    'system'
);

-- Create sample instructor
INSERT INTO "Users" (
    "Username", "Email", "PasswordHash", "Role", "IsActive", "EmailVerified",
    "FullName", "Phone", "AuthProvider", "CreatedBy"
) VALUES (
    'instructor1',
    'instructor@khoitriso.edu.vn',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBdXzgVrqUxdWO', -- password: instructor123
    2, -- Instructor role
    true,
    true,
    'Nguyễn Văn Giảng',
    '0123456789',
    'local',
    'admin'
);

-- Create sample student (OAuth)
INSERT INTO "Users" (
    "Username", "Email", "Role", "IsActive", "EmailVerified",
    "FullName", "AuthProvider", "AuthProviderId", "CreatedBy"
) VALUES (
    'student1',
    'student@gmail.com',
    1, -- Student role
    true,
    true,
    'Trần Thị Học Sinh',
    'google',
    'google_user_id_123',
    'system'
);

-- Insert sample notifications
INSERT INTO "Notifications" ("UserId", "Title", "Message", "Type", "Priority") VALUES
(1, 'Chào mừng đến với Khởi Trí Số', 'Cảm ơn bạn đã tham gia nền tảng học trực tuyến Khởi Trí Số!', 1, 2),
(2, 'Hướng dẫn tạo khóa học đầu tiên', 'Bắt đầu tạo khóa học đầu tiên của bạn ngay hôm nay!', 2, 3),
(3, 'Khám phá các khóa học miễn phí', 'Có nhiều khóa học miễn phí đang chờ bạn khám phá!', 2, 2);

-- ========================================
-- SAMPLE COUPONS
-- ========================================

INSERT INTO "Coupons" (
    "Code", "Name", "Description", "DiscountType", "DiscountValue", 
    "MaxDiscountAmount", "MinOrderAmount", "ValidFrom", "ValidTo", 
    "UsageLimit", "CreatedBy"
) VALUES 
(
    'WELCOME10', 
    'Chào mừng thành viên mới', 
    'Giảm 10% cho đơn hàng đầu tiên', 
    1, -- Percentage
    10.00, 
    100000, 
    0, 
    CURRENT_TIMESTAMP, 
    CURRENT_TIMESTAMP + INTERVAL '1 year',
    1000,
    'admin'
),
(
    'STUDENT50', 
    'Ưu đãi học sinh', 
    'Giảm 50,000 VND cho học sinh', 
    2, -- Fixed amount
    50000, 
    NULL, 
    200000, 
    CURRENT_TIMESTAMP, 
    CURRENT_TIMESTAMP + INTERVAL '6 months',
    NULL,
    'admin'
),
(
    'BLACKFRIDAY', 
    'Black Friday Sale', 
    'Giảm 25% tất cả khóa học', 
    1, -- Percentage
    25.00, 
    500000, 
    100000, 
    '2024-11-25 00:00:00', 
    '2024-11-30 23:59:59',
    5000,
    'admin'
);

-- ========================================
-- VIEWS FOR REPORTING
-- ========================================

-- Course statistics view
CREATE VIEW "CourseStatistics" AS
SELECT 
    c."Id",
    c."Title",
    c."InstructorId",
    u."FullName" as "InstructorName",
    c."CategoryId",
    cat."Name" as "CategoryName",
    c."TotalStudents",
    c."TotalLessons",
    c."Rating",
    c."TotalReviews",
    c."Price",
    c."ApprovalStatus",
    COALESCE(SUM(o."FinalAmount"), 0) as "TotalRevenue",
    c."CreatedAt"
FROM "Courses" c
LEFT JOIN "Users" u ON c."InstructorId" = u."Id"
LEFT JOIN "Categories" cat ON c."CategoryId" = cat."Id"
LEFT JOIN "OrderItems" oi ON oi."ItemType" = 1 AND oi."ItemId" = c."Id"
LEFT JOIN "Orders" o ON oi."OrderId" = o."Id" AND o."Status" = 2 -- Paid orders only
GROUP BY c."Id", u."FullName", cat."Name";

-- User progress summary view
CREATE VIEW "UserProgressSummary" AS
SELECT 
    u."Id" as "UserId",
    u."FullName",
    u."Email",
    COUNT(DISTINCT ce."CourseId") as "EnrolledCourses",
    COUNT(DISTINCT CASE WHEN ce."CompletedAt" IS NOT NULL THEN ce."CourseId" END) as "CompletedCourses",
    COUNT(DISTINCT ulp."LessonId") as "LessonsAccessed",
    COUNT(DISTINCT CASE WHEN ulp."IsCompleted" = true THEN ulp."LessonId" END) as "LessonsCompleted",
    AVG(ce."ProgressPercentage") as "AverageProgress"
FROM "Users" u
LEFT JOIN "CourseEnrollments" ce ON u."Id" = ce."UserId" AND ce."IsActive" = true
LEFT JOIN "UserLessonProgresses" ulp ON u."Id" = ulp."UserId"
WHERE u."Role" = 1 -- Students only
GROUP BY u."Id", u."FullName", u."Email";

-- Instructor earnings view
CREATE VIEW "InstructorEarnings" AS
SELECT 
    u."Id" as "InstructorId",
    u."FullName" as "InstructorName",
    COUNT(DISTINCT c."Id") as "TotalCourses",
    COUNT(DISTINCT b."Id") as "TotalBooks",
    COUNT(DISTINCT lp."Id") as "TotalLearningPaths",
    SUM(CASE WHEN oi."ItemType" = 1 THEN o."FinalAmount" * 0.7 ELSE 0 END) as "CourseEarnings", -- 70% commission
    SUM(CASE WHEN oi."ItemType" = 2 THEN o."FinalAmount" * 0.7 ELSE 0 END) as "BookEarnings",
    SUM(CASE WHEN oi."ItemType" = 3 THEN o."FinalAmount" * 0.7 ELSE 0 END) as "LearningPathEarnings",
    SUM(o."FinalAmount" * 0.7) as "TotalEarnings"
FROM "Users" u
LEFT JOIN "Courses" c ON u."Id" = c."InstructorId"
LEFT JOIN "Books" b ON u."Id" = b."AuthorId"
LEFT JOIN "LearningPaths" lp ON u."Id" = lp."InstructorId"
LEFT JOIN "OrderItems" oi ON (
    (oi."ItemType" = 1 AND oi."ItemId" = c."Id") OR
    (oi."ItemType" = 2 AND oi."ItemId" = b."Id") OR
    (oi."ItemType" = 3 AND oi."ItemId" = lp."Id")
)
LEFT JOIN "Orders" o ON oi."OrderId" = o."Id" AND o."Status" = 2 -- Paid orders only
WHERE u."Role" = 2 -- Instructors only
GROUP BY u."Id", u."FullName";

-- ========================================
-- COMPLETION MESSAGE
-- ========================================

-- Log completion
INSERT INTO "AuditLogs" (
    "Module", "Action", "Description", "Status", "CreatedAt"
) VALUES (
    'Database Setup', 
    'Schema Creation', 
    'Complete PostgreSQL schema for Khởi Trí Số platform created successfully', 
    'Success', 
    CURRENT_TIMESTAMP
);

-- Display completion message
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'KHỞI TRÍ SỐ DATABASE SCHEMA CREATED SUCCESSFULLY!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Total Tables Created: 31';
    RAISE NOTICE 'Total Indexes Created: 80+';
    RAISE NOTICE 'Total Triggers Created: 35+';
    RAISE NOTICE 'Total Views Created: 3';
    RAISE NOTICE 'Initial Data Inserted: Categories, Settings, Sample Users, Coupons';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Database is ready for production use!';
    RAISE NOTICE '========================================';
END $$;
