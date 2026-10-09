import { useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { families, products, type FamilyId } from "../data/products";
import { usePage } from "../lib/hooks";

export default function Products() {
  usePage("Products", "The Shred Master catalog: aluminum, hemp and acrylic grinders, storage jars and batteries.");
  const [params, setParams] = useSearchParams();
  const requested = params.get("family");
  const active = families.find((f) => f.id === requested)?.id ?? null;

  const choose = (id: FamilyId | null) => setParams(id ? { family: id } : {}, { replace: true });
  const shown = active ? families.filter((f) => f.id === active) : families;

  return (
    <>
      <section className="page-head">
        <div className="wrap stack">
          <h1 className="display">Products</h1>
          <p className="lede">
            The 2026 catalog: {products.length} products across {families.length} lines.
          </p>
        </div>
      </section>

      <div className="filters">
        <div className="wrap">
          <div className="chips" role="group" aria-label="Filter by product line">
            <button className="chip" aria-pressed={!active} onClick={() => choose(null)}>
              All
            </button>
            {families.map((f) => (
              <button key={f.id} className="chip" aria-pressed={active === f.id} onClick={() => choose(f.id)}>
                {f.short}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="wrap catalog">
        {shown.map((f) => (
          <section key={f.id} className="catalog__group" aria-labelledby={`line-${f.id}`}>
            <h2 id={`line-${f.id}`} className="heading">
              {f.name}
            </h2>
            <div className="cards">
              {products
                .filter((p) => p.family === f.id)
                .map((p) => (
                  <ProductCard key={p.slug} product={p} />
                ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
