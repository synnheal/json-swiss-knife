import Papa from 'papaparse';
import type { JsonToCsvPayload } from '../../../types/worker';
import type { ConvertResult } from '../../../types/results';

export function jsonToCsv(payload: JsonToCsvPayload): ConvertResult {
  const { text, delimiter, flatten } = payload;
  const data = JSON.parse(text);

  if (!Array.isArray(data)) {
    throw new Error('Input must be an array of objects');
  }

  if (data.length === 0) {
    throw new Error('Array is empty');
  }

  const rows = flatten ? data.map((obj) => flattenObject(obj)) : data;
  const csv = Papa.unparse(rows, { delimiter });

  return { text: csv, rowCount: rows.length };
}

function flattenObject(
  obj: Record<string, unknown>,
  prefix = '',
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(
        result,
        flattenObject(value as Record<string, unknown>, newKey),
      );
    } else {
      result[newKey] = Array.isArray(value) ? JSON.stringify(value) : value;
    }
  }

  return result;
}
