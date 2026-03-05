import { create } from 'zustand';
import type {
  FormatResult,
  ValidateResult,
  DiffResult,
  SchemaResult,
  ConvertResult,
  FixResult,
} from '@/types/results';

interface ResultsState {
  formatResult: FormatResult | null;
  validateResult: ValidateResult | null;
  diffResult: DiffResult | null;
  schemaResult: SchemaResult | null;
  convertResult: ConvertResult | null;
  fixResult: FixResult | null;
  isProcessing: boolean;
  progress: number;
  error: string | null;

  setFormatResult: (result: FormatResult | null) => void;
  setValidateResult: (result: ValidateResult | null) => void;
  setDiffResult: (result: DiffResult | null) => void;
  setSchemaResult: (result: SchemaResult | null) => void;
  setConvertResult: (result: ConvertResult | null) => void;
  setFixResult: (result: FixResult | null) => void;
  setProcessing: (isProcessing: boolean) => void;
  setProgress: (progress: number) => void;
  setError: (error: string | null) => void;
  clearResults: () => void;
}

export const useResultsStore = create<ResultsState>((set) => ({
  formatResult: null,
  validateResult: null,
  diffResult: null,
  schemaResult: null,
  convertResult: null,
  fixResult: null,
  isProcessing: false,
  progress: 0,
  error: null,

  setFormatResult: (result) => set({ formatResult: result, error: null }),
  setValidateResult: (result) => set({ validateResult: result, error: null }),
  setDiffResult: (result) => set({ diffResult: result, error: null }),
  setSchemaResult: (result) => set({ schemaResult: result, error: null }),
  setConvertResult: (result) => set({ convertResult: result, error: null }),
  setFixResult: (result) => set({ fixResult: result, error: null }),
  setProcessing: (isProcessing) => set({ isProcessing }),
  setProgress: (progress) => set({ progress }),
  setError: (error) => set({ error, isProcessing: false }),
  clearResults: () =>
    set({
      formatResult: null,
      validateResult: null,
      diffResult: null,
      schemaResult: null,
      convertResult: null,
      fixResult: null,
      error: null,
      progress: 0,
    }),
}));
