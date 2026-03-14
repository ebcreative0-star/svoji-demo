'use client';

import { useState, useRef, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { motion } from 'framer-motion';
import { Send, Loader2, Bot, User } from 'lucide-react';
import { format, isToday, isYesterday, isSameDay } from 'date-fns';
import { cs } from 'date-fns/locale';
import { Button, Input } from '@/components/ui';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

interface CoupleContext {
  id: string;
  partner1: string;
  partner2: string;
  weddingDate: string | null;
  weddingSize: string | null;       // deprecated
  guestCountRange: string | null;
  location: string | null;
  searchRadiusKm: number | null;
  weddingStyle: string | null;
  budget: number | null;
}

interface ChatInterfaceProps {
  couple: CoupleContext;
  initialMessages: Message[];
  dataState?: { checklist: number; budget: number; guests: number };
}

export function ChatInterface({ couple, initialMessages, dataState }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || isRateLimited) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    // Optimistic update - přidat uživatelskou zprávu
    const tempUserMsg: Message = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: userMessage,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      // Volat API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          coupleId: couple.id,
          context: {
            partner1: couple.partner1,
            partner2: couple.partner2,
            weddingDate: couple.weddingDate,
            weddingSize: couple.weddingSize,
            guestCountRange: couple.guestCountRange,
            location: couple.location,
            searchRadiusKm: couple.searchRadiusKm,
            weddingStyle: couple.weddingStyle,
            budget: couple.budget,
          },
        }),
      });

      if (response.status === 429) {
        const rateLimitData = await response.json();
        const resetTime = rateLimitData.resetAt
          ? format(new Date(rateLimitData.resetAt), 'HH:mm', { locale: cs })
          : null;
        const limitMsg: Message = {
          id: `ratelimit-${Date.now()}`,
          role: 'assistant',
          content: resetTime
            ? `Dnesni limit 50 zprav byl vycerpan. Novy limit zacina o pulnoci (${resetTime}).`
            : 'Dnesni limit 50 zprav byl vycerpan. Novy limit zacina o pulnoci.',
          created_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, limitMsg]);
        setIsRateLimited(true);
        setIsLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error('Chyba při komunikaci s AI');
      }

      const data = await response.json();

      // Přidat odpověď asistenta
      const assistantMsg: Message = {
        id: `temp-${Date.now()}-assistant`,
        role: 'assistant',
        content: data.message,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (error) {
      console.error('Chat error:', error);
      // Přidat chybovou zprávu
      const errorMsg: Message = {
        id: `temp-${Date.now()}-error`,
        role: 'assistant',
        content: 'Omlouvám se, něco se pokazilo. Zkuste to prosím znovu.',
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      className="flex flex-col h-full bg-white rounded-lg shadow-sm overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      {/* Header */}
      <div className="px-6 py-4 border-b bg-[var(--color-secondary)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[var(--color-primary)] rounded-full flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-medium">AI Svatební asistent</h2>
            <p className="text-sm text-[var(--color-text-light)]">
              Zeptejte se na cokoliv ohledně plánování svatby
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.length === 0 && (
          <WelcomeMessage couple={couple} dataState={dataState} onSuggest={setInput} />
        )}

        {messages.map((message, index) => {
          const msgDate = new Date(message.created_at);
          const prevDate = index > 0 ? new Date(messages[index - 1].created_at) : null;
          const showDateHeader = !prevDate || !isSameDay(msgDate, prevDate);
          let dateLabel = '';
          if (showDateHeader) {
            if (isToday(msgDate)) {
              dateLabel = 'Dnes';
            } else if (isYesterday(msgDate)) {
              dateLabel = 'Vcera';
            } else {
              dateLabel = format(msgDate, 'd. MMMM', { locale: cs });
            }
          }
          return (
            <div key={message.id}>
              {showDateHeader && <DateHeader label={dateLabel} />}
              <MessageBubble message={message} />
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-[var(--color-primary)] rounded-full flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-[var(--color-secondary)] px-4 py-3 rounded-lg">
              <Loader2 className="w-5 h-5 animate-spin text-[var(--color-primary)]" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="px-6 py-4 border-t">
        <div className="flex gap-3">
          <Input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Napište svůj dotaz..."
            disabled={isLoading || isRateLimited}
            className="flex-1"
          />
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            disabled={isLoading || isRateLimited || !input.trim()}
            aria-label="Odeslat zprávu"
            leadingIcon={<Send className="w-5 h-5" />}
          />
        </div>
      </form>
    </motion.div>
  );
}

function DateHeader({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 my-4">
      <div className="flex-1 h-px bg-stone-200" />
      <span className="text-xs text-stone-400 font-medium">{label}</span>
      <div className="flex-1 h-px bg-stone-200" />
    </div>
  );
}

function WelcomeMessage({
  couple,
  dataState,
  onSuggest,
}: {
  couple: CoupleContext;
  dataState?: { checklist: number; budget: number; guests: number };
  onSuggest: (text: string) => void;
}) {
  const ds = dataState ?? { checklist: 0, budget: 0, guests: 0 };
  const hasAnyData = ds.checklist > 0 || ds.budget > 0 || ds.guests > 0;
  const hasAllData = ds.checklist > 0 && ds.budget > 0 && ds.guests > 0;

  let body: string;
  let suggestions: string[];

  if (!hasAnyData) {
    body =
      'Jsem váš svatební asistent. Pomůžeme vám naplánovat celou svatbu na jednom místě.\n\nMáte už rozdělaný plán nebo poznámky? Prostě je sem vložte a já je roztřídím do checklistu, rozpočtu a seznamu hostů.';
    suggestions = ['Co udělat jako první?', 'Kolik stojí svatba?', 'Vlož sem svůj plán...'];
  } else if (ds.checklist === 0) {
    const nonZeroCount = ds.budget > 0 ? ds.budget : ds.guests;
    const nonZeroLabel = ds.budget > 0 ? 'položek v rozpočtu' : 'hostů';
    body = `Vidím že už máte ${nonZeroCount} ${nonZeroLabel}. Chcete přidat úkoly do checklistu? Nebo mi pošlete vaše poznámky a já je roztřídím.`;
    suggestions = ['Přidej základní checklist', 'Co nám ještě chybí?'];
  } else if (hasAllData) {
    const lowestSuggestion =
      ds.guests < 10
        ? 'Přidej další hosty'
        : ds.checklist < 5
          ? 'Co mám udělat jako první?'
          : 'Jak jsme na tom s rozpočtem?';
    body = `Máte ${ds.checklist} úkolů, ${ds.budget} položek v rozpočtu a ${ds.guests} hostů. Jak vám mohu pomoci?`;
    suggestions = [lowestSuggestion, 'Co mám udělat jako první?', 'Zkontroluj náš plán'];
  } else {
    body =
      'Jsem váš svatební asistent. Pomohu vám s plánováním od A do Z. Na co se chcete zeptat?';
    suggestions = ['Co udělat jako první?', 'Kolik stojí svatba?', 'Vlož sem svůj plán...'];
  }

  return (
    <div className="flex flex-col items-center text-center py-8 px-4">
      <div className="w-12 h-12 bg-[var(--color-primary)] rounded-full flex items-center justify-center mb-4 opacity-70">
        <Bot className="w-6 h-6 text-white" />
      </div>
      <h3 className="text-lg font-semibold text-stone-700 mb-2">
        Ahoj {couple.partner1} a {couple.partner2}!
      </h3>
      <p className="text-stone-600 mb-6 max-w-md whitespace-pre-wrap">{body}</p>
      <div className="flex flex-wrap justify-center gap-2">
        {suggestions.map((s) => (
          <button
            key={s}
            onClick={() => onSuggest(s)}
            className="bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 px-4 py-2 rounded-full text-sm transition-colors"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          isUser ? 'bg-gray-200' : 'bg-[var(--color-primary)]'
        }`}
      >
        {isUser ? (
          <User className="w-4 h-4 text-gray-600" />
        ) : (
          <Bot className="w-4 h-4 text-white" />
        )}
      </div>

      <div
        className={`max-w-[80%] px-4 py-3 rounded-lg ${
          isUser ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-secondary)]'
        }`}
      >
        <div className="whitespace-pre-wrap">{message.content}</div>
        <div
          className={`text-xs mt-1 ${
            isUser ? 'text-white/70' : 'text-[var(--color-text-light)]'
          }`}
        >
          {format(new Date(message.created_at), 'HH:mm', { locale: cs })}
        </div>
      </div>
    </div>
  );
}
