import {
  HomeIcon,
  AcademicCapIcon,
  BookOpenIcon,
  UserGroupIcon,
  ChartBarIcon,
  CogIcon,
  BellIcon,
  ShoppingCartIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  VideoCameraIcon,
  ClipboardDocumentListIcon,
  TagIcon,
  ExclamationTriangleIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { navigationTranslations } from '@/locales/navigation';

export const getNavigation = (language: 'vi' | 'en') => {
  const t = navigationTranslations[language];
  
  return [
    {
      name: t.dashboard,
      href: '/dashboard',
      icon: HomeIcon,
      current: true,
    },
    {
      name: t.userManagement,
      icon: UserGroupIcon,
      children: [
        { name: t.userList, href: '/dashboard/users' },
        { name: t.userAnalytics, href: '/dashboard/users/analytics' },
      ],
    },
    {
      name: t.instructorManagement,
      icon: AcademicCapIcon,
      children: [
        { name: t.instructorList, href: '/dashboard/instructors' },
        { name: t.instructorProfiles, href: '/dashboard/instructors/profiles' },
        { name: t.featuredInstructors, href: '/dashboard/instructors/featured' },
      ],
    },
    {
      name: t.courseManagement,
      icon: BookOpenIcon,
      children: [
        { name: t.courseList, href: '/dashboard/courses' },
        { name: t.courseAnalytics, href: '/dashboard/courses/analytics' },
      ],
    },
    {
      name: t.lessonManagement,
      icon: DocumentTextIcon,
      children: [
        { name: t.lessonDiscussions, href: '/dashboard/lessons/discussions' },
      ],
    },
    {
      name: t.liveClasses,
      icon: VideoCameraIcon,
      children: [
        { name: t.liveClassList, href: '/dashboard/live-classes' },
        { name: t.createLiveClass, href: '/dashboard/live-classes/create' },
        { name: t.upcomingClasses, href: '/dashboard/live-classes/upcoming' },
        { name: t.classHistory, href: '/dashboard/live-classes/history' },
        { name: t.attendance, href: '/dashboard/live-classes/attendance' },
      ],
    },
    {
      name: t.assignmentsTests,
      icon: ClipboardDocumentListIcon,
      children: [
        { name: t.assignmentList, href: '/dashboard/assignments' },
      ],
    },
    {
      name: t.ebooks,
      icon: BookOpenIcon,
      children: [
        { name: t.bookList, href: '/dashboard/books' },
        { name: t.activationCodes, href: '/dashboard/books/activation-codes' },
        { name: t.videoSolutions, href: '/dashboard/books/solutions' },
        { name: t.bookAnalytics, href: '/dashboard/books/analytics' },
      ],
    },
    {
      name: t.forumQuestions,
      icon: ChatBubbleLeftRightIcon,
      children: [
        { name: t.questionList, href: '/dashboard/forum/questions' },
        { name: t.unanswered, href: '/dashboard/forum/unanswered' },
        { name: t.featured, href: '/dashboard/forum/featured' },
        { name: t.moderation, href: '/dashboard/forum/moderation' },
        { name: t.reports, href: '/dashboard/forum/reports' },
        { name: t.forumAnalytics, href: '/dashboard/forum/analytics' },
      ],
    },
    {
      name: t.staticPages,
      icon: DocumentTextIcon,
      children: [
        { name: t.pageList, href: '/dashboard/static-pages' },
        { name: t.createPage, href: '/dashboard/static-pages/create' },
        { name: t.coursePages, href: '/dashboard/static-pages/courses' },
        { name: t.instructorPages, href: '/dashboard/static-pages/instructors' },
        { name: t.questionPages, href: '/dashboard/static-pages/questions' },
        { name: t.seoManagement, href: '/dashboard/static-pages/seo' },
      ],
    },
    {
      name: t.aiLearning,
      icon: CogIcon,
      children: [
        { name: t.pronunciation, href: '/dashboard/ai/pronunciation' },
        { name: t.learningAnalysis, href: '/dashboard/ai/learning-analysis' },
        { name: t.personalization, href: '/dashboard/ai/personalization' },
        { name: t.chatbot, href: '/dashboard/ai/chatbot' },
        { name: t.aiAnalytics, href: '/dashboard/ai/analytics' },
      ],
    },
    {
      name: t.reviewsFeedback,
      icon: StarIcon,
      children: [
        { name: t.courseReviews, href: '/dashboard/reviews' },
        { name: t.instructorReviews, href: '/dashboard/reviews/instructors' },
        { name: t.studentFeedback, href: '/dashboard/reviews/feedback' },
        { name: t.reviewAnalytics, href: '/dashboard/reviews/analytics' },
      ],
    },
    {
      name: t.ordersPayments,
      icon: ShoppingCartIcon,
      children: [
        { name: t.orderList, href: '/dashboard/orders' },
        { name: t.transactions, href: '/dashboard/transactions' },
        { name: t.carts, href: '/dashboard/carts' },
        { name: t.coupons, href: '/dashboard/coupons' },
        { name: t.refunds, href: '/dashboard/refunds' },
        { name: t.revenueStats, href: '/dashboard/revenue' },
      ],
    },
    {
      name: t.analyticsReports,
      icon: ChartBarIcon,
      children: [
        { name: t.dashboardAnalytics, href: '/dashboard/analytics' },
        { name: t.courseAnalyticsPage, href: '/dashboard/analytics/courses' },
        { name: t.instructorAnalyticsPage, href: '/dashboard/analytics/instructors' },
        { name: t.studentAnalytics, href: '/dashboard/analytics/students' },
        { name: t.systemReports, href: '/dashboard/analytics/system' },
        { name: t.seoReports, href: '/dashboard/analytics/seo' },
      ],
    },
    {
      name: t.notifications,
      icon: BellIcon,
      children: [
        { name: t.notificationList, href: '/dashboard/notifications' },
        { name: t.sendNotification, href: '/dashboard/notifications/create' },
      ],
    },
    {
      name: t.systemSettings,
      icon: CogIcon,
      children: [
        { name: t.generalSettings, href: '/dashboard/settings' },
        { name: t.streamingSettings, href: '/dashboard/settings/streaming' },
        { name: t.seoSettings, href: '/dashboard/settings/seo' },
        { name: t.systemHealth, href: '/dashboard/settings/health' },
        { name: t.backupRestore, href: '/dashboard/settings/backup' },
        { name: t.systemStats, href: '/dashboard/settings/stats' },
      ],
    },
  ];
};
