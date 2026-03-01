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
      >
        {/* Scattered hearts */}
        <svg
          className="absolute inset-0 w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 900"
          preserveAspectRatio="xMidYMid slice"
          fill="none"
          stroke="var(--color-text)"
        >
          {/* Heart: M0-4.5 centered at origin, ~9px tall before scale */}
          <g transform="translate(95,70) rotate(12) scale(4)" opacity="0.12" strokeWidth="0.4"><path d="M0-4.5C-1-7-4-7-4-4C-4-1 0 2 0 4.5C0 2 4-1 4-4C4-7 1-7 0-4.5Z"/></g>
          <g transform="translate(310,140) rotate(-8) scale(2.5)" opacity="0.08" strokeWidth="0.5"><path d="M0-4.5C-1-7-4-7-4-4C-4-1 0 2 0 4.5C0 2 4-1 4-4C4-7 1-7 0-4.5Z"/></g>
          <g transform="translate(520,90) rotate(22) scale(5)" opacity="0.1" strokeWidth="0.35"><path d="M0-4.5C-1-7-4-7-4-4C-4-1 0 2 0 4.5C0 2 4-1 4-4C4-7 1-7 0-4.5Z"/></g>
          <g transform="translate(780,60) rotate(-15) scale(2)" opacity="0.09" strokeWidth="0.5"><path d="M0-4.5C-1-7-4-7-4-4C-4-1 0 2 0 4.5C0 2 4-1 4-4C4-7 1-7 0-4.5Z"/></g>
          <g transform="translate(1020,110) rotate(5) scale(3.5)" opacity="0.1" strokeWidth="0.4"><path d="M0-4.5C-1-7-4-7-4-4C-4-1 0 2 0 4.5C0 2 4-1 4-4C4-7 1-7 0-4.5Z"/></g>
          <g transform="translate(160,250) rotate(-20) scale(2.2)" opacity="0.08" strokeWidth="0.5"><path d="M0-4.5C-1-7-4-7-4-4C-4-1 0 2 0 4.5C0 2 4-1 4-4C4-7 1-7 0-4.5Z"/></g>
          <g transform="translate(440,300) rotate(18) scale(5.5)" opacity="0.12" strokeWidth="0.3"><path d="M0-4.5C-1-7-4-7-4-4C-4-1 0 2 0 4.5C0 2 4-1 4-4C4-7 1-7 0-4.5Z"/></g>
          <g transform="translate(680,220) rotate(-6) scale(3)" opacity="0.09" strokeWidth="0.45"><path d="M0-4.5C-1-7-4-7-4-4C-4-1 0 2 0 4.5C0 2 4-1 4-4C4-7 1-7 0-4.5Z"/></g>
          <g transform="translate(920,270) rotate(30) scale(1.8)" opacity="0.08" strokeWidth="0.55"><path d="M0-4.5C-1-7-4-7-4-4C-4-1 0 2 0 4.5C0 2 4-1 4-4C4-7 1-7 0-4.5Z"/></g>
          <g transform="translate(1100,200) rotate(-12) scale(3.8)" opacity="0.1" strokeWidth="0.4"><path d="M0-4.5C-1-7-4-7-4-4C-4-1 0 2 0 4.5C0 2 4-1 4-4C4-7 1-7 0-4.5Z"/></g>
          <g transform="translate(70,430) rotate(25) scale(4.5)" opacity="0.11" strokeWidth="0.35"><path d="M0-4.5C-1-7-4-7-4-4C-4-1 0 2 0 4.5C0 2 4-1 4-4C4-7 1-7 0-4.5Z"/></g>
          <g transform="translate(280,480) rotate(-18) scale(2.3)" opacity="0.08" strokeWidth="0.5"><path d="M0-4.5C-1-7-4-7-4-4C-4-1 0 2 0 4.5C0 2 4-1 4-4C4-7 1-7 0-4.5Z"/></g>
          <g transform="translate(550,410) rotate(8) scale(3.5)" opacity="0.1" strokeWidth="0.4"><path d="M0-4.5C-1-7-4-7-4-4C-4-1 0 2 0 4.5C0 2 4-1 4-4C4-7 1-7 0-4.5Z"/></g>
          <g transform="translate(830,390) rotate(-25) scale(4.8)" opacity="0.09" strokeWidth="0.35"><path d="M0-4.5C-1-7-4-7-4-4C-4-1 0 2 0 4.5C0 2 4-1 4-4C4-7 1-7 0-4.5Z"/></g>
          <g transform="translate(1060,450) rotate(15) scale(2.6)" opacity="0.09" strokeWidth="0.45"><path d="M0-4.5C-1-7-4-7-4-4C-4-1 0 2 0 4.5C0 2 4-1 4-4C4-7 1-7 0-4.5Z"/></g>
          <g transform="translate(130,620) rotate(-10) scale(3.2)" opacity="0.1" strokeWidth="0.4"><path d="M0-4.5C-1-7-4-7-4-4C-4-1 0 2 0 4.5C0 2 4-1 4-4C4-7 1-7 0-4.5Z"/></g>
          <g transform="translate(380,660) rotate(20) scale(4.2)" opacity="0.11" strokeWidth="0.35"><path d="M0-4.5C-1-7-4-7-4-4C-4-1 0 2 0 4.5C0 2 4-1 4-4C4-7 1-7 0-4.5Z"/></g>
          <g transform="translate(640,580) rotate(-22) scale(2)" opacity="0.08" strokeWidth="0.5"><path d="M0-4.5C-1-7-4-7-4-4C-4-1 0 2 0 4.5C0 2 4-1 4-4C4-7 1-7 0-4.5Z"/></g>
          <g transform="translate(870,640) rotate(10) scale(5.2)" opacity="0.12" strokeWidth="0.3"><path d="M0-4.5C-1-7-4-7-4-4C-4-1 0 2 0 4.5C0 2 4-1 4-4C4-7 1-7 0-4.5Z"/></g>
          <g transform="translate(1090,600) rotate(-5) scale(3)" opacity="0.09" strokeWidth="0.45"><path d="M0-4.5C-1-7-4-7-4-4C-4-1 0 2 0 4.5C0 2 4-1 4-4C4-7 1-7 0-4.5Z"/></g>
          <g transform="translate(200,790) rotate(28) scale(3.8)" opacity="0.1" strokeWidth="0.4"><path d="M0-4.5C-1-7-4-7-4-4C-4-1 0 2 0 4.5C0 2 4-1 4-4C4-7 1-7 0-4.5Z"/></g>
          <g transform="translate(500,830) rotate(-14) scale(2.4)" opacity="0.08" strokeWidth="0.5"><path d="M0-4.5C-1-7-4-7-4-4C-4-1 0 2 0 4.5C0 2 4-1 4-4C4-7 1-7 0-4.5Z"/></g>
          <g transform="translate(750,770) rotate(7) scale(3.5)" opacity="0.1" strokeWidth="0.4"><path d="M0-4.5C-1-7-4-7-4-4C-4-1 0 2 0 4.5C0 2 4-1 4-4C4-7 1-7 0-4.5Z"/></g>
          <g transform="translate(990,820) rotate(-20) scale(4.5)" opacity="0.09" strokeWidth="0.35"><path d="M0-4.5C-1-7-4-7-4-4C-4-1 0 2 0 4.5C0 2 4-1 4-4C4-7 1-7 0-4.5Z"/></g>
        </svg>
      </motion.div>

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
