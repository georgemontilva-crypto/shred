import { useEffect, useRef, useState, type CSSProperties } from "react";
import { bySlug, inSeries } from "../data/products";
import { swatchBg } from "../lib/swatch";
import { useReducedMotion } from "../lib/hooks";
import type { Finish, Focus, Grinder } from "../three/grinder";

/* "Take a closer look": a 3D grinder the visitor can turn by dragging,
   with a list of things to look at beside it. The 3D code loads only when
   the section is about to scroll into view. */

/** Model colours per finish: catcher, screen chamber, teeth chamber, lid. */
const FINISHES: Record<string, Finish> = {
  purple: ["#9d2db3", "#9d2db3", "#9d2db3", "#9d2db3"],
  green: ["#178f38", "#178f38", "#178f38", "#178f38"],
  rasta: ["#161618", "#c81c28", "#d99a14", "#178f38"],
  black: ["#161618", "#161618", "#161618", "#161618"],
  pink: ["#ee84a4", "#ee84a4", "#ee84a4", "#ee84a4"],
  silver: ["#c2c6cc", "#c2c6cc", "#c2c6cc", "#c2c6cc"],
  blue: ["#1f41bd", "#1f41bd", "#1f41bd", "#1f41bd"],
  red: ["#cf1a27", "#cf1a27", "#cf1a27", "#cf1a27"],
  gold: ["#d99a14", "#d99a14", "#d99a14", "#d99a14"],
};

type TopicId = "colors" | "sizes" | "apart" | "teeth" | "screen" | "catcher";

const topics: { id: TopicId; label: string; text: string; focus: Focus }[] = [
  { id: "colors", label: "Colors", text: "Nine finishes, from black to rasta.", focus: "closed" },
  { id: "sizes", label: "Four sizes", text: "The same grinder from 1.6″ to 4.0″ across.", focus: "sizes" },
  { id: "apart", label: "Take it apart", text: "Four pieces thread together: lid, teeth, screen and catcher.", focus: "apart" },
  { id: "teeth", label: "Teeth", text: "Sharp teeth shred evenly, and the holes between them drop the grind through.", focus: "teeth" },
  { id: "screen", label: "Screen", text: "A fine mesh screen sifts into the chamber below.", focus: "screen" },
  { id: "catcher", label: "Catcher", text: "The bottom chamber collects what falls through. A scraper comes with it.", focus: "catcher" },
];

export default function CloserLook() {
  const product = bySlug("aluminum-4-piece-grinder-medium")!;
  const variants = product.variants!;
  const sizes = inSeries("aluminum-4pc");
  const reduced = useReducedMotion();

  const [topic, setTopic] = useState<TopicId>("colors");
  const [color, setColor] = useState(product.defaultVariant!);
  const [size, setSize] = useState(product.slug);
  const [state, setState] = useState<"idle" | "ready" | "failed">("idle");
  const section = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const grinder = useRef<Grinder | null>(null);

  const current = variants.find((v) => v.id === color)!;
  const chosenSize = sizes.find((s) => s.slug === size)!;

  // Load and start the 3D model shortly before the section is reached.
  useEffect(() => {
    const el = section.current;
    if (!el) return;
    let cancelled = false;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        import("../three/grinder")
          .then(({ createGrinder }) => {
            if (cancelled || !canvas.current) return;
            grinder.current = createGrinder(canvas.current, { finish: FINISHES[product.defaultVariant!], reducedMotion: reduced });
            setState("ready");
          })
          .catch(() => !cancelled && setState("failed"));
      },
      { rootMargin: "700px 0px" },
    );
    io.observe(el);
    return () => {
      cancelled = true;
      io.disconnect();
      grinder.current?.dispose();
      grinder.current = null;
    };
    // The model is created once; later changes go through the effect below.
  }, []);

  useEffect(() => {
    const g = grinder.current;
    if (!g) return;
    g.setFinish(FINISHES[color]);
    g.setFocus(topics.find((t) => t.id === topic)!.focus);
    g.setScale(topic === "sizes" ? parseFloat(chosenSize.seriesLabel!) / 2.2 : 1);
  }, [color, topic, chosenSize, state]);

  return (
    <section ref={section} className="look on-dark" style={{ "--tone": current.tone } as CSSProperties}>
      <div className="wrap look__grid">
        <div className="look__side">
          <h2 className="title">Take a closer look.</h2>
          <ul className="look__list">
            {topics.map((t) => {
              const open = t.id === topic;
              return (
                <li key={t.id} className={`pill${open ? " is-open" : ""}`}>
                  <button className="pill__head" aria-expanded={open} onClick={() => setTopic(t.id)}>
                    {t.id === "colors" ? (
                      <span className="pill__dot" style={{ background: swatchBg(current.swatch) }} aria-hidden="true" />
                    ) : (
                      <span className="pill__plus" aria-hidden="true" />
                    )}
                    {t.label}
                  </button>
                  {open && (
                    <div className="pill__body">
                      <p>{t.text}</p>
                      {t.id === "colors" && (
                        <>
                          <div className="swatches" role="group" aria-label="Finish">
                            {variants.map((v) => (
                              <button
                                key={v.id}
                                className="swatch"
                                style={{ "--sw": swatchBg(v.swatch) } as CSSProperties}
                                aria-pressed={v.id === color}
                                aria-label={v.comingSoon ? `${v.name}, coming soon` : v.name}
                                onClick={() => setColor(v.id)}
                              />
                            ))}
                          </div>
                          <p className="pill__note" aria-live="polite">
                            {current.name}
                            {current.comingSoon && <span className="tag">Coming soon</span>}
                          </p>
                        </>
                      )}
                      {t.id === "sizes" && (
                        <>
                          <div className="look__sizes" role="group" aria-label="Size">
                            {sizes.map((s) => (
                              <button key={s.slug} className="look__size" aria-pressed={s.slug === size} onClick={() => setSize(s.slug)}>
                                {s.seriesLabel}
                              </button>
                            ))}
                          </div>
                          <p className="pill__note" aria-live="polite">
                            {chosenSize.label!.split(",")[0]}
                            {chosenSize.comingSoon && <span className="tag">Coming soon</span>}
                          </p>
                        </>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        <div className={`look__stage is-${state}`}>
          <div className="look__light" aria-hidden="true" />
          <canvas ref={canvas} className="look__canvas" role="img" aria-label={`3D model of the ${current.name.toLowerCase()} aluminum grinder. Drag to turn it.`} />
          {state === "failed" && <img className="look__fallback" src={current.image!.src} alt={current.image!.alt} loading="lazy" />}
          {state === "ready" && <p className="look__hint">Drag to turn it</p>}
        </div>
      </div>
    </section>
  );
}
