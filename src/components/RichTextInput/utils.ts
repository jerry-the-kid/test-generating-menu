import type { JSONContent } from '@tiptap/react'

/** Convert a plain string to minimal TipTap JSON document */
export function textToJSON(text: string, attrs?: { fontSize?: string; textAlign?: string; color?: string }): JSONContent {
  const marks: JSONContent['marks'] = []
  if (attrs?.fontSize || attrs?.color) {
    marks.push({
      type: 'textStyle',
      attrs: {
        ...(attrs.fontSize && { fontSize: attrs.fontSize }),
        ...(attrs.color && { color: attrs.color }),
      },
    })
  }

  return {
    type: 'doc',
    content: [{
      type: 'paragraph',
      ...(attrs?.textAlign && { attrs: { textAlign: attrs.textAlign } }),
      content: text ? [{ type: 'text', text, ...(marks.length > 0 && { marks }) }] : [],
    }],
  }
}

/** Extract plain text from TipTap JSON (for search, export, dialogs) */
export function jsonToText(json: JSONContent): string {
  if (!json?.content) return ''
  return json.content
    .map(node =>
      node.content?.map(child => child.text ?? '').join('') ?? ''
    )
    .join('\n')
}
