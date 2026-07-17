// Route handled by react-router-dom
import {
  Anchor,
  Package,
  MapPin,
  Handshake,
  ShieldCheck,
  Truck,
  FileCheck,
  Globe2,
} from "lucide-react";
import { PageHeader } from "../components/site/PageHeader";
import { CtaBanner } from "../components/site/CtaBanner";

const main = [
  {
    icon: Anchor,
    title: "Transport de fret",
    desc: "Acheminement maritime de marchandises générales, conteneurs, vrac sec et liquide entre les ports malgaches et régionaux.",
  },
  {
    icon: Package,
    title: "Gestion de cargaison",
    desc: "Chargement, arrimage, calage, suivi documentaire et déchargement supervisé par nos équipes portuaires.",
  },
  {
    icon: MapPin,
    title: "Logistique inter-îles",
    desc: "Liaisons régulières et fiables entre Madagascar, les Comores, Mayotte, La Réunion et Maurice.",
  },
  {
    icon: Handshake,
    title: "Solutions sur mesure",
    desc: "Affrètement complet, transport de projet industriel, opérations spéciales pour secteurs miniers et énergétiques.",
  },
];

const extra = [
  {
    icon: ShieldCheck,
    t: "Conformité & certification",
    d: "Respect intégral des normes ISM, ISPS et MARPOL.",
  },
  {
    icon: Truck,
    t: "Pre/post-acheminement",
    d: "Coordination avec les transporteurs terrestres locaux.",
  },
  {
    icon: FileCheck,
    t: "Documentation douanière",
    d: "Préparation et suivi des formalités import/export.",
  },
  {
    icon: Globe2,
    t: "Conseil logistique",
    d: "Optimisation de vos flux maritimes et coûts de transport.",
  },
];

function services() {
  return (
    <>
      <PageHeader
        eyebrow="Nos services"
        title="Des solutions maritimes pensées pour l'Océan Indien"
        subtitle="De la pleine cargaison à l'opération sur mesure, nous concevons la chaîne logistique qui correspond à votre activité."
      />

      <section className="py-24 bg-background">
        <div className="container-pro grid md:grid-cols-2 gap-8">
          {main.map((s, i) => (
            <div
              key={s.title}
              className="p-8 rounded-lg bg-card border border-border hover:shadow-elegant transition"
            >
              <div className="flex items-center gap-4">
                <div className="grid place-items-center h-14 w-14 rounded-md bg-gradient-cta text-gold">
                  <s.icon className="h-7 w-7" />
                </div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground">
                  0{i + 1}
                </div>
              </div>
              <h3 className="mt-6 text-2xl font-display font-semibold text-primary">
                {s.title}
              </h3>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-24 bg-muted/40">
        <div className="container-pro">
          <div className="max-w-2xl mb-12">
            <p className="text-teal uppercase tracking-[0.3em] text-xs mb-3">
              Services complémentaires
            </p>
            <h2 className="text-3xl md:text-4xl font-display font-semibold text-primary">
              Au-delà du transport maritime
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {extra.map((f) => (
              <div
                key={f.t}
                className="p-6 rounded-lg bg-card border border-border"
              >
                <span className="grid place-items-center h-10 w-10 rounded-md bg-secondary/10 text-secondary">
                  <f.icon className="h-5 w-5" />
                </span>
                <div className="mt-4 font-semibold text-primary">{f.t}</div>
                <div className="text-sm text-muted-foreground mt-2">{f.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CtaBanner />
    </>
  );
}

export default services;
