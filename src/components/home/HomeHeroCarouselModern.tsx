"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { vi } from "@/locales/vi";
import { en } from "@/locales/en";
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
import { BookOpen, Users, Award, ArrowRight, Play, GraduationCap, Sparkles } from "lucide-react";

interface HeroSlide {
  image: string;
  titleVi: string;
  titleEn: string;
  subtitleVi: string;
  subtitleEn: string;
  descriptionVi: string;
  descriptionEn: string;
  primaryButton: {
    textVi: string;
    textEn: string;
    link: string;
    icon: React.ElementType;
  };
  secondaryButton?: {
    textVi: string;
    textEn: string;
    link: string;
    icon: React.ElementType;
  };
  bgColor: string;
}

const heroSlides: HeroSlide[] = [
  {
    image: "/images/hero/home-1/hero-img.png",
    titleVi: "Khởi đầu trí tuệ trong kỷ nguyên số",
    titleEn: "Start Your Intelligence in Digital Age",
    subtitleVi: "Nền tảng học tập trực tuyến hàng đầu Việt Nam",
    subtitleEn: "Vietnam's Leading Online Learning Platform",
    descriptionVi: "Khám phá hàng ngàn khóa học chất lượng cao, sách điện tử và video bài giảng từ các giảng viên uy tín",
    descriptionEn: "Discover thousands of high-quality courses, e-books and video lectures from reputable instructors",
    primaryButton: {
      textVi: "Khám phá khóa học",
      textEn: "Explore Courses",
      link: "/courses",
      icon: Play
    },
    secondaryButton: {
      textVi: "Thư viện sách",
      textEn: "Book Library",
      link: "/books",
      icon: BookOpen
    },
    bgColor: "bg-blue-600",
  },
  {
    image: "/images/hero/home-5/hero-img.png",
    titleVi: "Học tập hiệu quả mọi lúc mọi nơi",
    titleEn: "Learn Effectively Anytime, Anywhere",
    subtitleVi: "Phương pháp giảng dạy hiện đại và chất lượng",
    subtitleEn: "Modern and Quality Teaching Methods",
    descriptionVi: "Truy cập trên mọi thiết bị, học theo lịch trình riêng với nội dung được thiết kế bởi chuyên gia",
    descriptionEn: "Access on any device, learn on your own schedule with expert-designed content",
    primaryButton: {
      textVi: "Bắt đầu học ngay",
      textEn: "Start Learning Now",
      link: "/courses",
      icon: GraduationCap
    },
    secondaryButton: {
      textVi: "Tìm hiểu thêm",
      textEn: "Learn More",
      link: "/about",
      icon: ArrowRight
    },
    bgColor: "bg-purple-600",
  },
  {
    image: "/images/hero/home-4/hero-img-1.png",
    titleVi: "Giảng viên chuyên nghiệp hàng đầu",
    titleEn: "Top Professional Instructors",
    subtitleVi: "Học hỏi từ những chuyên gia giàu kinh nghiệm",
    subtitleEn: "Learn from Experienced Experts",
    descriptionVi: "Đội ngũ giảng viên với nhiều năm kinh nghiệm giảng dạy và bằng cấp cao",
    descriptionEn: "Instructors with years of teaching experience and advanced degrees",
    primaryButton: {
      textVi: "Gặp gỡ giảng viên",
      textEn: "Meet Instructors",
      link: "/instructors",
      icon: Users
    },
    secondaryButton: {
      textVi: "Xem khóa học",
      textEn: "View Courses",
      link: "/courses",
      icon: Play
    },
    bgColor: "bg-emerald-600",
  },
  {
    image: "/images/hero/home-4/hero-img-2.png",
    titleVi: "Chứng chỉ được công nhận",
    titleEn: "Recognized Certificates",
    subtitleVi: "Nâng cao giá trị bản thân với chứng chỉ uy tín",
    subtitleEn: "Enhance Your Value with Prestigious Certificates",
    descriptionVi: "Nhận chứng chỉ sau khi hoàn thành khóa học, được công nhận rộng rãi",
    descriptionEn: "Receive certificates upon course completion, widely recognized",
    primaryButton: {
      textVi: "Xem chứng chỉ",
      textEn: "View Certificates",
      link: "/certificates",
      icon: Award
    },
    secondaryButton: {
      textVi: "Bắt đầu học",
      textEn: "Start Learning",
      link: "/courses",
      icon: Play
    },
    bgColor: "bg-orange-600",
  },
];

export default function HomeHeroCarouselModern() {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);
  const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 });
  const autoplayRef = React.useRef<NodeJS.Timeout | null>(null);
  const { language } = useLanguage();
  const [isClient, setIsClient] = React.useState(false);
  const [particles, setParticles] = React.useState<Array<{
    left: number;
    top: number;
    width: number;
    height: number;
    background: string;
  }>>([]);

  const t = language === 'vi' ? vi : en;

  // Mouse parallax effect
  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  React.useEffect(() => {
    if (!api) return;
    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());
    api.on("select", () => setCurrent(api.selectedScrollSnap()));
  }, [api]);

  // Autoplay
  React.useEffect(() => {
    if (!api) return;

    const startAutoplay = () => {
      if (autoplayRef.current) clearInterval(autoplayRef.current);
      autoplayRef.current = setInterval(() => api.scrollNext(), 7000);
    };

    startAutoplay();
    api.on("select", startAutoplay);

    return () => {
      if (autoplayRef.current) clearInterval(autoplayRef.current);
    };
  }, [api]);
  React.useEffect(() => {
    setIsClient(true);
  }, []);

  // Generate particles only on client side to avoid hydration mismatch
  React.useEffect(() => {
    if (isClient) {
      const generatedParticles = Array.from({ length: 30 }).map((_, i) => ({
        left: Math.random() * 100,
        top: Math.random() * 100,
        width: Math.random() * 6 + 2,
        height: Math.random() * 6 + 2,
        background: i % 3 === 0 
          ? 'radial-gradient(circle, rgba(59, 130, 246, 0.8), transparent)'
          : i % 2 === 0
          ? 'radial-gradient(circle, rgba(168, 85, 247, 0.8), transparent)'
          : 'radial-gradient(circle, rgba(236, 72, 153, 0.8), transparent)',
      }));
      setParticles(generatedParticles);
    }
  }, [isClient]);
  return (
    <section className="relative overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.3) 1px, transparent 0)`,
            backgroundSize: '50px 50px',
          }}
          animate={{ backgroundPosition: ['0px 0px', '50px 50px'] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* Floating Particles */}
      {isClient && particles.length > 0 && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {particles.map((particle, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                left: `${particle.left}%`,
                top: `${particle.top}%`,
                width: `${particle.width}px`,
                height: `${particle.height}px`,
                background: particle.background,
              }}
              animate={{
                y: [0, -100, 0],
                x: [0, particle.left * 0.5 - 25, 0],
                opacity: [0.2, 0.8, 0.2],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: (particle.left % 10) + 10,
                repeat: Infinity,
                delay: (particle.top % 5),
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
      )}

      {/* Animated Light Beams */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute top-0 w-px h-full"
            style={{
              left: `${20 + i * 15}%`,
              background: 'linear-gradient(to bottom, rgba(255,255,255,0.1), transparent)',
              transformOrigin: 'top',
            }}
            animate={{
              scaleY: [0.5, 1, 0.5],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 5 + i,
              repeat: Infinity,
              delay: i * 0.5,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
      
      <Carousel setApi={setApi} className="w-full relative z-10">
        <CarouselContent>
          {heroSlides.map((slide, index) => (
            <CarouselItem key={index}>
              <div className={`relative overflow-hidden ${slide.bgColor} min-h-[600px] md:min-h-[700px]`}>
                {/* Subtle Light Overlay */}
                <motion.div
                  className="absolute inset-0 opacity-10"
                  style={{
                    background: 'radial-gradient(circle at 30% 50%, rgba(255,255,255,0.3) 0%, transparent 60%)'
                  }}
                  animate={{
                    scale: [1, 1.2, 1],
                    x: [0, 50, 0],
                  }}
                  transition={{
                    duration: 15,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />

                {/* Hero Image with Parallax */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 h-full w-1/2 hidden lg:block">
                  <motion.div 
                    className="relative h-full w-full"
                    initial={{ opacity: 0, x: 100, scale: 0.9 }}
                    animate={{ 
                      opacity: 1, 
                      x: 0,
                      scale: 1,
                    }}
                    transition={{ 
                      duration: 1,
                      ease: "easeOut"
                    }}
                    style={{
                      x: mousePosition.x * 0.5,
                      y: mousePosition.y * 0.5,
                    }}
                  >
                    <motion.div
                      animate={{
                        y: [0, -20, 0],
                      }}
                      transition={{
                        duration: 6,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <Image 
                        src={slide.image}
                        alt="Hero"
                        fill
                        className="object-contain object-right-bottom drop-shadow-2xl"
                        priority={index === 0}
                        quality={90}
                      />
                    </motion.div>
                  </motion.div>
                </div>
                
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
                  <div className="text-center lg:text-left lg:max-w-[55%]">
                    {/* Logo with Glow Effect */}
                    <motion.div 
                      className="mb-8 inline-block"
                      initial={{ opacity: 0, scale: 0, rotate: -180 }}
                      animate={{ opacity: 1, scale: 1, rotate: 0 }}
                      transition={{ 
                        duration: 0.8,
                        type: "spring",
                        bounce: 0.5
                      }}
                    >
                      <motion.div 
                        className="relative w-32 h-32 md:w-40 md:h-40"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <motion.div
                          className="absolute inset-0 bg-white/20 rounded-3xl blur-xl"
                          animate={{
                            scale: [1, 1.1, 1],
                            opacity: [0.2, 0.4, 0.2],
                          }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        />
                        <div className="relative bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-4 w-full h-full">
                          <Image 
                            src="/images/logo/logo.png"
                            alt="Logo"
                            width={160}
                            height={160}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      </motion.div>
                    </motion.div>
                    
                    {/* Title with Gradient Text */}
                    <motion.h1 
                      className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
                      initial={{ opacity: 0, y: 50, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ 
                        duration: 0.8,
                        delay: 0.2,
                        type: "spring",
                        bounce: 0.4
                      }}
                    >
                      <span className="text-white">
                        {language === 'vi' ? slide.titleVi : slide.titleEn}
                      </span>
                    </motion.h1>
                    
                    {/* Subtitle */}
                    <motion.p 
                      className="text-xl md:text-2xl lg:text-3xl text-white/90 mb-6 font-medium"
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ 
                        duration: 0.8,
                        delay: 0.4,
                        type: "spring"
                      }}
                    >
                      {language === 'vi' ? slide.subtitleVi : slide.subtitleEn}
                    </motion.p>
                    
                    {/* Description */}
                    <motion.p 
                      className="text-base md:text-lg lg:text-xl text-white/80 mb-10 leading-relaxed max-w-2xl"
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ 
                        duration: 0.8,
                        delay: 0.6,
                        type: "spring"
                      }}
                    >
                      {language === 'vi' ? slide.descriptionVi : slide.descriptionEn}
                    </motion.p>
                    
                    {/* Buttons with Enhanced Effects */}
                    <motion.div 
                      className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ 
                        duration: 0.8,
                        delay: 0.8,
                        type: "spring"
                      }}
                    >
                      <motion.div 
                        whileHover={{ scale: 1.08, y: -8 }} 
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        <Button asChild size="lg" className="bg-white text-slate-900 hover:bg-slate-100 font-bold px-8 py-6 text-lg rounded-xl shadow-xl group">
                          <Link href={slide.primaryButton.link} className="flex items-center">
                            <slide.primaryButton.icon className="mr-2 h-5 w-5" />
                            {language === 'vi' ? slide.primaryButton.textVi : slide.primaryButton.textEn}
                            <motion.div
                              animate={{ x: [0, 5, 0] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                            >
                              <ArrowRight className="ml-2 h-5 w-5" />
                            </motion.div>
                          </Link>
                        </Button>
                      </motion.div>
                      
                      {slide.secondaryButton && (
                        <motion.div 
                          whileHover={{ scale: 1.08, y: -8 }} 
                          whileTap={{ scale: 0.95 }}
                          transition={{ type: "spring", stiffness: 400 }}
                        >
                          <Button asChild variant="outline" size="lg" className="border-2 border-white/30 text-white hover:bg-white/20 font-semibold px-8 py-6 text-lg rounded-2xl backdrop-blur-sm transition-all duration-300">
                            <Link href={slide.secondaryButton.link} className="flex items-center">
                              <slide.secondaryButton.icon className="mr-2 h-5 w-5" />
                              {language === 'vi' ? slide.secondaryButton.textVi : slide.secondaryButton.textEn}
                            </Link>
                          </Button>
                        </motion.div>
                      )}
                    </motion.div>
                  </div>
                </div>
                
                {/* Animated Wave */}
                <div className="absolute bottom-0 left-0 right-0">
                  <motion.svg 
                    className="w-full h-16 md:h-20 fill-white" 
                    viewBox="0 0 1200 120" 
                    preserveAspectRatio="none"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 1, delay: 0.5 }}
                  >
                    <motion.path 
                      d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
                      animate={{
                        d: [
                          "M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z",
                          "M0,0V56.29c47.79,12.2,103.59,22.17,158,18,70.36-5.37,136.33-23.31,206.8-27.5C438.64,42.43,512.34,63.67,583,82.05c69.27,18,138.3,14.88,209.4,3.08,36.15-6,69.85-27.84,104.45-39.34C989.49,15,1113-24.29,1200,42.47V0Z",
                          "M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
                        ]
                      }}
                      transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                  </motion.svg>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        
        {/* Navigation */}
        <div className="absolute z-10 left-4 top-1/2 -translate-y-1/2 hidden md:block">
          <CarouselPrevious className="bg-white/20 hover:bg-white/40 text-white border-white/10 backdrop-blur-sm" />
        </div>
        <div className="absolute z-10 right-4 top-1/2 -translate-y-1/2 hidden md:block">
          <CarouselNext className="bg-white/20 hover:bg-white/40 text-white border-white/10 backdrop-blur-sm" />
        </div>
      </Carousel>
      
      {/* Pagination */}
      <div className="absolute bottom-24 md:bottom-28 left-0 right-0 z-10">
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: count }).map((_, index) => (
            <button
              key={index}
              onClick={() => api?.scrollTo(index)}
              className={cn("transition-all duration-300 rounded-full", {
                "h-2 w-2 bg-white/50 hover:bg-white/70": current !== index,
                "h-2 w-8 bg-white": current === index,
              })}
              aria-label={`Slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
      
    </section>
  );
}
