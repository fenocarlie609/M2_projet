// Route handled by react-router-dom
import { Compass, HeartHandshake, Leaf, Trophy } from "lucide-react";
import { PageHeader } from "../components/site/PageHeader";
import { CtaBanner } from "../components/site/CtaBanner";
import aboutImg from "../assets/about-port.jpg";

const values = [
  {
    icon: Compass,
    t: "Excellence",
    d: "Une exigence portée à chaque opération, du quai à la livraison.",
  },
  {
    icon: HeartHandshake,
    t: "Confiance",
    d: "Des relations durables avec nos clients, partenaires et équipages.",
  },
  {
    icon: Leaf,
    t: "Responsabilité",
    d: "Engagement environnemental dans nos opérations maritimes.",
  },
  {
    icon: Trophy,
    t: "Performance",
    d: "Optimisation continue des délais, coûts et qualité de service.",
  },
];

const team = [
  { name: "Rakoto Andrianasolo", role: "Directeur Général", initials: "RA" },
  { name: "Hery Razafimandimby", role: "Directeur Opérations", initials: "HR" },
  { name: "Naivo Rabe", role: "Responsable Flotte", initials: "NR" },
  { name: "Volana Andry", role: "Responsable Commercial", initials: "VA" },
];

function about() {
  return (
    <>
      <PageHeader
        eyebrow="À propos"
        title="Une histoire ancrée dans l'Océan Indien"
        subtitle="Depuis sa création, A.Fenovavy est devenue une référence du transport maritime malgache."
      />

      <section className="py-24 bg-background">
        <div className="container-pro grid lg:grid-cols-2 gap-14 items-center">
          <div className="relative">
            <div className="absolute -inset-3 bg-gradient-cta rounded-lg opacity-20 blur-2xl" />
            <img
              src={aboutImg}
              alt="Port de Madagascar"
              loading="lazy"
              className="relative rounded-lg shadow-elegant w-full aspect-[5/4] object-cover"
            />
          </div>
          <div>
            <p className="text-teal uppercase tracking-[0.3em] text-xs mb-3">
              Notre histoire
            </p>
            <h2 className="text-3xl md:text-5xl font-display font-semibold text-primary leading-tight">
              Vingt années à relier les rives de Madagascar.
            </h2>
            <div className="mt-6 space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Fondée à Toamasina, A.Fenovavy est née de la volonté d'offrir
                aux entreprises malgaches un transport maritime fiable, moderne
                et respectueux des standards internationaux.
              </p>
              <p>
                Aujourd'hui, notre flotte LCT et nos cargos polyvalents
                desservent les cinq grands ports du pays — Toamasina, Mahajanga,
                Morondava, Toliara et Nosy Be — ainsi que les principales
                destinations de l'Océan Indien.
              </p>
              <p>
                Forts d'une équipe locale expérimentée et d'un savoir-faire
                transmis de capitaine en capitaine, nous portons une ambition :
                faire de la mer un véritable trait d'union entre les
                territoires.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-muted/40">
        <div className="container-pro">
          <div className="max-w-2xl mb-14 text-center mx-auto">
            <p className="text-teal uppercase tracking-[0.3em] text-xs mb-3">
              Nos valeurs
            </p>
            <h2 className="text-3xl md:text-4xl font-display font-semibold text-primary">
              Le cap que nous suivons
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v) => (
              <div
                key={v.t}
                className="p-7 rounded-lg bg-card border border-border text-center"
              >
                <span className="inline-grid place-items-center h-14 w-14 rounded-full bg-primary text-gold">
                  <v.icon className="h-6 w-6" />
                </span>
                <h3 className="mt-5 font-semibold text-primary text-lg">
                  {v.t}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">{v.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-background">
        <div className="container-pro">
          <div className="max-w-2xl mb-14">
            <p className="text-teal uppercase tracking-[0.3em] text-xs mb-3">
              Notre équipe
            </p>
            <h2 className="text-3xl md:text-4xl font-display font-semibold text-primary">
              Des femmes et des hommes de la mer
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((m) => (
              <div
                key={m.name}
                className="p-6 rounded-lg bg-card border border-border text-center hover:border-secondary transition"
              >
                <div className="mx-auto h-20 w-20 rounded-full bg-gradient-cta grid place-items-center text-gold font-display text-2xl font-semibold">
                  {m.initials}
                </div>
                <div className="mt-4 font-semibold text-primary">{m.name}</div>
                <div className="text-sm text-muted-foreground">{m.role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CtaBanner />
    </>
  );
}

export default about;
