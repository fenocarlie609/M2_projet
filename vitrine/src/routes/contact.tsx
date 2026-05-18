import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin, Phone, Send, Clock } from "lucide-react";
import { useState, type FormEvent } from "react";
import { PageHeader } from "@/components/site/PageHeader";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — A.Fenovavy Madagascar" },
      { name: "description", content: "Contactez A.Fenovavy pour vos projets de transport maritime à Madagascar et dans l'Océan Indien." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [sent, setSent] = useState(false);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 5000);
  };

  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Parlons de votre projet maritime"
        subtitle="Notre équipe vous répond sous 24 heures, du lundi au vendredi."
      />

      <section className="py-24 bg-background">
        <div className="container-pro grid lg:grid-cols-5 gap-10">
          {/* Form */}
          <form onSubmit={onSubmit} className="lg:col-span-3 p-8 md:p-10 rounded-lg bg-card border border-border shadow-card space-y-5">
            <div className="grid sm:grid-cols-2 gap-5">
              <Field label="Nom complet *" name="name" required />
              <Field label="Société" name="company" />
              <Field label="Email *" name="email" type="email" required />
              <Field label="Téléphone" name="phone" type="tel" />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-primary mb-2">Type de demande *</label>
              <select required className="w-full h-12 px-4 rounded-md bg-background border border-input text-foreground focus:outline-none focus:ring-2 focus:ring-secondary">
                <option>Demande de devis</option>
                <option>Information sur les services</option>
                <option>Affrètement</option>
                <option>Partenariat</option>
                <option>Autre</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-primary mb-2">Message *</label>
              <textarea required rows={5} placeholder="Décrivez votre projet, volumes, ports concernés, délais souhaités..." className="w-full p-4 rounded-md bg-background border border-input text-foreground focus:outline-none focus:ring-2 focus:ring-secondary resize-none" />
            </div>
            <button type="submit" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-md bg-primary text-primary-foreground font-semibold hover:bg-secondary transition shadow-elegant">
              {sent ? "Message envoyé ✓" : <>Envoyer le message <Send className="h-4 w-4" /></>}
            </button>
          </form>

          {/* Info */}
          <aside className="lg:col-span-2 space-y-6">
            <div className="p-8 rounded-lg bg-primary text-primary-foreground">
              <h3 className="font-display text-2xl font-semibold mb-6">Coordonnées</h3>
              <ul className="space-y-5 text-sm">
                <Info icon={MapPin} title="Adresse">Port de Toamasina<br />BP 1234, Toamasina 501<br />Madagascar</Info>
                <Info icon={Phone} title="Téléphone">+261 20 00 000 00<br />+261 34 00 000 00</Info>
                <Info icon={Mail} title="Email">contact@afenovavy.mg<br />commercial@afenovavy.mg</Info>
                <Info icon={Clock} title="Horaires">Lun – Ven : 8h – 17h<br />Sam : 8h – 12h</Info>
              </ul>
            </div>

            <div className="rounded-lg overflow-hidden border border-border aspect-[4/3] relative bg-muted">
              <iframe
                title="Carte"
                src="https://www.openstreetmap.org/export/embed.html?bbox=49.36%2C-18.20%2C49.45%2C-18.13&layer=mapnik&marker=-18.155%2C49.405"
                className="absolute inset-0 h-full w-full"
                loading="lazy"
              />
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}

function Field({ label, name, type = "text", required }: { label: string; name: string; type?: string; required?: boolean }) {
  return (
    <div>
      <label htmlFor={name} className="block text-xs font-semibold uppercase tracking-widest text-primary mb-2">{label}</label>
      <input id={name} name={name} type={type} required={required} className="w-full h-12 px-4 rounded-md bg-background border border-input text-foreground focus:outline-none focus:ring-2 focus:ring-secondary" />
    </div>
  );
}

function Info({ icon: Icon, title, children }: { icon: typeof MapPin; title: string; children: React.ReactNode }) {
  return (
    <li className="flex gap-4">
      <span className="grid place-items-center h-10 w-10 rounded-md bg-gold/20 text-gold shrink-0"><Icon className="h-5 w-5" /></span>
      <div>
        <div className="font-semibold text-gold uppercase tracking-widest text-xs">{title}</div>
        <div className="mt-1 text-primary-foreground/85 leading-relaxed">{children}</div>
      </div>
    </li>
  );
}
