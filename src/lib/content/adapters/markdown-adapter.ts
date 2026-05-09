import fs from 'node:fs/promises'
import path from 'node:path'
import matter from 'gray-matter'
import { glob } from 'glob'
import type { ContentSourceAdapter, RawPost } from '@/lib/content/types'

const POSTS_DIR = path.join(process.cwd(), 'content', 'posts')

interface PostFrontmatter {
  title?: string
  slug?: string
  description?: string
  category?: string
  tags?: string[]
  status?: 'draft' | 'published'
  // gray-matter parses YAML dates (`2026-05-08`) into Date objects, not strings.
  publishedDate?: string | Date
  coverImage?: string | null
}

function coerceDate(value: string | Date | undefined): string {
  if (!value) return ''
  if (value instanceof Date) return value.toISOString()
  return value.trim()
}

async function readPostFile(filePath: string): Promise<RawPost | null> {
  const raw = await fs.readFile(filePath, 'utf-8')
  const { data, content } = matter(raw)
  const fm = data as PostFrontmatter

  if (fm.status !== 'published') return null

  const fileBase = path.basename(filePath, path.extname(filePath))
  const slug = fm.slug?.trim() || fileBase
  const title = fm.title?.trim()
  const publishedDate = coerceDate(fm.publishedDate)

  if (!title) {
    throw new Error(`Markdown frontmatter missing required "title" in ${filePath}`)
  }
  if (!publishedDate) {
    throw new Error(
      `Markdown frontmatter missing required "publishedDate" in ${filePath}`
    )
  }

  return {
    id: `markdown:${slug}`,
    title,
    slug,
    description: fm.description?.trim() ?? '',
    category: fm.category?.trim() ?? null,
    tags: Array.isArray(fm.tags) ? fm.tags.map(String) : [],
    publishedDate,
    coverImage: fm.coverImage?.trim() || null,
    source: 'markdown',
    content,
  }
}

async function listMarkdownFiles(): Promise<string[]> {
  try {
    await fs.access(POSTS_DIR)
  } catch {
    return []
  }
  return glob('**/*.md', { cwd: POSTS_DIR, absolute: true })
}

export const markdownAdapter: ContentSourceAdapter = {
  source: 'markdown',
  enabled: true,

  async listPosts(): Promise<RawPost[]> {
    const files = await listMarkdownFiles()
    const posts = await Promise.all(files.map(readPostFile))
    return posts.filter((p): p is RawPost => p !== null)
  },

  async getPostBySlug(slug: string): Promise<RawPost | null> {
    const all = await this.listPosts()
    return all.find((p) => p.slug === slug) ?? null
  },
}
