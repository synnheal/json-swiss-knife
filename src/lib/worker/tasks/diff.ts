import * as jsondiffpatch from 'jsondiffpatch';
import type { DiffPayload } from '../../../types/worker';
import type { DiffResult } from '../../../types/results';

const diffpatcher = jsondiffpatch.create({
  arrays: { detectMove: true },
});

export function diffJson(payload: DiffPayload): DiffResult {
  const { textA, textB } = payload;
  const left = JSON.parse(textA);
  const right = JSON.parse(textB);
  const delta = diffpatcher.diff(left, right);

  if (!delta) {
    return { delta: null, summary: { added: 0, removed: 0, modified: 0 } };
  }

  const summary = { added: 0, removed: 0, modified: 0 };
  countChanges(delta, summary);
  return { delta, summary };
}

function countChanges(
  delta: unknown,
  summary: { added: number; removed: number; modified: number },
) {
  if (!delta || typeof delta !== 'object') return;

  if (Array.isArray(delta)) {
    if (delta.length === 1) summary.added++;
    else if (delta.length === 2) summary.modified++;
    else if (delta.length === 3 && delta[2] === 0) summary.removed++;
    return;
  }

  for (const [key, value] of Object.entries(delta as Record<string, unknown>)) {
    if (key === '_t') continue;
    countChanges(value, summary);
  }
}
