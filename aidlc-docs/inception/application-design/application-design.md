# Application Design

## Overview

`ian-blog` is a statically-exported Next.js site with Notion as the sole CMS. At build time, GitHub Actions triggers a Next.js build that pulls all published posts from Notion, renders them to static HTML, and syncs the output to AWS S3 served via CloudFront.

---

## Component Map

```
src/
├── app/                        [Next.js Pages — route entry points]
│   ├── layout.tsx              RootLayout
│   ├── page.tsx                HomePage
│   ├── blog/page.tsx           BlogListPage
│   ├── blog/[slug]/page.tsx    BlogPostPage
│   ├── about/page.tsx          AboutPage
│   └── tags/[tag]/page.tsx     TagPage
│
├── components/
│   ├── layout/
│   │   ├── Header              Site-wide navigation + ThemeToggle
│   │   └── Footer              Copyright + links
│   ├── blog/
│   │   ├── PostCard            Single post preview card
│   │   ├── PostList            Grid of PostCards + empty state
│   │   ├── TagBadge            Clickable/display tag chip
│   │   └── PostContent         Markdown renderer (react-markdown + shiki)
│   └── shared/
│       └── ThemeToggle         Light/dark switch
│
└── lib/
    ├── notion/
    │   ├── client.ts           Notion SDK singleton (server-only)
    │   ├── queries.ts          All Notion API query functions
    │   └── renderer.ts         Notion blocks → Markdown string
    └── utils.ts                readingTime(), formatDate(), cn()
```

---

## Components

### RootLayout (`src/app/layout.tsx`)
**Responsibility**: Wraps every page. Provides HTML shell, fonts, global CSS, and ThemeProvider.

**Renders**: `<html>` → `<body>` → `<Header>` → `{children}` → `<Footer>`

**Deps**: Header, Footer

---

### Header (`src/components/layout/Header.tsx`)
**Responsibility**: Top navigation bar.

**Elements**: Site name/logo (link `/`), nav links (Blog, About), ThemeToggle

**Behavior**: Sticky; backdrop blur on scroll

---

### Footer (`src/components/layout/Footer.tsx`)
**Responsibility**: Bottom bar with copyright and external links.

**Elements**: Copyright text, GitHub link, RSS link

---

### ThemeToggle (`src/components/shared/ThemeToggle.tsx`)
**Responsibility**: Toggle light/dark mode.

**Behavior**: Reads `localStorage` on mount, falls back to `prefers-color-scheme`. Toggles `dark` class on `<html>`. Persists choice.

---

### HomePage (`src/app/page.tsx`)
**Responsibility**: Main landing page.

**Sections**:
1. Hero — author name, tagline, CTA
2. PostList — latest 6 posts

**Data**: `getPublishedPosts()` at build time (first 6)

---

### BlogListPage (`src/app/blog/page.tsx`)
**Responsibility**: All published posts with tag filtering.

**Sections**: TagFilter bar, PostList

**Data**: `getPublishedPosts()` + `getAllTags()`

**State**: Active tag in URL search param (`?tag=xxx`) — client-side filter

---

### BlogPostPage (`src/app/blog/[slug]/page.tsx`)
**Responsibility**: Full post content.

**Sections**: Post header (title, date, reading time, tags), cover image, PostContent, back link

**Data**: `getPostBySlug(slug)` — includes `content` (Markdown string)

**Static params**: `generateStaticParams()` from `getAllSlugs()`

---

### PostCard (`src/components/blog/PostCard.tsx`)
**Responsibility**: Single post preview card used in lists.

**Props**: `post: BlogPost`

**Renders**: Cover image (optional), title, description, date, reading time, TagBadge list

---

### PostList (`src/components/blog/PostList.tsx`)
**Responsibility**: Responsive grid of PostCards.

**Props**: `posts: BlogPost[]`, `activeTag?: string`

**Empty state**: "No posts found" message

---

### TagBadge (`src/components/blog/TagBadge.tsx`)
**Responsibility**: Single tag chip.

**Props**: `tag: string`, `active?: boolean`, `href?: string`

**Behavior**: If `href` provided, renders as `<Link>`; otherwise plain `<span>`

---

### PostContent (`src/components/blog/PostContent.tsx`)
**Responsibility**: Render Markdown content from Notion.

**Props**: `markdown: string`

**Uses**: `react-markdown` + `remark-gfm` + custom `shiki` code block renderer

**Applies**: Tailwind `prose` typography classes (dark mode aware)

---

## Services (Notion Data Layer)

### Notion Client (`src/lib/notion/client.ts`)
- Instantiates `@notionhq/client` once (singleton)
- Exports `notion` and `DATABASE_ID`
- Throws at module load if `NOTION_API_KEY` missing

### Notion Queries (`src/lib/notion/queries.ts`)

| Function | Return | Description |
|---|---|---|
| `getPublishedPosts()` | `Promise<BlogPost[]>` | All published, sorted by date desc |
| `getPostBySlug(slug)` | `Promise<BlogPost \| null>` | Single post with Markdown content |
| `getAllTags()` | `Promise<string[]>` | Unique tag list |
| `getPostsByTag(tag)` | `Promise<BlogPost[]>` | Posts filtered by tag |
| `getAllSlugs()` | `Promise<string[]>` | All slugs for static params |

**Rule**: All functions are `async`, return typed domain objects, and contain **no presentation logic**.

### Notion Renderer (`src/lib/notion/renderer.ts`)
- Uses `notion-to-md` to convert Notion page blocks → Markdown string
- Exported as: `getPostContent(pageId: string): Promise<string>`

### Utils (`src/lib/utils.ts`)
- `estimateReadingTime(markdown: string): number` — words / 200 wpm
- `formatDate(iso: string): string` — human-readable date
- `cn(...inputs): string` — Tailwind class merge utility

---

## Component Dependency Graph

```
RootLayout
├── Header
│   └── ThemeToggle
├── {page children}
│   ├── HomePage
│   │   └── PostList → PostCard → TagBadge
│   ├── BlogListPage
│   │   ├── PostList → PostCard → TagBadge
│   │   └── TagBadge (filter bar)
│   ├── BlogPostPage
│   │   ├── PostContent
│   │   └── TagBadge
│   ├── AboutPage (no deps)
│   └── TagPage
│       └── PostList → PostCard → TagBadge
└── Footer

Data layer (server-only, no component deps):
  notion/client ← notion/queries ← notion/renderer
  Pages call queries → pass typed BlogPost[] props to components
```

---

## Data Flow Summary

```
Build time:
  GitHub Actions
    → pnpm build
      → Next.js page (server) calls lib/notion/queries.ts
        → queries.ts calls Notion API (NOTION_API_KEY env var)
          → Returns BlogPost[] (typed domain objects)
            → Passed as props to React components
              → Rendered to static HTML in /out
                → Synced to S3

Runtime (browser):
  CloudFront → S3 → Static HTML + JS
  ThemeToggle reads/writes localStorage (only client-side interaction)
  Tag filter reads/writes URL search params (client-side)
```
