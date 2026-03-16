'use client';

import { useState, useTransition, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { format, differenceInDays, isPast, isToday } from 'date-fns';
import { cs } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  Clock,
  Filter,
  Trash2,
  Pencil,
  ClipboardList,
} from 'lucide-react';
import {
  CATEGORY_LABELS,
  type TaskCategory,
  type TaskPriority,
} from '@/lib/checklist-generator';
import { Button, Card, Badge, Select } from '@/components/ui';
import { TagInput } from './TagInput';
import { getTagColor } from '@/lib/tags';
import { cn } from '@/lib/cn';

const CATEGORY_INTENT: Record<TaskCategory, 'success' | 'warning' | 'danger' | 'info' | 'neutral'> = {
  venue: 'info',
  attire: 'neutral',
  vendors: 'warning',
  guests: 'success',
  decor: 'info',
  admin: 'neutral',
  ceremony: 'danger',
};

interface ChecklistItem {
  id: string;
  title: string;
  description: string | null;
  category: string;
  due_date: string | null;
  priority: string;
  completed: boolean;
  completed_at: string | null;
  tags: string[];
}

interface ChecklistViewProps {
  items: ChecklistItem[];
  weddingDate: string;
  coupleId: string;
}

type FilterType = 'all' | 'pending' | 'completed' | 'overdue';
type GroupBy = 'date' | 'category' | 'priority';

export function ChecklistView({ items: initialItems, weddingDate, coupleId }: ChecklistViewProps) {
  const [items, setItems] = useState(initialItems);
  const [filter, setFilter] = useState<FilterType>('pending');
  const [groupBy, setGroupBy] = useState<GroupBy>('date');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['thisWeek', 'thisMonth']));
  const [isPending, startTransition] = useTransition();

  // Quick-add state
  const [quickTitle, setQuickTitle] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const [quickDueDate, setQuickDueDate] = useState('');
  const [quickPriority, setQuickPriority] = useState('medium');
  const [quickCategory, setQuickCategory] = useState('admin');
  const [quickTags, setQuickTags] = useState<string[]>([]);
  const quickInputRef = useRef<HTMLInputElement>(null);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Partial<ChecklistItem>>({});

  const supabase = createClient();
  const daysUntilWedding = differenceInDays(new Date(weddingDate), new Date());

  // All existing tags across items (for autocomplete)
  const allTags = Array.from(new Set(items.flatMap((i) => i.tags || [])));

  // --- Quick-add ---
  const handleQuickAdd = async (withDetails = false) => {
    const title = quickTitle.trim();
    if (!title) return;

    const newItem: ChecklistItem = {
      id: crypto.randomUUID(),
      title,
      description: null,
      category: withDetails ? quickCategory : 'admin',
      due_date: withDetails && quickDueDate ? quickDueDate : null,
      priority: withDetails ? quickPriority : 'medium',
      completed: false,
      completed_at: null,
      tags: withDetails ? quickTags : [],
    };

    // Optimistic update
    setItems((prev) => [newItem, ...prev]);

    // Reset form
    setQuickTitle('');
    setQuickDueDate('');
    setQuickPriority('medium');
    setQuickCategory('admin');
    setQuickTags([]);
    setShowDetails(false);

    startTransition(async () => {
      const { data, error } = await supabase
        .from('checklist_items')
        .insert({
          couple_id: coupleId,
          title: newItem.title,
          due_date: newItem.due_date,
          priority: newItem.priority,
          category: newItem.category,
          tags: newItem.tags,
        })
        .select()
        .single();

      if (error || !data) {
        // Revert on error
        setItems((prev) => prev.filter((i) => i.id !== newItem.id));
      } else {
        // Replace temp id with real id
        setItems((prev) => prev.map((i) => (i.id === newItem.id ? { ...i, id: data.id } : i)));
      }
    });
  };

  const handleQuickKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleQuickAdd(false);
    }
  };

  // --- Delete ---
  const handleDelete = async (id: string) => {
    const snapshot = items;
    setItems((prev) => prev.filter((i) => i.id !== id));

    startTransition(async () => {
      const { error } = await supabase.from('checklist_items').delete().eq('id', id);
      if (error) {
        setItems(snapshot);
      }
    });
  };

  // --- Edit ---
  const startEdit = (item: ChecklistItem) => {
    setEditingId(item.id);
    setEditDraft({ ...item });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditDraft({});
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editDraft.title?.trim()) return;

    const snapshot = items;
    setItems((prev) =>
      prev.map((i) =>
        i.id === editingId
          ? { ...i, ...editDraft, title: editDraft.title!.trim() }
          : i
      )
    );
    setEditingId(null);

    startTransition(async () => {
      const { error } = await supabase
        .from('checklist_items')
        .update({
          title: editDraft.title!.trim(),
          due_date: editDraft.due_date || null,
          priority: editDraft.priority,
          category: editDraft.category,
          tags: editDraft.tags || [],
        })
        .eq('id', editingId);

      if (error) {
        setItems(snapshot);
      }
    });
  };

  // --- Toggle ---
  const toggleItem = async (id: string, completed: boolean) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, completed, completed_at: completed ? new Date().toISOString() : null }
          : item
      )
    );

    if (completed) {
      const item = items.find((i) => i.id === id);
      fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: 'checklist_item_completed',
          metadata: {
            item_id: id,
            item_title: item?.title || '',
            item_category: item?.category || '',
          },
        }),
      }).catch(() => {});
    }

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

  const filteredItems = items.filter((item) => {
    if (filter === 'all') return true;
    if (filter === 'pending') return !item.completed;
    if (filter === 'completed') return item.completed;
    if (filter === 'overdue')
      return !item.completed && item.due_date != null && isPast(new Date(item.due_date));
    return true;
  });

  const groupedItems = groupItems(filteredItems, groupBy);

  const stats = {
    total: items.length,
    completed: items.filter((i) => i.completed).length,
    pending: items.filter((i) => !i.completed).length,
    overdue: items.filter(
      (i) => !i.completed && i.due_date != null && isPast(new Date(i.due_date))
    ).length,
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
      {/* Quick-add */}
      <Card className="mb-4 sm:mb-6">
        <Card.Body>
          <div className="flex gap-2">
            <input
              ref={quickInputRef}
              type="text"
              value={quickTitle}
              onChange={(e) => setQuickTitle(e.target.value)}
              onKeyDown={handleQuickKeyDown}
              placeholder="Přidat úkol..."
              className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 transition-colors placeholder:text-gray-400"
            />
            <Button variant="primary" size="sm" onClick={() => handleQuickAdd(false)} disabled={!quickTitle.trim()}>
              Přidat
            </Button>
          </div>

          <button
            type="button"
            onClick={() => setShowDetails((v) => !v)}
            className="mt-2 text-xs text-[var(--color-text-light)] hover:text-[var(--color-primary)] transition-colors"
          >
            + Detaily (datum, priorita, štítky)
          </button>

          <AnimatePresence initial={false}>
            {showDetails && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="pt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-[var(--color-text-light)] mb-1">Termín</label>
                    <input
                      type="date"
                      value={quickDueDate}
                      onChange={(e) => setQuickDueDate(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[var(--color-text-light)] mb-1">Priorita</label>
                    <select
                      value={quickPriority}
                      onChange={(e) => setQuickPriority(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 transition-colors"
                    >
                      <option value="high">Vysoká</option>
                      <option value="medium">Střední</option>
                      <option value="low">Nízká</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-[var(--color-text-light)] mb-1">Kategorie</label>
                    <select
                      value={quickCategory}
                      onChange={(e) => setQuickCategory(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 transition-colors"
                    >
                      {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-3">
                    <label className="block text-xs text-[var(--color-text-light)] mb-1">Štítky</label>
                    <TagInput
                      value={quickTags}
                      onChange={setQuickTags}
                      existingTags={allTags}
                    />
                  </div>
                  <div className="sm:col-span-3 flex justify-end">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleQuickAdd(true)}
                      disabled={!quickTitle.trim()}
                    >
                      Přidat s detaily
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card.Body>
      </Card>

      {/* Stats */}
      {(() => {
        const daysLabel = daysUntilWedding >= 0 ? `${daysUntilWedding} dní` : 'Proběhla';
        return (
          <div className="grid grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8">
            <StatCard
              label="Hotovo"
              value={`${stats.completed}/${stats.total}`}
              progress={stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}
            />
            <StatCard
              label="Zbývá"
              value={daysLabel}
              subtitle={daysUntilWedding >= 0 ? 'do svatby' : undefined}
            />
            <StatCard
              label="Po termínu"
              value={stats.overdue.toString()}
              alert={stats.overdue > 0}
            />
          </div>
        );
      })()}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6">
        <Card className="p-1">
          <div className="flex overflow-x-auto">
            {(['pending', 'all', 'completed', 'overdue'] as FilterType[]).map((f) => (
              <Button
                key={f}
                variant={filter === f ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setFilter(f)}
                className="whitespace-nowrap rounded-md"
              >
                {f === 'pending' && 'Nesplněné'}
                {f === 'all' && 'Vše'}
                {f === 'completed' && 'Hotové'}
                {f === 'overdue' && 'Po termínu'}
              </Button>
            ))}
          </div>
        </Card>

        <div className="flex items-center gap-2 text-sm text-[var(--color-text-light)]">
          <Filter className="w-4 h-4" />
          <Select
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value as GroupBy)}
            className="w-auto"
          >
            <option value="date">Podle data</option>
            <option value="category">Podle kategorie</option>
            <option value="priority">Podle priority</option>
          </Select>
        </div>
      </div>

      {/* Empty state */}
      {items.length === 0 ? (
        <div className="text-center py-16 flex flex-col items-center gap-4">
          <ClipboardList className="w-12 h-12 text-gray-300" />
          <div>
            <h3 className="font-medium text-gray-700 mb-1">Zatím žádné úkoly</h3>
            <p className="text-sm text-[var(--color-text-light)]">
              Začněte přidávat úkoly do svého checklistu
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => quickInputRef.current?.focus()}
          >
            Přidat první úkol
          </Button>
          <a
            href="/chat"
            className="text-sm text-[var(--color-primary)] hover:underline"
          >
            Nebo to nechte na AI
          </a>
        </div>
      ) : (
        <>
          {/* Grouped items */}
          <div className="space-y-4">
            {Object.entries(groupedItems).map(([groupId, group]) => (
              <Card key={groupId} className="overflow-hidden">
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
                      <div key={item.id}>
                        <ChecklistItemRow
                          item={item}
                          onToggle={toggleItem}
                          onDelete={handleDelete}
                          onEdit={startEdit}
                          isPending={isPending}
                        />
                        <AnimatePresence initial={false}>
                          {editingId === item.id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="px-4 py-3 bg-gray-50 border-t space-y-3">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <div className="sm:col-span-2">
                                    <label className="block text-xs text-[var(--color-text-light)] mb-1">Název</label>
                                    <input
                                      type="text"
                                      value={editDraft.title || ''}
                                      onChange={(e) =>
                                        setEditDraft((d) => ({ ...d, title: e.target.value }))
                                      }
                                      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 transition-colors"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs text-[var(--color-text-light)] mb-1">Termín</label>
                                    <input
                                      type="date"
                                      value={editDraft.due_date || ''}
                                      onChange={(e) =>
                                        setEditDraft((d) => ({ ...d, due_date: e.target.value || null }))
                                      }
                                      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 transition-colors"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs text-[var(--color-text-light)] mb-1">Priorita</label>
                                    <select
                                      value={editDraft.priority || 'medium'}
                                      onChange={(e) =>
                                        setEditDraft((d) => ({ ...d, priority: e.target.value }))
                                      }
                                      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 transition-colors"
                                    >
                                      <option value="high">Vysoká</option>
                                      <option value="medium">Střední</option>
                                      <option value="low">Nízká</option>
                                    </select>
                                  </div>
                                  <div>
                                    <label className="block text-xs text-[var(--color-text-light)] mb-1">Kategorie</label>
                                    <select
                                      value={editDraft.category || 'admin'}
                                      onChange={(e) =>
                                        setEditDraft((d) => ({ ...d, category: e.target.value }))
                                      }
                                      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 transition-colors"
                                    >
                                      {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                                        <option key={value} value={value}>{label}</option>
                                      ))}
                                    </select>
                                  </div>
                                  <div>
                                    <label className="block text-xs text-[var(--color-text-light)] mb-1">Štítky</label>
                                    <TagInput
                                      value={editDraft.tags || []}
                                      onChange={(tags) =>
                                        setEditDraft((d) => ({ ...d, tags }))
                                      }
                                      existingTags={allTags}
                                    />
                                  </div>
                                </div>
                                <div className="flex gap-2 justify-end">
                                  <Button variant="ghost" size="sm" onClick={cancelEdit}>
                                    Zrušit
                                  </Button>
                                  <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={handleSaveEdit}
                                    disabled={!editDraft.title?.trim()}
                                  >
                                    Uložit
                                  </Button>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            ))}
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-12 text-[var(--color-text-light)]">
              {filter === 'completed' ? 'Zatím žádné splněné úkoly' : 'Všechny úkoly splněny!'}
            </div>
          )}
        </>
      )}
    </motion.div>
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
    <Card className={alert ? 'border-l-4 border-red-500' : ''}>
      <Card.Body>
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
      </Card.Body>
    </Card>
  );
}

function ChecklistItemRow({
  item,
  onToggle,
  onDelete,
  onEdit,
  isPending,
}: {
  item: ChecklistItem;
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
  onEdit: (item: ChecklistItem) => void;
  isPending: boolean;
}) {
  const dueDate = item.due_date ? new Date(item.due_date) : null;
  const isOverdue = !item.completed && dueDate != null && isPast(dueDate) && !isToday(dueDate);
  const isDueToday = dueDate != null && isToday(dueDate);
  const category = item.category as TaskCategory;
  const priority = item.priority as TaskPriority;
  const tags = item.tags || [];

  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${
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
            <Badge intent="danger" size="sm">Urgentní</Badge>
          )}
        </div>

        {item.description && (
          <p className="text-sm text-[var(--color-text-light)] mt-0.5">{item.description}</p>
        )}

        <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-[var(--color-text-light)]">
          <Badge intent={CATEGORY_INTENT[category] ?? 'neutral'} size="sm">
            {CATEGORY_LABELS[category] ?? category}
          </Badge>

          {dueDate && (
            <span
              className={`flex items-center gap-1 ${
                isOverdue ? 'text-red-600' : isDueToday ? 'text-amber-600' : ''
              }`}
            >
              {isOverdue && <AlertTriangle className="w-3 h-3" />}
              {isDueToday && <Clock className="w-3 h-3" />}
              {format(dueDate, 'd. MMMM', { locale: cs })}
            </span>
          )}

          {tags.map((tag) => {
            const color = getTagColor(tag);
            return (
              <span
                key={tag}
                className={cn(
                  'inline-flex items-center text-xs font-medium rounded-full px-2 py-0.5',
                  color.bg,
                  color.text
                )}
              >
                {tag}
              </span>
            );
          })}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-1 ml-1 flex-shrink-0">
        <button
          type="button"
          onClick={() => onEdit(item)}
          className="p-1.5 rounded-md text-gray-400 hover:text-[var(--color-primary)] hover:bg-gray-100 transition-colors"
          aria-label="Upravit úkol"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => onDelete(item.id)}
          className="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          aria-label="Smazat úkol"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
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
      // Null due_date goes to "Bez termínu"
      if (!item.due_date) {
        groupId = 'noDueDate';
        label = 'Bez termínu';
      } else {
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
