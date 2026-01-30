/**
 * Converts markdown-style text with citations into HTML
 * Handles headings (#, ##, ###), bold (**text**), lists (- or *), and citations ([1], [2], etc)
 */
export function renderMarkdownWithLinks(text) {
  if (!text || typeof text !== 'string') {
    return ''
  }

  let html = text

  // Escape existing HTML
  html = html.replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')

  // Strip markdown citation links from headings: [1 (7:00)](url) or [1 (2:18)](url)
  // This matches headings followed by one or more citation links
  html = html.replace(/^(#+\s+[^\n]+?)\s*\[\d+\s*\([^\)]+\)\]\([^\)]+\)(?:\s*\[\d+\s*\([^\)]+\)\]\([^\)]+\))*/gm, '$1')
  
  // Convert markdown headings to HTML
  // H1: # Title
  html = html.replace(/^# ([^\n]+)/gm, '<h1 class="text-2xl font-bold mt-6 mb-3">$1</h1>')
  
  // H2: ## Title
  html = html.replace(/^## ([^\n]+)/gm, '<h2 class="text-xl font-bold mt-5 mb-3">$1</h2>')
  
  // H3: ### Title
  html = html.replace(/^### ([^\n]+)/gm, '<h3 class="text-lg font-bold mt-4 mb-2">$1</h3>')

  // Convert bold text: **text** or __text__
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold">$1</strong>')
  html = html.replace(/__([^_]+)__/g, '<strong class="font-bold">$1</strong>')

  // Convert italic text: *text* or _text_ (but not **text**)
  html = html.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em class="italic">$1</em>')
  html = html.replace(/(?<!_)_([^_]+)_(?!_)/g, '<em class="italic">$1</em>')

  // Convert unordered lists - handle both - and * markers
  html = html.replace(/^[*-] ([^\n]+)/gm, '<li>$1</li>')
  
  // Wrap consecutive list items in <ul>
  html = html.replace(/(<li>.*<\/li>)/s, function(match) {
    const items = match.match(/<li>.*?<\/li>/g)
    if (items) {
      return '<ul class="list-disc list-inside space-y-1">' + items.join('') + '</ul>'
    }
    return match
  })

  // Convert citation links with timestamps: [number (timestamp)](url) to styled citation badges
  // Format: [2 (0:00)](url) -> <span class="citation-badge">2 (0:00)</span>
  html = html.replace(/\[(\d+)\s+\(([^\)]+)\)\]\([^\)]+\)/g, '<span class="inline-block ml-1 px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-xs text-blue-700 dark:text-blue-300 whitespace-nowrap">[$1 · $2]</span>')

  // Convert links: [text](url)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 dark:text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">$1</a>')

  // Convert remaining citations [1], [2] etc to superscript (keep them visible but styled)
  html = html.replace(/\[(\d+)\]/g, '<sup class="text-blue-600 dark:text-blue-400 font-semibold cursor-help">[$1]</sup>')

  // Convert line breaks
  html = html.replace(/\n\n+/g, '</p><p class="mb-3">')
  
  // Wrap paragraphs
  const paragraphs = html.split('</p><p class="mb-3">')
  html = paragraphs.map(p => {
    if (!p.includes('<h') && !p.includes('<ul') && !p.trim() === '') {
      return `<p class="mb-3">${p}</p>`
    }
    return p
  }).join('')

  return html
}

/**
 * Extracts plain text from markdown
 */
export function plainTextFromMarkdown(text) {
  if (!text || typeof text !== 'string') {
    return ''
  }

  let plain = text
  
  // Remove markdown syntax
  plain = plain.replace(/^#+\s*/gm, '') // Headings
  plain = plain.replace(/\*\*([^*]+)\*\*/g, '$1') // Bold
  plain = plain.replace(/__([^_]+)__/g, '$1') // Bold alt
  plain = plain.replace(/\*([^*]+)\*/g, '$1') // Italic
  plain = plain.replace(/_([^_]+)_/g, '$1') // Italic alt
  plain = plain.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Links
  plain = plain.replace(/^[*-]\s*/gm, '') // List markers
  
  return plain.trim()
}
