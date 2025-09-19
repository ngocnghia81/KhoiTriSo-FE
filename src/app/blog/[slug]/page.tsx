import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import { 
  CalendarIcon,
  ChatBubbleLeftIcon,
  TagIcon,
  ShareIcon,
  HeartIcon,
  MagnifyingGlassIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  featuredImage: string;
  category: {
    name: string;
    slug: string;
  };
  author: {
    name: string;
    avatar: string;
    bio: string;
  };
  publishedAt: string;
  readingTime: number;
  tags: string[];
  commentsCount: number;
}

interface Comment {
  id: number;
  author: {
    name: string;
    avatar: string;
  };
  content: string;
  createdAt: string;
  isReply?: boolean;
}

// Mock data - sẽ được thay thế bằng API calls
const mockBlogPost: BlogPost = {
  id: 'fostering-student-growth',
  title: 'Fostering Student Growth through Mindful for Your Mentoring Students',
  excerpt: 'Khám phá phương pháp giảng dạy hiệu quả để phát triển toàn diện học sinh thông qua việc hướng dẫn tận tâm.',
  content: `
    <p>Lorem ipsum dolor sit amet consectur adipisicing elit, sed do eiusmod tempor inc idid unt ut labore et dolore magna aliqua enim ad minim veniam, quis nostrud exerec tation ullamco laboris nis aliquip commodo consequat duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur enim ipsam.</p>
    
    <p>Lorem ipsum dolor sit amet consectur adipisicing elit, sed do eiusmod tempor inc idid unt ut labore et dolore magna aliqua enim ad minim veniam, quis nostrud exerec tation ullamco laboris nis aliquip commodo consequat duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur enim ipsam.</p>
    
    <h3>Where Does it Come From Template</h3>
    
    <ul>
      <li>Tempus imperdiet nulla malesuada pellentesque elit eget gravida cum sociis</li>
      <li>Neque sodales ut etiam sit amet nisl purus non tellus orci ac auctor</li>
      <li>Tristique nulla aliquet enim tortor at auctor urna. Sit amet aliquam id diam maer</li>
      <li>Tempus imperdiet nulla malesuada pellentesque elit eget gravida cum sociis</li>
    </ul>
    
    <h3>Figma Template Design</h3>
    
    <p>Lorem ipsum dolor sit amet consectur adipisicing elit, sed do eiusmod tempor inc idid unt ut labore et dolore magna aliqua enim ad minim veniam, quis nostrud exerec tation ullamco laboris nis aliquip commodo consequat duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur enim ipsam.</p>
  `,
  featuredImage: '/images/blog/blog-details/b-details-img-1.png',
  category: {
    name: 'Giáo dục',
    slug: 'education'
  },
  author: {
    name: 'Nguyễn Văn Giáo viên',
    avatar: '/images/testimonial/testimonial-1/author-1.png',
    bio: 'Giáo viên với hơn 10 năm kinh nghiệm trong lĩnh vực giáo dục trực tuyến'
  },
  publishedAt: '2024-04-30',
  readingTime: 5,
  tags: ['Giáo dục', 'Học tập', 'Phương pháp'],
  commentsCount: 18
};

const mockComments: Comment[] = [
  {
    id: 1,
    author: {
      name: 'John Smith',
      avatar: '/images/blog/blog-details/comment-1.png'
    },
    content: 'Fusce condimentum enim vestibulum libero gravida, ut accumsan quam bibendum. Curabitur gravida est sit amet cursus.',
    createdAt: '2024-04-30T10:00:00Z'
  },
  {
    id: 2,
    author: {
      name: 'Franklin Chen',
      avatar: '/images/blog/blog-details/comment-2.png'
    },
    content: 'Fusce condimentum enim vestibulum libero gravida, ut accumsan quam bibendum. Curabitur gravida est sit amet cursus.',
    createdAt: '2024-04-30T11:00:00Z',
    isReply: true
  }
];

const categories = [
  { name: 'Giáo dục', count: 9 },
  { name: 'Marketing', count: 54 },
  { name: 'Kinh doanh', count: 17 },
  { name: 'Công nghệ', count: 15 },
  { name: 'Ngôn ngữ', count: 29 }
];

const popularPosts = [
  {
    title: 'How to Start a Blog Beginner Best Tooling',
    date: 'Jan 10, 2022',
    image: '/images/blog/blog-details/latest-1.png'
  },
  {
    title: 'Start Your Career for Your Best Planning Days',
    date: '30 April, 2024',
    image: '/images/blog/blog-details/latest-2.png'
  },
  {
    title: 'How to Start a Blog Beginner Best Tooling',
    date: '30 April, 2024',
    image: '/images/blog/blog-details/latest-3.png'
  }
];

const tags = ['Design', 'Creative', 'Solution', 'Laptop', 'Product'];

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  // Trong thực tế sẽ fetch data từ API
  return {
    title: `${mockBlogPost.title} - Khởi Trí Số`,
    description: mockBlogPost.excerpt,
    keywords: mockBlogPost.tags.join(', '),
    openGraph: {
      title: mockBlogPost.title,
      description: mockBlogPost.excerpt,
      images: [mockBlogPost.featuredImage],
      type: 'article',
      publishedTime: mockBlogPost.publishedAt,
    },
  };
}

export default function BlogDetailPage({ params }: { params: { slug: string } }) {
  const post = mockBlogPost; // Trong thực tế sẽ fetch từ API based on params.slug

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white">
      {/* Breadcrumb */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-16 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <nav className="flex justify-center mb-4" aria-label="Breadcrumb">
              <ol className="inline-flex items-center space-x-1 md:space-x-3">
                <li className="inline-flex items-center">
                  <Link href="/" className="text-white/80 hover:text-white">
                    Trang chủ
                  </Link>
                </li>
                <li>
                  <div className="flex items-center">
                    <span className="mx-2">/</span>
                    <Link href="/blog" className="text-white/80 hover:text-white">
                      Blog
                    </Link>
                  </div>
                </li>
                <li>
                  <div className="flex items-center">
                    <span className="mx-2">/</span>
                    <span className="text-white">Chi tiết bài viết</span>
                  </div>
                </li>
              </ol>
            </nav>
            <h1 className="text-4xl font-bold">Chi tiết bài viết</h1>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
              <article className="bg-white">
                {/* Featured Image */}
                <div className="aspect-video mb-8 rounded-2xl overflow-hidden">
                  <Image
                    src={post.featuredImage}
                    alt={post.title}
                    width={800}
                    height={450}
                    className="w-full h-full object-cover"
                    quality={100}
                    unoptimized={true}
                  />
                </div>

                {/* Post Meta */}
                <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-gray-600">
                  <div className="flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-1" />
                    <span>{formatDate(post.publishedAt)}</span>
                  </div>
                  <div className="flex items-center">
                    <ChatBubbleLeftIcon className="h-4 w-4 mr-1" />
                    <span>{post.commentsCount} Bình luận</span>
                  </div>
                  <div className="flex items-center">
                    <TagIcon className="h-4 w-4 mr-1" />
                    <Link
                      href={`/blog/category/${post.category.slug}`}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      {post.category.name}
                    </Link>
                  </div>
                </div>

                {/* Post Title */}
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                  {post.title}
                </h1>

                {/* Post Content */}
                <div className="prose prose-lg max-w-none mb-8">
                  <div dangerouslySetInnerHTML={{ __html: post.content }} />
                </div>

                {/* Content Images */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <Image
                    src="/images/blog/blog-details/b-details-img-2.png"
                    alt="Content image"
                    width={400}
                    height={300}
                    className="w-full rounded-lg"
                    quality={100}
                    unoptimized={true}
                  />
                  <Image
                    src="/images/blog/blog-details/b-details-img-3.png"
                    alt="Content image"
                    width={400}
                    height={300}
                    className="w-full rounded-lg"
                    quality={100}
                    unoptimized={true}
                  />
                </div>

                {/* Tags */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag, index) => (
                      <Link
                        key={index}
                        href={`/blog/tag/${tag.toLowerCase()}`}
                        className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-blue-100 hover:text-blue-700 transition-colors"
                      >
                        {tag}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Author Info */}
                <div className="bg-gray-50 rounded-2xl p-6 mb-8">
                  <div className="flex items-start space-x-4">
                    <Image
                      src={post.author.avatar}
                      alt={post.author.name}
                      width={64}
                      height={64}
                      className="w-16 h-16 rounded-full object-cover"
                      quality={100}
                      unoptimized={true}
                    />
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">
                        {post.author.name}
                      </h4>
                      <p className="text-gray-600">{post.author.bio}</p>
                    </div>
                  </div>
                </div>

                {/* Comments Section */}
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">
                    {mockComments.length} Bình luận
                  </h3>

                  <div className="space-y-6">
                    {mockComments.map((comment) => (
                      <div
                        key={comment.id}
                        className={`flex space-x-4 ${comment.isReply ? 'ml-12' : ''}`}
                      >
                        <Image
                          src={comment.author.avatar}
                          alt={comment.author.name}
                          width={48}
                          height={48}
                          className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                          quality={100}
                          unoptimized={true}
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-gray-900">
                              {comment.author.name}
                            </h4>
                            <button className="text-blue-600 text-sm hover:text-blue-700">
                              Trả lời
                            </button>
                          </div>
                          <p className="text-gray-600 mb-2">{comment.content}</p>
                          <div className="text-xs text-gray-500">
                            {formatDate(comment.createdAt)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Comment Form */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">
                    Để lại bình luận
                  </h3>
                  
                  <form className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Tên của bạn *"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                      <input
                        type="email"
                        placeholder="Email của bạn *"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <textarea
                      rows={5}
                      placeholder="Nội dung bình luận..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      required
                    />
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="privacy"
                        className="mr-2"
                        required
                      />
                      <label htmlFor="privacy" className="text-sm text-gray-600">
                        Tôi đồng ý với chính sách bảo mật.
                      </label>
                    </div>
                    <button
                      type="submit"
                      className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Gửi bình luận
                    </button>
                  </form>
                </div>
              </article>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-8">
              {/* Search */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Tìm kiếm
                </h3>
                <form className="relative">
                  <input
                    type="search"
                    placeholder="Tìm kiếm..."
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="submit"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-600"
                  >
                    <MagnifyingGlassIcon className="h-5 w-5" />
                  </button>
                </form>
              </div>

              {/* Categories */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Danh mục
                </h3>
                <ul className="space-y-2">
                  {categories.map((category, index) => (
                    <li key={index}>
                      <Link
                        href={`/blog/category/${category.name.toLowerCase()}`}
                        className="flex justify-between items-center py-2 text-gray-600 hover:text-blue-600 transition-colors"
                      >
                        <span>{category.name}</span>
                        <span className="text-sm bg-gray-100 px-2 py-1 rounded">
                          {category.count}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Popular Posts */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Bài viết phổ biến
                </h3>
                <div className="space-y-4">
                  {popularPosts.map((post, index) => (
                    <div key={index} className="flex space-x-3">
                      <Image
                        src={post.image}
                        alt={post.title}
                        width={80}
                        height={60}
                        className="w-20 h-15 object-cover rounded-lg flex-shrink-0"
                        quality={100}
                        unoptimized={true}
                      />
                      <div>
                        <Link
                          href={`/blog/post-${index + 1}`}
                          className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors line-clamp-2"
                        >
                          {post.title}
                        </Link>
                        <div className="text-xs text-gray-500 mt-1">
                          {post.date}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact Info */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Liên hệ với chúng tôi
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <PhoneIcon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Hỗ trợ 24/7</div>
                      <div className="font-semibold text-gray-900">+532 321 33 33</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <EnvelopeIcon className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Gửi tin nhắn</div>
                      <div className="font-semibold text-gray-900">khoitriso@gmail.com</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <MapPinIcon className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Địa chỉ</div>
                      <div className="font-semibold text-gray-900">Hà Nội, Việt Nam</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Tags phổ biến
                </h3>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, index) => (
                    <Link
                      key={index}
                      href={`/blog/tag/${tag.toLowerCase()}`}
                      className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-blue-100 hover:text-blue-700 transition-colors"
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <Image
            src="/images/call-action/call-action-1/shape-1.svg"
            alt="Shape"
            width={100}
            height={100}
            className="absolute top-10 left-10 animate-spin opacity-20"
            quality={100}
            unoptimized={true}
          />
          <Image
            src="/images/call-action/call-action-1/shape-2.svg"
            alt="Shape"
            width={80}
            height={80}
            className="absolute top-20 right-20 opacity-30"
            quality={100}
            unoptimized={true}
          />
          <Image
            src="/images/call-action/call-action-1/shape-3.svg"
            alt="Shape"
            width={60}
            height={60}
            className="absolute bottom-20 left-1/4 animate-bounce opacity-40"
            quality={100}
            unoptimized={true}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <Image
                src="/images/call-action/call-action-1/call-action-img.png"
                alt="Get started"
                width={500}
                height={400}
                className="w-full h-auto"
                quality={100}
                unoptimized={true}
              />
            </div>
            <div>
              <span className="text-blue-200 font-semibold uppercase tracking-wide text-sm">
                BẮT ĐẦU NGAY
              </span>
              <h2 className="mt-2 text-3xl lg:text-4xl font-bold">
                Khóa học trực tuyến <br />
                & Cơ hội học tập giá rẻ
              </h2>
              <p className="mt-4 text-lg text-blue-100">
                Tham gia cùng hàng nghìn học viên đã thành công với Khởi Trí Số. 
                Bắt đầu hành trình học tập của bạn ngay hôm nay.
              </p>
              <div className="mt-8">
                <Link
                  href="/courses"
                  className="ed-btn inline-flex items-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors shadow-lg"
                >
                  Bắt đầu học ngay
                  <ShareIcon className="ml-2 h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
