export type InlineSegment =
  | { kind: 'text'; text: string }
  | { kind: 'strong'; text: string }
  | { kind: 'link'; text: string; href: string };

const TOKEN = /\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*]+)\*\*/g;

// Parses the two inline forms used in long-form copy: [label](url) and **bold**.
export function parseInline(source: string): InlineSegment[] {
  const out: InlineSegment[] = [];
  let last = 0;
  for (const m of source.matchAll(TOKEN)) {
    if (m.index > last) out.push({ kind: 'text', text: source.slice(last, m.index) });
    if (m[1] !== undefined && m[2] !== undefined) {
      out.push({ kind: 'link', text: m[1], href: m[2] });
    } else if (m[3] !== undefined) {
      out.push({ kind: 'strong', text: m[3] });
    }
    last = m.index + m[0].length;
  }
  if (last < source.length) out.push({ kind: 'text', text: source.slice(last) });
  return out;
}
