import { NotionToMarkdown } from 'notion-to-md'
import { getNotionClient } from './client'

/**
 * Convert a Notion page's block content to a Markdown string.
 */
export async function getPostContent(pageId: string): Promise<string> {
  const n2m = new NotionToMarkdown({ notionClient: getNotionClient() })
  const mdBlocks = await n2m.pageToMarkdown(pageId)
  return n2m.toMarkdownString(mdBlocks).parent
}
