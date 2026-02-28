'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Sparkles, CheckSquare } from 'lucide-react';
import { buttonVariants } from '@/components/ui/Button';

const chatMessages = [
  { from: 'user' as const, text: 'Kolik stojí svatební fotograf v Praze?' },
  { from: 'ai' as const, text: 'Ceny se pohybují mezi 15-40 tisíci Kč. Pro Prahu doporučuji počítat s 25-30 tisíci.' },
  { from: 'user' as const, text: 'A co videograf?' },
  { from: 'ai' as const, text: 'Videograf vyjde na 20-50 tisíc Kč. Tip: některé studia nabízejí balíček foto + video se slevou.' },
  { from: 'user' as const, text: 'Jaké jsou trendy ve svatební výzdobě 2026?' },
  { from: 'ai' as const, text: 'Přírodní materiály, sušené květiny a teplé zemité tóny. Minimalistické aranžmá s pampaskou trávou je velmi populární.' },
  { from: 'user' as const, text: 'Kolik hostů se vejde na zámek Hluboká?' },
  { from: 'ai' as const, text: 'Velký sál pojme až 120 hostů. Pro menší obřad je k dispozici kaple pro 60 osob. Pronájem vychází od 80 tisíc Kč.' },
  { from: 'user' as const, text: 'Máš tip na svatební koordinátorku v Brně?' },
  { from: 'ai' as const, text: 'V Brně doporučuji Wedding Factory nebo Svatby s úsměvem. Obě mají výborné reference a ceny od 25 tisíc Kč.' },
  { from: 'user' as const, text: 'Kdy objednat svatební oznámení?' },
  { from: 'ai' as const, text: 'Ideálně 3-4 měsíce před svatbou. Tisk trvá 2-3 týdny a hosté potřebují čas na odpověď. Save-the-date posílejte 6 měsíců předem.' },
  { from: 'user' as const, text: 'Jaký rozpočet na svatbu pro 80 lidí?' },
  { from: 'ai' as const, text: 'Realistický rozpočet pro 80 hostů v ČR je 350-500 tisíc Kč. Největší položky: catering (40%), místo (20%), foto+video (15%).' },
  { from: 'user' as const, text: 'Co nesmí chybět v den D?' },
  { from: 'ai' as const, text: 'Snubní prsteny, občanky, hotovost pro dodavatele, nouzová sada (jehla, nit, náplasti) a kontakty na všechny dodavatele v telefonu.' },
];

// Delay before each message appears (ms). User messages shorter, AI longer.
function getDelay(from: 'user' | 'ai') {
  return from === 'user' ? 1000 : 1500;
}

function ChatMockup() {
  const [messages, setMessages] = useState<Array<{ key: number; from: 'user' | 'ai'; text: string }>>([]);
  const [showTyping, setShowTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const indexRef = useRef(0);
  const keyRef = useRef(0);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    let cancelled = false;

    function scheduleNext() {
      if (cancelled) return;
      const msg = chatMessages[indexRef.current % chatMessages.length];
      const isAi = msg.from === 'ai';

      // Show typing indicator before AI messages
      if (isAi) {
        setShowTyping(true);
      }

      const delay = getDelay(msg.from);

      timeout = setTimeout(() => {
        if (cancelled) return;
        setShowTyping(false);
        keyRef.current++;
        setMessages((prev) => [...prev, { key: keyRef.current, from: msg.from, text: msg.text }]);
        indexRef.current++;
        scheduleNext();
      }, delay);
    }

    // Kick off after initial pause
    timeout = setTimeout(() => {
      if (!cancelled) scheduleNext();
    }, 600);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, showTyping]);

  return (
    <div className="relative max-w-md mx-auto mt-12">
      <div className="bg-white rounded-3xl shadow-2xl border border-[var(--color-border)] overflow-hidden">
        {/* Browser bar */}
        <div className="bg-gray-50 px-4 py-3 flex items-center gap-2 border-b border-gray-100">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <div className="flex-1 text-center text-xs text-gray-400">svoji.cz/chat</div>
        </div>

        {/* Chat messages - fixed height, scrollable */}
        <div
          ref={scrollRef}
          className="h-[280px] overflow-y-auto p-6 space-y-4"
        >
          {messages.map((msg) => (
            <div
              key={msg.key}
              className={`flex gap-3 animate-chat-message ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.from === 'ai' && (
                <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
              )}
              <div
                className={`rounded-2xl px-4 py-3 max-w-xs text-sm text-left ${
                  msg.from === 'user'
                    ? 'bg-[var(--color-secondary)] rounded-tr-sm'
                    : 'bg-gray-50 rounded-tl-sm'
                }`}
              >
                {msg.text}
              </div>
              {msg.from === 'user' && (
                <div className="w-8 h-8 rounded-full bg-[var(--color-secondary)] flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-medium">Vy</span>
                </div>
              )}
            </div>
          ))}
          {/* Typing indicator */}
          {showTyping && (
            <div className="flex gap-3 justify-start animate-chat-message">
              <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="rounded-2xl px-4 py-3 bg-gray-50 rounded-tl-sm">
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating stats card (desktop only) */}
      <div className="absolute -right-4 bottom-16 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 hidden lg:block">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[var(--color-accent-sage)] rounded-xl flex items-center justify-center">
            <CheckSquare className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold">8/10 úkolů</p>
            <p className="text-xs text-[var(--color-text-light)]">Tento měsíc</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Hero() {
  return (
    <section className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden bg-[var(--color-secondary)] pt-20">
      {/* Grain texture overlay */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: 0.04,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 py-16 text-center"
      >
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full mb-8">
          <Sparkles className="w-4 h-4 text-[var(--color-primary)]" />
          <span className="text-sm font-medium text-[var(--color-primary)]">
            AI-powered svatební plánování
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif mb-6 leading-[1.1] tracking-tight">
          Naplánujte svatbu
          <br />
          <span className="text-[var(--color-primary)]">bez stresu</span>
        </h1>

        {/* Subheadline */}
        <p className="text-lg lg:text-xl text-[var(--color-text-light)] mb-10 max-w-lg mx-auto leading-relaxed">
          Váš osobní AI asistent, který zná české tradice, ceny a pomůže vám s každým detailem.
        </p>

        {/* Dual CTA */}
        <div className="flex flex-row items-center justify-center gap-4 flex-wrap">
          <Link href="/register" className={buttonVariants({ variant: 'primary', size: 'lg' })}>
            Vyzkoušet zdarma
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link href="/login" className={buttonVariants({ variant: 'secondary', size: 'lg' })}>
            Přihlásit se
          </Link>
        </div>

        {/* Social proof nudge */}
        <p className="mt-4 text-sm text-[var(--color-text-light)]">
          Přidalo se 500+ párů · Zdarma · Bez karty
        </p>

        <ChatMockup />
      </motion.div>
    </section>
  );
}
