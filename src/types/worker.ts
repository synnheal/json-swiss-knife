export type ToolName = 'format' | 'validate' | 'diff' | 'schema' | 'convert' | 'json-to-csv' | 'csv-to-json' | 'fix';

export interface WorkerRequest {
  id: string;
  task: ToolName;
  payload: unknown;
}

export interface WorkerResponse {
  id: string;
  task: ToolName;
  status: 'success' | 'error' | 'progress';
  result?: unknown;
  error?: string;
  progress?: number;
}

export interface FormatPayload {
  text: string;
  indent: number;
  sortKeys: boolean;
  minify: boolean;
}

export interface ValidatePayload {
  text: string;
}

export interface DiffPayload {
  textA: string;
  textB: string;
}

export interface SchemaPayload {
  text: string;
  schema: string;
}

export interface JsonToCsvPayload {
  text: string;
  delimiter: string;
  flatten: boolean;
}

export interface CsvToJsonPayload {
  text: string;
  header: boolean;
  inferTypes: boolean;
  delimiter: string;
}

export interface FixPayload {
  text: string;
}
