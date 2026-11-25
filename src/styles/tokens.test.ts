import { readFileSync } from 'node:fs';

const css = readFileSync('src/styles/tokens.css', 'utf8');

const VERDICTS = {
  bash: '#61edcc',
  'let-it-write': '#f9e361',
  'bash-1call': '#fca942',
  burn: '#f36451',
};

describe('tokens.css', () => {
  it('defines exactly 4 verdict tokens with the approved hexes', () => {
    expect(css.match(/--verdict-[a-z0-9-]+\s*:/g)).toHaveLength(4);
    for (const [slug, hex] of Object.entries(VERDICTS)) {
      expect(css).toMatch(new RegExp(`--verdict-${slug}:\\s*${hex}`));
    }
  });

  it('maps each [data-verdict] to --verdict', () => {
    for (const slug of Object.keys(VERDICTS)) {
      expect(css).toMatch(
        new RegExp(
          `\\[data-verdict='${slug}'\\]\\s*\\{\\s*--verdict:\\s*var\\(--verdict-${slug}\\)`,
        ),
      );
    }
  });
});
