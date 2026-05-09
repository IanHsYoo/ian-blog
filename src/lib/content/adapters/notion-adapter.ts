import { Client } from '@notionhq/client'
import { NotionToMarkdown } from 'notion-to-md'
import type {
  PageObjectResponse,
  QueryDatabaseResponse,
} from '@notionhq/client/build/src/api-endpoints'
import type { ContentSourceAdapter, RawPost } from '@/lib/content/types'

let _client: Client | null = null

function getClient(): Client {
  if (!_client) {
    _client = new Client({ auth: process.env.NOTION_API_KEY })
  }
  return _client
}

function getDatabaseId(): string {
  const id = process.env.NOTION_DATABASE_ID
  if (!id) {
    throw new Error(
      'Missing NOTION_DATABASE_ID. See aidlc-docs/construction/blog-v2/notion-setup-guide.md'
    )
  }
  return id
}

const isConfigured =
  Boolean(process.env.NOTION_API_KEY) &&
  Boolean(process.env.NOTION_DATABASE_ID)

function getTextProperty(page: PageObjectResponse, name: string): string {
  const prop = page.properties[name]
  if (prop?.type === 'title') {
    return prop.title.map((t) => t.plain_text).join('')
  }
  if (prop?.type === 'rich_text') {
    return prop.rich_text.map((t) => t.plain_text).join('')
  }
  return ''
}

function getSelectProperty(page: PageObjectResponse, name: string): string | null {
  const prop = page.properties[name]
  if (prop?.type === 'select') {
    return prop.select?.name ?? null
  }
  return null
}

function getMultiSelectProperty(
  page: PageObjectResponse,
  name: string
): string[] {
  const prop = page.properties[name]
  if (prop?.type === 'multi_select') {
    return prop.multi_select.map((s) => s.name)
  }
  return []
}

function getDateProperty(page: PageObjectResponse, name: string): string {
  const prop = page.properties[name]
  if (prop?.type === 'date') {
    return prop.date?.start ?? ''
  }
  return ''
}

function getUrlProperty(page: PageObjectResponse, name: string): string | null {
  const prop = page.properties[name]
  if (prop?.type === 'url') {
    return prop.url ?? null
  }
  return null
}

function isFullPage(
  result: QueryDatabaseResponse['results'][number]
): result is PageObjectResponse {
  return result.object === 'page' && 'properties' in result
}

function mapPageToRawPost(page: PageObjectResponse): RawPost {
  return {
    id: page.id,
    title: getTextProperty(page, 'Title'),
    slug: getTextProperty(page, 'Slug'),
    description: getTextProperty(page, 'Description'),
    category: getSelectProperty(page, 'Category'),
    tags: getMultiSelectProperty(page, 'Tags'),
    publishedDate: getDateProperty(page, 'PublishedDate'),
    coverImage: getUrlProperty(page, 'CoverImage'),
    source: 'notion',
  }
}

async function fetchAllPublishedPages(): Promise<PageObjectResponse[]> {
  const notion = getClient()
  const databaseId = getDatabaseId()

  const response = await notion.databases.query({
    database_id: databaseId,
    filter: {
      property: 'Status',
      select: { equals: 'Published' },
    },
    sorts: [{ property: 'PublishedDate', direction: 'descending' }],
  })

  return response.results.filter(isFullPage)
}

async function getPostContent(pageId: string): Promise<string> {
  const n2m = new NotionToMarkdown({ notionClient: getClient() })
  const mdBlocks = await n2m.pageToMarkdown(pageId)
  return n2m.toMarkdownString(mdBlocks).parent
}

export const notionAdapter: ContentSourceAdapter = {
  source: 'notion',
  enabled: isConfigured,

  async listPosts(): Promise<RawPost[]> {
    if (!isConfigured) return []
    const pages = await fetchAllPublishedPages()
    return pages.map(mapPageToRawPost)
  },

  async getPostBySlug(slug: string): Promise<RawPost | null> {
    if (!isConfigured) return null

    const notion = getClient()
    const databaseId = getDatabaseId()

    const response = await notion.databases.query({
      database_id: databaseId,
      filter: {
        and: [
          { property: 'Slug', rich_text: { equals: slug } },
          { property: 'Status', select: { equals: 'Published' } },
        ],
      },
    })

    const page = response.results.filter(isFullPage)[0]
    if (!page) return null

    const content = await getPostContent(page.id)
    return { ...mapPageToRawPost(page), content }
  },
}
