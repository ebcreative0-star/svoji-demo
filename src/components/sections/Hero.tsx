"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { differenceInDays, differenceInHours, differenceInMinutes, differenceInSeconds } from "date-fns";

interface HeroProps {
  partner1: string;
  partner2: string;
  date: Date;
  headline: string;
  subheadline: string;
}

export function Hero({ partner1, partner2, date, headline, subheadline }: HeroProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isMobile, setIsMobile] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const days = differenceInDays(date, now);
      const hours = differenceInHours(date, now) % 24;
      const minutes = differenceInMinutes(date, now) % 60;
      const seconds = differenceInSeconds(date, now) % 60;

      setTimeLeft({ days, hours, minutes, seconds });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [date]);

  const formattedDate = date.toLocaleDateString("cs-CZ", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const disableParallax = isMobile || prefersReducedMotion;

  return (
    <section ref={ref} className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Parallax background layer */}
      <motion.div
        className="absolute inset-0 bg-[var(--color-secondary)]"
        style={{ y: disableParallax ? 0 : backgroundY }}
      />

      <div className="container text-center relative z-10 py-20">
        {/* Names */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-heading font-semibold tracking-tight text-[var(--color-text)]">
            {partner1}
            <span className="mx-3 md:mx-5 text-[var(--color-accent)] font-normal">&</span>
            {partner2}
          </h1>
        </motion.div>

        {/* Headline */}
        <motion.p
          className="text-lg md:text-xl text-[var(--color-text-light)] mb-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
        >
          {headline}
        </motion.p>
        <motion.p
          className="text-base text-[var(--color-text-light)] mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
        >
          {subheadline}
        </motion.p>

        {/* Date */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
        >
          <p className="text-2xl md:text-3xl font-light text-[var(--color-primary)] font-heading">
            {formattedDate}
          </p>
        </motion.div>

        {/* Countdown - only days */}
        <motion.div
          className="flex justify-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" }}
        >
          <div className="text-center">
            <div className="text-5xl md:text-6xl font-light text-[var(--color-primary)] mb-2">
              {timeLeft.days}
            </div>
            <span className="text-sm md:text-base text-[var(--color-text-light)] uppercase tracking-widest">
              dní do svatby
            </span>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
        >
          <a href="#rsvp" className="inline-flex items-center justify-center gap-2 font-medium rounded-full text-base px-7 py-3.5 min-h-[52px] bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-light)] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]">
            Potvrdit účast
          </a>
        </motion.div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 opacity-40">
          <svg className="w-5 h-5 text-[var(--color-primary)]" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
          </svg>
        </div>
      </div>
    </section>
  );
}
