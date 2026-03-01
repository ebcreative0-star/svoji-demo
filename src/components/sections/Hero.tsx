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
        >
          <defs>
            <path id="h" d="M0-3.5C-0.5-5.5-3-5.5-3-3C-3-0.5 0 1.5 0 3.5C0 1.5 3-0.5 3-3C3-5.5 0.5-5.5 0-3.5Z" />
          </defs>
          <g fill="none" stroke="var(--color-primary)">
            <use href="#h" x="95" y="70" strokeWidth="0.8" opacity="0.1" transform="rotate(12 95 70) scale(2.2)" />
            <use href="#h" x="310" y="45" strokeWidth="0.6" opacity="0.08" transform="rotate(-8 310 45) scale(1.4)" />
            <use href="#h" x="520" y="90" strokeWidth="0.9" opacity="0.12" transform="rotate(22 520 90) scale(2.8)" />
            <use href="#h" x="780" y="55" strokeWidth="0.5" opacity="0.08" transform="rotate(-15 780 55) scale(1.1)" />
            <use href="#h" x="1020" y="80" strokeWidth="0.7" opacity="0.1" transform="rotate(5 1020 80) scale(1.8)" />
            <use href="#h" x="160" y="220" strokeWidth="0.5" opacity="0.08" transform="rotate(-20 160 220) scale(1.3)" />
            <use href="#h" x="440" y="260" strokeWidth="0.8" opacity="0.15" transform="rotate(18 440 260) scale(3.2)" />
            <use href="#h" x="680" y="200" strokeWidth="0.6" opacity="0.09" transform="rotate(-6 680 200) scale(1.6)" />
            <use href="#h" x="900" y="240" strokeWidth="0.5" opacity="0.08" transform="rotate(30 900 240) scale(1.0)" />
            <use href="#h" x="1100" y="210" strokeWidth="0.7" opacity="0.1" transform="rotate(-12 1100 210) scale(2.0)" />
            <use href="#h" x="70" y="400" strokeWidth="0.9" opacity="0.12" transform="rotate(25 70 400) scale(2.5)" />
            <use href="#h" x="260" y="440" strokeWidth="0.5" opacity="0.08" transform="rotate(-18 260 440) scale(1.2)" />
            <use href="#h" x="550" y="410" strokeWidth="0.6" opacity="0.11" transform="rotate(8 550 410) scale(1.9)" />
            <use href="#h" x="820" y="390" strokeWidth="0.8" opacity="0.09" transform="rotate(-25 820 390) scale(2.6)" />
            <use href="#h" x="1050" y="430" strokeWidth="0.5" opacity="0.08" transform="rotate(15 1050 430) scale(1.4)" />
            <use href="#h" x="130" y="580" strokeWidth="0.6" opacity="0.09" transform="rotate(-10 130 580) scale(1.5)" />
            <use href="#h" x="380" y="620" strokeWidth="0.7" opacity="0.1" transform="rotate(20 380 620) scale(2.3)" />
            <use href="#h" x="620" y="560" strokeWidth="0.5" opacity="0.08" transform="rotate(-22 620 560) scale(1.1)" />
            <use href="#h" x="860" y="610" strokeWidth="0.9" opacity="0.13" transform="rotate(10 860 610) scale(3.0)" />
            <use href="#h" x="1080" y="580" strokeWidth="0.6" opacity="0.09" transform="rotate(-5 1080 580) scale(1.7)" />
            <use href="#h" x="200" y="760" strokeWidth="0.7" opacity="0.1" transform="rotate(28 200 760) scale(2.1)" />
            <use href="#h" x="490" y="800" strokeWidth="0.5" opacity="0.08" transform="rotate(-14 490 800) scale(1.3)" />
            <use href="#h" x="740" y="770" strokeWidth="0.6" opacity="0.1" transform="rotate(7 740 770) scale(1.8)" />
            <use href="#h" x="980" y="810" strokeWidth="0.8" opacity="0.09" transform="rotate(-20 980 810) scale(2.4)" />
          </g>
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
