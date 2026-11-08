# FIT-BACK Backend

FIT-BACK 서비스의 백엔드 레포지토리입니다.

## 개인 기여 — jh0131

### 담당 역할

FIT-BACK 백엔드에서 **이미지 업로드·분석 리포트 파이프라인**과 **운영 배포 안정화**를
중심으로 담당했습니다. 사용자가 올린 이미지를 안전하게 저장하고 분석 도메인과 연결하는
과정부터, 운영 환경의 CORS·AI 공급자 설정·비밀값 전달·Flyway 복구까지 개발과 배포 사이의
경계를 책임졌습니다.

GitHub의 병합 이력을 기준으로 직접 작성한 PR은 7개입니다. 대규모 통합 PR은 팀 전체 변경을
직접 구현했다는 의미가 아니라, 변경사항을 검증하고 운영 브랜치에 반영한 **릴리스 통합 역할**로
구분했습니다.

### 주요 기여

| 영역 | 기여 내용 | 관련 PR |
| --- | --- | --- |
| 이미지 업로드 | Presigned POST 발급, 업로드 완료 확인, 재발급, 파일 형식·크기 검증 및 `imageId` 계약 구현 | [#79](https://github.com/FIT-BACK/backend/pull/79) |
| 이미지 생명주기 | `PENDING_UPLOAD`부터 `DELETED`까지 상태 전이, 24시간 미사용 이미지 정리, 삭제 실패 재시도 구현 | [#79](https://github.com/FIT-BACK/backend/pull/79) |
| 분석 리포트 | `imageId` 기반 분석 생성, 추천·확정 태그 저장, 목록·상세 조회와 Soft Delete 구현 | [#79](https://github.com/FIT-BACK/backend/pull/79) |
| 운영 CORS | 허용 Origin을 `APP_CORS_ALLOWED_ORIGINS`로 환경변수화하고 Repository Variable → 원격 배포 → Docker Compose → Spring 전달 경로 연결 | [#216](https://github.com/FIT-BACK/backend/pull/216) |
| AI 배포 계약 | OpenAI·Bedrock 분석기의 모델·timeout 설정을 `FITBACK_AI_*`로 통일하고 공급자별 필수값을 fail-closed로 검증 | [#241](https://github.com/FIT-BACK/backend/pull/241) |
| 비밀값 보호 | OpenAI API key를 배포 payload와 release `.env`에서 제외하고 EC2가 Parameter Store SecureString에서 직접 조회하도록 구성 | [#241](https://github.com/FIT-BACK/backend/pull/241) |
| 브랜치·릴리스 통합 | 코드 차이 없이 main/develop 이력을 동기화하고, 팀의 develop 변경을 production main에 반영하는 릴리스 PR 작성·검증 | [#215](https://github.com/FIT-BACK/backend/pull/215), [#242](https://github.com/FIT-BACK/backend/pull/242) |
| 운영 장애 복구 | 운영에 적용된 Flyway V22 원문을 복원해 checksum 불일치와 AI 배포 실패를 해소 | [#245](https://github.com/FIT-BACK/backend/pull/245), [#246](https://github.com/FIT-BACK/backend/pull/246) |

### 트러블슈팅과 해결 과정

#### 1. 이미지 업로드와 DB 상태가 어긋나는 문제

- **어려웠던 점:** 대용량 이미지를 백엔드가 직접 중계하면 서버 부하가 커지고, 클라이언트가
  S3에 직접 올리면 업로드 성공 여부와 DB 상태가 어긋나거나 미사용 파일이 남을 수 있었습니다.
- **해결:** 백엔드는 5분 유효한 Presigned POST와 `imageId`만 발급하고, 클라이언트가 S3에
  직접 업로드한 뒤 완료 API를 호출하도록 분리했습니다. 이미지 상태 머신을 도입하고,
  업로드 후 24시간 동안 도메인에 연결되지 않은 이미지는 스케줄러가 정리하도록 했습니다.
  삭제 전 `DELETING` 상태로 선점하고 실패 시 `DELETE_FAILED`로 남겨 다음 실행에서 재시도해
  중복 삭제와 유실 가능성을 낮췄습니다.
- **검증:** 파일 시그니처·상태 전이·S3 정책·정리 스케줄러 테스트를 포함해 당시 전체 테스트
  89개와 `./gradlew clean build`를 통과시켰습니다.

#### 2. 로컬에서는 되지만 운영에서 발생하는 CORS 문제

- **어려웠던 점:** 허용 Origin이 코드와 여러 배포 계층에 흩어져 있으면 프론트 주소가 바뀔 때
  Spring 설정만 수정해서는 운영에 반영되지 않고, CloudFront·S3 CORS 문제와도 혼동하기
  쉬웠습니다.
- **해결:** `APP_CORS_ALLOWED_ORIGINS` 하나를 기준으로 GitHub Repository Variable, SSM 원격
  배포 payload, release `.env`, Docker Compose, Spring 설정까지 연결했습니다. 애플리케이션
  CORS와 S3·CloudFront·보안 그룹의 책임을 문서에서 분리하고 운영 설정 바인딩 회귀 테스트를
  추가했습니다.
- **검증:** Windows/WSL에서 Docker Compose 출력이 달라 로컬에서 끝까지 확인하지 못한 항목은
  제한사항으로 기록하고, Linux CI의 배포 계약 검사와 Gradle 빌드로 교차 검증했습니다.

#### 3. AI 공급자별 설정 차이와 비밀값 노출 위험

- **어려웠던 점:** prototype·OpenAI·Bedrock 모드마다 필요한 model과 인증값이 달랐고, 설정이
  누락된 채 배포되거나 API key가 workflow 로그·payload·배포 파일에 남을 위험이 있었습니다.
- **해결:** 분석기 종류, model, timeout을 `FITBACK_AI_*` 계약으로 통일하고 공급자별 필수값이
  없으면 배포가 중단되는 fail-closed 검증을 적용했습니다. OpenAI API key는 EC2 instance role로
  Parameter Store SecureString에서 직접 읽게 해 GitHub Actions와 release `.env`를 통과하지
  않도록 했습니다.
- **검증:** ECR 발행, Nginx 진입점, 원격 배포, MySQL migration 계약 스크립트와 전체 Gradle
  빌드, 민감정보 패턴 검사를 함께 실행했습니다.

#### 4. 이미 운영에 적용된 Flyway migration의 checksum 불일치

- **어려웠던 점:** 운영 DB에 적용된 V22 파일의 주석 한 줄이 이후 변경되면서 SQL 동작은 같아도
  Flyway checksum이 달라졌고, production 배포의 `validate` 단계가 실패했습니다. 이미 적용된
  versioned migration을 다시 수정하면 운영 이력을 더 복잡하게 만들 수 있었습니다.
- **해결:** 새 migration을 덧붙이거나 checksum을 임의 보정하지 않고, 이전 production main의
  V22 파일을 원문 그대로 복원했습니다. SQL 실행문과 데이터는 변경하지 않고 운영 이력과
  저장소 원문만 다시 일치시켰습니다.
- **검증:** 이전 운영 main과 파일 diff가 없음을 확인하고, MySQL에서 V1~V25 migration을 순서대로
  적용한 뒤 전체 빌드와 배포 health를 재확인했습니다.

#### 5. main과 develop의 이력 분기

- **어려웠던 점:** production 릴리스가 main에 먼저 병합되면서 코드 내용은 같지만 merge 이력이
  develop과 달라졌고, 다음 릴리스에서 불필요한 충돌이나 중복 커밋이 발생할 수 있었습니다.
- **해결:** 파일 변경이 없는 이력 동기화 PR을 별도로 만들어 main의 릴리스 이력만 develop에
  반영했습니다. 이후 develop → main 통합 PR에서는 포함 커밋, migration 순서, 운영 변수,
  health·rollback 영향을 명시해 기능 개발과 릴리스 책임을 분리했습니다.

### 작업 원칙

- 기능 구현뿐 아니라 테스트, migration, 배포 스크립트, 운영 문서를 하나의 변경 단위로 관리했습니다.
- 운영 비밀값이 코드·문서·로그·workflow payload에 남지 않는지 별도로 검사했습니다.
- 로컬 환경에서 재현할 수 없는 검증은 성공으로 간주하지 않고, 제한사항과 CI·운영 확인 항목을
  PR에 명시했습니다.

## 기술 스택

- Java 21
- Spring Boot 4.1.0
- Gradle
- Spring Data JPA
- Spring Security
- Spring Validation
- MySQL
- H2 Database
- SpringDoc OpenAPI

## 로컬 실행 방법

### 1. 환경변수 파일 생성

`.env.example` 파일을 복사해 `.env` 파일을 생성합니다.

```bash
cp .env.example .env
```

`.env` 파일 예시는 다음과 같습니다.

```env
DB_URL=jdbc:mysql://localhost:3306/fitback?serverTimezone=Asia/Seoul&characterEncoding=UTF-8
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
JWT_SECRET_KEY=change-me-to-at-least-32-byte-random-secret
AWS_REGION=ap-northeast-2
IMAGE_BUCKET=fitback-prod-images-123209654535-ap-northeast-2
IMAGE_CDN_BASE_URL=https://d1p2ierkew26r1.cloudfront.net
CLOUDFRONT_KEY_PAIR_ID=K1XNJ3JDEDCVL3
CLOUDFRONT_PRIVATE_KEY_BASE64=bG9jYWwtcHJpdmF0ZS1rZXk=
IMAGE_S3_API_CALL_TIMEOUT=PT5S
IMAGE_S3_API_CALL_ATTEMPT_TIMEOUT=PT2S
HMAC_SECRET_KEY=change-me-to-a-stable-32-byte-random-secret
FITBACK_AI_TAG_ANALYZER=unavailable
FITBACK_AI_REQUEST_TIMEOUT=PT30S
FITBACK_AI_OPENAI_API_KEY=your-openai-api-key
FITBACK_AI_OPENAI_MODEL=
FITBACK_AI_BEDROCK_MODEL_ID=
SHOPIFY_ENABLED=false
SHOPIFY_GLOBAL_CATALOG_ENDPOINT=https://catalog.shopify.com/api/ucp/mcp
SHOPIFY_AGENT_PROFILE_URL=https://shopify.dev/ucp/agent-profiles/2026-04-08/valid-with-capabilities.json
SHOPIFY_CONNECT_TIMEOUT=PT3S
SHOPIFY_READ_TIMEOUT=PT10S
SHOPIFY_SNAPSHOT_TTL=PT15M
SHOPIFY_ADDRESS_COUNTRY=KR
SHOPIFY_LANGUAGE=ko
SHOPIFY_CURRENCY=KRW
SHOPPING_CANDIDATE_TOKEN_TTL=PT10M
SHOPPING_PROVIDER=fixture
RECOMMENDATION_IMAGE_COMPARISON_CANDIDATE_LIMIT=30
APP_CORS_ALLOWED_ORIGINS=https://frontend-chi-one-35.vercel.app,http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000,http://127.0.0.1:5173
KAKAO_REST_API_KEY=team_kakao_rest_api_key
KAKAO_REST_API_SECRET=team_kakao_client_secret
FRONT_REDIRECT_URI=http://localhost:3000/oauth/success
MAIL_EMAIL=your-email@gmail.com
MAIL_APP_PASSWORD=your-google-app-password
FRONT_PASSWORD_RESET_URL=http://localhost:3000/reset-password
```

`RECOMMENDATION_IMAGE_COMPARISON_CANDIDATE_LIMIT`는 태그별 상품 검색 결과 중 이미지 비교 단계에 전달할
최대 후보 개수이며 기본값은 30입니다. 사용자 이미지 1장을 포함하면 총 31장이므로 요청당 최대
8장을 처리하는 현재 Fashion-CLIP PoC 기준 4개 배치로 나눌 수 있습니다. 이미지 비교 처리 시간과
API 비용에 따라 코드 수정 없이 조정할 수 있습니다. 선택된 후보만 이후 점수 계산과 추천 상품 저장
단계로 전달되므로 이 값을 낮추면 최종 추천 후보 수도 줄어들 수 있습니다.

쇼핑 공급자는 기본값으로 `fixture`를 사용합니다. Shopify Global Catalog를 사용하려면
`SHOPPING_PROVIDER=shopify`와 `SHOPIFY_ENABLED=true`를 함께 설정합니다. 익명 호출에는 API
키가 필요하지 않지만 agent profile URL이 필요하며, 기본 profile은 개발 검증용입니다.
Shopify 상품은 provider/product/variant/merchant ID만 저장하며 상품명·가격·이미지·구매 URL은
상세, 저장 상품 목록, 추천 결과 조회 시 Global Catalog에서 실시간 조회합니다.
상품 검색에서 발급하는 candidate token은 기본 10분 동안 유효하며
`SHOPPING_CANDIDATE_TOKEN_TTL`에 ISO-8601 Duration 형식으로 설정합니다.

추천 생성 POST 응답의 `data.browserReranking.candidates`는 해당 응답을 만들 때 이미 확보한
`ExternalProductCandidate`의 표시 metadata snapshot입니다. 이 snapshot은 live Shopify 가격
보장이 아니며, browser는 candidate token resolve API나 후속 Shopify metadata 호출을 하지
않습니다. 표시용 `price`는 `ProductPriceResponse` 형태이며 가격·판매자·구매 URL이 없으면
`null`로 전달합니다. browser는 같은 응답에서 normalized Fashion-CLIP cosine과
`imageSimilarity * 0.70 + tagSimilarity * 0.30`을 계산하고 relevance top-10을 선택한 뒤,
선택된 후보가 모두 유한하고 비교 가능한 가격을 가지며 동일 currency일 때만 price ASC로
표시하고, 그 외에는 전체 relevance 순서를 유지합니다. browser score는 backend에 저장하지
않습니다. 이 browser reranking 결과가 실제 사용자에게 노출하는 추천 순서의 기준입니다.
`recommendationGroups[].items[].similarityScore`는 서버 호환성과 추천 이력 저장을 위한
임시·내부 점수이며, 고정 이미지 점수 70을 사용하므로 사용자 노출 순위를 결정하는 실제
Fashion-CLIP 점수로 해석하지 않습니다.

배포형 최소 프로토타입에서는 다음 비민감 runtime 설정을 함께 전달합니다.

```env
FITBACK_AI_TAG_ANALYZER=prototype
SHOPPING_PROVIDER=shopify
SHOPIFY_ENABLED=true
```

`prototype` 분석기는 실제 이미지 의미를 판별하는 AI가 아니라 S3 업로드부터 분석·추천까지의
계약을 검증하기 위한 결정적 fallback입니다. 운영 기본값 `unavailable`은 실제 AI 공급자가
연결되기 전 데모 태그가 운영 데이터에 섞이지 않도록 fail-closed로 유지합니다.
실제 분석기는 `FITBACK_AI_TAG_ANALYZER=openai` 또는 `bedrock`으로 선택할 수 있으며,
두 공급자의 동일 조건 비교 절차는 [AI 태그 모델 블라인드 평가](docs/AI_TAG_BLIND_EVALUATION.md)를
따릅니다.

```env
# OpenAI
FITBACK_AI_TAG_ANALYZER=openai
FITBACK_AI_REQUEST_TIMEOUT=PT30S
FITBACK_AI_OPENAI_API_KEY=your-openai-api-key
FITBACK_AI_OPENAI_MODEL=gpt-5.6-luna

# 또는 Bedrock — 로컬은 AWS_PROFILE, 운영은 EC2 instance role 사용
FITBACK_AI_TAG_ANALYZER=bedrock
FITBACK_AI_REQUEST_TIMEOUT=PT30S
AWS_REGION=ap-northeast-2
FITBACK_AI_BEDROCK_MODEL_ID=global.anthropic.claude-haiku-4-5-20251001-v1:0
AWS_PROFILE=your-sso-profile
```

실제 값은 저장소에 커밋하지 않는다. 전체 변수 목록은 `.env.example`을 기준으로 한다.
Shopify를 사용할 때는 상품 식별자만 저장하며 표시 정보와 구매 URL은 `lookup_catalog`으로
실시간 조회합니다.

### 2. MySQL 데이터베이스 생성

로컬 MySQL에 사용할 데이터베이스를 생성합니다.

```sql
CREATE DATABASE fitback;
```

### 3. 애플리케이션 실행

```bash
./gradlew bootRun --args='--spring.profiles.active=local'
```

운영 설정이 실수로 로컬 설정으로 대체되지 않도록 실행 프로필을 명시합니다.

## 테스트 및 빌드

```bash
./gradlew clean build
```

테스트 환경에서는 `application-test.yml`을 통해 H2 인메모리 DB를 사용합니다.
쇼핑 공급자 contract test도 외부 네트워크 없이 fixture Adapter를 기준으로 실행합니다.
GitHub Actions의 Backend CI는 이 Gradle 빌드와 함께
`bash scripts/ci/test_mysql_migrations.sh`를 실행하여 MySQL 8.4 컨테이너에서
현재 Flyway `V1`~`V31` 마이그레이션과 주요 제약조건을 검증합니다.
ECR 이미지 발행, Nginx 공개 진입점, 원격 배포 payload 계약까지 포함한 전체 CI 명령은
[AGENTS.md의 CI 규칙](AGENTS.md#15-ci-규칙)과
[workflow 정의](.github/workflows/backend-ci.yml)를 기준으로 합니다.

## Swagger

애플리케이션 실행 후 아래 주소에서 Swagger UI를 확인할 수 있습니다.

```text
http://localhost:8080/swagger-ui.html
http://localhost:8080/v3/api-docs
```

## 운영 배포

운영 이미지는 GitHub Actions에서 ECR에 발행하고, AWS Systems Manager Run Command를 통해 EC2의 Docker Compose stack으로 배포합니다.

필요한 GitHub 변수, IAM 최소 권한, Parameter Store 경로, EC2 runtime 및 rollback 절차는 [운영 배포 문서](docs/DEPLOYMENT.md)를 참고합니다.

현재 운영 배포는 `main` push 또는 수동 `workflow_dispatch`로 실행됩니다. Git SHA 기반 ECR 태그가 이미 있으면 기존 불변 태그를 재사용하고 digest로 배포하므로 같은 commit을 안전하게 다시 실행할 수 있습니다. 운영 프로필의 구조와 기본 정책은 저장소의 `application-prod.yml`로 추적하고, 비민감 기능 설정은 GitHub Repository Variable, 비밀값은 Parameter Store SecureString으로 분리합니다. `.env.example`은 로컬 실행에 필요한 변수 계약이며 운영 비밀값의 저장소가 아닙니다.

운영 확인 경로는 다음과 같습니다.

```text
https://d1ra74et9h0ohu.cloudfront.net
https://d1ra74et9h0ohu.cloudfront.net/swagger-ui.html
https://d1ra74et9h0ohu.cloudfront.net/nginx-health
https://d1ra74et9h0ohu.cloudfront.net/actuator/health/readiness
```

CloudFront 기본 도메인의 루트는 `200 OK` 안내 페이지를 반환하며 Swagger UI와 readiness로 이동할 수 있는 링크를 제공합니다. EC2의 HTTP 80은 CloudFront 원본 요청에만 허용하고 Spring Boot의 8080 포트는 외부에 공개하지 않습니다. 운영 비밀값은 GitHub 변수나 저장소가 아니라 EC2 instance role이 Parameter Store SecureString에서 직접 읽습니다.

사용자 업로드 이미지는 비공개 S3 버킷에 저장하며, `https://d1p2ierkew26r1.cloudfront.net`에서 서명된 URL로만 조회합니다. S3 직접 접근과 서명 없는 CloudFront 접근은 허용하지 않습니다.

인증된 사용자는 `POST /api/v1/images/upload-requests`에서 5분 유효한 Presigned POST 정보를
발급받아 JPEG, PNG, WebP 이미지를 최대 5 MiB까지 S3로 직접 업로드할 수 있습니다. S3 업로드는
응답의 `uploadUrl`과 `uploadFields`를 `FormData`로 전송한 뒤 완료 API를 호출하는 방식입니다. 자세한
계약은 [API 명세](docs/API_SPEC.md)를 참고합니다.

운영 프로필의 분석 생성은 완료된 S3 이미지의 `imageId`를 JSON body로 전달해야 합니다.
기존 multipart 분석 요청은 로컬 프로필에서만 파일을 저장하며 운영에서는 `ANALYSIS400_3`으로
거절합니다.

## Security

JWT 기반 인증을 사용합니다. `SecurityConfig`에서 다음 경로를 인증 없이 허용합니다.

- Swagger/OpenAPI와 Actuator health 경로
- 회원가입·로그인·토큰 재발급/교환·비밀번호 재설정 경로
- 카카오 로그인 경로(`/api/v1/auth/oauth2/**`, `/api/v1/auth/callback/**`)
- 읽기 전용 공개 API의 `GET`: `/api/v1/trends/**`, `/api/v1/tags/**`, `/api/v1/content-search`, `/api/v1/lookbooks`, `/api/v1/lookbooks/*`

명시되지 않은 요청은 인증과 `ROLE_USER` 또는 `ROLE_ADMIN` 권한이 필요합니다. 룩북의
생성·수정·삭제·좋아요처럼 상태를 변경하는 요청도 인가 대상이며, 리포트·이미지·알림·저장
상품 등 회원 리소스는 서비스 계층에서 소유권을 추가로 검사합니다.
요청의 `Authorization: Bearer {accessToken}` 헤더는 `JwtAuthFilter`가 검증하여 인증 정보를 설정합니다.
REST API 기준으로 CSRF, Form Login, HTTP Basic은 비활성화되어 있으며, 세션은 `STATELESS`로 사용합니다.

로컬 프론트엔드 QA에서는 다음 Origin만 백엔드 CORS allowlist에 포함합니다.

```text
http://localhost:3000
http://localhost:5173
http://127.0.0.1:3000
http://127.0.0.1:5173
```

회원가입·로그인·토큰 재발급·카카오 임시 토큰 교환에서 access/refresh JWT는 응답 본문의
`data`에 발급합니다. 이후 인증 요청은 access token을 `Authorization: Bearer {accessToken}`
헤더로 보내며, refresh token은 재발급 API의 JSON body로 전달합니다. credential cookie는
허용하지 않습니다. 서버는 Refresh Token 원문을 저장하지 않고 용도 문자열을 포함한
HMAC-SHA256 해시만 저장·검증합니다. 재발급에 성공하면 access/refresh token을 함께 회전하고,
로그아웃과 비밀번호 재설정은 저장된 Refresh Token 해시를 제거합니다. V31 배포 시 기존 원문
Refresh Token은 모두 폐기되므로 기존 로그인 사용자는 한 번 재로그인해야 합니다.
운영 프로필의 Spring CORS allowlist는 comma-separated `APP_CORS_ALLOWED_ORIGINS` 환경변수로
주입합니다. GitHub Repository Variable을 변경한 경우 새 production 배포가 필요합니다.
배포 후에는 allowlist에 포함된 로컬 프론트엔드 Origin으로 로그인 OPTIONS preflight와 POST 응답의
`Access-Control-Allow-Origin`을 확인합니다. Spring 애플리케이션 직접 경로는 성공하지만
CloudFront 경유 요청만 실패하면 CloudFront의 Origin 요청 헤더 전달 및 OPTIONS 캐시 정책을
별도로 확인합니다. 운영 프론트엔드 Origin 추가는 이 로컬 QA 허용 범위에 포함하지 않습니다.
이 설정은 S3 이미지 업로드 CORS 또는 EC2 보안 그룹 설정과는 무관합니다.

카카오 소셜 로그인은 Spring OAuth2 Client 기반의 백엔드 주도 리다이렉트 방식입니다. `GET /api/v1/auth/oauth2/kakao`로 시작하면 카카오 인증 페이지로 리다이렉트되고, 콜백(`/api/v1/auth/callback/kakao`) 처리 후 프론트 URL(`FRONT_REDIRECT_URI`)로 일회용 임시 토큰 또는 에러 코드를 전달합니다. access/refresh JWT는 임시 토큰을 `POST /api/v1/auth/token/exchange`로 교환할 때 발급됩니다.

## 브랜치 컨벤션

```text
main
develop
feature/#{issue-number}-{feature-name}
fix/#{issue-number}-{fix-name}
chore/#{issue-number}-{task-name}
docs/#{issue-number}-{document-name}
```

예시:

```text
feature/#12-auth
fix/#34-login-error
chore/#56-ci-cleanup
docs/#78-api-spec
```

## 커밋 컨벤션

```text
feat: 새로운 기능 추가 및 기능 업데이트 커밋
refactor: 리팩터링 커밋
fix: 버그 수정 커밋
style: 코드 포맷팅 등 스타일 변경 커밋
docs: 문서 커밋
chore: 오타 수정 등 기타 커밋
test: 테스트 관련 커밋
build: 배포 커밋
ci: CI 설정 파일 및 스크립트 변경, GitHub Actions 설정 추가
```

## 협업 규칙

1. 이슈 템플릿을 활용해서 GitHub Issue를 먼저 생성합니다.
2. `develop` 브랜치에서 이슈 번호에 맞게 작업 브랜치를 생성합니다.
3. 이슈 범위 안에서만 작업하고 커밋은 의미 단위로 나눕니다.
4. 작업 완료 전 `./gradlew clean build`로 검증합니다.
5. [PR 템플릿](.github/pull_request_template.md)을 활용해서 `develop` 브랜치로 PR을 생성합니다.
6. 리뷰어를 지정하고 테스트 결과를 공유한 뒤 승인 후 merge합니다.

자세한 컨벤션은 `AGENTS.md`를 참고합니다.
