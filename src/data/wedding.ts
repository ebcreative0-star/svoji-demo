// Demo data - v produkci bude z databáze/CMS
export const weddingData = {
  // Základní info
  couple: {
    partner1: "Anna",
    partner2: "Tomáš",
  },
  date: new Date("2025-06-21T14:00:00"),

  // Hero sekce
  hero: {
    headline: "Bereme se!",
    subheadline: "A rádi bychom to oslavili s vámi",
    backgroundImage: "/images/hero-bg.jpg",
  },

  // O nás
  about: {
    title: "Náš příběh",
    story: `Potkali jsme se na vysoké škole v Praze. Anna studovala architekturu, Tomáš informatiku. První společnou kávu jsme si dali v září 2018 a od té doby jsme nerozdělitelní.

Po šesti letech společného života jsme se rozhodli udělat další krok. Tomáš požádal Annu o ruku na dovolené v Itálii a ona řekla ANO!

Nyní vás zveme, abyste s námi oslavili začátek naší společné cesty jako manželé.`,
    image1: "/images/couple-1.jpg",
    image2: "/images/couple-2.jpg",
  },

  // Program dne
  timeline: [
    {
      time: "14:00",
      title: "Svatební obřad",
      description: "Setkáme se v kapli sv. Jiří",
      icon: "church",
    },
    {
      time: "15:00",
      title: "Společné focení",
      description: "Fotky s novomanželi a hosty",
      icon: "camera",
    },
    {
      time: "16:00",
      title: "Aperitiv",
      description: "Přivítání na terase s drinky",
      icon: "wine",
    },
    {
      time: "17:30",
      title: "Svatební hostina",
      description: "Zasedáme ke slavnostní večeři",
      icon: "utensils",
    },
    {
      time: "20:00",
      title: "První tanec",
      description: "Zahájení taneční zábavy",
      icon: "music",
    },
    {
      time: "21:00",
      title: "Večerní program",
      description: "Zábava až do rána",
      icon: "party",
    },
  ],

  // Místa
  locations: [
    {
      type: "ceremony",
      name: "Kaple sv. Jiří",
      address: "Zámek Dobříš, 263 01 Dobříš",
      time: "14:00",
      description: "Obřad se koná v historické kapli v areálu zámku.",
      coordinates: { lat: 49.7811, lng: 14.1678 },
      mapUrl: "https://mapy.cz/s/3aXyZ",
    },
    {
      type: "reception",
      name: "Orangerie Dobříš",
      address: "Zámek Dobříš, 263 01 Dobříš",
      time: "16:00",
      description: "Hostina a oslava v krásném prostředí zámecké orangerie.",
      coordinates: { lat: 49.7815, lng: 14.1682 },
      mapUrl: "https://mapy.cz/s/3aXyZ",
    },
    {
      type: "parking",
      name: "Parkoviště u zámku",
      address: "Zámecká 1, 263 01 Dobříš",
      description: "Parkování zdarma v areálu zámku. Prosíme o příjezd 30 minut před obřadem.",
      coordinates: { lat: 49.7808, lng: 14.1670 },
      mapUrl: "https://mapy.cz/s/3aXyZ",
    },
  ],

  // Galerie
  gallery: [
    { url: "/images/gallery/1.jpg", caption: "Zásnuby v Itálii" },
    { url: "/images/gallery/2.jpg", caption: "Naše první společná dovolená" },
    { url: "/images/gallery/3.jpg", caption: "Vánoce 2023" },
    { url: "/images/gallery/4.jpg", caption: "Výlet do hor" },
    { url: "/images/gallery/5.jpg", caption: "Společné vaření" },
    { url: "/images/gallery/6.jpg", caption: "Na naší oblíbené kavárně" },
  ],

  // RSVP info
  rsvp: {
    deadline: new Date("2025-05-15"),
    message: "Dejte nám prosím vědět do 15. května 2025, zda se zúčastníte.",
    contactEmail: "svatba@anna-tomas.cz",
  },

  // Kontakty
  contacts: [
    {
      name: "Petra Nováková",
      role: "Svědkyně nevěsty",
      phone: "+420 777 123 456",
    },
    {
      name: "Martin Svoboda",
      role: "Svědek ženicha",
      phone: "+420 777 654 321",
    },
  ],

  // Dress code
  dressCode: {
    title: "Dress Code",
    description: "Elegantní / Semi-formal. Prosíme vyhněte se bílé a černé barvě.",
  },
};

export type WeddingData = typeof weddingData;
