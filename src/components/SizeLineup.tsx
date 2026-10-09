import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import { inSeries } from "../data/products";
import Picture from "./Picture";

/* The four aluminum grinders drawn to scale against each other. */
export default function SizeLineup() {
  const sizes = inSeries("aluminum-4pc");
  return (
    <section className="band on-paper lineup">
      <div className="wrap center stack">
        <h2 className="title">One grinder, four sizes.</h2>
        <p className="lede">From 1.6″ for a pocket to 4.0″ for the table, shown here to scale.</p>
      </div>
      <div className="lineup__scroller">
        <ul className="lineup__row">
          {sizes.map((p) => {
            const inches = parseFloat(p.seriesLabel!);
            return (
              <li key={p.slug} style={{ "--in": inches } as CSSProperties}>
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
