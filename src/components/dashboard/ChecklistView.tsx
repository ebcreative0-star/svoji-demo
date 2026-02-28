'use client';

import { useState, useTransition } from 'react';
import { createClient } from '@/lib/supabase/client';
import { format, differenceInDays, isPast, isToday } from 'date-fns';
import { cs } from 'date-fns/locale';
import {
  Check,
  Circle,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  Clock,
  Filter,
} from 'lucide-react';
import {
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  type TaskCategory,
  type TaskPriority,
} from '@/lib/checklist-generator';

interface ChecklistItem {
  id: string;
  title: string;
  description: string | null;
  category: string;
  due_date: string;
  priority: string;
  completed: boolean;
  completed_at: string | null;
}

interface ChecklistViewProps {
  items: ChecklistItem[];
  weddingDate: string;
}

type FilterType = 'all' | 'pending' | 'completed' | 'overdue';
type GroupBy = 'date' | 'category' | 'priority';

export function ChecklistView({ items: initialItems, weddingDate }: ChecklistViewProps) {
  const [items, setItems] = useState(initialItems);
  const [filter, setFilter] = useState<FilterType>('pending');
  const [groupBy, setGroupBy] = useState<GroupBy>('date');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['thisWeek', 'thisMonth']));
  const [isPending, startTransition] = useTransition();

  const supabase = createClient();
  const daysUntilWedding = differenceInDays(new Date(weddingDate), new Date());

  const toggleItem = async (id: string, completed: boolean) => {
    // Optimistic update
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, completed, completed_at: completed ? new Date().toISOString() : null }
          : item
      )
    );

    // Server update
    startTransition(async () => {
      await supabase
        .from('checklist_items')
        .update({
          completed,
          completed_at: completed ? new Date().toISOString() : null,
        })
        .eq('id', id);
    });
  };

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  };

  // Filtrovat položky
  const filteredItems = items.filter((item) => {
    if (filter === 'all') return true;
    if (filter === 'pending') return !item.completed;
    if (filter === 'completed') return item.completed;
    if (filter === 'overdue') return !item.completed && isPast(new Date(item.due_date));
    return true;
  });

  // Seskupit položky
  const groupedItems = groupItems(filteredItems, groupBy);

  // Statistiky
  const stats = {
    total: items.length,
    completed: items.filter((i) => i.completed).length,
    pending: items.filter((i) => !i.completed).length,
    overdue: items.filter((i) => !i.completed && isPast(new Date(i.due_date))).length,
  };

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <StatCard
          label="Hotovo"
          value={`${stats.completed}/${stats.total}`}
          progress={(stats.completed / stats.total) * 100}
        />
        <StatCard
          label="Zbývá"
          value={stats.pending.toString()}
          subtitle={`${daysUntilWedding} dní do svatby`}
        />
        <StatCard
          label="Po termínu"
          value={stats.overdue.toString()}
          alert={stats.overdue > 0}
        />
        <StatCard
          label="Progres"
          value={`${Math.round((stats.completed / stats.total) * 100)}%`}
          progress={(stats.completed / stats.total) * 100}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="flex bg-white rounded-lg p-1 shadow-sm overflow-x-auto">
          {(['pending', 'all', 'completed', 'overdue'] as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-2 sm:py-1.5 text-xs sm:text-sm rounded-md transition-colors whitespace-nowrap min-h-[44px] sm:min-h-0 ${
                filter === f
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'text-[var(--color-text-light)] hover:bg-gray-100'
              }`}
            >
              {f === 'pending' && 'Nesplněné'}
              {f === 'all' && 'Vše'}
              {f === 'completed' && 'Hotové'}
              {f === 'overdue' && 'Po termínu'}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-sm text-[var(--color-text-light)]">
          <Filter className="w-4 h-4" />
          <select
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value as GroupBy)}
            className="bg-white border rounded-lg px-2 py-1.5"
          >
            <option value="date">Podle data</option>
            <option value="category">Podle kategorie</option>
            <option value="priority">Podle priority</option>
          </select>
        </div>
      </div>

      {/* Grouped items */}
      <div className="space-y-4">
        {Object.entries(groupedItems).map(([groupId, group]) => (
          <div key={groupId} className="bg-white rounded-lg shadow-sm overflow-hidden">
            <button
              onClick={() => toggleGroup(groupId)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                {expandedGroups.has(groupId) ? (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                )}
                <span className="font-medium">{group.label}</span>
                <span className="text-sm text-[var(--color-text-light)]">
                  ({group.items.filter((i) => i.completed).length}/{group.items.length})
                </span>
              </div>
            </button>

            {expandedGroups.has(groupId) && (
              <div className="border-t divide-y">
                {group.items.map((item) => (
                  <ChecklistItemRow
                    key={item.id}
                    item={item}
                    onToggle={toggleItem}
                    isPending={isPending}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12 text-[var(--color-text-light)]">
          {filter === 'completed' ? 'Zatím žádné splněné úkoly' : 'Všechny úkoly splněny! 🎉'}
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  subtitle,
  progress,
  alert,
}: {
  label: string;
  value: string;
  subtitle?: string;
  progress?: number;
  alert?: boolean;
}) {
  return (
    <div className={`bg-white p-4 rounded-lg shadow-sm ${alert ? 'border-l-4 border-red-500' : ''}`}>
      <div className="text-sm text-[var(--color-text-light)] mb-1">{label}</div>
      <div className={`text-2xl font-medium ${alert ? 'text-red-600' : ''}`}>{value}</div>
      {subtitle && <div className="text-xs text-[var(--color-text-light)] mt-1">{subtitle}</div>}
      {progress !== undefined && (
        <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-[var(--color-primary)] rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}

function ChecklistItemRow({
  item,
  onToggle,
  isPending,
}: {
  item: ChecklistItem;
  onToggle: (id: string, completed: boolean) => void;
  isPending: boolean;
}) {
  const dueDate = new Date(item.due_date);
  const isOverdue = !item.completed && isPast(dueDate) && !isToday(dueDate);
  const isDueToday = isToday(dueDate);
  const category = item.category as TaskCategory;
  const priority = item.priority as TaskPriority;

  return (
    <div
      className={`flex items-start gap-4 px-4 py-3 hover:bg-gray-50 transition-colors ${
        item.completed ? 'opacity-60' : ''
      }`}
    >
      <button
        onClick={() => onToggle(item.id, !item.completed)}
        disabled={isPending}
        className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
          item.completed
            ? 'bg-[var(--color-primary)] border-[var(--color-primary)]'
            : 'border-gray-300 hover:border-[var(--color-primary)]'
        }`}
      >
        {item.completed && <Check className="w-3 h-3 text-white" />}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={`text-sm font-medium ${item.completed ? 'line-through text-gray-400' : ''}`}
          >
            {item.title}
          </span>
          {priority === 'urgent' && !item.completed && (
            <span className="px-1.5 py-0.5 text-xs bg-red-100 text-red-700 rounded">
              Urgentní
            </span>
          )}
        </div>

        {item.description && (
          <p className="text-sm text-[var(--color-text-light)] mt-0.5">{item.description}</p>
        )}

        <div className="flex items-center gap-3 mt-2 text-xs text-[var(--color-text-light)]">
          <span
            className="px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: `${CATEGORY_COLORS[category]}20`,
              color: CATEGORY_COLORS[category],
            }}
          >
            {CATEGORY_LABELS[category]}
          </span>

          <span className={`flex items-center gap-1 ${isOverdue ? 'text-red-600' : isDueToday ? 'text-amber-600' : ''}`}>
            {isOverdue && <AlertTriangle className="w-3 h-3" />}
            {isDueToday && <Clock className="w-3 h-3" />}
            {format(dueDate, 'd. MMMM', { locale: cs })}
          </span>
        </div>
      </div>
    </div>
  );
}

function groupItems(items: ChecklistItem[], groupBy: GroupBy) {
  const groups: Record<string, { label: string; items: ChecklistItem[] }> = {};

  items.forEach((item) => {
    let groupId: string;
    let label: string;

    if (groupBy === 'date') {
      const dueDate = new Date(item.due_date);
      const today = new Date();
      const daysUntil = differenceInDays(dueDate, today);

      if (isPast(dueDate) && !isToday(dueDate)) {
        groupId = 'overdue';
        label = 'Po termínu';
      } else if (daysUntil <= 7) {
        groupId = 'thisWeek';
        label = 'Tento týden';
      } else if (daysUntil <= 30) {
        groupId = 'thisMonth';
        label = 'Tento měsíc';
      } else if (daysUntil <= 90) {
        groupId = 'next3Months';
        label = 'Příští 3 měsíce';
      } else {
        groupId = 'later';
        label = 'Později';
      }
    } else if (groupBy === 'category') {
      groupId = item.category;
      label = CATEGORY_LABELS[item.category as TaskCategory] || item.category;
    } else {
      groupId = item.priority;
      label =
        item.priority === 'urgent'
          ? 'Urgentní'
          : item.priority === 'high'
          ? 'Vysoká priorita'
          : item.priority === 'medium'
          ? 'Střední priorita'
          : 'Nízká priorita';
    }

    if (!groups[groupId]) {
      groups[groupId] = { label, items: [] };
    }
    groups[groupId].items.push(item);
  });

  return groups;
}
