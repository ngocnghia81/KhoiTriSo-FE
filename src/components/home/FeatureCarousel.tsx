"use client";
import * as React from "react";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

interface CarouselImage {
  src: string;
  alt: string;
  title?: string;
  description?: string;
}

const carouselImages: CarouselImage[] = [
  {
    src: "/images/about/about-1/about-img.png",
    alt: "About Image 1",
    title: "Learning Experience",
    description: "Discover our innovative learning platform"
  },
  {
    src: "/images/about/about-2/about-img-1.png",
    alt: "About Image 2",
    title: "Expert Instructors",
    description: "Learn from industry professionals"
  },
  {
    src: "/images/about/about-2/about-img-2.png",
    alt: "About Image 3",
    title: "Interactive Courses",
    description: "Engage with our hands-on learning materials"
  },
  {
    src: "/images/about/about-3/about-img.png",
    alt: "About Image 4",
    title: "Community Support",
    description: "Join our supportive learning community"
  },
  {
    src: "/images/about/about-4/about-img.png",
    alt: "About Image 5",
    title: "Achievement Recognition",
    description: "Earn certificates and showcase your skills"
  },
];

interface FeatureCarouselProps {
  autoplay?: boolean;
  interval?: number;
  showCaptions?: boolean;
  showControls?: boolean;
  className?: string;
}

export default function FeatureCarousel({
  autoplay = true,
  interval = 5000,
  showCaptions = true,
  showControls = true,
  className,
}: FeatureCarouselProps) {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);
  const [autoplayActive, setAutoplayActive] = React.useState(autoplay);
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
    if (!api || !autoplayActive) return;

    const startAutoplay = () => {
      if (autoplayRef.current) {
        clearInterval(autoplayRef.current);
      }

      autoplayRef.current = setInterval(() => {
        api.scrollNext();
      }, interval);
    };

    startAutoplay();

    // Reset interval when slide changes
    api.on("select", startAutoplay);

    return () => {
      if (autoplayRef.current) {
        clearInterval(autoplayRef.current);
      }
    };
  }, [api, interval, autoplayActive]);

  // Pause autoplay on hover
  const handleMouseEnter = () => setAutoplayActive(false);
  const handleMouseLeave = () => setAutoplayActive(autoplay);

  return (
    <div 
      className={cn("w-full max-w-6xl mx-auto px-4", className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Carousel setApi={setApi} className="w-full">
        <CarouselContent>
          {carouselImages.map((image, index) => (
            <CarouselItem key={index} className="md:basis-1/2 lg:basis-2/3">
              <div className="p-1 h-full">
                <div className="overflow-hidden rounded-xl h-full relative group">
                  <Image 
                    src={image.src}
                    alt={image.alt}
                    width={800}
                    height={500}
                    className="w-full h-[400px] object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {showCaptions && (image.title || image.description) && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6 text-white transform transition-transform duration-300">
                      {image.title && (
                        <h3 className="text-xl font-bold mb-1">{image.title}</h3>
                      )}
                      {image.description && (
                        <p className="text-sm opacity-90">{image.description}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        {showControls && (
          <>
            <CarouselPrevious className="left-2 bg-white/30 hover:bg-white/50 backdrop-blur-sm" />
            <CarouselNext className="right-2 bg-white/30 hover:bg-white/50 backdrop-blur-sm" />
          </>
        )}
      </Carousel>
      <div className="mt-6 flex items-center justify-center gap-2">
        {Array.from({ length: count }).map((_, index) => (
          <button
            key={index}
            onClick={() => api?.scrollTo(index)}
            className={cn("h-2.5 w-2.5 rounded-full transition-all", {
              "bg-primary w-5": current === index,
              "bg-gray-300 hover:bg-gray-400": current !== index,
            })}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

