/**
 * Highlights search terms in text
 */
export function highlightText(text: string, searchQuery: string): string {
  if (!searchQuery || !text) return text;

  const regex = new RegExp(`(${escapeRegex(searchQuery)})`, 'gi');
  return text.replace(regex, '<mark class="bg-yellow-200 text-yellow-900 px-0.5 rounded">$1</mark>');
}

/**
 * Escapes special regex characters
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Checks if text matches search query
 */
export function matchesSearch(text: string, searchQuery: string): boolean {
  if (!searchQuery || !text) return true;
  return text.toLowerCase().includes(searchQuery.toLowerCase());
}

