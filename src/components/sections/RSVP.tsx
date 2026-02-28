"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Check } from "lucide-react";
import { Button, Input, Textarea, Select } from "@/components/ui";

const rsvpSchema = z.object({
  name: z.string().min(2, "Zadejte prosím vaše jméno"),
  email: z.string().email("Zadejte platný email"),
  attending: z.enum(["yes", "no"]),
  guestCount: z.number().min(1).max(5).optional(),
  dietary: z.string().optional(),
  notes: z.string().optional(),
});

type RSVPFormData = z.infer<typeof rsvpSchema>;

interface RSVPProps {
  deadline: Date;
  contactEmail?: string;
  websiteId?: string;
}

export function RSVP({ deadline, contactEmail, websiteId }: RSVPProps) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RSVPFormData>({
    resolver: zodResolver(rsvpSchema),
    defaultValues: {
      attending: "yes",
      guestCount: 1,
    },
  });

  const attending = watch("attending");

  const onSubmit = async (data: RSVPFormData) => {
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, websiteId }),
      });

      if (!response.ok) {
        throw new Error('Chyba při odesílání');
      }

      setIsSubmitted(true);
    } catch (error) {
      console.error('RSVP error:', error);
      alert('Nepodařilo se odeslat odpověď. Zkuste to prosím znovu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formattedDeadline = deadline.toLocaleDateString("cs-CZ", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  if (isSubmitted) {
    return (
      <section id="rsvp" className="section-padding bg-white">
        <div className="container">
          <div className="max-w-lg mx-auto text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-3xl md:text-4xl mb-4">Děkujeme!</h2>
            <p className="text-[var(--color-text-light)]">
              Vaše odpověď byla úspěšně odeslána. Těšíme se na vás!
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="rsvp" className="section-padding bg-white">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl mb-4">Potvrďte účast</h2>
          <p className="text-[var(--color-text-light)] max-w-xl mx-auto">
            Dejte nám prosím vědět do {formattedDeadline}, zda se zúčastníte
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="max-w-lg mx-auto space-y-6"
        >
          {/* Jméno */}
          <Input
            type="text"
            label="Vaše jméno a příjmení *"
            id="name"
            {...register("name")}
            placeholder="Jan Novák"
            error={errors.name?.message}
          />

          {/* Email */}
          <Input
            type="email"
            label="Email *"
            id="email"
            {...register("email")}
            placeholder="jan@email.cz"
            error={errors.email?.message}
          />

          {/* Účast */}
          <div>
            <label className="block text-sm font-medium mb-3">
              Zúčastníte se? *
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="yes"
                  {...register("attending")}
                  className="w-4 h-4 text-[var(--color-primary)]"
                />
                <span>Ano, přijdu</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="no"
                  {...register("attending")}
                  className="w-4 h-4 text-[var(--color-primary)]"
                />
                <span>Bohužel ne</span>
              </label>
            </div>
          </div>

          {/* Počet hostů - pouze pokud přijde */}
          {attending === "yes" && (
            <>
              <Select
                label="Počet osob (včetně vás)"
                id="guestCount"
                {...register("guestCount", { valueAsNumber: true })}
              >
                {[1, 2, 3, 4, 5].map((num) => (
                  <option key={num} value={num}>
                    {num} {num === 1 ? "osoba" : num < 5 ? "osoby" : "osob"}
                  </option>
                ))}
              </Select>

              {/* Stravování */}
              <Input
                type="text"
                label="Dietní omezení nebo alergie"
                id="dietary"
                {...register("dietary")}
                placeholder="Vegetarián, bezlepková dieta..."
              />
            </>
          )}

          {/* Poznámka */}
          <Textarea
            label="Vzkaz pro novomanžele"
            id="notes"
            {...register("notes")}
            rows={3}
            placeholder="Máte pro nás nějaký vzkaz?"
            className="resize-none"
          />

          {/* Submit */}
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? 'Odesílám...' : 'Odeslat odpověď'}
          </Button>

          {contactEmail && (
            <p className="text-center text-sm text-[var(--color-text-light)]">
              Máte dotazy? Napište nám na{" "}
              <a
                href={`mailto:${contactEmail}`}
                className="text-[var(--color-primary)] hover:underline"
              >
                {contactEmail}
              </a>
            </p>
          )}
        </form>
      </div>
    </section>
  );
}
