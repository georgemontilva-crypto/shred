import { Link } from "react-router-dom";
import Logo from "./Logo";
import { families } from "../data/products";
import { site } from "../data/site";

export default function Footer() {
  return (
    <footer className="footer on-dark">
      <div className="wrap">
        <div className="footer__top">
          <div className="footer__brand">
            <Logo className="footer__logo" />
            <p className="small muted">Grinders, storage and batteries.</p>
          </div>
          <nav aria-label="Products">
            <h2 className="footer__head">Products</h2>
            <ul>
              {families.map((f) => (
                <li key={f.id}>
                  <Link to={`/products?family=${f.id}`}>{f.name}</Link>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label="Company">
            <h2 className="footer__head">Shred Master</h2>
            <ul>
              <li>
                <Link to="/about">About us</Link>
              </li>
              <li>
                <Link to="/lab-reports">Lab reports</Link>
              </li>
              <li>
                <Link to="/contact">Contact us</Link>
              </li>
              {site.instagram && (
                <li>
                  <a href={site.instagram} target="_blank" rel="noreferrer">
                    Instagram
                  </a>
                </li>
              )}
              {site.tiktok && (
                <li>
                  <a href={site.tiktok} target="_blank" rel="noreferrer">
                    TikTok
                  </a>
                </li>
              )}
            </ul>
          </nav>
        </div>
        <div className="footer__legal small muted">
          <p>
            Shred Master products are for adults {site.minimumAge} and over. Batteries are sold as devices only and
            contain no nicotine, cannabis or other consumable material. Use where legal and keep out of reach of
            children.
          </p>
          <p>
            © {new Date().getFullYear()} Shred Master. {site.domain}
          </p>
        </div>
      </div>
    </footer>
  );
}
