"use client";

import { useEffect, useState } from "react";
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

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-[var(--color-secondary)]">

      <div className="container text-center relative z-10 py-20">
        {/* Names */}
        <div className="animate-fade-in-up mb-8">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight">
            {partner1}
            <span className="mx-3 md:mx-5 text-[var(--color-accent)] font-normal">&</span>
            {partner2}
          </h1>
        </div>

        {/* Headline */}
        <p className="text-lg md:text-xl text-[var(--color-text-light)] mb-2 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          {headline}
        </p>
        <p className="text-base text-[var(--color-text-light)] mb-8 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
          {subheadline}
        </p>

        {/* Date */}
        <div className="mb-12 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
          <p className="text-2xl md:text-3xl font-light text-[var(--color-primary)]">
            {formattedDate}
          </p>
        </div>

        {/* Countdown - only days */}
        <div className="flex justify-center mb-12 animate-fade-in-up" style={{ animationDelay: "0.5s" }}>
          <div className="text-center">
            <div className="text-5xl md:text-6xl font-light text-[var(--color-primary)] mb-2">
              {timeLeft.days}
            </div>
            <span className="text-sm md:text-base text-[var(--color-text-light)] uppercase tracking-widest">
              dní do svatby
            </span>
          </div>
        </div>

        {/* CTA */}
        <div className="animate-fade-in-up" style={{ animationDelay: "0.6s" }}>
          <a href="#rsvp" className="inline-flex items-center justify-center gap-2 font-medium rounded-full text-base px-7 py-3.5 min-h-[52px] bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-light)] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]">
            Potvrdit účast
          </a>
        </div>

        {/* Scroll indicator - subtle */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 opacity-40">
          <svg className="w-5 h-5 text-[var(--color-primary)]" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
          </svg>
        </div>
      </div>
    </section>
  );
}
