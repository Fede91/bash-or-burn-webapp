import { parseInline } from './inline';

describe('parseInline', () => {
  it('returns plain text untouched', () => {
    expect(parseInline('solo testo')).toEqual([{ kind: 'text', text: 'solo testo' }]);
  });

  it('splits links and bold from the surrounding text', () => {
    expect(parseInline('a [x](https://e.it/p) b **c**, d')).toEqual([
      { kind: 'text', text: 'a ' },
      { kind: 'link', text: 'x', href: 'https://e.it/p' },
      { kind: 'text', text: ' b ' },
      { kind: 'strong', text: 'c' },
      { kind: 'text', text: ', d' },
    ]);
  });

  it('keeps mailto links and leaves unmatched brackets as text', () => {
    expect(parseInline('[m](mailto:a@b.it) [nota]')).toEqual([
      { kind: 'link', text: 'm', href: 'mailto:a@b.it' },
      { kind: 'text', text: ' [nota]' },
    ]);
  });
});
