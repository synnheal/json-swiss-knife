import Papa from 'papaparse';
import type { CsvToJsonPayload } from '../../../types/worker';
import type { ConvertResult } from '../../../types/results';

export function csvToJson(payload: CsvToJsonPayload): ConvertResult {
  const { text, header, inferTypes, delimiter } = payload;

  const result = Papa.parse(text, {
    header,
    delimiter: delimiter || undefined,
    dynamicTyping: inferTypes,
    skipEmptyLines: true,
  });

  if (result.errors.length > 0) {
    throw new Error(`CSV parse error: ${result.errors[0].message}`);
  }

  const json = JSON.stringify(result.data, null, 2);
  return { text: json, rowCount: result.data.length };
}
