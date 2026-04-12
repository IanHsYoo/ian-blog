# 애플리케이션 설계서 (v2 보완)

## 개요
`ian-blog`는 Next.js 정적 사이트이며, v2에서는 **마크다운 우선 콘텐츠 구조**를 채택한다.
블로그 글은 `content/posts/`의 마크다운을 기준으로 렌더링하고, About 페이지는 포트폴리오 허브 역할을 수행한다.
향후 Notion 연동은 어댑터 확장으로 수용한다.

---

## 아키텍처 스냅샷

```text
Routes (App Router)
  -> Query Services
    -> Source Strategy (Markdown-first)
      -> Markdown/Portfolio Adapters
        -> Local Content Files
  -> UI Components
  -> Static Export (/out)
```

- 배포 모델: 정적 export + S3/CloudFront
- 콘텐츠 소스 정책: Markdown-first, Notion-optional

---

## 주요 컴포넌트 구성

### 라우트
- `src/app/page.tsx`: 홈
- `src/app/blog/page.tsx`: 블로그 목록 + 필터
- `src/app/blog/[slug]/page.tsx`: 포스트 상세
- `src/app/about/page.tsx`: 포트폴리오 통합
- `src/app/categories/[category]/page.tsx`: 카테고리 목록
- `src/app/tags/[tag]/page.tsx`: 태그 목록

### UI
- `src/components/blog/*`: PostList, PostCard, PostContent, TagBadge, CategoryBadge
- `src/components/portfolio/*`: ProjectList, ExperienceTimeline, SkillMatrix
- `src/components/layout/*`: Header, Footer, ThemeToggle

### 서비스/데이터
- `src/lib/content/repository.ts`: 콘텐츠 조회 인터페이스
- `src/lib/content/markdown-loader.ts`: 마크다운/프론트매터 파싱
- `src/lib/content/portfolio-loader.ts`: 포트폴리오 데이터 로딩
- `src/lib/content/metadata.ts`: SEO/피드/사이트맵용 메타 변환

---

## 서비스 설계 핵심

### ContentQueryService
- 역할: 발행 목록/단건/슬러그/카테고리/태그 조회
- 특징: 페이지 계층과 소스 구현 상세 분리

### PortfolioQueryService
- 역할: About 페이지의 프로필/프로젝트/경력/스킬 제공

### MetadataOrchestrationService
- 역할: 포스트 메타데이터, sitemap, RSS 항목 생성

### ContentSourceStrategyService
- 역할: Markdown 우선 소스 선택, 추후 Notion fallback 전략 지원

---

## 의존성 및 통신 패턴
- 의존성 방향: `Page -> Service -> Adapter -> Data Source`
- 페이지는 유스케이스 단위로 서비스 호출
- UI 컴포넌트는 props 기반 렌더에 집중
- 빌드 타임에 정규화된 도메인 모델 생성 후 정적 HTML 출력

---

## 설계 산출물 참조
- 컴포넌트 정의: `components.md`
- 메서드 시그니처: `component-methods.md`
- 서비스 설계: `services.md`
- 의존성 설계: `component-dependency.md`

---

## v2 반영 포인트 요약
1. Notion 단일 소스 설계를 Markdown 우선 전략으로 전환
2. About를 포트폴리오 중심 페이지로 확장
3. 카테고리/태그 탐색 라우트 정규화
4. 서비스 계층을 중심으로 하이브리드 전환 여지 확보
5. 정적 배포 모델과 SEO 메타 생성 흐름을 분리 설계
