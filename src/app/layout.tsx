import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Khởi Trí Số - Nền tảng giáo dục trực tuyến",
  description: "Hệ thống học tập trực tuyến toàn diện với sách điện tử, video bài giảng, bài tập tương tác và cộng đồng học tập sôi động.",
  keywords: "học trực tuyến, khóa học online, sách điện tử, bài tập trực tuyến, giáo dục số",
  authors: [{ name: "Khởi Trí Số Team" }],
  icons: {
    icon: "/images/logo.svg",
    shortcut: "/images/logo.svg",
    apple: "/images/logo.svg",
  },
  openGraph: {
    title: "Khởi Trí Số - Nền tảng giáo dục trực tuyến",
    description: "Khởi đầu trí tuệ trong kỷ nguyên số",
    type: "website",
    locale: "vi_VN",
    images: [
      {
        url: "/images/logo.svg",
        width: 375,
        height: 375,
        alt: "Khởi Trí Số Logo",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={`${inter.className} antialiased`}>
        <Header />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
