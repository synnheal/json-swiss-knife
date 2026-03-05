'use client';

import { useTranslations } from 'next-intl';
import { useWorkspaceStore } from '@/stores/workspace-store';
import { useResultsStore } from '@/stores/results-store';
import { useWorkerTask } from '@/hooks/useWorkerTask';
import { JsonEditor } from '@/components/editor/json-editor';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { SchemaResult } from '@/types/results';
import { ShieldCheck, CheckCircle, XCircle, Loader2 } from 'lucide-react';

const EXAMPLE_SCHEMA = `{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "name": { "type": "string" },
    "age": { "type": "integer", "minimum": 0 }
  },
  "required": ["name"]
}`;

export function SchemaPanel() {
  const t = useTranslations();
  const {
    editorContent,
    schemaContent,
    setEditorContent,
    setSchemaContent,
  } = useWorkspaceStore();
  const { schemaResult, setSchemaResult, isProcessing, error } =
    useResultsStore();
  const { run } = useWorkerTask();

  const effectiveSchema = schemaContent || EXAMPLE_SCHEMA;

  const handleValidate = async () => {
    if (!editorContent.trim() || !effectiveSchema.trim()) return;
    try {
      const result = await run<SchemaResult>('schema', {
        text: editorContent,
        schema: effectiveSchema,
      });
      setSchemaResult(result);
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
          onClick={handleValidate}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <ShieldCheck className="h-3.5 w-3.5" />
          )}
          {t('tools.schema')}
        </Button>
        {schemaResult && (
          <Badge
            variant="outline"
            className={`h-5 text-[10px] ${
              schemaResult.valid
                ? 'border-green-500/50 bg-green-500/10 text-green-600 dark:text-green-400'
                : 'border-red-500/50 bg-red-500/10 text-red-600 dark:text-red-400'
            }`}
          >
            {schemaResult.valid
              ? t('results.valid')
              : `${schemaResult.errors.length} ${t('results.errors')}`}
          </Badge>
        )}
      </div>
      <div className="flex min-h-0 flex-1">
        <div className="flex flex-1 flex-col">
          <div className="flex h-6 items-center border-b bg-muted/20 px-2 text-[10px] font-medium text-muted-foreground">
            JSON Data
          </div>
          <div className="flex-1">
            <JsonEditor value={editorContent} onChange={setEditorContent} />
          </div>
        </div>
        <div className="flex flex-1 flex-col border-l">
          <div className="flex h-6 items-center border-b bg-muted/20 px-2 text-[10px] font-medium text-muted-foreground">
            JSON Schema
          </div>
          <div className="flex-1">
            <JsonEditor
              value={effectiveSchema}
              onChange={setSchemaContent}
            />
          </div>
        </div>
        <div className="w-64 shrink-0 border-l lg:w-72">
          <SchemaResults result={schemaResult} error={error} />
        </div>
      </div>
    </div>
  );
}

function SchemaResults({
  result,
  error,
}: {
  result: SchemaResult | null;
  error: string | null;
}) {
  const t = useTranslations('results');

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
        Validate JSON against schema
      </div>
    );
  }

  if (result.valid) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2">
        <CheckCircle className="h-8 w-8 text-green-500" />
        <span className="text-sm font-medium text-green-600 dark:text-green-400">
          {t('valid')}
        </span>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="space-y-1 p-2">
        <div className="mb-2 flex items-center gap-1.5">
          <XCircle className="h-4 w-4 text-destructive" />
          <span className="text-xs font-medium text-destructive">
            {t('invalid')}
          </span>
        </div>
        {result.errors.map((err, i) => (
          <div
            key={i}
            className="rounded border border-destructive/30 bg-destructive/5 p-2"
          >
            <div className="mb-0.5 font-mono text-[10px] text-muted-foreground">
              {err.path}
            </div>
            <div className="text-xs">{err.message}</div>
            <div className="mt-0.5 text-[10px] text-muted-foreground">
              {err.keyword}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
