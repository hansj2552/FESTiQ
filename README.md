# FESTiQ — 전국 축제 탐색 및 여행 계획

한국관광공사 TourAPI의 축제 정보를 검색하고, 장소를 지도에서 확인하고, 관심 축제를 찜과 여행 계획에 저장하는 정적 웹앱입니다. 별도 빌드 과정 없이 GitHub Pages에 배포할 수 있습니다.

## 주요 기능

- 축제명·지역·시작일·주제 검색 및 필터, 일정·이름·지역 정렬
- 현재 필터 결과의 지역별 건수를 Chart.js 막대 차트로 표시
- 별도 HTML 화면: `index.html` 탐색, `favorites.html` 찜 목록, `detail.html` 상세·여행 계획
- 즐겨찾기와 여행 계획을 브라우저 `localStorage`에 저장
- 축제 소개, 공식 이미지, 주소, OpenStreetMap 주변 지도와 카카오맵 주소 검색 링크
- 로딩·오류·검색 결과 없음 상태 표시
- 인증키가 없을 때는 예시 자료를 `공식 자료 예시`로 표시하고, API 오류 때 데모로 자동 전환하지 않음

## TourAPI 설정

- 공공데이터포털 API: [한국관광공사_국문 관광정보 서비스_GW](https://www.data.go.kr/data/15101578/openapi.do)
- 축제 목록: `GET https://apis.data.go.kr/B551011/KorService2/searchFestival2`
- 상세 정보: `GET https://apis.data.go.kr/B551011/KorService2/detailCommon2`
- JSON 형식: `_type=json`
- 키: 공공데이터포털에서 활용 신청 후 승인된 일반 인증키(Decoding)를 앱의 **API 설정**에서 입력합니다.

정적 웹앱은 브라우저에서 직접 API를 호출하므로 인증키가 네트워크 요청에 포함됩니다. 저장소 파일에는 키를 넣지 마세요. 브라우저에서 JSON 응답을 읽을 수 있는지는 도메인별 CORS 설정에 따라 달라질 수 있으니 실제 키와 GitHub Pages 주소에서 확인해야 합니다. 키를 숨겨야 하는 공개 서비스는 서버리스 프록시가 필요합니다.

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
6. 배포가 끝나면 Settings → Pages의 `Visit site`에서 주소를 열고 화면을 확인합니다. 프로젝트 사이트 주소 형식은 `https://<GitHub아이디>.github.io/<저장소명>/`입니다.
7. `/`, `/favorites.html`, `/detail.html?id=demo-fest-002`를 각각 열어 확인한 뒤 실제 Pages URL과 `FESTiQ_과제설명.pptx`를 과제 제출란에 냅니다.

## 파일 구성

```text
FESTiQ/
├── index.html
├── favorites.html
├── detail.html
├── FESTiQ_과제설명.pptx
├── README.md
└── assets/
    ├── app.js
    └── styles.css
```
