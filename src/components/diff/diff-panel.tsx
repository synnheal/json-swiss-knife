'use client';

import { useTranslations } from 'next-intl';
import { useWorkspaceStore } from '@/stores/workspace-store';
import { useResultsStore } from '@/stores/results-store';
import { useWorkerTask } from '@/hooks/useWorkerTask';
import { JsonEditor } from '@/components/editor/json-editor';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { DiffResult } from '@/types/results';
import { GitCompare, Equal, Loader2 } from 'lucide-react';

export function DiffPanel() {
  const t = useTranslations();
  const { editorContent, editorContentB, setEditorContent, setEditorContentB } =
    useWorkspaceStore();
  const { diffResult, setDiffResult, isProcessing, error } = useResultsStore();
  const { run } = useWorkerTask();

  const handleCompare = async () => {
    if (!editorContent.trim() || !editorContentB.trim()) return;
    try {
      const result = await run<DiffResult>('diff', {
        textA: editorContent,
        textB: editorContentB,
      });
      setDiffResult(result);
    } catch {
      // Error set by hook
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex h-8 items-center gap-2 border-b bg-muted/30 px-2">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1 px-2 text-xs"
          onClick={handleCompare}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <GitCompare className="h-3.5 w-3.5" />
          )}
          {t('tools.diff')}
        </Button>
        {diffResult && (
          <div className="flex gap-1">
            <Badge
              variant="outline"
              className="h-5 border-green-500/50 bg-green-500/10 text-[10px] text-green-600 dark:text-green-400"
            >
              +{diffResult.summary.added}
            </Badge>
            <Badge
              variant="outline"
              className="h-5 border-red-500/50 bg-red-500/10 text-[10px] text-red-600 dark:text-red-400"
            >
              -{diffResult.summary.removed}
            </Badge>
            <Badge
              variant="outline"
              className="h-5 border-amber-500/50 bg-amber-500/10 text-[10px] text-amber-600 dark:text-amber-400"
            >
              ~{diffResult.summary.modified}
            </Badge>
          </div>
        )}
      </div>
      <div className="flex min-h-0 flex-1">
        <div className="flex flex-1 flex-col">
          <div className="flex h-6 items-center border-b bg-muted/20 px-2 text-[10px] font-medium text-muted-foreground">
            JSON A
          </div>
          <div className="flex-1">
            <JsonEditor value={editorContent} onChange={setEditorContent} />
          </div>
        </div>
        <div className="flex flex-1 flex-col border-l">
          <div className="flex h-6 items-center border-b bg-muted/20 px-2 text-[10px] font-medium text-muted-foreground">
            JSON B
          </div>
          <div className="flex-1">
            <JsonEditor value={editorContentB} onChange={setEditorContentB} />
          </div>
        </div>
        <div className="w-72 shrink-0 border-l lg:w-80">
          <DiffResults result={diffResult} error={error} />
        </div>
      </div>
    </div>
  );
}

function DiffResults({
  result,
  error,
}: {
  result: DiffResult | null;
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
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        Compare two JSONs
      </div>
    );
  }

  if (!result.delta) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
        <Equal className="h-8 w-8 text-green-500" />
        <span>Objects are identical</span>
      </div>
    );
  }

  const changes = flattenDelta(result.delta);

  return (
    <ScrollArea className="h-full">
      <div className="space-y-1 p-2">
        {changes.map((change, i) => (
          <div
            key={i}
            className={`rounded border p-2 ${
              change.type === 'added'
                ? 'border-green-500/30 bg-green-500/5'
                : change.type === 'removed'
                  ? 'border-red-500/30 bg-red-500/5'
                  : 'border-amber-500/30 bg-amber-500/5'
            }`}
          >
            <div className="mb-0.5 font-mono text-[10px] text-muted-foreground">
              {change.path}
            </div>
            {change.type === 'added' && (
              <div className="font-mono text-xs text-green-600 dark:text-green-400">
                + {truncate(JSON.stringify(change.value))}
              </div>
            )}
            {change.type === 'removed' && (
              <div className="font-mono text-xs text-red-600 dark:text-red-400">
                - {truncate(JSON.stringify(change.value))}
              </div>
            )}
            {change.type === 'modified' && (
              <>
                <div className="font-mono text-xs text-red-600 dark:text-red-400">
                  - {truncate(JSON.stringify(change.oldValue))}
                </div>
                <div className="font-mono text-xs text-green-600 dark:text-green-400">
                  + {truncate(JSON.stringify(change.newValue))}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}

interface DiffChange {
  type: 'added' | 'removed' | 'modified';
  path: string;
  value?: unknown;
  oldValue?: unknown;
  newValue?: unknown;
}

function flattenDelta(delta: unknown, path = ''): DiffChange[] {
  const changes: DiffChange[] = [];
  if (!delta || typeof delta !== 'object') return changes;

  if (Array.isArray(delta)) {
    if (delta.length === 1)
      changes.push({ type: 'added', path, value: delta[0] });
    else if (delta.length === 2)
      changes.push({
        type: 'modified',
        path,
        oldValue: delta[0],
        newValue: delta[1],
      });
    else if (delta.length === 3 && delta[2] === 0)
      changes.push({ type: 'removed', path, value: delta[0] });
    return changes;
  }

  const obj = delta as Record<string, unknown>;
  for (const [key, value] of Object.entries(obj)) {
    if (key === '_t') continue;
    const childPath = key.startsWith('_')
      ? `${path}[${key.slice(1)}]`
      : path
        ? `${path}.${key}`
        : key;
    changes.push(...flattenDelta(value, childPath));
  }

  return changes;
}

function truncate(str: string, max = 80): string {
  return str.length > max ? str.slice(0, max) + '...' : str;
}
