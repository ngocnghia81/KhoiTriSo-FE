import Link from "next/link";
import Logo from "./Logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
    FacebookIcon, 
    TwitterIcon, 
    InstagramIcon, 
    YoutubeIcon,
    MailIcon,
    PhoneIcon,
    MapPinIcon
} from "lucide-react";

const navigation = {
    courses: [
        { name: "Khóa học miễn phí", href: "/courses/free" },
        { name: "Toán học", href: "/courses/math" },
        { name: "Vật lý", href: "/courses/physics" },
        { name: "Hóa học", href: "/courses/chemistry" },
    ],
    books: [
        { name: "Sách điện tử", href: "/books" },
        { name: "Kích hoạt sách", href: "/books/activation" },
        { name: "Hướng dẫn sử dụng", href: "/books/guide" },
    ],
    support: [
        { name: "Diễn đàn", href: "/forum" },
        { name: "Liên hệ", href: "/contact" },
        { name: "Câu hỏi thường gặp", href: "/faq" },
        { name: "Hỗ trợ kỹ thuật", href: "/support" },
    ],
    company: [
        { name: "Về chúng tôi", href: "/about" },
        { name: "Đội ngũ giảng viên", href: "/teachers" },
        { name: "Tuyển dụng", href: "/careers" },
        { name: "Tin tức", href: "/news" },
    ],
};

export default function Footer() {
    return (
        <footer className="bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 text-white">
            <div className="mx-auto max-w-7xl px-6 pb-8 pt-16 sm:pt-24 lg:px-8 lg:pt-32">
                <div className="xl:grid xl:grid-cols-3 xl:gap-8">
                    {/* Company Info */}
                    <div className="space-y-8">
                        <Logo size="lg" variant="dark" showText={true} />
                        <p className="text-sm leading-6 text-gray-300 max-w-md">
                            Nền tảng giáo dục trực tuyến hàng đầu Việt Nam. Khởi
                            đầu trí tuệ trong kỷ nguyên số với hệ thống học tập
                            toàn diện, sách điện tử và cộng đồng học tập sôi
                            động.
                        </p>
                        <div className="flex space-x-6">
                            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-2">
                                <FacebookIcon className="h-5 w-5" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-2">
                                <TwitterIcon className="h-5 w-5" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-2">
                                <InstagramIcon className="h-5 w-5" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-2">
                                <YoutubeIcon className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>

                    {/* Navigation Links */}
                    <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
                        <div className="md:grid md:grid-cols-2 md:gap-8">
                            <div>
                                <h3 className="text-sm font-semibold leading-6 text-white mb-4">
                                    Khóa học
                                </h3>
                                <ul role="list" className="mt-6 space-y-4">
                                    {navigation.courses.map((item) => (
                                        <li key={item.name}>
                                            <Link
                                                href={item.href}
                                                className="text-sm leading-6 text-gray-300 hover:text-white transition-colors"
                                            >
                                                {item.name}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="mt-10 md:mt-0">
                                <h3 className="text-sm font-semibold leading-6 text-white mb-4">
                                    Sách điện tử
                                </h3>
                                <ul role="list" className="mt-6 space-y-4">
                                    {navigation.books.map((item) => (
                                        <li key={item.name}>
                                            <Link
                                                href={item.href}
                                                className="text-sm leading-6 text-gray-300 hover:text-white transition-colors"
                                            >
                                                {item.name}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                        <div className="md:grid md:grid-cols-2 md:gap-8">
                            <div>
                                <h3 className="text-sm font-semibold leading-6 text-white mb-4">
                                    Hỗ trợ
                                </h3>
                                <ul role="list" className="mt-6 space-y-4">
                                    {navigation.support.map((item) => (
                                        <li key={item.name}>
                                            <Link
                                                href={item.href}
                                                className="text-sm leading-6 text-gray-300 hover:text-white transition-colors"
                                            >
                                                {item.name}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="mt-10 md:mt-0">
                                <h3 className="text-sm font-semibold leading-6 text-white mb-4">
                                    Công ty
                                </h3>
                                <ul role="list" className="mt-6 space-y-4">
                                    {navigation.company.map((item) => (
                                        <li key={item.name}>
                                            <Link
                                                href={item.href}
                                                className="text-sm leading-6 text-gray-300 hover:text-white transition-colors"
                                            >
                                                {item.name}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contact Info */}
                <Card className="mt-16 bg-white/10 backdrop-blur-sm border-white/20">
                    <CardContent className="p-6">
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="flex items-center space-x-3">
                                <MailIcon className="h-5 w-5 text-blue-400" />
                                <div>
                                    <p className="text-sm font-medium text-white">Email</p>
                                    <p className="text-sm text-gray-300">support@khoitriso.com</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <PhoneIcon className="h-5 w-5 text-blue-400" />
                                <div>
                                    <p className="text-sm font-medium text-white">Điện thoại</p>
                                    <p className="text-sm text-gray-300">+84 123 456 789</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <MapPinIcon className="h-5 w-5 text-blue-400" />
                                <div>
                                    <p className="text-sm font-medium text-white">Địa chỉ</p>
                                    <p className="text-sm text-gray-300">Hà Nội, Việt Nam</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Separator className="mt-16 bg-white/20" />

                {/* Bottom Section */}
                <div className="mt-8 border-t border-white/20 pt-8 md:flex md:items-center md:justify-between">
                    <div className="flex space-x-6 md:order-2">
                        <Link
                            href="/privacy"
                            className="text-sm leading-6 text-gray-300 hover:text-white transition-colors"
                        >
                            Chính sách bảo mật
                        </Link>
                        <Link
                            href="/terms"
                            className="text-sm leading-6 text-gray-300 hover:text-white transition-colors"
                        >
                            Điều khoản sử dụng
                        </Link>
                        <Link
                            href="/cookies"
                            className="text-sm leading-6 text-gray-300 hover:text-white transition-colors"
                        >
                            Chính sách cookie
                        </Link>
                    </div>
                    <p className="mt-8 text-sm leading-6 text-gray-300 md:order-1 md:mt-0">
                        &copy; 2024 Khởi Trí Số. Tất cả quyền được bảo lưu.
                    </p>
                </div>
            </div>
        </footer>
    );
}