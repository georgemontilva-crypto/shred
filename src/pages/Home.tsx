import { Link } from "react-router-dom";
import HeroStage from "../components/HeroStage";
import SizeLineup from "../components/SizeLineup";
import VideoRail from "../components/VideoRail";
import Picture from "../components/Picture";
import { bySlug, img, products } from "../data/products";
import { labReports } from "../lib/labReports";
import { usePage } from "../lib/hooks";

export default function Home() {
  usePage("Shred Master", "Shred Master grinders, storage jars and batteries. Browse the 2026 catalog and read the lab reports.");
  const moonlight = bySlug("moonlight-battery")!;

  return (
    <>
      <HeroStage />
      <SizeLineup />

      <section className="band">
        <div className="wrap">
          <div className="stack tiles__head">
            <h2 className="title">Then there's the rest of the catalog.</h2>
            <p className="lede">
              Grinders in hemp and acrylic, jars that seal, and batteries that show their charge. {products.length}{" "}
              products in all.
            </p>
          </div>

          <div className="tiles">
            <Link to="/products?family=hemp" className="tile tile--wide tile--row on-paper">
              <div className="tile__text">
                <h3 className="heading">Biodegradable hemp grinders</h3>
                <p className="muted">Made from hemp and closed by a magnet, in regular and pastel color mixes.</p>
                <span className="link">See the hemp grinders</span>
              </div>
              <Picture className="tile__img" image={img("hemp/4pc-pastel", "Pastel biodegradable hemp grinders")} />
            </Link>

            <Link to="/products?family=acrylic" className="tile on-paper">
              <div className="tile__text">
                <h3 className="heading">Acrylic grinders</h3>
                <p className="muted">See-through, magnetic, two or four pieces.</p>
                <span className="link">See the acrylic grinders</span>
              </div>
              <Picture className="tile__img" image={img("acrylic/2pc-24-hero", "Orange acrylic grinder with the lid off")} />
            </Link>

            <Link to="/products/moonlight-battery" className="tile tile--half on-dark">
              <div className="tile__text">
                <h3 className="heading">Moonlight battery</h3>
                <p className="muted">650 mAh, an LED digital display, and five colors.</p>
                <span className="link">See the Moonlight battery</span>
              </div>
              <div className="tile__pens" aria-hidden="true">
                {moonlight.variants!.map((v) => (
                  <Picture key={v.id} image={v.image!} decorative />
                ))}
              </div>
            </Link>

            <Link to="/products/storage-vac-jar" className="tile tile--half on-paper">
              <div className="tile__text">
                <h3 className="heading">Storage vac jar</h3>
                <p className="muted">A vacuum seal in seven sizes, from 60 mL to 2500 mL.</p>
                <span className="link">See the vac jar</span>
              </div>
              <Picture className="tile__img tile__img--flat" image={img("storage/vac-jar-sizes", "Seven storage vac jars in a row, smallest to largest")} />
            </Link>

            <Link to="/products/3-in-1-grinder-jar" className="tile on-dark">
              <div className="tile__text">
                <h3 className="heading">
                  <span className="nowrap">3-in-1</span> grinder jar
                </h3>
                <p className="muted">A jar, a grinder and an LED light in one.</p>
                <span className="link">See the 3-in-1</span>
              </div>
              <Picture className="tile__img tile__img--tall" image={img("storage/3in1-hero", "3-in-1 grinder jar taken apart with its LED lit")} />
            </Link>

            <Link to="/products/storage-grinder-jar" className="tile on-paper">
              <div className="tile__text">
                <h3 className="heading">Storage grinder jar</h3>
                <p className="muted">Air-tight, smell-proof, grinder built in.</p>
                <span className="link">See the grinder jar</span>
              </div>
              <Picture className="tile__img tile__img--tall" image={img("storage/grinder-jar-hero", "Red storage grinder jar taken apart")} />
            </Link>

            <Link to="/products/go2battery" className="tile on-paper">
              <div className="tile__text">
                <h3 className="heading">GO2Battery</h3>
                <p className="muted">400 mAh, three heat settings, USB charger built in.</p>
                <span className="link">See the GO2Battery</span>
              </div>
              <Picture className="tile__img tile__img--tall" image={img("battery/go2-device", "Black GO2Battery")} />
            </Link>
          </div>
        </div>
      </section>

      <VideoRail />

      <section className="band on-paper">
        <div className="wrap center stack">
          <h2 className="title">Read the lab reports.</h2>
          <p className="lede">
            {labReports.length
              ? "Test reports are posted by product, and every one is a PDF you can open or download."
              : "Test reports will be posted here by product as they are released."}
          </p>
          <div className="actions">
            <Link className="btn" to="/lab-reports">
              View lab reports
            </Link>
            <Link className="link" to="/contact">
              Ask us a question
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
