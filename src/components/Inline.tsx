import { parseInline } from '../lib/inline';

// Renders copy with inline links/bold; line breaks come from CSS (white-space: pre-line).
export default function Inline({ text }: { text: string }) {
  return parseInline(text).map((seg, i) => {
    if (seg.kind === 'link') {
      return (
        <a key={i} href={seg.href} rel="noopener">
          {seg.text}
        </a>
      );
    }
    const Tag = seg.kind === 'strong' ? 'strong' : 'span';
    return <Tag key={i}>{seg.text}</Tag>;
  });
}
