import type { ValidatePayload } from '../../../types/worker';
import type { ValidateResult, ValidationError } from '../../../types/results';

export function validateJson(payload: ValidatePayload): ValidateResult {
  const { text } = payload;

  if (!text.trim()) {
    return { valid: true, errors: [] };
  }

  try {
    JSON.parse(text);
    return { valid: true, errors: [] };
  } catch (e) {
    const error = e as SyntaxError;
    const errorInfo = parseJsonError(error.message, text);
    return {
      valid: false,
      errors: [errorInfo],
    };
  }
}

function parseJsonError(message: string, text: string): ValidationError {
  // Try to extract position from error message
  // Common format: "... at position 42" or "... at line 3 column 5"
  const posMatch = message.match(/position\s+(\d+)/i);

  if (posMatch) {
    const offset = parseInt(posMatch[1], 10);
    const { line, column } = offsetToLineCol(text, offset);
    return { line, column, message, offset, length: 1 };
  }

  const lineColMatch = message.match(/line\s+(\d+)\s+column\s+(\d+)/i);
  if (lineColMatch) {
    const line = parseInt(lineColMatch[1], 10);
    const column = parseInt(lineColMatch[2], 10);
    return { line, column, message, offset: 0, length: 1 };
  }

  return { line: 1, column: 1, message, offset: 0, length: 1 };
}

function offsetToLineCol(
  text: string,
  offset: number,
): { line: number; column: number } {
  let line = 1;
  let column = 1;
  for (let i = 0; i < offset && i < text.length; i++) {
    if (text[i] === '\n') {
      line++;
      column = 1;
    } else {
      column++;
    }
  }
  return { line, column };
}
