'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
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
} from 'lucide-react';

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
}

interface GuestsViewProps {
  guests: Guest[];
  coupleId: string;
}

export function GuestsView({ guests: initialGuests, coupleId }: GuestsViewProps) {
  const [guests, setGuests] = useState(initialGuests);
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
  });

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
    };

    const { data, error } = await supabase
      .from('guests')
      .insert(guestToInsert)
      .select()
      .single();

    if (!error && data) {
      setGuests([...guests, data]);
      setNewGuest({
        name: '',
        email: '',
        phone: '',
        group_name: '',
        plus_one: false,
        dietary_requirements: '',
        notes: '',
      });
      setShowAddForm(false);
    }
  };

  const deleteGuest = async (id: string) => {
    await supabase.from('guests').delete().eq('id', id);
    setGuests(guests.filter((g) => g.id !== id));
  };

  const updateRsvpStatus = async (id: string, status: 'pending' | 'confirmed' | 'declined') => {
    await supabase
      .from('guests')
      .update({ rsvp_status: status, rsvp_date: status !== 'pending' ? new Date().toISOString() : null })
      .eq('id', id);
    setGuests(guests.map((g) => (g.id === id ? { ...g, rsvp_status: status } : g)));
  };

  const exportToCsv = () => {
    const headers = ['Jméno', 'Email', 'Telefon', 'Skupina', 'Plus one', 'Status', 'Strava', 'Poznámka'];
    const rows = guests.map((g) => [
      g.name,
      g.email || '',
      g.phone || '',
      g.group_name || '',
      g.plus_one ? 'Ano' : 'Ne',
      g.rsvp_status === 'confirmed' ? 'Potvrzeno' : g.rsvp_status === 'declined' ? 'Odmítnuto' : 'Čeká',
      g.dietary_requirements || '',
      g.notes || '',
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
    <div>
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center gap-2 text-sm text-[var(--color-text-light)] mb-1">
            <Users className="w-4 h-4" />
            Celkem
          </div>
          <div className="text-2xl font-medium">{stats.total}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center gap-2 text-sm text-green-600 mb-1">
            <UserCheck className="w-4 h-4" />
            Potvrzeno
          </div>
          <div className="text-2xl font-medium text-green-600">{stats.confirmed}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center gap-2 text-sm text-red-600 mb-1">
            <UserX className="w-4 h-4" />
            Odmítnuto
          </div>
          <div className="text-2xl font-medium text-red-600">{stats.declined}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center gap-2 text-sm text-amber-600 mb-1">
            <Clock className="w-4 h-4" />
            Čeká
          </div>
          <div className="text-2xl font-medium text-amber-600">{stats.pending}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-[var(--color-primary)]">
          <div className="text-sm text-[var(--color-text-light)] mb-1">Přijde celkem</div>
          <div className="text-2xl font-medium">{totalAttending}</div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-4 mb-6">
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-light)] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Přidat hosta
        </button>

        <button
          onClick={exportToCsv}
          className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>

        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Hledat hosty..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
            />
          </div>
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 border rounded-lg"
        >
          <option value="all">Všichni</option>
          <option value="confirmed">Potvrzení</option>
          <option value="pending">Čekající</option>
          <option value="declined">Odmítnutí</option>
        </select>
      </div>

      {/* Add form */}
      {showAddForm && (
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <h3 className="font-medium mb-4">Nový host</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <input
              type="text"
              placeholder="Jméno *"
              value={newGuest.name}
              onChange={(e) => setNewGuest({ ...newGuest, name: e.target.value })}
              className="px-3 py-2 border rounded-lg"
            />
            <input
              type="email"
              placeholder="Email"
              value={newGuest.email}
              onChange={(e) => setNewGuest({ ...newGuest, email: e.target.value })}
              className="px-3 py-2 border rounded-lg"
            />
            <input
              type="tel"
              placeholder="Telefon"
              value={newGuest.phone}
              onChange={(e) => setNewGuest({ ...newGuest, phone: e.target.value })}
              className="px-3 py-2 border rounded-lg"
            />
            <input
              type="text"
              placeholder="Skupina (např. Rodina nevěsty)"
              value={newGuest.group_name}
              onChange={(e) => setNewGuest({ ...newGuest, group_name: e.target.value })}
              className="px-3 py-2 border rounded-lg"
            />
            <input
              type="text"
              placeholder="Dietní požadavky"
              value={newGuest.dietary_requirements}
              onChange={(e) => setNewGuest({ ...newGuest, dietary_requirements: e.target.value })}
              className="px-3 py-2 border rounded-lg"
            />
            <label className="flex items-center gap-2 px-3 py-2">
              <input
                type="checkbox"
                checked={newGuest.plus_one}
                onChange={(e) => setNewGuest({ ...newGuest, plus_one: e.target.checked })}
                className="w-4 h-4"
              />
              <span>S doprovodem (+1)</span>
            </label>
          </div>
          <div className="flex gap-2">
            <button
              onClick={addGuest}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg"
            >
              <Check className="w-4 h-4" />
              Přidat
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="flex items-center gap-2 px-4 py-2 border rounded-lg"
            >
              <X className="w-4 h-4" />
              Zrušit
            </button>
          </div>
        </div>
      )}

      {/* Guest list */}
      {filteredGuests.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <Users className="w-12 h-12 mx-auto mb-4 text-[var(--color-text-light)] opacity-50" />
          <p className="text-[var(--color-text-light)]">
            {guests.length === 0 ? 'Zatím nemáte žádné hosty' : 'Žádní hosté nenalezeni'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-[var(--color-secondary)]">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">Jméno</th>
                <th className="px-4 py-3 text-left text-sm font-medium hidden md:table-cell">Skupina</th>
                <th className="px-4 py-3 text-left text-sm font-medium hidden md:table-cell">Kontakt</th>
                <th className="px-4 py-3 text-center text-sm font-medium">Status</th>
                <th className="px-4 py-3 text-right text-sm font-medium">Akce</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredGuests.map((guest) => (
                <tr key={guest.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium">{guest.name}</div>
                    {guest.plus_one && (
                      <span className="text-xs text-[var(--color-text-light)]">+1</span>
                    )}
                    {guest.dietary_requirements && (
                      <div className="text-xs text-amber-600">{guest.dietary_requirements}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--color-text-light)] hidden md:table-cell">
                    {guest.group_name || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm hidden md:table-cell">
                    {guest.email && <div>{guest.email}</div>}
                    {guest.phone && <div className="text-[var(--color-text-light)]">{guest.phone}</div>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center gap-1">
                      <button
                        onClick={() => updateRsvpStatus(guest.id, 'confirmed')}
                        className={`p-1.5 rounded ${
                          guest.rsvp_status === 'confirmed'
                            ? 'bg-green-100 text-green-600'
                            : 'text-gray-400 hover:bg-gray-100'
                        }`}
                        title="Potvrzeno"
                      >
                        <UserCheck className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => updateRsvpStatus(guest.id, 'pending')}
                        className={`p-1.5 rounded ${
                          guest.rsvp_status === 'pending'
                            ? 'bg-amber-100 text-amber-600'
                            : 'text-gray-400 hover:bg-gray-100'
                        }`}
                        title="Čeká"
                      >
                        <Clock className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => updateRsvpStatus(guest.id, 'declined')}
                        className={`p-1.5 rounded ${
                          guest.rsvp_status === 'declined'
                            ? 'bg-red-100 text-red-600'
                            : 'text-gray-400 hover:bg-gray-100'
                        }`}
                        title="Odmítnuto"
                      >
                        <UserX className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => deleteGuest(guest.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
