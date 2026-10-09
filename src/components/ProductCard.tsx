import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import type { Product } from "../data/products";
import { swatchBg } from "../lib/swatch";
import Picture from "./Picture";
import Name from "./Name";

export default function ProductCard({ product }: { product: Product }) {
  const dots = product.variants ?? product.colors ?? [];
  return (
    <Link to={`/products/${product.slug}`} className="card" style={{ "--tone": product.tone ?? "#9aa3b0" } as CSSProperties}>
      <span className="card__stage">
        {product.comingSoon && <span className="tag card__tag">Coming soon</span>}
        <Picture image={product.image} className="card__img" />
      </span>
      <span className="card__body">
        <span className="card__name">
          <Name text={product.name} />
        </span>
        {product.label && <span className="card__label">{product.label}</span>}
        {dots.length > 1 && (
          <span className="card__dots" aria-label={`${dots.length} colors`}>
            {dots.map((d) => (
              <span key={d.name} className="swatch swatch--sm" style={{ "--sw": swatchBg(d.swatch) } as CSSProperties} />
            ))}
          </span>
        )}
      </span>
    </Link>
  );
}
