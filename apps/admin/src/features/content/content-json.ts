export function parseContentObject(value: string): Record<string, unknown> {
  const content: unknown = JSON.parse(value);
  if (!content || Array.isArray(content) || typeof content !== 'object') throw new Error('Nội dung phải là một JSON object.');
  return content as Record<string, unknown>;
}
