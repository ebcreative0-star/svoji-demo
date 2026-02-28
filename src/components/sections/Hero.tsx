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
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%238B7355' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="container text-center relative z-10 py-20">
        {/* Names */}
        <div className="animate-fade-in-up mb-6">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-normal tracking-wide">
            {partner1}
            <span className="mx-4 md:mx-6 text-[var(--color-accent)]">&</span>
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

        {/* Countdown */}
        <div className="flex justify-center gap-4 md:gap-8 mb-12 animate-fade-in-up" style={{ animationDelay: "0.5s" }}>
          {[
            { value: timeLeft.days, label: "dní" },
            { value: timeLeft.hours, label: "hodin" },
            { value: timeLeft.minutes, label: "minut" },
            { value: timeLeft.seconds, label: "sekund" },
          ].map((item) => (
            <div key={item.label} className="text-center">
              <div className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center bg-white rounded-lg shadow-sm mb-2">
                <span className="text-2xl md:text-3xl font-light text-[var(--color-primary)]">
                  {item.value.toString().padStart(2, "0")}
                </span>
              </div>
              <span className="text-xs md:text-sm text-[var(--color-text-light)] uppercase tracking-wider">
                {item.label}
              </span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="animate-fade-in-up" style={{ animationDelay: "0.6s" }}>
          <a href="#rsvp" className="btn-primary">
            Potvrdit účast
          </a>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-[var(--color-primary)]" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
          </svg>
        </div>
      </div>
    </section>
  );
}
