"use client";

import { useEffect, useRef } from "react";

/**
 * The shop after closing, drawn in SVG. Scroll progress writes a single
 * custom property, --lit, and every gradient, fill and shadow in the CSS
 * reads from it. The listener is throttled with requestAnimationFrame and
 * only ever touches transforms and colours.
 *
 * Under prefers-reduced-motion no listener is attached at all and the
 * stylesheet pins --lit to 1, so the room arrives fully lit.
 */
export function HeroRoom() {
  const room = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = room.current;
    if (!node) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduced.matches) return;

    let ticking = false;
    let lastValue = -1;

    const update = () => {
      ticking = false;

      const travel = Math.max(node.offsetHeight * 0.85, 1);
      const progress = Math.min(Math.max(window.scrollY / travel, 0), 1);
      const lit = Math.round((0.35 + progress * 0.65) * 100) / 100;

      if (lit !== lastValue) {
        lastValue = lit;
        node.style.setProperty("--lit", String(lit));
      }
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div
      ref={room}
      className="room room-wall relative h-full min-h-[380px] w-full overflow-hidden sm:min-h-[460px] lg:min-h-[620px]"
    >
      {/* The lamplight itself. Screen blend keeps it reading as light. */}
      <div
        aria-hidden="true"
        className="room-halo pointer-events-none absolute left-1/2 top-[58%] h-[125%] w-[125%] mix-blend-screen"
      />

      {/* The viewBox is square so that the panel, which is roughly square on
          a wide screen and slightly taller on a phone, crops almost nothing
          off the sides of the shelf. */}
      <svg
        viewBox="0 0 760 760"
        preserveAspectRatio="xMidYMax slice"
        className="absolute inset-0 h-full w-full"
        role="img"
        aria-label="A shelf of plates, folded linen, a jug, a table lamp and a basket under a hanging rattan pendant."
      >
        <g transform="translate(0 240)">
        {/* Shadows cast on the shelf. They shorten as the lamp comes up. */}
        <g className="room-shadow">
          <ellipse cx="150" cy="433" rx="60" ry="6" />
          <ellipse cx="270" cy="433" rx="56" ry="6" />
          <ellipse cx="380" cy="433" rx="44" ry="6" />
          <ellipse cx="490" cy="433" rx="48" ry="6" />
          <ellipse cx="610" cy="433" rx="52" ry="6" />
        </g>

        {/* Pendant lamp */}
        <path className="room-cord" d="M380 -240v388" />
        <path className="room-dome" d="M320 210a60 62 0 0 1 120 0Z" />
        {/* Weave on the rattan dome */}
        <path className="room-weave" d="M328 190h104M336 172h88M350 158h60" />
        <ellipse className="room-bulb" cx="380" cy="209" rx="42" ry="9" />

        {/* Shelf */}
        <rect className="room-shelf" x="-40" y="430" width="840" height="4" />
        <rect className="room-baseboard" x="-40" y="434" width="840" height="10" />

        <g className="room-goods">
          {/* A stack of dinner plates */}
          <rect x="105" y="421" width="90" height="9" rx="4.5" />
          <rect x="107" y="411" width="86" height="9" rx="4.5" />
          <rect x="104" y="401" width="92" height="9" rx="4.5" />
          <rect x="109" y="391" width="82" height="9" rx="4.5" />

          {/* Folded linen */}
          <rect x="228" y="414" width="86" height="16" rx="3" />
          <rect x="231" y="397" width="80" height="16" rx="3" />
          <rect x="235" y="380" width="72" height="16" rx="3" />

          {/* Jug */}
          <path d="M352 430c-10 0-14-16-10-32l6-24h64l6 24c4 16 0 32-10 32Z" />
          <rect x="366" y="358" width="28" height="18" rx="3" />
          <path
            d="M412 384c14 2 18 12 14 22-3 8-10 10-16 10"
            fill="none"
            strokeWidth="4"
          />

          {/* Ceramic table lamp */}
          <path d="M456 404h68l-10-38h-48Z" />
          <rect x="484" y="404" width="12" height="14" />
          <path d="M466 430a24 24 0 0 1 48 0Z" />

          {/* Woven basket */}
          <path d="M574 384h72l-8 46h-56Z" />
          <path
            d="M578 400h64M580 414h60"
            fill="none"
            strokeWidth="1.5"
            opacity="0.55"
          />
          <path
            d="M578 386c6-12 16-18 34-18s28 6 34 18"
            fill="none"
            strokeWidth="3"
          />
        </g>
        </g>
      </svg>

      {/* Softens the seam where the room meets the text column. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-ground/85 via-transparent to-transparent"
      />
    </div>
  );
}
