"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuthenticatedFetch } from "@/hooks/useAuthenticatedFetch";
import { useCategories } from "@/hooks/useCategories";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  BookOpen,
  Users,
  Award,
  Play,
  ArrowRight,
  Sparkles,
  GraduationCap,
  Clock,
  Star,
  TrendingUp,
  Shield,
  Zap,
  CheckCircle,
  Search,
  Map,
  ShoppingCart,
} from "lucide-react";
import { 
  StarIcon,
  BookOpenIcon,
  AcademicCapIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolidHero } from "@heroicons/react/24/solid";

interface Course {
  id: number;
  title: string;
  description?: string;
  thumbnail?: string;
  price: number;
  rating?: number;
  totalReviews?: number;
  totalStudents?: number;
  totalLessons?: number;
  instructor?: {
    id: number;
    name: string;
    avatar?: string;
  };
  category?: {
    id: number;
    name: string;
  };
  isFree?: boolean;
}

interface LearningPath {
  id: number;
  title: string;
  description?: string;
  thumbnail?: string;
  price: number;
  courseCount: number;
  enrollmentCount: number;
  instructor?: {
    id: number;
    name: string;
    avatar?: string;
  };
  category?: {
    id: number;
    name: string;
  };
}

interface Book {
  id: number;
  title: string;
  description?: string;
  coverImage?: string;
  price: number;
  totalChapters?: number;
  totalQuestions?: number;
  authorName?: string;
  categoryName?: string;
}

const stripHtml = (html: string | undefined | null) => {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '').trim();
};

const formatPrice = (price: number | undefined | null) => {
  if (price === null || price === undefined || isNaN(price)) return 'Miễn phí';
  if (price === 0) return 'Miễn phí';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price);
};

export default function HomePageModern() {
  const router = useRouter();
  const { language } = useLanguage();
  const { authenticatedFetch } = useAuthenticatedFetch();
  const { categories, loading: categoriesLoading } = useCategories();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [featuredCourses, setFeaturedCourses] = useState<Course[]>([]);
  const [featuredPaths, setFeaturedPaths] = useState<LearningPath[]>([]);
  const [featuredBooks, setFeaturedBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      setLoading(true);
      
      // Fetch featured courses (top rated, most students)
      const coursesRes = await authenticatedFetch('/api/courses?page=1&pageSize=6&sortBy=totalStudents&sortOrder=desc');
      const coursesData = await coursesRes.json();
      if (coursesData.Result?.Items) {
        const courses = coursesData.Result.Items.map((c: any) => ({
          id: c.Id || c.id,
          title: c.Title || c.title,
          description: c.Description || c.description,
          thumbnail: c.Thumbnail || c.thumbnail,
          price: c.Price || c.price || 0,
          rating: c.Rating || c.rating,
          totalReviews: c.TotalReviews || c.totalReviews || 0,
          totalStudents: c.TotalStudents || c.totalStudents || 0,
          totalLessons: c.TotalLessons || c.totalLessons || 0,
          instructor: c.Instructor || c.instructor ? {
            id: (c.Instructor || c.instructor).Id || (c.Instructor || c.instructor).id,
            name: (c.Instructor || c.instructor).Name || (c.Instructor || c.instructor).name,
            avatar: (c.Instructor || c.instructor).Avatar || (c.Instructor || c.instructor).avatar,
          } : undefined,
          category: c.Category || c.category ? {
            id: (c.Category || c.category).Id || (c.Category || c.category).id,
            name: (c.Category || c.category).Name || (c.Category || c.category).name,
          } : undefined,
          isFree: (c.Price || c.price || 0) === 0,
        }));
        setFeaturedCourses(courses);
      }

      // Fetch featured learning paths
      const pathsRes = await authenticatedFetch('/api/learning-paths?page=1&pageSize=4&sortBy=enrollmentCount&sortOrder=desc');
      const pathsData = await pathsRes.json();
      if (pathsData.Result?.Items) {
        const paths = pathsData.Result.Items.map((p: any) => ({
          id: p.Id || p.id,
          title: p.Title || p.title,
          description: p.Description || p.description,
          thumbnail: p.Thumbnail || p.thumbnail,
          price: p.Price || p.price || 0,
          courseCount: p.CourseCount || p.courseCount || 0,
          enrollmentCount: p.EnrollmentCount || p.enrollmentCount || 0,
          instructor: p.Instructor || p.instructor ? {
            id: (p.Instructor || p.instructor).Id || (p.Instructor || p.instructor).id,
            name: (p.Instructor || p.instructor).Name || (p.Instructor || p.instructor).name,
            avatar: (p.Instructor || p.instructor).Avatar || (p.Instructor || p.instructor).avatar,
          } : undefined,
          category: p.Category || p.category ? {
            id: (p.Category || p.category).Id || (p.Category || p.category).id,
            name: (p.Category || p.category).Name || (p.Category || p.category).name,
          } : undefined,
        }));
        setFeaturedPaths(paths);
      }

      // Fetch featured books
      const booksRes = await authenticatedFetch('/api/books?page=1&pageSize=6&sortBy=createdAt&sortOrder=desc');
      const booksData = await booksRes.json();
      if (booksData.Result?.Items) {
        const books = booksData.Result.Items.map((b: any) => ({
          id: b.Id || b.id,
          title: b.Title || b.title,
          description: b.Description || b.description,
          coverImage: b.CoverImage || b.coverImage,
          price: b.Price || b.price || 0,
          totalChapters: b.TotalChapters || b.totalChapters || 0,
          totalQuestions: b.TotalQuestions || b.totalQuestions || 0,
          authorName: b.Author?.FullName || b.author?.fullName || b.AuthorName || b.authorName,
          categoryName: b.Category?.Name || b.category?.name || b.CategoryName || b.categoryName,
        }));
        setFeaturedBooks(books);
      }
    } catch (error) {
      console.error('Error fetching home data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/courses?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Udemy Style */}
      <section className="relative bg-slate-900 text-white py-20 lg:py-32 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 max-w-7xl relative z-10">
          <motion.div
            className="text-center max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Học tập không giới hạn với Khởi Trí Số
            </h1>
            <p className="text-xl md:text-2xl text-slate-300 mb-8">
              Khám phá hàng nghìn khóa học, lộ trình học tập và sách điện tử chất lượng cao
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
              <div className="flex gap-2 bg-white rounded-lg p-2 shadow-xl">
                <Search className="h-6 w-6 text-slate-400 ml-3 my-auto" />
                <Input
                  type="text"
                  placeholder="Tìm kiếm khóa học, sách, lộ trình..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 border-0 focus-visible:ring-0 text-slate-900"
                />
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-8">
                  Tìm kiếm
                </Button>
              </div>
            </form>

            {/* Trust Indicators */}
            <div className="mt-12 flex flex-wrap justify-center gap-8 text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span>15K+ Học viên</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span>500+ Khóa học</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span>50+ Giảng viên</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Learning Paths */}
      {featuredPaths.length > 0 && (
        <section className="py-16 bg-slate-50">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
                  Lộ trình học tập nổi bật
                </h2>
                <p className="text-slate-600">Combo khóa học được yêu thích nhất</p>
              </div>
              <Button asChild variant="ghost" className="hidden md:flex">
                <Link href="/learning-paths">
                  Xem tất cả <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredPaths.map((path) => (
                <motion.div
                  key={path.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -4 }}
                >
                  <Link href={`/learning-paths/${path.id}`}>
                    <Card className="h-full border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group">
                      <div className="relative h-48 bg-slate-200 overflow-hidden">
                        {path.thumbnail && path.thumbnail.startsWith('http') ? (
                          <Image
                            src={path.thumbnail}
                            alt={path.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            unoptimized
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                            <Map className="h-16 w-16 text-white opacity-50" />
                          </div>
                        )}
                        <Badge className="absolute top-3 right-3 bg-blue-600 text-white">
                          {path.courseCount} khóa học
                        </Badge>
                      </div>
                      <CardHeader>
                        <CardTitle className="text-lg line-clamp-2 group-hover:text-blue-600 transition-colors">
                          {stripHtml(path.title)}
                        </CardTitle>
                        {path.instructor && (
                          <p className="text-sm text-slate-600">{path.instructor.name}</p>
                        )}
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <span className="text-xl font-bold text-blue-600">
                            {formatPrice(path.price)}
                          </span>
                          <div className="flex items-center gap-1 text-sm text-slate-600">
                            <Users className="h-4 w-4" />
                            <span>{path.enrollmentCount}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Courses */}
      {featuredCourses.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
                  Khóa học phổ biến
                </h2>
                <p className="text-slate-600">Được nhiều học viên lựa chọn nhất</p>
              </div>
              <Button asChild variant="ghost" className="hidden md:flex">
                <Link href="/courses">
                  Xem tất cả <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredCourses.map((course) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -4 }}
                >
                  <Link href={`/courses/${course.id}`}>
                    <Card className="h-full border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group">
                      <div className="relative h-48 bg-slate-200 overflow-hidden">
                        {course.thumbnail && course.thumbnail.startsWith('http') ? (
                          <Image
                            src={course.thumbnail}
                            alt={course.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            unoptimized
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                            <Play className="h-16 w-16 text-white opacity-50" />
                          </div>
                        )}
                        {course.isFree && (
                          <Badge className="absolute top-3 right-3 bg-green-600 text-white">
                            Miễn phí
                          </Badge>
                        )}
                      </div>
                      <CardHeader>
                        <CardTitle className="text-lg line-clamp-2 group-hover:text-blue-600 transition-colors">
                          {stripHtml(course.title)}
                        </CardTitle>
                        {course.instructor && (
                          <p className="text-sm text-slate-600">{course.instructor.name}</p>
                        )}
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-4 text-sm text-slate-600 mb-3">
                          {course.rating && (
                            <div className="flex items-center gap-1">
                              <StarIconSolidHero className="h-4 w-4 text-yellow-400" />
                              <span className="font-medium">{course.rating.toFixed(1)}</span>
                              <span>({course.totalReviews})</span>
                            </div>
                          )}
                          {course.totalStudents !== undefined && course.totalStudents > 0 && (
                            <div className="flex items-center gap-1">
                              <UserGroupIcon className="h-4 w-4" />
                              <span>{(course.totalStudents || 0).toLocaleString()}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xl font-bold text-blue-600">
                            {formatPrice(course.price)}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Books */}
      {featuredBooks.length > 0 && (
        <section className="py-16 bg-slate-50">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
                  Sách điện tử mới nhất
                </h2>
                <p className="text-slate-600">Tài liệu học tập chất lượng cao</p>
              </div>
              <Button asChild variant="ghost" className="hidden md:flex">
                <Link href="/books">
                  Xem tất cả <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredBooks.map((book) => (
                <motion.div
                  key={book.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -4 }}
                >
                  <Link href={`/books/${book.id}`}>
                    <Card className="h-full border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group">
                      <div className="flex gap-4 p-4">
                        <div className="relative w-24 h-32 bg-slate-200 rounded overflow-hidden flex-shrink-0">
                          {book.coverImage && book.coverImage.startsWith('http') ? (
                            <Image
                              src={book.coverImage}
                              alt={book.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                              unoptimized
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                              <BookOpen className="h-12 w-12 text-white opacity-50" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base line-clamp-2 group-hover:text-blue-600 transition-colors mb-2">
                            {stripHtml(book.title)}
                          </CardTitle>
                          {book.authorName && (
                            <p className="text-sm text-slate-600 mb-2">{book.authorName}</p>
                          )}
                          <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
                            {book.totalChapters && book.totalChapters > 0 && (
                              <span>{book.totalChapters} chương</span>
                            )}
                            {book.totalQuestions && book.totalQuestions > 0 && (
                              <span>{book.totalQuestions} câu hỏi</span>
                            )}
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-bold text-blue-600">
                              {formatPrice(book.price)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Categories Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Khám phá theo danh mục
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Tìm khóa học phù hợp với môn học bạn yêu thích
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {categoriesLoading ? (
              Array.from({ length: 8 }).map((_, index) => (
                <Card key={index} className="border border-slate-200">
                  <CardContent className="p-4 text-center">
                    <div className="w-12 h-12 bg-slate-200 rounded-lg mx-auto mb-2 animate-pulse"></div>
                    <div className="h-4 bg-slate-200 rounded animate-pulse"></div>
                  </CardContent>
                </Card>
              ))
            ) : (
              categories.slice(0, 8).map((category, index) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.05, y: -4 }}
                >
                  <Link href={`/courses?category=${category.id}`}>
                    <Card className="border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all duration-300 cursor-pointer h-full">
                      <CardContent className="p-4 text-center">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                          <BookOpen className="h-6 w-6 text-blue-600" />
                        </div>
                        <h3 className="font-semibold text-sm text-slate-900">
                          {category.name}
                        </h3>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-slate-900 text-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: UserGroupIcon, value: "15K+", label: "Học viên" },
              { icon: AcademicCapIcon, value: "500+", label: "Khóa học" },
              { icon: BookOpenIcon, value: "200+", label: "Sách điện tử" },
              { icon: Award, value: "50+", label: "Giảng viên" },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <stat.icon className="h-12 w-12 mx-auto mb-4 text-blue-400" />
                <div className="text-4xl font-bold mb-2">{stat.value}</div>
                <div className="text-slate-300">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Sẵn sàng bắt đầu hành trình học tập?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Tham gia cùng hàng nghìn học viên đã thành công với Khởi Trí Số
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
              <Link href="/auth/register">
                Đăng ký ngay <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              <Link href="/courses">Khám phá khóa học</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
