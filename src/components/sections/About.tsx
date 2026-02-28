"use client";

interface AboutProps {
  title: string;
  story: string;
}

export function About({ title, story }: AboutProps) {
  const paragraphs = story.split("\n\n");

  return (
    <section id="o-nas" className="section-padding bg-[var(--color-secondary)]">
      <div className="container">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl mb-4">{title}</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center mb-12">
            {/* Image placeholders */}
            <div className="aspect-[4/5] bg-white rounded-lg flex items-center justify-center text-[var(--color-text-light)]">
              <span>Foto páru 1</span>
            </div>
            <div className="aspect-[4/5] bg-white rounded-lg flex items-center justify-center text-[var(--color-text-light)] mt-8 md:mt-16">
              <span>Foto páru 2</span>
            </div>
          </div>

          <div className="text-center">
            {paragraphs.map((paragraph, index) => (
              <p
                key={index}
                className="text-[var(--color-text-light)] leading-relaxed mb-4 last:mb-0"
              >
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
