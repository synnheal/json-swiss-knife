import type { FormatPayload } from '../../../types/worker';
import type { FormatResult } from '../../../types/results';

export function formatJson(payload: FormatPayload): FormatResult {
  const { text, indent, sortKeys, minify } = payload;
  const parsed = JSON.parse(text);

  if (minify) {
    return { text: JSON.stringify(parsed) };
  }

  if (sortKeys) {
    return { text: JSON.stringify(sortObject(parsed), null, indent) };
  }

  return { text: JSON.stringify(parsed, null, indent) };
}

function sortObject(obj: unknown): unknown {
  if (Array.isArray(obj)) {
    return obj.map(sortObject);
  }
  if (obj !== null && typeof obj === 'object') {
    const sorted: Record<string, unknown> = {};
    for (const key of Object.keys(obj as Record<string, unknown>).sort()) {
      sorted[key] = sortObject((obj as Record<string, unknown>)[key]);
    }
    return sorted;
  }
  return obj;
}
