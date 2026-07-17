import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Anchor, Menu, X } from "lucide-react";

const links = [
  { to: "/", label: "Accueil" },
  { to: "/services", label: "Services" },
  { to: "/flotte", label: "Notre Flotte" },
  { to: "/about", label: "À Propos" },
  { to: "/contact", label: "Contact" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-primary/95 backdrop-blur shadow-elegant"
          : "bg-transparent"
      }`}
    >
      <div className="container-pro flex h-20 items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-2 text-primary-foreground"
        >
          <span className="grid place-items-center h-10 w-10 rounded-md bg-gradient-cta border border-gold/40">
            <Anchor className="h-5 w-5 text-gold" />
          </span>
          <div className="leading-tight">
            <div className="font-display text-lg font-semibold tracking-wide">
              A.Fenovavy
            </div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-gold">
              Premium Express LCT
            </div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="text-sm font-medium text-primary-foreground/80 hover:text-gold transition-colors"
              activeOptions={{ exact: l.to === "/" }}
              activeProps={{ className: "text-gold" }}
            >
              {l.label}
            </Link>
          ))}
          <Link
            to="/contact"
            className="px-5 py-2.5 rounded-md bg-gold text-primary text-sm font-semibold hover:brightness-110 transition"
          >
            Demander un devis
          </Link>
        </nav>

        <button
          className="md:hidden text-primary-foreground"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-primary border-t border-primary-foreground/10">
          <div className="container-pro py-4 flex flex-col gap-3">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="py-2 text-primary-foreground/90 hover:text-gold"
              >
                {l.label}
              </Link>
            ))}
            <Link
              to="/contact"
              onClick={() => setOpen(false)}
              className="mt-2 px-5 py-2.5 text-center rounded-md bg-gold text-primary font-semibold"
            >
              Demander un devis
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
