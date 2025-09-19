import Image from "next/image";
import Link from "next/link";

interface LogoProps {
    size?: "sm" | "md" | "lg";
    variant?: "light" | "dark";
    showText?: boolean;
    className?: string;
}

const sizeConfig = {
    sm: { width: 40, height: 40, textClass: "text-lg" },
    md: { width: 56, height: 56, textClass: "text-xl" },
    lg: { width: 72, height: 72, textClass: "text-2xl" },
};

export default function Logo({
    size = "md",
    variant = "light",
    showText = true,
    className = "",
}: LogoProps) {
    const { width, height, textClass } = sizeConfig[size];
    const textColor = variant === "light" ? "text-gray-900" : "text-white";

    return (
        <Link href="/" className={`flex items-center space-x-3 ${className}`}>
            <span className="sr-only">Khởi Trí Số</span>
            <div className="relative">
                <Image
                    src="/images/logo.svg"
                    alt="Khởi Trí Số Logo"
                    width={width}
                    height={height}
                    className="transition-all duration-300 hover:scale-110 drop-shadow-md"
                    priority
                />
            </div>
            {showText && (
                <span
                    className={`font-extrabold ${textClass} ${textColor} transition-all duration-300 hover:text-blue-600 tracking-wide`}
                >
                    Khởi Trí Số
                </span>
            )}
        </Link>
    );
}
