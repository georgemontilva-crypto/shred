import { Link } from "react-router-dom";
import { formatDate, groupedReports, labReports } from "../lib/labReports";
import { usePage } from "../lib/hooks";

export default function LabReports() {
  usePage("Lab reports", "Lab and test reports for Shred Master products, listed by product.");
  const groups = groupedReports();

  return (
    <>
      <section className="page-head">
        <div className="wrap stack">
          <h1 className="display">Lab reports</h1>
          <p className="lede">
            Test reports for Shred Master products, listed by product. Each one is a PDF you can open or download.
          </p>
        </div>
      </section>

      <div className="wrap reports-page">
        {labReports.length === 0 ? (
          <div className="empty">
            <h2 className="heading">No reports are posted yet.</h2>
            <p className="muted">
              Reports will be listed here by product as they are released. If you need one before then, ask us and we
              will send what we have.
            </p>
            <div className="actions">
              <Link className="btn" to="/contact?topic=lab">
                Request a report
              </Link>
              <Link className="link" to="/products">
                Browse products
              </Link>
            </div>
          </div>
        ) : (
          groups.map((g) => (
            <section key={g.name} className="reports-group">
              <h2 className="heading">{g.slug ? <Link to={`/products/${g.slug}`}>{g.name}</Link> : g.name}</h2>
              <ul className="reports">
                {g.reports.map((r) => (
                  <li key={r.url}>
                    <div className="report">
                      <span className="report__title">{r.title}</span>
                      {r.date && <span className="small muted">{formatDate(r.date)}</span>}
                      <span className="report__actions">
                        <a className="link" href={r.url} target="_blank" rel="noreferrer">
                          Open PDF
                        </a>
                        <a className="link" href={r.url} download={r.fileName}>
                          Download
                        </a>
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))
        )}
      </div>
    </>
  );
}
