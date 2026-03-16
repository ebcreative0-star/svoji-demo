'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Check, X, PiggyBank, Sparkles, Pencil } from 'lucide-react';
import { Button, Card, Badge, Input, Select } from '@/components/ui';
import { TagInput } from './TagInput';
import { getTagColor } from '@/lib/tags';
import { cn } from '@/lib/cn';

interface BudgetItem {
  id: string;
  category: string;
  name: string;
  estimated_cost: number | null;
  actual_cost: number | null;
  paid: boolean;
  source?: string;
  tags?: string[];
}

interface BudgetViewProps {
  items: BudgetItem[];
  totalBudget: number | null;
  coupleId: string;
  highlight?: string;
}

const BUDGET_CATEGORIES = [
  { value: 'venue', label: 'Místo', icon: '🏰' },
  { value: 'catering', label: 'Catering', icon: '🍽️' },
  { value: 'photo', label: 'Foto/Video', icon: '📸' },
  { value: 'music', label: 'Hudba', icon: '🎵' },
  { value: 'flowers', label: 'Květiny', icon: '💐' },
  { value: 'attire', label: 'Oblečení', icon: '👗' },
  { value: 'rings', label: 'Prsteny', icon: '💍' },
  { value: 'decor', label: 'Dekorace', icon: '✨' },
  { value: 'cake', label: 'Dort', icon: '🎂' },
  { value: 'transport', label: 'Doprava', icon: '🚗' },
  { value: 'honeymoon', label: 'Líbánky', icon: '✈️' },
  { value: 'other', label: 'Ostatní', icon: '📦' },
];

const BUDGET_CATEGORY_INTENT: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'neutral'> = {
  venue: 'info',
  catering: 'warning',
  photo: 'info',
  music: 'neutral',
  flowers: 'success',
  attire: 'neutral',
  rings: 'warning',
  decor: 'info',
  cake: 'warning',
  transport: 'neutral',
  honeymoon: 'success',
  other: 'neutral',
};

export function BudgetView({ items: initialItems, totalBudget, coupleId, highlight }: BudgetViewProps) {
  const [items, setItems] = useState(initialItems);
  const router = useRouter();
  const pathname = usePathname();

  // Scroll highlighted item into view and clean up URL param after animation
  useEffect(() => {
    if (!highlight) return;
    const el = document.getElementById(`item-${highlight}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    const timer = setTimeout(() => {
      router.replace(pathname, { scroll: false });
    }, 2000);
    return () => clearTimeout(timer);
  }, [highlight, pathname, router]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({
    category: 'venue',
    name: '',
    estimated_cost: '',
    actual_cost: '',
    tags: [] as string[],
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Partial<BudgetItem>>({});

  const supabase = createClient();

  // Derive existing tags from all items for autocomplete
  const existingTags = [...new Set(items.flatMap((i) => i.tags || []))];

  // Výpočty
  const totalEstimated = items.reduce((sum, item) => sum + (item.estimated_cost || 0), 0);
  const totalActual = items.reduce((sum, item) => sum + (item.actual_cost || 0), 0);
  const totalPaid = items
    .filter((item) => item.paid)
    .reduce((sum, item) => sum + (item.actual_cost || item.estimated_cost || 0), 0);
  const remaining = (totalBudget || 0) - totalActual;

  const addItem = async () => {
    if (!newItem.name) return;

    const itemToInsert = {
      couple_id: coupleId,
      category: newItem.category,
      name: newItem.name,
      estimated_cost: newItem.estimated_cost ? parseFloat(newItem.estimated_cost) : null,
      actual_cost: newItem.actual_cost ? parseFloat(newItem.actual_cost) : null,
      paid: false,
      tags: newItem.tags,
    };

    const { data, error } = await supabase
      .from('budget_items')
      .insert(itemToInsert)
      .select()
      .single();

    if (!error && data) {
      setItems([...items, data]);
      setNewItem({ category: 'venue', name: '', estimated_cost: '', actual_cost: '', tags: [] });
      setShowAddForm(false);
    }
  };

  const deleteItem = async (id: string) => {
    await supabase.from('budget_items').delete().eq('id', id);
    setItems(items.filter((item) => item.id !== id));
  };

  const togglePaid = async (id: string, paid: boolean) => {
    await supabase.from('budget_items').update({ paid }).eq('id', id);
    setItems(items.map((item) => (item.id === id ? { ...item, paid } : item)));
  };

  const startEdit = (item: BudgetItem) => {
    setEditingId(item.id);
    setEditDraft({ ...item });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditDraft({});
  };

  const saveEdit = async () => {
    if (!editingId || !editDraft) return;

    // Optimistic update
    const prevItems = items;
    setItems(items.map((item) => (item.id === editingId ? { ...item, ...editDraft } as BudgetItem : item)));
    setEditingId(null);

    const { error } = await supabase
      .from('budget_items')
      .update({
        name: editDraft.name,
        estimated_cost: editDraft.estimated_cost ?? null,
        actual_cost: editDraft.actual_cost ?? null,
        category: editDraft.category,
        paid: editDraft.paid,
        tags: editDraft.tags ?? [],
      })
      .eq('id', editingId);

    if (error) {
      // Revert on error
      setItems(prevItems);
    }
  };

  // Seskupit podle kategorie
  const knownCategoryValues = new Set(BUDGET_CATEGORIES.map((cat) => cat.value));
  const groupedItems = BUDGET_CATEGORIES.map((cat) => ({
    ...cat,
    items: items.filter((item) => item.category === cat.value),
    total: items
      .filter((item) => item.category === cat.value)
      .reduce((sum, item) => sum + (item.actual_cost || item.estimated_cost || 0), 0),
  })).filter((group) => group.items.length > 0);

  // Catch-all: merge items with unknown categories into 'other'
  const uncategorizedItems = items.filter((item) => !knownCategoryValues.has(item.category));
  if (uncategorizedItems.length > 0) {
    const otherGroup = groupedItems.find((g) => g.value === 'other');
    if (otherGroup) {
      otherGroup.items = [...otherGroup.items, ...uncategorizedItems];
      otherGroup.total += uncategorizedItems.reduce(
        (sum, item) => sum + (item.actual_cost || item.estimated_cost || 0),
        0
      );
    } else {
      const otherCat = BUDGET_CATEGORIES.find((cat) => cat.value === 'other')!;
      groupedItems.push({
        ...otherCat,
        items: uncategorizedItems,
        total: uncategorizedItems.reduce(
          (sum, item) => sum + (item.actual_cost || item.estimated_cost || 0),
          0
        ),
      });
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
      {/* Overview cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <Card.Body>
            <div className="text-sm text-[var(--color-text-light)] mb-1">Celkový rozpočet</div>
            <div className="text-2xl font-medium">
              {totalBudget ? `${totalBudget.toLocaleString('cs-CZ')} Kč` : 'Nenastaveno'}
            </div>
          </Card.Body>
        </Card>
        <Card>
          <Card.Body>
            <div className="text-sm text-[var(--color-text-light)] mb-1">Plánované výdaje</div>
            <div className="text-2xl font-medium">{totalEstimated.toLocaleString('cs-CZ')} Kč</div>
          </Card.Body>
        </Card>
        <Card>
          <Card.Body>
            <div className="text-sm text-[var(--color-text-light)] mb-1">Skutečné výdaje</div>
            <div className="text-2xl font-medium">{totalActual.toLocaleString('cs-CZ')} Kč</div>
          </Card.Body>
        </Card>
        <Card className={remaining < 0 ? 'border-l-4 border-red-500' : ''}>
          <Card.Body>
            <div className="text-sm text-[var(--color-text-light)] mb-1">Zbývá</div>
            <div className={`text-2xl font-medium ${remaining < 0 ? 'text-red-600' : ''}`}>
              {remaining.toLocaleString('cs-CZ')} Kč
            </div>
          </Card.Body>
        </Card>
      </div>

      {/* Progress bar */}
      {totalBudget && (
        <Card className="mb-8">
          <Card.Body>
            <div className="flex justify-between text-sm mb-2">
              <span>Využitý rozpočet</span>
              <span>{Math.round((totalActual / totalBudget) * 100)}%</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  totalActual > totalBudget ? 'bg-red-500' : 'bg-[var(--color-primary)]'
                }`}
                style={{ width: `${Math.min((totalActual / totalBudget) * 100, 100)}%` }}
              />
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Add button / form */}
      <div className="mb-6">
        {!showAddForm ? (
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowAddForm(true)}
            leadingIcon={<Plus className="w-4 h-4" />}
          >
            Přidat položku
          </Button>
        ) : (
          <Card>
            <Card.Body>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <Select
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                >
                  {BUDGET_CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.icon} {cat.label}
                    </option>
                  ))}
                </Select>
                <Input
                  type="text"
                  placeholder="Název položky"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                />
                <Input
                  type="number"
                  placeholder="Odhad (Kč)"
                  value={newItem.estimated_cost}
                  onChange={(e) => setNewItem({ ...newItem, estimated_cost: e.target.value })}
                />
                <Input
                  type="number"
                  placeholder="Skutečná cena (Kč)"
                  value={newItem.actual_cost}
                  onChange={(e) => setNewItem({ ...newItem, actual_cost: e.target.value })}
                />
              </div>
              <div className="mb-4">
                <TagInput
                  value={newItem.tags}
                  onChange={(tags) => setNewItem({ ...newItem, tags })}
                  existingTags={existingTags}
                  placeholder="Přidat štítek..."
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={addItem}
                  leadingIcon={<Check className="w-4 h-4" />}
                >
                  Přidat
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowAddForm(false)}
                  leadingIcon={<X className="w-4 h-4" />}
                >
                  Zrušit
                </Button>
              </div>
            </Card.Body>
          </Card>
        )}
      </div>

      {/* Items by category */}
      {items.length === 0 ? (
        <Card>
          <Card.Body>
            <div className="text-center py-12">
              <PiggyBank className="w-16 h-16 mx-auto mb-4 text-[var(--color-text-light)] opacity-30" />
              <h3 className="text-lg font-medium text-[var(--color-text)] mb-2">
                Zatím žádný rozpočet
              </h3>
              <p className="text-sm text-[var(--color-text-light)] mb-6">
                Začněte přidávat položky do svého rozpočtu
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setShowAddForm(true)}
                  leadingIcon={<Plus className="w-4 h-4" />}
                >
                  Přidat první položku
                </Button>
                <a
                  href="/chat"
                  className="text-sm text-[var(--color-text-light)] hover:text-[var(--color-primary)] transition-colors"
                >
                  Nebo to nechte na AI
                </a>
              </div>
            </div>
          </Card.Body>
        </Card>
      ) : (
        <div className="space-y-4">
          {groupedItems.map((group) => (
            <Card key={group.value} className="overflow-hidden">
              <Card.Header className="bg-[var(--color-secondary)] flex justify-between items-center">
                <Badge intent={BUDGET_CATEGORY_INTENT[group.value] ?? 'neutral'} size="sm">
                  {group.icon} {group.label}
                </Badge>
                <span className="text-sm text-[var(--color-text-light)]">
                  {group.total.toLocaleString('cs-CZ')} Kč
                </span>
              </Card.Header>
              <div className="divide-y">
                {group.items.map((item) => (
                  <motion.div
                    key={item.id}
                    id={`item-${item.id}`}
                    animate={
                      highlight === item.id
                        ? { backgroundColor: ['#FEF9C3', 'rgba(255,255,255,0)'] }
                        : {}
                    }
                    transition={{ duration: 1.5 }}
                  >
                    {/* Item row */}
                    <div className="px-4 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <button
                          onClick={() => togglePaid(item.id, !item.paid)}
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                            item.paid
                              ? 'bg-green-500 border-green-500'
                              : 'border-gray-300'
                          }`}
                        >
                          {item.paid && <Check className="w-3 h-3 text-white" />}
                        </button>
                        <div className="min-w-0">
                          <span className={`flex items-center gap-1 ${item.paid ? 'line-through text-gray-400' : ''}`}>
                            {item.name}
                            {item.source === 'ai' && (
                              <Sparkles
                                className="w-3 h-3 text-[var(--color-accent)] flex-shrink-0"
                                aria-label="Přidáno AI asistentem"
                              />
                            )}
                          </span>
                          {(item.tags || []).length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {(item.tags || []).map((tag) => {
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
                                  </span>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 flex-shrink-0">
                        <div className="text-right">
                          {item.actual_cost ? (
                            <span className="font-medium">
                              {item.actual_cost.toLocaleString('cs-CZ')} Kč
                            </span>
                          ) : item.estimated_cost ? (
                            <span className="text-[var(--color-text-light)]">
                              ~{item.estimated_cost.toLocaleString('cs-CZ')} Kč
                            </span>
                          ) : null}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEdit(item)}
                          aria-label="Upravit položku"
                          leadingIcon={<Pencil className="w-4 h-4" />}
                          className="text-gray-400 hover:text-[var(--color-primary)]"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteItem(item.id)}
                          aria-label="Smazat položku"
                          leadingIcon={<Trash2 className="w-4 h-4" />}
                          className="text-gray-400 hover:text-red-500"
                        />
                      </div>
                    </div>

                    {/* Inline edit form */}
                    <AnimatePresence>
                      {editingId === item.id && (
                        <motion.div
                          key={`edit-${item.id}`}
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 pt-2 bg-[var(--color-secondary)] border-t border-gray-100">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                              <div>
                                <label className="block text-xs text-[var(--color-text-light)] mb-1">Název</label>
                                <Input
                                  type="text"
                                  value={editDraft.name ?? ''}
                                  onChange={(e) => setEditDraft({ ...editDraft, name: e.target.value })}
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-[var(--color-text-light)] mb-1">Kategorie</label>
                                <Select
                                  value={editDraft.category ?? 'other'}
                                  onChange={(e) => setEditDraft({ ...editDraft, category: e.target.value })}
                                >
                                  {BUDGET_CATEGORIES.map((cat) => (
                                    <option key={cat.value} value={cat.value}>
                                      {cat.icon} {cat.label}
                                    </option>
                                  ))}
                                </Select>
                              </div>
                              <div>
                                <label className="block text-xs text-[var(--color-text-light)] mb-1">Odhad (Kč)</label>
                                <Input
                                  type="number"
                                  value={editDraft.estimated_cost ?? ''}
                                  onChange={(e) =>
                                    setEditDraft({
                                      ...editDraft,
                                      estimated_cost: e.target.value ? parseFloat(e.target.value) : null,
                                    })
                                  }
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-[var(--color-text-light)] mb-1">Skutečná cena (Kč)</label>
                                <Input
                                  type="number"
                                  value={editDraft.actual_cost ?? ''}
                                  onChange={(e) =>
                                    setEditDraft({
                                      ...editDraft,
                                      actual_cost: e.target.value ? parseFloat(e.target.value) : null,
                                    })
                                  }
                                />
                              </div>
                            </div>
                            <div className="mb-3">
                              <label className="block text-xs text-[var(--color-text-light)] mb-1">Zaplaceno</label>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={editDraft.paid ?? false}
                                  onChange={(e) => setEditDraft({ ...editDraft, paid: e.target.checked })}
                                  className="w-4 h-4 rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                                />
                                <span className="text-sm text-[var(--color-text)]">Zaplaceno</span>
                              </label>
                            </div>
                            <div className="mb-4">
                              <label className="block text-xs text-[var(--color-text-light)] mb-1">Štítky</label>
                              <TagInput
                                value={editDraft.tags ?? []}
                                onChange={(tags) => setEditDraft({ ...editDraft, tags })}
                                existingTags={existingTags}
                                placeholder="Přidat štítek..."
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={saveEdit}
                                leadingIcon={<Check className="w-4 h-4" />}
                              >
                                Uložit
                              </Button>
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={cancelEdit}
                                leadingIcon={<X className="w-4 h-4" />}
                              >
                                Zrušit
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </motion.div>
  );
}
