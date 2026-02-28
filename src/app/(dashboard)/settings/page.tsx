'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Loader2, Save, Trash2, Globe, ExternalLink, Copy, Check } from 'lucide-react';
import Link from 'next/link';

interface Website {
  id: string;
  slug: string;
  headline: string;
  subheadline: string;
  story: string | null;
  published: boolean;
  show_timeline: boolean;
  show_gallery: boolean;
  show_locations: boolean;
  show_rsvp: boolean;
  show_contacts: boolean;
  show_dress_code: boolean;
  dress_code_description: string | null;
  rsvp_message: string | null;
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingWebsite, setSavingWebsite] = useState(false);
  const [couple, setCouple] = useState({
    partner1_name: '',
    partner2_name: '',
    wedding_date: '',
    wedding_size: '',
    budget_total: '',
  });
  const [website, setWebsite] = useState<Website | null>(null);
  const [message, setMessage] = useState('');
  const [websiteMessage, setWebsiteMessage] = useState('');
  const [copied, setCopied] = useState(false);

  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }

    // Load couple data
    const { data: coupleData } = await supabase
      .from('couples')
      .select('*')
      .eq('id', user.id)
      .single();

    if (coupleData) {
      setCouple({
        partner1_name: coupleData.partner1_name || '',
        partner2_name: coupleData.partner2_name || '',
        wedding_date: coupleData.wedding_date || '',
        wedding_size: coupleData.wedding_size || '',
        budget_total: coupleData.budget_total?.toString() || '',
      });
    }

    // Load website data
    const { data: websiteData } = await supabase
      .from('wedding_websites')
      .select('*')
      .eq('couple_id', user.id)
      .single();

    if (websiteData) {
      setWebsite(websiteData);
    }

    setLoading(false);
  };

  const saveSettings = async () => {
    setSaving(true);
    setMessage('');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('couples')
      .update({
        partner1_name: couple.partner1_name,
        partner2_name: couple.partner2_name,
        wedding_date: couple.wedding_date,
        wedding_size: couple.wedding_size,
        budget_total: couple.budget_total ? parseFloat(couple.budget_total) : null,
      })
      .eq('id', user.id);

    if (error) {
      setMessage('Chyba při ukládání');
    } else {
      setMessage('Uloženo');
      setTimeout(() => setMessage(''), 3000);
    }
    setSaving(false);
  };

  const createWebsite = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Generate slug from names
    const slug = `${couple.partner1_name.toLowerCase()}-${couple.partner2_name.toLowerCase()}`
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 50);

    const { data, error } = await supabase
      .from('wedding_websites')
      .insert({
        couple_id: user.id,
        slug,
        headline: 'Bereme se!',
        subheadline: 'A rádi bychom to oslavili s vámi',
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        // Duplicate slug - add random suffix
        const newSlug = `${slug}-${Math.random().toString(36).substring(2, 6)}`;
        const { data: retryData } = await supabase
          .from('wedding_websites')
          .insert({
            couple_id: user.id,
            slug: newSlug,
            headline: 'Bereme se!',
            subheadline: 'A rádi bychom to oslavili s vámi',
          })
          .select()
          .single();
        if (retryData) setWebsite(retryData);
      }
    } else if (data) {
      setWebsite(data);
    }
  };

  const saveWebsite = async () => {
    if (!website) return;
    setSavingWebsite(true);
    setWebsiteMessage('');

    const { error } = await supabase
      .from('wedding_websites')
      .update({
        slug: website.slug,
        headline: website.headline,
        subheadline: website.subheadline,
        story: website.story,
        published: website.published,
        show_timeline: website.show_timeline,
        show_gallery: website.show_gallery,
        show_locations: website.show_locations,
        show_rsvp: website.show_rsvp,
        show_contacts: website.show_contacts,
        show_dress_code: website.show_dress_code,
        dress_code_description: website.dress_code_description,
        rsvp_message: website.rsvp_message,
      })
      .eq('id', website.id);

    if (error) {
      setWebsiteMessage('Chyba při ukládání');
    } else {
      setWebsiteMessage('Uloženo');
      setTimeout(() => setWebsiteMessage(''), 3000);
    }
    setSavingWebsite(false);
  };

  const copyLink = () => {
    if (!website) return;
    const url = `${window.location.origin}/w/${website.slug}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const deleteAccount = async () => {
    if (!confirm('Opravdu chcete smazat účet? Tato akce je nevratná.')) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Smazat data
    await supabase.from('wedding_websites').delete().eq('couple_id', user.id);
    await supabase.from('checklist_items').delete().eq('couple_id', user.id);
    await supabase.from('budget_items').delete().eq('couple_id', user.id);
    await supabase.from('guests').delete().eq('couple_id', user.id);
    await supabase.from('chat_messages').delete().eq('couple_id', user.id);
    await supabase.from('couples').delete().eq('id', user.id);

    // Odhlásit
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-serif mb-8">Nastavení</h1>

      {/* Wedding info */}
      <div className="bg-white rounded-lg shadow-sm p-6 space-y-6 mb-8">
        <h2 className="text-lg font-medium">Údaje o svatbě</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Partner 1</label>
            <input
              type="text"
              value={couple.partner1_name}
              onChange={(e) => setCouple({ ...couple, partner1_name: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Partner 2</label>
            <input
              type="text"
              value={couple.partner2_name}
              onChange={(e) => setCouple({ ...couple, partner2_name: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Datum svatby</label>
            <input
              type="date"
              value={couple.wedding_date}
              onChange={(e) => setCouple({ ...couple, wedding_date: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Velikost svatby</label>
            <select
              value={couple.wedding_size}
              onChange={(e) => setCouple({ ...couple, wedding_size: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="small">Komorní (do 30 hostů)</option>
              <option value="medium">Střední (30-80 hostů)</option>
              <option value="large">Velká (80+ hostů)</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">Rozpočet (Kč)</label>
            <input
              type="number"
              value={couple.budget_total}
              onChange={(e) => setCouple({ ...couple, budget_total: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="150000"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={saveSettings}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-light)] transition-colors disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Uložit změny
          </button>
          {message && (
            <span className={message === 'Uloženo' ? 'text-green-600' : 'text-red-600'}>
              {message}
            </span>
          )}
        </div>
      </div>

      {/* Wedding website */}
      <div className="bg-white rounded-lg shadow-sm p-6 space-y-6 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-[var(--color-primary)]" />
            <h2 className="text-lg font-medium">Svatební web pro hosty</h2>
          </div>
          {website && (
            <Link
              href={`/w/${website.slug}`}
              target="_blank"
              className="flex items-center gap-1 text-sm text-[var(--color-primary)] hover:underline"
            >
              Náhled <ExternalLink className="w-3 h-3" />
            </Link>
          )}
        </div>

        {!website ? (
          <div className="text-center py-8">
            <p className="text-[var(--color-text-light)] mb-4">
              Vytvořte si krásný svatební web, který můžete sdílet s hosty.
            </p>
            <button
              onClick={createWebsite}
              className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-light)] transition-colors"
            >
              Vytvořit svatební web
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* URL */}
            <div>
              <label className="block text-sm font-medium mb-2">Adresa webu</label>
              <div className="flex gap-2">
                <div className="flex-1 flex items-center bg-gray-50 border rounded-lg px-3">
                  <span className="text-[var(--color-text-light)] text-sm">
                    {typeof window !== 'undefined' ? window.location.origin : ''}/w/
                  </span>
                  <input
                    type="text"
                    value={website.slug}
                    onChange={(e) =>
                      setWebsite({
                        ...website,
                        slug: e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9-]/g, '-')
                          .substring(0, 50),
                      })
                    }
                    className="flex-1 bg-transparent py-2 outline-none text-sm"
                  />
                </div>
                <button
                  onClick={copyLink}
                  className="px-3 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
                  title="Kopírovat odkaz"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Headline */}
            <div>
              <label className="block text-sm font-medium mb-2">Hlavní nadpis</label>
              <input
                type="text"
                value={website.headline}
                onChange={(e) => setWebsite({ ...website, headline: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="Bereme se!"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Podnadpis</label>
              <input
                type="text"
                value={website.subheadline}
                onChange={(e) => setWebsite({ ...website, subheadline: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="A rádi bychom to oslavili s vámi"
              />
            </div>

            {/* Story */}
            <div>
              <label className="block text-sm font-medium mb-2">Váš příběh</label>
              <textarea
                value={website.story || ''}
                onChange={(e) => setWebsite({ ...website, story: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg resize-none"
                rows={4}
                placeholder="Jak jste se poznali? Váš příběh lásky..."
              />
            </div>

            {/* Dress code */}
            <div>
              <label className="block text-sm font-medium mb-2">Dress code</label>
              <input
                type="text"
                value={website.dress_code_description || ''}
                onChange={(e) =>
                  setWebsite({ ...website, dress_code_description: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="Elegantní / Semi-formal"
              />
            </div>

            {/* Sections toggle */}
            <div>
              <label className="block text-sm font-medium mb-3">Zobrazit sekce</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'show_timeline', label: 'Program' },
                  { key: 'show_locations', label: 'Místa' },
                  { key: 'show_gallery', label: 'Galerie' },
                  { key: 'show_rsvp', label: 'RSVP' },
                  { key: 'show_contacts', label: 'Kontakty' },
                  { key: 'show_dress_code', label: 'Dress code' },
                ].map((section) => (
                  <label key={section.key} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={website[section.key as keyof Website] as boolean}
                      onChange={(e) =>
                        setWebsite({ ...website, [section.key]: e.target.checked })
                      }
                      className="w-4 h-4 text-[var(--color-primary)]"
                    />
                    <span className="text-sm">{section.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Published */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">Publikovat web</p>
                <p className="text-sm text-[var(--color-text-light)]">
                  {website.published
                    ? 'Web je veřejně dostupný'
                    : 'Web je skrytý'}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={website.published}
                  onChange={(e) => setWebsite({ ...website, published: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-primary)]"></div>
              </label>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={saveWebsite}
                disabled={savingWebsite}
                className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-light)] transition-colors disabled:opacity-50"
              >
                {savingWebsite ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Uložit web
              </button>
              {websiteMessage && (
                <span className={websiteMessage === 'Uloženo' ? 'text-green-600' : 'text-red-600'}>
                  {websiteMessage}
                </span>
              )}
            </div>

            <p className="text-sm text-[var(--color-text-light)]">
              Pro přidání programu, míst a fotek použijte tlačítka v navigaci nebo je přidejte přímo v databázi.
            </p>
          </div>
        )}
      </div>

      {/* Danger zone */}
      <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-red-500">
        <h2 className="text-lg font-medium text-red-600 mb-4">Nebezpečná zóna</h2>
        <p className="text-[var(--color-text-light)] mb-4">
          Smazáním účtu ztratíte všechna data včetně checklistu, rozpočtu a seznamu hostů.
        </p>
        <button
          onClick={deleteAccount}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          Smazat účet
        </button>
      </div>
    </div>
  );
}
