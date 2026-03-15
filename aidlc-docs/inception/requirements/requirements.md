# Requirements Document

## Intent Analysis Summary

| Field | Value |
|---|---|
| **User Request** | Create a personal blog with design using Notion database API, deployed on AWS via Terraform + GitHub Actions |
| **Request Type** | New Project (Greenfield) |
| **Scope Estimate** | System-wide (frontend + infrastructure + CI/CD) |
| **Complexity Estimate** | Moderate |
| **Requirements Depth** | Standard |

---

## Functional Requirements

### FR-01: Content Management via Notion
- Blog posts managed entirely in a Notion database
- Each Notion page = one blog post
- Notion page properties: `Title`, `Slug`, `Description`, `Tags`, `Status` (Draft/Published), `PublishedDate`, `CoverImage`
- Only `Status = Published` posts are rendered on the live site
- Content blocks supported: paragraph, headings, code, image, quote, callout, bulleted/numbered list, divider

### FR-02: Main / Home Page
- Hero section with author name and tagline
- Recent posts grid (latest 6)
- "View all posts" CTA linking to `/blog`

### FR-03: Blog List Page (`/blog`)
- All published posts sorted by date descending
- Tag filter bar (client-side, URL param `?tag=xxx`)
- Post card: cover image, title, description, date, tags, reading time

### FR-04: Blog Post Detail Page (`/blog/[slug]`)
- Full post content rendered from Notion blocks
- Syntax-highlighted code blocks
- Reading time estimate
- SEO meta (title, description, og:image)

### FR-05: Supporting Pages
- `/about` — static author bio
- `/tags/[tag]` — posts filtered by tag

### FR-06: Light/Dark Mode
- Toggle button, persisted in localStorage, defaults to system preference

### FR-07: SEO
- Dynamic `<head>` per page (Open Graph, Twitter card)
- `sitemap.xml` auto-generated
- `robots.txt`

### FR-08: RSS Feed
- `/feed.xml` RSS 2.0 of all published posts

---

## Non-Functional Requirements

### NFR-01: Performance
- Fully static output (`next export`) for CDN delivery via CloudFront
- Lighthouse Performance score ≥ 90
- Images optimized at build time

### NFR-02: Deployment & Infrastructure
- Hosted on **AWS S3 + CloudFront** (static site)
- Infrastructure provisioned via **Terraform**
- CI/CD via **GitHub Actions**
- AWS credentials injected via **GitHub Secrets** (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`)
- Build → export → S3 sync → CloudFront invalidation on every push to `main`

### NFR-03: Security
- Notion API key server-side only (build-time env var, never in client bundle)
- HTTP security headers set at CloudFront response policy level
- S3 bucket: public access blocked; served exclusively through CloudFront OAI

### NFR-04: Developer Experience
- TypeScript strict mode
- ESLint + Prettier
- Path aliases: `@/components`, `@/lib`, `@/types`
- `.env.example` committed; `.env.local` gitignored

### NFR-05: Maintainability
- All Notion API calls centralized in `src/lib/notion/`
- Clear separation: data layer → page → component

---

## Technical Constraints

| Constraint | Value |
|---|---|
| Framework | Next.js 14 (App Router, `output: 'export'`) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS |
| CMS | Notion API (`@notionhq/client`) |
| Static Export | Required (no server runtime on AWS S3/CloudFront) |
| Package Manager | pnpm |
| Infrastructure | AWS (S3 + CloudFront) |
| IaC | Terraform |
| CI/CD | GitHub Actions |

---

## Out of Scope (v1)
- Comments system
- Newsletter / email subscription
- Authentication / admin panel
- Analytics integration
- Custom domain / Route53 (noted as optional)
