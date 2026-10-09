import { useState, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { bySlug, fullName } from "../data/products";
import { site } from "../data/site";
import { usePage } from "../lib/hooks";

const topics = [
  { id: "product", label: "A product question" },
  { id: "wholesale", label: "Wholesale and distribution" },
  { id: "other", label: "Something else" },
];

type Status = { state: "idle" | "sending" | "sent" } | { state: "error"; message: string };

const errors: Record<string, string> = {
  invalid: "Add your name, a valid email address and a message, then send again.",
  rate_limited: "Too many messages came from this connection. Wait a few minutes and send again.",
  not_configured: "This form isn't connected to an inbox yet, so the message was not sent.",
  send_failed: "The message didn't go through. Send it again in a moment.",
};

export default function Contact() {
  usePage("Contact us", "Send Shred Master a message about a product or stocking the line in your store.");
  const [params] = useSearchParams();
  const product = bySlug(params.get("product") ?? "");
  const startTopic = product ? "product" : topics.find((t) => t.id === params.get("topic"))?.id ?? "product";

  const [status, setStatus] = useState<Status>({ state: "idle" });
  const [sentTo, setSentTo] = useState("");

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>;
    data.topic = topics.find((t) => t.id === data.topic)?.label ?? data.topic;
    setStatus({ state: "sending" });
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const body = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (res.ok && body.ok) {
        setSentTo(data.email);
        setStatus({ state: "sent" });
        form.reset();
      } else {
        setStatus({ state: "error", message: errors[body.error ?? ""] ?? errors.send_failed });
      }
    } catch {
      setStatus({ state: "error", message: "The message didn't go through. Check your connection and send again." });
    }
  }

  return (
    <>
      <section className="page-head">
        <div className="wrap stack">
          <h1 className="display">Contact us</h1>
          <p className="lede">
            Ask about a product or tell us about your store. We reply by email.
          </p>
        </div>
      </section>

      <div className="wrap contact">
        {status.state === "sent" ? (
          <div className="contact__done" role="status">
            <h2 className="heading">Message sent.</h2>
            <p className="muted">We will reply to {sentTo}.</p>
            <button className="btn btn--ghost" onClick={() => setStatus({ state: "idle" })}>
              Send another message
            </button>
          </div>
        ) : (
          <form className="form" onSubmit={submit} noValidate={false}>
            {product && (
              <p className="form__about">
                About: <strong>{fullName(product)}</strong>
                <input type="hidden" name="product" value={fullName(product)} />
              </p>
            )}
            <div className="form__row">
              <label className="field">
                <span>Name</span>
                <input name="name" type="text" autoComplete="name" required maxLength={120} />
              </label>
              <label className="field">
                <span>Email</span>
                <input name="email" type="email" autoComplete="email" required maxLength={200} />
              </label>
            </div>
            <div className="form__row">
              <label className="field">
                <span>
                  Store or company <em>optional</em>
                </span>
                <input name="company" type="text" autoComplete="organization" maxLength={160} />
              </label>
              <label className="field">
                <span>What is this about?</span>
                <select name="topic" defaultValue={startTopic}>
                  {topics.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label className="field">
              <span>Message</span>
              <textarea name="message" rows={6} required maxLength={5000} />
            </label>
            {/* Hidden from people; bots that fill it in are ignored by the server. */}
            <label className="form__trap" aria-hidden="true">
              Website
              <input name="website" type="text" tabIndex={-1} autoComplete="off" />
            </label>

            {status.state === "error" && (
              <p className="form__error" role="alert">
                {status.message}
                {site.email && (
                  <>
                    {" "}
                    You can also email <a href={`mailto:${site.email}`}>{site.email}</a>.
                  </>
                )}
              </p>
            )}
            <div className="actions">
              <button className="btn" type="submit" disabled={status.state === "sending"}>
                {status.state === "sending" ? "Sending…" : "Send message"}
              </button>
            </div>
          </form>
        )}

        <aside className="contact__side">
          <h2 className="heading">{site.email || site.phone ? "Other ways to reach us" : "For stores"}</h2>
          <dl className="contact__list">
            {site.email && (
              <div>
                <dt>Email</dt>
                <dd>
                  <a className="link" href={`mailto:${site.email}`}>
                    {site.email}
                  </a>
                </dd>
              </div>
            )}
            {site.phone && (
              <div>
                <dt>Phone</dt>
                <dd>
                  <a className="link" href={`tel:${site.phone.replace(/[^\d+]/g, "")}`}>
                    {site.phone}
                  </a>
                </dd>
              </div>
            )}
            <div>
              {(site.email || site.phone) && <dt>For stores</dt>}
              <dd>
                Most of the line ships in counter display boxes. Choose “Wholesale and distribution” in the form and
                include your store name and location.
              </dd>
            </div>
          </dl>
        </aside>
      </div>
    </>
  );
}
