'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Plus, Trash2, Check, X, PiggyBank } from 'lucide-react';
import { Button, Card } from '@/components/ui';

interface BudgetItem {
  id: string;
  category: string;
  name: string;
  estimated_cost: number | null;
  actual_cost: number | null;
  paid: boolean;
}

interface BudgetViewProps {
  items: BudgetItem[];
  totalBudget: number | null;
  coupleId: string;
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

export function BudgetView({ items: initialItems, totalBudget, coupleId }: BudgetViewProps) {
  const [items, setItems] = useState(initialItems);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({
    category: 'venue',
    name: '',
    estimated_cost: '',
    actual_cost: '',
  });

  const supabase = createClient();

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
    };

    const { data, error } = await supabase
      .from('budget_items')
      .insert(itemToInsert)
      .select()
      .single();

    if (!error && data) {
      setItems([...items, data]);
      setNewItem({ category: 'venue', name: '', estimated_cost: '', actual_cost: '' });
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

  // Seskupit podle kategorie
  const groupedItems = BUDGET_CATEGORIES.map((cat) => ({
    ...cat,
    items: items.filter((item) => item.category === cat.value),
    total: items
      .filter((item) => item.category === cat.value)
      .reduce((sum, item) => sum + (item.actual_cost || item.estimated_cost || 0), 0),
  })).filter((group) => group.items.length > 0);

  return (
    <div>
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

      {/* Add button */}
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
                <select
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                  className="px-3 py-2 border rounded-lg"
                >
                  {BUDGET_CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.icon} {cat.label}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Název položky"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  className="px-3 py-2 border rounded-lg"
                />
                <input
                  type="number"
                  placeholder="Odhad (Kč)"
                  value={newItem.estimated_cost}
                  onChange={(e) => setNewItem({ ...newItem, estimated_cost: e.target.value })}
                  className="px-3 py-2 border rounded-lg"
                />
                <input
                  type="number"
                  placeholder="Skutečná cena (Kč)"
                  value={newItem.actual_cost}
                  onChange={(e) => setNewItem({ ...newItem, actual_cost: e.target.value })}
                  className="px-3 py-2 border rounded-lg"
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
      {groupedItems.length === 0 ? (
        <Card>
          <Card.Body>
            <div className="text-center py-8">
              <PiggyBank className="w-12 h-12 mx-auto mb-4 text-[var(--color-text-light)] opacity-50" />
              <p className="text-[var(--color-text-light)]">
                Zatím nemáte žádné položky v rozpočtu
              </p>
            </div>
          </Card.Body>
        </Card>
      ) : (
        <div className="space-y-4">
          {groupedItems.map((group) => (
            <Card key={group.value} className="overflow-hidden">
              <Card.Header className="bg-[var(--color-secondary)] flex justify-between items-center">
                <span className="font-medium">
                  {group.icon} {group.label}
                </span>
                <span className="text-sm text-[var(--color-text-light)]">
                  {group.total.toLocaleString('cs-CZ')} Kč
                </span>
              </Card.Header>
              <div className="divide-y">
                {group.items.map((item) => (
                  <div key={item.id} className="px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => togglePaid(item.id, !item.paid)}
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          item.paid
                            ? 'bg-green-500 border-green-500'
                            : 'border-gray-300'
                        }`}
                      >
                        {item.paid && <Check className="w-3 h-3 text-white" />}
                      </button>
                      <span className={item.paid ? 'line-through text-gray-400' : ''}>
                        {item.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
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
                        onClick={() => deleteItem(item.id)}
                        aria-label="Smazat položku"
                        leadingIcon={<Trash2 className="w-4 h-4" />}
                        className="text-gray-400 hover:text-red-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
