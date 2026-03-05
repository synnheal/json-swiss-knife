'use client';

import { useCallback, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { ToolName, WorkerResponse } from '@/types/worker';
import { useResultsStore } from '@/stores/results-store';

let sharedWorker: Worker | null = null;
const pendingCallbacks = new Map<
  string,
  { resolve: (result: unknown) => void; reject: (error: Error) => void }
>();

function getWorker(): Worker {
  if (!sharedWorker) {
    sharedWorker = new Worker(
      new URL('../lib/worker/index.ts', import.meta.url),
    );
    sharedWorker.onmessage = (event: MessageEvent<WorkerResponse>) => {
      const { id, status, result, error, progress } = event.data;
      const callback = pendingCallbacks.get(id);

      if (status === 'progress') {
        useResultsStore.getState().setProgress(progress ?? 0);
        return;
      }

      if (!callback) return;
      pendingCallbacks.delete(id);

      if (status === 'success') {
        callback.resolve(result);
      } else {
        callback.reject(new Error(error ?? 'Worker error'));
      }
    };
  }
  return sharedWorker;
}

export function useWorkerTask() {
  const activeIdRef = useRef<string | null>(null);
  const { setProcessing, setError, setProgress } = useResultsStore();

  useEffect(() => {
    return () => {
      // Cancel pending task on unmount
      if (activeIdRef.current) {
        pendingCallbacks.delete(activeIdRef.current);
      }
    };
  }, []);

  const run = useCallback(
    async <T>(task: ToolName, payload: unknown): Promise<T> => {
      // Cancel previous pending task
      if (activeIdRef.current) {
        pendingCallbacks.delete(activeIdRef.current);
      }

      const id = uuidv4();
      activeIdRef.current = id;
      setProcessing(true);
      setProgress(0);
      setError(null);

      try {
        const worker = getWorker();
        const result = await new Promise<T>((resolve, reject) => {
          pendingCallbacks.set(id, {
            resolve: resolve as (result: unknown) => void,
            reject,
          });
          worker.postMessage({ id, task, payload });
        });

        if (activeIdRef.current === id) {
          setProcessing(false);
        }
        return result;
      } catch (e) {
        if (activeIdRef.current === id) {
          setError(e instanceof Error ? e.message : String(e));
        }
        throw e;
      }
    },
    [setProcessing, setProgress, setError],
  );

  return { run };
}
