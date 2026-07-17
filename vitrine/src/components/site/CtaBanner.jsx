import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import ctaPort from "../../assets/cta-port.jpg";

export function CtaBanner() {
  return (
    <section className="relative overflow-hidden">
      <img
        src={ctaPort}
        alt=""
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-cta opacity-90" />
      <div className="relative container-pro py-20 md:py-28 text-center text-primary-foreground">
        <p className="text-gold uppercase tracking-[0.3em] text-xs mb-4">
          Démarrons votre projet
        </p>
        <h2 className="text-3xl md:text-5xl font-display font-semibold max-w-3xl mx-auto leading-tight">
          Vous avez un projet de fret ? Parlons-en.
        </h2>
        <p className="mt-5 text-primary-foreground/80 max-w-xl mx-auto">
          Notre équipe vous accompagne dans la conception d'une solution
          logistique sur mesure, adaptée à vos volumes et délais.
        </p>
        <Link
          to="/contact"
          className="mt-8 inline-flex items-center gap-2 px-7 py-3.5 rounded-md bg-gold text-primary font-semibold hover:brightness-110 transition shadow-elegant"
        >
          Nous contacter <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
