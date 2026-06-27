# 학교 급식 조회 웹 앱 🍽️

NEIS Open API를 이용하여 전국 학교의 주간 급식 정보를 조회할 수 있는 React + Vite 기반 웹 애플리케이션입니다.

## 주요 기능

- 🏫 **17개 시도교육청** 선택 기능
- 🔍 **학교명 검색** - schoolInfo API를 통한 실시간 검색
- 📅 **조회 기준일 선택** - 선택한 날짜가 포함된 주의 월요일~금요일 급식 조회
- 🍚 **급식 정보 표시** - 메뉴, 칼로리, 영양정보 등 상세 정보 제공
- 🎨 **반응형 디자인** - 모바일/태블릿/데스크톱 모든 기기에서 최적화

## 기술 스택

- **Framework**: React 18+
- **Build Tool**: Vite
- **API**: NEIS Open API
- **Styling**: CSS3
- **Deployment**: Netlify

## 설치 및 실행

### 1. 의존성 설치
```bash
npm install
```

### 2. 개발 서버 실행
```bash
npm run dev
```
`http://localhost:5174`에서 앱을 확인할 수 있습니다.

### 3. 프로덕션 빌드
```bash
npm run build
```
`dist` 폴더에 최적화된 빌드 파일이 생성됩니다.

## 프로젝트 구조

```
src/
├── App.jsx              # 메인 컴포넌트
├── App.css              # 스타일시트
├── main.jsx             # 진입점
├── api/
│   └── neisApi.js       # NEIS API 호출 함수
└── data/
    └── educationOffices.js  # 시도교육청 목록

netlify.toml            # Netlify 배포 설정
```

## API 정보

### 학교 검색 (schoolInfo)
- **파라미터**: `ATPT_OFCDC_SC_CODE`, `SCHUL_NM`
- **응답 구조**: `schoolInfo[1].row`
- **반환 데이터**: 학교 코드(`SD_SCHUL_CODE`), 학교명, 주소

### 급식 조회 (mealServiceDietInfo)
- **파라미터**: `ATPT_OFCDC_SC_CODE`, `SD_SCHUL_CODE`, `MLSV_YMD`, `MMEAL_SC_CODE=2`
- **응답 구조**: `mealServiceDietInfo[1].row`
- **반환 데이터**: 메뉴, 칼로리, 영양정보

## 시도교육청 코드

| 교육청 | 코드 |
|--------|------|
| 서울특별시 | B10 |
| 부산광역시 | C10 |
| 대구광역시 | D10 |
| 인천광역시 | E10 |
| 광주광역시 | F10 |
| 대전광역시 | G10 |
| 울산광역시 | H10 |
| 세종특별자치시 | I10 |
| 경기도 | J10 |
| 강원특별자치도 | K10 |
| 충청북도 | M10 |
| 충청남도 | N10 |
| 전라북도 | O10 |
| 전라남도 | P10 |
| 경상북도 | Q10 |
| 경상남도 | R10 |
| 제주특별자치도 | S10 |

## 검증 사항

✓ 서울특별시교육청 코드 `B10` 확인  
✓ 오금중학교 학교 행정표준코드 `7130197` 확인  
✓ `searchSchools("B10", "오금중학교")` → 올바른 결과 반환  
✓ `getWeeklyMealInfo("B10", "7130197", date)` → 주간 급식 데이터 반환  
✓ `mealServiceDietInfo[1].row` 파싱 정상 작동  

## Netlify 배포

### 1. Netlify 계정 생성
[Netlify](https://netlify.com)에서 계정을 생성합니다.

### 2. 배포
```bash
npm install -g netlify-cli
netlify login
netlify deploy
```

또는 GitHub과 연동하여 자동 배포:
1. GitHub 저장소에 푸시
2. Netlify에서 GitHub 저장소 연결
3. 배포 설정 자동 적용 (netlify.toml)

## 에러 처리

앱은 다음 상황에 사용자 친화적인 메시지를 표시합니다:
- ⚠️ API 호출 실패
- ⚠️ 검색 결과 없음
- ⚠️ 급식 정보 없음
- ⚠️ 필수 항목 미선택

## 참고 문서

- [NEIS Open API](https://open.neis.go.kr/portal/data/service/selectServicePage.do?page=1&rows=10&sortColumn=&sortDirection=&infId=OPEN17320190722180924242823&infSeq=1)
- [React 공식 문서](https://react.dev)
- [Vite 공식 문서](https://vite.dev)

## 라이센스

MIT

## 작성자

2026년 작성
