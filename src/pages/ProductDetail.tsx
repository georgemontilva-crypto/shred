import { useState, type CSSProperties } from "react";
import { Link, useParams } from "react-router-dom";
import Picture from "../components/Picture";
import Name from "../components/Name";
import ProductCard from "../components/ProductCard";
import NotFound from "./NotFound";
import { bySlug, families, familyOf, fullName, inSeries, products, type Product } from "../data/products";
import { swatchBg } from "../lib/swatch";
import { usePage } from "../lib/hooks";

export default function ProductDetail() {
  const { slug } = useParams();
  const product = slug ? bySlug(slug) : undefined;
  if (!product) return <NotFound />;
  // Keyed so the chosen colour resets when moving between products.
  return <Detail key={product.slug} product={product} />;
}

function Detail({ product }: { product: Product }) {
  usePage(fullName(product), product.description);
  const [variantId, setVariantId] = useState<string | null>(product.defaultVariant ?? null);
  const variant = product.variants?.find((v) => v.id === variantId);
  const image = variant?.image ?? product.image;
  const tone = variant?.tone ?? product.tone ?? "#9aa3b0";
  const family = familyOf(product.family);
  const siblings = inSeries(product.series);
  const sameLine = products.filter(
    (p) => p.family === product.family && p.slug !== product.slug && (!product.series || p.series !== product.series),
  );
  // Sizes of the same product are already linked above, so fall back to one product from each other line.
  const related = (
    sameLine.length ? sameLine : families.filter((f) => f.id !== product.family).map((f) => products.find((p) => p.family === f.id)!)
  ).slice(0, 3);
  const relatedTitle = sameLine.length ? `More ${family.name.toLowerCase()}` : "More from the catalog";

  return (
    <>
      <div className="wrap detail">
        <nav className="crumbs small" aria-label="Breadcrumb">
          <Link to="/products">Products</Link>
          <span aria-hidden="true">/</span>
          <Link to={`/products?family=${family.id}`}>{family.name}</Link>
        </nav>

        <div className="detail__grid">
          <div className="detail__stage" style={{ "--tone": tone } as CSSProperties}>
            <Picture key={image.src} image={image} eager className="detail__img" />
          </div>

          <div className="detail__info">
            {product.comingSoon && <span className="tag">Coming soon</span>}
            <h1 className="title">
              <Name text={product.name} />
            </h1>
            {product.label && <p className="detail__label">{product.label}</p>}
            <p className="lede">{product.description}</p>

            {product.variants && (
              <div className="detail__block">
                <h2 className="detail__sub">
                  {product.family === "hemp" ? "Color mix" : "Color"}
                  {variant && (
                    <span className="detail__chosen">
                      {variant.name}
                      {variant.comingSoon && <span className="tag">Coming soon</span>}
                    </span>
                  )}
                </h2>
                <div className="swatches">
                  {product.variants.map((v) => (
                    <button
                      key={v.id}
                      className="swatch"
                      style={{ "--sw": swatchBg(v.swatch) } as CSSProperties}
                      aria-pressed={v.id === variantId}
                      aria-label={v.comingSoon ? `${v.name}, coming soon` : v.name}
                      title={v.name}
                      onClick={() => setVariantId(v.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {product.colors && (
              <div className="detail__block">
                <h2 className="detail__sub">Colors</h2>
                <ul className="colorlist">
                  {product.colors.map((c) => (
                    <li key={c.name}>
                      <span className="swatch swatch--sm" style={{ "--sw": swatchBg(c.swatch) } as CSSProperties} />
                      {c.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {siblings.length > 1 && (
              <div className="detail__block">
                <h2 className="detail__sub">Size</h2>
                <div className="sizes">
                  {siblings.map((s) => (
                    <Link
                      key={s.slug}
                      to={`/products/${s.slug}`}
                      className="size"
                      aria-current={s.slug === product.slug ? "page" : undefined}
                    >
                      {s.seriesLabel}
                      {s.comingSoon && <span className="size__soon">Soon</span>}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div className="detail__block">
              <h2 className="detail__sub">What you get</h2>
              <ul className="features">
                {product.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </div>

            <div className="actions">
              <Link className="btn" to={`/contact?product=${product.slug}`}>
                Ask about this product
              </Link>
              <Link className="link" to={`/products?family=${family.id}`}>
                All {family.name.toLowerCase()}
              </Link>
            </div>
          </div>
        </div>
      </div>

      <section className="band on-paper specs">
        <div className="wrap specs__grid">
          <h2 className="title">Specs</h2>
          <dl className="spec-list">
            {product.specs.map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {product.gallery && (
        <section className="band">
          <div className="wrap">
            <h2 className="title">A closer look</h2>
            <div className={`gallery gallery--${Math.min(product.gallery.length, 3)}`}>
              {product.gallery.map((g) => (
                <figure key={g.src} className="gallery__item">
                  <Picture image={g} />
                  <figcaption className="small muted">{g.alt}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className={`band${product.gallery ? " on-paper" : ""}`}>
          <div className="wrap">
            <h2 className="title">{relatedTitle}</h2>
            <div className="cards cards--related">
              {related.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
