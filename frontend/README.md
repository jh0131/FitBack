# FIT-BACK Frontend Repository

## 프로젝트 소개
* 목표: AI 기반의 가상 피팅 및 패션 분석 서비스 제공


## 팀원 및 역할 분담
* 이주은: 로그인 및 회원가입 페이지 구현, 검색바 및 카드 UI 컴포넌트 관리
* 김명주: 홈 화면 및 업로드 선택 시트, 이미지 업로드 페이지, 하단 탭바 및 플로팅 버튼 등 주요 기능 관리
* 인지환: AI 분석 대기/결과 페이지 및 태그 편집 기능, 프로그래스바 및 태그칩 컴포넌트 관리
* 성시훈: 룩북 업로드 및 마이 클로젯/마이페이지 구현, 공통 버튼 및 입력창 컴포넌트 관리
---

## 기술 스택
| 구분 | 기술 |
| :--- | :--- |
| **Language** | TypeScript |
| **Framework** | React |
| **Build Tool** | Vite |
| **Styling** | CSS, Tailwind CSS |
| **Version Control** | Git, GitHub |
| **Collaboration** | Notion, GitHub Issue, Pull Request |
## 브랜치 및 커밋 컨벤션
* 브랜치 전략:
    * main: 최종 제출 및 배포용 브랜치
    * dev: 개발 통합 브랜치
    * feature/기능명: 개인 기능 개발 브랜치
--- 
## 폴더 구조



```bash

src

├── assets          # 이미지, 아이콘 등 정적 파일

├── components      # 공통 컴포넌트

│   ├── common      # Button, Input 등 전역 공통 컴포넌트

│   ├── layout      # Header, TabBar, Layout 등 레이아웃 컴포넌트

│   └── domain      # 기능별 컴포넌트

├── pages           # 페이지 단위 컴포넌트

├── hooks           # 커스텀 훅

├── api             # API 요청 함수

├── store           # 전역 상태 관리

├── types           # TypeScript 타입 정의

├── constants       # 상수 관리

├── styles          # 전역 스타일

└── utils           # 공통 유틸 함수

```



---



## 실행 방법



```bash

git clone 레포지토리_URL

cd FIT-BACK-Frontend

npm install

npm run dev

```



---



## 브랜치 전략



| 브랜치         | 설명              |
| ----------- | --------------- |
| main        | 최종 제출 및 배포용 브랜치 |
| dev         | 개발 통합 브랜치       |
| feature/기능명 | 개인 기능 개발 브랜치    |



### 브랜치 생성 예시



```bash

feature/login

feature/signup

feature/home

feature/upload

feature/ai-result

feature/lookbook

feature/mypage

```



---



## Git 작업 흐름



1. `dev` 브랜치에서 최신 코드를 pull 받습니다.

2. 작업할 기능에 맞게 `feature/기능명` 브랜치를 생성합니다.

3. feature 브랜치에서 작업 후 commit, push 합니다.

4. 작업 완료 후 `dev` 브랜치로 Pull Request를 생성합니다.

5. 팀원 리뷰 후 merge합니다.

6. merge 완료 후 사용한 feature 브랜치는 삭제합니다.



```bash

git checkout dev

git pull origin dev

git checkout -b feature/login



git add .

git commit -m "feat: 로그인 페이지 UI 구현"

git push origin feature/login

```



---



## 커밋 컨벤션



커밋 메시지는 아래 형식을 따릅니다.



```bash

타입: 작업 내용

```



### 커밋 타입



| 타입       | 설명                      |
| -------- | ----------------------- |
| feat     | 새로운 기능 추가               |
| fix      | 버그 수정                   |
| refactor | 코드 리팩토링                 |
| style    | 코드 의미에 영향을 주지 않는 스타일 수정 |
| docs     | 문서 수정                   |
| chore    | 설정 파일, 패키지 관리 등 기타 작업   |
| test     | 테스트 코드 추가 및 수정          |
| build    | 빌드 관련 설정 수정             |
| ci       | CI/CD 관련 설정 수정          |



### 커밋 예시



```bash

feat: 로그인 페이지 UI 구현

feat: 이미지 업로드 페이지 구현

fix: 이미지 업로드 오류 수정

refactor: Button 컴포넌트 props 구조 개선

style: 마이페이지 레이아웃 여백 수정

docs: README 실행 방법 추가

chore: 폴더 구조 초기 세팅

```



---



## Issue 컨벤션



이슈 제목은 아래 형식을 따릅니다.



```bash

[타입] 작업 내용

```



### 이슈 제목 예시



```bash

[Feature] 로그인 페이지 구현

[Feature] 룩북 업로드 페이지 구현

[Fix] 이미지 업로드 오류 수정

[Refactor] 공통 버튼 컴포넌트 개선

```



### 이슈 포함 내용



```md

## 📌 작업 개요

- 구현할 기능 또는 수정할 내용을 간단히 작성합니다.



## ✅ 작업 세부 내용

- [ ] 작업할 내용을 체크리스트로 작성합니다.

- [ ] 필요한 컴포넌트 또는 페이지를 구현합니다.

- [ ] API 연동이 필요한 경우 요청/응답 구조를 확인합니다.



## 📎 참고 자료

- 디자인 시안, API 명세서, 참고 링크 등을 작성합니다.



## 👤 담당자

- 담당자를 작성합니다.



## 🎯 완료 조건

- 기능이 정상적으로 동작하는 기준을 작성합니다.

```



---



## PR 컨벤션



PR 제목은 아래 형식을 따릅니다.



```bash

[타입] 작업 내용

```



### PR 제목 예시



```bash

[feat] 로그인 페이지 구현

[feat] AI 분석 결과 페이지 구현

[fix] 이미지 업로드 오류 수정

[refactor] 공통 컴포넌트 구조 개선

```



---



## PR 본문 템플릿



```md

## 📝 작업 내용



- 이번 PR에서 작업한 내용을 작성합니다.

- 구현한 페이지, 컴포넌트, 기능을 구체적으로 작성합니다.

- 상태 관리, API 연동, 컴포넌트 분리 등 주요 구현 내용을 작성합니다.



## 🔍 관련 이슈



- close #이슈번호



## 🧪 테스트 결과



- [ ] 구현한 기능이 정상적으로 동작하는지 확인했습니다.

- [ ] 화면 이동이 정상적으로 동작하는지 확인했습니다.

- [ ] 입력값, 버튼 클릭, 예외 상황 등을 확인했습니다.

- [ ] 반응형 화면에서 레이아웃이 깨지지 않는지 확인했습니다.



## 📸 스크린샷



- 구현 화면 또는 변경된 화면을 첨부합니다.



## 💬 기타 참고 사항



- 리뷰어가 확인해야 할 내용이나 고민한 부분을 작성합니다.

- 추후 수정이 필요한 부분이 있다면 함께 작성합니다.

```



---







## PR 규칙



* 작업 완료 후 `dev` 브랜치로 Pull Request를 생성합니다.

* 최소 2명 이상의 팀원 리뷰 후 merge합니다.

* 충돌 발생 시 작업자가 직접 해결합니다.

* merge 완료 후 사용한 feature 브랜치는 삭제합니다.

* `main` 브랜치에는 직접 push하지 않습니다.

* 하나의 PR에는 하나의 기능 또는 하나의 작업 단위만 포함합니다.

* PR 본문에는 작업 내용, 관련 이슈, 테스트 결과를 반드시 작성합니다.

* UI 변경이 있는 경우 스크린샷 또는 화면 캡처를 첨부합니다.



---



## .gitignore 설정



프로젝트에는 아래 항목을 포함한 `.gitignore` 파일을 설정합니다.



```gitignore

node_modules

dist

.env

.env.local

.DS_Store

.vscode

.idea

npm-debug.log*

yarn-debug.log*

yarn-error.log*

```

---

## 공용 컴포넌트 관리
* Button/IconButton/TextInput: 성시훈 담당
* ProgressBar/TagChip/ImagePicker: 인지환 담당
* SearchBar/Card: 이주은 담당
* BottomSheet/FAB/TabBar/ListItem: 김명주 담당
* Layout: 전체 공통
  
## 화면 목록 및 플로우
* 로그인/회원가입: 앱 최초 진입 후 순차적 진행 (담당: 이주은)
* 홈/업로드/이미지 분석: 하단 FAB를 통해 진입 (담당: 김명주)
* AI 분석/태그/결과: 분석 완료에 따른 페이지 전환 (담당: 인지환)
* 룩북/마이페이지: 하단 탭바를 통해 이동 (담당: 성시훈)

---

## 반응형 / 레이아웃 전략
화면설계서가 앱(폰) 화면 기준으로 설계되어 있어, 데스크탑까지 완전 반응형으로 새로 설계하지 않고 **가로 상한을 둔 중앙 정렬 레이아웃(인스타/토스 웹 방식)**을 기본 전략으로 합니다.

* 콘텐츠 컨테이너 `max-width: 480px` 기준, 화면 중앙 정렬
* 480px 초과 영역(넓은 화면)은 배경으로 비워둠
* 하단 탭바 / FAB 등 앱 패턴 UI는 화면설계서 그대로 구현
* 컨테이너 내부에서는 상대 단위(%, rem)로 반응형 적용
