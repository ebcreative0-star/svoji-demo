'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Button, Card, Input, Textarea } from '@/components/ui';
import { SaasFooter } from '@/components/ui/SaasFooter';

const contactSchema = z.object({
  name: z.string().min(2, 'Jméno musí mít alespoň 2 znaky'),
  email: z.string().email('Zadejte platný email'),
  message: z.string().min(10, 'Zpráva musí mít alespoň 10 znaků'),
});

type ContactFormData = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = (data: ContactFormData) => {
    const subject = encodeURIComponent(`Kontakt od ${data.name}`);
    const body = encodeURIComponent(
      `Jméno: ${data.name}\nEmail: ${data.email}\n\n${data.message}`
    );
    window.open(`mailto:info@svoji.cz?subject=${subject}&body=${body}`, '_self');
    setSubmitted(true);
  };

  return (
    <>
      <main className="min-h-screen bg-[var(--color-background)] py-16 px-4">
        <div className="max-w-xl mx-auto">
          <h1 className="font-heading text-4xl text-[var(--color-text)] mb-4 text-center">
            Kontaktujte nás
          </h1>
          <p className="text-[var(--color-text-light)] text-center mb-10">
            Máte otázku nebo nápad? Napište nám.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            <Card>
              <Card.Body className="p-6 sm:p-8">
                {submitted ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">&#10003;</div>
                    <h2 className="font-heading text-2xl text-[var(--color-text)] mb-2">
                      Děkujeme za vaši zprávu!
                    </h2>
                    <p className="text-[var(--color-text-light)]">
                      Brzy se ozveme.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <Input
                      label="Jméno"
                      placeholder="Vaše jméno"
                      error={errors.name?.message}
                      {...register('name')}
                    />

                    <Input
                      label="Email"
                      type="email"
                      placeholder="vas@email.cz"
                      error={errors.email?.message}
                      {...register('email')}
                    />

                    <Textarea
                      label="Zpráva"
                      placeholder="Napište nám..."
                      rows={5}
                      error={errors.message?.message}
                      {...register('message')}
                    />

                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      isLoading={isSubmitting}
                      className="w-full"
                    >
                      Odeslat zprávu
                    </Button>
                  </form>
                )}
              </Card.Body>
            </Card>
          </motion.div>
        </div>
      </main>
      <SaasFooter />
    </>
  );
}
