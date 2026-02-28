"use client";

import { Phone, Shirt } from "lucide-react";

interface Contact {
  name: string;
  role: string;
  phone: string;
}

interface DressCode {
  title: string;
  description: string;
}

interface ContactsProps {
  contacts: Contact[];
  dressCode?: DressCode;
}

export function Contacts({ contacts, dressCode }: ContactsProps) {
  return (
    <section id="info" className="section-padding bg-[var(--color-secondary)]">
      <div className="container">
        <div className={`max-w-4xl mx-auto grid ${dressCode ? 'md:grid-cols-2' : ''} gap-12`}>
          {/* Dress code */}
          {dressCode && (
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                <Shirt className="w-6 h-6 text-[var(--color-primary)]" />
                <h2 className="text-2xl">{dressCode.title}</h2>
              </div>
              <p className="text-[var(--color-text-light)]">
                {dressCode.description}
              </p>
            </div>
          )}

          {/* Contacts */}
          <div className="text-center md:text-left">
            <h2 className="text-2xl mb-6">Kontakty</h2>
            <div className="space-y-4">
              {contacts.map((contact) => (
                <div key={contact.name} className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                    <Phone className="w-4 h-4 text-[var(--color-primary)]" />
                  </div>
                  <div>
                    <p className="font-medium">{contact.name}</p>
                    <p className="text-sm text-[var(--color-text-light)]">
                      {contact.role}
                    </p>
                    <a
                      href={`tel:${contact.phone.replace(/\s/g, "")}`}
                      className="text-sm text-[var(--color-primary)] hover:underline"
                    >
                      {contact.phone}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
