/**
 * Drawn artwork for the catalogue.
 *
 * Every piece is an SVG in the same palette and the same light as the shelf
 * in the hero, so the shop reads as one room rather than a grid of stock
 * photos. The moment the owner uploads a real photo it takes over and none
 * of this is rendered.
 *
 * Products are matched by slug first, then by shelf, so a product the owner
 * adds later still gets something drawn rather than an empty tile.
 */

type ArtProps = { className?: string };

const frame = {
  viewBox: "0 0 400 500",
  preserveAspectRatio: "xMidYMid meet",
  "aria-hidden": true,
} as const;

/** Soft contact shadow, so nothing floats. */
function Ground({ cx = 200, cy = 404, rx = 118 }) {
  return <ellipse className="art-shadow" cx={cx} cy={cy} rx={rx} ry="13" />;
}

/**
 * Light falling out of a shade. A flat wedge reads as a solid skirt, so the
 * throw fades out as it drops.
 */
function Throw({ id, d }: { id: string; d: string }) {
  return (
    <>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-lamp)" stopOpacity="0.26" />
          <stop offset="55%" stopColor="var(--color-lamp)" stopOpacity="0.08" />
          <stop offset="100%" stopColor="var(--color-lamp)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={d} fill={`url(#${id})`} />
    </>
  );
}

/* ------------------------------------------------------------------ *\
   Table and kitchen
\* ------------------------------------------------------------------ */

function DinnerPlate({ className }: ArtProps) {
  return (
    <svg {...frame} className={className}>
      <Ground rx={128} />
      {/* The plate leans, so it reads as an object rather than a circle. */}
      <ellipse className="art-object" cx="200" cy="252" rx="134" ry="120" />
      <ellipse className="art-deep" cx="200" cy="256" rx="104" ry="92" opacity="0.35" />
      <ellipse className="art-object" cx="200" cy="250" rx="96" ry="85" />
      <path
        className="art-line"
        d="M118 196a112 108 0 0 1 60-52"
        strokeWidth="3"
        opacity="0.55"
      />
    </svg>
  );
}

function ServingBoard({ className }: ArtProps) {
  return (
    <svg {...frame} className={className}>
      <Ground rx={92} />
      <g transform="rotate(-6 200 260)">
        <rect
          className="art-object"
          x="126"
          y="98"
          width="148"
          height="304"
          rx="26"
        />
        <circle className="art-deep" cx="200" cy="140" r="15" />
        {/* Grain follows the length of the board. */}
        <path
          className="art-line"
          d="M158 186c14 44 14 132 0 190M200 190c12 46 12 130 0 186M242 186c-14 44-14 132 0 190"
        />
      </g>
    </svg>
  );
}

/* ------------------------------------------------------------------ *\
   Linen
\* ------------------------------------------------------------------ */

function DuvetCover({ className }: ArtProps) {
  return (
    <svg {...frame} className={className}>
      <Ground rx={126} />
      {/* A folded stack. The soft corners are the whole point of linen. */}
      <rect className="art-object" x="76" y="322" width="248" height="78" rx="12" />
      <rect className="art-object" x="88" y="250" width="224" height="74" rx="12" />
      <rect className="art-object" x="100" y="182" width="200" height="70" rx="12" />
      {/* Folded edges on the left of each slab. */}
      <path
        className="art-line"
        d="M96 336c14 12 14 42 0 52M108 264c13 11 13 38 0 48M120 196c12 10 12 36 0 46"
      />
    </svg>
  );
}

function KitchenTowels({ className }: ArtProps) {
  return (
    <svg {...frame} className={className}>
      <path className="art-line" d="M84 118h232" strokeWidth="4" opacity="0.55" />
      {/* Two towels on a rail, hung apart. One plain, one with a stripe. */}
      <path
        className="art-line"
        d="M132 118a12 12 0 0 1 24 0M244 118a12 12 0 0 1 24 0"
        strokeWidth="5"
        opacity="0.8"
      />
      <rect className="art-object" x="106" y="126" width="76" height="256" rx="6" />
      <rect className="art-object" x="218" y="126" width="76" height="238" rx="6" />
      <rect className="art-deep" x="218" y="286" width="76" height="18" opacity="0.65" />
      {/* Hemmed bottom edge. */}
      <path className="art-line" d="M118 362h52M230 344h52" />
    </svg>
  );
}

/* ------------------------------------------------------------------ *\
   Light
\* ------------------------------------------------------------------ */

function DomePendant({ className }: ArtProps) {
  return (
    <svg {...frame} className={className}>
      {/* The light it throws is the reason to buy it. */}
      <Throw id="throw-pendant" d="M116 302h168l54 136H62Z" />
      <path className="art-line" d="M200 44v112" strokeWidth="3" opacity="0.7" />
      <path className="art-object" d="M104 300a96 100 0 0 1 192 0Z" />
      {/* Woven rattan, the reason the shadows are patterned. */}
      <path
        className="art-line"
        d="M112 270h176M124 238h152M146 208h108M170 182h60"
        opacity="0.6"
      />
      <ellipse className="art-glow" cx="200" cy="299" rx="88" ry="16" />
    </svg>
  );
}

function TableLamp({ className }: ArtProps) {
  return (
    <svg {...frame} className={className}>
      <Ground rx={70} />
      <Throw id="throw-lamp" d="M128 292h144l44 112H84Z" />
      {/* Cotton drum shade over a rounded ceramic body. */}
      <path className="art-object" d="M154 160h92l26 132H128Z" />
      <ellipse className="art-glow" cx="200" cy="291" rx="70" ry="9" />
      <rect className="art-deep" x="193" y="292" width="14" height="18" />
      <path
        className="art-object"
        d="M200 306c30 0 48 24 48 52v30c0 9-7 16-16 16h-64c-9 0-16-7-16-16v-30c0-28 18-52 48-52Z"
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ *\
   Baskets and storage
\* ------------------------------------------------------------------ */

function MarketBasket({ className }: ArtProps) {
  return (
    <svg {...frame} className={className}>
      <Ground rx={104} />
      {/* Two leather handles, stitched to the rim, one behind the other. */}
      <path
        className="art-line"
        d="M132 216c6-64 28-94 68-94s62 30 68 94"
        strokeWidth="11"
        opacity="0.5"
      />
      <path
        className="art-line"
        d="M152 218c5-54 22-80 48-80s43 26 48 80"
        strokeWidth="11"
        opacity="0.95"
      />
      <path className="art-object" d="M104 214h192l-26 190H130Z" />
      <rect className="art-deep" x="104" y="214" width="192" height="18" opacity="0.6" />
      <path className="art-line" d="M116 268h168M122 314h156M128 360h144" />
    </svg>
  );
}

function StorageBasket({ className }: ArtProps) {
  return (
    <svg {...frame} className={className}>
      <Ground rx={92} />
      <path className="art-object" d="M124 168h152l-16 236H140Z" />
      {/* The folded rim is what keeps a seagrass basket standing up. */}
      <path className="art-object" d="M118 148h164v34H118Z" />
      <path
        className="art-line"
        d="M146 196v198M174 194v202M202 194v204M230 194v202M258 196v198"
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ *\
   Lookup
\* ------------------------------------------------------------------ */

type Art = (props: ArtProps) => React.ReactElement;

const BY_SLUG: Record<string, Art> = {
  "stoneware-dinner-plate": DinnerPlate,
  "olive-wood-serving-board": ServingBoard,
  "washed-linen-duvet-cover": DuvetCover,
  "linen-kitchen-towels": KitchenTowels,
  "rattan-dome-pendant": DomePendant,
  "ceramic-table-lamp": TableLamp,
  "palm-leaf-market-basket": MarketBasket,
  "tall-storage-basket": StorageBasket,
};

/** Whatever the owner adds later still lands on its shelf's artwork. */
const BY_CATEGORY: Record<string, Art> = {
  "table-and-kitchen": DinnerPlate,
  linen: DuvetCover,
  light: TableLamp,
  baskets: StorageBasket,
};

export function hasArtwork(slug: string, categorySlug: string | null): boolean {
  return Boolean(BY_SLUG[slug] || (categorySlug && BY_CATEGORY[categorySlug]));
}

export function ProductArtwork({
  slug,
  categorySlug,
  name,
  className = "",
}: {
  slug: string;
  categorySlug: string | null;
  name: string;
  className?: string;
}) {
  const Art = BY_SLUG[slug] ?? (categorySlug ? BY_CATEGORY[categorySlug] : undefined);
  if (!Art) return null;

  return (
    <div className={`artwork goods-palette ${className}`}>
      <Art className="absolute inset-0 h-full w-full" />
      <span className="sr-only">Drawing of {name}</span>
    </div>
  );
}
