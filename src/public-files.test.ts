import { existsSync, readFileSync } from 'node:fs';
import itMessages from './i18n/it.json';

const read = (path: string) => readFileSync(path, 'utf8');

const POSTHOG = 'https://eu.i.posthog.com';

describe('public files', () => {
  it('has immutable asset caching and a CSP allowing only the PostHog origin', () => {
    const headers = read('public/_headers');
    expect(headers).toContain('/assets/*');
    expect(headers).toContain('immutable');
    const csp = headers.split('\n').find((l) => l.includes('Content-Security-Policy:'));
    expect(csp).toBeDefined();
    expect(csp?.match(/https?:\/\/[^\s;]+/g)).toEqual([POSTHOG, POSTHOG]);
    for (const directive of ['script-src', 'connect-src']) {
      expect(csp).toContain(`${directive} 'self' ${POSTHOG}`);
    }
  });

  it('has the 4 placeholder OG PNGs', () => {
    for (const name of ['bash', 'bash-1call', 'burn', 'let-it-write']) {
      const buf = readFileSync(`public/og/${name}.png`);
      expect(buf.length).toBeGreaterThan(0);
      expect([...buf.subarray(0, 8)]).toEqual([137, 80, 78, 71, 13, 10, 26, 10]);
    }
  });

  it('lists the privacy page in the sitemap and gives it its own head', () => {
    expect(read('public/sitemap.xml')).toContain(
      'https://bashorburn.federicobagato.it/privacy</loc>',
    );
    const html = read('privacy.html');
    expect(html).toContain(
      '<link rel="canonical" href="https://bashorburn.federicobagato.it/privacy" />',
    );
    expect(html).toContain(`<title>${itMessages['privacy.meta.title']}</title>`);
    expect(html).toContain(`content="${itMessages['privacy.meta.description']}"`);
  });

  it('pins Node', () => {
    expect(existsSync('.nvmrc')).toBe(true);
    const pkg = JSON.parse(read('package.json')) as { engines?: { node?: string } };
    expect(pkg.engines?.node).toBeTruthy();
  });

  it('uses no external font hosts', () => {
    for (const file of ['index.html', 'src/index.css', 'src/styles/fonts.css']) {
      expect(read(file)).not.toMatch(/fonts\.googleapis|fonts\.gstatic/);
    }
  });
});
