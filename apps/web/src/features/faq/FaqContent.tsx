const COMMAND_PREFIX = /^(make |kubectl |docker |curl |cd |git |pnpm )/;

function splitParagraphs(text: string): string[] {
  return text
    .split('\n\n')
    .map((part) => part.trim())
    .filter(Boolean);
}

export function FaqParagraphs({ text }: { text: string }) {
  const paragraphs = splitParagraphs(text);

  return (
    <div className="space-y-3">
      {paragraphs.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
    </div>
  );
}

export function FaqExampleBlock({ text }: { text: string }) {
  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  return (
    <div className="space-y-2">
      {lines.map((line) =>
        COMMAND_PREFIX.test(line) ? (
          <pre
            key={line}
            className="overflow-x-auto whitespace-pre-wrap border border-border bg-elevated px-3 py-2 font-mono text-xs text-primary"
          >
            {line}
          </pre>
        ) : (
          <p key={line} className="text-sm text-secondary">
            {line}
          </p>
        ),
      )}
    </div>
  );
}
