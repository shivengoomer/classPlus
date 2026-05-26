// src/utils/extractJson.ts
// AI sometimes wraps JSON in markdown code blocks or adds extra text
// this helper cleans that up and extracts the actual JSON object

export function extractJson(raw: string): any {
  // try direct parse first
  try {
    return JSON.parse(raw);
  } catch {
    // not valid JSON as-is, try to extract it
  }

  // remove markdown code fences like ```json ... ```
  let cleaned = raw.replace(/```json\s*/gi, '').replace(/```\s*/g, '');

  // try parsing the cleaned version
  try {
    return JSON.parse(cleaned);
  } catch {
    // still not valid, try to find JSON object in the string
  }

  // look for the first { and last } to extract the JSON object
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');

  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    const jsonStr = cleaned.substring(firstBrace, lastBrace + 1);
    try {
      return JSON.parse(jsonStr);
    } catch {
      // one more attempt: try to fix common issues
    }
  }

  // if nothing works, throw a clear error
  throw new Error('Could not extract valid JSON from AI response');
}
