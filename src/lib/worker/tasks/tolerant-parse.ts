import { parse as jsoncParse, printParseErrorCode } from 'jsonc-parser';
import type { FixPayload } from '../../../types/worker';
import type { FixResult, FixChange } from '../../../types/results';

export function fixJson(payload: FixPayload): FixResult {
  const { text } = payload;
  const changes: FixChange[] = [];

  // Step 1: Try strict parse
  try {
    JSON.parse(text);
    return {
      text: JSON.stringify(JSON.parse(text), null, 2),
      changes: [],
      confidence: 1,
    };
  } catch {
    // Continue to fix attempts
  }

  let fixed = text;

  // Step 2: Replace single quotes with double quotes
  const singleQuoteFixed = fixSingleQuotes(fixed);
  if (singleQuoteFixed !== fixed) {
    changes.push({
      type: 'quotes',
      description: 'Replaced single quotes with double quotes',
    });
    fixed = singleQuoteFixed;
  }

  // Step 3: Fix unquoted keys
  const unquotedFixed = fixUnquotedKeys(fixed);
  if (unquotedFixed !== fixed) {
    changes.push({
      type: 'keys',
      description: 'Added quotes to unquoted keys',
    });
    fixed = unquotedFixed;
  }

  // Step 4: Try jsonc-parser (handles comments, trailing commas)
  const errors: { error: number; offset: number; length: number }[] = [];
  const parsed = jsoncParse(fixed, errors, { allowTrailingComma: true });

  if (errors.length > 0) {
    for (const err of errors) {
      changes.push({
        type: 'syntax',
        description: `Fixed: ${printParseErrorCode(err.error)}`,
        line: offsetToLine(fixed, err.offset),
      });
    }
  }

  if (parsed !== undefined) {
    const result = JSON.stringify(parsed, null, 2);
    const confidence = Math.max(0.3, 1 - changes.length * 0.15);
    return { text: result, changes, confidence };
  }

  // Step 5: Close unclosed brackets
  const closedFixed = closeUnclosedBrackets(fixed);
  if (closedFixed !== fixed) {
    changes.push({
      type: 'brackets',
      description: 'Closed unclosed brackets/braces',
    });
    fixed = closedFixed;
  }

  // Step 6: Remove trailing commas explicitly
  const trailingFixed = fixed.replace(/,\s*([}\]])/g, '$1');
  if (trailingFixed !== fixed) {
    changes.push({
      type: 'commas',
      description: 'Removed trailing commas',
    });
    fixed = trailingFixed;
  }

  // Final attempt with jsonc-parser
  const errors2: { error: number; offset: number; length: number }[] = [];
  const parsed2 = jsoncParse(fixed, errors2, { allowTrailingComma: true });

  if (parsed2 !== undefined) {
    const result = JSON.stringify(parsed2, null, 2);
    const confidence = Math.max(0.1, 1 - changes.length * 0.2);
    return { text: result, changes, confidence };
  }

  // Last resort: try strict parse on the fixed text
  try {
    const result = JSON.stringify(JSON.parse(fixed), null, 2);
    return {
      text: result,
      changes,
      confidence: Math.max(0.1, 1 - changes.length * 0.2),
    };
  } catch {
    throw new Error('Could not repair JSON. The input may be too malformed.');
  }
}

function fixSingleQuotes(text: string): string {
  // Replace single-quoted strings with double-quoted ones
  // This is a simplified heuristic — handles common cases
  return text.replace(
    /'/g,
    (match, offset: number) => {
      // Check if inside a double-quoted string
      const before = text.slice(0, offset);
      const doubleQuotes = (before.match(/(?<!\\)"/g) || []).length;
      if (doubleQuotes % 2 === 1) return match; // Inside double quotes
      return '"';
    },
  );
}

function fixUnquotedKeys(text: string): string {
  // Add double quotes to unquoted object keys
  return text.replace(
    /([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g,
    '$1"$2":',
  );
}

function closeUnclosedBrackets(text: string): string {
  let braces = 0;
  let brackets = 0;

  for (const ch of text) {
    if (ch === '{') braces++;
    else if (ch === '}') braces--;
    else if (ch === '[') brackets++;
    else if (ch === ']') brackets--;
  }

  let result = text;
  while (brackets > 0) {
    result += ']';
    brackets--;
  }
  while (braces > 0) {
    result += '}';
    braces--;
  }

  return result;
}

function offsetToLine(text: string, offset: number): number {
  let line = 1;
  for (let i = 0; i < offset && i < text.length; i++) {
    if (text[i] === '\n') line++;
  }
  return line;
}
