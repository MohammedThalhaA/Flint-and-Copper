"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Star, Loader2, CheckCircle2 } from "lucide-react";

export function ReviewModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [author, setAuthor] = useState("");
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!author || !text || rating === 0) {
      setError("Please fill out all fields and select a rating.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author, text, rating }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to submit review');

      setIsSuccess(true);
      setTimeout(() => {
        setIsOpen(false);
        setIsSuccess(false);
        setAuthor("");
        setText("");
        setRating(5);
      }, 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="mt-12 px-8 py-3 border border-dust/30 text-ivory uppercase tracking-[0.2em] text-xs hover:bg-ivory hover:text-charcoal transition-colors duration-300"
      >
        Leave a Review
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-charcoal/80 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="relative w-full max-w-lg bg-ivory text-charcoal p-8 md:p-12 shadow-2xl border border-dust/30"
            >
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-6 right-6 text-dust hover:text-charcoal transition-colors"
                aria-label="Close dialog"
              >
                <X size={24} strokeWidth={1} />
              </button>

              {isSuccess ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <CheckCircle2 className="text-copper mb-6" size={48} strokeWidth={1} />
                  <h3 className="font-serif text-3xl font-light mb-4">Thank You</h3>
                  <p className="text-charcoal/70 font-light leading-relaxed">
                    Your review has been submitted successfully and is pending approval from our team.
                  </p>
                </div>
              ) : (
                <>
                  <h3 className="font-serif text-3xl font-light mb-2">Share Your Experience</h3>
                  <p className="text-charcoal/70 font-light mb-8 text-sm">
                    We value your feedback. Let us know how your visit went.
                  </p>

                  {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-800 text-sm border border-red-100">
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <div>
                      <label className="block text-xs uppercase tracking-widest mb-3">Rating</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="text-copper transition-transform hover:scale-110 focus:outline-none"
                          >
                            <Star
                              size={28}
                              strokeWidth={1}
                              fill={(hoverRating || rating) >= star ? "currentColor" : "transparent"}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label htmlFor="author" className="block text-xs uppercase tracking-widest mb-2">Your Name</label>
                      <input
                        id="author"
                        type="text"
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        className="w-full bg-transparent border-b border-charcoal/20 px-0 py-3 text-charcoal focus:outline-none focus:border-copper transition-colors placeholder:text-charcoal/30"
                        placeholder="John Doe"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="text" className="block text-xs uppercase tracking-widest mb-2">Your Review</label>
                      <textarea
                        id="text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className="w-full bg-transparent border border-charcoal/20 p-4 text-charcoal focus:outline-none focus:border-copper transition-colors min-h-[120px] resize-y placeholder:text-charcoal/30"
                        placeholder="Tell us about your experience..."
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="mt-4 flex items-center justify-center gap-3 px-8 py-4 bg-copper text-ivory uppercase tracking-[0.2em] text-xs hover:bg-copper-deep transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <><Loader2 className="animate-spin" size={16} /> Submitting...</>
                      ) : (
                        "Submit Review"
                      )}
                    </button>
                  </form>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
