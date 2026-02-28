// Demo data pro testovani bez Supabase
// Pouziva se kdyz NEXT_PUBLIC_DEMO_MODE=true

export const DEMO_USER = {
  id: 'demo-user-id-12345',
  email: 'demo@svoji.cz',
};

export const DEMO_COUPLE = {
  id: DEMO_USER.id,
  partner1_name: 'Anna',
  partner2_name: 'Tomas',
  wedding_date: '2025-09-20',
  wedding_size: 'medium' as const,
  budget_total: 250000,
  onboarding_completed: true,
};

export const DEMO_CHECKLIST = [
  { id: '1', title: 'Rezervovat misto pro obrad', description: 'Kaple nebo radnice', category: 'venue', due_date: '2025-03-15', priority: 'urgent', completed: true },
  { id: '2', title: 'Vybrat fotografa', description: 'Projit portfolia, domluvit schuzku', category: 'vendors', due_date: '2025-04-01', priority: 'high', completed: true },
  { id: '3', title: 'Objednat svatebni saty', description: 'Salon v Praze', category: 'attire', due_date: '2025-04-15', priority: 'high', completed: false },
  { id: '4', title: 'Poslat oznameni', description: 'Design + tisk + rozeslani', category: 'guests', due_date: '2025-05-01', priority: 'medium', completed: false },
  { id: '5', title: 'Vybrat menu', description: 'Degustace v restauraci', category: 'catering', due_date: '2025-05-15', priority: 'medium', completed: false },
  { id: '6', title: 'Objednat kytice', description: 'Svatebni + dekorace', category: 'decor', due_date: '2025-06-01', priority: 'medium', completed: false },
  { id: '7', title: 'Pripravit playlist', description: 'Prvni tanec, party', category: 'entertainment', due_date: '2025-07-01', priority: 'low', completed: false },
  { id: '8', title: 'Zkouska ucesu a liceni', description: 'Termin u vizazistky', category: 'attire', due_date: '2025-08-15', priority: 'medium', completed: false },
  { id: '9', title: 'Vyzvednout prstynky', description: 'U klenotnika', category: 'attire', due_date: '2025-09-10', priority: 'high', completed: false },
  { id: '10', title: 'Posledni fitting satu', description: 'Pripadne upravy', category: 'attire', due_date: '2025-09-15', priority: 'high', completed: false },
];

export const DEMO_BUDGET = [
  { id: '1', category: 'venue', name: 'Zamek Dobris - pronajem', estimated_cost: 80000, actual_cost: 75000, paid: true },
  { id: '2', category: 'catering', name: 'Catering pro 60 lidi', estimated_cost: 60000, actual_cost: null, paid: false },
  { id: '3', category: 'photo', name: 'Fotograf Jan Novak', estimated_cost: 25000, actual_cost: 25000, paid: true },
  { id: '4', category: 'music', name: 'DJ + technika', estimated_cost: 15000, actual_cost: null, paid: false },
  { id: '5', category: 'flowers', name: 'Kvetiny a dekorace', estimated_cost: 12000, actual_cost: null, paid: false },
  { id: '6', category: 'attire', name: 'Svatebni saty', estimated_cost: 35000, actual_cost: 32000, paid: true },
  { id: '7', category: 'attire', name: 'Oblek pro zenicha', estimated_cost: 8000, actual_cost: null, paid: false },
  { id: '8', category: 'rings', name: 'Snubni prsteny', estimated_cost: 20000, actual_cost: 18500, paid: true },
  { id: '9', category: 'cake', name: 'Svatebni dort', estimated_cost: 8000, actual_cost: null, paid: false },
  { id: '10', category: 'other', name: 'Oznameni a tiskoviny', estimated_cost: 5000, actual_cost: 4200, paid: true },
];

export const DEMO_GUESTS: {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  group_name: string | null;
  plus_one: boolean;
  dietary_requirements: string | null;
  rsvp_status: 'pending' | 'confirmed' | 'declined';
  notes: string | null;
}[] = [
  { id: '1', name: 'Marie Novakova', email: 'marie@email.cz', phone: null, group_name: 'Rodina nevesty', plus_one: false, rsvp_status: 'confirmed', dietary_requirements: null, notes: null },
  { id: '2', name: 'Jan Novak', email: 'jan@email.cz', phone: null, group_name: 'Rodina nevesty', plus_one: false, rsvp_status: 'confirmed', dietary_requirements: null, notes: null },
  { id: '3', name: 'Petra Svobodova', email: 'petra@email.cz', phone: null, group_name: 'Pratele', plus_one: true, rsvp_status: 'confirmed', dietary_requirements: 'vegetarian', notes: null },
  { id: '4', name: 'Martin Dvorak', email: 'martin@email.cz', phone: null, group_name: 'Pratele', plus_one: false, rsvp_status: 'confirmed', dietary_requirements: null, notes: null },
  { id: '5', name: 'Lucie Kralova', email: 'lucie@email.cz', phone: null, group_name: 'Kolegove', plus_one: false, rsvp_status: 'pending', dietary_requirements: null, notes: null },
  { id: '6', name: 'Tomas Maly', email: 'tomas@email.cz', phone: null, group_name: 'Rodina zenicha', plus_one: true, rsvp_status: 'confirmed', dietary_requirements: 'bezlepkove', notes: null },
  { id: '7', name: 'Eva Velka', email: 'eva@email.cz', phone: null, group_name: 'Rodina zenicha', plus_one: false, rsvp_status: 'declined', dietary_requirements: null, notes: null },
  { id: '8', name: 'Pavel Cerny', email: 'pavel@email.cz', phone: null, group_name: 'Pratele', plus_one: false, rsvp_status: 'pending', dietary_requirements: null, notes: null },
];

export const DEMO_CHAT: { id: string; role: 'user' | 'assistant'; content: string }[] = [
  { id: '1', role: 'user', content: 'Ahoj, kolik stoji svatebni fotograf?' },
  { id: '2', role: 'assistant', content: `Ceny fotografu se v CR pohybuji priblizne takto:

- Zakladni balicek (4-6 hodin): 15-25 tisic Kc
- Celodenni foceni: 25-40 tisic Kc
- Premium fotografove: 40-60 tisic Kc

Vzhledem k vasemu rozpoctu 250 000 Kc bych doporucila pocitat s castkou kolem 25-30 tisic za kvalitniho fotografa.` },
  { id: '3', role: 'user', content: 'Diky! A co je potreba vyridit na matrice?' },
  { id: '4', role: 'assistant', content: `Na matriku budete potrebovat:

1. Vyplneny dotaznik k uzavreni manzelstvi
2. Obcanske prukazy obou snoubencu
3. Rodne listy
4. U rozvedenych: rozsudek o rozvodu

Doporucuji zajit 2-3 mesice pred svatbou. Mate svatbu 20. zari, takze idealne v cervnu/cervenci.` },
];

export function isDemoMode(): boolean {
  // Demo mode if explicitly set OR if Supabase is not configured
  return process.env.NEXT_PUBLIC_DEMO_MODE === 'true' ||
    process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder') ||
    !process.env.NEXT_PUBLIC_SUPABASE_URL;
}
