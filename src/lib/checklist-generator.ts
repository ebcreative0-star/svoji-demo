import { differenceInMonths, differenceInWeeks, subMonths, subWeeks, addDays } from 'date-fns';

export type WeddingSize = 'small' | 'medium' | 'large';
export type TaskCategory = 'venue' | 'attire' | 'vendors' | 'guests' | 'decor' | 'admin' | 'ceremony';
export type TaskPriority = 'urgent' | 'high' | 'medium' | 'low';

export interface ChecklistItem {
  id: string;
  title: string;
  description?: string;
  category: TaskCategory;
  dueDate: Date;
  priority: TaskPriority;
  completed: boolean;
  completedAt?: Date;
  sortOrder: number;
}

interface ChecklistConfig {
  weddingDate: Date;
  weddingSize: WeddingSize;
}

interface TaskTemplate {
  title: string;
  description?: string;
  category: TaskCategory;
  monthsBefore: number; // Ideální počet měsíců před svatbou
  minWeeksBefore: number; // Minimálně kolik týdnů před musí být hotovo
  forSizes: WeddingSize[]; // Pro jaké velikosti svatby
  basePriority: TaskPriority;
}

// Šablona úkolů pro plánování svatby
const TASK_TEMPLATES: TaskTemplate[] = [
  // ADMIN - Základní plánování
  {
    title: 'Stanovit celkový rozpočet',
    description: 'Projděte si finance a určete, kolik můžete na svatbu vynaložit.',
    category: 'admin',
    monthsBefore: 12,
    minWeeksBefore: 4,
    forSizes: ['small', 'medium', 'large'],
    basePriority: 'high',
  },
  {
    title: 'Vytvořit hrubý seznam hostů',
    description: 'Sepište všechny, které byste rádi pozvali. Finální seznam uděláte později.',
    category: 'guests',
    monthsBefore: 12,
    minWeeksBefore: 8,
    forSizes: ['small', 'medium', 'large'],
    basePriority: 'high',
  },
  {
    title: 'Vybrat datum svatby',
    description: 'Zvolte 2-3 možná data s ohledem na dostupnost míst.',
    category: 'admin',
    monthsBefore: 12,
    minWeeksBefore: 12,
    forSizes: ['small', 'medium', 'large'],
    basePriority: 'urgent',
  },

  // VENUE - Místa
  {
    title: 'Rezervovat místo obřadu',
    description: 'Kontaktujte matriku, kostel nebo jiné místo obřadu.',
    category: 'venue',
    monthsBefore: 10,
    minWeeksBefore: 8,
    forSizes: ['small', 'medium', 'large'],
    basePriority: 'urgent',
  },
  {
    title: 'Rezervovat místo hostiny',
    description: 'Oblíbená místa se rezervují i rok dopředu.',
    category: 'venue',
    monthsBefore: 10,
    minWeeksBefore: 6,
    forSizes: ['small', 'medium', 'large'],
    basePriority: 'urgent',
  },

  // VENDORS - Dodavatelé
  {
    title: 'Vybrat a rezervovat fotografa',
    description: 'Projděte portfolia, domluvte schůzku. Dobří fotografové jsou rychle pryč.',
    category: 'vendors',
    monthsBefore: 9,
    minWeeksBefore: 6,
    forSizes: ['small', 'medium', 'large'],
    basePriority: 'high',
  },
  {
    title: 'Vybrat a rezervovat kameramana',
    description: 'Pokud chcete svatební video.',
    category: 'vendors',
    monthsBefore: 9,
    minWeeksBefore: 6,
    forSizes: ['medium', 'large'],
    basePriority: 'medium',
  },
  {
    title: 'Vybrat hudbu/kapelu/DJ',
    description: 'Rozhodněte, jakou hudbu chcete na obřad a na večer.',
    category: 'vendors',
    monthsBefore: 8,
    minWeeksBefore: 4,
    forSizes: ['small', 'medium', 'large'],
    basePriority: 'high',
  },
  {
    title: 'Vybrat catering nebo menu',
    description: 'Domluvte se s místem hostiny nebo externím cateringem.',
    category: 'vendors',
    monthsBefore: 6,
    minWeeksBefore: 4,
    forSizes: ['small', 'medium', 'large'],
    basePriority: 'high',
  },
  {
    title: 'Objednat svatební dort',
    description: 'Dobrá cukrárna potřebuje rezervaci několik měsíců dopředu.',
    category: 'vendors',
    monthsBefore: 4,
    minWeeksBefore: 3,
    forSizes: ['small', 'medium', 'large'],
    basePriority: 'medium',
  },

  // ATTIRE - Oblečení
  {
    title: 'Vybrat svatební šaty',
    description: 'Začněte s dostatečným předstihem - úpravy trvají.',
    category: 'attire',
    monthsBefore: 8,
    minWeeksBefore: 6,
    forSizes: ['small', 'medium', 'large'],
    basePriority: 'high',
  },
  {
    title: 'Vybrat oblek pro ženicha',
    description: 'Koupě nebo půjčovna? Nezapomeňte na doplňky.',
    category: 'attire',
    monthsBefore: 6,
    minWeeksBefore: 4,
    forSizes: ['small', 'medium', 'large'],
    basePriority: 'high',
  },
  {
    title: 'Objednat snubní prsteny',
    description: 'Gravírování může trvat několik týdnů.',
    category: 'attire',
    monthsBefore: 4,
    minWeeksBefore: 4,
    forSizes: ['small', 'medium', 'large'],
    basePriority: 'high',
  },
  {
    title: 'Zkouška šatů',
    description: 'Poslední úpravy a ujištění, že vše sedí.',
    category: 'attire',
    monthsBefore: 1,
    minWeeksBefore: 2,
    forSizes: ['small', 'medium', 'large'],
    basePriority: 'high',
  },

  // GUESTS - Hosté
  {
    title: 'Rozeslat save-the-date',
    description: 'Informujte hosty o datu, hlavně ty vzdálené.',
    category: 'guests',
    monthsBefore: 8,
    minWeeksBefore: 12,
    forSizes: ['medium', 'large'],
    basePriority: 'medium',
  },
  {
    title: 'Finalizovat seznam hostů',
    description: 'Definitivní seznam pro pozvánky.',
    category: 'guests',
    monthsBefore: 4,
    minWeeksBefore: 8,
    forSizes: ['small', 'medium', 'large'],
    basePriority: 'high',
  },
  {
    title: 'Objednat a rozeslat pozvánky',
    description: 'Tištěné nebo elektronické? Nezapomeňte na RSVP.',
    category: 'guests',
    monthsBefore: 3,
    minWeeksBefore: 6,
    forSizes: ['small', 'medium', 'large'],
    basePriority: 'high',
  },
  {
    title: 'Připravit svatební web pro hosty',
    description: 'Všechny info na jednom místě - program, mapa, RSVP.',
    category: 'guests',
    monthsBefore: 3,
    minWeeksBefore: 4,
    forSizes: ['small', 'medium', 'large'],
    basePriority: 'medium',
  },
  {
    title: 'Připravit zasedací pořádek',
    description: 'Kdo bude sedět kde? Rodinná diplomacie.',
    category: 'guests',
    monthsBefore: 1,
    minWeeksBefore: 1,
    forSizes: ['medium', 'large'],
    basePriority: 'medium',
  },

  // DECOR - Dekorace a květiny
  {
    title: 'Vybrat floristku/květiny',
    description: 'Kytice, výzdoba stolů, květinová brána...',
    category: 'decor',
    monthsBefore: 4,
    minWeeksBefore: 3,
    forSizes: ['small', 'medium', 'large'],
    basePriority: 'medium',
  },
  {
    title: 'Naplánovat dekorace',
    description: 'Barvy, styl, co kde bude. Koordinujte s místem.',
    category: 'decor',
    monthsBefore: 3,
    minWeeksBefore: 2,
    forSizes: ['small', 'medium', 'large'],
    basePriority: 'medium',
  },

  // CEREMONY - Obřad
  {
    title: 'Vybrat oddávajícího',
    description: 'Matrikář, farář, nebo civilní obřad?',
    category: 'ceremony',
    monthsBefore: 6,
    minWeeksBefore: 4,
    forSizes: ['small', 'medium', 'large'],
    basePriority: 'high',
  },
  {
    title: 'Napsat svatební sliby',
    description: 'Pokud chcete vlastní sliby místo tradičních.',
    category: 'ceremony',
    monthsBefore: 2,
    minWeeksBefore: 1,
    forSizes: ['small', 'medium', 'large'],
    basePriority: 'low',
  },
  {
    title: 'Svatební zkouška',
    description: 'Projděte si průběh obřadu na místě.',
    category: 'ceremony',
    monthsBefore: 0.5,
    minWeeksBefore: 0.5,
    forSizes: ['small', 'medium', 'large'],
    basePriority: 'medium',
  },

  // ADMIN - Dokumenty
  {
    title: 'Vyřídit dokumenty na matrice',
    description: 'Dotazník k uzavření manželství, potřebné dokumenty.',
    category: 'admin',
    monthsBefore: 2,
    minWeeksBefore: 2,
    forSizes: ['small', 'medium', 'large'],
    basePriority: 'high',
  },
  {
    title: 'Naplánovat líbánky',
    description: 'Kam pojedete? Rezervujte včas.',
    category: 'admin',
    monthsBefore: 6,
    minWeeksBefore: 4,
    forSizes: ['small', 'medium', 'large'],
    basePriority: 'medium',
  },

  // POSLEDNÍ TÝDEN
  {
    title: 'Potvrdit finální počet hostů',
    description: 'Sdělte cateringu finální čísla.',
    category: 'guests',
    monthsBefore: 0.25,
    minWeeksBefore: 0.5,
    forSizes: ['small', 'medium', 'large'],
    basePriority: 'urgent',
  },
  {
    title: 'Připravit timeline dne D',
    description: 'Kdy co bude, kdo za co zodpovídá.',
    category: 'admin',
    monthsBefore: 0.25,
    minWeeksBefore: 0.5,
    forSizes: ['small', 'medium', 'large'],
    basePriority: 'high',
  },
  {
    title: 'Potvrdit všechny dodavatele',
    description: 'Poslední check - všichni vědí kdy a kde.',
    category: 'vendors',
    monthsBefore: 0.25,
    minWeeksBefore: 0.5,
    forSizes: ['small', 'medium', 'large'],
    basePriority: 'urgent',
  },
  {
    title: 'Sbalit věci na líbánky',
    description: 'Ať nemusíte řešit po svatbě.',
    category: 'admin',
    monthsBefore: 0.1,
    minWeeksBefore: 0.1,
    forSizes: ['small', 'medium', 'large'],
    basePriority: 'low',
  },
];

function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

export function generateChecklist(config: ChecklistConfig): ChecklistItem[] {
  const today = new Date();
  const monthsUntilWedding = differenceInMonths(config.weddingDate, today);
  const weeksUntilWedding = differenceInWeeks(config.weddingDate, today);

  // Filtrovat úkoly podle velikosti svatby
  const relevantTasks = TASK_TEMPLATES.filter(task =>
    task.forSizes.includes(config.weddingSize)
  );

  const checklist: ChecklistItem[] = relevantTasks.map((task, index) => {
    // Výpočet deadline
    let dueDate: Date;

    if (monthsUntilWedding >= task.monthsBefore) {
      // Máme dost času - použij ideální deadline
      dueDate = subMonths(config.weddingDate, task.monthsBefore);
    } else {
      // Méně času - komprese
      // Použij minimum týdnů před svatbou
      const minWeeks = Math.max(task.minWeeksBefore, 0.5);
      dueDate = subWeeks(config.weddingDate, minWeeks);

      // Ale ne dřív než dnes + 2 dny
      const minDate = addDays(today, 2);
      if (dueDate < minDate) {
        dueDate = minDate;
      }
    }

    // Priorita - zvýšit pokud je málo času
    let priority = task.basePriority;
    const weeksUntilDue = differenceInWeeks(dueDate, today);

    if (weeksUntilDue <= 1) {
      priority = 'urgent';
    } else if (weeksUntilDue <= 2 && priority !== 'urgent') {
      priority = 'high';
    }

    // Extra urgence pokud je celkově málo času
    if (monthsUntilWedding < 3 && task.basePriority === 'high') {
      priority = 'urgent';
    }

    return {
      id: generateId(),
      title: task.title,
      description: task.description,
      category: task.category,
      dueDate,
      priority,
      completed: false,
      sortOrder: index,
    };
  });

  // Seřadit podle deadline
  return checklist.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
}

// Kategorie pro UI
export const CATEGORY_LABELS: Record<TaskCategory, string> = {
  venue: 'Místo',
  attire: 'Oblečení',
  vendors: 'Dodavatelé',
  guests: 'Hosté',
  decor: 'Dekorace',
  admin: 'Organizace',
  ceremony: 'Obřad',
};

export const CATEGORY_COLORS: Record<TaskCategory, string> = {
  venue: '#8B5CF6', // purple
  attire: '#EC4899', // pink
  vendors: '#F59E0B', // amber
  guests: '#10B981', // emerald
  decor: '#06B6D4', // cyan
  admin: '#6B7280', // gray
  ceremony: '#EF4444', // red
};

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  urgent: 'Urgentní',
  high: 'Vysoká',
  medium: 'Střední',
  low: 'Nízká',
};
