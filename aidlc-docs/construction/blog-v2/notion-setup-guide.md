# Notion 연동 셋업 가이드 (blog-v2)

이 문서는 ian-blog를 Notion 데이터베이스와 연동하기 위해 **Notion 측에서 수행해야 하는 작업**을 단계별로 설명합니다. 마크다운 어댑터와 함께 하이브리드 모드로 동작하도록 구성됩니다.

> 본 가이드는 코드 변경 없이 Notion 워크스페이스에서만 수행하는 작업입니다. 코드 측 데이터 레이어 구현은 `.omc/plans/notion-markdown-hybrid-v2-plan.md`를 참고하세요.

---

## 1. 사전 준비

| 항목 | 값 |
|---|---|
| Notion 계정 | 무료 또는 유료 모두 가능 |
| 워크스페이스 권한 | Owner 또는 Workspace Admin (Integration 추가 권한 필요) |
| 필요한 시간 | 약 15분 |

---

## 2. Notion Integration 생성

### 2.1 Integration 만들기
1. https://www.notion.so/my-integrations 접속
2. 우측 상단 **"+ New integration"** 클릭
3. 다음 항목 입력:
   - **Name**: `ian-blog` (식별용)
   - **Associated workspace**: 본인 워크스페이스 선택
   - **Type**: **Internal** (이 블로그는 본인 워크스페이스 단독 사용)
4. **Submit** 클릭

### 2.2 Capabilities 설정
1. 생성된 Integration의 **Capabilities** 탭 진입
2. **Content Capabilities** 섹션에서 다음만 활성화:
   - [x] **Read content** (필수)
   - [ ] Update content (불필요)
   - [ ] Insert content (불필요)
3. **User Capabilities** 섹션:
   - **No user information** 선택 (개인정보 접근 차단)
4. **Save changes**

### 2.3 Internal Integration Secret 복사
1. **Configuration** 탭으로 이동
2. **Internal Integration Secret** 항목의 `Show` 클릭 후 값 복사
3. 형식 예시: `secret_AbCdEfGh1234...`
4. **이 값은 노출되면 안 됩니다.** 깃에 커밋 금지, `.env.local`에만 저장

---

## 3. Notion 데이터베이스 생성

### 3.1 페이지/DB 생성
1. Notion 좌측 사이드바에서 워크스페이스 루트 또는 임의 페이지 선택
2. **+ New page** → 본문에 `/database` 입력 → **Database - Full page** 선택
3. 페이지 제목: `Blog Posts` (자유롭게 변경 가능)

### 3.2 필수 속성(Properties) 정의

블로그가 정상 동작하려면 데이터베이스에 다음 속성이 **정확한 이름과 타입**으로 존재해야 합니다.

| 속성 이름 (대소문자 정확) | 타입 | 필수 | 설명 |
|---|---|---|---|
| **Title** | Title | ✅ | 포스트 제목 (DB 기본 Title 속성, 이름 변경) |
| **Slug** | Text (Rich text) | ✅ | URL 경로 (`/blog/[slug]`). 영문 소문자/숫자/하이픈만 사용 권장 (예: `getting-started`) |
| **Description** | Text (Rich text) | ✅ | 포스트 요약 (목록 카드와 메타 description에 사용) |
| **Category** | Select | ✅ | 상위 분류 (예: `Development`, `Design`, `Life`). 누락 시 `Uncategorized`로 폴백 |
| **Tags** | Multi-select | 권장 | 세부 키워드 (예: `React`, `TypeScript`) |
| **Status** | Select | ✅ | `Draft` 또는 `Published`만 사용. `Published`만 사이트에 노출 |
| **PublishedDate** | Date | ✅ | 발행일 (정렬 기준). ISO 형식 자동 처리 |
| **CoverImage** | URL | 선택 | 카드 썸네일 이미지 URL. 빈 값 허용 |

#### 속성 추가 절차
1. DB 헤더의 **+** 버튼 클릭 → 속성 이름 입력 → 타입 선택
2. **속성 이름은 위 표와 정확히 일치해야 합니다** (대소문자 포함)
3. `Status` Select 옵션을 미리 추가:
   - `Draft` (회색)
   - `Published` (녹색)
4. `Category` Select 옵션은 사용하면서 추가하면 됨

#### 속성 이름 변경 시 주의
코드에서 위 표의 이름을 그대로 참조합니다. **이름을 변경하려면 코드(`src/lib/content/adapters/notion-adapter.ts`)도 함께 수정해야 합니다.**

---

## 4. Integration에 데이터베이스 공유

Notion API는 명시적으로 공유된 페이지/DB만 접근할 수 있습니다.

### 절차
1. 생성한 `Blog Posts` 데이터베이스 페이지 열기
2. 우측 상단 **`...` (더보기)** → **Connections** 항목 → **+ Add connections**
3. 검색창에 `ian-blog` 입력 → 본인이 만든 Integration 선택
4. 권한 확인 다이얼로그에서 **Confirm**

### 검증
- DB 우측 상단 **Connections**에 `ian-blog` 표시되면 성공

---

## 5. 데이터베이스 ID 추출

### 절차
1. `Blog Posts` 데이터베이스 페이지 열기
2. 우측 상단 **`...` (더보기)** → **Copy link**
3. 복사된 URL에서 **DB ID 부분만 추출**

```
URL 형식:
https://www.notion.so/<workspace>/<DB-ID>?v=<view-id>

예시:
https://www.notion.so/myworkspace/0123456789abcdef0123456789abcdef?v=fedcba...

DB ID = 0123456789abcdef0123456789abcdef
```

- DB ID는 **하이픈 없는 32자리 16진수** 또는 **하이픈 포함 36자리 UUID** 모두 허용
- `?v=...` 부분은 view ID이므로 **포함하지 말 것**

---

## 6. 환경변수 설정

`.env.local` 파일을 프로젝트 루트(`/Users/ian/workspace/ian-blog/.env.local`)에 생성합니다.

```bash
# Notion Integration
NOTION_API_KEY=secret_AbCdEfGh1234...
NOTION_DATABASE_ID=0123456789abcdef0123456789abcdef

# Site metadata
NEXT_PUBLIC_SITE_URL=https://your-blog.example.com
NEXT_PUBLIC_SITE_NAME=Ian's Blog
NEXT_PUBLIC_AUTHOR_NAME=Ian
```

> **주의**:
> - `.env.local`은 `.gitignore`에 의해 커밋되지 않습니다 (확인 완료)
> - `NOTION_API_KEY`는 **절대 `NEXT_PUBLIC_` 접두사를 붙이지 말 것** (클라이언트 번들 노출)
> - 정적 export 빌드 시 빌드 환경(로컬 또는 GitHub Actions)에 동일 값을 주입해야 함

---

## 7. 첫 포스트 작성 (검증용)

### 7.1 새 행 추가
1. `Blog Posts` DB에서 **+ New** 클릭
2. 다음 값 입력:

| 필드 | 값 (예시) |
|---|---|
| Title | `Hello, Notion Blog` |
| Slug | `hello-notion-blog` |
| Description | `첫 번째 Notion 연동 포스트입니다.` |
| Category | `Development` |
| Tags | `Next.js`, `Notion` |
| Status | `Published` |
| PublishedDate | 오늘 날짜 |
| CoverImage | (선택) 이미지 URL |

### 7.2 본문 작성
- 행을 클릭하여 페이지 열기
- 본문에 마크다운 호환 블록 작성:
  - 제목 (`H1`/`H2`/`H3`)
  - 단락(paragraph)
  - 코드 블록 (`/code` 입력)
  - 인용(`/quote`)
  - 콜아웃(`/callout`)
  - 이미지(`/image`)
  - 리스트(불릿/번호)

> 지원 블록 외(예: 임베드, 데이터베이스 인라인 뷰)는 정상 렌더되지 않을 수 있습니다.

---

## 8. 로컬 동작 검증

```bash
# 의존성 확인
yarn install

# 개발 서버 시작
yarn dev
```

브라우저에서 http://localhost:3000 접속:
- 홈페이지에 방금 작성한 포스트가 카드로 표시되면 성공
- 표시되지 않을 경우 → 9. 트러블슈팅 참고

```bash
# 정적 빌드 검증
yarn build
# out/ 디렉토리에 모든 라우트가 생성되는지 확인
```

---

## 9. 트러블슈팅

| 증상 | 원인 | 해결 |
|---|---|---|
| `Missing NOTION_API_KEY` 에러 | `.env.local` 누락 또는 변수명 오타 | `.env.local` 생성 후 `NOTION_API_KEY` 키 확인. 개발 서버 재시작 |
| `object_not_found` 에러 | Integration이 DB에 공유되지 않음 | DB → Connections → `ian-blog` 추가 |
| `validation_error: invalid request URL` | DB ID에 `?v=...` 포함됨 | view ID 제거, 32자리 hex 또는 UUID만 사용 |
| 포스트가 보이지 않음 | `Status != Published` 또는 `PublishedDate` 누락 | DB에서 Status를 `Published`로, PublishedDate에 날짜 입력 |
| `Slug collision` 빌드 에러 | 동일 slug가 마크다운과 Notion 양쪽에 존재 | 한쪽 slug 변경 또는 마크다운 파일 삭제 |
| 카테고리가 모두 `Uncategorized`로 표시 | `Category` 속성 누락 | DB에 Select 타입 `Category` 추가, 각 행에 값 지정 |
| 이미지 깨짐 | Notion 호스팅 이미지의 임시 URL 만료 | 빌드 시점에 다시 페칭됨. CI에서 빌드 자동화 권장 |

---

## 10. 운영 체크리스트

- [ ] Integration 생성 완료 (`Read content` 권한)
- [ ] DB 생성 + 8개 속성(Title, Slug, Description, Category, Tags, Status, PublishedDate, CoverImage) 정의
- [ ] DB가 Integration에 공유됨
- [ ] DB ID 추출 + `.env.local` 설정
- [ ] 검증용 포스트 1건 `Published` 상태로 발행
- [ ] `yarn dev`에서 포스트 노출 확인
- [ ] `yarn build` 성공 확인
- [ ] (CI) GitHub Actions Secrets에 `NOTION_API_KEY`, `NOTION_DATABASE_ID` 등록 — *별도 인프라 plan에서 처리*

---

## 부록 A: Notion DB 스키마 ER 도식

```text
+----------------------------------+
|         Blog Posts (DB)          |
+----------------------------------+
| Title           : Title          |   [필수]
| Slug            : Rich Text      |   [필수, 고유]
| Description     : Rich Text      |   [필수]
| Category        : Select         |   [필수]
| Tags            : Multi-select   |   [권장]
| Status          : Select         |   [필수: Draft|Published]
| PublishedDate   : Date           |   [필수]
| CoverImage      : URL            |   [선택]
+----------------------------------+
```

## 부록 B: 권한 보안 요약

- Integration Type: **Internal** (Public 미사용)
- Capabilities: **Read content만 활성화**
- User Capabilities: **No user information**
- Secret 노출 통제: `.env.local` 로컬, GitHub Secrets 운영
- 클라이언트 번들 노출 차단: `NEXT_PUBLIC_` 접두사 금지
- DB 접근 범위: `Blog Posts` DB만 공유 (다른 페이지 접근 차단)
