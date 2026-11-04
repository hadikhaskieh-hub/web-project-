import React, { useEffect, useState } from 'react';
import {
  AbsoluteFill,
  continueRender,
  delayRender,
  Img,
  interpolate,
  interpolateColors,
  staticFile,
  useCurrentFrame,
} from 'remotion';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/inter/800.css';
import '@fontsource/bodoni-moda/600.css';
import '@fontsource/bodoni-moda/700.css';
import '@fontsource/bodoni-moda/800.css';
import { B, ease, inOut, pop, TOTAL_FRAMES } from './timing';

/* ------------------------------------------------------------------ */
/* Palette: reference's iOS black/white UI + Dose of Lashes accents     */
/* ------------------------------------------------------------------ */
const C = {
  black: '#000000',
  ink: '#141110', // price-list tag black, used for tiles + text
  white: '#FFFFFF',
  logoBg: '#F2F2F2', // exact background of the supplied logo file
  card: '#F2F2F7', // iOS grouped grey
  hairline: '#E5E5EA',
  grey: '#8E8E93',
  grey2: '#3C3C43',
  bubbleIn: '#26262A',
  peach: '#F5B567', // price-list price colour
  red: '#FF3B30', // iOS calendar red
};

const SANS = "Inter, 'Noto Color Emoji', sans-serif";
const SERIF = "'Bodoni Moda', serif";

/* ------------------------------------------------------------------ */
/* Shared bits                                                         */
/* ------------------------------------------------------------------ */

/** Word-by-word blur reveal, the reference's text style. */
const Words: React.FC<{
  f: number;
  start: number;
  text: string;
  stagger?: number;
  dur?: number;
  style?: React.CSSProperties;
  wordStyle?: (w: string, i: number) => React.CSSProperties | undefined;
}> = ({ f, start, text, stagger = 2.5, dur = 6, style, wordStyle }) => {
  const words = text.split(' ');
  return (
    <span style={style}>
      {words.map((w, i) => {
        const s = start + i * stagger;
        const o = ease(f, s, s + dur);
        return (
          <React.Fragment key={i}>
            <span
              style={{
                display: 'inline-block',
                opacity: o,
                filter: `blur(${(1 - o) * 10}px)`,
                transform: `translateY(${(1 - o) * 12}px)`,
                ...(wordStyle ? wordStyle(w, i) : undefined),
              }}
            >
              {w}
            </span>
            {i < words.length - 1 ? ' ' : null}
          </React.Fragment>
        );
      })}
    </span>
  );
};

const LashIcon: React.FC<{ size: number; color?: string }> = ({ size, color = C.ink }) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <path d="M14 40 Q50 74 86 40" fill="none" stroke={color} strokeWidth={5} strokeLinecap="round" />
    {[
      [22, 50, 14, 62],
      [35, 58, 31, 72],
      [50, 61, 50, 76],
      [65, 58, 69, 72],
      [78, 50, 86, 62],
    ].map(([x1, y1, x2, y2], i) => (
      <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={5} strokeLinecap="round" />
    ))}
  </svg>
);

const SearchIcon: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke={C.ink} strokeWidth="2.6" />
    <line x1="15.5" y1="15.5" x2="21" y2="21" stroke={C.ink} strokeWidth="2.6" strokeLinecap="round" />
  </svg>
);

const CalendarGlyph: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <rect x="3" y="5" width="18" height="16" rx="3.5" fill={C.ink} />
    <rect x="5.5" y="10" width="13" height="8.5" rx="1.2" fill={C.white} />
    <rect x="7" y="2.5" width="2.4" height="5" rx="1.2" fill={C.ink} />
    <rect x="14.6" y="2.5" width="2.4" height="5" rx="1.2" fill={C.ink} />
  </svg>
);

const WhatsAppGlyph: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 32 32">
    <path
      d="M16 3C8.8 3 3 8.6 3 15.6c0 2.5.8 4.9 2.1 6.9L3.6 29l6.7-1.7c1.7.9 3.7 1.4 5.7 1.4 7.2 0 13-5.6 13-12.6S23.2 3 16 3z"
      fill={C.ink}
    />
    <path
      d="M11.6 9.6c-.3-.6-.6-.6-.9-.6h-.8c-.3 0-.7.1-1.1.5-.4.4-1.4 1.3-1.4 3.3s1.4 3.8 1.6 4.1c.2.3 2.8 4.4 6.9 6 3.4 1.3 4.1 1.1 4.8 1 .7-.1 2.4-1 2.7-1.9.3-.9.3-1.7.2-1.9-.1-.2-.4-.3-.8-.5s-2.4-1.2-2.7-1.3c-.4-.1-.6-.2-.9.2-.3.4-1 1.3-1.2 1.5-.2.3-.4.3-.8.1-.4-.2-1.7-.6-3.2-2-1.2-1-2-2.3-2.2-2.7-.2-.4 0-.6.2-.8l.6-.7c.2-.2.3-.4.4-.7.1-.3.1-.5 0-.7-.1-.2-.9-2.2-1.4-3z"
      fill={C.peach}
    />
  </svg>
);

/** iMessage-ish bubble tail. */
const Tail: React.FC<{ side: 'in' | 'out'; color: string }> = ({ side, color }) => (
  <svg
    width={44}
    height={40}
    viewBox="0 0 44 40"
    style={{
      position: 'absolute',
      bottom: -2,
      [side === 'in' ? 'left' : 'right']: -14,
      transform: side === 'out' ? 'scaleX(-1)' : undefined,
    }}
  >
    <path d="M30 0 C30 20 22 32 0 40 C22 40 36 34 44 24 L44 0 Z" fill={color} />
  </svg>
);

/* ------------------------------------------------------------------ */
/* Scene 1: chat hook (beats 0-16)                                     */
/* ------------------------------------------------------------------ */
const FS = 56;
const LH = 70;
const PY = 30;
const PX = 44;
const CHAT_Y0 = 800;

type Msg = {
  side: 'in' | 'out';
  at: number; // beat the message pops
  typingAt?: number; // beat the typing dots appear
  lines: string[];
  top: number;
  h: number;
};

const MSGS: Msg[] = [
  { side: 'in', at: 0, lines: ["Guess who's having", 'a sale? 👀'], top: 0, h: 2 * LH + 2 * PY },
  { side: 'out', at: 4, typingAt: 2, lines: ['Wait… lashes?? 😳'], top: 224, h: LH + 2 * PY },
  { side: 'in', at: 8, typingAt: 6, lines: ['November Lash Sale 🖤'], top: 378, h: LH + 2 * PY },
];
// The 4th message ("ALL Full Sets $35") is the hero element below.
const HERO_SLOT_TOP = 532;
const HERO_TYPING_AT = 10;
const HERO_AT = 12;

const chatScroll = (f: number) =>
  120 * ease(f, B(4) - 1, B(4) + 13, 0, 1, inOut) +
  140 * ease(f, B(8) - 1, B(8) + 13, 0, 1, inOut) +
  160 * ease(f, B(12) - 1, B(12) + 13, 0, 1, inOut);

const bubbleEnter = (f: number, start: number) => {
  const p = pop(f, start, { damping: 15, stiffness: 190 });
  return {
    p,
    opacity: Math.min(1, p * 2.2),
    transform: `translateY(${(1 - p) * 50}px) scale(${0.55 + 0.45 * p}) rotate(${(1 - p) * -7}deg)`,
    filter: `blur(${Math.max(0, 1 - p) * 14}px)`,
  };
};

const TypingBubble: React.FC<{ f: number; start: number; end: number; side: 'in' | 'out' }> = ({
  f,
  start,
  end,
  side,
}) => {
  if (f < start || f > end + 4) return null;
  const e = bubbleEnter(f, start);
  const out = ease(f, end - 3, end + 2);
  const bg = side === 'in' ? C.bubbleIn : C.peach;
  const dot = side === 'in' ? '#8E8E93' : 'rgba(20,17,16,0.55)';
  return (
    <div
      style={{
        position: 'relative',
        width: 170,
        height: 100,
        borderRadius: 50,
        background: bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 14,
        opacity: e.opacity * (1 - out),
        transform: `${e.transform} scale(${1 - out * 0.3})`,
        filter: e.filter,
        transformOrigin: side === 'in' ? 'bottom left' : 'bottom right',
      }}
    >
      {[0, 1, 2].map((i) => {
        const ph = Math.sin((f - start) / 3.2 - i * 0.9);
        return (
          <div
            key={i}
            style={{
              width: 20,
              height: 20,
              borderRadius: 10,
              background: dot,
              opacity: 0.55 + 0.45 * Math.max(0, ph),
              transform: `translateY(${-Math.max(0, ph) * 7}px)`,
            }}
          />
        );
      })}
      <Tail side={side} color={bg} />
    </div>
  );
};

const ChatScene: React.FC<{ f: number }> = ({ f }) => {
  if (f > B(16) + 6) return null;
  const scroll = chatScroll(f);
  const exit = ease(f, B(14), B(14) + 8);
  const stamp = ease(f, 0, 8);
  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: CHAT_Y0 - 70 - scroll,
          textAlign: 'center',
          fontFamily: SANS,
          fontSize: 30,
          fontWeight: 500,
          color: C.grey,
          opacity: stamp * (1 - exit),
        }}
      >
        Today 8:36 PM
      </div>
      {MSGS.map((m, idx) => {
        const start = B(m.at);
        const bg = m.side === 'in' ? C.bubbleIn : C.peach;
        const fg = m.side === 'in' ? C.white : C.ink;
        const pos: React.CSSProperties = {
          position: 'absolute',
          top: CHAT_Y0 + m.top - scroll,
          [m.side === 'in' ? 'left' : 'right']: m.side === 'in' ? 90 : 150,
          display: 'flex',
          flexDirection: 'column',
          alignItems: m.side === 'in' ? 'flex-start' : 'flex-end',
        };
        let wordOffset = 0;
        return (
          <div key={idx} style={{ ...pos, opacity: 1 - exit, filter: `blur(${exit * 10}px)` }}>
            {m.typingAt !== undefined ? (
              <TypingBubble f={f} start={B(m.typingAt)} end={start} side={m.side} />
            ) : null}
            {f >= start ? (
              (() => {
                const e = bubbleEnter(f, start);
                return (
                  <div
                    style={{
                      position: m.typingAt !== undefined ? 'absolute' : 'relative',
                      top: 0,
                      [m.side === 'in' ? 'left' : 'right']: 0,
                      whiteSpace: 'nowrap',
                      background: bg,
                      color: fg,
                      borderRadius: 50,
                      padding: `${PY}px ${PX}px`,
                      fontFamily: SANS,
                      fontSize: FS,
                      lineHeight: `${LH}px`,
                      fontWeight: 500,
                      letterSpacing: -0.5,
                      opacity: e.opacity,
                      transform: e.transform,
                      filter: e.filter,
                      transformOrigin: m.side === 'in' ? 'bottom left' : 'bottom right',
                    }}
                  >
                    {m.lines.map((line, li) => {
                      const s = start + 2 + wordOffset * 2.5;
                      wordOffset += line.split(' ').length;
                      return (
                        <div key={li}>
                          <Words f={f} start={s} text={line} />
                        </div>
                      );
                    })}
                    <Tail side={m.side} color={bg} />
                  </div>
                );
              })()
            ) : null}
          </div>
        );
      })}
      {/* typing dots for the hero message */}
      <div
        style={{
          position: 'absolute',
          left: 90,
          top: CHAT_Y0 + HERO_SLOT_TOP - scroll,
        }}
      >
        <TypingBubble f={f} start={B(HERO_TYPING_AT)} end={B(HERO_AT)} side="in" />
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* Hero: message -> $35 tile -> search bar header (beats 12-32)         */
/* ------------------------------------------------------------------ */
const HeroScene: React.FC<{ f: number }> = ({ f }) => {
  const start = B(HERO_AT);
  if (f < start || f > B(33)) return null;

  const scroll = chatScroll(f);
  const enter = bubbleEnter(f, start);

  // A: sits in the chat slot. B: glides to centre. C: morph to tile. D: tile -> bar. E: bar -> header.
  const W0 = 690;
  const H0 = LH + 2 * PY + 20;
  const slotCx = 90 + W0 / 2;
  const slotCy = CHAT_Y0 + HERO_SLOT_TOP - scroll + H0 / 2;
  const toCentre = ease(f, B(14), B(15.5), 0, 1, inOut);
  const mC = pop(f, B(16) - 2, { damping: 12, stiffness: 150 }); // tile morph (overshoots)
  const mCl = Math.min(1, mC);
  const mD = pop(f, B(18), { damping: 16, stiffness: 190 });
  const mDl = Math.min(1, mD);
  const mE = ease(f, B(20) - 2, B(20) + 9, 0, 1, inOut);
  const exit = ease(f, B(32) - 3, B(32) + 4);

  let cx = interpolate(toCentre, [0, 1], [slotCx, 540]);
  let cy = interpolate(toCentre, [0, 1], [slotCy, 930]);
  cy = interpolate(mE, [0, 1], [cy, 380]);
  cx = cx;

  const w = interpolate(mDl, [0, 1], [interpolate(mCl, [0, 1], [W0, 560]), 860]);
  const h = interpolate(mDl, [0, 1], [interpolate(mCl, [0, 1], [H0, 560]), 150]);
  const radius = interpolate(mDl, [0, 1], [interpolate(mCl, [0, 1], [56, 120]), 75]);
  const bgA = interpolateColors(mCl, [0, 1], [C.bubbleIn, C.ink]);
  const bg = interpolateColors(mDl, [0, 1], [bgA, C.card]);
  const rot = interpolate(mD, [0, 1], [interpolate(mC, [0, 1], [0, -2.5]), 0]) + (mC > 0 && mC < 1 ? 0 : 0);
  const tiltIn = f >= B(16) - 2 ? (1 - mC) * -10 : 0;
  const scale =
    interpolate(toCentre, [0, 1], [1, 1.12]) * interpolate(mCl, [0, 1], [1, 1 / 1.12]) * interpolate(mE, [0, 1], [1, 0.94]);

  const bubbleText = 1 - ease(f, B(16) - 3, B(16) + 2);
  const tileText = ease(f, B(16) + 2, B(16) + 8) * (1 - ease(f, B(18) - 1, B(18) + 3));
  const barText = f >= B(18) + 2;
  const shadow = interpolate(mCl, [0, 1], [0, 1]) * (1 - mDl * 0.7);

  return (
    <AbsoluteFill style={{ opacity: 1 - exit, filter: `blur(${exit * 12}px)` }}>
      {/* label above the tile */}
      {f >= B(16) && f < B(18) + 6 ? (
        <div
          style={{
            position: 'absolute',
            top: 930 - 280 - 150,
            left: 0,
            right: 0,
            textAlign: 'center',
            fontFamily: SANS,
            fontSize: 50,
            fontWeight: 800,
            letterSpacing: '0.16em',
            color: C.ink,
            opacity: 1 - ease(f, B(18) - 1, B(18) + 4),
          }}
        >
          <Words f={f} start={B(16) + 4} text="NOVEMBER LASH SALE" stagger={3} />
        </div>
      ) : null}
      {f >= B(16) && f < B(18) + 6 ? (
        <div
          style={{
            position: 'absolute',
            top: 930 + 280 + 70,
            left: 0,
            right: 0,
            textAlign: 'center',
            fontFamily: SANS,
            fontSize: 44,
            fontWeight: 600,
            color: C.grey2,
            opacity: 1 - ease(f, B(18) - 1, B(18) + 4),
          }}
        >
          <Words f={f} start={B(17)} text="6 full sets on sale" stagger={2} />
        </div>
      ) : null}
      <div
        style={{
          position: 'absolute',
          left: cx - w / 2,
          top: cy - h / 2,
          width: w,
          height: h,
          borderRadius: radius,
          background: bg,
          opacity: enter.opacity,
          transform: `${f < B(14) ? enter.transform : ''} scale(${scale}) rotate(${rot + tiltIn}deg)`,
          transformOrigin: f < B(14) ? 'bottom left' : 'center',
          filter: f < B(13) ? enter.filter : undefined,
          boxShadow: `0 ${30 * shadow}px ${80 * shadow}px rgba(0,0,0,${0.28 * shadow})`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {f < B(14) ? <Tail side="in" color={bg} /> : null}
        {/* bubble text */}
        {bubbleText > 0 ? (
          <div
            style={{
              position: 'absolute',
              left: PX,
              top: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              whiteSpace: 'nowrap',
              fontFamily: SANS,
              fontSize: FS,
              fontWeight: 500,
              color: C.white,
              opacity: bubbleText,
              filter: `blur(${(1 - bubbleText) * 8}px)`,
            }}
          >
            <Words
              f={f}
              start={start + 2}
              text="ALL Full Sets $35"
              wordStyle={(word) =>
                word === '$35'
                  ? { fontFamily: SERIF, fontWeight: 800, fontSize: 78, color: C.peach, marginLeft: 6 }
                  : word === 'ALL'
                    ? { fontWeight: 800 }
                    : undefined
              }
            />
          </div>
        ) : null}
        {/* tile content */}
        {tileText > 0 ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              opacity: tileText,
              filter: `blur(${(1 - tileText) * 10}px)`,
              transform: `scale(${0.85 + 0.15 * tileText})`,
            }}
          >
            <div
              style={{
                fontFamily: SERIF,
                fontWeight: 800,
                fontSize: 250,
                lineHeight: 1,
                color: C.peach,
                letterSpacing: -6,
              }}
            >
              $35
            </div>
            <div
              style={{
                marginTop: 22,
                fontFamily: SANS,
                fontSize: 38,
                fontWeight: 700,
                letterSpacing: '0.22em',
                color: C.white,
              }}
            >
              ALL FULL SETS
            </div>
          </div>
        ) : null}
        {/* search bar content */}
        {barText ? (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              padding: '0 22px 0 44px',
              gap: 22,
              fontFamily: SANS,
              color: C.ink,
            }}
          >
            <div style={{ opacity: ease(f, B(18) + 2, B(18) + 7) }}>
              <SearchIcon size={46} />
            </div>
            <div style={{ fontSize: 48, fontWeight: 600, flex: 1, whiteSpace: 'nowrap' }}>
              <Words
                f={f}
                start={B(18) + 4}
                text="All Full Sets $35"
                wordStyle={(word) => (word === '$35' ? { fontWeight: 800 } : undefined)}
              />
            </div>
            {(() => {
              const c = pop(f, B(19), { damping: 13, stiffness: 200 });
              return (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    background: C.white,
                    borderRadius: 60,
                    padding: '20px 30px',
                    fontSize: 40,
                    fontWeight: 600,
                    opacity: Math.min(1, c * 2),
                    transform: `scale(${0.6 + 0.4 * c})`,
                    boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
                  }}
                >
                  <CalendarGlyph size={36} /> Nov
                  <span style={{ fontSize: 30, color: C.grey, marginLeft: 2 }}>⌄</span>
                </div>
              );
            })()}
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* Scene 3: one card per full set (beats 20-32)                         */
/* ------------------------------------------------------------------ */
// price = regular price from the client's price list; sale = November price.
// Headline offer is "All Full Sets $35"; Classic Lashes is the one set at $30.
const SETS: { name: string; price: number; sale: number }[] = [
  { name: 'Classic Lashes', price: 40, sale: 30 },
  { name: '2D Lashes', price: 40, sale: 35 },
  { name: 'Silk Lashes', price: 50, sale: 35 },
  { name: '3D Lashes', price: 50, sale: 35 },
  { name: 'Hybrid Lashes', price: 55, sale: 35 },
  { name: 'Volume Lashes', price: 60, sale: 35 },
];

const SetCard: React.FC<{ f: number; i: number }> = ({ f, i }) => {
  const S = B(20 + 2 * i);
  const N = B(22 + 2 * i);
  if (f < S - 1 || f > N + 4) return null;
  const set = SETS[i];
  const p = pop(f, S, { damping: 16, stiffness: 210 });
  const pl = Math.min(1, p);
  // Card lands on the beat, old price is struck as it settles, sale price pops on
  // the half-beat, then the card holds until the next beat.
  const exit = ease(f, N - 1, N + 3);
  const strike = ease(f, S + 4, S + 9);
  const tag = pop(f, B(20.5 + 2 * i), { damping: 10, stiffness: 230 });
  return (
    <div
      style={{
        position: 'absolute',
        left: 110,
        width: 860,
        top: 700,
        borderRadius: 48,
        background: C.white,
        border: `2px solid ${C.hairline}`,
        boxShadow: '0 24px 70px rgba(0,0,0,0.10)',
        padding: '46px 50px 50px',
        fontFamily: SANS,
        opacity: Math.min(1, pl * 1.6) * (1 - exit),
        transform: `perspective(1400px) translateY(${(1 - pl) * 140 - exit * 70}px) rotateX(${(1 - pl) * 28}deg) scale(${(0.9 + 0.1 * p) * (1 - exit * 0.08)})`,
        filter: `blur(${(1 - pl) * 12 + exit * 10}px)`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 34 }}>
        <div
          style={{
            width: 140,
            height: 140,
            borderRadius: 38,
            background: C.card,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <LashIcon size={104} />
        </div>
        <div>
          <div style={{ fontSize: 68, fontWeight: 700, color: C.ink, letterSpacing: -1.2, lineHeight: 1.05 }}>
            {set.name}
          </div>
          <div style={{ fontSize: 38, fontWeight: 500, color: C.grey, marginTop: 8 }}>Full set</div>
        </div>
      </div>
      <div style={{ height: 2, background: C.hairline, margin: '40px 0 34px' }} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 30, fontWeight: 600, color: C.grey, letterSpacing: '0.12em' }}>REGULAR</div>
          <div style={{ position: 'relative', display: 'inline-block', marginTop: 4 }}>
            <span
              style={{
                fontSize: 88,
                fontWeight: 600,
                color: interpolateColors(strike, [0, 1], [C.ink, C.grey]),
                letterSpacing: -1,
              }}
            >
              ${set.price}
            </span>
            <div
              style={{
                position: 'absolute',
                left: -8,
                top: '52%',
                height: 9,
                borderRadius: 5,
                width: `calc(${strike * 100}% + ${strike * 16}px)`,
                background: C.red,
                transform: 'rotate(-8deg)',
                transformOrigin: 'left center',
              }}
            />
          </div>
        </div>
        <div style={{ fontSize: 60, color: C.grey, opacity: Math.min(1, tag * 1.5) }}>→</div>
        <div
          style={{
            background: C.ink,
            borderRadius: 30,
            padding: '10px 36px 16px',
            fontFamily: SERIF,
            fontWeight: 800,
            fontSize: 128,
            lineHeight: 1,
            color: C.peach,
            opacity: Math.min(1, tag * 2),
            transform: `scale(${tag}) rotate(${(1 - Math.min(1, tag)) * -10}deg)`,
            boxShadow: '0 16px 40px rgba(20,17,16,0.28)',
          }}
        >
          ${set.sale}
        </div>
      </div>
    </div>
  );
};

const SetsScene: React.FC<{ f: number }> = ({ f }) => {
  if (f < B(20) - 2 || f > B(32) + 6) return null;
  const active = Math.min(5, Math.max(0, Math.floor(interpolate(f, [B(20), B(32)], [0, 6], { extrapolateRight: 'clamp' }))));
  const dotsIn = ease(f, B(20), B(20) + 8) * (1 - ease(f, B(32) - 3, B(32) + 3));
  return (
    <AbsoluteFill>
      {SETS.map((_, i) => (
        <SetCard key={i} f={f} i={i} />
      ))}
      <div
        style={{
          position: 'absolute',
          top: 1360,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          gap: 18,
          opacity: dotsIn,
        }}
      >
        {SETS.map((_, i) => (
          <div
            key={i}
            style={{
              width: i === active ? 54 : 18,
              height: 18,
              borderRadius: 9,
              background: i === active ? C.ink : '#D1D1D6',
            }}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* Scene 4: November 2026 calendar (beats 32-48)                        */
/* ------------------------------------------------------------------ */
const CAL_X = 113;
const CELL_W = 122;
const CELL_H = 128;
const TITLE_TOP = 420;
const WEEK_TOP = 566;
const GRID_TOP = 630;
const NUM_DY = 56;
// Nov 1 2026 is a Sunday -> column 0.
const FIRST_COL = 0;
const DAYS = 30;
const HIGHLIGHT = [9, 10, 11];
const cellOf = (d: number) => {
  const idx = FIRST_COL + d - 1;
  return { col: idx % 7, row: Math.floor(idx / 7) };
};
const TARGET = { x: CAL_X + 2.5 * CELL_W, y: GRID_TOP + CELL_H + NUM_DY }; // centre of 9-11
const ZOOM = 1.6;
const ZOOM_TO = { x: 540, y: 770 };

const CalendarScene: React.FC<{ f: number }> = ({ f }) => {
  if (f < B(32) - 2 || f > B(48) + 8) return null;
  const enter = pop(f, B(32), { damping: 16, stiffness: 150 });
  const el = Math.min(1, enter);
  const z = ease(f, B(33.5), B(38) - 2, 0, 1, inOut);
  const s = interpolate(z, [0, 1], [1, ZOOM]) * (0.86 + 0.14 * enter);
  const dx = (ZOOM_TO.x - TARGET.x) * z;
  const dy = (ZOOM_TO.y - TARGET.y) * z + (1 - el) * 120;
  const titleFade = 1 - ease(f, B(34), B(36.5));
  const blur = ease(f, B(44) - 2, B(44) + 6) * 18;
  const dim = ease(f, B(44) - 2, B(44) + 6);

  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          filter: `blur(${(1 - el) * 14 + blur}px)`,
          opacity: Math.min(1, enter * 1.6),
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            transformOrigin: `${TARGET.x}px ${TARGET.y}px`,
            transform: `translate(${dx}px, ${dy}px) scale(${s})`,
            fontFamily: SANS,
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: CAL_X + 14,
              top: TITLE_TOP,
              fontSize: 96,
              fontWeight: 800,
              letterSpacing: -2,
              color: C.ink,
              opacity: titleFade,
            }}
          >
            <Words f={f} start={B(32) + 2} text="November" />{' '}
            <span style={{ color: C.red, fontWeight: 600 }}>
              <Words f={f} start={B(32) + 5} text="2026" />
            </span>
          </div>
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: CAL_X + i * CELL_W,
                width: CELL_W,
                top: WEEK_TOP,
                textAlign: 'center',
                fontSize: 32,
                fontWeight: 600,
                color: C.grey,
              }}
            >
              {d}
            </div>
          ))}
          {[0, 1, 2, 3, 4].map((r) => (
            <div
              key={r}
              style={{
                position: 'absolute',
                left: CAL_X,
                width: CELL_W * 7,
                top: GRID_TOP + r * CELL_H,
                height: 2,
                background: C.hairline,
              }}
            />
          ))}
          {Array.from({ length: DAYS }, (_, k) => k + 1).map((d) => {
            const { col, row } = cellOf(d);
            const hi = HIGHLIGHT.indexOf(d);
            const hb = hi >= 0 ? B(38 + hi) : 1e9;
            const draw = ease(f, hb, hb + 6);
            const fill = ease(f, hb + 4, hb + 9);
            const bump = hi >= 0 ? pop(f, hb, { damping: 9, stiffness: 260 }) : 0;
            const bumpScale = f >= hb ? 1 + 0.22 * Math.sin(Math.min(1, bump) * Math.PI) : 1;
            const weekend = col === 0 || col === 6;
            const cx = CAL_X + col * CELL_W + CELL_W / 2;
            const cy = GRID_TOP + row * CELL_H + NUM_DY;
            const R = 46;
            const circ = 2 * Math.PI * R;
            return (
              <div
                key={d}
                style={{
                  position: 'absolute',
                  left: cx - 60,
                  top: cy - 60,
                  width: 120,
                  height: 120,
                  transform: `scale(${bumpScale})`,
                }}
              >
                {hi >= 0 && f >= hb ? (
                  <svg
                    width={120}
                    height={120}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      overflow: 'visible',
                      filter: `drop-shadow(0 0 ${14 * fill}px rgba(255,59,48,${0.55 * fill}))`,
                    }}
                  >
                    <circle cx={60} cy={60} r={R} fill={C.red} opacity={fill} />
                    <circle
                      cx={60}
                      cy={60}
                      r={R}
                      fill="none"
                      stroke={C.red}
                      strokeWidth={6}
                      strokeLinecap="round"
                      strokeDasharray={circ}
                      strokeDashoffset={circ * (1 - draw)}
                      transform="rotate(-100 60 60)"
                    />
                  </svg>
                ) : null}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 48,
                    fontWeight: hi >= 0 ? 700 : 500,
                    color: hi >= 0 && fill > 0.5 ? C.white : weekend ? C.grey : C.ink,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {d}
                </div>
              </div>
            );
          })}
        </div>
        {/* Focus fade + label once zoomed */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 860,
            height: 1060,
            background: `linear-gradient(to bottom, rgba(255,255,255,0) 0px, rgba(255,255,255,1) 150px)`,
            opacity: z,
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 300,
            left: 0,
            right: 0,
            textAlign: 'center',
            fontFamily: SANS,
            fontSize: 40,
            fontWeight: 700,
            letterSpacing: '0.2em',
            color: C.red,
            opacity: ease(f, B(36.5), B(37.5)),
          }}
        >
          NOVEMBER 2026
        </div>
        {(() => {
          const t = pop(f, B(41), { damping: 13, stiffness: 180 });
          if (f < B(41)) return null;
          return (
            <div
              style={{
                position: 'absolute',
                top: 1170,
                left: 0,
                right: 0,
                textAlign: 'center',
                transform: `scale(${0.8 + 0.2 * t})`,
              }}
            >
              <div
                style={{
                  fontFamily: SERIF,
                  fontWeight: 700,
                  fontSize: 112,
                  color: C.ink,
                  letterSpacing: -1,
                  whiteSpace: 'nowrap',
                }}
              >
                <Words
                  f={f}
                  start={B(41)}
                  text="Nov 9 – 11 Only"
                  stagger={2}
                  wordStyle={(w) => (w === 'Only' ? { color: C.red, fontStyle: 'italic' } : undefined)}
                />
              </div>
              <div
                style={{
                  marginTop: 18,
                  fontFamily: SANS,
                  fontSize: 42,
                  fontWeight: 600,
                  color: C.grey2,
                }}
              >
                <Words f={f} start={B(42)} text="3 days · All Full Sets $35" stagger={2} />
              </div>
            </div>
          );
        })()}
      </div>
      {/* dim for notification */}
      <AbsoluteFill style={{ background: `rgba(40,40,46,${0.32 * dim})` }} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* Scene 5: iOS notification (beats 44-48)                              */
/* ------------------------------------------------------------------ */
const NotificationScene: React.FC<{ f: number }> = ({ f }) => {
  const S = B(44);
  if (f < S - 1 || f > B(48) + 2) return null;
  const p = pop(f, S, { damping: 15, stiffness: 160 });
  const pl = Math.min(1, p);
  return (
    <div
      style={{
        position: 'absolute',
        left: 90,
        width: 900,
        top: 720,
        borderRadius: 52,
        background: 'rgba(246,246,248,0.97)',
        boxShadow: '0 30px 80px rgba(0,0,0,0.25)',
        padding: '34px 40px 40px',
        fontFamily: SANS,
        opacity: Math.min(1, pl * 2),
        transform: `translateY(${(1 - p) * -420}px) scale(${0.92 + 0.08 * pl})`,
        filter: `blur(${(1 - pl) * 8}px)`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
        <Img
          src={staticFile('logo-icon.png')}
          style={{ width: 84, height: 84, borderRadius: 20, border: `2px solid ${C.hairline}` }}
        />
        <div style={{ flex: 1, fontSize: 32, fontWeight: 600, letterSpacing: '0.08em', color: C.grey2 }}>
          DOSE OF LASHES
        </div>
        <div style={{ fontSize: 32, color: C.grey }}>now</div>
      </div>
      <div style={{ marginTop: 22, fontSize: 52, fontWeight: 700, color: C.ink, letterSpacing: -0.8 }}>
        <Words f={f} start={S + 4} text="Only 72 hours ⏳" stagger={2} />
      </div>
      <div style={{ marginTop: 8, fontSize: 42, fontWeight: 400, color: C.grey2 }}>
        <Words f={f} start={S + 8} text="All Full Sets $35 · Nov 9 – 11" stagger={1.6} />
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Scene 6: logo + 72h countdown + limited seats (beats 48-60)          */
/* ------------------------------------------------------------------ */
const pad2 = (n: number) => String(n).padStart(2, '0');

const RollDigit: React.FC<{ f: number; value: string; prev: string; changedAt: number }> = ({
  f,
  value,
  prev,
  changedAt,
}) => {
  const t = value !== prev ? ease(f, changedAt, changedAt + 6) : 1;
  return (
    <span style={{ position: 'relative', display: 'inline-block', width: '0.62em', height: '1.1em', overflow: 'hidden', verticalAlign: 'top' }}>
      {t < 1 ? (
        <span style={{ position: 'absolute', left: 0, right: 0, textAlign: 'center', transform: `translateY(${-t * 100}%)`, opacity: 1 - t }}>
          {prev}
        </span>
      ) : null}
      <span
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          textAlign: 'center',
          transform: `translateY(${(1 - t) * 100}%)`,
          opacity: t,
        }}
      >
        {value}
      </span>
    </span>
  );
};

const LogoScene: React.FC<{ f: number }> = ({ f }) => {
  const S = B(48);
  if (f < S || f >= B(60)) return null;
  const flash = 1 - ease(f, S, S + 7);
  const logoIn = ease(f, S, S + 10);
  // tick every 2 beats starting at beat 50
  const ticks = [50, 52, 54, 56, 58].map(B);
  let n = 0;
  let lastTick = -1e9;
  ticks.forEach((t) => {
    if (f >= t) {
      n += 1;
      lastTick = t;
    }
  });
  const secsLeft = 72 * 3600 - n;
  const prevLeft = secsLeft + (n > 0 ? 1 : 0);
  const fmt = (s: number) => `${pad2(Math.floor(s / 3600))}:${pad2(Math.floor((s % 3600) / 60))}:${pad2(s % 60)}`;
  const cur = fmt(secsLeft);
  const prev = fmt(prevLeft);
  const card = pop(f, B(49), { damping: 15, stiffness: 180 });
  const pill = pop(f, B(50), { damping: 12, stiffness: 200 });
  const pulse = 0.5 + 0.5 * Math.sin((f - S) / 4);

  return (
    <AbsoluteFill style={{ background: C.logoBg }}>
      <Img
        src={staticFile('logo-wide.png')}
        style={{
          position: 'absolute',
          width: 880,
          height: 460,
          left: 100,
          top: 300,
          opacity: logoIn,
          transform: `scale(${1.06 - 0.06 * logoIn})`,
          filter: `blur(${(1 - logoIn) * 8}px)`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 130,
          width: 820,
          top: 820,
          borderRadius: 48,
          background: C.white,
          boxShadow: '0 20px 60px rgba(0,0,0,0.08)',
          padding: '38px 0 40px',
          textAlign: 'center',
          fontFamily: SANS,
          opacity: Math.min(1, card * 2),
          transform: `translateY(${(1 - Math.min(1, card)) * 80}px) scale(${0.9 + 0.1 * card})`,
          filter: `blur(${(1 - Math.min(1, card)) * 10}px)`,
        }}
      >
        <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: '0.2em', color: C.red }}>LIMITED TIME</div>
        <div
          style={{
            marginTop: 6,
            fontSize: 172,
            fontWeight: 700,
            letterSpacing: -2,
            color: C.ink,
            lineHeight: 1.1,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {cur.split('').map((ch, i) =>
            ch === ':' ? (
              <span key={i} style={{ display: 'inline-block', width: '0.32em', textAlign: 'center', verticalAlign: 'top', transform: 'translateY(-0.06em)', color: C.grey }}>
                :
              </span>
            ) : (
              <RollDigit key={i} f={f} value={ch} prev={prev[i]} changedAt={lastTick} />
            ),
          )}
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 120,
            fontSize: 26,
            fontWeight: 600,
            letterSpacing: '0.16em',
            color: C.grey,
          }}
        >
          <span>HOURS</span>
          <span>MINUTES</span>
          <span>SECONDS</span>
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          top: 1240,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 22,
            background: C.ink,
            color: C.peach,
            borderRadius: 80,
            padding: '30px 52px',
            fontFamily: SANS,
            fontSize: 50,
            fontWeight: 700,
            opacity: Math.min(1, pill * 2),
            transform: `scale(${0.7 + 0.3 * pill})`,
          }}
        >
          <span
            style={{
              width: 22,
              height: 22,
              borderRadius: 11,
              background: C.red,
              boxShadow: `0 0 ${10 + 14 * pulse}px rgba(255,59,48,${0.5 + 0.4 * pulse})`,
            }}
          />
          <Words f={f} start={B(50) + 2} text="Limited seats available" stagger={2} />
        </div>
      </div>
      <AbsoluteFill style={{ background: C.white, opacity: flash }} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* Scene 7: CTA on black (beats 60-72)                                  */
/* ------------------------------------------------------------------ */
const CTAScene: React.FC<{ f: number }> = ({ f }) => {
  const S = B(60);
  if (f < S) return null;
  const glitch = f < S + 8;
  const jx = glitch ? ((f * 37) % 23) - 11 : 0;
  const flicker = glitch ? ((f - S) % 3 === 1 ? 0.35 : 1) : 1;
  const iconIn = pop(f, S, { damping: 14, stiffness: 220 });
  const pill = pop(f, B(62), { damping: 12, stiffness: 200 });
  const pulseBeats = [64, 66, 68, 70].map(B);
  let bump = 0;
  pulseBeats.forEach((b) => {
    if (f >= b && f < b + 8) bump = Math.sin(((f - b) / 8) * Math.PI);
  });
  const fadeOut = ease(f, TOTAL_FRAMES - 14, TOTAL_FRAMES - 1);

  return (
    <AbsoluteFill style={{ background: C.black }}>
      <AbsoluteFill style={{ opacity: 1 - fadeOut }}>
        <div
          style={{
            position: 'absolute',
            left: 540 - 150,
            top: 400,
            width: 300,
            height: 300,
            opacity: flicker * Math.min(1, iconIn * 2),
            transform: `translateX(${jx}px) scale(${0.8 + 0.2 * Math.min(1, iconIn)})`,
          }}
        >
          {glitch ? (
            <Img
              src={staticFile('logo-icon.png')}
              style={{
                position: 'absolute',
                inset: 0,
                width: 300,
                height: 300,
                borderRadius: 66,
                opacity: 0.5,
                transform: `translateX(${-jx * 1.6}px)`,
                clipPath: `inset(${((f * 13) % 60) + 20}% 0 ${((f * 7) % 30) + 10}% 0)`,
              }}
            />
          ) : null}
          <Img
            src={staticFile('logo-icon.png')}
            style={{ width: 300, height: 300, borderRadius: 66, display: 'block' }}
          />
        </div>
        <div
          style={{
            position: 'absolute',
            top: 790,
            left: 0,
            right: 0,
            textAlign: 'center',
            fontFamily: SANS,
            fontSize: 104,
            fontWeight: 800,
            lineHeight: 1.06,
            letterSpacing: -2,
            color: C.white,
          }}
        >
          <div>
            <Words f={f} start={B(61)} text="DM us to book" stagger={2.5} />
          </div>
          <div>
            <Words f={f} start={B(61) + 8} text="your seat" stagger={2.5} />
          </div>
        </div>
        <div style={{ position: 'absolute', top: 1090, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 24,
              background: C.peach,
              borderRadius: 90,
              padding: '28px 54px 28px 34px',
              fontFamily: SANS,
              color: C.ink,
              opacity: Math.min(1, pill * 2),
              transform: `scale(${(0.7 + 0.3 * pill) * (1 + 0.045 * bump)})`,
              boxShadow: `0 0 ${40 * bump}px rgba(245,181,103,${0.45 * bump})`,
            }}
          >
            <WhatsAppGlyph size={78} />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: '0.16em', opacity: 0.75 }}>WHATSAPP</div>
              <div style={{ fontSize: 64, fontWeight: 800, letterSpacing: 0.5, fontVariantNumeric: 'tabular-nums', lineHeight: 1.05 }}>
                70 946 168
              </div>
            </div>
          </div>
        </div>
        <div
          style={{
            position: 'absolute',
            top: 1330,
            left: 0,
            right: 0,
            textAlign: 'center',
            fontFamily: SANS,
            fontSize: 38,
            fontWeight: 500,
            color: C.grey,
          }}
        >
          <Words f={f} start={B(63)} text="All Full Sets $35 · Nov 9 – 11" stagger={1.6} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* Root composition                                                    */
/* ------------------------------------------------------------------ */
const FONT_SPECS = [
  '400 40px Inter',
  '500 40px Inter',
  '600 40px Inter',
  '700 40px Inter',
  '800 40px Inter',
  '600 40px "Bodoni Moda"',
  '700 40px "Bodoni Moda"',
  '800 40px "Bodoni Moda"',
  '40px "Noto Color Emoji"',
];

export const NovemberSale: React.FC = () => {
  const f = useCurrentFrame();
  const [handle] = useState(() => delayRender('fonts'));
  useEffect(() => {
    Promise.all(FONT_SPECS.map((s) => document.fonts.load(s, 'Aa$30$35 👀😳🖤⏳')))
      .then(() => document.fonts.ready)
      .then(() => continueRender(handle))
      .catch(() => continueRender(handle));
  }, [handle]);

  const bg = interpolateColors(f, [B(16) - 3, B(16) + 3], [C.black, C.white]);

  return (
    <AbsoluteFill style={{ background: bg, overflow: 'hidden' }}>
      <ChatScene f={f} />
      <SetsScene f={f} />
      <CalendarScene f={f} />
      <HeroScene f={f} />
      <NotificationScene f={f} />
      <LogoScene f={f} />
      <CTAScene f={f} />
    </AbsoluteFill>
  );
};
