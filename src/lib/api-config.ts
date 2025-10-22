// API Configuration
export const API_CONFIG = {
  // Use environment variable or fallback to localhost with HTTPS
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api',
  ENDPOINTS: {
    AUTH: {
      GOOGLE: '/Auth/google',
      FACEBOOK: '/Auth/facebook',
      GOOGLE_CALLBACK: '/Auth/google/callback',
      FACEBOOK_CALLBACK: '/Auth/facebook/callback',
      LOGIN: '/Auth/login',
      REGISTER: '/Auth/register',
      // Admin Auth
      ADMIN_LOGIN: '/Auth/admin/login',
      ADMIN_REGISTER: '/Auth/admin/register',
      CHANGE_PASSWORD: '/Auth/admin/change-password',
      FORGOT_PASSWORD: '/Auth/admin/forgot-password',
      RESET_PASSWORD: '/Auth/admin/reset-password',
      // User Auth
      ME: '/Auth/me',
      LOGOUT: '/Auth/logout',
      REFRESH: '/Auth/refresh',
      VERIFY_EMAIL: '/Auth/verify-email',
    },
    USER: {
      // Backend UserController.cs is routed at api/users
      PROFILE: '/users/profile',
      UPDATE_PROFILE: '/users/profile',
      UPLOAD_AVATAR: '/users/upload-avatar',
      BY_ID_BASE: '/users',
      SEARCH: '/users/search',
    },
    COURSES: {
      BASE: '/courses',
      BY_ID_BASE: '/courses',
      SUBMIT: (id: number | string) => `/courses/${id}/submit`,
      ENROLL: (id: number | string) => `/courses/${id}/enroll`,
      UNENROLL: (id: number | string) => `/courses/${id}/unenroll`,
      MY_COURSES: '/courses/my-courses',
    },
    LESSONS: {
      BASE: '/lessons',
      BY_ID_BASE: '/lessons',
      COURSE_LESSONS: (courseId: number | string) => `/courses/${courseId}/lessons`,
      PROGRESS: (id: number | string) => `/lessons/${id}/progress`,
    },
    CATEGORIES: {
      BASE: '/categories',
      BY_ID_BASE: '/categories',
    },
    BOOKS: {
      BASE: '/books',
      BY_ID_BASE: '/books',
      MY_BOOKS: '/books/my-books',
      ACTIVATE: '/books/activate',
      VALIDATE_CODE: '/books/activation-codes',
      QUESTIONS: (id: number | string) => `/books/${id}/questions`,
      CHAPTERS: (id: number | string) => `/books/${id}/chapters`,
      ACTIVATION_CODES: (id: number | string) => `/books/${id}/activation-codes`,
      GENERATE_CODES: (id: number | string) => `/books/${id}/activation-codes/generate`,
    },
    ANALYTICS: {
      DASHBOARD: '/analytics/dashboard',
      COURSE: (id: number | string) => `/analytics/courses/${id}`,
      INSTRUCTOR: (id: number | string) => `/analytics/instructor/${id}`,
    },
    SYSTEM: {
      SETTINGS: '/system/settings',
      SETTING_BY_KEY: (key: string) => `/system/settings/${key}`,
      HEALTH: '/system/health',
      STATS: '/system/stats',
    }
  }
};

// Helper function to build full API URLs
export const buildApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Export commonly used URLs
export const API_URLS = {
  GOOGLE_AUTH: buildApiUrl(API_CONFIG.ENDPOINTS.AUTH.GOOGLE),
  FACEBOOK_AUTH: buildApiUrl(API_CONFIG.ENDPOINTS.AUTH.FACEBOOK),
  GOOGLE_CALLBACK: buildApiUrl(API_CONFIG.ENDPOINTS.AUTH.GOOGLE_CALLBACK),
  FACEBOOK_CALLBACK: buildApiUrl(API_CONFIG.ENDPOINTS.AUTH.FACEBOOK_CALLBACK),
  LOGIN: buildApiUrl(API_CONFIG.ENDPOINTS.AUTH.LOGIN),
  REGISTER: buildApiUrl(API_CONFIG.ENDPOINTS.AUTH.REGISTER),
  // Admin Auth
  ADMIN_LOGIN: buildApiUrl(API_CONFIG.ENDPOINTS.AUTH.ADMIN_LOGIN),
  ADMIN_REGISTER: buildApiUrl(API_CONFIG.ENDPOINTS.AUTH.ADMIN_REGISTER),
  CHANGE_PASSWORD: buildApiUrl(API_CONFIG.ENDPOINTS.AUTH.CHANGE_PASSWORD),
  FORGOT_PASSWORD: buildApiUrl(API_CONFIG.ENDPOINTS.AUTH.FORGOT_PASSWORD),
  RESET_PASSWORD: buildApiUrl(API_CONFIG.ENDPOINTS.AUTH.RESET_PASSWORD),
  // User Auth
  ME: buildApiUrl(API_CONFIG.ENDPOINTS.AUTH.ME),
  LOGOUT: buildApiUrl(API_CONFIG.ENDPOINTS.AUTH.LOGOUT),
  REFRESH: buildApiUrl(API_CONFIG.ENDPOINTS.AUTH.REFRESH),
  VERIFY_EMAIL: buildApiUrl(API_CONFIG.ENDPOINTS.AUTH.VERIFY_EMAIL),
  // User endpoints
  USER_PROFILE: buildApiUrl(API_CONFIG.ENDPOINTS.USER.PROFILE),
  USER_UPDATE_PROFILE: buildApiUrl(API_CONFIG.ENDPOINTS.USER.UPDATE_PROFILE),
  USER_UPLOAD_AVATAR: buildApiUrl(API_CONFIG.ENDPOINTS.USER.UPLOAD_AVATAR),
  USER_BY_ID_BASE: buildApiUrl(API_CONFIG.ENDPOINTS.USER.BY_ID_BASE),
  USER_SEARCH: buildApiUrl(API_CONFIG.ENDPOINTS.USER.SEARCH),
  // courses
  COURSES_BASE: buildApiUrl(API_CONFIG.ENDPOINTS.COURSES.BASE),
  COURSES_BY_ID_BASE: buildApiUrl(API_CONFIG.ENDPOINTS.COURSES.BY_ID_BASE),
  COURSES_MY: buildApiUrl(API_CONFIG.ENDPOINTS.COURSES.MY_COURSES),
  // lessons
  LESSONS_BASE: buildApiUrl(API_CONFIG.ENDPOINTS.LESSONS.BASE),
  LESSONS_BY_ID_BASE: buildApiUrl(API_CONFIG.ENDPOINTS.LESSONS.BY_ID_BASE),
  // categories
  CATEGORIES_BASE: buildApiUrl(API_CONFIG.ENDPOINTS.CATEGORIES.BASE),
  CATEGORIES_BY_ID_BASE: buildApiUrl(API_CONFIG.ENDPOINTS.CATEGORIES.BY_ID_BASE),
  // books
  BOOKS_BASE: buildApiUrl(API_CONFIG.ENDPOINTS.BOOKS.BASE),
  BOOKS_BY_ID_BASE: buildApiUrl(API_CONFIG.ENDPOINTS.BOOKS.BY_ID_BASE),
  BOOKS_MY: buildApiUrl(API_CONFIG.ENDPOINTS.BOOKS.MY_BOOKS),
  BOOKS_ACTIVATE: buildApiUrl(API_CONFIG.ENDPOINTS.BOOKS.ACTIVATE),
  BOOKS_VALIDATE_CODE: buildApiUrl(API_CONFIG.ENDPOINTS.BOOKS.VALIDATE_CODE),
  // analytics
  ANALYTICS_DASHBOARD: buildApiUrl(API_CONFIG.ENDPOINTS.ANALYTICS.DASHBOARD),
  ANALYTICS_COURSE: (id: number | string) => buildApiUrl(API_CONFIG.ENDPOINTS.ANALYTICS.COURSE(id)),
  ANALYTICS_INSTRUCTOR: (id: number | string) => buildApiUrl(API_CONFIG.ENDPOINTS.ANALYTICS.INSTRUCTOR(id)),
  // system
  SYSTEM_SETTINGS: buildApiUrl(API_CONFIG.ENDPOINTS.SYSTEM.SETTINGS),
  SYSTEM_SETTING_BY_KEY: (key: string) => buildApiUrl(API_CONFIG.ENDPOINTS.SYSTEM.SETTING_BY_KEY(key)),
  SYSTEM_HEALTH: buildApiUrl(API_CONFIG.ENDPOINTS.SYSTEM.HEALTH),
  SYSTEM_STATS: buildApiUrl(API_CONFIG.ENDPOINTS.SYSTEM.STATS),
};

export const buildUserByIdUrl = (id: number | string): string => {
  return `${API_URLS.USER_BY_ID_BASE}/${id}`;
};

export const buildCourseByIdUrl = (id: number | string): string => {
  return `${API_URLS.COURSES_BY_ID_BASE}/${id}`;
};

export const buildCourseSubmitUrl = (id: number | string): string => {
  return buildApiUrl(API_CONFIG.ENDPOINTS.COURSES.SUBMIT(id));
};

export const buildCourseEnrollUrl = (id: number | string): string => {
  return buildApiUrl(API_CONFIG.ENDPOINTS.COURSES.ENROLL(id));
};

export const buildCourseUnenrollUrl = (id: number | string): string => {
  return buildApiUrl(API_CONFIG.ENDPOINTS.COURSES.UNENROLL(id));
};

export const buildCourseLessonsUrl = (courseId: number | string): string => {
  return buildApiUrl(API_CONFIG.ENDPOINTS.LESSONS.COURSE_LESSONS(courseId));
};

export const buildLessonByIdUrl = (id: number | string): string => {
  return `${API_URLS.LESSONS_BY_ID_BASE}/${id}`;
};

export const buildLessonProgressUrl = (id: number | string): string => {
  return buildApiUrl(API_CONFIG.ENDPOINTS.LESSONS.PROGRESS(id));
};

export const buildCategoryByIdUrl = (id: number | string): string => {
  return `${API_URLS.CATEGORIES_BY_ID_BASE}/${id}`;
};
