'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';

export interface SearchItem {
  id: string;
  title: string;
  domain: 'checklist' | 'budget' | 'guests';
  subtitle?: string;
  tags?: string[];
  href: string;
}

interface SearchModalProps {
  items: SearchItem[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DOMAIN_LABELS: Record<SearchItem['domain'], string> = {
  checklist: 'CHECKLIST',
  budget: 'ROZPOCET',
  guests: 'HOSTE',
};

function filterItems(query: string, items: SearchItem[]): SearchItem[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return items.filter((item) => {
    const inTitle = item.title.toLowerCase().includes(q);
    const inSubtitle = item.subtitle?.toLowerCase().includes(q) ?? false;
    const inTags = item.tags?.some((t) => t.toLowerCase().includes(q)) ?? false;
    return inTitle || inSubtitle || inTags;
  });
}

function groupByDomain(items: SearchItem[]): Record<SearchItem['domain'], SearchItem[]> {
  const result: Record<SearchItem['domain'], SearchItem[]> = {
    checklist: [],
    budget: [],
    guests: [],
  };
  for (const item of items) {
    if (result[item.domain].length < 5) {
      result[item.domain].push(item);
    }
  }
  return result;
}

export function SearchModal({ items, open, onOpenChange }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const filtered = filterItems(query, items);
  const grouped = groupByDomain(filtered);
  const flatResults = [...grouped.checklist, ...grouped.budget, ...grouped.guests];

  const handleSelect = useCallback(
    (item: SearchItem) => {
      router.push(item.href);
      onOpenChange(false);
      setQuery('');
    },
    [router, onOpenChange]
  );

  // Cmd+K / Ctrl+K global listener
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onOpenChange(true);
      }
      if (e.key === 'Escape' && open) {
        onOpenChange(false);
        setQuery('');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onOpenChange]);

  // Auto-focus input when opened
  useEffect(() => {
    if (open) {
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [open]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, flatResults.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && flatResults.length > 0) {
      e.preventDefault();
      handleSelect(flatResults[activeIndex] ?? flatResults[0]);
    } else if (e.key === 'Escape') {
      onOpenChange(false);
      setQuery('');
    }
  };

  const domains: SearchItem['domain'][] = ['checklist', 'budget', 'guests'];
  let globalIndex = 0;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => {
              onOpenChange(false);
              setQuery('');
            }}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4 pointer-events-none">
            <motion.div
              className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden pointer-events-auto"
              initial={{ opacity: 0, scale: 0.95, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -8 }}
              transition={{ duration: 0.15 }}
            >
              {/* Search input */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--color-border)]">
                <Search className="w-5 h-5 text-[var(--color-text-light)] flex-shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setActiveIndex(0);
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Hledat v checklistu, rozpoctu, hostech..."
                  className="flex-1 text-base outline-none bg-transparent placeholder:text-[var(--color-text-light)]"
                />
                {query && (
                  <button
                    onClick={() => setQuery('')}
                    className="text-[var(--color-text-light)] hover:text-[var(--color-text)] transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Results */}
              <div className="max-h-[60vh] overflow-y-auto">
                {!query && (
                  <div className="px-4 py-8 text-center text-sm text-[var(--color-text-light)]">
                    Zadejte hledany vyraz...
                  </div>
                )}

                {query && filtered.length === 0 && (
                  <div className="px-4 py-8 text-center text-sm text-[var(--color-text-light)]">
                    Nic nenalezeno
                  </div>
                )}

                {query && filtered.length > 0 && (
                  <div className="py-2">
                    {domains.map((domain) => {
                      const domainItems = grouped[domain];
                      if (domainItems.length === 0) return null;

                      return (
                        <div key={domain}>
                          {/* Domain header */}
                          <div className="px-4 py-1.5 text-xs font-bold text-[var(--color-text-light)] tracking-wider uppercase">
                            {DOMAIN_LABELS[domain]}
                          </div>

                          {/* Domain items */}
                          {domainItems.map((item) => {
                            const idx = globalIndex++;
                            const isActive = idx === activeIndex;

                            return (
                              <button
                                key={item.id}
                                onClick={() => handleSelect(item)}
                                onMouseEnter={() => setActiveIndex(idx)}
                                className={`w-full text-left px-4 py-2.5 flex flex-col gap-1 transition-colors ${
                                  isActive
                                    ? 'bg-[var(--color-primary)]/8'
                                    : 'hover:bg-gray-50'
                                }`}
                              >
                                <span className="text-sm font-medium text-[var(--color-text)] line-clamp-1">
                                  {item.title}
                                </span>

                                <div className="flex items-center gap-2 flex-wrap">
                                  {item.subtitle && (
                                    <span className="text-xs text-[var(--color-text-light)]">
                                      {item.subtitle}
                                    </span>
                                  )}
                                  {item.tags && item.tags.length > 0 && (
                                    <div className="flex gap-1 flex-wrap">
                                      {item.tags.slice(0, 3).map((tag) => (
                                        <span
                                          key={tag}
                                          className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-[var(--color-text-light)]"
                                        >
                                          {tag}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Footer hint */}
              {filtered.length > 0 && (
                <div className="px-4 py-2 border-t border-[var(--color-border)] flex items-center gap-3 text-[10px] text-[var(--color-text-light)]">
                  <span>↑↓ navigovat</span>
                  <span>↵ otevrit</span>
                  <span>Esc zavrit</span>
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
