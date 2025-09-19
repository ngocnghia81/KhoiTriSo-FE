import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
    ClockIcon,
    UserGroupIcon,
    PlayCircleIcon,
    AcademicCapIcon,
    BookOpenIcon,
    CheckIcon,
    StarIcon,
    HeartIcon,
    ShareIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";

// Mock data - In real app, this would come from API
const coursesData = {
    "toan-lop-12-free": {
        id: "toan-lop-12-free",
        title: "Toán lớp 12 miễn phí",
        description:
            "Khóa học Toán lớp 12 miễn phí được thiết kế đặc biệt cho học sinh chuẩn bị thi THPT Quốc gia. Với nội dung được biên soạn bởi đội ngũ giảng viên giàu kinh nghiệm, khóa học cung cấp kiến thức toàn diện về các chương trình Toán lớp 12.",
        instructor: {
            name: "Thầy Nguyễn Văn A",
            id: "nguyen-van-a",
            avatar: "/images/team/1.jpg",
            title: "Thạc sĩ Toán học",
            experience: "15 năm kinh nghiệm",
        },
        thumbnail: "/images/courses/math-12-free.jpg",
        price: 0,
        originalPrice: null,
        isFree: true,
        level: "Lớp 12",
        duration: "12 giờ",
        lessons: 40,
        students: 1234,
        rating: 4.9,
        reviewsCount: 456,
        category: "Toán học",
        language: "Tiếng Việt",
        certificate: true,
        lastUpdated: "2024-01-15",
        outcomes: [
            "Nắm vững kiến thức Đại số và Giải tích lớp 12",
            "Thành thạo các phương pháp giải bài tập Hình học không gian",
            "Kỹ năng giải quyết các dạng bài thi THPT Quốc gia",
            "Phương pháp học tập hiệu quả và quản lý thời gian",
        ],
        requirements: [
            "Kiến thức Toán lớp 11 cơ bản",
            "Máy tính có kết nối internet",
            "Tinh thần học tập nghiêm túc",
        ],
        curriculum: [
            {
                title: "Chương 1: Ứng dụng đạo hàm để khảo sát và vẽ đồ thị hàm số",
                lessons: [
                    {
                        title: "Bài 1: Sự biến thiên của hàm số",
                        duration: "15 phút",
                        type: "Video",
                        isFree: true,
                    },
                    {
                        title: "Bài 2: Cực trị của hàm số",
                        duration: "20 phút",
                        type: "Video",
                        isFree: true,
                    },
                    {
                        title: "Bài 3: Giá trị lớn nhất và nhỏ nhất",
                        duration: "18 phút",
                        type: "Video",
                        isFree: false,
                    },
                    {
                        title: "Bài tập thực hành chương 1",
                        duration: "30 phút",
                        type: "Assignment",
                        isFree: false,
                    },
                ],
            },
            {
                title: "Chương 2: Hàm số mũ và hàm số logarit",
                lessons: [
                    {
                        title: "Bài 4: Lũy thừa với số mũ thực",
                        duration: "22 phút",
                        type: "Video",
                        isFree: false,
                    },
                    {
                        title: "Bài 5: Hàm số mũ và đồ thị",
                        duration: "25 phút",
                        type: "Video",
                        isFree: false,
                    },
                    {
                        title: "Bài 6: Hàm số logarit",
                        duration: "20 phút",
                        type: "Video",
                        isFree: false,
                    },
                    {
                        title: "Bài tập thực hành chương 2",
                        duration: "35 phút",
                        type: "Assignment",
                        isFree: false,
                    },
                ],
            },
            {
                title: "Chương 3: Nguyên hàm, tích phân và ứng dụng",
                lessons: [
                    {
                        title: "Bài 7: Nguyên hàm",
                        duration: "25 phút",
                        type: "Video",
                        isFree: false,
                    },
                    {
                        title: "Bài 8: Tích phân",
                        duration: "30 phút",
                        type: "Video",
                        isFree: false,
                    },
                    {
                        title: "Bài 9: Ứng dụng tích phân",
                        duration: "28 phút",
                        type: "Video",
                        isFree: false,
                    },
                    {
                        title: "Bài tập tổng hợp",
                        duration: "45 phút",
                        type: "Assignment",
                        isFree: false,
                    },
                ],
            },
        ],
        reviews: [
            {
                id: 1,
                user: "Nguyễn Thị D",
                avatar: "/images/avatars/avatar-1.jpg",
                rating: 5,
                comment:
                    "Thầy dạy rất dễ hiểu, tôi đã từ ghét Toán thành yêu thích môn này!",
                date: "2024-01-10",
            },
            {
                id: 2,
                user: "Trần Văn E",
                avatar: "/images/avatars/avatar-2.jpg",
                rating: 5,
                comment:
                    "Phương pháp giảng dạy của thầy rất hay, giúp tôi đạt 9.5 điểm Toán trong kỳ thi THPT.",
                date: "2024-01-08",
            },
            {
                id: 3,
                user: "Lê Thị F",
                avatar: "/images/avatars/avatar-3.jpg",
                rating: 4,
                comment:
                    "Khóa học tốt, nội dung phong phú. Chỉ mong có thêm nhiều bài tập thực hành.",
                date: "2024-01-05",
            },
        ],
    },
};

function formatPrice(price: number) {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(price);
}

function renderStars(rating: number) {
    return (
        <div className="flex items-center">
            {[0, 1, 2, 3, 4].map((star) => (
                <StarIconSolid
                    key={star}
                    className={`h-5 w-5 ${
                        rating > star ? "text-yellow-400" : "text-gray-300"
                    }`}
                />
            ))}
        </div>
    );
}

function getLessonIcon(type: string) {
    switch (type) {
        case "Video":
            return PlayCircleIcon;
        case "Assignment":
            return AcademicCapIcon;
        default:
            return BookOpenIcon;
    }
}

interface PageProps {
    params: {
        slug: string;
    };
}

export async function generateMetadata({
    params,
}: PageProps): Promise<Metadata> {
    const course = coursesData[params.slug as keyof typeof coursesData];

    if (!course) {
        return {
            title: "Khóa học không tồn tại",
        };
    }

    return {
        title: `${course.title} - Khởi Trí Số`,
        description: course.description,
        openGraph: {
            title: course.title,
            description: course.description,
            type: "website",
        },
    };
}

export default function CourseDetailPage({ params }: PageProps) {
    const course = coursesData[params.slug as keyof typeof coursesData];

    if (!course) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Breadcrumb */}
            <div className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <nav className="flex" aria-label="Breadcrumb">
                        <ol role="list" className="flex items-center space-x-4">
                            <li>
                                <Link
                                    href="/"
                                    className="text-gray-400 hover:text-gray-500"
                                >
                                    Trang chủ
                                </Link>
                            </li>
                            <li>
                                <div className="flex items-center">
                                    <svg
                                        className="flex-shrink-0 h-5 w-5 text-gray-300"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    <Link
                                        href="/courses"
                                        className="ml-4 text-gray-400 hover:text-gray-500"
                                    >
                                        Khóa học
                                    </Link>
                                </div>
                            </li>
                            <li>
                                <div className="flex items-center">
                                    <svg
                                        className="flex-shrink-0 h-5 w-5 text-gray-300"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    <span className="ml-4 text-gray-500">
                                        {course.title}
                                    </span>
                                </div>
                            </li>
                        </ol>
                    </nav>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="lg:grid lg:grid-cols-3 lg:gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        {/* Course Header */}
                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
                            <div className="aspect-video bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                                <PlayCircleIcon className="h-24 w-24 text-white opacity-80" />
                            </div>

                            <div className="p-8">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                        {course.category}
                                    </span>
                                    {course.isFree && (
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                            MIỄN PHÍ
                                        </span>
                                    )}
                                </div>

                                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                                    {course.title}
                                </h1>

                                <p className="text-lg text-gray-600 mb-6">
                                    {course.description}
                                </p>

                                <div className="flex items-center space-x-6 mb-6">
                                    <div className="flex items-center">
                                        {renderStars(course.rating)}
                                        <span className="ml-2 text-sm text-gray-600">
                                            {course.rating} (
                                            {course.reviewsCount} đánh giá)
                                        </span>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600">
                                        <UserGroupIcon className="h-4 w-4 mr-1" />
                                        {course.students.toLocaleString()} học
                                        viên
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center">
                                            <AcademicCapIcon className="h-6 w-6 text-gray-600" />
                                        </div>
                                        <div>
                                            <Link
                                                href={`/teachers/${course.instructor.id}`}
                                                className="font-semibold text-gray-900 hover:text-blue-600"
                                            >
                                                {course.instructor.name}
                                            </Link>
                                            <p className="text-sm text-gray-600">
                                                {course.instructor.title}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                                            <HeartIcon className="h-5 w-5 text-gray-600" />
                                        </button>
                                        <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                                            <ShareIcon className="h-5 w-5 text-gray-600" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* What You'll Learn */}
                        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">
                                Bạn sẽ học được gì?
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {course.outcomes.map((outcome, index) => (
                                    <div
                                        key={index}
                                        className="flex items-start"
                                    >
                                        <CheckIcon className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                                        <span className="text-gray-700">
                                            {outcome}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Course Content */}
                        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">
                                Nội dung khóa học
                            </h2>
                            <div className="space-y-6">
                                {course.curriculum.map(
                                    (chapter, chapterIndex) => (
                                        <div
                                            key={chapterIndex}
                                            className="border border-gray-200 rounded-lg"
                                        >
                                            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    {chapter.title}
                                                </h3>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    {chapter.lessons.length} bài
                                                    học
                                                </p>
                                            </div>
                                            <div className="divide-y divide-gray-200">
                                                {chapter.lessons.map(
                                                    (lesson, lessonIndex) => {
                                                        const IconComponent =
                                                            getLessonIcon(
                                                                lesson.type
                                                            );
                                                        return (
                                                            <div
                                                                key={
                                                                    lessonIndex
                                                                }
                                                                className="px-6 py-4 flex items-center justify-between"
                                                            >
                                                                <div className="flex items-center">
                                                                    <IconComponent className="h-5 w-5 text-gray-400 mr-3" />
                                                                    <div>
                                                                        <p className="font-medium text-gray-900">
                                                                            {
                                                                                lesson.title
                                                                            }
                                                                        </p>
                                                                        <p className="text-sm text-gray-600">
                                                                            {
                                                                                lesson.type
                                                                            }{" "}
                                                                            •{" "}
                                                                            {
                                                                                lesson.duration
                                                                            }
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                {lesson.isFree ? (
                                                                    <span className="text-sm text-green-600 font-medium">
                                                                        Miễn phí
                                                                    </span>
                                                                ) : (
                                                                    <PlayCircleIcon className="h-5 w-5 text-gray-400" />
                                                                )}
                                                            </div>
                                                        );
                                                    }
                                                )}
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>
                        </div>

                        {/* Requirements */}
                        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">
                                Yêu cầu
                            </h2>
                            <ul className="space-y-3">
                                {course.requirements.map(
                                    (requirement, index) => (
                                        <li
                                            key={index}
                                            className="flex items-start"
                                        >
                                            <div className="h-2 w-2 bg-gray-400 rounded-full mr-3 mt-2 flex-shrink-0"></div>
                                            <span className="text-gray-700">
                                                {requirement}
                                            </span>
                                        </li>
                                    )
                                )}
                            </ul>
                        </div>

                        {/* Reviews */}
                        <div className="bg-white rounded-2xl shadow-lg p-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">
                                Đánh giá từ học viên
                            </h2>
                            <div className="space-y-6">
                                {course.reviews.map((review) => (
                                    <div
                                        key={review.id}
                                        className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0"
                                    >
                                        <div className="flex items-start space-x-4">
                                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                                <span className="text-sm font-medium text-gray-600">
                                                    {review.user.charAt(0)}
                                                </span>
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h4 className="font-semibold text-gray-900">
                                                        {review.user}
                                                    </h4>
                                                    <span className="text-sm text-gray-500">
                                                        {review.date}
                                                    </span>
                                                </div>
                                                {renderStars(review.rating)}
                                                <p className="text-gray-700 mt-2">
                                                    {review.comment}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1 mt-8 lg:mt-0">
                        <div className="sticky top-8">
                            {/* Course Info Card */}
                            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                                <div className="text-center mb-6">
                                    {course.isFree ? (
                                        <div className="text-3xl font-bold text-green-600 mb-2">
                                            MIỄN PHÍ
                                        </div>
                                    ) : (
                                        <div className="mb-2">
                                            <span className="text-3xl font-bold text-gray-900">
                                                {formatPrice(course.price)}
                                            </span>
                                            {course.originalPrice && (
                                                <span className="text-lg text-gray-500 line-through ml-2">
                                                    {formatPrice(
                                                        course.originalPrice
                                                    )}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-4 mb-6">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">
                                            Cấp độ:
                                        </span>
                                        <span className="font-medium">
                                            {course.level}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">
                                            Thời lượng:
                                        </span>
                                        <span className="font-medium">
                                            {course.duration}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">
                                            Bài học:
                                        </span>
                                        <span className="font-medium">
                                            {course.lessons} bài
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">
                                            Học viên:
                                        </span>
                                        <span className="font-medium">
                                            {course.students.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">
                                            Ngôn ngữ:
                                        </span>
                                        <span className="font-medium">
                                            {course.language}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">
                                            Chứng chỉ:
                                        </span>
                                        <span className="font-medium">
                                            {course.certificate
                                                ? "Có"
                                                : "Không"}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                                        {course.isFree
                                            ? "Đăng ký học miễn phí"
                                            : "Thêm vào giỏ hàng"}
                                    </button>
                                    <button className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
                                        Thêm vào yêu thích
                                    </button>
                                </div>
                            </div>

                            {/* Instructor Card */}
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    Giảng viên
                                </h3>
                                <div className="flex items-center space-x-4 mb-4">
                                    <div className="h-16 w-16 rounded-full bg-gray-300 flex items-center justify-center">
                                        <AcademicCapIcon className="h-8 w-8 text-gray-600" />
                                    </div>
                                    <div>
                                        <Link
                                            href={`/teachers/${course.instructor.id}`}
                                            className="font-semibold text-gray-900 hover:text-blue-600"
                                        >
                                            {course.instructor.name}
                                        </Link>
                                        <p className="text-sm text-gray-600">
                                            {course.instructor.title}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            {course.instructor.experience}
                                        </p>
                                    </div>
                                </div>
                                <Link
                                    href={`/teachers/${course.instructor.id}`}
                                    className="block w-full text-center py-2 px-4 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                                >
                                    Xem hồ sơ
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
