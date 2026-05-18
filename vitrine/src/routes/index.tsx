import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Anchor, Package, MapPin, Handshake, Ship, ShieldCheck, Clock, Quote, Star } from "lucide-react";
import heroShip from "@/assets/hero-ship.jpg";
import { CtaBanner } from "@/components/site/CtaBanner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "A.Fenovavy — Premium Express LCT Madagascar" },
      { name: "description", content: "Compagnie maritime premium à Madagascar : transport de fret, logistique inter-îles, solutions sur mesure depuis Toamasina, Mahajanga, Nosy Be." },
    ],
  }),
  component: HomePage,
});

const stats = [
  { value: "12+", label: "Navires en opération" },
  { value: "5", label: "Ports desservis" },
  { value: "20", label: "Ans d'expérience" },
  { value: "150K+", label: "Tonnes transportées/an" },
];

const services = [
  { icon: Anchor, title: "Transport de fret", desc: "Acheminement maritime sécurisé pour marchandises générales, conteneurs et vrac." },
  { icon: Package, title: "Gestion de cargaison", desc: "Manutention, arrimage et suivi de bout en bout pour préserver l'intégrité de vos biens." },
  { icon: MapPin, title: "Logistique inter-îles", desc: "Liaisons régulières entre Madagascar, les Comores, Mayotte et l'Océan Indien." },
  { icon: Handshake, title: "Solutions sur mesure", desc: "Affrètement, transport de projet et accompagnement pour vos opérations spécifiques." },
];

function HomePage() {
  return (
    <>
      {/* HERO */}
      <section className="relative h-screen min-h-[640px] flex items-center text-primary-foreground overflow-hidden">
        <img src={heroShip} alt="Navire cargo en mer au coucher de soleil" width={1920} height={1080} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="absolute inset-0 bg-primary/40" />
        <div className="relative container-pro">
          <p className="text-gold uppercase tracking-[0.4em] text-xs mb-6 animate-fade-up">Premium Express LCT · Madagascar</p>
          <h1 className="text-5xl md:text-7xl font-display font-semibold max-w-4xl leading-[1.05] animate-fade-up">
            La mer comme trait d'union, <span className="text-gold">la confiance comme cap.</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-primary-foreground/85 max-w-2xl animate-fade-up-delay">
            A.Fenovavy assure le transport maritime de fret entre les ports de Madagascar et l'Océan Indien — avec rigueur, ponctualité et excellence opérationnelle.
          </p>
          <div className="mt-10 flex flex-wrap gap-4 animate-fade-up-delay-2">
            <Link to="/contact" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-md bg-gold text-primary font-semibold hover:brightness-110 transition shadow-elegant">
              Demander un devis <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/contact" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-md border border-primary-foreground/40 text-primary-foreground font-semibold hover:bg-primary-foreground/10 transition">
              Nous contacter
            </Link>
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-primary-foreground/60 text-xs tracking-widest uppercase animate-pulse">Scroll</div>
      </section>

      {/* STATS */}
      <section className="bg-primary text-primary-foreground border-y border-primary-foreground/10">
        <div className="container-pro grid grid-cols-2 md:grid-cols-4 gap-8 py-12">
          {stats.map((s) => (
            <div key={s.label} className="text-center md:text-left">
              <div className="text-4xl md:text-5xl font-display font-semibold text-gold">{s.value}</div>
              <div className="mt-1 text-sm text-primary-foreground/70">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* SERVICES */}
      <section className="py-24 bg-background">
        <div className="container-pro">
          <div className="max-w-2xl mb-14">
            <p className="text-teal uppercase tracking-[0.3em] text-xs mb-3">Nos services</p>
            <h2 className="text-3xl md:text-5xl font-display font-semibold text-primary">Une expertise maritime complète</h2>
            <p className="mt-4 text-muted-foreground">Du quai au quai, nos équipes orchestrent chaque étape de votre logistique avec précision.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((s) => (
              <div key={s.title} className="group p-7 rounded-lg bg-card border border-border hover:border-secondary hover:-translate-y-1 transition shadow-card">
                <div className="grid place-items-center h-12 w-12 rounded-md bg-secondary/10 text-secondary group-hover:bg-secondary group-hover:text-primary-foreground transition">
                  <s.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-xl font-semibold text-primary">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY US */}
      <section className="py-24 bg-muted/40">
        <div className="container-pro grid lg:grid-cols-2 gap-14 items-center">
          <div>
            <p className="text-teal uppercase tracking-[0.3em] text-xs mb-3">Pourquoi A.Fenovavy</p>
            <h2 className="text-3xl md:text-5xl font-display font-semibold text-primary leading-tight">
              Une marine marchande ancrée à Madagascar, tournée vers l'international.
            </h2>
            <p className="mt-5 text-muted-foreground leading-relaxed">
              Depuis deux décennies, nous bâtissons un réseau maritime fiable au service des entreprises malgaches, régionales et internationales. Notre flotte LCT, parfaitement adaptée aux côtes malgaches, garantit des livraisons jusque dans les zones les plus difficiles d'accès.
            </p>
            <ul className="mt-8 space-y-4">
              {[
                { icon: ShieldCheck, t: "Sécurité certifiée", d: "Standards internationaux ISM et ISPS." },
                { icon: Clock, t: "Ponctualité", d: "Plannings respectés, suivi temps réel." },
                { icon: Ship, t: "Flotte moderne", d: "Navires LCT entretenus et adaptés." },
              ].map((f) => (
                <li key={f.t} className="flex gap-4">
                  <span className="grid place-items-center h-10 w-10 rounded-md bg-primary text-gold shrink-0"><f.icon className="h-5 w-5" /></span>
                  <div>
                    <div className="font-semibold text-primary">{f.t}</div>
                    <div className="text-sm text-muted-foreground">{f.d}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-cta rounded-lg opacity-20 blur-2xl" />
            <img src={heroShip} alt="Opérations maritimes" loading="lazy" className="relative rounded-lg shadow-elegant w-full object-cover aspect-[4/3]" />
            <div className="absolute -bottom-6 -right-6 bg-primary text-primary-foreground p-6 rounded-lg shadow-elegant border border-gold/30 max-w-[220px] hidden md:block">
              <div className="text-3xl font-display font-semibold text-gold">98%</div>
              <div className="text-xs text-primary-foreground/70 mt-1">Taux de satisfaction client sur les 12 derniers mois</div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 bg-background relative overflow-hidden">
        <div className="absolute top-0 right-0 h-72 w-72 rounded-full bg-teal/5 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-gold/10 blur-3xl" />
        <div className="container-pro relative">
          <div className="max-w-2xl mb-14">
            <p className="text-teal uppercase tracking-[0.3em] text-xs mb-3">Témoignages</p>
            <h2 className="text-3xl md:text-5xl font-display font-semibold text-primary">La parole à nos partenaires</h2>
            <p className="mt-4 text-muted-foreground">Des entreprises malgaches et internationales nous confient leurs opérations maritimes les plus stratégiques.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                quote: "A.Fenovavy a transformé notre logistique inter-îles. Ponctualité irréprochable et équipes d'une rare professionnalité.",
                name: "Hery Rakotonirina",
                role: "Directeur Logistique, Tiko Group",
                initials: "HR",
              },
              {
                quote: "Un partenaire de confiance pour nos expéditions vers Nosy Be. La flotte LCT est parfaitement adaptée aux côtes malgaches.",
                name: "Sophie Andriamasy",
                role: "Supply Chain Manager, STAR Mada",
                initials: "SA",
              },
              {
                quote: "Réactivité, transparence et expertise. Trois mots qui résument notre collaboration depuis bientôt cinq ans.",
                name: "Jean-Marc Razafy",
                role: "Operations Director, Ambatovy",
                initials: "JM",
              },
            ].map((t) => (
              <figure key={t.name} className="group relative p-8 rounded-lg bg-card border border-border hover:border-secondary hover:-translate-y-1 transition shadow-card flex flex-col">
                <Quote className="h-9 w-9 text-gold/80 mb-4" aria-hidden />
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-gold text-gold" />
                  ))}
                </div>
                <blockquote className="text-foreground/90 leading-relaxed flex-1">"{t.quote}"</blockquote>
                <figcaption className="mt-6 pt-6 border-t border-border flex items-center gap-3">
                  <span className="grid place-items-center h-11 w-11 rounded-full bg-gradient-cta text-primary-foreground font-semibold text-sm">{t.initials}</span>
                  <span>
                    <span className="block font-semibold text-primary text-sm">{t.name}</span>
                    <span className="block text-xs text-muted-foreground">{t.role}</span>
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* PARTNERS */}
      <section className="py-20 bg-muted/40 border-y border-border overflow-hidden">
        <div className="container-pro">
          <div className="text-center mb-12">
            <p className="text-teal uppercase tracking-[0.3em] text-xs mb-3">Ils nous font confiance</p>
            <h2 className="text-2xl md:text-3xl font-display font-semibold text-primary">Un réseau de partenaires d'exception</h2>
          </div>
        </div>
        <div
          className="relative group"
          style={{ maskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)", WebkitMaskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)" }}
        >
          <div className="flex w-max animate-marquee group-hover:[animation-play-state:paused]">
            {Array.from({ length: 2 }).map((_, loop) => (
              <div key={loop} className="flex shrink-0" aria-hidden={loop === 1}>
                {["Madarail", "STAR Mada", "Tiko Group", "Ambatovy", "QMM", "Logistics Plus", "Océan Indien Co", "Port Authority"].map((p) => (
                  <div
                    key={`${loop}-${p}`}
                    className="shrink-0 mx-3 sm:mx-5 px-8 sm:px-10 py-8 min-w-[200px] sm:min-w-[240px] flex items-center justify-center rounded-lg bg-background border border-border hover:border-secondary hover:shadow-card transition"
                  >
                    <span className="font-display text-xl sm:text-2xl text-primary/60 hover:text-primary tracking-wider whitespace-nowrap transition">
                      {p}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      <CtaBanner />
    </>
  );
}
