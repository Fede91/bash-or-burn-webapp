import { codeExamples, type CodeVerdict } from '../data/code-examples';
import { getLang, t, type MessageKey } from '../i18n';

interface CodeExampleProps {
  verdict: CodeVerdict;
}

const COPY: Record<CodeVerdict, { title: MessageKey; caption: MessageKey }> = {
  bash: { title: 'result.code.bash.title', caption: 'result.code.bash.caption' },
  'let-it-write': {
    title: 'result.code.letItWrite.title',
    caption: 'result.code.letItWrite.caption',
  },
};

export default function CodeExample({ verdict }: CodeExampleProps) {
  const lines = codeExamples[verdict][getLang()];
  const { title, caption } = COPY[verdict];

  return (
    <>
      <h3 className="section-title">{t(title)}</h3>
      <p className="section-lead">{t(caption)}</p>
      <pre
        className="code"
        tabIndex={0}
        role="region"
        aria-label={t('result.code.aria', { lines: lines.length })}
      >
        <code>
          {lines.map((line, i) => (
            <span key={i} className={line.startsWith('#') ? 'code-comment' : undefined}>
              {line}
              {'\n'}
            </span>
          ))}
        </code>
      </pre>
    </>
  );
}
