import { Link } from "@tanstack/react-router";
import { Anchor, Mail, MapPin, Phone, Facebook, Linkedin, Instagram } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container-pro py-16 grid md:grid-cols-4 gap-10">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="grid place-items-center h-10 w-10 rounded-md bg-gradient-cta border border-gold/40">
              <Anchor className="h-5 w-5 text-gold" />
            </span>
            <div className="font-display text-lg font-semibold">A.Fenovavy</div>
          </div>
          <p className="text-sm text-primary-foreground/70 leading-relaxed">
            Premium Express LCT — Votre partenaire de confiance pour le transport maritime à Madagascar et dans l'Océan Indien.
          </p>
          <div className="flex gap-3 mt-5">
            {[Facebook, Linkedin, Instagram].map((Icon, i) => (
              <a key={i} href="#" className="grid place-items-center h-9 w-9 rounded-full border border-primary-foreground/20 hover:bg-gold hover:text-primary hover:border-gold transition">
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm uppercase tracking-widest text-gold mb-4">Navigation</h4>
          <ul className="space-y-2 text-sm text-primary-foreground/80">
            <li><Link to="/" className="hover:text-gold">Accueil</Link></li>
            <li><Link to="/services" className="hover:text-gold">Services</Link></li>
            <li><Link to="/flotte" className="hover:text-gold">Notre Flotte</Link></li>
            <li><Link to="/about" className="hover:text-gold">À Propos</Link></li>
            <li><Link to="/contact" className="hover:text-gold">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm uppercase tracking-widest text-gold mb-4">Ports desservis</h4>
          <ul className="space-y-2 text-sm text-primary-foreground/80">
            <li>Toamasina</li>
            <li>Mahajanga</li>
            <li>Morondava</li>
            <li>Toliara</li>
            <li>Nosy Be</li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm uppercase tracking-widest text-gold mb-4">Contact</h4>
          <ul className="space-y-3 text-sm text-primary-foreground/80">
            <li className="flex items-start gap-2"><MapPin className="h-4 w-4 mt-0.5 text-gold shrink-0" /> Port de Toamasina, Madagascar</li>
            <li className="flex items-start gap-2"><Phone className="h-4 w-4 mt-0.5 text-gold shrink-0" /> +261 20 00 000 00</li>
            <li className="flex items-start gap-2"><Mail className="h-4 w-4 mt-0.5 text-gold shrink-0" /> contact@afenovavy.mg</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-primary-foreground/10">
        <div className="container-pro py-6 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-primary-foreground/60">
          <p>© {new Date().getFullYear()} A.Fenovavy — Premium Express LCT. Tous droits réservés.</p>
          <p>Madagascar · Océan Indien</p>
        </div>
      </div>
    </footer>
  );
}
