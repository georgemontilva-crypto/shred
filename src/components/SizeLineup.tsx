import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { inSeries } from "../data/products";
import Picture from "./Picture";

/* The four aluminum grinders drawn to scale against each other.
   Each one sits on a soft glow of its own colour and rises into place
   the first time the section scrolls into view. */
export default function SizeLineup() {
  const sizes = inSeries("aluminum-4pc");
  const section = useRef<HTMLElement>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = section.current;
    if (!el || !("IntersectionObserver" in window)) {
      setSeen(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section ref={section} className={`band on-paper dotted lineup${seen ? " is-in" : ""}`}>
      <div className="wrap center stack">
        <h2 className="title">One grinder, four sizes.</h2>
        <p className="lede">From 1.6″ for a pocket to 4.0″ for the table, shown here to scale.</p>
      </div>
      <div className="lineup__scroller">
        <ul className="lineup__row">
          {sizes.map((p, n) => {
            const inches = parseFloat(p.seriesLabel!);
            const tone = p.variants?.find((v) => v.id === p.defaultVariant)?.tone ?? "#9aa3b0";
            return (
              <li key={p.slug} style={{ "--in": inches, "--n": n, "--tone": tone } as CSSProperties}>
                <Link to={`/products/${p.slug}`} className="lineup__item">
                  <span className="lineup__img">
                    <Picture image={p.image} />
                  </span>
                  <span className="lineup__inches">{p.seriesLabel}</span>
                  <span className="lineup__name">{p.label!.split(",")[0]}</span>
                  {p.comingSoon && <span className="tag">Coming soon</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
