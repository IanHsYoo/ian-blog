export interface BlogPost {
  id: string
  title: string
  slug: string
  description: string
  tags: string[]
  publishedDate: string // ISO 8601 date string
  coverImage: string | null
  readingTime?: number // minutes, computed from content word count
  content?: string // Markdown string — populated only on detail page
}

export interface SiteConfig {
  name: string
  url: string
  author: string
  description: string
}
