import { Link } from "react-router-dom";
import { usePage } from "../lib/hooks";

export default function NotFound() {
  usePage("Page not found");
  return (
    <section className="page-head page-head--solo">
      <div className="wrap stack">
        <h1 className="display">This page doesn't exist.</h1>
        <p className="lede">The link may be old, or the address may have a typo.</p>
        <div className="actions">
          <Link className="btn" to="/products">
            Browse products
          </Link>
          <Link className="link" to="/">
            Go to the home page
          </Link>
        </div>
      </div>
    </section>
  );
}
