import { bySlug, fullName, products } from "../data/products";

/* Lab reports are picked up automatically from /src/lab-reports.
   See the README in that folder for how to add one. */

export type LabReport = {
  url: string;
  title: string;
  /** ISO date taken from the file name, if it starts with one. */
  date?: string;
  productSlug?: string;
  productName: string;
  fileName: string;
};

const files = import.meta.glob("/src/lab-reports/**/*.pdf", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

function titleFrom(file: string): { title: string; date?: string } {
  let base = file.replace(/\.pdf$/i, "");
  let date: string | undefined;
  const m = base.match(/^(\d{4}-\d{2}-\d{2})[-_ ]+(.*)$/);
  if (m) {
    date = m[1];
    base = m[2];
  }
  const words = base.replace(/[-_]+/g, " ").trim();
  return { title: words.charAt(0).toUpperCase() + words.slice(1), date };
}

export const labReports: LabReport[] = Object.entries(files)
  .map(([path, url]) => {
    const parts = path.replace("/src/lab-reports/", "").split("/");
    const fileName = parts[parts.length - 1];
    const folder = parts.length > 1 ? parts[0] : "";
    const product = bySlug(folder);
    return {
      url,
      fileName,
      ...titleFrom(fileName),
      productSlug: product?.slug,
      productName: product ? fullName(product) : "All products",
    };
  })
  .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? "") || a.title.localeCompare(b.title));

export const reportsFor = (slug: string) => labReports.filter((r) => r.productSlug === slug);

/** Reports grouped by product, in catalog order, with general reports first. */
export function groupedReports(): { name: string; slug?: string; reports: LabReport[] }[] {
  const groups: { name: string; slug?: string; reports: LabReport[] }[] = [];
  const general = labReports.filter((r) => !r.productSlug);
  if (general.length) groups.push({ name: "All products", reports: general });
  for (const p of products) {
    const reports = reportsFor(p.slug);
    if (reports.length) groups.push({ name: fullName(p), slug: p.slug, reports });
  }
  return groups;
}

export function formatDate(iso?: string): string {
  if (!iso) return "";
  const d = new Date(`${iso}T12:00:00`);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}
