"use client";
import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { BookOpen, Users, Award, ArrowRight, Play, User } from "lucide-react";

interface HeroSlide {
  image: string;
  bgPattern?: string;
  title: string;
  subtitle: string;
  description: string;
  primaryButton: {
    text: string;
    link: string;
    icon: React.ElementType;
  };
  secondaryButton?: {
    text: string;
    link: string;
    icon: React.ElementType;
  };
  tertiaryButton?: {
    text: string;
    link: string;
    icon: React.ElementType;
  };
  bgGradient: string;
  shapes: string[];
}

const heroSlides: HeroSlide[] = [
  {
    image: "/images/hero/home-1/hero-img.png",
    bgPattern: "/images/hero/home-1/hero-bg.png",
    title: "Khởi Trí Số",
    subtitle: "Nền tảng giáo dục trực tuyến hàng đầu Việt Nam",
    description: "Học tập hiệu quả với sách điện tử, video bài giảng chất lượng cao và cộng đồng học tập sôi động",
    primaryButton: {
      text: "Khám phá khóa học",
      link: "/courses",
      icon: Play
    },
    secondaryButton: {
      text: "Thư viện sách",
      link: "/books",
      icon: BookOpen
    },
    bgGradient: "from-blue-600 via-purple-600 to-indigo-600",
    shapes: [
      "/images/hero/home-1/shape-1.svg",
      "/images/hero/home-1/shape-2.svg",
      "/images/hero/home-1/shape-3.svg",
      "/images/hero/home-1/shape-4.svg"
    ]
  },
  {
    image: "/images/hero/home-5/hero-img.png",
    bgPattern: "/images/hero/home-2/hero-bg.jpg",
    title: "Học Tập Hiệu Quả",
    subtitle: "Phương pháp giảng dạy hiện đại và chất lượng",
    description: "Tiếp cận kiến thức một cách dễ dàng với phương pháp học tập tương tác và cá nhân hóa",
    primaryButton: {
      text: "Khám phá khóa học",
      link: "/courses",
      icon: Play
    },
    secondaryButton: {
      text: "Tìm hiểu thêm",
      link: "/about",
      icon: ArrowRight
    },
    bgGradient: "from-purple-600 via-pink-600 to-red-600",
    shapes: [
      "/images/hero/home-5/circle-pattern.svg",
      "/images/hero/home-5/circle-shape.svg",
      "/images/hero/home-5/arrow-shape.svg"
    ]
  },
  {
    image: "/images/hero/home-4/hero-img-1.png",
    bgPattern: "/images/section-bg-1.png",
    title: "Giảng Viên Chất Lượng",
    subtitle: "Đội ngũ giảng viên chuyên nghiệp và giàu kinh nghiệm",
    description: "Học hỏi từ những chuyên gia hàng đầu trong lĩnh vực với nhiều năm kinh nghiệm giảng dạy",
    primaryButton: {
      text: "Gặp gỡ giảng viên",
      link: "/instructors",
      icon: Users
    },
    secondaryButton: {
      text: "Xem khóa học",
      link: "/courses",
      icon: Play
    },
    bgGradient: "from-green-600 via-teal-600 to-blue-600",
    shapes: [
      "/images/hero/home-4/shape-1.svg",
      "/images/hero/home-4/shape-2.svg",
      "/images/hero/home-4/shape-3.svg"
    ]
  },
  {
    image: "/images/hero/home-4/hero-img-2.png",
    bgPattern: "/images/section-bg-2.png",
    title: "Chứng Chỉ Giá Trị",
    subtitle: "Hoàn thành khóa học và nhận chứng chỉ được công nhận",
    description: "Nâng cao giá trị bản thân với các chứng chỉ có giá trị được công nhận rộng rãi",
    primaryButton: {
      text: "Xem chứng chỉ",
      link: "/certificates",
      icon: Award
    },
    secondaryButton: {
      text: "Bắt đầu học",
      link: "/courses",
      icon: Play
    },
    bgGradient: "from-orange-600 via-amber-600 to-yellow-600",
    shapes: [
      "/images/hero/home-4/elements-move/shape-1.svg",
      "/images/hero/home-4/elements-move/shape-2.svg",
      "/images/hero/home-4/elements-move/shape-3.svg",
      "/images/hero/home-4/elements-move/shape-4.svg"
    ]
  },
];

export default function HomeHeroCarousel() {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);
  const autoplayRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  // Autoplay functionality
  React.useEffect(() => {
    if (!api) return;

    const startAutoplay = () => {
      if (autoplayRef.current) {
        clearInterval(autoplayRef.current);
      }

      autoplayRef.current = setInterval(() => {
        api.scrollNext();
      }, 7000);
    };

    startAutoplay();

    // Reset interval when slide changes
    api.on("select", startAutoplay);

    return () => {
      if (autoplayRef.current) {
        clearInterval(autoplayRef.current);
      }
    };
  }, [api]);

  // Fixed positions for particles to avoid hydration mismatch
  const particlePositions = React.useMemo(() => [
    { left: 10, top: 20, duration: 4, delay: 0, x: 5 },
    { left: 85, top: 15, duration: 5, delay: 0.5, x: -8 },
    { left: 25, top: 70, duration: 3.5, delay: 1, x: 10 },
    { left: 60, top: 40, duration: 4.5, delay: 1.5, x: -5 },
    { left: 45, top: 85, duration: 4, delay: 0.3, x: 7 },
    { left: 75, top: 55, duration: 3.8, delay: 0.8, x: -6 },
    { left: 15, top: 45, duration: 4.2, delay: 1.2, x: 8 },
    { left: 90, top: 75, duration: 3.6, delay: 0.6, x: -9 },
    { left: 35, top: 25, duration: 4.8, delay: 1.8, x: 6 },
    { left: 55, top: 90, duration: 3.3, delay: 0.2, x: -7 },
    { left: 70, top: 10, duration: 4.4, delay: 1.4, x: 9 },
    { left: 20, top: 60, duration: 3.9, delay: 0.9, x: -4 },
    { left: 80, top: 35, duration: 4.1, delay: 1.1, x: 5 },
    { left: 40, top: 80, duration: 3.7, delay: 0.7, x: -8 },
    { left: 65, top: 50, duration: 4.6, delay: 1.6, x: 7 },
    { left: 30, top: 30, duration: 3.4, delay: 0.4, x: -6 },
    { left: 95, top: 65, duration: 4.3, delay: 1.3, x: 8 },
    { left: 50, top: 20, duration: 3.8, delay: 0.1, x: -5 },
    { left: 12, top: 75, duration: 4.7, delay: 1.7, x: 6 },
    { left: 88, top: 45, duration: 3.5, delay: 0.5, x: -9 },
  ], []);

  return (
    <section className="relative overflow-hidden">
      {/* Animated Grid Background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5" />
        <motion.div 
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
          animate={{
            backgroundPosition: ['0px 0px', '50px 50px'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>
      
      {/* Floating Background Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {particlePositions.map((particle, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              width: i % 3 === 0 ? '12px' : i % 2 === 0 ? '8px' : '6px',
              height: i % 3 === 0 ? '12px' : i % 2 === 0 ? '8px' : '6px',
              background: i % 4 === 0 
                ? 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.3) 50%, transparent 100%)'
                : i % 3 === 0
                ? 'radial-gradient(circle, rgba(147,197,253,0.8) 0%, rgba(147,197,253,0.3) 50%, transparent 100%)'
                : i % 2 === 0
                ? 'radial-gradient(circle, rgba(196,181,253,0.8) 0%, rgba(196,181,253,0.3) 50%, transparent 100%)'
                : 'radial-gradient(circle, rgba(253,224,71,0.8) 0%, rgba(253,224,71,0.3) 50%, transparent 100%)',
              boxShadow: '0 0 10px rgba(255,255,255,0.5), 0 0 20px rgba(255,255,255,0.3)',
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, particle.x, 0],
              opacity: [0.2, 0.5, 0.2],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              delay: particle.delay,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
      
      {/* Animated Light Rays */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute top-0 w-1 h-full origin-top"
            style={{
              left: `${20 + i * 20}%`,
              background: 'linear-gradient(to bottom, rgba(255,255,255,0.1) 0%, transparent 50%)',
              transform: 'skewX(-15deg)',
            }}
            animate={{
              opacity: [0.05, 0.15, 0.05],
              scaleY: [0.8, 1, 0.8],
            }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              delay: i * 0.5,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
      
      {/* Sparkle Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              left: `${(i * 7 + 5) % 100}%`,
              top: `${(i * 11 + 10) % 100}%`,
            }}
            animate={{
              scale: [0, 1, 0],
              rotate: [0, 180, 360],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeInOut",
            }}
          >
            <div className="relative w-3 h-3">
              <div className="absolute inset-0 bg-white/60 blur-sm rounded-full" />
              <div className="absolute top-1/2 left-0 right-0 h-px bg-white/80" />
              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/80" />
            </div>
          </motion.div>
        ))}
      </div>
      
      <Carousel setApi={setApi} className="w-full relative z-10">
        <CarouselContent>
          {heroSlides.map((slide, index) => (
            <CarouselItem key={index} className="w-full">
              <div className={`relative overflow-hidden bg-gradient-to-r ${slide.bgGradient}`}>
                {/* Background Pattern - Reduced opacity */}
                <div className="absolute inset-0 bg-black/5"></div>
                
                {/* Background Pattern Image */}
                {slide.bgPattern && (
                  <div className="absolute inset-0">
                    <Image 
                      src={slide.bgPattern}
                      alt="Background pattern"
                      fill
                      className="object-cover opacity-5"
                    />
                  </div>
                )}
                
                {/* Hero Image */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 h-full w-1/2 hidden md:block">
                  <div className="relative h-full w-full">
                    <Image 
                      src={slide.image}
                      alt={`Hero image ${index + 1}`}
                      fill
                      className="object-contain object-right-bottom"
                      priority={index === 0}
                      quality={100}
                      unoptimized={false}
                    />
                  </div>
                </div>
                
                {/* Decorative Shapes */}
                {slide.shapes.map((shape, shapeIndex) => (
                  <motion.div
                    key={shapeIndex}
                    className={`absolute ${
                      shapeIndex === 0 ? 'top-20 left-10 w-20 h-20' :
                      shapeIndex === 1 ? 'top-40 right-20 w-32 h-32' :
                      shapeIndex === 2 ? 'bottom-40 left-1/4 w-24 h-24' :
                      'bottom-20 right-1/3 w-16 h-16'
                    } opacity-20`}
                    animate={{
                      y: [0, -20, 0],
                      x: [0, 10, 0],
                      rotate: [0, 10, 0],
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: (shapeIndex + 2) * 3,
                      repeat: Infinity,
                      delay: shapeIndex * 0.5,
                      ease: "easeInOut"
                    }}
                  >
                    <Image 
                      src={shape}
                      alt={`Decorative shape ${shapeIndex + 1}`}
                      width={shapeIndex % 2 === 0 ? 100 : 150}
                      height={shapeIndex % 2 === 0 ? 100 : 150}
                      className="w-full h-full"
                    />
                  </motion.div>
                ))}
                
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
                  <div className="text-center md:text-left md:max-w-[50%]">
                    {/* Logo */}
                    <motion.div 
                      className="mb-8"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                    >
                      <motion.div 
                        className="inline-flex items-center justify-center w-36 h-36 md:w-40 md:h-40 bg-white/95 backdrop-blur-md rounded-3xl mb-6 shadow-2xl p-4"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ duration: 0.6 }}
                      >
                        <Image 
                          src="/images/logo/logo.png"
                          alt="Khởi Trí Số Logo"
                          width={128}
                          height={128}
                          className="w-full h-full object-contain"
                          quality={100}
                        />
                      </motion.div>
                    </motion.div>
                    
                    {/* Main Title */}
                    <motion.h1 
                      className="text-6xl md:text-7xl font-bold text-white mb-6 tracking-tight"
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.3 }}
                    >
                      {slide.title}
                    </motion.h1>
                    
                    {/* Subtitle */}
                    <motion.p 
                      className="text-2xl md:text-3xl text-blue-100 mb-6 font-medium"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.4 }}
                    >
                      {slide.subtitle}
                    </motion.p>
                    
                    {/* Description */}
                    <motion.p 
                      className="text-lg md:text-xl text-blue-200 mb-12 leading-relaxed"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.5 }}
                    >
                      {slide.description}
                    </motion.p>
                    
                    {/* CTA Buttons */}
                    <motion.div 
                      className="flex flex-col sm:flex-row gap-6 justify-center md:justify-start items-center"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.6 }}
                    >
                      <motion.div
                        whileHover={{ scale: 1.05, y: -5 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-blue-50 font-bold px-10 py-6 text-lg rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300">
                          <Link href={slide.primaryButton.link} className="flex items-center">
                            <slide.primaryButton.icon className="mr-3 h-6 w-6" />
                            {slide.primaryButton.text}
                            <ArrowRight className="ml-3 h-5 w-5" />
                          </Link>
                        </Button>
                      </motion.div>
                      
                      {slide.secondaryButton && (
                        <motion.div
                          whileHover={{ scale: 1.05, y: -5 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button asChild variant="outline" size="lg" className="border-2 border-white/30 text-white hover:bg-white/10 font-semibold px-10 py-6 text-lg rounded-2xl backdrop-blur-sm transition-all duration-300">
                            <Link href={slide.secondaryButton.link} className="flex items-center">
                              <slide.secondaryButton.icon className="mr-3 h-6 w-6" />
                              {slide.secondaryButton.text}
                            </Link>
                          </Button>
                        </motion.div>
                      )}
                      
                      {slide.tertiaryButton && (
                        <motion.div
                          whileHover={{ scale: 1.05, y: -5 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button asChild size="lg" className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold px-10 py-6 text-lg rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300">
                            <Link href={slide.tertiaryButton.link} className="flex items-center">
                              <slide.tertiaryButton.icon className="mr-3 h-6 w-6" />
                              {slide.tertiaryButton.text}
                            </Link>
                          </Button>
                        </motion.div>
                      )}
                    </motion.div>
                  </div>
                </div>
                
                {/* Bottom Wave */}
                <div className="absolute bottom-0 left-0 right-0">
                  <svg className="w-full h-20 fill-white" viewBox="0 0 1200 120" preserveAspectRatio="none">
                    <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"></path>
                  </svg>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        
        {/* Navigation Controls */}
        <div className="absolute z-10 left-4 top-1/2 -translate-y-1/2">
          <CarouselPrevious className="bg-white/20 hover:bg-white/40 text-white border-white/10" />
        </div>
        <div className="absolute z-10 right-4 top-1/2 -translate-y-1/2">
          <CarouselNext className="bg-white/20 hover:bg-white/40 text-white border-white/10" />
        </div>
      </Carousel>
      
      {/* Pagination indicators */}
      <div className="absolute bottom-28 left-0 right-0 z-10">
        <div className="flex items-center justify-center gap-3">
          {Array.from({ length: count }).map((_, index) => (
            <button
              key={index}
              onClick={() => api?.scrollTo(index)}
              className={cn("transition-all duration-300", {
                "h-3 w-3 rounded-full bg-white/50 hover:bg-white/70": current !== index,
                "h-3 w-10 rounded-full bg-white": current === index,
              })}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
      
      {/* Stats Section */}
      <div className="absolute bottom-35 left-0 right-0 z-50 overflow-visible">
        <div className="w-full px-2 sm:px-4">
          <div className="max-w-7xl mx-auto -mb-32">
            <div className="grid grid-cols-4 gap-2 sm:gap-3 md:gap-4">
              <motion.div 
                className="text-center p-2 sm:p-3 md:p-6 bg-white/95 backdrop-blur-md rounded-xl md:rounded-2xl border-2 border-white shadow-2xl hover:shadow-3xl transition-all duration-300 group"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                whileHover={{ y: -12, scale: 1.08 }}
              >
                <motion.div 
                  className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4 shadow-lg"
                  whileHover={{ rotate: 360, scale: 1.2 }}
                  transition={{ duration: 0.6 }}
                >
                  <Users className="h-8 w-8 text-white" />
                </motion.div>
                <motion.div 
                  className="text-2xl sm:text-3xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-1 md:mb-2"
                  initial={{ scale: 1 }}
                  whileInView={{ scale: [1, 1.15, 1] }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                  viewport={{ once: true }}
                >
                  15K+
                </motion.div>
                <div className="text-gray-700 text-xs sm:text-sm md:text-base font-semibold">Học viên tin tưởng</div>
              </motion.div>
              
              <motion.div 
                className="text-center p-2 sm:p-3 md:p-6 bg-white/95 backdrop-blur-md rounded-xl md:rounded-2xl border-2 border-white shadow-2xl hover:shadow-3xl transition-all duration-300 group"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.9 }}
                whileHover={{ y: -12, scale: 1.08 }}
              >
                <motion.div 
                  className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4 shadow-lg"
                  whileHover={{ rotate: 360, scale: 1.2 }}
                  transition={{ duration: 0.6 }}
                >
                  <BookOpen className="h-8 w-8 text-white" />
                </motion.div>
                <motion.div 
                  className="text-2xl sm:text-3xl md:text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-1 md:mb-2"
                  initial={{ scale: 1 }}
                  whileInView={{ scale: [1, 1.15, 1] }}
                  transition={{ duration: 0.5, delay: 0.9 }}
                  viewport={{ once: true }}
                >
                  500+
                </motion.div>
                <div className="text-gray-700 text-xs sm:text-sm md:text-base font-semibold">Khóa học chất lượng</div>
              </motion.div>
              
              <motion.div 
                className="text-center p-2 sm:p-3 md:p-6 bg-white/95 backdrop-blur-md rounded-xl md:rounded-2xl border-2 border-white shadow-2xl hover:shadow-3xl transition-all duration-300 group"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.0 }}
                whileHover={{ y: -12, scale: 1.08 }}
              >
                <motion.div 
                  className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4 shadow-lg"
                  whileHover={{ rotate: 360, scale: 1.2 }}
                  transition={{ duration: 0.6 }}
                >
                  <Award className="h-8 w-8 text-white" />
                </motion.div>
                <motion.div 
                  className="text-2xl sm:text-3xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-1 md:mb-2"
                  initial={{ scale: 1 }}
                  whileInView={{ scale: [1, 1.15, 1] }}
                  transition={{ duration: 0.5, delay: 1.0 }}
                  viewport={{ once: true }}
                >
                  50+
                </motion.div>
                <div className="text-gray-700 text-xs sm:text-sm md:text-base font-semibold">Giảng viên chuyên nghiệp</div>
              </motion.div>
              
              <motion.div 
                className="text-center p-2 sm:p-3 md:p-6 bg-white/95 backdrop-blur-md rounded-xl md:rounded-2xl border-2 border-white shadow-2xl hover:shadow-3xl transition-all duration-300 group"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.1 }}
                whileHover={{ y: -12, scale: 1.08 }}
              >
                <motion.div 
                  className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4 shadow-lg"
                  whileHover={{ rotate: 360, scale: 1.2 }}
                  transition={{ duration: 0.6 }}
                >
                  <Play className="h-8 w-8 text-white" />
                </motion.div>
                <motion.div 
                  className="text-2xl sm:text-3xl md:text-5xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-1 md:mb-2"
                  initial={{ scale: 1 }}
                  whileInView={{ scale: [1, 1.15, 1] }}
                  transition={{ duration: 0.5, delay: 1.1 }}
                  viewport={{ once: true }}
                >
                  98%
                </motion.div>
                <div className="text-gray-700 text-xs sm:text-sm md:text-base font-semibold">Tỷ lệ hài lòng</div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}