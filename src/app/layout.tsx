import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import ConditionalLayout from "@/components/ConditionalLayout";
import Script from "next/script";
import "@/utils/suppressWarnings";
import { Toaster } from "sonner";

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
        <Script
          id="mathml-utils"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              // Global MathML utilities for the Khởi Trí Số platform
              const convertMfenced = (root) => {
                const ns = "http://www.w3.org/1998/Math/MathML";
                const fencedNodes = root.querySelectorAll("mfenced");

                fencedNodes.forEach(mf => {
                  const open = mf.getAttribute("open") ?? "(";
                  const close = mf.getAttribute("close") ?? ")";
                  const separatorsAttr = mf.getAttribute("separators");
                  const separators = separatorsAttr ? separatorsAttr.split("") : [""];

                  const mrow = document.createElementNS(ns, "mrow");

                  if (open !== "") {
                    const moOpen = document.createElementNS(ns, "mo");
                    moOpen.textContent = open;
                    mrow.appendChild(moOpen);
                  }

                  const children = Array.from(mf.children);
                  children.forEach((child, i) => {
                    mrow.appendChild(child.cloneNode(true));
                    if (i < children.length - 1) {
                      const sep = document.createElementNS(ns, "mo");
                      sep.textContent = separators[i] ?? separators[separators.length - 1];
                      mrow.appendChild(sep);
                    }
                  });

                  if (close !== "") {
                    const moClose = document.createElementNS(ns, "mo");
                    moClose.textContent = close;
                    mrow.appendChild(moClose);
                  }

                  mf.replaceWith(mrow);
                });
              };

              // Initialize MathML conversion
              const initMathML = () => {
                convertMfenced(document);
                
                // Set up observer for dynamically added content
                const observer = new MutationObserver((mutations) => {
                  mutations.forEach((mutation) => {
                    mutation.addedNodes.forEach((node) => {
                      if (node.nodeType === Node.ELEMENT_NODE) {
                        convertMfenced(node);
                      }
                    });
                  });
                });

                observer.observe(document.body, {
                  childList: true,
                  subtree: true
                });
              };

              // Make utilities globally available
              window.convertMfenced = convertMfenced;
              window.mathMLUtils = { convertMfenced, init: initMathML };
              
              // Initialize
              initMathML();
            `,
          }}
        />
        <LanguageProvider>
          <AuthProvider>
            <ConditionalLayout>
              {children}
            </ConditionalLayout>
            <Toaster position="top-right" richColors />
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
