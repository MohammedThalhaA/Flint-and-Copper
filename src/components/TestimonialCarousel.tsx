"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import clsx from "clsx";

import { Star } from "lucide-react";

export type Review = {
  id: number;
  text: string;
  author: string;
  rating: number;
};

export function TestimonialCarousel({ reviews }: { reviews: Review[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      nextTestimonial();
    }, 8000); // Auto-advance every 8s
    return () => clearInterval(timer);
  }, [currentIndex]);

  const nextTestimonial = () => {
    setDirection(1);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % reviews.length);
  };

  const prevTestimonial = () => {
    setDirection(-1);
    setCurrentIndex((prevIndex) => (prevIndex - 1 + reviews.length) % reviews.length);
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 100 : -100,
      opacity: 0
    })
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto px-12 py-8">
      <div className="relative w-full overflow-hidden">
        {/* CSS Grid Stacking to naturally size the container to the largest review */}
        <div className="grid">
          {/* Invisible placeholders to set height */}
          {reviews.map((t) => (
            <div key={`placeholder-${t.id}`} className="col-start-1 row-start-1 invisible flex flex-col items-center">
              <div className="flex gap-1 mb-6 text-copper">
                {[...Array(t.rating)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
              </div>
              <h2 className="font-serif text-2xl md:text-4xl font-light italic leading-relaxed mb-10 text-center">
                "{t.text}"
              </h2>
              <div className="flex flex-col items-center">
                <div className="w-12 h-[1px] mb-6" />
                <span className="uppercase tracking-widest text-sm">
                  {t.author}
                </span>
              </div>
            </div>
          ))}

          {/* Actual animated content */}
          {reviews.length > 0 && (
            <div className="col-start-1 row-start-1 relative">
              <AnimatePresence initial={false} custom={direction} mode="wait">
                <motion.div
                  key={currentIndex}
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    x: { type: "spring", stiffness: 300, damping: 30 },
                    opacity: { duration: 0.4 }
                  }}
                  className="absolute inset-0 flex flex-col items-center"
                >
                  <div className="flex gap-1 mb-6 text-copper">
                    {[...Array(reviews[currentIndex]?.rating || 5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                  </div>
                  <h2 className="font-serif text-2xl md:text-4xl font-light italic leading-relaxed mb-10 text-center text-ivory">
                    "{reviews[currentIndex]?.text}"
                  </h2>
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-[1px] bg-copper mb-6" />
                    <span className="uppercase tracking-widest text-sm text-dust">
                      {reviews[currentIndex]?.author}
                    </span>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Buttons */}
      <button
        onClick={prevTestimonial}
        className="absolute left-0 top-1/2 -translate-y-1/2 text-dust hover:text-copper transition-colors p-2 z-10"
        aria-label="Previous testimonial"
      >
        <ChevronLeft size={32} strokeWidth={1} />
      </button>
      <button
        onClick={nextTestimonial}
        className="absolute right-0 top-1/2 -translate-y-1/2 text-dust hover:text-copper transition-colors p-2 z-10"
        aria-label="Next testimonial"
      >
        <ChevronRight size={32} strokeWidth={1} />
      </button>

      {/* Dots Indicator */}
      <div className="flex justify-center gap-3 mt-12">
        {reviews.map((_, idx) => (
          <button
            key={idx}
            onClick={() => {
              setDirection(idx > currentIndex ? 1 : -1);
              setCurrentIndex(idx);
            }}
            className={clsx(
              "w-2 h-2 rounded-full transition-all duration-300",
              idx === currentIndex ? "bg-copper w-6" : "bg-dust/30 hover:bg-dust"
            )}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
