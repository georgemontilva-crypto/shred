import { Link } from "react-router-dom";
import Picture from "../components/Picture";
import { bySlug, families, img, products } from "../data/products";
import { usePage } from "../lib/hooks";

export default function About() {
  usePage("About us", "Shred Master makes grinders, storage jars and batteries. Here is what is in the line and how to reach us.");
  const moonlight = bySlug("moonlight-battery")!;

  return (
    <>
      <section className="page-head page-head--dark on-dark">
        <div className="wrap stack">
          <h1 className="display">Built for the daily grind.</h1>
          <p className="lede">
            Shred Master makes grinders, storage and batteries. The 2026 catalog holds {products.length} products across{" "}
            {families.length} lines, from a 1.6″ aluminum grinder to a 2500 mL vacuum jar.
          </p>
        </div>
      </section>

      <section className="band">
        <div className="wrap">
          <h2 className="title about__title">What we make</h2>
          <div className="trio">
            <article className="trio__item">
              <div className="trio__stage on-paper">
                <Picture image={img("aluminum/large-red", "Red aluminum grinder taken apart")} />
              </div>
              <h3 className="heading">Grinders</h3>
              <p className="muted">
                Aluminum in four sizes and nine finishes. Biodegradable hemp in regular and pastel color mixes. Acrylic
                you can see through.
              </p>
              <Link className="link" to="/products?family=aluminum">
                See the grinders
              </Link>
            </article>
            <article className="trio__item">
              <div className="trio__stage on-paper">
                <Picture image={img("storage/vac-jar-hero", "Storage vac jar with its lid lifted")} />
              </div>
              <h3 className="heading">Storage</h3>
              <p className="muted">
                Vacuum-seal jars in seven sizes, jars with a grinder built in, and hard cases for three or five joints.
              </p>
              <Link className="link" to="/products?family=storage">
                See the storage line
              </Link>
            </article>
            <article className="trio__item">
              <div className="trio__stage on-dark">
                <div className="trio__pens">
                  {moonlight.variants!.slice(1, 4).map((v) => (
                    <Picture key={v.id} image={v.image!} />
                  ))}
                </div>
              </div>
              <h3 className="heading">Batteries</h3>
              <p className="muted">
                Two batteries for 510 cartridges: the Moonlight, with an LED digital display, and the palm-sized
                GO2Battery.
              </p>
              <Link className="link" to="/products?family=battery">
                See the batteries
              </Link>
            </article>
          </div>
        </div>
      </section>

      <section className="band on-paper">
        <div className="wrap notes">
          <h2 className="title">The details we care about</h2>
          <dl className="notes__list">
            <div>
              <dt>Lids that stay shut</dt>
              <dd>The hemp and acrylic grinders close with a magnet, so the lid stays put.</dd>
            </div>
            <div>
              <dt>Nothing extra to buy</dt>
              <dd>Aluminum grinders come with a scraper. Batteries come with their charger, or have one built in.</dd>
            </div>
            <div>
              <dt>A color for everyone</dt>
              <dd>
                Nine aluminum finishes, two hemp color mixes, six vac jar colors and five Moonlight colors. Pick the
                one that looks like yours.
              </dd>
            </div>
            <div>
              <dt>Reports you can read</dt>
              <dd>
                Lab reports are posted on this site by product. <Link className="link" to="/lab-reports">View lab reports</Link>
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="band">
        <div className="wrap center stack">
          <h2 className="title">Stocking Shred Master in your store?</h2>
          <p className="lede">
            Most of the line ships in counter display boxes of 10 to 24, with colors assorted. Tell us about your shop
            and we will get back to you.
          </p>
          <div className="actions">
            <Link className="btn" to="/contact?topic=wholesale">
              Contact us
            </Link>
            <Link className="link" to="/products">
              Browse products
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
