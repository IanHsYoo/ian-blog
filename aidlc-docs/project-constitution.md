# Project Constitution — ian-blog

> Single source of truth for all architectural decisions, technology choices, and conventions.
> Every contributor (human or AI agent) MUST read this before writing any code.

---

## 1. Project Identity

| Field | Value |
|---|---|
| Name | ian-blog |
| Type | Static blog — Notion as CMS, AWS S3+CloudFront delivery |
| Stack | Next.js 14 · TypeScript · Tailwind CSS · Notion API |
| Infra | AWS S3 + CloudFront · Terraform · GitHub Actions |

---

## 2. Locked Technology Decisions

| Layer | Technology | Reason |
|---|---|---|
| Framework | Next.js 14 (App Router, `output: 'export'`) | Static export for S3/CloudFront |
| Language | TypeScript 5.x — strict | Type safety, AI-agent readability |
| Styling | Tailwind CSS 3.x | Utility-first, no runtime overhead |
| UI Primitives | shadcn/ui | Accessible, copy-owned, token-driven |
| CMS | Notion API (`@notionhq/client`) | Author-managed content |
| Notion → MD | `notion-to-md` | Block → Markdown conversion |
| Markdown render | `react-markdown` + `remark-gfm` + `rehype-raw` | GFM + raw HTML support |
| Syntax highlight | `shiki` | Accurate, theme-aware |
| Package manager | pnpm | Fast, disk-efficient |
| Hosting | AWS S3 + CloudFront | CDN-delivered static files |
| IaC | Terraform | Reproducible infrastructure |
| CI/CD | GitHub Actions | Build → export → S3 sync → CF invalidation |

**Rule**: Do not add or swap dependencies without updating this document and logging in `aidlc-docs/audit.md`.

---

## 3. Canonical Project Structure

```
ian-blog/
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── layout.tsx              # Root layout
│   │   ├── page.tsx                # Home (hero + recent posts)
│   │   ├── blog/
│   │   │   ├── page.tsx            # Post list + tag filter
│   │   │   └── [slug]/page.tsx     # Post detail
│   │   ├── about/page.tsx
│   │   ├── tags/[tag]/page.tsx
│   │   ├── sitemap.ts
│   │   ├── robots.ts
│   │   └── feed.xml/route.ts       # RSS feed
│   │
│   ├── components/
│   │   ├── ui/                     # shadcn/ui base components
│   │   ├── layout/                 # Header, Footer
│   │   ├── blog/                   # PostCard, PostList, TagBadge, PostContent
│   │   └── shared/                 # ThemeToggle
│   │
│   ├── lib/
│   │   ├── notion/
│   │   │   ├── client.ts           # Notion SDK singleton
│   │   │   ├── queries.ts          # All Notion API calls (server-only)
│   │   │   └── renderer.ts         # Blocks → Markdown
│   │   └── utils.ts                # readingTime, formatDate, cn()
│   │
│   ├── types/index.ts              # Domain types (BlogPost, Tag…)
│   └── styles/globals.css          # Tailwind base + CSS custom properties
│
├── public/
├── terraform/                      # AWS infrastructure
│   ├── main.tf
│   ├── variables.tf
│   ├── outputs.tf
│   └── backend.tf
├── .github/
│   └── workflows/
│       └── deploy.yml              # Build → export → S3 → CF invalidation
├── aidlc-docs/                     # AI-DLC documentation (NO app code here)
├── .env.example
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 4. Architecture Rules

### 4.1 Static Export
- `next.config.js` must have `output: 'export'`
- No dynamic server routes (no `getServerSideProps`, no `/api/` routes with runtime)
- Notion data fetched **at build time only**

### 4.2 Notion Data Flow
```
GitHub Actions trigger
  → pnpm build (Next.js calls Notion API server-side at build time)
    → Static HTML/JS/CSS exported to /out
      → Sync to S3
        → CloudFront invalidation
          → Users served from CloudFront edge
```
- Notion API called **only** inside `src/lib/notion/queries.ts`
- **Never** call Notion API in client components
- Data is stale after last build — re-trigger GitHub Actions to refresh

### 4.3 AWS Architecture
```
GitHub Actions → S3 Bucket (private) → CloudFront (OAI) → Users
```
- S3 bucket: public access BLOCKED
- CloudFront: HTTPS only, Origin Access Identity (OAI) to S3
- Security headers: CloudFront Response Headers Policy

### 4.4 Theme System
- Tailwind `darkMode: 'class'`
- CSS custom properties in `globals.css`: `--background`, `--foreground`, `--primary`, `--muted`
- `ThemeToggle` sets/removes `dark` class on `<html>`, persists to `localStorage`

---

## 5. Notion Database Schema

| Property | Type | Notes |
|---|---|---|
| `Title` | Title | Post title |
| `Slug` | Text | URL slug (`my-first-post`) — unique, no spaces |
| `Description` | Text | Short excerpt |
| `Tags` | Multi-select | e.g. `TypeScript`, `AWS` |
| `Status` | Select | `Draft` or `Published` |
| `PublishedDate` | Date | ISO date |
| `CoverImage` | URL | Optional; external image URL |

---

## 6. Environment Variables

| Variable | Exposure | Required | Purpose |
|---|---|---|---|
| `NOTION_API_KEY` | Server only | Yes | Notion integration token |
| `NOTION_DATABASE_ID` | Server only | Yes | Posts database ID |
| `NEXT_PUBLIC_SITE_URL` | Client | Yes | Full site URL |
| `NEXT_PUBLIC_SITE_NAME` | Client | Yes | Blog display name |
| `NEXT_PUBLIC_AUTHOR_NAME` | Client | Yes | Author name for SEO |

**Rule**: `NOTION_API_KEY` and `NOTION_DATABASE_ID` must **never** be prefixed `NEXT_PUBLIC_`.

---

## 7. Coding Conventions

| Thing | Convention | Example |
|---|---|---|
| Files/dirs | kebab-case | `post-card.tsx` |
| Components | PascalCase export | `export function PostCard()` |
| Functions | camelCase | `getPublishedPosts` |
| Types | PascalCase | `BlogPost` |
| Constants | UPPER_SNAKE | `REVALIDATE_TTL` |
| Imports | Absolute via `@/` | `@/components/blog/PostCard` |
| Component props | `interface ComponentProps` | `interface PostCardProps` |

- No `any` — use `unknown` + type guards
- Named exports everywhere except Next.js page defaults
- No barrel `index.ts` in `components/` — import directly

---

## 8. Git Conventions

| Type | Branch pattern | Example |
|---|---|---|
| Feature | `feature/<scope>` | `feature/post-detail-page` |
| Fix | `fix/<scope>` | `fix/dark-mode-flicker` |
| Docs/Spec | `docs/<scope>` | `docs/project-constitution` |
| Infra | `infra/<scope>` | `infra/terraform-cloudfront` |
| Chore | `chore/<scope>` | `chore/setup-eslint` |

Commits follow **Conventional Commits**: `feat(blog): add post list page`

---

## 9. AI Agent Rules

An AI agent working on this project MUST:

1. Read this document before writing any code
2. Never place application code inside `aidlc-docs/`
3. Never call Notion API in client components
4. Use TypeScript strict — no `any`
5. Follow canonical project structure above
6. Keep `output: 'export'` — no server runtime features
7. Match Notion database property names exactly
8. Append to `aidlc-docs/audit.md` for significant decisions
9. Never commit `.env.local` — update `.env.example` instead
10. Use pnpm, not npm or yarn

---

## 10. Definition of Done

A feature is **done** when:
- [ ] `pnpm tsc --noEmit` — zero errors
- [ ] `pnpm lint` — zero errors
- [ ] `pnpm build` — succeeds and `/out` is generated
- [ ] Renders correctly in light + dark mode
- [ ] No client-side Notion API calls
- [ ] SEO meta tags present on all pages
- [ ] Conventional Commit message used
