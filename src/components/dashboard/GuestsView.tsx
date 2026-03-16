'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Trash2,
  Check,
  X,
  Users,
  UserCheck,
  UserX,
  Clock,
  Download,
  Search,
  Pencil,
} from 'lucide-react';
import { Button, Card, Badge, Input, Select } from '@/components/ui';
import { TagInput } from './TagInput';
import { getTagColor } from '@/lib/tags';
import { cn } from '@/lib/cn';

const RSVP_INTENT: Record<string, 'success' | 'warning' | 'danger'> = {
  confirmed: 'success',
  pending: 'warning',
  declined: 'danger',
};

interface Guest {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  group_name: string | null;
  plus_one: boolean;
  dietary_requirements: string | null;
  rsvp_status: 'pending' | 'confirmed' | 'declined';
  notes: string | null;
  tags: string[];
}

interface GuestsViewProps {
  guests: Guest[];
  coupleId: string;
  highlight?: string;
}

export function GuestsView({ guests: initialGuests, coupleId, highlight }: GuestsViewProps) {
  const [guests, setGuests] = useState<Guest[]>(
    initialGuests.map((g) => ({ ...g, tags: g.tags || [] }))
  );
  const router = useRouter();
  const pathname = usePathname();

  // Scroll highlighted guest into view and clean up URL param after animation
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
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [newGuest, setNewGuest] = useState({
    name: '',
    email: '',
    phone: '',
    group_name: '',
    plus_one: false,
    dietary_requirements: '',
    notes: '',
    tags: [] as string[],
  });

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Partial<Guest>>({});

  const supabase = createClient();

  // Stats
  const stats = {
    total: guests.length,
    confirmed: guests.filter((g) => g.rsvp_status === 'confirmed').length,
    declined: guests.filter((g) => g.rsvp_status === 'declined').length,
    pending: guests.filter((g) => g.rsvp_status === 'pending').length,
    withPlusOne: guests.filter((g) => g.plus_one && g.rsvp_status === 'confirmed').length,
  };

  const totalAttending = stats.confirmed + stats.withPlusOne;

  // All existing tags for autocomplete
  const allTags = [...new Set(guests.flatMap((g) => g.tags || []))];

  // Filter guests
  const filteredGuests = guests.filter((guest) => {
    const matchesSearch =
      guest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guest.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guest.group_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || guest.rsvp_status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const addGuest = async () => {
    if (!newGuest.name) return;

    const guestToInsert = {
      couple_id: coupleId,
      name: newGuest.name,
      email: newGuest.email || null,
      phone: newGuest.phone || null,
      group_name: newGuest.group_name || null,
      plus_one: newGuest.plus_one,
      dietary_requirements: newGuest.dietary_requirements || null,
      notes: newGuest.notes || null,
      rsvp_status: 'pending' as const,
      tags: newGuest.tags,
    };

    const { data, error } = await supabase
      .from('guests')
      .insert(guestToInsert)
      .select()
      .single();

    if (!error && data) {
      setGuests([...guests, { ...data, tags: data.tags || [] }]);
      setNewGuest({
        name: '',
        email: '',
        phone: '',
        group_name: '',
        plus_one: false,
        dietary_requirements: '',
        notes: '',
        tags: [],
      });
      setShowAddForm(false);
    }
  };

  const deleteGuest = async (id: string) => {
    await supabase.from('guests').delete().eq('id', id);
    setGuests(guests.filter((g) => g.id !== id));
    if (editingId === id) setEditingId(null);
  };

  const updateRsvpStatus = async (id: string, status: 'pending' | 'confirmed' | 'declined') => {
    await supabase
      .from('guests')
      .update({ rsvp_status: status, rsvp_date: status !== 'pending' ? new Date().toISOString() : null })
      .eq('id', id);
    setGuests(guests.map((g) => (g.id === id ? { ...g, rsvp_status: status } : g)));
  };

  const startEdit = (guest: Guest) => {
    setEditingId(guest.id);
    setEditDraft({ ...guest });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditDraft({});
  };

  const saveEdit = async () => {
    if (!editingId || !editDraft) return;

    const update = {
      name: editDraft.name,
      email: editDraft.email || null,
      phone: editDraft.phone || null,
      group_name: editDraft.group_name || null,
      rsvp_status: editDraft.rsvp_status,
      dietary_requirements: editDraft.dietary_requirements || null,
      plus_one: editDraft.plus_one,
      notes: editDraft.notes || null,
      tags: editDraft.tags || [],
    };

    // Optimistic update
    setGuests(guests.map((g) => (g.id === editingId ? { ...g, ...update } as Guest : g)));
    setEditingId(null);

    const { error } = await supabase
      .from('guests')
      .update(update)
      .eq('id', editingId);

    if (error) {
      // Revert on error
      setGuests(initialGuests.map((g) => ({ ...g, tags: g.tags || [] })));
    }
  };

  const exportToCsv = () => {
    const headers = ['Jméno', 'Email', 'Telefon', 'Skupina', 'Plus one', 'Status', 'Strava', 'Poznámka', 'Štítky'];
    const rows = guests.map((g) => [
      g.name,
      g.email || '',
      g.phone || '',
      g.group_name || '',
      g.plus_one ? 'Ano' : 'Ne',
      g.rsvp_status === 'confirmed' ? 'Potvrzeno' : g.rsvp_status === 'declined' ? 'Odmítnuto' : 'Čeká',
      g.dietary_requirements || '',
      g.notes || '',
      (g.tags || []).join('; '),
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'seznam-hostu.csv';
    link.click();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <Card>
          <Card.Body>
            <div className="flex items-center gap-2 text-sm text-[var(--color-text-light)] mb-1">
              <Users className="w-4 h-4" />
              Celkem
            </div>
            <div className="text-2xl font-medium">{stats.total}</div>
          </Card.Body>
        </Card>
        <Card>
          <Card.Body>
            <div className="flex items-center gap-2 text-sm text-green-600 mb-1">
              <UserCheck className="w-4 h-4" />
              Potvrzeno
            </div>
            <div className="text-2xl font-medium text-green-600">{stats.confirmed}</div>
          </Card.Body>
        </Card>
        <Card>
          <Card.Body>
            <div className="flex items-center gap-2 text-sm text-red-600 mb-1">
              <UserX className="w-4 h-4" />
              Odmítnuto
            </div>
            <div className="text-2xl font-medium text-red-600">{stats.declined}</div>
          </Card.Body>
        </Card>
        <Card>
          <Card.Body>
            <div className="flex items-center gap-2 text-sm text-amber-600 mb-1">
              <Clock className="w-4 h-4" />
              Čeká
            </div>
            <div className="text-2xl font-medium text-amber-600">{stats.pending}</div>
          </Card.Body>
        </Card>
        <Card className="border-l-4 border-[var(--color-primary)]">
          <Card.Body>
            <div className="text-sm text-[var(--color-text-light)] mb-1">Přijde celkem</div>
            <div className="text-2xl font-medium">{totalAttending}</div>
          </Card.Body>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-4 mb-6">
        <Button
          variant="primary"
          size="sm"
          onClick={() => setShowAddForm(true)}
          leadingIcon={<Plus className="w-4 h-4" />}
        >
          Přidat hosta
        </Button>

        <Button
          variant="secondary"
          size="sm"
          onClick={exportToCsv}
          leadingIcon={<Download className="w-4 h-4" />}
        >
          Export CSV
        </Button>

        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-light)]" />
            <Input
              type="text"
              placeholder="Hledat hosty..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="w-auto"
        >
          <option value="all">Všichni</option>
          <option value="confirmed">Potvrzení</option>
          <option value="pending">Čekající</option>
          <option value="declined">Odmítnutí</option>
        </Select>
      </div>

      {/* Add form */}
      {showAddForm && (
        <Card className="mb-6">
          <Card.Body>
            <h3 className="font-medium mb-4">Nový host</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <Input
                type="text"
                placeholder="Jméno *"
                value={newGuest.name}
                onChange={(e) => setNewGuest({ ...newGuest, name: e.target.value })}
              />
              <Input
                type="email"
                placeholder="Email"
                value={newGuest.email}
                onChange={(e) => setNewGuest({ ...newGuest, email: e.target.value })}
              />
              <Input
                type="tel"
                placeholder="Telefon"
                value={newGuest.phone}
                onChange={(e) => setNewGuest({ ...newGuest, phone: e.target.value })}
              />
              <Input
                type="text"
                placeholder="Skupina (např. Rodina nevěsty)"
                value={newGuest.group_name}
                onChange={(e) => setNewGuest({ ...newGuest, group_name: e.target.value })}
              />
              <Input
                type="text"
                placeholder="Dietní požadavky"
                value={newGuest.dietary_requirements}
                onChange={(e) => setNewGuest({ ...newGuest, dietary_requirements: e.target.value })}
              />
              <label className="flex items-center gap-2 px-3 py-2">
                <input
                  type="checkbox"
                  checked={newGuest.plus_one}
                  onChange={(e) => setNewGuest({ ...newGuest, plus_one: e.target.checked })}
                  className="w-4 h-4 accent-[var(--color-primary)]"
                />
                <span className="text-sm text-[var(--color-text)]">S doprovodem (+1)</span>
              </label>
            </div>
            <div className="mb-4">
              <label className="text-sm text-[var(--color-text-light)] mb-1 block">Štítky</label>
              <TagInput
                value={newGuest.tags}
                onChange={(tags) => setNewGuest({ ...newGuest, tags })}
                existingTags={allTags}
                placeholder="Přidat štítek..."
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={addGuest}
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

      {/* Empty state */}
      {guests.length === 0 ? (
        <Card>
          <Card.Body>
            <div className="text-center py-12">
              <Users className="w-16 h-16 mx-auto mb-4 text-[var(--color-text-light)] opacity-30" />
              <h3 className="text-lg font-medium text-[var(--color-text)] mb-2">
                Zatím žádní hosté
              </h3>
              <p className="text-[var(--color-text-light)] mb-6">
                Začněte přidávat hosty na svatbu
              </p>
              <div className="flex flex-col items-center gap-3">
                <Button
                  variant="primary"
                  onClick={() => setShowAddForm(true)}
                  leadingIcon={<Plus className="w-4 h-4" />}
                >
                  Přidat prvního hosta
                </Button>
                <a
                  href="/chat"
                  className="text-sm text-[var(--color-primary)] hover:underline"
                >
                  Nebo to nechte na AI
                </a>
              </div>
            </div>
          </Card.Body>
        </Card>
      ) : (
        /* Guest list - div-based layout */
        <Card className="overflow-hidden">
          {/* Header row */}
          <div className="hidden md:grid md:grid-cols-[1fr_140px_110px_110px_88px] gap-4 px-4 py-2 text-sm font-medium text-[var(--color-text-light)] border-b bg-[var(--color-secondary)]">
            <div>Jméno</div>
            <div>Skupina</div>
            <div>RSVP</div>
            <div>Diety</div>
            <div className="text-right">Akce</div>
          </div>

          {/* Guest rows */}
          <div className="divide-y">
            {filteredGuests.map((guest) => (
              <motion.div
                key={guest.id}
                id={`item-${guest.id}`}
                animate={
                  highlight === guest.id
                    ? { backgroundColor: ['#FEF9C3', 'rgba(255,255,255,0)'] }
                    : {}
                }
                transition={{ duration: 1.5 }}
              >
                {/* Guest row */}
                <div className="grid grid-cols-1 md:grid-cols-[1fr_140px_110px_110px_88px] gap-2 md:gap-4 items-center px-4 py-3 hover:bg-[var(--color-bg-warm)] transition-colors">
                  {/* Name + tags */}
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium">{guest.name}</span>
                      {/* RSVP badge on mobile */}
                      <span className="md:hidden">
                        <Badge intent={RSVP_INTENT[guest.rsvp_status]} dot size="sm">
                          {guest.rsvp_status === 'confirmed' ? 'Potvrzeno' : guest.rsvp_status === 'declined' ? 'Odmítnuto' : 'Čeká'}
                        </Badge>
                      </span>
                      {guest.plus_one && (
                        <span className="text-xs text-[var(--color-text-light)]">+1</span>
                      )}
                    </div>
                    {/* Tags */}
                    {guest.tags && guest.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {guest.tags.map((tag) => {
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
                    )}
                  </div>

                  {/* Group */}
                  <div className="hidden md:block text-sm text-[var(--color-text-light)]">
                    {guest.group_name || <span className="opacity-40">-</span>}
                  </div>

                  {/* RSVP buttons (desktop) */}
                  <div className="hidden md:flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => updateRsvpStatus(guest.id, 'confirmed')}
                      aria-label="Potvrzeno"
                      leadingIcon={<UserCheck className="w-4 h-4" />}
                      className={guest.rsvp_status === 'confirmed' ? 'bg-green-100 text-green-600 hover:bg-green-100' : 'text-gray-400'}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => updateRsvpStatus(guest.id, 'pending')}
                      aria-label="Čeká"
                      leadingIcon={<Clock className="w-4 h-4" />}
                      className={guest.rsvp_status === 'pending' ? 'bg-amber-100 text-amber-600 hover:bg-amber-100' : 'text-gray-400'}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => updateRsvpStatus(guest.id, 'declined')}
                      aria-label="Odmítnuto"
                      leadingIcon={<UserX className="w-4 h-4" />}
                      className={guest.rsvp_status === 'declined' ? 'bg-red-100 text-red-600 hover:bg-red-100' : 'text-gray-400'}
                    />
                  </div>

                  {/* Dietary (desktop) */}
                  <div className="hidden md:block text-sm text-amber-600 truncate">
                    {guest.dietary_requirements || <span className="text-[var(--color-text-light)] opacity-40">-</span>}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-1">
                    {/* RSVP buttons on mobile */}
                    <div className="flex md:hidden gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => updateRsvpStatus(guest.id, 'confirmed')}
                        aria-label="Potvrzeno"
                        leadingIcon={<UserCheck className="w-4 h-4" />}
                        className={guest.rsvp_status === 'confirmed' ? 'bg-green-100 text-green-600 hover:bg-green-100' : 'text-gray-400'}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => updateRsvpStatus(guest.id, 'pending')}
                        aria-label="Čeká"
                        leadingIcon={<Clock className="w-4 h-4" />}
                        className={guest.rsvp_status === 'pending' ? 'bg-amber-100 text-amber-600 hover:bg-amber-100' : 'text-gray-400'}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => updateRsvpStatus(guest.id, 'declined')}
                        aria-label="Odmítnuto"
                        leadingIcon={<UserX className="w-4 h-4" />}
                        className={guest.rsvp_status === 'declined' ? 'bg-red-100 text-red-600 hover:bg-red-100' : 'text-gray-400'}
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => editingId === guest.id ? cancelEdit() : startEdit(guest)}
                      aria-label="Upravit hosta"
                      leadingIcon={<Pencil className="w-4 h-4" />}
                      className={editingId === guest.id ? 'text-[var(--color-primary)]' : 'text-gray-400 hover:text-[var(--color-primary)]'}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteGuest(guest.id)}
                      aria-label="Smazat hosta"
                      leadingIcon={<Trash2 className="w-4 h-4" />}
                      className="text-gray-400 hover:text-red-500"
                    />
                  </div>
                </div>

                {/* Expand-in-row edit form */}
                <AnimatePresence>
                  {editingId === guest.id && (
                    <motion.div
                      key="edit-form"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div className="px-4 pb-4 pt-2 bg-[var(--color-secondary)] border-b">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                          <Input
                            type="text"
                            placeholder="Jméno *"
                            value={editDraft.name || ''}
                            onChange={(e) => setEditDraft({ ...editDraft, name: e.target.value })}
                          />
                          <Input
                            type="email"
                            placeholder="Email"
                            value={editDraft.email || ''}
                            onChange={(e) => setEditDraft({ ...editDraft, email: e.target.value })}
                          />
                          <Input
                            type="tel"
                            placeholder="Telefon"
                            value={editDraft.phone || ''}
                            onChange={(e) => setEditDraft({ ...editDraft, phone: e.target.value })}
                          />
                          <Input
                            type="text"
                            placeholder="Skupina"
                            value={editDraft.group_name || ''}
                            onChange={(e) => setEditDraft({ ...editDraft, group_name: e.target.value })}
                          />
                          <Select
                            value={editDraft.rsvp_status || 'pending'}
                            onChange={(e) =>
                              setEditDraft({
                                ...editDraft,
                                rsvp_status: e.target.value as 'pending' | 'confirmed' | 'declined',
                              })
                            }
                          >
                            <option value="pending">Čeká</option>
                            <option value="confirmed">Potvrzeno</option>
                            <option value="declined">Odmítnuto</option>
                          </Select>
                          <Input
                            type="text"
                            placeholder="Dietní požadavky"
                            value={editDraft.dietary_requirements || ''}
                            onChange={(e) =>
                              setEditDraft({ ...editDraft, dietary_requirements: e.target.value })
                            }
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                          <label className="flex items-center gap-2 px-3 py-2">
                            <input
                              type="checkbox"
                              checked={editDraft.plus_one || false}
                              onChange={(e) =>
                                setEditDraft({ ...editDraft, plus_one: e.target.checked })
                              }
                              className="w-4 h-4 accent-[var(--color-primary)]"
                            />
                            <span className="text-sm text-[var(--color-text)]">S doprovodem (+1)</span>
                          </label>
                          <textarea
                            placeholder="Poznámka"
                            value={editDraft.notes || ''}
                            onChange={(e) => setEditDraft({ ...editDraft, notes: e.target.value })}
                            rows={2}
                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400"
                          />
                        </div>
                        <div className="mb-3">
                          <label className="text-sm text-[var(--color-text-light)] mb-1 block">Štítky</label>
                          <TagInput
                            value={editDraft.tags || []}
                            onChange={(tags) => setEditDraft({ ...editDraft, tags })}
                            existingTags={allTags}
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
      )}
    </motion.div>
  );
}
