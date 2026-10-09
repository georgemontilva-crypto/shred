import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { bySlug } from "../data/products";
import pieceData from "../data/pieces.json";
import { swatchBg } from "../lib/swatch";
import { ageConfirmed, onAgeConfirmed } from "../lib/age";
import { useReducedMotion } from "../lib/hooks";

/* The home page opener: the medium aluminum grinder.
   - It arrives closed and opens into its four pieces.
   - The pieces float, and drift with the pointer for a sense of depth.
   - Scrolling pins the product and spotlights each piece in turn.
   - Picking a colour snaps the pieces together, swaps the finish and re-lights the stage.

   Every finish is pre-cut into four layers in /public/img/aluminum/pieces
   (positions in src/data/pieces.json). */

type PieceSet = { w: number; h: number; step: number[]; layers: { x: number; y: number; w: number; h: number }[] };
const sets = pieceData as Record<string, PieceSet>;

const parts = [
  { key: "lid", name: "Lid", text: "A ridged edge gives your fingers something to turn.", x: 93, y: 22 },
  { key: "teeth", name: "Teeth", text: "Sharp teeth shred evenly and drop the grind through.", x: 82, y: 45 },
  { key: "screen", name: "Screen", text: "A fine mesh screen sifts as you go.", x: 69, y: 68 },
  { key: "catcher", name: "Catcher", text: "The bottom chamber collects what falls through. Scraper included.", x: 57, y: 91 },
];

const CLOSE = 0.6; // how far the pieces travel toward each other when the grinder is shut
const DEPTH = [16, 6, -6, -16]; // pointer drift per piece, in px: the lid follows the pointer, the catcher goes the other way
const FLOAT = [7, 3, -3, -7]; // idle float per piece, in px along the grinder's axis

const clamp = (n: number) => Math.min(1, Math.max(0, n));
const ease = (t: number) => t * t * (3 - 2 * t);

function Pieces({ id, on, label, onReady }: { id: string; on: boolean; label: string; onReady?: () => void }) {
  const set = sets[id];
  const loaded = useRef(0);
  const ax = set.step[0] * set.w;
  const ay = set.step[1] * set.h;
  const len = Math.hypot(ax, ay);

  return (
    <div className={`hero__variant${on ? " is-on" : ""}`} role="img" aria-label={label} aria-hidden={!on}>
      <div className="hero__box" style={{ aspectRatio: `${set.w} / ${set.h}` }}>
        {[3, 2, 1, 0].map((k) => {
          const box = set.layers[k];
          const side = 1.5 - k; // lid 1.5 … catcher -1.5: distance from the middle of the stack
          return (
            <div
              key={k}
              className="piece"
              data-k={k + 1}
              style={
                {
                  left: `${box.x * 100}%`,
                  top: `${box.y * 100}%`,
                  width: `${box.w * 100}%`,
                  height: `${box.h * 100}%`,
                  "--cx": `${((-side * CLOSE * set.step[0]) / box.w) * 100}%`,
                  "--cy": `${((-side * CLOSE * set.step[1]) / box.h) * 100}%`,
                  "--i": k,
                  "--d": DEPTH[k],
                  "--fx": `${((ax / len) * FLOAT[k]).toFixed(1)}px`,
                  "--fy": `${((ay / len) * FLOAT[k]).toFixed(1)}px`,
                  "--dur": `${6 + k * 0.9}s`,
                } as CSSProperties
              }
            >
              <div className="piece__float">
                <img
                  src={`/img/aluminum/pieces/${id}-${parts[k].key}.webp`}
                  alt=""
                  decoding="async"
                  draggable={false}
                  onLoad={() => {
                    loaded.current += 1;
                    if (loaded.current === 4) onReady?.();
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function HeroStage() {
  const product = bySlug("aluminum-4-piece-grinder-medium")!;
  const variants = product.variants!;
  const first = product.defaultVariant!;
  const reduced = useReducedMotion();

  const [active, setActive] = useState(first);
  const [mounted, setMounted] = useState<string[]>([first]);
  const [step, setStep] = useState(0);
  const [ready, setReady] = useState(false);
  const [ageOk, setAgeOk] = useState(ageConfirmed);
  const [open, setOpen] = useState<"closed" | "open" | "snap">(reduced ? "open" : "closed");
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const snapTimer = useRef(0);

  const current = variants.find((v) => v.id === active)!;
  const hero = sets[first];

  const warm = (id: string) => setMounted((m) => (m.includes(id) ? m : [...m, id]));
  const pick = (id: string) => {
    warm(id);
    if (id === active) return;
    setActive(id);
    if (open !== "closed" && !reduced) {
      // Pieces pull together for a moment, then spring back in the new finish.
      setOpen("snap");
      window.clearTimeout(snapTimer.current);
      snapTimer.current = window.setTimeout(() => setOpen("open"), 220);
    }
  };

  useEffect(() => onAgeConfirmed(() => setAgeOk(true)), []);
  // Never leave the stage empty if an image is slow or fails.
  useEffect(() => {
    const t = window.setTimeout(() => setReady(true), 2500);
    return () => window.clearTimeout(t);
  }, []);
  useEffect(() => () => window.clearTimeout(snapTimer.current), []);

  // Open the grinder once its images are in and the visitor can actually see it.
  useEffect(() => {
    if (reduced) {
      setOpen("open");
      return;
    }
    if (!ready || !ageOk || open !== "closed") return;
    const t = window.setTimeout(() => setOpen("open"), 350);
    return () => window.clearTimeout(t);
  }, [ready, ageOk, reduced, open]);

  // Scroll: pin the product and step through the four pieces.
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

  // Pointer: the pieces drift by different amounts, which reads as depth.
  useEffect(() => {
    const el = section.current;
    const target = stage.current;
    if (!el || !target || reduced) return;
    let frame = 0;
    const want = { x: 0, y: 0 };
    const now = { x: 0, y: 0 };
    const tick = () => {
      now.x += (want.x - now.x) * 0.08;
      now.y += (want.y - now.y) * 0.08;
      target.style.setProperty("--px", now.x.toFixed(4));
      target.style.setProperty("--py", now.y.toFixed(4));
      frame = Math.abs(want.x - now.x) + Math.abs(want.y - now.y) > 0.002 ? requestAnimationFrame(tick) : 0;
    };
    const kick = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      want.x = (e.clientX / window.innerWidth) * 2 - 1;
      want.y = (e.clientY / window.innerHeight) * 2 - 1;
      kick();
    };
    const leave = () => {
      want.x = 0;
      want.y = 0;
      kick();
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
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
            <div className="hero__product" ref={stage} data-open={open} data-ready={ready || undefined}>
              {variants
                .filter((v) => mounted.includes(v.id))
                .map((v) => (
                  <Pieces
                    key={v.id}
                    id={v.id}
                    on={v.id === active}
                    label={v.image!.alt}
                    onReady={v.id === first ? () => setReady(true) : undefined}
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
