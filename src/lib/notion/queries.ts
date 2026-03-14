import type {
  PageObjectResponse,
  QueryDatabaseResponse,
} from '@notionhq/client/build/src/api-endpoints'
import { getNotionClient, getDatabaseId, isNotionConfigured } from './client'
import { getPostContent } from './renderer'
import { estimateReadingTime } from '@/lib/utils'
import type { BlogPost } from '@/types'

// ─── Internal helpers ─────────────────────────────────────────────────────────

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

function mapPageToPost(page: PageObjectResponse): BlogPost {
  return {
    id: page.id,
    title: getTextProperty(page, 'Title'),
    slug: getTextProperty(page, 'Slug'),
    description: getTextProperty(page, 'Description'),
    tags: getMultiSelectProperty(page, 'Tags'),
    publishedDate: getDateProperty(page, 'PublishedDate'),
    coverImage: getUrlProperty(page, 'CoverImage'),
  }
}

function isFullPage(
  result: QueryDatabaseResponse['results'][number]
): result is PageObjectResponse {
  return result.object === 'page' && 'properties' in result
}

// ─── Public query functions ───────────────────────────────────────────────────

/**
 * Get all published posts sorted by PublishedDate descending.
 * Returns empty array when Notion is not configured (dev without .env.local).
 */
export async function getPublishedPosts(): Promise<BlogPost[]> {
  if (!isNotionConfigured) return []

  const notion = getNotionClient()
  const databaseId = getDatabaseId()

  const response = await notion.databases.query({
    database_id: databaseId,
    filter: {
      property: 'Status',
      select: { equals: 'Published' },
    },
    sorts: [{ property: 'PublishedDate', direction: 'descending' }],
  })

  return response.results.filter(isFullPage).map(mapPageToPost)
}

/**
 * Get a single published post by slug, including its Markdown content.
 * Returns null when Notion is not configured.
 */
export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  if (!isNotionConfigured) return null

  const notion = getNotionClient()
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
  const post = mapPageToPost(page)

  return {
    ...post,
    content,
    readingTime: estimateReadingTime(content),
  }
}

/**
 * Get all published post slugs (used for generateStaticParams).
 */
export async function getAllSlugs(): Promise<string[]> {
  const posts = await getPublishedPosts()
  return posts.map((p) => p.slug).filter(Boolean)
}

/**
 * Get all unique tags from published posts.
 */
export async function getAllTags(): Promise<string[]> {
  const posts = await getPublishedPosts()
  const tagSet = new Set<string>()
  posts.forEach((p) => p.tags.forEach((t) => tagSet.add(t)))
  return Array.from(tagSet).sort()
}

/**
 * Get all published posts that include a specific tag.
 */
export async function getPostsByTag(tag: string): Promise<BlogPost[]> {
  if (!isNotionConfigured) return []

  const notion = getNotionClient()
  const databaseId = getDatabaseId()

  const response = await notion.databases.query({
    database_id: databaseId,
    filter: {
      and: [
        { property: 'Tags', multi_select: { contains: tag } },
        { property: 'Status', select: { equals: 'Published' } },
      ],
    },
    sorts: [{ property: 'PublishedDate', direction: 'descending' }],
  })

  return response.results.filter(isFullPage).map(mapPageToPost)
}
