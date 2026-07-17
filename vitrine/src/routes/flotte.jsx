// Route handled by react-router-dom
import { Ship, Anchor, Route as RouteIcon, Gauge } from "lucide-react";
import { PageHeader } from "../components/site/PageHeader";
import { CtaBanner } from "../components/site/CtaBanner";
import f1 from "../assets/fleet-1.jpg";
import f2 from "../assets/fleet-2.jpg";
import f3 from "../assets/fleet-3.jpg";

const ships = [
  {
    name: "MV Fenovavy I",
    type: "LCT — Landing Craft Tank",
    capacity: "1 200 t",
    route: "Toamasina ↔ Nosy Be",
    img: f1,
  },
  {
    name: "MV Antsiva",
    type: "Cargo polyvalent",
    capacity: "2 800 t",
    route: "Toamasina ↔ La Réunion",
    img: f2,
  },
  {
    name: "MV Soa Fianatra",
    type: "LCT côtier",
    capacity: "850 t",
    route: "Mahajanga ↔ Morondava ↔ Toliara",
    img: f3,
  },
  {
    name: "MV Hasina",
    type: "Cargo conteneurs",
    capacity: "1 600 EVP",
    route: "Toamasina ↔ Mayotte ↔ Comores",
    img: f1,
  },
  {
    name: "MV Vatosoa",
    type: "LCT lourd",
    capacity: "1 500 t",
    route: "Toamasina ↔ Sainte-Marie",
    img: f2,
  },
  {
    name: "MV Tana Express",
    type: "Roulier RoRo",
    capacity: "120 véhicules",
    route: "Toamasina ↔ Maurice",
    img: f3,
  },
];

function flotte() {
  return (
    <>
      <PageHeader
        eyebrow="Notre flotte"
        title="Des navires conçus pour les côtes malgaches"
        subtitle="Notre flotte combine LCT polyvalents, cargos conteneurs et rouliers — adaptés aux exigences variées de l'Océan Indien."
      />

      <section className="py-24 bg-background">
        <div className="container-pro grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {ships.map((s) => (
            <article
              key={s.name}
              className="group rounded-lg overflow-hidden bg-card border border-border shadow-card hover:shadow-elegant transition"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={s.img}
                  alt={s.name}
                  loading="lazy"
                  className="h-full w-full object-cover group-hover:scale-105 transition duration-700"
                />
                <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-primary/80 backdrop-blur text-primary-foreground text-xs uppercase tracking-widest border border-gold/30">
                  Actif
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-display font-semibold text-primary">
                  {s.name}
                </h3>
                <p className="text-sm text-secondary font-medium mt-1">
                  {s.type}
                </p>
                <dl className="mt-5 space-y-3 text-sm">
                  <div className="flex items-center gap-3">
                    <Gauge className="h-4 w-4 text-gold" />
                    <dt className="text-muted-foreground w-24">Capacité</dt>
                    <dd className="font-medium text-primary">{s.capacity}</dd>
                  </div>
                  <div className="flex items-center gap-3">
                    <RouteIcon className="h-4 w-4 text-gold" />
                    <dt className="text-muted-foreground w-24">Lignes</dt>
                    <dd className="font-medium text-primary">{s.route}</dd>
                  </div>
                  <div className="flex items-center gap-3">
                    <Anchor className="h-4 w-4 text-gold" />
                    <dt className="text-muted-foreground w-24">Pavillon</dt>
                    <dd className="font-medium text-primary">Madagascar</dd>
                  </div>
                </dl>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="py-20 bg-muted/40">
        <div className="container-pro grid md:grid-cols-3 gap-8 text-center">
          {[
            { icon: Ship, v: "12+", l: "Navires en flotte" },
            { icon: Anchor, v: "5", l: "Ports d'attache" },
            { icon: RouteIcon, v: "20+", l: "Lignes desservies" },
          ].map((x) => (
            <div key={x.l} className="p-8">
              <x.icon className="h-8 w-8 text-secondary mx-auto" />
              <div className="text-4xl font-display font-semibold text-primary mt-3">
                {x.v}
              </div>
              <div className="text-sm text-muted-foreground mt-1">{x.l}</div>
            </div>
          ))}
        </div>
      </section>

      <CtaBanner />
    </>
  );
}

export default flotte;
