import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { videos, type Video } from "../data/videos";
import { bySlug, fullName } from "../data/products";

function Clip({ video }: { video: Video }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const product = video.product ? bySlug(video.product) : undefined;

  // Play only while the clip is on screen.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) el.play().catch(() => {});
        else el.pause();
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <li className="clip">
      <video ref={ref} src={video.src} poster={video.poster} muted={muted} loop playsInline preload="metadata" aria-label={video.title} />
      <button className="clip__sound" onClick={() => setMuted((m) => !m)} aria-pressed={!muted}>
        {muted ? "Turn sound on" : "Turn sound off"}
      </button>
      <p className="clip__title">
        {product ? <Link to={`/products/${product.slug}`}>{video.title || fullName(product)}</Link> : video.title}
      </p>
    </li>
  );
}

/** Strip of vertical videos. Renders nothing until src/data/videos.ts has entries. */
export default function VideoRail() {
  if (!videos.length) return null;
  return (
    <section className="band on-dark rail">
      <div className="wrap stack">
        <h2 className="title">In motion.</h2>
        <p className="lede">Short clips of the products in hand.</p>
      </div>
      <ul className="rail__track">
        {videos.map((v) => (
          <Clip key={v.src} video={v} />
        ))}
      </ul>
    </section>
  );
}
