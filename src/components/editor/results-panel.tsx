'use client';

import { useTranslations } from 'next-intl';
import { useWorkspaceStore } from '@/stores/workspace-store';
import { useResultsStore } from '@/stores/results-store';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

export function ResultsPanel() {
  const t = useTranslations('results');
  const { activeTool, editorContent } = useWorkspaceStore();
  const { validateResult, error, isProcessing } = useResultsStore();

  if (isProcessing) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        <div className="animate-pulse">Processing...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 p-4">
        <AlertTriangle className="h-8 w-8 text-destructive" />
        <p className="text-center text-sm text-destructive">{error}</p>
      </div>
    );
  }

  if (activeTool === 'validate' && validateResult) {
    return (
      <ScrollArea className="h-full">
        <div className="p-4">
          <div className="mb-3 flex items-center gap-2">
            {validateResult.valid ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium text-green-600 dark:text-green-400">
                  {t('valid')}
                </span>
              </>
            ) : (
              <>
                <XCircle className="h-5 w-5 text-destructive" />
                <span className="text-sm font-medium text-destructive">
                  {t('invalid')}
                </span>
                <Badge variant="destructive" className="text-[10px]">
                  {validateResult.errors.length} {t('errors')}
                </Badge>
              </>
            )}
          </div>
          {validateResult.errors.map((err, i) => (
            <div
              key={i}
              className="mb-2 rounded-md border bg-destructive/5 p-3 text-sm"
            >
              <div className="mb-1 text-xs text-muted-foreground">
                {t('line')} {err.line}, {t('column')} {err.column}
              </div>
              <div className="font-mono text-xs">{err.message}</div>
            </div>
          ))}
        </div>
      </ScrollArea>
    );
  }

  if (!editorContent.trim()) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        {t('empty')}
      </div>
    );
  }

  return (
    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
      {t('empty')}
    </div>
  );
}
