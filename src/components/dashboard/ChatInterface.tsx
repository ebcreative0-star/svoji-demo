'use client';

import { useState, useRef, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Send, Loader2, Bot, User } from 'lucide-react';
import { format } from 'date-fns';
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
  weddingDate: string;
  weddingSize: string;
  budget: number | null;
}

interface ChatInterfaceProps {
  couple: CoupleContext;
  initialMessages: Message[];
}

export function ChatInterface({ couple, initialMessages }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

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
            budget: couple.budget,
          },
        }),
      });

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

  const suggestedQuestions = [
    'Co bych měl/a udělat jako první?',
    'Kolik stojí svatební fotograf?',
    'Jak vybrat místo svatby?',
    'Co je potřeba vyřídit na matrice?',
  ];

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-sm overflow-hidden">
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
          <div className="text-center py-8">
            <Bot className="w-12 h-12 mx-auto mb-4 text-[var(--color-primary)] opacity-50" />
            <h3 className="text-lg font-medium mb-2">Ahoj! Jsem váš svatební asistent.</h3>
            <p className="text-[var(--color-text-light)] mb-6">
              Pomohu vám s plánováním svatby od A do Z. Ptejte se na cokoliv!
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {suggestedQuestions.map((q) => (
                <Button
                  key={q}
                  variant="ghost"
                  size="sm"
                  onClick={() => setInput(q)}
                  className="bg-[var(--color-secondary)] rounded-full hover:bg-gray-200"
                >
                  {q}
                </Button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

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
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            disabled={isLoading || !input.trim()}
            aria-label="Odeslat zprávu"
            leadingIcon={<Send className="w-5 h-5" />}
          />
        </div>
      </form>
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
