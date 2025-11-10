import Image from "next/image";

interface LogoProps {
    size?: "sm" | "md" | "lg";
    variant?: "light" | "dark";
    showText?: boolean;
    className?: string;
}

const sizeConfig = {
    sm: { width: 48, height: 48, textClass: "text-lg" },
    md: { width: 64, height: 64, textClass: "text-xl" },
    lg: { width: 88, height: 88, textClass: "text-2xl" },
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
        <div className={`flex items-center space-x-3 ${className}`}>
            <span className="sr-only">Khởi Trí Số</span>
            <div className="relative">
                <Image
                    src="/images/logo/logo.png"
                    alt="Khởi Trí Số Logo"
                    width={width}
                    height={height}
                    className="transition-all duration-300 hover:scale-110 drop-shadow-lg rounded-lg"
                    priority
                    quality={100}
                />
            </div>
            {showText && (
                <span
                    className={`font-extrabold ${textClass} ${textColor} transition-all duration-300 hover:text-blue-600 tracking-wide`}
                >
                    Khởi Trí Số
                </span>
            )}
        </div>
    );
}
