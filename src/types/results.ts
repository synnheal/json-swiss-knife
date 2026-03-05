export interface ValidationError {
  line: number;
  column: number;
  message: string;
  offset: number;
  length: number;
}

export interface FormatResult {
  text: string;
}

export interface ValidateResult {
  valid: boolean;
  errors: ValidationError[];
}

export interface DiffResult {
  delta: unknown;
  summary: {
    added: number;
    removed: number;
    modified: number;
  };
}

export interface SchemaResult {
  valid: boolean;
  errors: SchemaError[];
}

export interface SchemaError {
  path: string;
  message: string;
  keyword: string;
  params: Record<string, unknown>;
}

export interface ConvertResult {
  text: string;
  rowCount: number;
}

export interface FixResult {
  text: string;
  changes: FixChange[];
  confidence: number;
}

export interface FixChange {
  type: string;
  description: string;
  line?: number;
}
