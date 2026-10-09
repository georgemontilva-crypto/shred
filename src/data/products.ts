import sizes from "./imageSizes.json";

/* =========================================================================
   Every product on the site lives in this file.
   To change a name, description, colour or spec, edit it here and push.
   Images live in /public/img — to swap a photo, overwrite the file there.
   ========================================================================= */

export type Img = { src: string; w: number; h: number; alt: string };

export function img(key: string, alt: string): Img {
  const s = (sizes as unknown as Record<string, number[]>)[key];
  if (!s) throw new Error(`Unknown image "${key}"`);
  return { src: `/img/${key}.webp`, w: s[0], h: s[1], alt };
}

export type FamilyId = "aluminum" | "hemp" | "acrylic" | "storage" | "battery";

export const families: { id: FamilyId; name: string; short: string }[] = [
  { id: "aluminum", name: "Aluminum grinders", short: "Aluminum" },
  { id: "hemp", name: "Biodegradable hemp grinders", short: "Hemp" },
  { id: "acrylic", name: "Acrylic grinders", short: "Acrylic" },
  { id: "storage", name: "Storage", short: "Storage" },
  { id: "battery", name: "Batteries", short: "Batteries" },
];

export type Swatch = string | string[];

export type Variant = {
  id: string;
  name: string;
  swatch: Swatch;
  /** Colour of the light behind the product when this variant is selected. */
  tone?: string;
  image?: Img;
  comingSoon?: boolean;
};

export type Product = {
  slug: string;
  family: FamilyId;
  name: string;
  /** Short qualifier shown next to the name, e.g. the size. */
  label?: string;
  tagline: string;
  description: string;
  image: Img;
  tone?: string;
  /** Variants with their own photo. Picking one swaps the main image. */
  variants?: Variant[];
  defaultVariant?: string;
  /** Colours without their own photo. Shown as a list. */
  colors?: { name: string; swatch: Swatch }[];
  features: string[];
  specs: [string, string][];
  gallery?: Img[];
  comingSoon?: boolean;
  /** Products in the same series are linked as size options. */
  series?: string;
  seriesLabel?: string;
};

/* ---------- Aluminum 4-piece ---------- */

const anodize: Record<string, { name: string; swatch: Swatch; tone: string }> = {
  purple: { name: "Purple", swatch: "#a83bb6", tone: "#b23fc4" },
  green: { name: "Green", swatch: "#1f9a3d", tone: "#22b248" },
  rasta: { name: "Rasta", swatch: ["#1f9a3d", "#dfa21c", "#d61f2b"], tone: "#d9a11e" },
  black: { name: "Black", swatch: "#1b1b1d", tone: "#6a7385" },
  pink: { name: "Pink", swatch: "#ee8aa6", tone: "#f08fab" },
  silver: { name: "Silver", swatch: "#c4c7cc", tone: "#aab3c0" },
  blue: { name: "Blue", swatch: "#2748b5", tone: "#2f58e0" },
  red: { name: "Red", swatch: "#d61f2b", tone: "#e2222f" },
  gold: { name: "Gold", swatch: "#dfa21c", tone: "#e3a520" },
};

function aluminum(opts: {
  key: "small" | "medium" | "large" | "xl";
  sizeName: string;
  inches: string;
  colors: string[];
  hero: string;
  comingSoon?: boolean;
}): Product {
  const { key, sizeName, inches, colors, hero, comingSoon } = opts;
  const variants: Variant[] = colors.map((c) => ({
    id: c,
    ...anodize[c],
    image: img(`aluminum/${key}-${c}`, `${anodize[c].name} aluminum 4-piece grinder, ${sizeName.toLowerCase()}, shown taken apart`),
    comingSoon: !comingSoon && c === "gold",
  }));
  return {
    slug: `aluminum-4-piece-grinder-${key === "xl" ? "extra-large" : key}`,
    family: "aluminum",
    name: "Aluminum 4-piece grinder",
    label: `${sizeName}, ${inches}″`,
    tagline: "Four aluminum pieces: lid, teeth, screen and catcher.",
    description: `The ${sizeName.toLowerCase()} aluminum grinder measures ${inches}″ across. It comes apart into four pieces, with a mesh screen in the third and a scraper in the bottom chamber.`,
    image: variants.find((v) => v.id === hero)!.image!,
    variants,
    defaultVariant: hero,
    features: [
      "Four-piece build: lid, grinding teeth, screen chamber and catcher",
      "Mesh screen sifts into the bottom chamber",
      "Scraper included",
    ],
    specs: [
      ["Size", `${inches}″ (${sizeName.toLowerCase()})`],
      ["Pieces", "4"],
      ["Material", "Aluminum"],
      ["Colors", colors.map((c) => anodize[c].name).join(", ")],
    ],
    comingSoon,
    series: "aluminum-4pc",
    seriesLabel: `${inches}″`,
  };
}

const order = ["purple", "green", "rasta", "black", "pink", "silver", "blue", "red", "gold"];

/* ---------- Biodegradable hemp ---------- */

const regularMix: Swatch = ["#2a2a2c", "#d8404f", "#3d8fd6", "#3fa857", "#8a4fb0", "#9a9da2"];
const pastelMix: Swatch = ["#c9c3e6", "#f1c9c2", "#f2b98a", "#8ecbe6", "#8fd3a0", "#f07f9f"];

function hemp(opts: {
  key: "2pc" | "4pc" | "magnetic";
  slug: string;
  name: string;
  inches: string;
  pieces: number;
  pack: string;
  tagline: string;
  description: string;
  features: string[];
}): Product {
  const { key, slug, name, inches, pieces, pack, tagline, description, features } = opts;
  return {
    slug,
    family: "hemp",
    name,
    label: `${inches}″`,
    tagline,
    description,
    image: img(`hemp/${key}-regular`, `${name} in the regular color mix`),
    tone: "#7fb08a",
    variants: [
      { id: "regular", name: "Regular color mix", swatch: regularMix, tone: "#6f9bd0", image: img(`hemp/${key}-regular`, `${name} in the regular color mix`) },
      { id: "pastel", name: "Pastel color mix", swatch: pastelMix, tone: "#f2a6bb", image: img(`hemp/${key}-pastel`, `${name} in the pastel color mix`) },
    ],
    defaultVariant: "regular",
    features,
    specs: [
      ["Size", `${inches}″`],
      ["Pieces", String(pieces)],
      ["Material", "Biodegradable hemp"],
      ["Closure", "Magnet"],
      ["Display box", pack],
      ["Color mixes", "Regular, Pastel"],
    ],
    gallery: [
      img(`hemp/${key}-box-regular`, `${name} display box, regular color mix`),
      img(`hemp/${key}-box-pastel`, `${name} display box, pastel color mix`),
    ],
  };
}

/* ---------- Acrylic ---------- */

const acrylicTint: Record<string, { name: string; swatch: string }> = {
  clear: { name: "Clear", swatch: "#e8eaee" },
  blue: { name: "Blue", swatch: "#2c8fe0" },
  smoke: { name: "Smoke", swatch: "#5a5a5e" },
  orange: { name: "Orange", swatch: "#f58a1f" },
  red: { name: "Red", swatch: "#e0242e" },
  green: { name: "Green", swatch: "#4fc24a" },
  yellow: { name: "Yellow", swatch: "#e9b21a" },
};

function acrylic(opts: {
  key: string;
  pieces: 2 | 4;
  inches: string;
  pack: string;
  colors: string[];
  heroColor: string;
  tone: string;
  comingSoon?: boolean;
}): Product {
  const { key, pieces, inches, pack, colors, heroColor, tone, comingSoon } = opts;
  const name = `Acrylic ${pieces}-piece grinder`;
  return {
    slug: `acrylic-${pieces}-piece-grinder-${inches.replace(".", "-")}-inch`,
    family: "acrylic",
    name,
    label: `${inches}″`,
    tagline: pieces === 2 ? "See-through acrylic with a magnetic lid." : "Four see-through acrylic pieces with a magnetic lid.",
    description: `A ${inches}″ acrylic grinder in ${pieces} pieces, held together by a magnet. It ships to stores ${pack.toLowerCase()} in assorted colors.`,
    image: img(`acrylic/${key}-hero`, `${acrylicTint[heroColor].name} ${name.toLowerCase()}, ${inches} inch, lid off`),
    tone,
    colors: colors.map((c) => acrylicTint[c]),
    features: ["Magnetic closure", `${pieces}-piece build`, "Assorted colors in every display box"],
    specs: [
      ["Size", `${inches}″`],
      ["Pieces", String(pieces)],
      ["Material", "Acrylic"],
      ["Closure", "Magnet"],
      ["Display box", pack],
    ],
    gallery: [
      img(`acrylic/${key}-colors`, `${name} color range`),
      img(`acrylic/${key}-box`, `${name} display box`),
    ],
    comingSoon,
    series: `acrylic-${pieces}pc`,
    seriesLabel: `${inches}″`,
  };
}

/* ---------- The catalog ---------- */

export const products: Product[] = [
  aluminum({ key: "small", sizeName: "Small", inches: "1.6", colors: order, hero: "rasta" }),
  aluminum({ key: "medium", sizeName: "Medium", inches: "2.2", colors: order, hero: "purple" }),
  aluminum({ key: "large", sizeName: "Large", inches: "2.8", colors: order, hero: "red" }),
  aluminum({
    key: "xl",
    sizeName: "Extra large",
    inches: "4.0",
    colors: order.filter((c) => c !== "silver"),
    hero: "black",
    comingSoon: true,
  }),

  hemp({
    key: "2pc",
    slug: "biodegradable-hemp-grinder-2-piece",
    name: "Biodegradable hemp 2-piece grinder",
    inches: "2.2",
    pieces: 2,
    pack: "24 per box",
    tagline: "Two pieces of biodegradable hemp, now with a magnet.",
    description: "A 2.2″ two-piece grinder made from biodegradable hemp. A magnet keeps the lid on. Display boxes hold 24 in a regular or pastel color mix.",
    features: ["Made from biodegradable hemp", "Magnetic lid", "Regular and pastel color mixes"],
  }),
  hemp({
    key: "4pc",
    slug: "biodegradable-hemp-grinder-4-piece",
    name: "Biodegradable hemp 4-piece grinder",
    inches: "2.2",
    pieces: 4,
    pack: "16 per box",
    tagline: "The hemp grinder with a screen and a catcher.",
    description: "A 2.2″ four-piece grinder made from biodegradable hemp, with a screen and a bottom chamber. A magnet keeps the lid on. Display boxes hold 16 in a regular or pastel color mix.",
    features: ["Made from biodegradable hemp", "Four pieces with a screen and bottom chamber", "Magnetic lid", "Regular and pastel color mixes"],
  }),
  hemp({
    key: "magnetic",
    slug: "magnetic-hemp-grinder",
    name: "Magnetic hemp grinder",
    inches: "2.4",
    pieces: 2,
    pack: "12 per box",
    tagline: "A wider two-piece hemp grinder with a magnetic lid.",
    description: "A 2.4″ two-piece hemp grinder with a ridged edge and a magnetic lid. Display boxes hold 12 in a regular or pastel color mix.",
    features: ["Made from hemp", "Magnetic lid", "Ridged edge for grip", "Regular and pastel color mixes"],
  }),

  acrylic({ key: "2pc-24", pieces: 2, inches: "2.4", pack: "12 per box", colors: ["clear", "blue", "smoke", "orange", "red"], heroColor: "orange", tone: "#f58a1f" }),
  acrylic({ key: "2pc-25", pieces: 2, inches: "2.5", pack: "12 per box", colors: ["red", "blue", "clear", "green", "smoke", "yellow"], heroColor: "blue", tone: "#3aa8f0", comingSoon: true }),
  acrylic({ key: "2pc-30", pieces: 2, inches: "3", pack: "12 per box", colors: ["red", "blue", "clear", "green", "smoke", "yellow"], heroColor: "green", tone: "#4fc24a", comingSoon: true }),
  acrylic({ key: "4pc-20", pieces: 4, inches: "2", pack: "24 per box", colors: ["clear", "orange", "green", "blue", "red", "smoke"], heroColor: "red", tone: "#e0242e", comingSoon: true }),
  acrylic({ key: "4pc-25", pieces: 4, inches: "2.5", pack: "12 per box", colors: ["clear", "orange", "green", "blue", "red", "smoke"], heroColor: "smoke", tone: "#8a8f99", comingSoon: true }),

  {
    slug: "storage-vac-jar",
    family: "storage",
    name: "Storage vac jar",
    tagline: "Press the lid and the air comes out.",
    description:
      "Vacuum seal technology creates a smell-proof, air-tight seal, removing air and moisture to keep contents fresh and preserve flavor. Seven sizes, from 60 mL to 2500 mL.",
    image: img("storage/vac-jar-hero", "Clear storage vac jar with its red vacuum lid lifted off"),
    tone: "#e2222f",
    variants: [
      { id: "black", name: "Black", swatch: "#161618", tone: "#6a7385", image: img("storage/vac-jar-black", "Black storage vac jar") },
      { id: "white", name: "White", swatch: "#f4f4f4", tone: "#c8ced8", image: img("storage/vac-jar-white", "White storage vac jar") },
      { id: "blue", name: "Blue", swatch: "#1663e6", tone: "#2a72f2", image: img("storage/vac-jar-blue", "Blue storage vac jar") },
      { id: "red", name: "Red", swatch: "#e21f1f", tone: "#e2222f", image: img("storage/vac-jar-red", "Red storage vac jar") },
      { id: "green", name: "Green", swatch: "#27b33a", tone: "#2cc442", image: img("storage/vac-jar-green", "Green storage vac jar") },
      { id: "purple", name: "Purple", swatch: "#8a3fd1", tone: "#9548e0", image: img("storage/vac-jar-purple", "Purple storage vac jar") },
    ],
    features: ["Vacuum seal lid", "Smell-proof and air-tight", "Removes air and moisture", "Seven sizes"],
    specs: [
      ["Sizes", "60 mL, 120 mL, 300 mL, 550 mL, 650 mL, 1350 mL, 2500 mL"],
      ["Item codes", "TWG-60ML to TWG-2500ML"],
      ["Seal", "Vacuum"],
      ["Colors", "Black, White, Blue, Red, Green, Purple"],
    ],
    gallery: [img("storage/vac-jar-sizes", "The seven storage vac jar sizes side by side, from 60 mL to 2500 mL")],
  },
  {
    slug: "3-in-1-grinder-jar",
    family: "storage",
    name: "3-in-1 grinder jar",
    tagline: "A jar, a grinder and a light in one.",
    description:
      "A storage jar with a grinder built into the base, a magnifying top and an LED light inside. The jar lifts out, and a one-hitter pipe is tucked into the bottom. The charger is included.",
    image: img("storage/3in1-hero", "Black 3-in-1 grinder jar taken apart, with the LED lit"),
    tone: "#cfe3ff",
    colors: [
      { name: "Blue", swatch: "#2b45b8" },
      { name: "Red", swatch: "#e0242e" },
      { name: "Green", swatch: "#7ac143" },
      { name: "White", swatch: "#eeeadd" },
      { name: "Purple", swatch: "#6a3fb0" },
      { name: "Black", swatch: "#1b1b1d" },
      { name: "Orange", swatch: "#f0702a" },
      { name: "Light blue", swatch: "#2aa6e0" },
    ],
    features: ["Magnifying top", "LED light", "Removable jar", "Built-in grinder", "Hidden one-hitter pipe", "Charger included"],
    specs: [
      ["In one piece", "Jar, grinder, LED light"],
      ["Extras", "Hidden one-hitter pipe, charger"],
      ["Colors", "Blue, Red, Green, White, Purple, Black, Orange, Light blue"],
    ],
    gallery: [
      img("storage/3in1-colors", "The eight colors of the 3-in-1 grinder jar"),
      img("storage/3in1-pipe", "Underside of a red 3-in-1 grinder jar with the one-hitter pipe in its slot"),
      img("storage/3in1-one-hitter", "The aluminum one-hitter pipe"),
    ],
  },
  {
    slug: "storage-grinder-jar",
    family: "storage",
    name: "Storage grinder jar",
    tagline: "A sealed jar with the grinder built in.",
    description: "An air-tight, smell-proof jar with its own grinder inside, so storage and grinding stay in one container.",
    image: img("storage/grinder-jar-hero", "Red storage grinder jar taken apart to show the grinder teeth"),
    tone: "#e2222f",
    colors: [
      { name: "Purple", swatch: "#6a3fb0" },
      { name: "Black", swatch: "#1b1b1d" },
      { name: "Red", swatch: "#e0242e" },
      { name: "Blue", swatch: "#2a5fc4" },
      { name: "Yellow", swatch: "#f2d11c" },
      { name: "Green", swatch: "#7ac143" },
    ],
    features: ["Air-tight and smell-proof", "Self-contained jar with built-in grinder"],
    specs: [
      ["Seal", "Air-tight, smell-proof"],
      ["Colors", "Purple, Black, Red, Blue, Yellow, Green"],
    ],
    gallery: [img("storage/grinder-jar-colors", "The six colors of the storage grinder jar")],
  },
  {
    slug: "joint-storage",
    family: "storage",
    name: "Joint storage",
    label: "3 or 5 joints",
    tagline: "A hard case that carries three or five.",
    description: "A matte black case with a separate tube for each joint. It comes in a three-joint and a five-joint size.",
    image: img("storage/joint-storage", "Black five-joint and three-joint storage cases, the smaller one open"),
    tone: "#7b8494",
    features: ["Separate tube for each joint", "Pull-off cap", "Two sizes"],
    specs: [
      ["Sizes", "3 joint, 5 joint"],
      ["Color", "Black"],
    ],
  },

  {
    slug: "moonlight-battery",
    family: "battery",
    name: "Moonlight battery",
    label: "650 mAh",
    tagline: "A 650 mAh pen battery with an LED digital display.",
    description:
      "The Moonlight Edition of the GO2Battery. A 650 mAh pen-style battery for 510-thread cartridges with an LED digital display. The charger is in the box.",
    image: img("battery/moonlight-box", "Moonlight battery in Nebula Blush with its retail and display boxes"),
    tone: "#f08fb8",
    variants: [
      { id: "space-black", name: "Space Black", swatch: "#17171a", tone: "#6a7385", image: img("battery/moonlight-space-black", "Moonlight battery in Space Black") },
      { id: "cosmic-crimson", name: "Cosmic Crimson", swatch: "#7a1420", tone: "#b3202f", image: img("battery/moonlight-cosmic-crimson", "Moonlight battery in Cosmic Crimson") },
      { id: "stardust-azure", name: "Stardust Azure", swatch: "#27307f", tone: "#3a49d1", image: img("battery/moonlight-stardust-azure", "Moonlight battery in Stardust Azure") },
      { id: "celestial-steel", name: "Celestial Steel", swatch: "#c9ccd1", tone: "#aab3c0", image: img("battery/moonlight-celestial-steel", "Moonlight battery in Celestial Steel") },
      { id: "nebula-blush", name: "Nebula Blush", swatch: "#e874a6", tone: "#f08fb8", image: img("battery/moonlight-nebula-blush", "Moonlight battery in Nebula Blush") },
    ],
    features: ["650 mAh battery", "LED digital display", "Charger included"],
    specs: [
      ["Battery", "650 mAh"],
      ["Display", "LED digital"],
      ["Thread", "510"],
      ["In the box", "Battery, charger"],
      ["Display box", "10 per box"],
      ["Colors", "Space Black, Cosmic Crimson, Stardust Azure, Celestial Steel, Nebula Blush"],
    ],
  },
  {
    slug: "go2battery",
    family: "battery",
    name: "GO2Battery",
    label: "400 mAh",
    tagline: "Powerful, compact, discreet.",
    description:
      "A palm-sized 400 mAh battery that fits 510 cartridges. It has three heat settings, a preheat mode and a USB charger built into the body.",
    image: img("battery/go2-device", "Black GO2Battery with a cartridge seated in it"),
    tone: "#19c3e6",
    features: [
      "400 mAh battery",
      "Built-in USB charger",
      "Three heat settings: 3.3 V, 3.6 V and 4.2 V",
      "Preheat “sesh” mode",
      "Fits 510 cartridges",
    ],
    specs: [
      ["Battery", "400 mAh"],
      ["Heat settings", "3.3 V, 3.6 V, 4.2 V"],
      ["Charging", "Built-in USB"],
      ["Thread", "510"],
      ["Controls", "5 clicks on or off, 3 clicks change heat, 2 clicks sesh mode"],
      ["Display box", "10 per box"],
    ],
    gallery: [img("battery/go2-box", "GO2Battery 10-count display box")],
  },
];

export const bySlug = (slug: string) => products.find((p) => p.slug === slug);
export const familyOf = (id: FamilyId) => families.find((f) => f.id === id)!;
export const inSeries = (series?: string) => (series ? products.filter((p) => p.series === series) : []);
export const fullName = (p: Product) => (p.label ? `${p.name}, ${p.label}` : p.name);
