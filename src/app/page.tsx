import Link from "next/link";
import Image from "next/image";
import {
    AcademicCapIcon,
    BookOpenIcon,
    UserGroupIcon,
    CheckIcon,
    ArrowRightIcon,
    SparklesIcon,
    DevicePhoneMobileIcon,
    ClockIcon,
    PlayCircleIcon,
    StarIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import Logo from "@/components/Logo";

const categories = [
    {
        name: "Toán học",
        courses: 45,
        icon: "/images/category/category-1/1.svg",
        bgColor: "bg-blue-100",
    },
    {
        name: "Vật lý",
        courses: 32,
        icon: "/images/category/category-1/2.svg",
        bgColor: "bg-green-100",
    },
    {
        name: "Hóa học",
        courses: 28,
        icon: "/images/category/category-1/3.svg",
        bgColor: "bg-purple-100",
    },
    {
        name: "Sinh học",
        courses: 21,
        icon: "/images/category/category-1/4.svg",
        bgColor: "bg-red-100",
    },
    {
        name: "Văn học",
        courses: 18,
        icon: "/images/category/category-1/5.svg",
        bgColor: "bg-yellow-100",
    },
    {
        name: "Tiếng Anh",
        courses: 25,
        icon: "/images/category/category-1/6.svg",
        bgColor: "bg-indigo-100",
    },
    {
        name: "Lịch sử",
        courses: 15,
        icon: "/images/category/category-1/7.svg",
        bgColor: "bg-pink-100",
    },
    {
        name: "Địa lý",
        courses: 12,
        icon: "/images/category/category-1/8.svg",
        bgColor: "bg-teal-100",
    },
];

const features = [
    {
        name: "Hỗ trợ giảng viên",
        description:
            "Đội ngũ giảng viên chuyên nghiệp luôn sẵn sàng hỗ trợ học viên 24/7",
        icon: "/images/features/features-1/1.svg",
        color: "bg-blue-100",
    },
    {
        name: "Giảng viên hàng đầu",
        description: "Các giảng viên có nhiều năm kinh nghiệm và bằng cấp cao",
        icon: "/images/features/features-1/2.svg",
        color: "bg-green-100",
    },
    {
        name: "Chất lượng xuất sắc",
        description:
            "Nội dung khóa học được thiết kế chuyên nghiệp và cập nhật thường xuyên",
        icon: "/images/features/features-1/3.svg",
        color: "bg-purple-100",
    },
];

const courses = [
    {
        id: "toan-lop-12-free",
        title: "Toán lớp 12 miễn phí - Luyện thi THPT Quốc gia",
        category: "Toán học",
        instructor: "Thầy Nguyễn Văn A",
        lessons: 40,
        students: 1234,
        rating: 4.9,
        reviews: 456,
        price: 0,
        image: "/images/course/course-1/1.png",
        tag: "Miễn phí",
    },
    {
        id: "vat-ly-nang-cao",
        title: "Vật lý nâng cao - Phương pháp giải nhanh",
        category: "Vật lý",
        instructor: "Cô Trần Thị B",
        lessons: 35,
        students: 987,
        rating: 4.8,
        reviews: 321,
        price: 299000,
        image: "/images/course/course-1/2.png",
        tag: "Nâng cao",
    },
    {
        id: "hoa-hoc-thuc-nghiem",
        title: "Hóa học thực nghiệm - Từ cơ bản đến nâng cao",
        category: "Hóa học",
        instructor: "Thầy Lê Văn C",
        lessons: 42,
        students: 756,
        rating: 4.7,
        reviews: 234,
        price: 249000,
        image: "/images/course/course-1/3.png",
        tag: "Thực nghiệm",
    },
];

const stats = [
    { name: "Học viên đã đăng ký", value: "15,394", icon: UserGroupIcon },
    { name: "Lớp học hoàn thành", value: "8,497", icon: BookOpenIcon },
    { name: "Báo cáo học tập", value: "7,554", icon: StarIcon },
    { name: "Giảng viên hàng đầu", value: "2,755", icon: AcademicCapIcon },
];

const testimonials = [
    {
        content:
            "Tham gia Khởi Trí Số là một trong những quyết định tốt nhất tôi từng đưa ra. Chương trình học thực tế và tập trung vào ứng dụng.",
        author: {
            name: "Nguyễn Văn Minh",
            role: "Học sinh khoa học",
            avatar: "/images/testimonial/testimonial-1/author-1.png",
        },
        rating: 5,
    },
    {
        content:
            "Giảng viên nhiệt tình, nội dung bài giảng dễ hiểu và có thể áp dụng ngay vào thực tế. Tôi rất hài lòng với chất lượng dạy học.",
        author: {
            name: "Trần Thị Hương",
            role: "Học sinh khoa học",
            avatar: "/images/testimonial/testimonial-1/author-1.png",
        },
        rating: 5,
    },
];

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
                    className={`h-4 w-4 ${
                        rating > star ? "text-yellow-400" : "text-gray-300"
                    }`}
                />
            ))}
            <span className="ml-1 text-sm text-gray-600">({rating})</span>
        </div>
    );
}

export default function Home() {
    return (
        <div style={{ backgroundColor: "#f5f2e8" }}>
            {/* Hero Section */}
            <div
                className="relative overflow-hidden"
                style={{ backgroundColor: "#f5f2e8" }}
            >
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <Image
                        src="/images/hero/home-1/hero-bg.png"
                        alt="hero-bg"
                        fill
                        className="object-cover"
                        quality={100}
                        priority
                    />
                </div>

                {/* Floating Elements */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-20 left-20 w-16 h-16 bg-white opacity-10 rounded-full animate-bounce"></div>
                    <div className="absolute top-40 right-32 w-12 h-12 bg-yellow-300 opacity-20 rounded-full animate-pulse"></div>
                    <div
                        className="absolute bottom-32 left-1/4 w-20 h-20 bg-green-300 opacity-15 rounded-full animate-bounce"
                        style={{ animationDelay: "1s" }}
                    ></div>
                    <div
                        className="absolute top-1/3 right-20 w-8 h-8 bg-pink-300 opacity-20 rounded-full animate-pulse"
                        style={{ animationDelay: "2s" }}
                    ></div>
                    <div
                        className="absolute bottom-20 right-1/3 w-14 h-14 bg-blue-300 opacity-15 rounded-full animate-bounce"
                        style={{ animationDelay: "0.5s" }}
                    ></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        {/* Hero Content */}
                        <div className="text-gray-800">
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                                Nền tảng{" "}
                                <span className="bg-yellow-400 px-2 py-1 rounded-lg">
                                    trực tuyến
                                </span>{" "}
                                tốt nhất để học mọi thứ
                            </h1>
                            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                                Hệ thống học tập trực tuyến toàn diện với sách
                                điện tử, video bài giảng, bài tập tương tác và
                                cộng đồng học tập sôi động.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 mb-12">
                                <Link
                                    href="/courses"
                                    className="group inline-flex items-center justify-center px-8 py-4 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                                    style={{ backgroundColor: "#6366f1" }}
                                >
                                    Tìm khóa học
                                    <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        </div>

                        {/* Hero Image */}
                        <div className="relative">
                            <div className="relative z-10">
                                <Image
                                    src="/images/hero/home-1/hero-img.png"
                                    alt="hero-img"
                                    width={600}
                                    height={500}
                                    className="w-full h-auto"
                                    quality={100}
                                    priority
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* About Section */}
            <div
                className="relative py-20"
                style={{ backgroundColor: "#f5f2e8" }}
            >
                <div className="absolute inset-0 opacity-5">
                    <Image
                        src="/images/section-bg-1.png"
                        alt="section-bg"
                        fill
                        className="object-cover"
                        quality={100}
                    />
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        {/* About Images */}
                        <div className="relative">
                            <div className="relative z-10">
                                <Image
                                    src="/images/about/about-1/about-img.png"
                                    alt="about-img"
                                    width={500}
                                    height={400}
                                    className="w-full h-auto rounded-3xl shadow-2xl"
                                    quality={100}
                                />
                            </div>

                            {/* Counter Card */}
                            <div className="absolute bottom-8 right-8 bg-white rounded-2xl p-6 shadow-xl animate-bounce">
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                        <AcademicCapIcon className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h4 className="text-2xl font-bold text-gray-900">
                                            15,394+
                                        </h4>
                                        <p className="text-gray-600">
                                            Học viên đã đăng ký
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Floating Shapes */}
                            <div className="absolute -top-4 -left-4 w-16 h-16 bg-blue-200 rounded-full opacity-60 animate-pulse"></div>
                            <div className="absolute top-1/2 -right-8 w-12 h-12 bg-purple-200 rounded-full opacity-60 animate-bounce"></div>
                        </div>

                        {/* About Content */}
                        <div>
                            <div className="mb-8">
                                <span className="inline-block px-4 py-2 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full mb-4">
                                    CHÀO MỪNG ĐẾN KHỞI TRÍ SỐ
                                </span>
                                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                                    Nền Tảng Giáo Dục Trực Tuyến: <br />
                                    <span className="text-blue-600">
                                        Khởi Đầu Trí Tuệ Trong Kỷ Nguyên Số
                                    </span>
                                </h2>
                                <p className="text-xl text-gray-600 leading-relaxed">
                                    Hệ thống học tập trực tuyến toàn diện với
                                    sách điện tử, video bài giảng, bài tập tương
                                    tác và cộng đồng học tập sôi động.
                                </p>
                            </div>

                            <ul className="space-y-4">
                                {[
                                    "Giảng viên chuyên nghiệp",
                                    "Học trực tuyến linh hoạt",
                                    "Sách điện tử kèm video giải thích",
                                    "Truy cập 2 năm sau kích hoạt",
                                ].map((item, index) => (
                                    <li
                                        key={index}
                                        className="flex items-center"
                                    >
                                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                                            <CheckIcon className="w-4 h-4 text-blue-600" />
                                        </div>
                                        <span className="text-gray-700 font-medium">
                                            {item}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Categories Section */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-end mb-16">
                        <div>
                            <span className="inline-block px-4 py-2 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full mb-4">
                                DANH MỤC KHÓA HỌC
                            </span>
                            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
                                Các môn học hàng đầu bạn muốn học
                            </h2>
                        </div>
                        <div>
                            <Link
                                href="/courses"
                                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 transition-colors"
                            >
                                Tìm khóa học
                                <ArrowRightIcon className="w-5 h-5 ml-2" />
                            </Link>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6">
                        {categories.map((category, index) => (
                            <Link
                                key={category.name}
                                href={`/courses/${category.name.toLowerCase()}`}
                                className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-100"
                                style={{
                                    animationDelay: `${
                                        (index % 4) * 0.1 + 0.1
                                    }s`,
                                }}
                            >
                                <div
                                    className={`w-16 h-16 ${category.bgColor} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                                >
                                    <Image
                                        src={category.icon}
                                        alt={category.name}
                                        width={32}
                                        height={32}
                                        quality={100}
                                    />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                                    {category.name}
                                </h3>
                                <p className="text-gray-600">
                                    {category.courses} Khóa học
                                </p>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section
                className="relative py-20"
                style={{ backgroundColor: "#f5f2e8" }}
            >
                {/* Floating Shapes */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-20 left-20 w-16 h-16 bg-blue-200 rounded-full opacity-30 animate-bounce"></div>
                    <div className="absolute bottom-20 right-20 w-20 h-20 bg-purple-200 rounded-full opacity-30 animate-pulse"></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <div
                                key={feature.name}
                                className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
                                style={{
                                    animationDelay: `${index * 0.1 + 0.2}s`,
                                }}
                            >
                                <div
                                    className={`w-16 h-16 ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
                                >
                                    <Image
                                        src={feature.icon}
                                        alt={feature.name}
                                        width={32}
                                        height={32}
                                        quality={100}
                                    />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">
                                    {feature.name}
                                </h3>
                                <p className="text-gray-600">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Courses Section */}
            <section className="relative py-20 bg-white">
                {/* Background Shapes */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-20 right-20 w-24 h-24 bg-blue-100 rounded-full opacity-50 animate-pulse"></div>
                    <div className="absolute bottom-40 left-20 w-16 h-16 bg-purple-100 rounded-full opacity-50 animate-bounce"></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <span className="inline-block px-4 py-2 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full mb-4">
                            KHÓA HỌC TRỰC TUYẾN
                        </span>
                        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
                            Nhận khóa học của bạn cùng chúng tôi
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {courses.map((course, index) => (
                            <div
                                key={course.id}
                                className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
                                style={{
                                    animationDelay: `${index * 0.1 + 0.3}s`,
                                }}
                            >
                                <div className="relative">
                                    <Image
                                        src={course.image}
                                        alt={course.title}
                                        width={400}
                                        height={250}
                                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                                        quality={100}
                                    />
                                    {course.tag && (
                                        <span className="absolute top-4 left-4 px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full">
                                            {course.tag}
                                        </span>
                                    )}
                                </div>

                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center text-sm text-gray-600">
                                            <BookOpenIcon className="w-4 h-4 mr-1" />
                                            <span>
                                                {course.lessons} Bài học
                                            </span>
                                        </div>
                                        <div className="flex items-center text-sm text-gray-600">
                                            <UserGroupIcon className="w-4 h-4 mr-1" />
                                            <span>{course.instructor}</span>
                                        </div>
                                    </div>

                                    <Link
                                        href={`/courses/${course.id}`}
                                        className="block mb-4"
                                    >
                                        <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2">
                                            {course.title}
                                        </h3>
                                    </Link>

                                    <div className="flex items-center mb-4">
                                        {renderStars(course.rating)}
                                        <span className="text-sm text-gray-600 ml-2">
                                            ({course.reviews} đánh giá)
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-xl font-bold text-blue-600">
                                            {course.price === 0
                                                ? "MIỄN PHÍ"
                                                : formatPrice(course.price)}
                                        </span>
                                        <div className="flex items-center text-sm text-gray-600">
                                            <UserGroupIcon className="w-4 h-4 mr-1" />
                                            <span>
                                                {course.students} học viên
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <Image
                                src="/images/funfact/funfact-1/funfact-img.png"
                                alt="funfact-img"
                                width={400}
                                height={300}
                                className="w-full h-auto"
                                quality={100}
                            />
                        </div>

                        <div className="text-white">
                            <div className="grid grid-cols-2 gap-8">
                                {stats.map((stat) => (
                                    <div
                                        key={stat.name}
                                        className="text-center"
                                    >
                                        <div className="flex justify-center mb-4">
                                            <stat.icon className="h-12 w-12" />
                                        </div>
                                        <h3 className="text-4xl font-bold mb-2">
                                            {stat.value}+
                                        </h3>
                                        <p className="text-blue-100">
                                            {stat.name}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20" style={{ backgroundColor: "#f5f2e8" }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="max-w-3xl mx-auto">
                        <span className="inline-block px-4 py-2 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full mb-4">
                            BẮT ĐẦU NGAY
                        </span>
                        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                            Khóa học trực tuyến phù hợp <br />& Cơ hội học tập
                        </h2>
                        <p className="text-xl text-gray-600 mb-8">
                            Tham gia cùng hàng nghìn học viên đã tin tưởng và
                            lựa chọn Khởi Trí Số để nâng cao kiến thức và kỹ
                            năng của mình.
                        </p>

                        <Link
                            href="/auth/login"
                            className="group inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                        >
                            <SparklesIcon className="w-5 h-5 mr-2" />
                            Bắt đầu học hôm nay
                            <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Link>

                        <div className="mt-8 text-gray-600">
                            <p className="text-sm">
                                ✨ Đăng nhập bằng Google hoặc Facebook • Nhanh
                                chóng & An toàn
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
