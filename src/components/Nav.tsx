import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import Logo from "./Logo";

const links = [
  { to: "/", label: "Home" },
  { to: "/products", label: "Products" },
  { to: "/about", label: "About us" },
  { to: "/contact", label: "Contact us" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header className={`nav on-dark${open ? " is-open" : ""}`}>
        <div className="nav__bar wrap">
          <Link to="/" className="nav__logo" aria-label="Shred Master home">
            <Logo className="nav__logo-svg" />
          </Link>
          <nav className="nav__links" aria-label="Main">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.to === "/"} className="nav__link">
                {l.label}
              </NavLink>
            ))}
          </nav>
          <button
            className="nav__toggle"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            <span />
            <span />
          </button>
        </div>
      </header>
      {/* Kept outside the header on purpose: Safari positions "fixed" elements inside a
          blurred (backdrop-filter) parent relative to that parent, which squeezed the menu
          into the height of the bar. */}
      <nav id="mobile-menu" className="nav__sheet on-dark" aria-label="Main" hidden={!open}>
        {links.map((l) => (
          <NavLink key={l.to} to={l.to} end={l.to === "/"} className="nav__sheet-link" onClick={() => setOpen(false)}>
            {l.label}
          </NavLink>
        ))}
      </nav>
    </>
  );
}
