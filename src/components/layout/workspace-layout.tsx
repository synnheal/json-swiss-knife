'use client';

import { useWorkspaceStore } from '@/stores/workspace-store';
import { Header } from '@/components/layout/header';
import { Toolbar } from '@/components/editor/toolbar';
import { JsonEditor } from '@/components/editor/json-editor';
import { ResultsPanel } from '@/components/editor/results-panel';
import { DiffPanel } from '@/components/diff/diff-panel';
import { SchemaPanel } from '@/components/schema/schema-panel';
import { ConvertPanel } from '@/components/convert/convert-panel';
import { FixPanel } from '@/components/fix/fix-panel';

export function WorkspaceLayout() {
  const { activeTool, editorContent, setEditorContent } = useWorkspaceStore();

  const showDefaultLayout =
    activeTool === 'format' || activeTool === 'validate';

  return (
    <div className="flex h-screen flex-col">
      <Header />
      {showDefaultLayout && <Toolbar />}
      <div className="flex min-h-0 flex-1">
        {showDefaultLayout && (
          <>
            <div className="flex-1 border-r">
              <JsonEditor value={editorContent} onChange={setEditorContent} />
            </div>
            <div className="w-80 shrink-0 lg:w-96">
              <ResultsPanel />
            </div>
          </>
        )}
        {activeTool === 'diff' && <DiffPanel />}
        {activeTool === 'schema' && <SchemaPanel />}
        {activeTool === 'convert' && <ConvertPanel />}
        {activeTool === 'fix' && <FixPanel />}
      </div>
    </div>
  );
}
