import HomePageModern from "./page-modern";

export default function HomePage() {
  return <HomePageModern />;
}
// import {
//     AcademicCapIcon,
//     BookOpenIcon,
//     UserGroupIcon,
//     CheckIcon,
//     ArrowRightIcon,
//     SparklesIcon,
//     DevicePhoneMobileIcon,
//     ClockIcon,
//     PlayCircleIcon,
//     StarIcon,
// } from "@heroicons/react/24/outline";
// import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
// import { BookOpen, Users, Award, ArrowRight, Play, ChevronLeft, ChevronRight, User } from "lucide-react";
// import Logo from "@/components/Logo";
// import AboutCarousel from "@/components/AboutCarousel";
// import HomeHeroCarousel from "@/components/home/HomeHeroCarousel";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Separator } from "@/components/ui/separator";
// import {
//   Carousel,
//   CarouselContent,
//   CarouselItem,
//   CarouselNext,
//   CarouselPrevious,
// } from "@/components/ui/carousel";

// const categories = [
//     {
//         name: "Toán học",
//         courses: 45,
//         icon: "/images/category/category-1/1.svg",
//         bgColor: "bg-blue-100",
//     },
//     {
//         name: "Vật lý",
//         courses: 32,
//         icon: "/images/category/category-1/2.svg",
//         bgColor: "bg-green-100",
//     },
//     {
//         name: "Hóa học",
//         courses: 28,
//         icon: "/images/category/category-1/3.svg",
//         bgColor: "bg-purple-100",
//     },
//     {
//         name: "Sinh học",
//         courses: 21,
//         icon: "/images/category/category-1/4.svg",
//         bgColor: "bg-red-100",
//     },
//     {
//         name: "Văn học",
//         courses: 18,
//         icon: "/images/category/category-1/5.svg",
//         bgColor: "bg-yellow-100",
//     },
//     {
//         name: "Tiếng Anh",
//         courses: 25,
//         icon: "/images/category/category-1/6.svg",
//         bgColor: "bg-indigo-100",
//     },
//     {
//         name: "Lịch sử",
//         courses: 15,
//         icon: "/images/category/category-1/7.svg",
//         bgColor: "bg-pink-100",
//     },
//     {
//         name: "Địa lý",
//         courses: 12,
//         icon: "/images/category/category-1/8.svg",
//         bgColor: "bg-teal-100",
//     },
// ];

// const features = [
//     {
//         name: "Hỗ trợ giảng viên",
//         description:
//             "Đội ngũ giảng viên chuyên nghiệp luôn sẵn sàng hỗ trợ học viên 24/7",
//         icon: "/images/features/features-1/1.svg",
//         color: "bg-blue-100",
//     },
//     {
//         name: "Giảng viên hàng đầu",
//         description: "Các giảng viên có nhiều năm kinh nghiệm và bằng cấp cao",
//         icon: "/images/features/features-1/2.svg",
//         color: "bg-green-100",
//     },
//     {
//         name: "Chất lượng xuất sắc",
//         description:
//             "Nội dung khóa học được thiết kế chuyên nghiệp và cập nhật thường xuyên",
//         icon: "/images/features/features-1/3.svg",
//         color: "bg-purple-100",
//     },
//     {
//         name: "Học mọi lúc mọi nơi",
//         description:
//             "Truy cập khóa học trên mọi thiết bị, học tập linh hoạt theo lịch trình của bạn",
//         icon: "/images/features/features-1/4.svg",
//         color: "bg-orange-100",
//     },
// ];

// const courses = [
//     {
//         id: "toan-lop-12-free",
//         title: "Toán lớp 12 miễn phí - Luyện thi THPT Quốc gia",
//         category: "Toán học",
//         instructor: "Thầy Nguyễn Văn A",
//         lessons: 40,
//         students: 1234,
//         rating: 4.9,
//         reviews: 456,
//         price: 0,
//         image: "/images/course/course-1/1.png",
//         tag: "Miễn phí",
//     },
//     {
//         id: "vat-ly-nang-cao",
//         title: "Vật lý nâng cao - Phương pháp giải nhanh",
//         category: "Vật lý",
//         instructor: "Cô Trần Thị B",
//         lessons: 35,
//         students: 987,
//         rating: 4.8,
//         reviews: 321,
//         price: 299000,
//         image: "/images/course/course-1/2.png",
//         tag: "Nâng cao",
//     },
//     {
//         id: "hoa-hoc-thuc-nghiem",
//         title: "Hóa học thực nghiệm - Từ cơ bản đến nâng cao",
//         category: "Hóa học",
//         instructor: "Thầy Lê Văn C",
//         lessons: 42,
//         students: 756,
//         rating: 4.7,
//         reviews: 234,
//         price: 249000,
//         image: "/images/course/course-1/3.png",
//         tag: "Thực nghiệm",
//     },
// ];

// const stats = [
//     { name: "Học viên đã đăng ký", value: "15,394", icon: UserGroupIcon },
//     { name: "Lớp học hoàn thành", value: "8,497", icon: BookOpenIcon },
//     { name: "Báo cáo học tập", value: "7,554", icon: StarIcon },
//     { name: "Giảng viên hàng đầu", value: "2,755", icon: AcademicCapIcon },
// ];

// const testimonials = [
//     {
//         content:
//             "Tham gia Khởi Trí Số là một trong những quyết định tốt nhất tôi từng đưa ra. Chương trình học thực tế và tập trung vào ứng dụng.",
//         author: {
//             name: "Nguyễn Văn Minh",
//             role: "Học sinh khoa học",
//             avatar: "/images/testimonial/testimonial-1/author-1.png",
//         },
//     },
//     {
//         content:
//             "Nội dung khóa học rất chất lượng và dễ hiểu. Giảng viên nhiệt tình và luôn sẵn sàng hỗ trợ học viên.",
//         author: {
//             name: "Trần Thị Lan",
//             role: "Sinh viên đại học",
//             avatar: "/images/testimonial/testimonial-1/author-2.png",
//         },
//     },
//     {
//         content:
//             "Tôi đã cải thiện đáng kể điểm số của mình nhờ các khóa học tại Khởi Trí Số. Rất cảm ơn các thầy cô!",
//         author: {
//             name: "Lê Hoàng Nam",
//             role: "Học sinh THPT",
//             avatar: "/images/testimonial/testimonial-1/author-3.png",
//         },
//     },
// ];

// // Animation variants
// const fadeInUp = {
//     hidden: { opacity: 0, y: 60 },
//     visible: { opacity: 1, y: 0 }
// };

// const staggerContainer = {
//     hidden: { opacity: 0 },
//     visible: {
//         opacity: 1,
//         transition: {
//             staggerChildren: 0.1
//         }
//     }
// };

// const scaleIn = {
//     hidden: { opacity: 0, scale: 0.8 },
//     visible: { opacity: 1, scale: 1 }
// };

// export default function HomePage() {
//     return (
//         <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
//             {/* Floating Background Elements */}
//             <div className="absolute inset-0 overflow-hidden pointer-events-none">
//                 <motion.div
//                     className="absolute top-20 left-10 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl"
//                     animate={{
//                         y: [0, -30, 0],
//                         x: [0, 20, 0],
//                     }}
//                     transition={{
//                         duration: 8,
//                         repeat: Infinity,
//                         ease: "easeInOut"
//                     }}
//                 />
//                 <motion.div
//                     className="absolute top-40 right-20 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl"
//                     animate={{
//                         y: [0, 40, 0],
//                         x: [0, -30, 0],
//                     }}
//                     transition={{
//                         duration: 10,
//                         repeat: Infinity,
//                         ease: "easeInOut"
//                     }}
//                 />
//                 <motion.div
//                     className="absolute bottom-20 left-1/3 w-80 h-80 bg-indigo-400/10 rounded-full blur-3xl"
//                     animate={{
//                         y: [0, -40, 0],
//                         x: [0, 30, 0],
//                     }}
//                     transition={{
//                         duration: 12,
//                         repeat: Infinity,
//                         ease: "easeInOut"
//                     }}
//                 />
//             </div>
//             {/* Hero Carousel */}
//             <HomeHeroCarousel />

//             {/* About Carousel Section */}
//             <AboutCarousel />

//             {/* Stats Section */}
//             <section className="pt-40 pb-16 bg-white relative z-0">
//                 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//                     <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
//                         {stats.map((stat, index) => (
//                             <Card key={index} className="text-center border-0 shadow-lg hover:shadow-xl transition-all duration-300">
//                                 <CardContent className="p-6">
//                                     <stat.icon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
//                                     <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
//                                     <div className="text-sm text-gray-600">{stat.name}</div>
//                                 </CardContent>
//                             </Card>
//                         ))}
//                     </div>
//                 </div>
//             </section>

//             {/* Categories Section */}
//             <section className="py-16">
//                 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//                     <div className="text-center mb-12">
//                         <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
//                             Danh mục khóa học
//                         </h2>
//                         <p className="text-lg text-gray-600 max-w-2xl mx-auto">
//                             Khám phá các môn học đa dạng với nội dung chất lượng cao
//                         </p>
//                     </div>
//                     <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6">
//                         {categories.map((category, index) => (
//                             <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg cursor-pointer">
//                                 <CardContent className="p-6 text-center">
//                                     <div className={`w-16 h-16 rounded-full ${category.bgColor} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
//                                         <Image
//                                             src={category.icon}
//                                             alt={category.name}
//                                             width={32}
//                                             height={32}
//                                             className="w-8 h-8"
//                                         />
//                                     </div>
//                                     <h3 className="font-semibold text-gray-900 mb-1">{category.name}</h3>
//                                     <p className="text-sm text-gray-600">{category.courses} khóa học</p>
//                                 </CardContent>
//                             </Card>
//                         ))}
//                     </div>
//                 </div>
//             </section>

//             {/* Features Section */}
//             <section className="py-16 bg-white">
//                 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//                     <div className="text-center mb-12">
//                         <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
//                             Tại sao chọn Khởi Trí Số?
//                         </h2>
//                         <p className="text-lg text-gray-600 max-w-2xl mx-auto">
//                             Những lý do khiến chúng tôi trở thành lựa chọn hàng đầu của học viên
//                         </p>
//                     </div>
//                     <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
//                         {features.map((feature, index) => (
//                             <Card key={index} className="text-center border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
//                                 <CardContent className="p-8">
//                                     <div className={`w-20 h-20 rounded-full ${feature.color} flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
//                                         <Image
//                                             src={feature.icon}
//                                             alt={feature.name}
//                                             width={40}
//                                             height={40}
//                                             className="w-10 h-10"
//                                         />
//                                     </div>
//                                     <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.name}</h3>
//                                     <p className="text-gray-600">{feature.description}</p>
//                                 </CardContent>
//                             </Card>
//                         ))}
//                     </div>
//                 </div>
//             </section>

//             {/* Courses Section */}
//             <section className="py-16">
//                 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//                     <div className="text-center mb-12">
//                         <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
//                             Khóa học nổi bật
//                         </h2>
//                         <p className="text-lg text-gray-600 max-w-2xl mx-auto">
//                             Những khóa học được yêu thích nhất với nội dung chất lượng cao
//                         </p>
//                     </div>
//                     <div className="grid md:grid-cols-3 gap-8">
//                         {courses.map((course) => (
//                             <Card key={course.id} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg overflow-hidden">
//                                 <div className="relative overflow-hidden">
//                                     <Image
//                                         src={course.image}
//                                         alt={course.title}
//                                         width={400}
//                                         height={250}
//                                         className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
//                                     />
//                                     <Badge className={`absolute top-4 right-4 ${
//                                         course.price === 0 
//                                             ? 'bg-green-500 hover:bg-green-600' 
//                                             : 'bg-blue-500 hover:bg-blue-600'
//                                     } text-white`}>
//                                         {course.tag}
//                                     </Badge>
//                                 </div>
//                                 <CardHeader className="pb-3">
//                                     <CardTitle className="text-lg font-semibold line-clamp-2 group-hover:text-blue-600 transition-colors">
//                                         {course.title}
//                                     </CardTitle>
//                                     <CardDescription className="text-sm text-gray-600">
//                                         {course.category} • {course.instructor}
//                                     </CardDescription>
//                                 </CardHeader>
//                                 <CardContent className="pt-0">
//                                     <div className="space-y-3">
//                                         <div className="flex items-center justify-between text-sm">
//                                             <span className="text-gray-500">Bài học:</span>
//                                             <span className="font-medium">{course.lessons}</span>
//                                         </div>
//                                         <div className="flex items-center justify-between text-sm">
//                                             <span className="text-gray-500">Học viên:</span>
//                                             <span className="font-medium">{course.students.toLocaleString()}</span>
//                                         </div>
//                                         <div className="flex items-center justify-between text-sm">
//                                             <span className="text-gray-500">Đánh giá:</span>
//                                             <div className="flex items-center">
//                                                 <StarIconSolid className="h-4 w-4 text-yellow-400 mr-1" />
//                                                 <span className="font-medium">{course.rating}</span>
//                                                 <span className="text-gray-500 ml-1">({course.reviews})</span>
//                                             </div>
//                                         </div>
//                                         <Separator />
//                                         <div className="flex items-center justify-between">
//                                             <span className={`text-xl font-bold ${
//                                                 course.price === 0 ? 'text-green-600' : 'text-blue-600'
//                                             }`}>
//                                                 {course.price === 0 ? 'Miễn phí' : `${course.price.toLocaleString()} VNĐ`}
//                                             </span>
//                                             <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white">
//                                                 Xem chi tiết
//                                             </Button>
//                                         </div>
//                                     </div>
//                                 </CardContent>
//                             </Card>
//                         ))}
//                     </div>
//                     <div className="text-center mt-12">
//                         <Button asChild size="lg" className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4">
//                             <Link href="/courses">
//                                 Xem tất cả khóa học
//                                 <ArrowRightIcon className="ml-2 h-5 w-5" />
//                             </Link>
//                         </Button>
//                     </div>
//                 </div>
//             </section>

//             {/* Trending Courses with Tabs */}
//             <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50 relative overflow-hidden">
//                 {/* Background decoration */}
//                 <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl" />
//                 <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl" />
                
//                 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
//                     <motion.div 
//                         className="text-center mb-12"
//                         initial={{ opacity: 0, y: 30 }}
//                         whileInView={{ opacity: 1, y: 0 }}
//                         transition={{ duration: 0.6 }}
//                         viewport={{ once: true }}
//                     >
//                         <Badge className="mb-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 text-sm font-semibold">
//                             🔥 Trending Now
//                         </Badge>
//                         <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
//                             Khóa học đang hot
//                         </h2>
//                         <p className="text-xl text-gray-600 max-w-3xl mx-auto">
//                             Những khóa học được nhiều học viên lựa chọn nhất trong tháng này
//                         </p>
//                     </motion.div>

//                     {/* Tab Filters */}
//                     <motion.div 
//                         className="flex flex-wrap justify-center gap-3 mb-12"
//                         initial={{ opacity: 0, y: 20 }}
//                         whileInView={{ opacity: 1, y: 0 }}
//                         transition={{ duration: 0.6, delay: 0.2 }}
//                         viewport={{ once: true }}
//                     >
//                         {["Tất cả", "Miễn phí", "Nâng cao", "Mới nhất"].map((tab, index) => (
//                             <motion.button
//                                 key={tab}
//                                 className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
//                                     index === 0 
//                                         ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' 
//                                         : 'bg-white text-gray-700 hover:bg-gray-50 shadow-md'
//                                 }`}
//                                 whileHover={{ scale: 1.05, y: -2 }}
//                                 whileTap={{ scale: 0.95 }}
//                             >
//                                 {tab}
//                             </motion.button>
//                         ))}
//                     </motion.div>

//                     {/* Course Grid */}
//                     <motion.div 
//                         className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
//                         variants={staggerContainer}
//                         initial="hidden"
//                         whileInView="visible"
//                         viewport={{ once: true, amount: 0.2 }}
//                     >
//                         {courses.slice(0, 3).map((course, index) => (
//                             <motion.div
//                                 key={course.id}
//                                 variants={fadeInUp}
//                                 transition={{ duration: 0.5, delay: index * 0.1 }}
//                             >
//                                 <motion.div
//                                     whileHover={{ y: -10, scale: 1.02 }}
//                                     transition={{ duration: 0.3 }}
//                                 >
//                                     <Card className="group hover:shadow-2xl transition-all duration-300 border-0 shadow-lg overflow-hidden bg-white h-full">
//                                         <div className="relative overflow-hidden">
//                                             <motion.div
//                                                 whileHover={{ scale: 1.1 }}
//                                                 transition={{ duration: 0.4 }}
//                                             >
//                                                 <Image
//                                                     src={course.image}
//                                                     alt={course.title}
//                                                     width={400}
//                                                     height={250}
//                                                     className="w-full h-48 object-cover"
//                                                 />
//                                             </motion.div>
//                                             <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                            
//                                             {/* Play button overlay */}
//                                             <motion.div 
//                                                 className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
//                                                 whileHover={{ scale: 1.1 }}
//                                             >
//                                                 <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-2xl">
//                                                     <Play className="h-8 w-8 text-blue-600 ml-1" />
//                                                 </div>
//                                             </motion.div>
                                            
//                                             <motion.div
//                                                 initial={{ scale: 0, rotate: -180 }}
//                                                 whileInView={{ scale: 1, rotate: 0 }}
//                                                 transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
//                                                 viewport={{ once: true }}
//                                                 className="absolute top-4 right-4"
//                                             >
//                                                 <Badge className={`${
//                                                     course.price === 0 
//                                                         ? 'bg-green-500 hover:bg-green-600' 
//                                                         : 'bg-blue-500 hover:bg-blue-600'
//                                                 } text-white shadow-lg`}>
//                                                     {course.tag}
//                                                 </Badge>
//                                             </motion.div>
//                                         </div>
//                                         <CardHeader className="pb-3">
//                                             <CardTitle className="text-lg font-semibold line-clamp-2 group-hover:text-blue-600 transition-colors">
//                                                 {course.title}
//                                             </CardTitle>
//                                             <CardDescription className="text-sm text-gray-600">
//                                                 {course.category} • {course.instructor}
//                                             </CardDescription>
//                                         </CardHeader>
//                                         <CardContent className="pt-0">
//                                             <div className="space-y-3">
//                                                 <div className="flex items-center justify-between text-sm">
//                                                     <span className="text-gray-500">Bài học:</span>
//                                                     <span className="font-medium">{course.lessons}</span>
//                                                 </div>
//                                                 <div className="flex items-center justify-between text-sm">
//                                                     <span className="text-gray-500">Học viên:</span>
//                                                     <span className="font-medium">{course.students.toLocaleString()}</span>
//                                                 </div>
//                                                 <div className="flex items-center justify-between text-sm">
//                                                     <span className="text-gray-500">Đánh giá:</span>
//                                                     <div className="flex items-center">
//                                                         <StarIconSolid className="h-4 w-4 text-yellow-400 mr-1" />
//                                                         <span className="font-medium">{course.rating}</span>
//                                                         <span className="text-gray-500 ml-1">({course.reviews})</span>
//                                                     </div>
//                                                 </div>
//                                                 <Separator />
//                                                 <div className="flex items-center justify-between">
//                                                     <span className={`text-xl font-bold ${
//                                                         course.price === 0 ? 'text-green-600' : 'text-blue-600'
//                                                     }`}>
//                                                         {course.price === 0 ? 'Miễn phí' : `${course.price.toLocaleString()} VNĐ`}
//                                                     </span>
//                                                     <Button size="sm" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white">
//                                                         Xem chi tiết
//                                                     </Button>
//                                                 </div>
//                                             </div>
//                                         </CardContent>
//                                     </Card>
//                                 </motion.div>
//                             </motion.div>
//                         ))}
//                     </motion.div>
//                 </div>
//             </section>

//             {/* Success Stories / Video Testimonials */}
//             <section className="py-20 bg-white relative overflow-hidden">
//                 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//                     <motion.div 
//                         className="text-center mb-16"
//                         initial={{ opacity: 0, y: 30 }}
//                         whileInView={{ opacity: 1, y: 0 }}
//                         transition={{ duration: 0.6 }}
//                         viewport={{ once: true }}
//                     >
//                         <Badge className="mb-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 text-sm font-semibold">
//                             ⭐ Success Stories
//                         </Badge>
//                         <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent mb-4">
//                             Câu chuyện thành công
//                         </h2>
//                         <p className="text-xl text-gray-600 max-w-3xl mx-auto">
//                             Hành trình học tập và thành công của các học viên tại Khởi Trí Số
//                         </p>
//                     </motion.div>

//                     <div className="grid md:grid-cols-2 gap-8">
//                         {/* Video Testimonial 1 */}
//                         <motion.div
//                             initial={{ opacity: 0, x: -30 }}
//                             whileInView={{ opacity: 1, x: 0 }}
//                             transition={{ duration: 0.6 }}
//                             viewport={{ once: true }}
//                         >
//                             <Card className="overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 group">
//                                 <div className="relative aspect-video bg-gradient-to-br from-blue-500 to-purple-600 overflow-hidden">
//                                     <Image
//                                         src="/images/testimonial/testimonial-1/author-1.png"
//                                         alt="Success story"
//                                         fill
//                                         className="object-cover opacity-80 group-hover:scale-110 transition-transform duration-500"
//                                     />
//                                     <div className="absolute inset-0 bg-black/40" />
//                                     <motion.div 
//                                         className="absolute inset-0 flex items-center justify-center"
//                                         whileHover={{ scale: 1.1 }}
//                                     >
//                                         <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center shadow-2xl cursor-pointer">
//                                             <Play className="h-10 w-10 text-blue-600 ml-1" />
//                                         </div>
//                                     </motion.div>
//                                     <div className="absolute bottom-4 left-4 right-4">
//                                         <Badge className="bg-green-500 text-white mb-2">Đạt 9.5 điểm</Badge>
//                                         <h3 className="text-white font-bold text-lg">Nguyễn Văn Minh</h3>
//                                         <p className="text-blue-100 text-sm">Học sinh lớp 12 - Đỗ ĐH Bách Khoa</p>
//                                     </div>
//                                 </div>
//                                 <CardContent className="p-6">
//                                     <p className="text-gray-700 leading-relaxed">
//                                         "Nhờ các khóa học tại Khởi Trí Số, em đã cải thiện điểm số từ 7.0 lên 9.5 và đỗ vào trường đại học mơ ước. Phương pháp giảng dạy rất dễ hiểu và thực tế."
//                                     </p>
//                                 </CardContent>
//                             </Card>
//                         </motion.div>

//                         {/* Video Testimonial 2 */}
//                         <motion.div
//                             initial={{ opacity: 0, x: 30 }}
//                             whileInView={{ opacity: 1, x: 0 }}
//                             transition={{ duration: 0.6 }}
//                             viewport={{ once: true }}
//                         >
//                             <Card className="overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 group">
//                                 <div className="relative aspect-video bg-gradient-to-br from-purple-500 to-pink-600 overflow-hidden">
//                                     <Image
//                                         src="/images/testimonial/testimonial-1/author-2.png"
//                                         alt="Success story"
//                                         fill
//                                         className="object-cover opacity-80 group-hover:scale-110 transition-transform duration-500"
//                                     />
//                                     <div className="absolute inset-0 bg-black/40" />
//                                     <motion.div 
//                                         className="absolute inset-0 flex items-center justify-center"
//                                         whileHover={{ scale: 1.1 }}
//                                     >
//                                         <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center shadow-2xl cursor-pointer">
//                                             <Play className="h-10 w-10 text-purple-600 ml-1" />
//                                         </div>
//                                     </motion.div>
//                                     <div className="absolute bottom-4 left-4 right-4">
//                                         <Badge className="bg-purple-500 text-white mb-2">Top 1% Quốc gia</Badge>
//                                         <h3 className="text-white font-bold text-lg">Trần Thị Lan</h3>
//                                         <p className="text-purple-100 text-sm">Sinh viên năm 2 - ĐH Ngoại Thương</p>
//                                     </div>
//                                 </div>
//                                 <CardContent className="p-6">
//                                     <p className="text-gray-700 leading-relaxed">
//                                         "Tôi đã tìm thấy đam mê học tập thực sự nhờ Khởi Trí Số. Các giảng viên không chỉ dạy kiến thức mà còn truyền cảm hứng và định hướng nghề nghiệp cho tôi."
//                                     </p>
//                                 </CardContent>
//                             </Card>
//                         </motion.div>
//                     </div>
//                 </div>
//             </section>

//             {/* Testimonials Section */}
//             <section className="py-16 bg-gradient-to-br from-slate-50 to-purple-50">
//                 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//                     <div className="text-center mb-12">
//                         <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
//                             Học viên nói gì về chúng tôi
//                         </h2>
//                         <p className="text-lg text-gray-600 max-w-2xl mx-auto">
//                             Những chia sẻ chân thực từ học viên đã trải nghiệm
//                         </p>
//                     </div>
//                     <div className="grid md:grid-cols-3 gap-8">
//                         {testimonials.map((testimonial, index) => (
//                             <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
//                                 <CardContent className="p-8">
//                                     <div className="flex items-start mb-6">
//                                         <div className="flex-shrink-0">
//                                             <Image
//                                                 src={testimonial.author.avatar}
//                                                 alt={testimonial.author.name}
//                                                 width={48}
//                                                 height={48}
//                                                 className="w-12 h-12 rounded-full"
//                                             />
//                                         </div>
//                                         <div className="ml-4">
//                                             <h4 className="font-semibold text-gray-900">{testimonial.author.name}</h4>
//                                             <p className="text-sm text-gray-600">{testimonial.author.role}</p>
//                                         </div>
//                                     </div>
//                                     <p className="text-gray-700 italic">"{testimonial.content}"</p>
//                                     <div className="flex mt-4">
//                                         {[...Array(5)].map((_, i) => (
//                                             <StarIconSolid key={i} className="h-5 w-5 text-yellow-400" />
//                                         ))}
//                                     </div>
//                                 </CardContent>
//                             </Card>
//                         ))}
//                     </div>
//                 </div>
//             </section>

//             {/* CTA Section */}
//             <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600">
//                 <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
//                     <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
//                         Sẵn sàng bắt đầu hành trình học tập?
//                     </h2>
//                     <p className="text-xl text-blue-100 mb-8">
//                         Tham gia cùng hàng nghìn học viên đã thành công với Khởi Trí Số
//                     </p>
//                     <div className="flex flex-col sm:flex-row gap-4 justify-center">
//                         <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-8 py-4 text-lg">
//                             <Link href="/auth/login">
//                                 Đăng nhập ngay
//                                 <ArrowRightIcon className="ml-2 h-5 w-5" />
//                             </Link>
//                         </Button>
//                         <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-blue-600 font-semibold px-8 py-4 text-lg">
//                             <Link href="/courses">
//                                 Khám phá khóa học
//                             </Link>
//                         </Button>
//                     </div>
//                 </div>
//             </section>
//         </div>
//     );
// }