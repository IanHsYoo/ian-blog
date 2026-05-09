import type { ContentSource } from '@/types'

/**
 * Pre-normalized post emitted by a source adapter.
 * Repository normalizes RawPost → BlogPost (date format, readingTime, category fallback).
 */
export interface RawPost {
  id: string
  title: string
  slug: string
  description: string
  category: string | null
  tags: string[]
  publishedDate: string
  coverImage: string | null
  source: ContentSource
  content?: string
}

/**
 * Single source of post data (Notion DB, local markdown, future GitHub, etc.).
 * Adapters return RawPost; the repository merges, deduplicates, and normalizes.
 */
export interface ContentSourceAdapter {
  readonly source: ContentSource
  readonly enabled: boolean

  listPosts(): Promise<RawPost[]>
  getPostBySlug(slug: string): Promise<RawPost | null>
}

export class SlugCollisionError extends Error {
  constructor(slug: string, sources: ContentSource[]) {
    super(
      `Slug collision: "${slug}" exists in multiple sources [${sources.join(', ')}]. ` +
        `Source separation policy requires each slug to live in exactly one source.`
    )
    this.name = 'SlugCollisionError'
  }
}
