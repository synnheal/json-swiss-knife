import { create } from 'zustand';
import type { ToolName } from '@/types/worker';

interface WorkspaceState {
  activeTool: ToolName;
  editorContent: string;
  editorContentB: string;
  schemaContent: string;
  fileName: string | null;
  fileSizeBytes: number | null;

  setActiveTool: (tool: ToolName) => void;
  setEditorContent: (content: string) => void;
  setEditorContentB: (content: string) => void;
  setSchemaContent: (content: string) => void;
  setFileInfo: (name: string | null, size: number | null) => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  activeTool: 'format',
  editorContent: '',
  editorContentB: '',
  schemaContent: '',
  fileName: null,
  fileSizeBytes: null,

  setActiveTool: (tool) => set({ activeTool: tool }),
  setEditorContent: (content) => set({ editorContent: content }),
  setEditorContentB: (content) => set({ editorContentB: content }),
  setSchemaContent: (content) => set({ schemaContent: content }),
  setFileInfo: (name, size) => set({ fileName: name, fileSizeBytes: size }),
}));
