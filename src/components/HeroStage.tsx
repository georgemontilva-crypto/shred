import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { bySlug } from "../data/products";
import { swatchBg } from "../lib/swatch";
import { useReducedMotion } from "../lib/hooks";

/* The home page opener: the medium aluminum grinder, taken apart.
   Scrolling pins the product and walks through its four pieces;
   picking a colour swaps the render and re-lights the stage. */

const parts = [
  { name: "Lid", text: "A ridged edge gives your fingers something to turn.", x: 93, y: 22 },
  { name: "Teeth", text: "Sharp teeth shred evenly and drop the grind through.", x: 82, y: 45 },
  { name: "Screen", text: "A fine mesh screen sifts as you go.", x: 69, y: 68 },
  { name: "Catcher", text: "The bottom chamber collects what falls through. Scraper included.", x: 57, y: 91 },
];

const clamp = (n: number) => Math.min(1, Math.max(0, n));
const ease = (t: number) => t * t * (3 - 2 * t);

export default function HeroStage() {
  const product = bySlug("aluminum-4-piece-grinder-medium")!;
  const variants = product.variants!;
  const [active, setActive] = useState(product.defaultVariant!);
  const [mounted, setMounted] = useState<string[]>([product.defaultVariant!]);
  const [step, setStep] = useState(0);
  const section = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  const current = variants.find((v) => v.id === active)!;
  const hero = variants.find((v) => v.id === product.defaultVariant)!.image!;

  const warm = (id: string) => setMounted((m) => (m.includes(id) ? m : [...m, id]));
  const pick = (id: string) => {
    warm(id);
    setActive(id);
  };

  useEffect(() => {
    const el = section.current;
    if (!el || reduced) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const sticky = el.firstElementChild as HTMLElement;
      const rect = el.getBoundingClientRect();
      const top = parseFloat(getComputedStyle(sticky).top) || 0;
      const travel = rect.height - sticky.offsetHeight;
      const p = travel > 0 ? clamp((top - rect.top) / travel) : 0;
      el.style.setProperty("--intro", String(clamp(1 - p / 0.12)));
      el.style.setProperty("--shift", String(ease(clamp((p - 0.06) / 0.16))));
      setStep(p < 0.22 ? 0 : Math.min(4, 1 + Math.floor((p - 0.22) / 0.195)));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [reduced]);

  return (
    <section
      ref={section}
      className={`hero on-dark${reduced ? " hero--static" : ""}`}
      style={{ "--tone": current.tone, "--ratio": `${hero.w} / ${hero.h}`, "--ratio-n": hero.h / hero.w } as CSSProperties}
      data-step={reduced ? 5 : step}
    >
      <div className="hero__sticky">
        <div className="hero__mesh" aria-hidden="true" />

        <div className="hero__intro">
          <p className="hero__kicker">Aluminum 4-piece grinder</p>
          <h1 className="hero__title">Four pieces. Nine finishes.</h1>
        </div>

        <div className="hero__stage">
          <div className="hero__rig">
            <div className="hero__light" aria-hidden="true" />
            <div className="hero__product">
              {variants
                .filter((v) => mounted.includes(v.id))
                .map((v) => (
                  <img
                    key={v.id}
                    className={v.id === active ? "is-on" : ""}
                    src={v.image!.src}
                    alt={v.id === active ? v.image!.alt : ""}
                    aria-hidden={v.id !== active}
                    decoding="async"
                    draggable={false}
                  />
                ))}
              {parts.map((part, i) => (
                <span
                  key={part.name}
                  className={`hero__dot${step === i + 1 ? " is-on" : ""}`}
                  style={{ left: `${part.x}%`, top: `${part.y}%` }}
                  aria-hidden="true"
                >
                  {i + 1}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="hero__picker">
          <div className="swatches" role="group" aria-label="Finish">
            {variants.map((v) => (
              <button
                key={v.id}
                className="swatch"
                style={{ "--sw": swatchBg(v.swatch) } as CSSProperties}
                aria-pressed={v.id === active}
                aria-label={v.comingSoon ? `${v.name}, coming soon` : v.name}
                onClick={() => pick(v.id)}
                onPointerEnter={() => warm(v.id)}
                onFocus={() => warm(v.id)}
              />
            ))}
          </div>
          <p className="hero__finish" aria-live="polite">
            {current.name}
            {current.comingSoon && <span className="tag">Coming soon</span>}
          </p>
          <div className="actions hero__actions">
            <Link className="btn btn--light" to={`/products/${product.slug}`}>
              See the grinder
            </Link>
            <Link className="link" to="/products">
              Browse all products
            </Link>
          </div>
        </div>

        <div className="hero__parts">
          <h2 className="hero__parts-title">Four pieces, each with a job.</h2>
          <ol>
            {parts.map((part, i) => (
              <li key={part.name} className={step === i + 1 ? "is-on" : ""}>
                <span className="hero__num" aria-hidden="true">
                  {i + 1}
                </span>
                <div>
                  <h3>{part.name}</h3>
                  <p>{part.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
