'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useWorkspaceStore } from '@/stores/workspace-store';
import { useResultsStore } from '@/stores/results-store';
import { useSettingsStore } from '@/stores/settings-store';
import { useWorkerTask } from '@/hooks/useWorkerTask';
import { JsonEditor } from '@/components/editor/json-editor';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { downloadFile } from '@/lib/utils/download';
import type { ConvertResult } from '@/types/results';
import {
  ArrowLeftRight,
  ArrowRight,
  Download,
  Loader2,
  Copy,
} from 'lucide-react';

type Direction = 'json-to-csv' | 'csv-to-json';

export function ConvertPanel() {
  const t = useTranslations();
  const { editorContent, setEditorContent } = useWorkspaceStore();
  const { convertResult, setConvertResult, isProcessing, error } =
    useResultsStore();
  const { csvDelimiter, csvHeader, csvInferTypes, flattenKeys } =
    useSettingsStore();
  const { run } = useWorkerTask();

  const [direction, setDirection] = useState<Direction>('json-to-csv');

  const handleConvert = async () => {
    if (!editorContent.trim()) return;
    try {
      const result = await run<ConvertResult>(direction, {
        text: editorContent,
        delimiter: csvDelimiter,
        header: csvHeader,
        inferTypes: csvInferTypes,
        flatten: flattenKeys,
      });
      setConvertResult(result);
    } catch {
      // Error set by hook
    }
  };

  const handleCopyResult = async () => {
    if (convertResult?.text) {
      await navigator.clipboard.writeText(convertResult.text);
    }
  };

  const handleDownload = () => {
    if (!convertResult?.text) return;
    if (direction === 'json-to-csv') {
      downloadFile(convertResult.text, 'output.csv', 'text/csv');
    } else {
      downloadFile(convertResult.text, 'output.json', 'application/json');
    }
  };

  const toggleDirection = () => {
    setDirection((d) =>
      d === 'json-to-csv' ? 'csv-to-json' : 'json-to-csv',
    );
    setConvertResult(null);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex h-8 items-center gap-2 border-b bg-muted/30 px-2">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1 px-2 text-xs"
          onClick={toggleDirection}
        >
          <ArrowLeftRight className="h-3.5 w-3.5" />
          {direction === 'json-to-csv' ? 'JSON → CSV' : 'CSV → JSON'}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1 px-2 text-xs"
          onClick={handleConvert}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <ArrowRight className="h-3.5 w-3.5" />
          )}
          {t('tools.convert')}
        </Button>
        {convertResult && (
          <Badge variant="secondary" className="h-5 text-[10px]">
            {convertResult.rowCount} rows
          </Badge>
        )}
      </div>
      <div className="flex min-h-0 flex-1">
        <div className="flex flex-1 flex-col">
          <div className="flex h-6 items-center border-b bg-muted/20 px-2 text-[10px] font-medium text-muted-foreground">
            {direction === 'json-to-csv' ? 'JSON Input' : 'CSV Input'}
          </div>
          <div className="flex-1">
            <JsonEditor
              value={editorContent}
              onChange={setEditorContent}
              language={direction === 'csv-to-json' ? 'plaintext' : 'json'}
            />
          </div>
        </div>
        <div className="flex w-80 shrink-0 flex-col border-l lg:w-96">
          <ConvertSettings direction={direction} />
          <div className="flex h-6 items-center justify-between border-b bg-muted/20 px-2">
            <span className="text-[10px] font-medium text-muted-foreground">
              {direction === 'json-to-csv' ? 'CSV Output' : 'JSON Output'}
            </span>
            {convertResult && (
              <div className="flex gap-0.5">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5"
                  onClick={handleCopyResult}
                >
                  <Copy className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5"
                  onClick={handleDownload}
                >
                  <Download className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
          <ScrollArea className="flex-1">
            {error ? (
              <div className="p-3 text-sm text-destructive">{error}</div>
            ) : convertResult ? (
              <pre className="whitespace-pre-wrap p-3 font-mono text-xs">
                {convertResult.text}
              </pre>
            ) : (
              <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
                Convert to see output
              </div>
            )}
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}

function ConvertSettings({ direction }: { direction: Direction }) {
  const {
    csvDelimiter,
    setCsvDelimiter,
    csvHeader,
    setCsvHeader,
    csvInferTypes,
    setCsvInferTypes,
    flattenKeys,
    setFlattenKeys,
  } = useSettingsStore();

  return (
    <div className="space-y-2 border-b p-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground">Delimiter</span>
        <div className="flex gap-0.5">
          {([',', ';', '\t'] as const).map((d) => (
            <Button
              key={d}
              variant={csvDelimiter === d ? 'secondary' : 'ghost'}
              size="sm"
              className="h-5 px-1.5 text-[10px]"
              onClick={() => setCsvDelimiter(d)}
            >
              {d === '\t' ? 'Tab' : d}
            </Button>
          ))}
        </div>
      </div>
      {direction === 'csv-to-json' && (
        <>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground">
              Header row
            </span>
            <Switch
              checked={csvHeader}
              onCheckedChange={setCsvHeader}
              className="scale-75"
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground">
              Infer types
            </span>
            <Switch
              checked={csvInferTypes}
              onCheckedChange={setCsvInferTypes}
              className="scale-75"
            />
          </div>
        </>
      )}
      {direction === 'json-to-csv' && (
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground">
            Flatten keys
          </span>
          <Switch
            checked={flattenKeys}
            onCheckedChange={setFlattenKeys}
            className="scale-75"
          />
        </div>
      )}
    </div>
  );
}
