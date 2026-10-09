import express from "express";
import compression from "compression";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dist = path.resolve(__dirname, "..", "dist");
const port = Number(process.env.PORT) || 3000;

const app = express();
app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use(compression());
app.use(express.json({ limit: "20kb" }));

app.get("/api/health", (_req, res) => res.json({ ok: true }));

/* ---------- Contact form ----------
   Sends through Resend when RESEND_API_KEY, CONTACT_TO and CONTACT_FROM are set. */
const hits = new Map();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;

function limited(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > MAX_PER_WINDOW;
}

const clean = (v, max) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const esc = (s) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

app.post("/api/contact", async (req, res) => {
  const body = req.body || {};
  // Honeypot: real people never fill this field.
  if (clean(body.website, 200)) return res.json({ ok: true });

  const name = clean(body.name, 120);
  const email = clean(body.email, 200);
  const company = clean(body.company, 160);
  const topic = clean(body.topic, 80);
  const product = clean(body.product, 160);
  const message = clean(body.message, 5000);

  if (!name || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ ok: false, error: "invalid" });
  }
  if (limited(req.ip || "unknown")) {
    return res.status(429).json({ ok: false, error: "rate_limited" });
  }

  const { RESEND_API_KEY, CONTACT_TO, CONTACT_FROM } = process.env;
  if (!RESEND_API_KEY || !CONTACT_TO || !CONTACT_FROM) {
    console.warn("[contact] Missing RESEND_API_KEY, CONTACT_TO or CONTACT_FROM; message not sent.");
    return res.status(503).json({ ok: false, error: "not_configured" });
  }

  const rows = [
    ["Name", name],
    ["Email", email],
    ["Company", company],
    ["Topic", topic],
    ["Product", product],
  ].filter(([, v]) => v);

  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: CONTACT_FROM,
        to: CONTACT_TO.split(",").map((s) => s.trim()).filter(Boolean),
        reply_to: email,
        subject: `Website message from ${name}${topic ? ` (${topic})` : ""}`,
        text: `${rows.map(([k, v]) => `${k}: ${v}`).join("\n")}\n\n${message}`,
        html: `<table cellpadding="6" style="font-family:sans-serif;font-size:14px">${rows
          .map(([k, v]) => `<tr><td style="color:#666">${k}</td><td>${esc(v)}</td></tr>`)
          .join("")}</table><p style="font-family:sans-serif;font-size:15px;white-space:pre-wrap">${esc(message)}</p>`,
      }),
    });
    if (!r.ok) {
      console.error("[contact] Resend error", r.status, await r.text());
      return res.status(502).json({ ok: false, error: "send_failed" });
    }
    return res.json({ ok: true });
  } catch (err) {
    console.error("[contact] Request failed", err);
    return res.status(502).json({ ok: false, error: "send_failed" });
  }
});

app.use("/api", (_req, res) => res.status(404).json({ ok: false, error: "not_found" }));

/* ---------- Static site ---------- */
if (!fs.existsSync(path.join(dist, "index.html"))) {
  console.error("dist/ not found. Run `npm run build` before `npm start`.");
  process.exit(1);
}

app.use(
  "/assets",
  express.static(path.join(dist, "assets"), { immutable: true, maxAge: "1y", fallthrough: false }),
);
app.use(express.static(dist, { maxAge: "1h", index: false }));

// Single-page app: every other GET returns index.html and the router takes over.
app.use((req, res, next) => {
  if (req.method !== "GET" && req.method !== "HEAD") return next();
  if (path.extname(req.path)) return res.status(404).type("text/plain").send("Not found");
  res.setHeader("Cache-Control", "no-cache");
  res.sendFile(path.join(dist, "index.html"));
});

app.listen(port, "0.0.0.0", () => console.log(`Shred Master running on port ${port}`));
