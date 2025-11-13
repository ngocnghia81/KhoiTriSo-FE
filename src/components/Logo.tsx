import Image from "next/image";

interface LogoProps {
    size?: "sm" | "md" | "lg";
    variant?: "light" | "dark";
    showText?: boolean;
    className?: string;
}

const sizeConfig = {
    sm: { width: 48, height: 48 },
    md: { width: 64, height: 64 },
    lg: { width: 88, height: 88 },
};

export default function Logo({
    size = "md",
    variant = "light",
    showText = false,
    className = "",
}: LogoProps) {
    const { width, height } = sizeConfig[size];

    return (
        <div className={`flex items-center ${className}`}>
            <div className="relative flex-shrink-0">
                <Image
                    src="/images/logo.svg"
                    alt="Khởi Trí Số Logo"
                    width={width}
                    height={height}
                    className="transition-all duration-300 hover:scale-110"
                    priority
                    quality={100}
                />
            </div>
        </div>
    );
}
