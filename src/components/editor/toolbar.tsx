'use client';

import { useTranslations } from 'next-intl';
import { useWorkspaceStore } from '@/stores/workspace-store';
import { useResultsStore } from '@/stores/results-store';
import { useSettingsStore } from '@/stores/settings-store';
import { useWorkerTask } from '@/hooks/useWorkerTask';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatBytes } from '@/lib/utils/bytes';
import { downloadFile } from '@/lib/utils/download';
import type { FormatResult, ValidateResult } from '@/types/results';
import {
  Sparkles,
  Minimize2,
  ArrowDownAZ,
  Copy,
  Trash2,
  Download,
  Upload,
  CheckCircle,
  Loader2,
} from 'lucide-react';
import { useRef } from 'react';

export function Toolbar() {
  const t = useTranslations('actions');
  const { activeTool, editorContent, setEditorContent, setFileInfo } =
    useWorkspaceStore();
  const { isProcessing, setFormatResult, setValidateResult } =
    useResultsStore();
  const { indent, sortKeys } = useSettingsStore();
  const { run } = useWorkerTask();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFormat = async (minify: boolean, sort: boolean) => {
    if (!editorContent.trim()) return;
    try {
      const result = await run<FormatResult>('format', {
        text: editorContent,
        indent,
        sortKeys: sort,
        minify,
      });
      setFormatResult(result);
      setEditorContent(result.text);
    } catch {
      // Error already set in store by useWorkerTask
    }
  };

  const handleValidate = async () => {
    if (!editorContent.trim()) return;
    try {
      const result = await run<ValidateResult>('validate', {
        text: editorContent,
      });
      setValidateResult(result);
    } catch {
      // Error already set in store
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(editorContent);
  };

  const handleClear = () => {
    setEditorContent('');
    setFileInfo(null, null);
    useResultsStore.getState().clearResults();
  };

  const handleDownload = () => {
    if (!editorContent.trim()) return;
    downloadFile(editorContent, 'output.json');
  };

  const handleUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      setEditorContent(text);
      setFileInfo(file.name, file.size);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const { fileName, fileSizeBytes } = useWorkspaceStore();

  return (
    <div className="flex h-10 shrink-0 items-center gap-1 border-b bg-muted/30 px-2">
      {(activeTool === 'format' || activeTool === 'validate') && (
        <>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1 px-2 text-xs"
            onClick={() => handleFormat(false, false)}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Sparkles className="h-3.5 w-3.5" />
            )}
            {t('prettify')}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1 px-2 text-xs"
            onClick={() => handleFormat(true, false)}
            disabled={isProcessing}
          >
            <Minimize2 className="h-3.5 w-3.5" />
            {t('minify')}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1 px-2 text-xs"
            onClick={() => handleFormat(false, true)}
            disabled={isProcessing}
          >
            <ArrowDownAZ className="h-3.5 w-3.5" />
            {t('sortKeys')}
          </Button>
        </>
      )}

      {activeTool === 'validate' && (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1 px-2 text-xs"
          onClick={handleValidate}
          disabled={isProcessing}
        >
          <CheckCircle className="h-3.5 w-3.5" />
          Validate
        </Button>
      )}

      <div className="flex-1" />

      {fileName && (
        <Badge variant="secondary" className="h-6 text-[10px]">
          {fileName}
          {fileSizeBytes != null && ` (${formatBytes(fileSizeBytes)})`}
        </Badge>
      )}

      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        onClick={handleCopy}
        title={t('copy')}
      >
        <Copy className="h-3.5 w-3.5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        onClick={handleDownload}
        title={t('download')}
      >
        <Download className="h-3.5 w-3.5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        onClick={handleUpload}
        title={t('upload')}
      >
        <Upload className="h-3.5 w-3.5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        onClick={handleClear}
        title={t('clear')}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json,.txt,.csv"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
