'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Search, 
  ShoppingCart,
  Star,
  Users,
  Clock,
  Tag,
  TrendingUp,
  Award,
  ArrowRight,
  PlayCircle
} from 'lucide-react';
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import Image from 'next/image';
import Link from 'next/link';

interface LearningPath {
  id: number;
  title: string;
  description: string;
  thumbnail?: string;
  instructor?: {
    id: number;
    name: string;
    avatar?: string;
  };
  category?: {
    id: number;
    name: string;
  };
  estimatedDuration?: number;
  difficultyLevel: number;
  difficultyLevelName: string;
  price: number;
  courseCount: number;
  enrollmentCount: number;
  isEnrolled?: boolean;
  createdAt: string;
}

export default function LearningPathsPage() {
  const router = useRouter();
  const { authenticatedFetch } = useAuthenticatedFetch();
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<string>('desc');

  useEffect(() => {
    fetchLearningPaths();
  }, [categoryFilter, levelFilter, sortBy, sortOrder]);

  const fetchLearningPaths = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (categoryFilter && categoryFilter !== 'all') params.append('category', categoryFilter);
      if (levelFilter && levelFilter !== 'all') params.append('level', levelFilter);
      params.append('page', '1');
      params.append('pageSize', '100');
      if (sortBy) params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder);

      const response = await authenticatedFetch(`/api/learning-paths?${params.toString()}`);
      const data = await response.json();

      console.log('Learning paths API response:', data);

      let pathsData: any[] = [];
      if (data.Result?.Items) {
        pathsData = data.Result.Items;
      } else if (data.Result && Array.isArray(data.Result)) {
        pathsData = data.Result;
      }

      // Map từ PascalCase sang camelCase
      const mappedPaths = pathsData.map((path: any) => ({
        id: path.Id || path.id,
        title: path.Title || path.title,
        description: path.Description || path.description,
        thumbnail: path.Thumbnail || path.thumbnail,
        instructorId: path.InstructorId || path.instructorId,
        instructor: path.Instructor || path.instructor ? {
          id: (path.Instructor || path.instructor).Id || (path.Instructor || path.instructor).id,
          name: (path.Instructor || path.instructor).Name || (path.Instructor || path.instructor).name,
          avatar: (path.Instructor || path.instructor).Avatar || (path.Instructor || path.instructor).avatar,
          bio: (path.Instructor || path.instructor).Bio || (path.Instructor || path.instructor).bio,
        } : undefined,
        categoryId: path.CategoryId || path.categoryId,
        category: path.Category || path.category ? {
          id: (path.Category || path.category).Id || (path.Category || path.category).id,
          name: (path.Category || path.category).Name || (path.Category || path.category).name,
        } : undefined,
        estimatedDuration: path.EstimatedDuration || path.estimatedDuration,
        difficultyLevel: path.DifficultyLevel || path.difficultyLevel,
        difficultyLevelName: path.DifficultyLevelName || path.difficultyLevelName,
        price: path.Price || path.price || 0,
        courseCount: path.CourseCount || path.courseCount || 0,
        enrollmentCount: path.EnrollmentCount || path.enrollmentCount || 0,
        isEnrolled: path.IsEnrolled || path.isEnrolled || false,
        createdAt: path.CreatedAt || path.createdAt,
      }));

      console.log('Mapped paths:', mappedPaths);
      setPaths(mappedPaths);
    } catch (err: any) {
      console.error('Error fetching learning paths:', err);
      setError(err.message || 'Không thể tải danh sách lộ trình');
    } finally {
      setLoading(false);
    }
  };

  const filteredPaths = useMemo(() => {
    if (!searchInput.trim()) return paths;
    const searchLower = searchInput.toLowerCase();
    return paths.filter(path => {
      const title = (path.title || '').toLowerCase();
      const description = (path.description || '').toLowerCase();
      return title.includes(searchLower) || description.includes(searchLower);
    });
  }, [paths, searchInput]);

  const formatPrice = (price: number) => {
    if (price === 0) return 'Miễn phí';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDuration = (hours?: number) => {
    if (!hours) return 'N/A';
    if (hours < 1) return `${Math.round(hours * 60)} phút`;
    return `${hours} giờ`;
  };

  const stripHtml = (html: string | undefined | null): string => {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '').trim();
  };

  if (loading && paths.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Lộ trình học tập
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Combo khóa học được sắp xếp theo lộ trình, giúp bạn học từ cơ bản đến nâng cao một cách có hệ thống
            </p>
          </motion.div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Tìm kiếm lộ trình..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={levelFilter || undefined} onValueChange={(value) => setLevelFilter(value || '')}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Mức độ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả mức độ</SelectItem>
                <SelectItem value="1">Dễ</SelectItem>
                <SelectItem value="2">Trung bình</SelectItem>
                <SelectItem value="3">Khó</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Sắp xếp" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">Mới nhất</SelectItem>
                <SelectItem value="enrollmentCount">Phổ biến nhất</SelectItem>
                <SelectItem value="price">Giá</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Learning Paths Grid */}
        {error ? (
          <div className="text-center py-12">
            <p className="text-red-600">{error}</p>
          </div>
        ) : filteredPaths.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Không tìm thấy lộ trình nào</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPaths.map((path, index) => (
              <motion.div
                key={path.id || `path-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group border border-gray-100 hover:border-blue-200 h-full flex flex-col">
                  {/* Thumbnail */}
                  <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50 flex-shrink-0">
                    {path.thumbnail ? (
                      <Image
                        src={path.thumbnail}
                        alt={path.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                        quality={100}
                        unoptimized={true}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <TrendingUp className="w-16 h-16 text-blue-300" />
                      </div>
                    )}
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    {/* Badges */}
                    <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
                      {(path.price === 0 || path.price === null || path.price === undefined) && (
                        <Badge className="bg-green-500 text-white">
                          ✨ Miễn phí
                        </Badge>
                      )}
                      {(path.courseCount || 0) > 0 && (
                        <Badge className="bg-blue-600 text-white">
                          📚 {path.courseCount || 0} khóa học
                        </Badge>
                      )}
                    </div>

                    {/* Play Button */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Link
                        href={`/learning-paths/${path.id}`}
                        className="w-20 h-20 bg-white rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-300 shadow-2xl"
                      >
                        <PlayCircle className="h-10 w-10 text-blue-600 ml-1" />
                      </Link>
                    </div>
                  </div>

                  {/* Content */}
                  <CardContent className="p-6 flex flex-col flex-1">
                    {/* Category & Level */}
                    <div className="flex items-center justify-between mb-3">
                      {path.category && (
                        <Badge variant="outline" className="text-xs">
                          {path.category.name}
                        </Badge>
                      )}
                      {path.difficultyLevel && (
                        <Badge variant="outline" className="text-xs">
                          {path.difficultyLevel === 1 ? '⭐ Dễ' : 
                           path.difficultyLevel === 2 ? '⭐⭐ Trung bình' : 
                           path.difficultyLevel === 3 ? '⭐⭐⭐ Khó' : ''}
                        </Badge>
                      )}
                    </div>

                    {/* Title */}
                    <Link href={`/learning-paths/${path.id}`}>
                      <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
                        {stripHtml(path.title || 'Không có tiêu đề')}
                      </h3>
                    </Link>

                    {/* Description */}
                    {path.description && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-1">
                        {stripHtml(path.description)}
                      </p>
                    )}

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                      {path.enrollmentCount > 0 && (
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{path.enrollmentCount}+ học viên</span>
                        </div>
                      )}
                      {path.estimatedDuration && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{formatDuration(path.estimatedDuration)}</span>
                        </div>
                      )}
                    </div>

                    {/* Price & CTA */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div>
                        <span className="text-2xl font-bold text-blue-600">
                          {formatPrice(path.price)}
                        </span>
                        {path.price > 0 && (
                          <p className="text-xs text-gray-500 mt-1">
                            Tiết kiệm khi mua combo
                          </p>
                        )}
                      </div>
                      <Link href={`/learning-paths/${path.id}`}>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                          {path.isEnrolled ? 'Đã đăng ký' : 'Xem chi tiết'}
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

