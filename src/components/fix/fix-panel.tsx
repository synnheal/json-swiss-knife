'use client';

import { useTranslations } from 'next-intl';
import { useWorkspaceStore } from '@/stores/workspace-store';
import { useResultsStore } from '@/stores/results-store';
import { useWorkerTask } from '@/hooks/useWorkerTask';
import { JsonEditor } from '@/components/editor/json-editor';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { FixResult } from '@/types/results';
import { Wrench, Check, Loader2, Sparkles } from 'lucide-react';

export function FixPanel() {
  const t = useTranslations();
  const { editorContent, setEditorContent } = useWorkspaceStore();
  const { fixResult, setFixResult, isProcessing, error } = useResultsStore();
  const { run } = useWorkerTask();

  const handleFix = async () => {
    if (!editorContent.trim()) return;
    try {
      const result = await run<FixResult>('fix', { text: editorContent });
      setFixResult(result);
    } catch {
      // Error set by hook
    }
  };

  const handleApply = () => {
    if (fixResult?.text) {
      setEditorContent(fixResult.text);
      setFixResult(null);
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex h-8 items-center gap-2 border-b bg-muted/30 px-2">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1 px-2 text-xs"
          onClick={handleFix}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Wrench className="h-3.5 w-3.5" />
          )}
          {t('tools.fix')}
        </Button>
        {fixResult && (
          <>
            <ConfidenceBadge confidence={fixResult.confidence} />
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 px-2 text-xs text-green-600 hover:text-green-700 dark:text-green-400"
              onClick={handleApply}
            >
              <Check className="h-3.5 w-3.5" />
              {t('actions.apply')}
            </Button>
          </>
        )}
      </div>
      <div className="flex min-h-0 flex-1">
        <div className="flex-1">
          <JsonEditor value={editorContent} onChange={setEditorContent} />
        </div>
        <div className="w-80 shrink-0 border-l lg:w-96">
          <FixResults result={fixResult} error={error} />
        </div>
      </div>
    </div>
  );
}

function ConfidenceBadge({ confidence }: { confidence: number }) {
  const pct = Math.round(confidence * 100);
  const color =
    pct >= 80
      ? 'border-green-500/50 bg-green-500/10 text-green-600 dark:text-green-400'
      : pct >= 50
        ? 'border-amber-500/50 bg-amber-500/10 text-amber-600 dark:text-amber-400'
        : 'border-red-500/50 bg-red-500/10 text-red-600 dark:text-red-400';

  return (
    <Badge variant="outline" className={`h-5 text-[10px] ${color}`}>
      {pct}% confidence
    </Badge>
  );
}

function FixResults({
  result,
  error,
}: {
  result: FixResult | null;
  error: string | null;
}) {
  if (error) {
    return (
      <div className="flex h-full items-center justify-center p-4 text-center text-sm text-destructive">
        {error}
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
        <Wrench className="h-8 w-8 opacity-30" />
        <span>Paste broken JSON and click Fix</span>
      </div>
    );
  }

  if (result.changes.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2">
        <Sparkles className="h-8 w-8 text-green-500" />
        <span className="text-sm font-medium text-green-600 dark:text-green-400">
          JSON is already valid!
        </span>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="space-y-2 p-3">
        <div className="text-xs font-medium">
          Changes applied ({result.changes.length})
        </div>
        {result.changes.map((change, i) => (
          <div
            key={i}
            className="rounded border border-amber-500/30 bg-amber-500/5 p-2"
          >
            <div className="flex items-center gap-1.5">
              <Badge variant="outline" className="h-4 text-[9px]">
                {change.type}
              </Badge>
              {change.line && (
                <span className="text-[10px] text-muted-foreground">
                  line {change.line}
                </span>
              )}
            </div>
            <div className="mt-1 text-xs">{change.description}</div>
          </div>
        ))}

        <div className="mt-4">
          <div className="mb-1 text-xs font-medium">Fixed output preview</div>
          <pre className="max-h-60 overflow-auto rounded border bg-muted/30 p-2 font-mono text-[11px]">
            {result.text.slice(0, 2000)}
            {result.text.length > 2000 && '\n...'}
          </pre>
        </div>
      </div>
    </ScrollArea>
  );
}
