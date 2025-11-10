"use client";
import * as React from "react";
import Image from "next/image";
import Link from "next/link";
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

interface HeroSlide {
  image: string;
  title: string;
  description: string;
  buttonText?: string;
  buttonLink?: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
}

const heroSlides: HeroSlide[] = [
  {
    image: "/images/about/about-1/about-img.png",
    title: "Expand Your Knowledge With Our Learning Platform",
    description: "Access thousands of courses, books, and resources to enhance your skills and advance your career.",
    buttonText: "Explore Courses",
    buttonLink: "/courses",
    secondaryButtonText: "Learn More",
    secondaryButtonLink: "/about"
  },
  {
    image: "/images/about/about-2/about-img-1.png",
    title: "Learn From Industry Experts",
    description: "Our instructors bring real-world experience to help you master the skills that matter most.",
    buttonText: "Meet Our Instructors",
    buttonLink: "/instructors",
    secondaryButtonText: "Browse Categories",
    secondaryButtonLink: "/categories"
  },
  {
    image: "/images/about/about-3/about-img.png",
    title: "Interactive Learning Experience",
    description: "Engage with interactive content, quizzes, and projects designed to enhance your understanding.",
    buttonText: "Start Learning",
    buttonLink: "/signup",
    secondaryButtonText: "View Demo",
    secondaryButtonLink: "/demo"
  },
  {
    image: "/images/about/about-4/about-img.png",
    title: "Achieve Your Learning Goals",
    description: "Set your learning path and track your progress with our personalized learning tools.",
    buttonText: "Get Started",
    buttonLink: "/register",
    secondaryButtonText: "View Plans",
    secondaryButtonLink: "/pricing"
  },
];

export default function HeroCarousel() {
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

  return (
    <section className="w-full">
      <Carousel setApi={setApi} className="w-full">
        <CarouselContent>
          {heroSlides.map((slide, index) => (
            <CarouselItem key={index} className="w-full">
              <div className="relative h-[500px] md:h-[600px] lg:h-[700px] w-full overflow-hidden">
                {/* Background image */}
                <div className="absolute inset-0">
                  <Image 
                    src={slide.image}
                    alt={`Hero slide ${index + 1}`}
                    fill
                    className="object-cover"
                    priority={index === 0}
                  />
                  <div className="absolute inset-0 bg-black/40" />
                </div>
                
                {/* Content */}
                <div className="relative h-full flex items-center">
                  <div className="container mx-auto px-4">
                    <div className="max-w-2xl text-white">
                      <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
                        {slide.title}
                      </h1>
                      <p className="text-base md:text-lg mb-8 opacity-90">
                        {slide.description}
                      </p>
                      <div className="flex flex-wrap gap-4">
                        {slide.buttonText && slide.buttonLink && (
                          <Button asChild size="lg">
                            <Link href={slide.buttonLink}>
                              {slide.buttonText}
                            </Link>
                          </Button>
                        )}
                        {slide.secondaryButtonText && slide.secondaryButtonLink && (
                          <Button asChild variant="outline" size="lg" className="bg-transparent text-white border-white hover:bg-white/20">
                            <Link href={slide.secondaryButtonLink}>
                              {slide.secondaryButtonText}
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-4 bg-white/30 hover:bg-white/50 backdrop-blur-sm" />
        <CarouselNext className="right-4 bg-white/30 hover:bg-white/50 backdrop-blur-sm" />
      </Carousel>
      
      {/* Pagination indicators */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center gap-3 -mt-12 relative z-10">
          {Array.from({ length: count }).map((_, index) => (
            <button
              key={index}
              onClick={() => api?.scrollTo(index)}
              className={cn("transition-all duration-300", {
                "h-3 w-3 rounded-full bg-white": current !== index,
                "h-3 w-8 rounded-full bg-primary": current === index,
              })}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

