'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

export function CopyCommand({ command }: { command: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard.writeText(command);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="mt-8 flex items-center gap-3 rounded-lg border border-fd-border bg-fd-card px-4 py-2.5 font-mono text-sm transition-colors hover:bg-fd-accent"
    >
      <span className="text-fd-muted-foreground">$</span>
      {command}
      {copied ? <Check className="size-4 text-green-500" /> : <Copy className="size-4 text-fd-muted-foreground" />}
    </button>
  );
}
