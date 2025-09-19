import Link from "next/link";
import Logo from "./Logo";

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
        <footer className="bg-gray-900" aria-labelledby="footer-heading">
            <h2 id="footer-heading" className="sr-only">
                Footer
            </h2>
            <div className="mx-auto max-w-7xl px-6 pb-8 pt-16 sm:pt-24 lg:px-8 lg:pt-32">
                <div className="xl:grid xl:grid-cols-3 xl:gap-8">
                    <div className="space-y-8">
                        <Logo size="lg" variant="dark" showText={true} />
                        <p className="text-sm leading-6 text-gray-300">
                            Nền tảng giáo dục trực tuyến hàng đầu Việt Nam. Khởi
                            đầu trí tuệ trong kỷ nguyên số với hệ thống học tập
                            toàn diện, sách điện tử và cộng đồng học tập sôi
                            động.
                        </p>
                        <div className="flex space-x-6">
                            <a
                                href="#"
                                className="text-gray-400 hover:text-gray-300"
                            >
                                <span className="sr-only">Facebook</span>
                                <svg
                                    className="h-6 w-6"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                    aria-hidden="true"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </a>
                            <a
                                href="#"
                                className="text-gray-400 hover:text-gray-300"
                            >
                                <span className="sr-only">YouTube</span>
                                <svg
                                    className="h-6 w-6"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                    aria-hidden="true"
                                >
                                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                                </svg>
                            </a>
                            <a
                                href="#"
                                className="text-gray-400 hover:text-gray-300"
                            >
                                <span className="sr-only">Zalo</span>
                                <svg
                                    className="h-6 w-6"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                    aria-hidden="true"
                                >
                                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.568 8.16c-.169-.224-.487-.29-.75-.156-.263.135-.37.445-.253.734.117.289.394.47.694.47.3 0 .577-.181.694-.47.117-.289.01-.599-.253-.734-.263-.134-.581-.068-.75.156zm-11.136 0c-.169-.224-.487-.29-.75-.156-.263.135-.37.445-.253.734.117.289.394.47.694.47.3 0 .577-.181.694-.47.117-.289.01-.599-.253-.734-.263-.134-.581-.068-.75.156z" />
                                </svg>
                            </a>
                        </div>
                    </div>
                    <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
                        <div className="md:grid md:grid-cols-2 md:gap-8">
                            <div>
                                <h3 className="text-sm font-semibold leading-6 text-white">
                                    Khóa học
                                </h3>
                                <ul role="list" className="mt-6 space-y-4">
                                    {navigation.courses.map((item) => (
                                        <li key={item.name}>
                                            <Link
                                                href={item.href}
                                                className="text-sm leading-6 text-gray-300 hover:text-white"
                                            >
                                                {item.name}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="mt-10 md:mt-0">
                                <h3 className="text-sm font-semibold leading-6 text-white">
                                    Sách điện tử
                                </h3>
                                <ul role="list" className="mt-6 space-y-4">
                                    {navigation.books.map((item) => (
                                        <li key={item.name}>
                                            <Link
                                                href={item.href}
                                                className="text-sm leading-6 text-gray-300 hover:text-white"
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
                                <h3 className="text-sm font-semibold leading-6 text-white">
                                    Hỗ trợ
                                </h3>
                                <ul role="list" className="mt-6 space-y-4">
                                    {navigation.support.map((item) => (
                                        <li key={item.name}>
                                            <Link
                                                href={item.href}
                                                className="text-sm leading-6 text-gray-300 hover:text-white"
                                            >
                                                {item.name}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="mt-10 md:mt-0">
                                <h3 className="text-sm font-semibold leading-6 text-white">
                                    Công ty
                                </h3>
                                <ul role="list" className="mt-6 space-y-4">
                                    {navigation.company.map((item) => (
                                        <li key={item.name}>
                                            <Link
                                                href={item.href}
                                                className="text-sm leading-6 text-gray-300 hover:text-white"
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
                <div className="mt-16 border-t border-gray-900/10 pt-8 sm:mt-20 lg:mt-24">
                    <div className="md:flex md:items-center md:justify-between">
                        <div className="flex space-x-6 md:order-2">
                            <Link
                                href="/privacy"
                                className="text-sm leading-6 text-gray-300 hover:text-white"
                            >
                                Chính sách bảo mật
                            </Link>
                            <Link
                                href="/terms"
                                className="text-sm leading-6 text-gray-300 hover:text-white"
                            >
                                Điều khoản sử dụng
                            </Link>
                        </div>
                        <p className="mt-8 text-xs leading-5 text-gray-400 md:order-1 md:mt-0">
                            &copy; 2024 Khởi Trí Số. Nền tảng giáo dục trực
                            tuyến. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
