import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const DASHES = new RegExp(`[${String.fromCharCode(0x2013)}${String.fromCharCode(0x2014)}]`);

const files = [
  'src/App.tsx',
  ...readdirSync('src/components')
    .filter((f) => f.endsWith('.tsx') && !f.endsWith('.test.tsx'))
    .map((f) => join('src/components', f)),
];

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

describe('source guards', () => {
  it.each(files)('%s has no hard-coded copy', (file) => {
    const src = readFileSync(file, 'utf8');
    expect(src).not.toMatch(/>[^<>{}]*[A-Za-zÀ-ÿ][^<>{}]*</);
    expect(src).not.toMatch(/\b(aria-label|alt|title)="[^"]+"/);
  });

  it('has no copy-like literals in lib/share.ts', () => {
    const src = readFileSync('src/lib/share.ts', 'utf8');
    expect(src).not.toMatch(/(['"])[^'"\n]*[A-Za-zÀ-ÿ]+ [A-Za-zÀ-ÿ]+[^'"\n]*\1/);
  });

  it('has no em or en dash under src/', () => {
    const offenders = walk('src')
      .filter((f) => /\.(tsx?|css|json|md)$/.test(f) && !f.endsWith('no-hardcoded-strings.test.ts'))
      .filter((f) => DASHES.test(readFileSync(f, 'utf8')));
    expect(offenders).toEqual([]);
  });
});
