# 서비스 설계서 (v2)

## 서비스 계층 목표
- 콘텐츠 소스 구현 상세를 페이지 계층에서 숨긴다.
- 마크다운 우선 정책을 유지하면서 추후 Notion 하이브리드 확장을 허용한다.
- 빌드 타임 정적 생성에 최적화된 조회 흐름을 제공한다.

## 서비스 목록

### ContentQueryService
- 책임: 블로그 콘텐츠 조회 유스케이스 제공
- 주요 기능:
  - 발행 목록 조회
  - slug 단건 조회
  - 카테고리/태그 필터 조회
  - 슬러그/카테고리/태그 인덱스 조회
- 의존: `MarkdownContentAdapter`, `ContentNormalizationService`

### PortfolioQueryService
- 책임: About 페이지용 포트폴리오 데이터 조회
- 주요 기능:
  - 프로필, 프로젝트, 경력, 스킬 로드
  - 정렬/노출 정책 적용
- 의존: `PortfolioDataAdapter`

### MetadataOrchestrationService
- 책임: SEO/피드/사이트맵 생성 데이터 조합
- 주요 기능:
  - 포스트 메타 생성
  - sitemap 항목 생성
  - RSS feed 항목 생성
- 의존: `ContentQueryService`, `MetadataMapper`

### ContentSourceStrategyService
- 책임: 콘텐츠 소스 선택 전략 관리
- 정책:
  - 1순위: 로컬 마크다운
  - 2순위: (옵션) Notion 어댑터
- 의존: `MarkdownContentAdapter`, `NotionContentAdapter(옵션)`

## 어댑터 정의

### MarkdownContentAdapter (기본)
- 입력: `content/posts/*.md`
- 출력: `ParsedPostDocument[]`
- 보장: frontmatter 유효성 검증 결과 제공

### PortfolioDataAdapter (기본)
- 입력: `content/portfolio/*.json|*.md`
- 출력: 프로필/프로젝트/경력/스킬 도메인 객체

### NotionContentAdapter (확장)
- 상태: v2에서는 비활성(설계만 유지)
- 역할: 하이브리드 전환 시 `ContentSourceStrategyService` 뒤에서 대체 소스 제공

## 오케스트레이션 시나리오

### 시나리오 A: 홈/목록 렌더
1. Page → `ContentQueryService.listPublishedPosts()`
2. Service → Strategy(마크다운 우선)로 소스 선택
3. Adapter 로드 + 정규화
4. Page에 요약 모델 반환

### 시나리오 B: 상세 페이지 렌더
1. Page → `ContentQueryService.readPost(slug)`
2. Service → 문서 단건 조회 + 본문/메타 구성
3. `MetadataOrchestrationService`로 head 메타 생성
4. Page + PostContent 렌더

### 시나리오 C: About/포트폴리오 렌더
1. Page → `PortfolioQueryService` 호출
2. 서비스가 각 데이터 소스를 로드/정렬
3. 섹션 컴포넌트별 모델 전달

## 실패 처리 원칙 (고수준)
- slug 미존재: `null` 반환 후 페이지에서 404 처리
- frontmatter 오류: 빌드 단계에서 식별 가능한 오류로 표준화
- 포트폴리오 데이터 부분 누락: 안전한 기본값 적용 후 렌더 지속
