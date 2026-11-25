export default function App() {
  return (
    <main className="mx-auto max-w-(--max-width) px-(--gutter) py-16">
      <p className="font-mono text-sm text-text-muted">$ bash or burn</p>
      <h1 className="mt-4 font-sans text-5xl font-bold text-text">
        Bash or Burn{' '}
        <span data-verdict="burn" className="text-verdict">
          →
        </span>
      </h1>
      <p className="mt-6 font-sans text-text-body">
        Placeholder shell.{' '}
        <a className="font-mono text-accent underline hover:text-accent-hover" href="#top">
          Read more ↗
        </a>
      </p>
    </main>
  );
}
