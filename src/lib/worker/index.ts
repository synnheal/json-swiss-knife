/// <reference lib="webworker" />

import type { WorkerRequest, WorkerResponse } from '../../types/worker';
import { formatJson } from './tasks/format';
import { validateJson } from './tasks/validate';
import { diffJson } from './tasks/diff';
import { validateSchema } from './tasks/schema';
import { jsonToCsv } from './tasks/json-to-csv';
import { csvToJson } from './tasks/csv-to-json';
import { fixJson } from './tasks/tolerant-parse';

declare const self: DedicatedWorkerGlobalScope;

self.onmessage = (event: MessageEvent<WorkerRequest>) => {
  const { id, task, payload } = event.data;

  try {
    let result: unknown;

    switch (task) {
      case 'format':
        result = formatJson(payload as Parameters<typeof formatJson>[0]);
        break;
      case 'validate':
        result = validateJson(payload as Parameters<typeof validateJson>[0]);
        break;
      case 'diff':
        result = diffJson(payload as Parameters<typeof diffJson>[0]);
        break;
      case 'schema':
        result = validateSchema(
          payload as Parameters<typeof validateSchema>[0],
        );
        break;
      case 'json-to-csv':
        result = jsonToCsv(payload as Parameters<typeof jsonToCsv>[0]);
        break;
      case 'csv-to-json':
        result = csvToJson(payload as Parameters<typeof csvToJson>[0]);
        break;
      case 'fix':
        result = fixJson(payload as Parameters<typeof fixJson>[0]);
        break;
      default:
        throw new Error(`Unknown task: ${task}`);
    }

    const response: WorkerResponse = { id, task, status: 'success', result };
    self.postMessage(response);
  } catch (e) {
    const response: WorkerResponse = {
      id,
      task,
      status: 'error',
      error: e instanceof Error ? e.message : String(e),
    };
    self.postMessage(response);
  }
};
