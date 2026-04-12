# 요구사항 문서 (v2 — 범위 확장)

## 의도 분석 요약

| 항목 | 내용 |
|---|---|
| **사용자 요청** | 개인 블로그 제작 — 미니멀 디자인, 포트폴리오 페이지, 마크다운 우선 콘텐츠, AWS 배포, GitHub 관리 |
| **요청 유형** | 기능 확장 (Enhancement) — 기존 프로젝트 범위 확장 |
| **범위** | 다중 컴포넌트 (새 페이지 + 데이터 레이어 변경 + 디자인 리뉴얼) |
| **복잡도** | 보통 (Moderate) |
| **요구사항 깊이** | Standard |
| **v1 대비 변경** | 포트폴리오 추가, 카테고리 체계 추가, 마크다운 우선 접근, 디자인 리뉴얼 |

---

## 기능 요구사항

### FR-01: 콘텐츠 관리 (마크다운 우선)
- 블로그 포스트는 로컬 마크다운 파일로 관리 (`content/posts/`)
- 마크다운 프론트매터(frontmatter)로 메타데이터 관리: `title`, `slug`, `description`, `category`, `tags`, `status` (draft/published), `publishedDate`, `coverImage`
- `status = published`인 포스트만 사이트에 렌더링
- 지원 콘텐츠 블록: paragraph, headings, code, image, quote, callout, bulleted/numbered list, divider
- **확장 계획**: 추후 Notion API 연동 추가하여 하이브리드(마크다운 + Notion) 지원

### FR-02: 메인/홈 페이지
- 히어로 섹션 — 작성자 이름, 태그라인
- 최근 포스트 그리드 (최신 6개) — 카드 기반 레이아웃
- "모든 포스트 보기" CTA → `/blog` 링크

### FR-03: 블로그 목록 페이지 (`/blog`)
- 모든 발행 포스트를 날짜 내림차순 정렬
- **카테고리 필터** + **태그 필터** (URL 파라미터: `?category=xxx&tag=yyy`)
- 포스트 카드: 커버 이미지, 제목, 설명, 날짜, 카테고리, 태그, 읽기 시간

### FR-04: 블로그 포스트 상세 페이지 (`/blog/[slug]`)
- 마크다운 콘텐츠 전체 렌더링
- 구문 강조(syntax highlighting) 코드 블록
- 읽기 시간 추정
- SEO 메타 (title, description, og:image)

### FR-05: About 페이지 (`/about`) — 포트폴리오 통합
- **자기소개 섹션**: 작성자 프로필, 소개글
- **프로젝트 목록 섹션**: 제목, 설명, 기술스택, 링크 (GitHub/Demo)
- **경력/이력 타임라인**: 주요 경력 이력 시간순 표시
- **스킬셋/기술 프로필**: 기술 스택 시각화
- 데이터는 로컬 JSON/마크다운 파일로 관리 (`content/portfolio/`)
- **확장 계획**: 추후 Notion 데이터베이스 연동

### FR-06: 카테고리/태그 페이지
- `/categories/[category]` — 카테고리별 포스트 필터링
- `/tags/[tag]` — 태그별 포스트 필터링
- 카테고리는 상위 분류 (예: Development, Design, Life)
- 태그는 세부 키워드 (예: React, TypeScript, AWS)

### FR-07: 라이트/다크 모드
- 토글 버튼, localStorage에 저장, 시스템 설정 기본값
- 기존 구현 유지

### FR-08: SEO
- 페이지별 동적 `<head>` (Open Graph, Twitter card)
- `sitemap.xml` 자동 생성
- `robots.txt`

### FR-09: RSS 피드
- `/feed.xml` RSS 2.0 — 모든 발행 포스트

---

## 비기능 요구사항

### NFR-01: 성능
- 정적 빌드 출력 (`output: 'export'`) — CDN 전달
- Lighthouse Performance 점수 >= 90
- 빌드 시 이미지 최적화

### NFR-02: 배포 및 인프라
- **AWS S3 + CloudFront** (정적 사이트 호스팅)
- **Terraform**으로 인프라 프로비저닝
- **GitHub Actions** CI/CD
- AWS 자격증명은 **GitHub Secrets** (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`)
- `main` 브랜치 push 시 빌드 → export → S3 동기화 → CloudFront 무효화

### NFR-03: 보안
- Notion API 키는 서버 사이드 전용 (빌드 시 환경변수, 클라이언트 번들에 노출 금지)
- HTTP 보안 헤더는 CloudFront 응답 정책에서 설정
- S3 버킷: 퍼블릭 접근 차단, CloudFront OAI로만 서빙

### NFR-04: 개발자 경험
- TypeScript strict 모드
- ESLint + Prettier
- Path aliases: `@/components`, `@/lib`, `@/types`, `@/content`
- `.env.example` 커밋, `.env.local` gitignore

### NFR-05: 유지보수성
- 콘텐츠 데이터 레이어 중앙화 (`src/lib/content/`)
- 명확한 분리: 데이터 레이어 → 페이지 → 컴포넌트
- 마크다운/Notion 전환 시 데이터 레이어만 변경하면 되는 구조

### NFR-06: 반응형 디자인 (모바일 대응)
- 모바일 퍼스트 반응형 디자인
- 브레이크포인트: sm(640px), md(768px), lg(1024px), xl(1280px)
- 모든 페이지에서 모바일/태블릿/데스크탑 정상 표시

---

## 기술 제약사항

| 제약사항 | 값 |
|---|---|
| 프레임워크 | Next.js 14 (App Router, `output: 'export'`) |
| 언어 | TypeScript (strict) |
| 스타일링 | Tailwind CSS |
| 콘텐츠 소스 (v1) | 로컬 마크다운 파일 (frontmatter) |
| 콘텐츠 소스 (v2 예정) | Notion API + 로컬 마크다운 하이브리드 |
| 정적 빌드 | 필수 (AWS S3/CloudFront에 서버 런타임 없음) |
| 패키지 매니저 | yarn |
| 인프라 | AWS (S3 + CloudFront) |
| IaC | Terraform |
| CI/CD | GitHub Actions |
| 디자인 | 카드 기반 모던 미니멀 (Vercel 블로그 스타일) |

---

## 디자인 방향

### 스타일
- **카드 기반 모던 미니멀** (Vercel 블로그 참조)
- 깔끔한 여백, 타이포그래피 중심
- 카드형 포스트 목록, 호버 인터랙션
- 라이트/다크 모드 완전 지원

### 컬러 팔레트 (참고)
- 라이트: 화이트 배경, 뉴트럴 그레이 텍스트, 포인트 컬러 최소화
- 다크: 다크 그레이/네이비 배경, 밝은 텍스트

---

## 콘텐츠 디렉토리 구조

```
content/
├── posts/                    # 블로그 포스트 마크다운
│   ├── my-first-post.md
│   └── another-post.md
└── portfolio/                # 포트폴리오 데이터
    ├── projects.json         # 프로젝트 목록
    ├── experience.json       # 경력 타임라인
    └── skills.json           # 스킬셋
```

---

## v1 대비 변경사항 요약

| 항목 | v1 | v2 |
|---|---|---|
| 콘텐츠 소스 | Notion API 직접 | 로컬 마크다운 (추후 Notion 확장) |
| 분류 체계 | 태그만 | 카테고리 + 태그 |
| /about | 정적 자기소개 | 포트폴리오 통합 (프로젝트+경력+스킬) |
| /portfolio | 없음 | /about에 통합 |
| 디자인 | 기본 | 카드 기반 모던 미니멀 |
| 모바일 대응 | 암묵적 | 명시적 모바일 퍼스트 |
| 데이터 레이어 | `src/lib/notion/` | `src/lib/content/` (마크다운 파서) |

---

## 범위 외 (v2)
- 댓글 시스템
- 뉴스레터/이메일 구독
- 인증/관리자 패널
- 분석 통합
- 커스텀 도메인/Route53 (선택사항으로 보류)
- 검색 기능 (추후 추가 가능)
