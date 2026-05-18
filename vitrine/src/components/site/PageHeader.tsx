export function PageHeader({ eyebrow, title, subtitle }: { eyebrow?: string; title: string; subtitle?: string }) {
  return (
    <section className="relative bg-primary text-primary-foreground pt-36 pb-20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-cta opacity-50" />
      <div className="absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-gold/10 blur-3xl" />
      <div className="relative container-pro animate-fade-up">
        {eyebrow && <p className="text-gold uppercase tracking-[0.3em] text-xs mb-4">{eyebrow}</p>}
        <h1 className="text-4xl md:text-6xl font-display font-semibold max-w-3xl">{title}</h1>
        {subtitle && <p className="mt-5 text-lg text-primary-foreground/80 max-w-2xl">{subtitle}</p>}
      </div>
    </section>
  );
}
