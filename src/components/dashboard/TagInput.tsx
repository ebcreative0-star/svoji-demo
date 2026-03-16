'use client';

import { useState, useRef, useCallback, KeyboardEvent } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { getTagColor } from '@/lib/tags';

export interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  existingTags: string[];
  placeholder?: string;
}

export function TagInput({
  value,
  onChange,
  existingTags,
  placeholder = 'Přidat štítek...',
}: TagInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestions = existingTags.filter(
    (tag) =>
      inputValue.length > 0 &&
      tag.toLowerCase().startsWith(inputValue.toLowerCase()) &&
      !value.includes(tag)
  );

  const addTag = useCallback(
    (tag: string) => {
      const normalized = tag.trim().toLowerCase();
      if (normalized && !value.includes(normalized)) {
        onChange([...value, normalized]);
      }
      setInputValue('');
      setShowSuggestions(false);
      inputRef.current?.focus();
    },
    [value, onChange]
  );

  const removeTag = useCallback(
    (index: number) => {
      onChange(value.filter((_, i) => i !== index));
    },
    [value, onChange]
  );

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (inputValue.trim()) {
        addTag(inputValue);
      }
    } else if (e.key === 'Backspace' && inputValue === '' && value.length > 0) {
      removeTag(value.length - 1);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  return (
    <div className="relative">
      <div
        className="flex flex-wrap gap-1.5 items-center min-h-[38px] w-full rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-sm focus-within:ring-2 focus-within:ring-rose-500/20 focus-within:border-rose-400 transition-colors cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        {value.map((tag, index) => {
          const color = getTagColor(tag);
          return (
            <span
              key={tag}
              className={cn(
                'inline-flex items-center gap-1 text-xs font-medium rounded-full px-2 py-0.5',
                color.bg,
                color.text
              )}
            >
              {tag}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeTag(index);
                }}
                className="hover:opacity-70 transition-opacity"
                aria-label={`Odebrat štítek ${tag}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          );
        })}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setShowSuggestions(true);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => {
            // Auto-commit typed text as tag on blur (e.g. when user clicks Save)
            if (inputValue.trim()) {
              addTag(inputValue);
            }
            setTimeout(() => setShowSuggestions(false), 150);
          }}
          placeholder={value.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[120px] outline-none bg-transparent text-gray-700 placeholder:text-gray-400"
        />
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute z-10 top-full mt-1 left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg max-h-32 overflow-y-auto py-1">
          {suggestions.map((suggestion) => {
            const color = getTagColor(suggestion);
            return (
              <li key={suggestion}>
                <button
                  type="button"
                  className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-50 flex items-center gap-2"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    addTag(suggestion);
                  }}
                >
                  <span
                    className={cn(
                      'inline-flex items-center text-xs font-medium rounded-full px-2 py-0.5',
                      color.bg,
                      color.text
                    )}
                  >
                    {suggestion}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
