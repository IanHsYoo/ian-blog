# AI-DLC State Tracking

## Project Information
- **Project Name**: ian-blog
- **Project Type**: Greenfield
- **Start Date**: 2026-03-14T00:00:00Z
- **Current Stage**: CONSTRUCTION - Code Generation (blog-v2) Phase G~J 완료, Phase K 대기

## Workspace State
- **Existing Code**: No (at start)
- **Reverse Engineering Needed**: No
- **Workspace Root**: /Users/ian/workspace/ian-blog

## Code Location Rules
- **Application Code**: Workspace root (NEVER in aidlc-docs/)
- **Documentation**: aidlc-docs/ only
- **Structure**: See aidlc-docs/project-constitution.md

## Extension Configuration
| Extension | Enabled | Decided At |
|---|---|---|
| Security (SECURITY-01..15) | No | Requirements Analysis (2026-04-09) |

## Stage Progress

### INCEPTION PHASE
- [x] Workspace Detection — COMPLETED
- [-] Reverse Engineering — SKIPPED (Greenfield)
- [x] Requirements Analysis — COMPLETED
- [x] User Stories — COMPLETED (v2 범위 확장 반영)
- [x] Workflow Planning — COMPLETED (v2 실행 계획 수립 완료)
- [x] Application Design — COMPLETED (v2 산출물 승인 및 단계 종료)
- [-] Units Generation — SKIPPED (single cohesive unit)

### CONSTRUCTION PHASE
- [-] Functional Design — SKIPPED (no complex domain logic)
- [>] NFR Requirements — IN REVIEW (blog-v2 산출물 생성 완료, 승인 대기)
- [-] NFR Design — SKIPPED (folded into Infra Design)
- [-] Infrastructure Design — PENDING (Terraform + GitHub Actions)
- [>] Code Generation — IN PROGRESS (blog-v2 하이브리드)
  - [x] Phase A: Project bootstrap (package.json, tsconfig, next.config, tailwind, postcss, .env.example, .gitignore)
  - [x] Phase B: Foundation (globals.css, types/index.ts, lib/utils.ts)
  - [x] Phase C: Notion data layer (client.ts, queries.ts, renderer.ts) — Phase I에서 어댑터로 리팩터링 완료
  - [x] Phase D: Layout components (ThemeToggle, Header, Footer, layout.tsx)
  - [x] Phase E: Blog components (TagBadge, PostCard, PostList)
  - [x] Phase F: Main page (src/app/page.tsx)
  - [x] Phase G: 도메인 타입/인터페이스 확장 (BlogPost.category/source, RawPost, ContentSourceAdapter)
  - [x] Phase H: 마크다운 어댑터 (gray-matter + glob, content/posts/welcome-to-blog.md)
  - [x] Phase I: Notion 어댑터 리팩터링 (src/lib/content/adapters/notion-adapter.ts, Category 지원)
  - [x] Phase J: ContentRepository (소스 분리 정책, 회귀 검증 type-check/lint/build 통과)
  - [ ] Phase K: Blog 라우트 (/blog, /blog/[slug])
  - [ ] Phase L: 카테고리/태그 라우트
  - [ ] Phase M: About + 포트폴리오
  - [ ] Phase N: SEO/RSS/sitemap
  - [ ] Phase O: 검증 및 문서화
- [ ] Build and Test — PENDING

### OPERATIONS PHASE
- [-] Operations — PLACEHOLDER

## Current Status
- **Lifecycle Phase**: CONSTRUCTION
- **Current Stage**: NFR Requirements Complete (blog-v2) — Approval Pending
- **Next Stage**: Infrastructure Design (승인 시)
- **Branch**: docs/project-constitution
