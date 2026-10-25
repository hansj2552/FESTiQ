# FESTiQ — 전국 축제 탐색 및 여행 계획

한국관광공사 TourAPI의 축제 정보를 검색하고, 장소를 지도에서 확인하고, 관심 축제를 찜과 여행 계획에 저장하는 정적 웹앱입니다. 별도 빌드 과정 없이 GitHub Pages에 배포할 수 있습니다.

## 주요 기능

- 축제명·지역·시작일·주제 검색 및 필터, 일정·이름·지역 정렬
- 현재 필터 결과의 지역별 건수를 Chart.js 막대 차트로 표시
- 별도 HTML 화면: `index.html` 탐색, `favorites.html` 찜 목록, `detail.html` 상세·여행 계획
- 즐겨찾기와 여행 계획을 브라우저 `localStorage`에 저장
- 축제 소개, 공식 이미지, 주소, OpenStreetMap 주변 지도와 카카오맵 주소 검색 링크
- 로딩·오류·검색 결과 없음 상태 표시
- 공개 사이트는 GitHub Actions가 TourAPI에서 받아 저장한 JSON 자료를 기본으로 사용
- 첫 데이터 갱신 전에는 5개 예시 자료만 `공식 자료 예시`로 표시
- 브라우저 직접 조회도 선택적으로 지원하며, 오류 때 데모로 자동 전환하지 않음

## TourAPI 설정

- 공공데이터포털 API: [한국관광공사_국문 관광정보 서비스_GW](https://www.data.go.kr/data/15101578/openapi.do)
- 축제 목록: `GET https://apis.data.go.kr/B551011/KorService2/searchFestival2`
- 상세 정보: `GET https://apis.data.go.kr/B551011/KorService2/detailCommon2`
- JSON 형식: `_type=json`
- 키: 공공데이터포털에서 활용 신청 후 승인된 일반 인증키(Decoding)를 GitHub 저장소의 Actions secret으로 등록합니다.

공개 사이트의 기본 데이터는 GitHub Actions가 비밀 값으로 인증해 받아 `assets/festivals.json`에 저장합니다. 키는 저장소 파일과 공개 웹페이지에 들어가지 않습니다. `scripts/fetch-festivals.mjs`가 최근 30일 안에 시작했거나 앞으로 시작하는 축제를 최대 1,000건까지 조회합니다. Actions는 매주 실행되며 수동 실행도 지원합니다. Pages가 `main` 브랜치 루트를 배포하므로 JSON 변경이 커밋되면 사이트가 다시 배포됩니다.

브라우저의 **API 설정**은 개인 확인용 직접 조회 기능입니다. 이 방식의 키는 해당 브라우저에만 저장되고 네트워크 요청에는 포함됩니다. 공개 사이트의 기본 자료를 갱신할 때는 저장소의 Actions secret 방식을 사용하세요. 인증키를 채팅, PPT, HTML, JS 또는 공개 저장소에 넣지 마세요.

### 첫 실시간 자료 게시

1. 저장소 **Settings → Secrets and variables → Actions → New repository secret**으로 이동합니다.
2. Name에 `TOURAPI_SERVICE_KEY`, Secret에 공공데이터포털의 일반 인증키(Decoding)를 입력해 저장합니다.
3. 저장소 **Actions → Refresh TourAPI festival data → Run workflow → Run workflow**를 누릅니다.
4. 실행이 성공하면 `assets/festivals.json`이 생성되어 `main`에 저장됩니다. Pages 재배포가 끝나면 사이트 상단에 `TourAPI 자료`와 갱신 시각이 표시되고, 실제 목록과 지역 차트가 나타납니다.

Secret을 등록하기 전에는 사이트가 실제 자료인 척하지 않고, 예시 5건과 데이터 준비 안내를 표시합니다.

데모 축제 5건은 한국관광공사 축제 안내 페이지를 바탕으로 구성한 예시이며 TourAPI의 실시간 응답이 아닙니다. 일정은 해마다 달라질 수 있으므로 실제 방문 전에 공식 안내를 확인하세요. 지도 핀은 행사 주소 또는 행사장 랜드마크를 기준으로 한 대표 위치이며, 넓은 행사 구역 전체를 나타내지는 않습니다.

## 로컬에서 열기

`index.html`을 브라우저에서 열면 데모 모드가 표시됩니다. API를 시험할 때는 간단한 정적 서버를 권합니다.

```powershell
py -m http.server 8000
```

브라우저에서 `http://localhost:8000/FESTiQ/`를 엽니다.

## GitHub Pages 배포

1. GitHub에서 새 저장소를 만들고 저장소 공개 범위를 `Public`으로 선택합니다.
2. 이 폴더의 **내용물**을 저장소 최상위에 업로드합니다. `index.html`, `detail.html`, `favorites.html`, `assets/`가 최상위에 있어야 합니다.
3. 저장소 **Settings → Pages**로 이동합니다.
4. **Build and deployment → Source**에서 `Deploy from a branch`를 선택합니다.
5. Branch는 `main`, 폴더는 `/(root)`를 선택하고 저장합니다.
6. 배포가 끝나면 Settings → Pages의 `Visit site`에서 주소를 열고 화면을 확인합니다. 현재 프로젝트 주소는 `https://hansj2552.github.io/FESTiQ/`입니다.
7. Actions에서 첫 자료 갱신을 실행한 뒤 `/`, `/favorites.html`, `/detail.html?id=<축제contentid>`를 확인합니다. 제출할 때 Pages 주소와 `FESTiQ_과제설명_API연동.pptx`를 냅니다.

## 파일 구성

```text
FESTiQ/
├── index.html
├── favorites.html
├── detail.html
├── FESTiQ_과제설명_API연동.pptx
├── README.md
├── scripts/
│   └── fetch-festivals.mjs
├── .github/
│   └── workflows/
│       └── refresh-festival-data.yml
└── assets/
    ├── app.js
    ├── styles.css
    └── festivals.json (Actions 실행 시 생성)
```
