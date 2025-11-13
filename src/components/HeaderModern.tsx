"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useClientOnly } from "@/hooks/useClientOnly";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import {
    Menu,
    X,
    Search,
    ShoppingCart,
    BookOpen,
    GraduationCap,
    MessageSquare,
    Mail,
    ChevronDown,
    User,
    LogIn,
    Globe,
    Sparkles,
    Map
} from "lucide-react";
import Logo from "./Logo";
import UserMenu from "./UserMenu";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { useCart } from "@/hooks/useCart";

const navigation = [
    {
        name: "Trang chủ",
        href: "/",
        icon: Sparkles,
    },
    {
        name: "Khóa học",
        href: "/courses",
        icon: GraduationCap,
        children: [
            { name: "Tất cả khóa học", href: "/courses" },
            { name: "Khóa học miễn phí", href: "/courses?isFree=true" },
            { name: "Khóa học trả phí", href: "/courses?isFree=false" },
        ],
    },
    {
        name: "Lộ trình học",
        href: "/learning-paths",
        icon: Map,
    },
    {
        name: "Sách điện tử",
        href: "/books",
        icon: BookOpen,
        children: [
            { name: "Danh sách sách", href: "/books" },
            { name: "Kích hoạt sách", href: "/books/activation" },
        ],
    },
    {
        name: "Diễn đàn",
        href: "/forum",
        icon: MessageSquare,
    },
    {
        name: "Liên hệ",
        href: "/contact",
        icon: Mail,
    },
];

export default function HeaderModern() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const [scrolled, setScrolled] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const { user, isAuthenticated } = useAuth();
    const { language, setLanguage } = useLanguage();
    const pathname = usePathname();
    const router = useRouter();
    const isClient = useClientOnly();
    const { cart } = useCart();

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Close search when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setSearchOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
            setSearchOpen(false);
            setSearchQuery("");
        }
    };

    const cartItemCount = cart?.TotalItems || 0;

    return (
        <motion.header
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                scrolled
                    ? "bg-white/95 backdrop-blur-xl shadow-lg border-b border-slate-200"
                    : "bg-white/80 backdrop-blur-md border-b border-slate-100"
            }`}
        >
            <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-20 items-center justify-between">
                    {/* Logo */}
                    <motion.div
                        className="flex items-center"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Link href="/" className="flex items-center space-x-3">
                            <Logo size="md" variant="light" showText={true} />
                        </Link>
                    </motion.div>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex lg:items-center lg:space-x-2">
                        {navigation.map((item) => (
                            <div
                                key={item.name}
                                className="relative"
                                onMouseEnter={() => item.children && setOpenDropdown(item.name)}
                                onMouseLeave={() => setOpenDropdown(null)}
                            >
                                {item.children ? (
                                    <>
                                        <Button
                                            variant="ghost"
                                            className={`flex items-center space-x-1 px-4 py-2 rounded-xl transition-all duration-200 ${
                                                pathname?.startsWith(item.href)
                                                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                                                    : "text-slate-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-600"
                                            }`}
                                        >
                                            <item.icon className="h-4 w-4" />
                                            <span className="font-medium">{item.name}</span>
                                            <ChevronDown className="h-4 w-4" />
                                        </Button>
                                        <AnimatePresence>
                                            {openDropdown === item.name && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -10 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="absolute left-0 top-full mt-2 w-56"
                                                >
                                                    <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-xl rounded-2xl overflow-hidden">
                                                        <CardContent className="p-2">
                                                            {item.children.map((child, index) => (
                                                                <Link
                                                                    key={child.name}
                                                                    href={child.href}
                                                                    className="block px-4 py-3 rounded-xl text-slate-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-600 transition-all duration-200 font-medium"
                                                                >
                                                                    {child.name}
                                                                </Link>
                                                            ))}
                                                        </CardContent>
                                                    </Card>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </>
                                ) : (
                                    <Button
                                        variant="ghost"
                                        asChild
                                        className={`flex items-center space-x-1 px-4 py-2 rounded-xl transition-all duration-200 ${
                                            pathname === item.href
                                                ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                                                : "text-slate-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-600"
                                        }`}
                                    >
                                        <Link href={item.href}>
                                            <item.icon className="h-4 w-4" />
                                            <span className="font-medium">{item.name}</span>
                                        </Link>
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center space-x-3">
                        {/* Search */}
                        <div className="relative" ref={searchRef}>
                            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setSearchOpen(!searchOpen)}
                                    className="rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-600"
                                >
                                    <Search className="h-5 w-5" />
                                </Button>
                            </motion.div>

                            <AnimatePresence>
                                {searchOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                        transition={{ duration: 0.2 }}
                                        className="absolute right-0 top-full mt-2 w-96"
                                    >
                                        <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-xl rounded-2xl overflow-hidden">
                                            <CardContent className="p-4">
                                                <form onSubmit={handleSearch}>
                                                    <div className="flex items-center space-x-2 mb-3">
                                                        <Search className="h-5 w-5 text-slate-400" />
                                                        <Input
                                                            type="text"
                                                            placeholder="Tìm kiếm khóa học, sách, lộ trình..."
                                                            value={searchQuery}
                                                            onChange={(e) => setSearchQuery(e.target.value)}
                                                            className="border-0 focus-visible:ring-0 text-base"
                                                            autoFocus
                                                        />
                                                    </div>
                                                    <Button
                                                        type="submit"
                                                        className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl"
                                                    >
                                                        Tìm kiếm
                                                    </Button>
                                                </form>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Cart */}
                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                            <Button
                                variant="ghost"
                                size="icon"
                                asChild
                                className="relative rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-600"
                            >
                                <Link href="/cart">
                                    <ShoppingCart className="h-5 w-5" />
                                    {cartItemCount > 0 && (
                                        <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs">
                                            {cartItemCount}
                                        </Badge>
                                    )}
                                </Link>
                            </Button>
                        </motion.div>

                        {/* Language */}
                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setLanguage(language === "vi" ? "en" : "vi")}
                                className="rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-600"
                            >
                                <Globe className="h-5 w-5" />
                            </Button>
                        </motion.div>

                        {/* User Menu */}
                        {isClient && (
                            <>
                                {isAuthenticated ? (
                                    <UserMenu />
                                ) : (
                                    <Button
                                        variant="ghost"
                                        asChild
                                        className="rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-600"
                                    >
                                        <Link href="/auth/login">
                                            <LogIn className="h-4 w-4 mr-2" />
                                            <span className="hidden lg:inline">Đăng nhập</span>
                                        </Link>
                                    </Button>
                                )}
                            </>
                        )}

                        {/* Mobile Menu Button */}
                        <div className="lg:hidden">
                            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                    className="rounded-xl"
                                >
                                    {mobileMenuOpen ? (
                                        <X className="h-6 w-6" />
                                    ) : (
                                        <Menu className="h-6 w-6" />
                                    )}
                                </Button>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="lg:hidden border-t border-slate-200 bg-white/95 backdrop-blur-xl"
                    >
                        <div className="px-4 py-6 space-y-4">
                            {navigation.map((item) => (
                                <div key={item.name}>
                                    {item.children ? (
                                        <div className="space-y-2">
                                            <div className="flex items-center space-x-2 font-semibold text-slate-900">
                                                <item.icon className="h-5 w-5" />
                                                <span>{item.name}</span>
                                            </div>
                                            <div className="pl-7 space-y-1">
                                                {item.children.map((child) => (
                                                    <Link
                                                        key={child.name}
                                                        href={child.href}
                                                        className="block py-2 text-slate-600 hover:text-blue-600"
                                                        onClick={() => setMobileMenuOpen(false)}
                                                    >
                                                        {child.name}
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <Link
                                            href={item.href}
                                            className="flex items-center space-x-2 py-2 font-semibold text-slate-900 hover:text-blue-600"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            <item.icon className="h-5 w-5" />
                                            <span>{item.name}</span>
                                        </Link>
                                    )}
                                </div>
                            ))}

                            <Separator />

                            {isClient && !isAuthenticated && (
                                <Button
                                    variant="outline"
                                    asChild
                                    className="w-full justify-start rounded-xl"
                                >
                                    <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                                        <LogIn className="h-4 w-4 mr-2" />
                                        Đăng nhập
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.header>
    );
}
