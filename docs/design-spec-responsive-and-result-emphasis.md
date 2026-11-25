# Design spec: large screens, short viewports, mobile intro, result emphasis

Extends [implementation-spec-shell-gauge-wizard-result.md](./implementation-spec-shell-gauge-wizard-result.md) (section numbers below refer to it as "impl") and stays inside [decision 0003](../../wiki/decisions/0003-layout-strumento.md), decisions 0001 and 0002 and [visual design](../../wiki/specs/visual-design.md): single accent `#5b8cff`, no gradients, no glows, no soft shadows, radius 0 on containers, verdict colour never used as small text, sticky mobile gauge bar kept, no em-dash in copy. This document changes no copy and no source code. Everything marked "new" is implemented in a later task (checklist in section 5).

Line numbers refer to `src/styles/layout.css` at the time of writing.

## 0. Tokens

Existing tokens are untouched, including the four verdict tokens. New tokens, to add to `src/styles/tokens.css`:

```css
:root {
  /* Fluid scale: 1 up to 1400px viewport width, +0.0005 per px, capped at 1.9 (reached at 3200px). */
  --fluid-k: 1;
  --max-width: clamp(1400px, 86vw, 2660px); /* was 1400px */
  --gutter: clamp(
    20px,
    calc(20px + (100vw - 720px) * 0.0176),
    32px
  ); /* 20px at <=720px, 32px from 1400px */

  /* Result evaluation block (section 4). Solids: verdict colour at 20% over --bg (#0a0b0d). */
  --eval-bg-bash: #1b3833;
  --eval-bg-let-it-write: #3a361e;
  --eval-bg-bash-1call: #3a2b18;
  --eval-bg-burn: #391d1b;
  --eval-text: var(--text); /* #e7e9ec */
  --eval-link: var(--accent-hover); /* #96b4ff */
  --eval-link-hover: var(--text);
  --eval-border: var(--verdict); /* non-text only */
}

/* Trigonometric ratio gives the unitless viewport width in px. Baseline 2024 (Chrome 111, Safari 15.4, Firefox 108). Without support, --fluid-k stays 1 and the clamp() maxima in section 1 are the only growth. */
@supports (width: calc(tan(atan2(1px, 1px)) * 1px)) {
  :root {
    --fluid-k: clamp(1, 1 + (tan(atan2(100vw, 1px)) - 1400) * 0.0005, 1.9);
  }
}

/* Mapped like --verdict: not new identity tokens. */
[data-verdict='bash'] {
  --eval-bg: var(--eval-bg-bash);
}
[data-verdict='let-it-write'] {
  --eval-bg: var(--eval-bg-let-it-write);
}
[data-verdict='bash-1call'] {
  --eval-bg: var(--eval-bg-bash-1call);
}
[data-verdict='burn'] {
  --eval-bg: var(--eval-bg-burn);
}
```

The existing `--gutter: 32px` and its `max-width: 720px` override (20px) are replaced by the single `clamp` above; the values at 320 to 720px and from 1400px are unchanged, and between them the gutter grows smoothly instead of jumping from 20px to 32px (the mobile `20px` padding literals in the 900px block stay as they are). A user with an older browser that lacks `atan2` gets `--fluid-k: 1`: every `calc(Npx * var(--fluid-k))` below falls back to the current size.

## 1. Large screens (fluid scaling)

Problem: the split is capped at `--max-width: 1400px` and centred, so at 2542px it sits in a column with about 570px of empty page on each side while type and gauge keep their 1400px size.

### 1.1 Breakpoints and scale

| Step      | Viewport width | `--fluid-k` | `--max-width` | Note                                                  |
| --------- | -------------- | ----------- | ------------- | ----------------------------------------------------- |
| base      | 901 to 1399px  | 1           | 1400px (cap)  | Today. Content fills the viewport up to 1400px.       |
| wide      | 1800px         | 1.20        | 1548px        | First step where growth is visible.                   |
| large     | 2000px         | 1.30        | 1720px        |                                                       |
| reference | 2542px         | 1.57        | 2186px        | Design reference for very large screens.              |
| hard cap  | 3200px         | 1.90        | 2660px        | Maximum. Above it the split stays 2660px and centres. |

`--max-width: clamp(1400px, 86vw, 2660px)`: the split keeps about 7% margin per side from 1628px up, reaches the cap at 3093px. The grid stays `minmax(0, 1.08fr) minmax(0, 1fr)` (impl 1.1). No new media query is needed for growth: `clamp` and `--fluid-k` are continuous. Page background stays `--bg` outside the split.

### 1.2 Type

Keep every existing minimum and `vw` term; multiply only the **maximum** by `--fluid-k`.

| Element (`layout.css`)       | Today                                 | New                                                          |
| ---------------------------- | ------------------------------------- | ------------------------------------------------------------ |
| `.intro h1` (132)            | `clamp(44px, min(6.2vw, 7vh), 120px)` | `clamp(44px, min(6.2vw, 7vh), calc(120px * var(--fluid-k)))` |
| `.lead` (150)                | `clamp(17px, 1.5vw, 21px)`            | `clamp(17px, 1.5vw, calc(21px * var(--fluid-k)))`            |
| `.numeral` (175)             | `clamp(180px, 26vw, 420px)`           | `clamp(180px, 26vw, calc(420px * var(--fluid-k)))`           |
| display at 216               | `clamp(32px, 4vw, 64px)`              | `clamp(32px, 4vw, calc(64px * var(--fluid-k)))`              |
| display at 741 (result)      | `clamp(36px, 4.6vw, 76px)`            | `clamp(36px, 4.6vw, calc(76px * var(--fluid-k)))`            |
| body at 841                  | `clamp(19px, 1.6vw, 24px)`            | `clamp(19px, 1.6vw, calc(24px * var(--fluid-k)))`            |
| body copy, answers, controls | 16px                                  | unchanged (reading size; line length is bounded by `ch`)     |

Computed values (px, rounded). The title uses the height term `7vh` with a 16:9 viewport height (900, 1000, 1125, 1430, 1800), so on wide-and-short screens it is height-bound on purpose and never overflows.

| Viewport   | `.intro h1` | `.lead` | `.numeral` | 216 | 741 | 841  |
| ---------- | ----------- | ------- | ---------- | --- | --- | ---- |
| 1400       | 63          | 21.0    | 364        | 56  | 64  | 22.4 |
| 1800       | 70          | 25.2    | 468        | 72  | 83  | 28.8 |
| 2000       | 79          | 27.3    | 520        | 80  | 92  | 31.2 |
| 2542       | 100         | 33.0    | 660        | 101 | 117 | 37.7 |
| 3200 (cap) | 126         | 39.9    | 798        | 122 | 144 | 45.6 |

Sensible max: nothing exceeds `--fluid-k` 1.9 times its 1400px maximum. Body text and form controls do not scale (a 16px answer row on a 2542px screen is still readable, and scaling them would break the 62ch line lengths in impl 6). Spacing that is expressed in `px` in the left column (`.intro` side padding, gaps) uses `calc(Npx * var(--fluid-k))`.

### 1.3 Gauge

The gauge lives in `.left` and is `100%` of its width, so the scale (p(v) = (v + 14) / 28) already stretches. Only the vertical geometry (impl 4.2) scales, so ticks and labels keep their proportions:

| Part (`layout.css`)     | Today                     | New                                                                             |
| ----------------------- | ------------------------- | ------------------------------------------------------------------------------- |
| scale box (493)         | `64px`                    | `calc(64px * var(--fluid-k))`                                                   |
| ticks container (498)   | `40px`                    | `calc(40px * var(--fluid-k))`                                                   |
| minor tick (505)        | `12px`                    | `calc(12px * var(--fluid-k))`                                                   |
| major tick (510)        | `22px`                    | `calc(22px * var(--fluid-k))`                                                   |
| baseline `top`          | `40px`                    | `calc(40px * var(--fluid-k))`                                                   |
| cut marks (525)         | `17px`                    | `calc(17px * var(--fluid-k))`                                                   |
| needle (556)            | `41px`                    | `calc(41px * var(--fluid-k))`                                                   |
| needle head (567)       | `9px`                     | `calc(9px * var(--fluid-k))`                                                    |
| labels `top`, mono 11px | `50px`, 11px              | `calc(50px * var(--fluid-k))`, `clamp(11px, calc(11px * var(--fluid-k)), 16px)` |
| `.gauge` padding        | `24px var(--gutter) 28px` | `calc(24px * var(--fluid-k)) var(--gutter) calc(28px * var(--fluid-k))`         |

Tick, baseline and cut widths stay `1px` (hairlines). At 2542px the scale box is 101px, ticks 63px, label 16px. Container units (`container-type: inline-size` on `.left` with `cqw`) were considered and rejected: the needle and cuts already use percentages of the same box, and `--fluid-k` keeps one factor for type, gauge and padding.

## 2. Short viewports (desktop, width > 900px)

Problem: `.left` is `position: sticky; top: 0; height: 100dvh; overflow: hidden` (93 to 101). When the browser window is short, intro and gauge are clipped while the right column scrolls. Rule: **no content is ever clipped by `overflow: hidden`**. The strategy is progressive compaction of the left column, then, below 520px of height, a single page scroll.

All blocks use `(min-width: 901px)`. The mobile layout (`display: contents`, impl 5) is never touched, and mobile browser chrome (`dvh`) does not enter into it.

### 2.1 Tiers

| Tier    | Query (height)      | Left column                                                                                                             |
| ------- | ------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| tall    | above 800px         | Today.                                                                                                                  |
| compact | `max-height: 800px` | Smaller intro padding, `.numeral` and `.cols` hidden, legend on one row, lead at 16px.                                  |
| tight   | `max-height: 640px` | Gauge becomes the compact bar variant (impl 5 content: `.g-label-bar`, `.g-zone`), note and legend hidden, lead hidden. |
| single  | `max-height: 520px` | `.left` no longer sticky. One page scroll. Gauge becomes a sticky bottom bar like mobile.                               |

### 2.2 CSS

```css
@media (min-width: 901px) and (max-height: 800px) {
  .intro {
    padding: clamp(56px, 8vh, 72px) var(--gutter) 24px;
  }
  .numeral,
  .cols {
    display: none; /* decorative */
  }
  .intro h1 {
    font-size: clamp(36px, min(5vw, 7vh), calc(120px * var(--fluid-k)));
  }
  .lead {
    font-size: 16px;
    line-height: 1.5;
  }
  .gauge {
    gap: 12px;
    padding: 16px var(--gutter) 18px;
  }
  .legend {
    display: flex;
    flex-wrap: nowrap;
    gap: 16px;
  }
  .legend li {
    padding: 0;
    border: 0;
    white-space: nowrap;
  }
}

@media (min-width: 901px) and (max-height: 640px) {
  .lead,
  .g-note,
  .legend,
  .g-label-full {
    display: none;
  }
  .g-label-bar,
  .g-zone {
    display: inline;
  }
  .intro {
    padding-top: 56px;
  }
}

@media (min-width: 901px) and (max-height: 520px) {
  .split {
    min-height: 0;
  }
  .left {
    position: static;
    height: auto;
    overflow: visible;
    grid-template-rows: auto auto;
  }
  .gauge {
    position: sticky;
    bottom: 0;
    z-index: 40;
    gap: 10px;
    padding: 12px var(--gutter) 14px;
    border-top: 1px solid var(--line-strong);
    background: var(--bg); /* opaque, as on mobile (impl 15.4) */
  }
  html {
    scroll-padding-top: 64px; /* nav */
    scroll-padding-bottom: 96px; /* bar: 12 + about 56 content + 14, rounded */
  }
}
```

The 640px tier hides the lead: it is secondary intro copy and not needed to answer, and the title and eyebrow remain. If the Designer prefers to keep it, the alternative is `-webkit-line-clamp: 2`, which is a clipped paragraph and therefore against the rule above, so it is not specified. In the single tier `.left` is a normal grid cell that stretches to the full row height (`align-self: stretch`, the grid default), so the sticky `.gauge` inside it has the whole page height to stick within and stays at the bottom of the viewport while the right column scrolls. The page scrolls once.

### 2.3 Matrix (desktop widths above 900px)

| Height \ Width | 901 to 1399px | 1400 to 1999px | 2000px and up                                                                     |
| -------------- | ------------- | -------------- | --------------------------------------------------------------------------------- |
| above 800px    | tall          | tall           | tall, scaled by `--fluid-k`                                                       |
| 641 to 800px   | compact       | compact        | compact (`--fluid-k` still scales the max sizes, the `7vh` term bounds the title) |
| 521 to 640px   | tight         | tight          | tight                                                                             |
| 520px or less  | single        | single         | single                                                                            |

Widths of 900px and below ignore all three blocks. Verify by hand at 1280x600, 1400x500, 1920x720 and 2542x600.

## 3. Mobile (900px and below): intro hidden after the start

Refines [decision 0003](../../wiki/decisions/0003-layout-strumento.md): 0003 keeps intro, wizard and sticky gauge bar stacked on mobile; this section hides **only the intro** after the first step, and keeps the sticky gauge bar exactly as 0003 and impl 5 define it (legend, note and full label remain hidden on mobile). A short decision note proposal for the wiki: "Mobile: the intro is shown only on step 0; the sticky bar is always present." The gauge bar and the stacked order do not change.

### 3.1 "Started"

`started = step >= 1`. Justification: the wizard has no pre-start screen and starts at step 0, so "answered Q1" is not a usable signal: hiding the intro when a radio is chosen would shift the layout under the user's finger before they press "Avanti". Leaving step 0 is already a navigation with its own focus move (impl 6.5), so the layout change coincides with something the user caused and expects. Consequences:

- Step 0 with answers (back from step 1): intro shown again. This is the "restart the step" case.
- Steps 1 to the last, and the result screen: intro hidden.
- "Ricomincia" (reset to step 0): intro shown again.
- Shared-link state (`?v=`, impl 4.5): the result is shown, the intro is hidden.

State is exposed as `data-started="true"` on `.split` (absent or `"false"` at step 0). It is derived from `step` in `Wizard`, lifted through the existing step state to `Layout` (no new store).

### 3.2 CSS

`.left` is `display: contents` at this width, so the rule targets `.intro` directly. The intro content moves in `.intro-inner` so rows can collapse:

```css
@media (max-width: 900px) {
  .intro {
    display: grid;
    grid-template-rows: 1fr;
    transition:
      grid-template-rows 0.6s var(--ease-out),
      padding 0.6s var(--ease-out),
      border-color 0.6s var(--ease-out),
      visibility 0s linear 0s;
  }
  .intro-inner {
    min-height: 0;
    overflow: hidden;
  }
  .split[data-started='true'] .intro {
    grid-template-rows: 0fr;
    padding-block: 0;
    border-bottom-color: transparent;
    visibility: hidden;
    transition:
      grid-template-rows 0.6s var(--ease-out),
      padding 0.6s var(--ease-out),
      border-color 0.6s var(--ease-out),
      visibility 0s linear 0.6s; /* leaves the a11y tree and tab order after the collapse */
  }
  @media (prefers-reduced-motion: reduce) {
    .intro,
    .split[data-started='true'] .intro {
      transition: none;
    }
  }
}
```

The first-paint at step 0 uses no transition (the `data-started` attribute is absent from the start). The same transition runs in reverse when the intro comes back. The title line animation (`data-line`) is not replayed on return. `View Transitions` is not used: the `grid-template-rows` transition is supported in all current browsers and keeps one code path.

### 3.3 Scroll

When `data-started` changes, the intro height animates, so the question moves up by the intro height. To avoid a jump, in the same `useEffect` that already focuses the heading:

```ts
headingRef.current?.focus({ preventScroll: true });
headingRef.current?.scrollIntoView({ block: 'start', behavior: reducedMotion ? 'auto' : 'smooth' });
```

with `html { scroll-padding-top: 72px }` (existing, 900px block) placing the heading under the nav. `scroll-padding-bottom: 140px` stays for the bar. On return to step 0 the page scrolls to the top (`window.scrollTo({ top: 0, behavior })`) so the intro is visible.

### 3.4 Focus and announcements

- Leaving step 0: the existing effect focuses the question heading (`headingRef`, `Wizard.tsx:35`). Focus is never on the intro at that point (it was on "Avanti" in the wizard), so no focus is lost.
- The hidden intro is removed from the accessibility tree and tab order by `visibility: hidden` after the collapse; additionally React sets `inert` and `aria-hidden="true"` on `.intro` while `started`, so there is no window where assistive technology reads it during the 0.6s animation. The page keeps its single `h1` in the DOM; while the intro is hidden the question and result headings are the only headings exposed.
- Returning to step 0 (Indietro or Ricomincia): `inert` and `aria-hidden` are removed first, then focus goes to the **question heading** (not the intro heading). Reason: the user acted on the wizard, focus should stay where the action happened, and the intro is context rather than a destination. The scroll goes to the top so the intro is seen.
- Announcement: reuse the existing polite live region of the gauge (`Gauge.tsx:157`); no new string is needed for the step change (focus on the heading is announced). No announcement is added for the intro itself.
- Keyboard: nothing in the intro is focusable (text only), so tab order is: nav, question, answers, actions, gauge bar region.

### 3.5 Check list for this section

390x844 and 320x568: step 0 shows intro, question and bar; "Avanti" collapses the intro in 0.6s with the question under the nav; "Indietro" to step 0 shows it again; reduced motion switches instantly; no horizontal overflow; the sticky bar never overlaps the focused element (`scroll-padding-bottom: 140px`).

## 4. Result evaluation block

The block is `.cta` (`layout.css` 1036 to 1092, `Cta.tsx`): context sentence (`cta.context.*`), link `cta.link`, meta `cta.link.meta`. Copy is unchanged. Today `background: var(--bg-raised)` (white at 1.5%) is nearly invisible and the block reads as a footnote; it becomes a verdict-tinted panel.

### 4.1 Markup

`Cta.tsx` already receives `verdict`. Add `data-verdict={verdict}` to the `<section className="cta">` so `--verdict` and `--eval-bg` resolve there (or on an ancestor already carrying it, whichever exists on the result screen).

### 4.2 CSS

```css
.cta {
  margin-top: 56px;
  padding: 40px 32px 40px 36px;
  background: var(--eval-bg);
  border: 1px solid var(--eval-border);
  border-left: 4px solid var(--verdict);
  border-radius: 0;
  color: var(--eval-text);
}
.cta-context {
  font: 500 clamp(17px, calc(18px * var(--fluid-k)), 24px) / 1.5 var(--font-sans);
  color: var(--eval-text);
  max-width: 42ch;
}
.cta-link {
  display: inline-block;
  margin-top: 20px;
  font: 400 14px / 1.5 var(--font-mono);
  color: var(--eval-link);
  text-decoration: underline;
  text-decoration-color: currentColor;
  text-underline-offset: 4px;
  white-space: nowrap;
}
.cta-link:hover {
  color: var(--eval-link-hover);
}
.cta-link:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 3px;
}
.cta-meta {
  color: var(--text-muted);
}
@media (max-width: 720px) {
  .cta {
    padding: 28px 20px 28px 20px;
  }
  .cta-link {
    white-space: normal;
  }
}
```

Rules kept from the visual design: the verdict colour appears only as a border and a 4px rule (non-text), never as text; no gradient, no glow, no shadow; radius 0; the link is not a filled button (the filled button of the view stays the existing one). The accent `#5b8cff` is no longer the link colour here because it falls below 4.5:1 on the yellow tint (3.85); the lighter existing token `--accent-hover` is used for all four verdicts so the block does not change link colour per verdict. The hover state raises the link to `--text`. Fixed hex backgrounds are used instead of `color-mix` so the contrast table is exact.

### 4.3 Contrast table

Computed with the WCAG 2.x formula (relative luminance on linearised sRGB, ratio `(L1 + 0.05) / (L2 + 0.05)`) by the snippet in 4.5. The backgrounds are the verdict colour at 20% over `#0a0b0d`.

| Verdict      | `--eval-bg` | Context text `#e7e9ec` | Link `#96b4ff` | Link hover `#e7e9ec` | Meta `#9aa1ab` | Border and rule (verdict colour) | Focus ring `#5b8cff` |
| ------------ | ----------- | ---------------------- | -------------- | -------------------- | -------------- | -------------------------------- | -------------------- |
| bash         | `#1b3833`   | 10.40                  | 6.19           | 10.40                | 4.86           | 8.73 (`#61edcc`)                 | 4.00                 |
| let-it-write | `#3a361e`   | 10.00                  | 5.95           | 10.00                | 4.67           | 9.38 (`#f9e361`)                 | 3.85                 |
| bash-1call   | `#3a2b18`   | 11.22                  | 6.67           | 11.22                | 5.24           | 7.08 (`#fca942`)                 | 4.32                 |
| burn         | `#391d1b`   | 12.64                  | 7.52           | 12.64                | 5.90           | 4.95 (`#f36451`)                 | 4.86                 |

Requirements: all text columns (context, link, hover, meta) are at least 4.5:1 (lowest: 4.67, meta on `let-it-write`). Non-text columns (border, rule, focus ring) are at least 3:1 (lowest: 3.85). Against the page `--bg` (`#0a0b0d`) the verdict border and 4px rule are 13.59 (bash), 15.18 (let-it-write), 10.21 (bash-1call) and 6.33 (burn), which identifies the block; the fill alone is only 1.28 to 1.62 against `--bg` and is not relied on.

### 4.4 States, forced colors, contrast preference

- Hover: only the link colour changes (`--eval-link-hover`). The block itself is not interactive.
- Focus: global ring (`2px solid var(--accent)`, offset `3px`), checked in the table; offset places part of the ring on `--bg`, where the ratio is 6.2.
- `forced-colors: active`: `.cta { border: 1px solid CanvasText; background: Canvas; }`, `.cta-link { color: LinkText; }`; the 4px left rule uses `border-left-color: CanvasText`.
- `prefers-contrast: more`: `.cta { border-width: 2px; border-left-width: 6px; }` and `.cta-meta { color: var(--text-body); }`.
- `prefers-reduced-motion`: nothing animates in the block, so nothing changes.

### 4.5 Reproducible computation

```js
const lin = (c) => ((c /= 255) <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const lum = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => lin(parseInt(hex.slice(i, i + 2), 16)));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => {
  const [x, y] = [lum(a), lum(b)];
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
};
// eval-bg = 0.2 * verdict + 0.8 * #0a0b0d, per channel, rounded
```

## 5. Implementation checklist

- `src/styles/tokens.css`: section 0 (tokens, `@supports` block, mapped `--eval-bg`; drop the 720px `--gutter` override).
- `src/styles/layout.css`: section 1 clamps and gauge calc values; section 2 media blocks (adjacent to the existing 900px block, `min-width: 901px` first); section 3 intro rules inside the 900px block; section 4 `.cta` rules and forced-colors/contrast additions in the existing sections.
- `src/components/Layout.tsx`: `data-started` on `.split` (from the wizard step) and `inert` plus `aria-hidden` on the intro while started.
- `src/components/Intro.tsx`: wrap the content in `.intro-inner`.
- `src/components/Wizard.tsx`: report `step >= 1` upward; in the existing focus effect use `preventScroll` and the scroll rules of 3.3.
- `src/components/Cta.tsx`: `data-verdict={verdict}` on the section.
- Verify: `npm run typecheck`, `lint`, `test`, `build`; browser at 390x844, 320x568, 1280x600, 1400x500, 1920x720, 2542x1300, 3200x1800; all four verdicts; keyboard focus; reduced motion; forced colors.

## 6. Open questions for the Designer

1. Short tier at 640px hides the lead. Keep it hidden, or accept a 2-line clamp?
2. Mobile: on return to step 0 focus goes to the question heading (3.4). Should it go to the intro heading instead?
3. Link colour in the evaluation block is `--accent-hover` for all verdicts. Is a neutral `--text` link (underlined) preferred?
4. Cap of 2660px for the split (1.9 times the 1400px cap): confirm, or lower it for ultra-wide monitors.
5. Whether the mobile rule in section 3 should be recorded as decision 0004 (refinement of 0003).
