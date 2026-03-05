import Ajv2020 from 'ajv/dist/2020';
import addFormats from 'ajv-formats';
import type { SchemaPayload } from '../../../types/worker';
import type { SchemaResult } from '../../../types/results';

let ajvInstance: Ajv2020 | null = null;

function getAjv(): Ajv2020 {
  if (!ajvInstance) {
    ajvInstance = new Ajv2020();
    addFormats(ajvInstance);
  }
  return ajvInstance;
}

export function validateSchema(payload: SchemaPayload): SchemaResult {
  const { text, schema: schemaText } = payload;
  const data = JSON.parse(text);
  const schema = JSON.parse(schemaText);

  const ajv = getAjv();
  ajv.removeSchema();

  const validate = ajv.compile(schema);
  const valid = validate(data);

  if (valid) {
    return { valid: true, errors: [] };
  }

  return {
    valid: false,
    errors: (validate.errors ?? []).map((err) => ({
      path: err.instancePath || '/',
      message: err.message ?? 'Unknown error',
      keyword: err.keyword,
      params: (err.params as Record<string, unknown>) ?? {},
    })),
  };
}
