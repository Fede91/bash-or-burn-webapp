# Implementation spec: shell, gauge, wizard, result

Layout A "Strumento" ([decision 0003](../../wiki/decisions/0003-layout-strumento.md)). Source of truth for values: artifact `mockup-a-strumento.html`, design system `design-system-federicobagato-it.md`, [visual design](../../wiki/specs/visual-design.md), `verdict-colours.md`, `copy-deck.md` (string keys). Where this document and the mockup differ, **this document wins** and the difference is listed in section 14.

Conventions: `px` for everything the mockup states in `px`; token names are the CSS custom properties already in `src/styles/tokens.css`. Strings always come from `src/i18n/` (key in brackets). Copy never lives in components.

## 0. Tokens

All tokens used below exist in `src/styles/tokens.css`, **except these two, to add to `:root`** (mockup values):

```css
--ease-out: cubic-bezier(0.25, 0.46, 0.45, 0.94); /* power2.out */
--ease-out-3: cubic-bezier(0.215, 0.61, 0.355, 1); /* power3.out */
```

`--verdict` is the mapped current value set by `[data-verdict]` (already in `tokens.css`). Colour scope in section 9.

Global base (from mockup): `box-sizing: border-box`; `body` Archivo 16px/1.55, `--text` on `--bg`, `overflow-x: hidden`; `::selection` accent bg, `--bg` text; links `--accent`, hover `--accent-hover`, no underline; `h1,h2,h3,p { margin: 0 }`; `fieldset { border: 0; padding: 0; margin: 0; min-width: 0 }`; `<meta name="color-scheme" content="dark">`, `theme-color #0a0b0d`.

Global focus ring: `:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; }`. Never removed. Radio rows use offset `-2px` (section 6).

CSS layer order for hand-written CSS: `tokens, base, layout, components, states`. Tailwind utilities may be used for layout; arbitrary values are fine where this spec gives numbers (for example `grid-cols-[minmax(0,1.08fr)_minmax(0,1fr)]`). No colours, radii or sizes outside this document.

## 1. Breakpoints and grid

| Name              | Query              | What changes                                                                                    |
| ----------------- | ------------------ | ----------------------------------------------------------------------------------------------- |
| desktop           | `min-width: 901px` | split screen, left column sticky                                                                |
| tablet and mobile | `max-width: 900px` | stacked: intro, wizard, sticky gauge bar; `.cols` and outline numeral hidden; `kbd` hint hidden |
| narrow            | `max-width: 720px` | `--gutter: 20px`; `.brand-role` hidden                                                          |
| small             | `max-width: 640px` | secondary mono lines hidden (design system 5.2); CTA link wraps (section 11)                    |
| minimum           | 320px              | nothing may overflow horizontally; verify at 320                                                |

Gutter: `--gutter: 32px` (20px at ≤ 720px). Container: the split is capped with `max-width: var(--max-width)` (1400px) and `margin-inline: auto`. Page background stays `--bg` outside it.

### 1.1 Desktop split (> 900px)

```css
.split {
  display: grid;
  grid-template-columns: minmax(0, 1.08fr) minmax(0, 1fr);
  min-height: 100dvh;
}
.left {
  position: sticky;
  top: 0;
  height: 100dvh;
  display: grid;
  grid-template-rows: 1fr auto;
  border-right: 1px solid var(--line-strong);
  overflow: hidden;
}
```

At 1400px wide: left 673px, right 627px.

- `.cols` (decorative, `aria-hidden`): `position: absolute; inset: 0; display: grid; grid-template-columns: repeat(6, 1fr); pointer-events: none`. Each `span` has `border-right: 1px solid var(--line-grid)`, the last one none.
- `.intro`: `position: relative; display: grid; align-content: end; gap: 24px; padding: 96px var(--gutter) 40px`.
- `.wizard` (right column): `position: relative; display: grid; align-content: end; padding: 120px var(--gutter) 40px`. Content is bottom-aligned on question screens. On the result screen content is taller than the viewport, so the column scrolls and the left column stays pinned.
- Height guard (not in the mockup, needed): the left column is `overflow: hidden`, and at 1280x720 the intro would clip. Use `h1 { font-size: clamp(44px, min(6.2vw, 11vh), 120px) }` and verify at 1280x720 and 1366x768 that eyebrow, title, lead and the gauge are all fully visible.

### 1.2 Stacked (≤ 900px)

```css
.split {
  display: flex;
  flex-direction: column;
}
.left {
  display: contents;
}
.intro {
  order: 1;
  padding: 104px 20px 40px;
  border-bottom: 1px solid var(--line-strong);
}
.wizard {
  order: 2;
  padding: 40px 20px 32px;
  align-content: start;
}
.gauge {
  order: 3;
}
```

## 2. Shell: nav, skip link, grain

| Element                      | Spec                                                                                                                                                                                                                                                                                        |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Skip link `Vai alla domanda` | first focusable; `position: absolute; left: 16px; top: -100px; z-index: 100`; on `:focus` `top: 16px`; mono 500 13px/1, `--accent` bg, `--bg` text, `padding: 12px 18px`, `border-radius: 999px`. Target `#wizard`. Contrast 6.23:1.                                                        |
| Nav                          | `position: fixed; top: 0; inset-inline: 0; z-index: 50; display: flex; justify-content: space-between; align-items: baseline; gap: 24px; padding: 18px var(--gutter); background: var(--bg-overlay); backdrop-filter: blur(14px); border-bottom: 1px solid var(--line)`. Height about 50px. |
| Brand                        | link to `#top`: `bash or burn` mono 500 13px/1 `--text`; role `un test di federicobagato.it` mono 400 11px/1 `--text-muted`, hidden ≤ 720px. Hover does not change colour.                                                                                                                  |
| Nav link                     | `federicobagato.it ↗` mono 400 12px/1, ls 0.02em, `--text-muted`, hover `--accent`. `↗` is `aria-hidden`. The link area gets `padding-block: 8px` (24px minimum target, WCAG 2.5.8).                                                                                                        |
| Grain                        | fixed SVG overlay, `inset: 0; z-index: 70; pointer-events: none; opacity: 0.09; mix-blend-mode: overlay`, tile 140px. `aria-hidden`.                                                                                                                                                        |
| z-index                      | nav 50, gauge bar 40, skip link 100, grain 70.                                                                                                                                                                                                                                              |

Landmarks: `header` (nav), `main#top` (split), `section` intro `aria-labelledby`, `section.gauge aria-labelledby`, `section.wizard aria-label` [`wizard.region`], footer is a `footer` inside the right column.

## 3. Intro (left column)

| Element  | Spec                                                                                                                                                                                                                                                                 |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Eyebrow  | mono 500 11px/1, ls 0.14em, uppercase, `--accent`.                                                                                                                                                                                                                   |
| `h1`     | Archivo 700, `clamp(44px, 6.2vw, 120px)` (with the height guard above), lh 0.92, ls -0.04em, `text-wrap: balance`, `max-width: 11ch`. Two block `span`s: line 1 `--text`, line 2 `--accent` (`.acc`). The `h1` is always the accent version, never verdict-coloured. |
| Lead     | Archivo 400, `clamp(17px, 1.5vw, 21px)`/1.5, `--text-body`, `max-width: 44ch`, `text-wrap: pretty`. `em` is `font-style: normal; color: var(--text)`.                                                                                                                |
| Entrance | `[data-line]` `rise` 1.1s `--ease-out-3`, second line delay 0.09s; lead and gauge `fade` 0.9s `--ease-out` delay 0.3s. Disabled under reduced motion (section 12).                                                                                                   |

## 4. Gauge ("Dove ti porta, finora")

`section.gauge` is the same component on desktop and mobile. It reads `{ total, zone, verdict }` from the scoring lib (provisional logic: override `bash-1call` if flag `ibrido` and Q3 ≠ "Change based on what it finds", else the zone from the total).

### 4.1 Desktop layout

`.gauge`: `position: relative; background: var(--bg); border-top: 1px solid var(--line-strong); padding: 24px var(--gutter) 28px; display: grid; gap: 18px`.

1. **Head** (`display: flex; justify-content: space-between; align-items: baseline; gap: 16px`):
   - `h2` label [`gauge.label`, result: `gauge.label.final`]: mono 500 11px/1, ls 0.14em, uppercase, `--text-muted`.
   - total [`gauge.total`]: `p` mono 400 13px/1 `--text-muted`; the number is a `b`: mono 500 28px, ls -0.02em, `--accent`, `margin-inline-start: 8px`, `font-variant-numeric: tabular-nums`. The number is signed (`+3`, `-5`, `0`).
2. **Scale**, `aria-hidden="true"`, `position: relative; height: 64px`.
3. **Legend** (3 cells), then **note**, then the sr-only live region.

### 4.2 Scale geometry

The scale is the full content width (`100%` of the gauge's inner box). Position of value `v` (integer, -14..+14) is `p(v) = (v + 14) / 28 * 100%`.

| Part          | Spec                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Ticks         | 29 ticks, one per point. Container `position: absolute; inset: 0 0 auto 0; height: 40px`. Each tick `position: absolute; bottom: 0; left: calc(var(--i) * 100% / 28); width: 1px; transform: translateX(-0.5px)` with `--i` = 0..28. Minor: height 12px, `--line-strong`. Major (even `v`, 15 of them, including 0 at 50%): height 22px, `rgba(255,255,255,0.3)`. The mockup uses `justify-content: space-between`; it gives the same result to within 1px, `left: calc()` is preferred so ticks, cuts and needle share one formula.                                                                                                                                  |
| Baseline      | `position: absolute; left: 0; right: 0; top: 40px; height: 1px; background: var(--line-strong)`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| Cuts          | two marks `position: absolute; top: -8px; width: 1px; height: 17px; background: rgba(255,255,255,0.3)` inside the baseline element. They sit **between** integers, because verdict `bash` is total ≤ -4 and `burn` is total ≥ +5: left `37.5%` ((-3.5+14)/28) and `66.0714%` ((4.5+14)/28). Not at 35.71% / 67.86%.                                                                                                                                                                                                                                                                                                                                                   |
| Labels        | `position: absolute; left: 0; right: 0; top: 50px`, mono 400 11px/1 `--text-muted`, `font-variant-numeric: tabular-nums`, each `span` absolutely positioned, `white-space: nowrap`. `-14 · script` [`gauge.scale.min`] at 0, left aligned; `-4` at 37.5%, `0` at 50%, `+5` at 66.0714% (centred with `translateX(-50%)`); `agente · +14` [`gauge.scale.max`] at 100%, right aligned (`translateX(-100%)`). The `-4` and `+5` labels mark the first value of the zone's edge, on the cut. Check at 320px that `+5` and `agente · +14` do not touch (at 280px scale width the gap is about 8px; if they touch, drop the `-4`/`+5` labels at ≤ 360px and keep the cuts). |
| Needle        | `position: absolute; top: 0; height: 41px; width: 1px; background: var(--accent); left: var(--pos, 50%); transition: left 0.9s var(--ease-out-3)`. `--pos = (clamp(total, -14, 14) + 14) / 28 * 100%`, set with `style.setProperty` from React state. Head: `::after` dot 9x9px, `border-radius: 50%`, `background: var(--accent)`, `left: -4px; bottom: -4px` (centred on the baseline).                                                                                                                                                                                                                                                                             |
| Initial state | total 0, `--pos: 50%`, no legend cell highlighted until the first answer, label under the scale unchanged. Show `gauge.empty` as the note text until the first answer.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |

Needle motion: moves on every answer change (radio `change`), 0.9s, `--ease-out-3`, no overshoot. It does **not** move on step navigation alone. Back/forward never animate to a different value because the total depends only on answers. On "Ricomincia" the total goes to 0 and the needle returns to 50% (animated, 0.9s). On the result screen the needle shows the final total, with no entrance animation (it is already there from step 7).

### 4.3 Legend and note

```css
.legend {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1px;
  background: var(--line-divider);
  border: 1px solid var(--line-divider);
  list-style: none;
  margin: 0;
  padding: 0;
}
.legend li {
  background: var(--bg);
  padding: 12px 14px;
  display: grid;
  gap: 6px;
}
.legend li.on {
  background: var(--accent-tint);
}
```

Each cell: `.badge` (inline-flex, gap 10px, mono 400 12px/1.2, ls 0.04em, `--text-muted`; `--text` when the cell is `.on`) with a 7px dot, then `.range` mono 400 11px/1 `--text-muted`. Dot: `flex: none; width: 7px; height: 7px; border-radius: 50%; border: 3.5px solid var(--vc)` (a border so it survives forced-colors). Cells: Bash (`--verdict-bash`), Let it write the bash (`--verdict-let-it-write`), Burn (`--verdict-burn`). Names and ranges [`gauge.legend.*`]. The current zone `.on` follows `zone` and is only set after the first answer. Exactly one cell is `.on` (the featured-card rule: at most one tinted surface per group).

Note: `p.g-note` mono 400 12px/1.55 `--text-muted`, `max-width: 62ch`, `display: flex; gap: 10px; align-items: baseline`. It starts with a dot in `--verdict-bash-1call` (`aria-hidden`, `transform: translateY(-1px)`), text [`gauge.note.bash1call`]. When the override is active (`verdict === "bash-1call"`) the note text becomes `--text` (same pattern as `.on .badge`). That is the only signal of the override in the gauge besides the live region.

Dots here are the only verdict colour in the gauge. Never coloured text.

### 4.4 Live region

`<p class="sr-only" aria-live="polite">` always in the DOM. Updated only on an answer `change` (not on first render, not on step change). Text [`gauge.live.provisional`]: `Totale provvisorio {total}. Per ora: {verdict}.`; on the result screen [`gauge.live.final`]; on restart [`gauge.live.reset`]. `.sr-only`: `position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0; overflow: hidden; clip-path: inset(50%); white-space: nowrap; border: 0`.

The visible scale, ticks, labels and needle are `aria-hidden`. The visible total and legend are text and stay readable by screen readers (the heading `h2` labels the section).

### 4.5 Shared-link state (`?v=`, no answers)

No total exists. Hide the needle and the total figure (`display: none`), show [`gauge.shared`] as `.g-note` text in place of the note, keep ticks, cuts and legend. No legend cell `.on` (no zone known).

## 5. Mobile sticky bar (≤ 900px)

Same `section.gauge`, restyled:

```css
@media (max-width: 900px) {
  html {
    scroll-padding-bottom: 140px;
    scroll-padding-top: 72px;
  }
  .gauge {
    position: sticky;
    bottom: 0;
    z-index: 40;
    order: 3;
    padding: 14px 20px calc(16px + env(safe-area-inset-bottom));
    gap: 10px;
    background: var(--bg);
    border-top: 1px solid var(--line-strong);
  }
  .scale {
    height: 46px;
  }
  .ticks {
    height: 28px;
  }
  .tick {
    height: 8px;
  }
  .tick.major {
    height: 14px;
  }
  .zones {
    top: 28px;
  }
  .nums {
    top: 36px;
  }
  .needle {
    height: 29px;
  }
  .legend,
  .g-note {
    display: none;
  }
  .g-total b {
    font-size: 22px;
  }
}
```

- **Bar height**: 1 + 14 + 22 (head) + 10 + 46 + 16 = about 109px (+ safe-area inset). `scroll-padding-bottom: 140px` keeps focused elements at least 30px clear of the bar (WCAG 2.4.11 Focus Not Obscured). `scroll-padding-top: 72px` clears the fixed nav (50px + 22px).
- **Background**: opaque `--bg`, **not** `--bg-overlay` (deviation, section 14.1). Reason: with `--bg-overlay` over bright text scrolling beneath, `--text-muted` falls to 3.45:1 in the worst case (table 13.2).
- **Head on mobile** carries the short zone text: `gauge.bar.label` ("finora") + `gauge.bar.zone` ("per ora: {verdict}") on the left in mono 11px `--text-muted`, total on the right. `h2` stays in the DOM (visually the `finora` label). The zone text is informative, so it must be `--text-muted` or lighter.
- Sticky works because the gauge is the last flex child of `.split`; at the end of the page it rests under the footer. The wizard section's `padding-bottom: 32px` leaves room.
- Mobile result screen keeps the bar (final total).
- Outline numeral hidden, legend and note hidden (their information is in the bar text and live region).

## 6. Wizard

### 6.1 Chrome and structure

```html
<form id="wizard" novalidate tabindex="-1">
  <div class="progress" aria-hidden="true">01 / 07 + 7 segments</div>
  <fieldset aria-describedby="err-{id}" style="view-transition-name: question">
    <legend>
      <h2 id="q-title" tabindex="-1"><span class="sr-only">Domanda n di 7. </span>Title</h2>
    </legend>
    <p class="q-hint">…</p>
    <div class="opts">…labels with radios…</div>
    <div id="note" aria-live="polite"></div>
    <p class="error" id="err-{id}" aria-live="assertive"></p>
  </fieldset>
  <div class="actions">…</div>
</form>
```

| Element                   | Spec                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Outline numeral           | `position: absolute; top: 64px; right: 1vw`, Archivo 700, `clamp(180px, 26vw, 420px)`/0.8, ls -0.05em, `color: transparent; -webkit-text-stroke: 1px var(--numeral-outline)`. Text `01`..`07`, `?` on result. `pointer-events: none; user-select: none; aria-hidden`. Hidden ≤ 900px and in forced-colors.                                                                                                                                                                      |
| Progress                  | `display: flex; align-items: center; gap: 16px; margin-bottom: 40px` (28px ≤ 900px). Text `NN / 07` [`wizard.progress`] mono 500 11px/1, ls 0.14em, `--accent`, `white-space: nowrap`, tabular-nums. Bar: `flex: 1; display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px`; each segment 2px high: done `--accent`, current `--text-muted`, upcoming `--line-strong`. The progress is `aria-hidden`: the `sr-only` text in the `h2` [`wizard.progress.sr`] carries it. |
| Question title `h2`       | Archivo 700, `clamp(32px, 4vw, 64px)`/1.02, ls -0.035em, `max-width: 16ch`, `text-wrap: balance`, `--text`. `:focus { outline: none }`, `:focus-visible { outline: 2px solid var(--accent); outline-offset: 6px }`. Receives focus on every step change, back and restart.                                                                                                                                                                                                      |
| Hint                      | `margin-top: 16px`, `--text-muted`, `max-width: 46ch`, Archivo 16px.                                                                                                                                                                                                                                                                                                                                                                                                            |
| Options container `.opts` | `margin-top: 36px; display: grid; gap: 1px; background: var(--line-divider); border: 1px solid var(--line-divider)`.                                                                                                                                                                                                                                                                                                                                                            |

### 6.2 Answer row

`label.opt` (a real `label` around a real `input[type=radio]`):

| Property                             | Desktop                   | ≤ 900px                   |
| ------------------------------------ | ------------------------- | ------------------------- |
| `display: grid; align-items: center` | yes                       | yes                       |
| `grid-template-columns`              | `40px minmax(0,1fr) 22px` | `28px minmax(0,1fr) 22px` |
| `gap`                                | 20px                      | 14px                      |
| `padding`                            | 24px                      | 20px 16px                 |
| `min-height`                         | 88px                      | 72px                      |
| `background`                         | `--bg`                    | `--bg`                    |
| `cursor`                             | pointer                   | pointer                   |

- Radio input: `position: absolute; opacity: 0; width: 1px; height: 1px` inside the label (native keyboard behaviour: arrows move and select, Tab enters and leaves the group). Same `name` per question. The whole row is the click target.
- Key `a`/`b`/`c`: mono 400 13px/1 `--text-muted`, `aria-hidden`.
- Label text: Archivo 600, `clamp(19px, 1.6vw, 24px)`/1.2, ls -0.015em, `--text`.
- Hint (optional): mono 400 12px/1.4 `--text-muted`, `margin-top: 6px`, block.
- Indicator `.radio`: 20x20px, `border-radius: 50%`, `border: 1px solid var(--text-muted)`, `aria-hidden`. Border contrast is 7.56:1 against `--bg`.

### 6.3 States

| State                                         | Visual                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Default                                       | as above                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| Hover (pointer)                               | `.radio` border `--text`; label stays `--text`. No background change. (The mockup declares a background transition but only the selected state uses it.)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| Focus (keyboard, `:has(input:focus-visible)`) | `outline: 2px solid var(--accent); outline-offset: -2px; z-index: 1` on the row. The negative offset keeps the ring inside the 1px gap grid so neighbours do not hide it. Contrast 6.23:1 (5.95:1 on tint).                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| Selected (featured card)                      | `background: var(--accent-tint)`; `.radio` border `--accent` with a 12px inner dot (`::after`, `inset: 4px`, `border-radius: 50%`, `background: var(--accent)`); key letter `--accent`. At most one per group (it is a radio group). Shape (the dot) is the non-colour cue.                                                                                                                                                                                                                                                                                                                                                                        |
| Selected + hover                              | no change (selected wins).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| Selected + focus                              | both applied.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| Disabled                                      | does not exist. The primary button is never disabled.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| Error                                         | submit with no choice: `.error` gets [`wizard.error.none`]; focus moves to the first radio. `.error`: `margin-top: 16px; font: 500 13px/1.4 var(--font-mono); color: var(--text); display: flex; gap: 10px; align-items: baseline`; a leading `!` in `--accent` is a real `<span aria-hidden="true">` (not `::before`, so it is not announced). `.error:empty { display: none }`. There is no red: no second accent (visual-design rules). The message is text, so colour is never the only cue. The message is cleared on the next `change`. `aria-live="assertive"` plus `aria-describedby` on the fieldset. The `.opts` border does not change. |
| Q7 "Only via MCP" note                        | `#note` (`aria-live="polite"`) is always in the DOM. When the chosen option has a note it renders `.note`: `margin-top: 20px; border: 1px solid var(--line-strong); padding: 18px 20px; display: grid; gap: 8px; max-width: 60ch`; eyebrow [`wizard.note.label`] mono 500 11px accent uppercase ls 0.14em; text Archivo 15px `--text-body`.                                                                                                                                                                                                                                                                                                        |

Back: keeps all answers, restores the selected state of the target step.

### 6.4 Actions

`.actions`: `margin-top: 36px; display: flex; flex-wrap: wrap; align-items: center; gap: 16px 24px`.

| Button                                          | Spec                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Primary [`wizard.next` / `wizard.submit` on Q7] | `type="submit"`, the only filled surface in the view. `display: inline-flex; align-items: center; gap: 10px; min-height: 48px; padding: 16px 28px; border-radius: 999px; font: 500 14px/1 var(--font-mono); background: var(--accent); color: var(--bg); border: 1px solid transparent`. Hover `background: var(--accent-hover)`, text stays `--bg`. Transition `background-color, border-color, color 0.3s var(--ease-out)`. `→` is a `<span aria-hidden>`. |
| Outline `Indietro` [`wizard.back`], from Q2     | same box; `background: transparent; color: var(--text); border-color: var(--line-control)`. Hover: `border-color: var(--accent)`, text unchanged. Always the second button, `type="button"`.                                                                                                                                                                                                                                                                 |
| Keyboard hint [`wizard.kbd`]                    | mono 400 11px/1 `--text-muted`, `aria-hidden`, shown only > 900px.                                                                                                                                                                                                                                                                                                                                                                                           |

Order in the DOM: primary, then Back (so Enter and the first Tab stop go to primary). There is no disabled state.

### 6.5 Step transitions

`document.startViewTransition` when available and not reduced motion; the `fieldset` (and the result wrapper) carry `view-transition-name: question` (unique on the page). `::view-transition-old(question)`: 0.35s `--ease-out`, to `opacity: 0; translateY(-24px)`. `::view-transition-new(question)`: 0.6s `--ease-out-3`, from `opacity: 0; translateY(40px)`. After the swap, focus the `h2`.

## 7. Result screen (right column)

Order: progress (`07 / 07`, all segments done), badge, title, tagline, in-page list, factors, code (Bash and Let it write only), calculator, share, CTA, restart, footer. Wrapper has `data-verdict="{slug}"` and `style="view-transition-name: question"`.

| Element                          | Spec                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Badge                            | `p.badge` `Verdetto: {name}` [`result.badge`]: mono 400 12px/1.2, ls 0.04em, `--text-muted`, 7px dot `border: 3.5px solid var(--verdict)`, `aria-hidden`.                                                                                                                                                                                                                                                                            |
| Title `h2#q-title` (tabindex -1) | Archivo 700, `clamp(36px, 4.6vw, 76px)`/0.98, ls -0.04em, `max-width: 14ch`, `text-wrap: balance`, `margin-top: 24px`. Two block `span`s with a space between them: line 1 `--text`, line 2 `color: var(--verdict)`. Focus handling as the question title.                                                                                                                                                                           |
| Tagline                          | mono 400 13px/1.4 `--text-muted`, `margin-top: 20px`. [`result.tagline`] or `.shared` without total.                                                                                                                                                                                                                                                                                                                                 |
| In-page list                     | `nav aria-label` [`result.toc.label`], list `margin-top: 36px; display: grid; gap: 1px; background: var(--line-divider); border: 1px solid var(--line-divider); padding: 0`. Items are links to section ids: `background: var(--bg); padding: 16px 20px; font: 400 12px/1.4 var(--font-mono); color: var(--text-muted)`; hover colour `--accent`. Min height 48px. Numbering [`result.toc.*`] changes when the code block is absent. |
| Section rhythm                   | each section after the list: `margin-top: 56px; padding-top: 32px; border-top: 1px solid var(--line-strong)`; `scroll-margin-top: 72px`. Section title: Archivo 600 22px/1.2, ls -0.015em, `--text` (design system "case title"); preceded by the eyebrow style number.                                                                                                                                                              |
| Factors                          | list in the gap-1px style, 2 rows, each `display: grid; grid-template-columns: 40px minmax(0,1fr); gap: 20px; padding: 20px 24px; background: var(--bg)`: mono 13px `--text-muted` index, question mono 12px `--text-muted`, answer Archivo 600 `clamp(19px,1.6vw,24px)` `--text`. Shared link: show [`result.factors.shared`] in `.note` style instead.                                                                             |
| Code block                       | `pre` (`tabindex="0"`, `role="region"` with an accessible name): `margin: 20px 0 0; border: 1px solid var(--line-strong); background: var(--bg-raised); padding: 20px 24px; overflow-x: auto; font: 400 13px/1.6 var(--font-mono); color: var(--text-body)`. No syntax colours (one accent only); comment lines `--text-muted`. 10 to 15 lines. Keeps its own horizontal scroll, never page overflow.                                |
| Final gauge                      | left column gauge shows the final total, label [`gauge.label.final`].                                                                                                                                                                                                                                                                                                                                                                |

Verdict colour scope: section 9.

## 8. Calculator

`section#calculator`, section title [`calc.title`], intro [`calc.intro`] (Archivo 16px `--text-muted`, `max-width: 46ch`; Burn variant [`calc.intro.burn`]).

Layout: fields in a gap-1px grid (`gap: 1px; background: var(--line-divider); border: 1px solid var(--line-divider); margin-top: 28px`). Cells `background: var(--bg); padding: 20px 24px`. Row 1: runs per day (full width, with slider). Row 2: `repeat(auto-fit, minmax(220px, 1fr))`: input tokens, output tokens, model, currency. Single column ≤ 900px.

| Part                     | Spec                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Label                    | mono 500 11px/1, ls 0.14em, uppercase, `--text-muted`, `<label for>`.                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| Hint                     | mono 400 12px/1.4 `--text-muted`, `margin-top: 8px`, linked with `aria-describedby`.                                                                                                                                                                                                                                                                                                                                                                                                                           |
| Number input             | `margin-top: 12px; width: 100%; min-height: 48px; padding: 12px 14px; background: transparent; border: 1px solid var(--line-control); border-radius: 0; color: var(--text); font: 400 14px/1 var(--font-mono); font-variant-numeric: tabular-nums`. Hover: border `--accent`. Focus: global ring. Invalid value (outside range): `aria-invalid="true"`, message under the field in the `.error` style (mono 500 13px `--text`, aria-hidden `!` in accent); the border stays `--line-control`, there is no red. |
| Slider (runs/day)        | native `input[type=range]` 1..10,000, log mapping in code, `aria-valuetext` [`calc.runs.valuetext`]. Track 2px `--line-strong` (filled part `--accent`), thumb 16px circle `--accent`, no border, hit area 44px high (`height: 44px` on the input, track drawn centred). Paired with the numeric input; both stay in sync.                                                                                                                                                                                     |
| Select (model, currency) | native `select`, same box as the number input, `appearance: auto`, `color-scheme: dark`, text `--text`. No custom chevron icon (no icons in the system).                                                                                                                                                                                                                                                                                                                                                       |
| Output                   | block `margin-top: 28px`, three lines [`calc.out.*`]. The yearly cost line is the featured card: `background: var(--accent-tint); border: 1px solid var(--line-strong); padding: 24px`; figure mono 500 28px, ls -0.02em, `--accent`, tabular-nums; surrounding label mono 13px `--text-muted`. Tokens line and script line below, mono 400 13px/1.4 `--text-body`, `padding: 16px 24px`, in the same gap-1px list. One featured cell only.                                                                    |
| Irony line               | Archivo 16px/1.55 `--text-body`, `margin-top: 20px`, `max-width: 52ch`.                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| Live announcement        | `aria-live="polite"` sr-only, debounced 600ms [`calc.live`]. Never announce on every keystroke.                                                                                                                                                                                                                                                                                                                                                                                                                |

Currency and prices come from `src/data/prices.json`; the maths lives in `src/lib/cost.ts` (no UI spec needed).

## 9. Verdict colour scope (title and badge)

`[data-verdict]` on the result wrapper sets `--verdict`. Allowed uses, and nothing else:

| Use  | Element                                           | Value                                                |
| ---- | ------------------------------------------------- | ---------------------------------------------------- |
| Text | result title line 2 only (36px+ bold, large text) | `color: var(--verdict)`                              |
| Dot  | result badge dot                                  | `border: 3.5px solid var(--verdict)`                 |
| Dot  | gauge legend dots and the note dot                | `--vc` from the zone's own verdict, not the result's |

Forbidden: verdict colour on small text, on buttons, links, eyebrows, focus rings, calculator figures, borders of cards, backgrounds, the needle, or on the title's first line. Verdict name is always text. The needle, progress and all UI states stay `--accent`.

Colours per verdict on every surface: `verdict-colours.md` section 4.1 (all ≥ 6.03:1).

## 10. Share

`section#share`, `margin-top: 56px; padding-top: 32px; border-top: 1px solid var(--line-strong)`.

- Primary button [`share.button`] `Condividi il verdetto`: the single filled button on the result screen (the same primary spec as 6.4). It toggles a disclosure (`aria-expanded`, `aria-controls`). Where `navigator.share` exists on mobile it may call it directly instead; the disclosure stays the fallback.
- Disclosure panel: `margin-top: 16px; display: flex; flex-wrap: wrap; gap: 12px`. Three outline pills [`share.x`, `share.linkedin`, `share.copy`], 48px high. X and LinkedIn are links (`target="_blank" rel="noopener noreferrer"`) with an sr-only text [`a11y.share.x` / `a11y.share.linkedin`]; Copy is a button.
- Feedback line [`share.copied`, `share.linkedin.copied`, `state.copyFail`]: `aria-live="polite"` container always in the DOM, `margin-top: 12px`, mono 400 13px/1.4 `--text`. Not coloured.
- `Ricomincia` [`result.restart`] is an outline pill in the same row as the primary button (`gap: 16px 24px`, wrap). It is `type="button"`, resets answers, needle and focus to the first question title [`state.restart.done` live message].

## 11. CTA and footer

### CTA (all four verdicts)

`section.cta`: `margin-top: 56px; background: var(--bg-raised); border-block: 1px solid var(--line-strong); padding: 32px 24px` (28px 20px ≤ 720px). Contents: context sentence [`cta.context.{verdict}`] Archivo 16px/1.55 `--text-body`, `max-width: 38ch`; link below, `margin-top: 20px`, as the system "link CTA": mono 400 13px/1.4 `--accent`, `border-bottom: 1px solid var(--accent-underline); padding-bottom: 5px`; hover `--accent-hover`. The whole sentence [`cta.link`] is the link; `federicobagato.it ↗` [`cta.link.meta`] is mono `aria-hidden` text next to it; the sr-only suffix [`cta.link.sr`] follows. `white-space: nowrap` (design system) is **dropped at ≤ 720px** (`normal`): the sentence is about 50 characters of 13px mono, about 390px, wider than a 320px screen. Opens in the same tab, plain link (external, `rel="noopener"`).

### Footer

`footer` at the end of the right column (inside `.wizard`): `margin-top: 48px; padding-top: 28px; border-top: 1px solid rgba(255,255,255,0.09); display: flex; flex-wrap: wrap; justify-content: space-between; gap: 12px 24px; font: 400 11px/1.4 var(--font-mono); color: var(--text-muted)`. Items [`footer.made`, `footer.nomodel`, `footer.privacy`, `footer.legal`, `footer.link`]. Links `--text-muted`, hover `--accent`, with `padding-block: 8px` (24px target). **Footer text uses `--text-muted`, not `--text-ghost` or `--text-faint` as the design system suggests for footers**: these lines carry information (privacy, legal). The footer appears on question screens too (below the actions, small), see mockup `.foot` on result only; show it on every screen of the right column.

### System states (layout only)

- Shared banner [`state.shared.banner`] and invalid link [`state.invalid.*`]: `.note` pattern (1px `--line-strong` border, padding 18px 20px, Archivo 15px `--text-body`, title Archivo 600 22px `--text`), placed above the progress; the CTA [`state.shared.cta`, `state.invalid.cta`] is the primary pill.
- `noscript` [`state.noscript`] in the same box inside `.wizard`; error boundary [`state.error.*`] same box with the primary "Ricarica la pagina".

## 12. Motion, reduced motion

| Motion                  | Spec                                                     |
| ----------------------- | -------------------------------------------------------- |
| Intro `rise` and `fade` | 1.1s / 0.9s, `--ease-out-3` / `--ease-out`, once at load |
| Needle                  | `left` 0.9s `--ease-out-3`                               |
| Buttons                 | 0.3s `--ease-out`                                        |
| Step swap               | View Transitions 0.35s out, 0.6s in                      |
| Rules                   | no bounce, no autoplay, nothing loops                    |

`@media (prefers-reduced-motion: reduce)`: all `animation` and `transition` set to `none !important` (including `::view-transition-group/old/new(*)`), and the code does **not** call `startViewTransition`, so steps swap instantly. The needle jumps to its position. Nothing depends on animation end events (focus and live-region updates happen immediately). `scroll-behavior` stays `auto` (smooth only inside `@media (prefers-reduced-motion: no-preference)` if ever used).

## 13. forced-colors and prefers-contrast

`@media (forced-colors: active)`:

```css
.grain,
.outline-num,
.cols {
  display: none;
}
.dot {
  border-color: CanvasText;
}
.radio {
  border-color: CanvasText;
}
.opt:has(input:checked) {
  outline: 2px solid Highlight;
  outline-offset: -2px;
}
.opt:has(input:checked) .radio::after {
  background: Highlight;
}
.needle,
.needle::after {
  background: Highlight;
}
.tick,
.zones,
.zone-cut {
  background: CanvasText;
}
.progress-bar i {
  background: GrayText;
}
.progress-bar i.done {
  background: Highlight;
}
.progress-bar i.now {
  background: CanvasText;
}
.opts,
.legend,
.v-next-list {
  background: CanvasText;
} /* the 1px gap dividers need an explicit system colour */
.btn {
  border-color: ButtonText;
}
:focus-visible {
  outline-color: Highlight;
}
input[type='range']::-webkit-slider-thumb,
input[type='range']::-moz-range-thumb {
  background: Highlight;
}
```

Do not set `forced-color-adjust: none` anywhere. Verdict title and badge text go to `CanvasText` automatically: the name stays as text. Gap-1px grids lose their dividers in forced colours because the UA resets background colours, hence the explicit `CanvasText` backgrounds above (the cell backgrounds reset to `Canvas`).

`@media (prefers-contrast: more)`: `.tick, .zones` background `var(--text-muted)`; borders of `.opts, .legend, .note, pre, .field input` `var(--text-muted)`. Verdict colours unchanged (all ≥ 6:1).

## 14. Differences from the mockup and open points

### 14.1 Conservative choices to confirm (Designer)

1. **Mobile bar background opaque `--bg`** instead of `--bg-overlay` plus blur. With overlay, worst case (muted text over `--text` content) is 3.45:1. The nav keeps `--bg-overlay` (system value); its text is `--text` and `--text-muted` over dark content, but note the same worst case exists for the nav's `--text-muted` role/link text if bright content scrolls under it.
2. **Footer text `--text-muted`** (not `--text-ghost`/`--text-faint`).
3. **Container cap 1400px** for the split (mockup is full-bleed).
4. **Title size** `clamp(36px, 4.6vw, 76px)` (mockup) rather than the verdict-colours doc's `clamp(48px, 8.4vw, 150px)`: the column is half width. Confirm.
5. **Height guard** on `h1` (`min(6.2vw, 11vh)`).
6. **CTA link wraps** ≤ 720px.
7. `!` in the error is a real `aria-hidden` span; no red for errors.
8. Sub-section titles use the system's 22px/600 (no new size). Result layouts for factors, code, calculator, share and CTA are not in the mockup; they are composed from design system primitives only (gap-1px lists, `--bg-raised` band, bordered note, pills).
9. Override signalled in the gauge by the note text turning `--text`.

### 14.2 Not in the mockup, added for WCAG

`scroll-padding-top: 72px`, safe-area padding on the bar, 24px minimum target on footer and nav links, 44px slider hit area, `tabindex="0"` on `pre`, forced-colors dividers.

## 15. Contrast table

Computed with WCAG 2.x relative luminance. Surfaces: `--bg #0a0b0d`; `--bg-surface #101216`; `--bg-raised` = white 1.5% on bg = `#0e0f11`; `--accent-tint` = accent 5% on bg = `#0e1119`. The grain overlay (opacity 0.09, overlay blend) is not included; the lowest informative ratio below is 5.93:1, so there is margin over 4.5:1.

### 15.1 Informative text

| #   | Element                                                                                                                                                                                               | Text token                 | Surface                         | Ratio           | ≥ 4.5 |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- | ------------------------------- | --------------- | ----- |
| 1   | h1 line 1, question title, answer label, result title line 1, input text, error text, selected legend name                                                                                            | `--text` `#e7e9ec`         | `--bg`                          | 16.19           | yes   |
| 2   | same on tinted rows (selected answer, `.on` legend)                                                                                                                                                   | `--text`                   | `--accent-tint`                 | 15.47           | yes   |
| 3   | same inside CTA band / code block                                                                                                                                                                     | `--text`                   | `--bg-raised`                   | 15.80           | yes   |
| 4   | lead, note text, code text, factor text, irony line, CTA context                                                                                                                                      | `--text-body` `#b4bac3`    | `--bg`                          | 10.08           | yes   |
| 5   | same on tint / raised                                                                                                                                                                                 | `--text-body`              | `--accent-tint` / `--bg-raised` | 9.64 / 9.84     | yes   |
| 6   | hints, legend names and ranges, scale labels, total label, progress segment "now", keyboard hint, tagline, badge name, key letters, calculator labels and hints, footer, in-page list, nav role/links | `--text-muted` `#9aa1ab`   | `--bg`                          | 7.56            | yes   |
| 7   | same on tint                                                                                                                                                                                          | `--text-muted`             | `--accent-tint`                 | 7.22            | yes   |
| 8   | same on raised / surface                                                                                                                                                                              | `--text-muted`             | `--bg-raised` / `--bg-surface`  | 7.38 / 7.20     | yes   |
| 9   | eyebrow, progress text, gauge total figure, calculator figure, link CTA, key letter (selected), note eyebrow                                                                                          | `--accent` `#5b8cff`       | `--bg`                          | 6.23            | yes   |
| 10  | same on tint (selected key, `.on` cell, cost figure)                                                                                                                                                  | `--accent`                 | `--accent-tint`                 | 5.95            | yes   |
| 11  | same on raised (CTA band link)                                                                                                                                                                        | `--accent`                 | `--bg-raised`                   | 6.08            | yes   |
| 12  | hover of links and nav                                                                                                                                                                                | `--accent-hover` `#96b4ff` | `--bg`                          | 9.63            | yes   |
| 13  | primary button label and skip link                                                                                                                                                                    | `--bg`                     | `--accent`                      | 6.23            | yes   |
| 14  | primary button hover                                                                                                                                                                                  | `--bg`                     | `--accent-hover`                | 9.63            | yes   |
| 15  | result title line 2, `bash` `#61edcc`                                                                                                                                                                 | `--verdict-bash`           | `--bg`                          | 13.59           | yes   |
| 16  | result title line 2, `let-it-write` `#f9e361`                                                                                                                                                         | `--verdict-let-it-write`   | `--bg`                          | 15.18           | yes   |
| 17  | result title line 2, `bash-1call` `#fca942`                                                                                                                                                           | `--verdict-bash-1call`     | `--bg`                          | 10.21           | yes   |
| 18  | result title line 2, `burn` `#f36451`                                                                                                                                                                 | `--verdict-burn`           | `--bg`                          | 6.33            | yes   |
| 19  | mobile bar, all of the above                                                                                                                                                                          | as rows 1, 6, 9            | opaque `--bg`                   | same as 1, 6, 9 | yes   |

Verdict colours on the other surfaces: 9.72 to 14.82:1 (`burn` lowest 6.03 on `--bg-surface`), see `verdict-colours.md` 4.1. All the title text is large (36px+, 700) as well.

### 15.2 Non-text (3:1 required where the element identifies a control or state)

| Element                                | Colour                      | Surface                  | Ratio         | Result                                                                                                                |
| -------------------------------------- | --------------------------- | ------------------------ | ------------- | --------------------------------------------------------------------------------------------------------------------- |
| Radio border, selected indicator       | `--text-muted` / `--accent` | `--bg` / `--accent-tint` | 7.56 / 5.95   | yes                                                                                                                   |
| Focus ring                             | `--accent`                  | `--bg` / `--accent-tint` | 6.23 / 5.95   | yes                                                                                                                   |
| Needle and dot                         | `--accent`                  | `--bg`                   | 6.23          | yes                                                                                                                   |
| Progress segment done / now            | `--accent` / `--text-muted` | `--bg`                   | 6.23 / 7.56   | yes                                                                                                                   |
| Verdict dots                           | verdict colours             | `--bg`                   | 6.33 to 15.18 | yes                                                                                                                   |
| Slider thumb and fill                  | `--accent`                  | `--bg`                   | 6.23          | yes                                                                                                                   |
| Outline button border `--line-control` | white 18%                   | `--bg`                   | 1.65          | the control is identified by its text label (rows 1 to 3), border is a hover affordance; hover border `--accent` 6.23 |
| Input border `--line-control`          | white 18%                   | `--bg`                   | 1.65          | input is identified by label, value and focus ring; flagged in 14.1 for the Designer if a stronger border is wanted   |
| Major ticks, cuts                      | white 30%                   | `--bg`                   | 2.61          | decorative: the scale is `aria-hidden` and the same information is in the text (total, legend, live region)           |
| Gap dividers, hairlines                | white 7% to 14%             | `--bg`                   | 1.1 to 1.43   | decorative                                                                                                            |

### 15.3 Tokens not allowed for informative text

| Token                                  | Ratio on `--bg`                     | Rule                                                                 |
| -------------------------------------- | ----------------------------------- | -------------------------------------------------------------------- |
| `--text-faint` `#6b7280`               | 4.07 (3.89 on tint, 3.98 on raised) | fails 4.5:1: never used for informative small text in these sections |
| `--text-ghost` `#4b5158`               | 2.45                                | decorative only; not used for any text here                          |
| `--numeral-outline`, `--numeral-ghost` | 1.10 / n.a.                         | decorative `aria-hidden` outline numeral only                        |

### 15.4 Worst case, why the mobile bar is opaque

| Text           | Over `--bg-overlay` (72% `--bg`) on `--text` content = `#484a4c` | Ratio           |
| -------------- | ---------------------------------------------------------------- | --------------- |
| `--text`       |                                                                  | 7.39            |
| `--text-body`  |                                                                  | 4.61            |
| `--text-muted` |                                                                  | **3.45 (fail)** |
| `--accent`     |                                                                  | **2.84 (fail)** |

Hence an opaque bar.

## 16. Verification checklist for the Developer

1. Desktop 1440x900, 1280x720, 1366x768: nothing clips in the left column; the gauge is pinned at the bottom.
2. 900/901px edge: layout switches; 320px: no horizontal overflow, scale labels do not collide.
3. Keyboard: Tab order skip link, nav, intro, radios (arrow keys), buttons; ring visible on each; Enter submits; error focus goes to the first radio; step change focuses the title.
4. Mobile: focus a calculator field and the last radio with the bar visible; neither is obscured (scroll-padding).
5. Needle: -14, -4, -3, 0, +4, +5, +14 sit on the right ticks and cuts; never leaves the scale.
6. Emulate `prefers-reduced-motion`, `forced-colors`, `prefers-contrast: more`.
7. Screen reader text: live region updates once per answer; dots and arrows are hidden.
