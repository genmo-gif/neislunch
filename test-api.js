// 테스트 스크립트: 서울시 오금중학교 검증
const API_KEY = '3aeace82f952472ab2151a44cf0e736b';
const BASE_URL = 'https://open.neis.go.kr/hub';

async function searchSchools(atptOfcdcScCode, schoolName) {
  try {
    const params = new URLSearchParams({
      KEY: API_KEY,
      TYPE: 'json',
      ATPT_OFCDC_SC_CODE: atptOfcdcScCode,
      SCHUL_NM: schoolName,
    });

    const response = await fetch(`${BASE_URL}/schoolInfo?${params}`);
    const data = await response.json();

    if (data.schoolInfo && data.schoolInfo[1] && data.schoolInfo[1].row) {
      return data.schoolInfo[1].row.map(school => ({
        code: school.SD_SCHUL_CODE,
        name: school.SCHUL_NM,
        address: school.ORG_RDNMA,
      }));
    }

    return [];
  } catch (error) {
    console.error('학교 검색 오류:', error);
    throw new Error('학교 검색 중 오류가 발생했습니다.');
  }
}

async function getWeeklyMealInfo(atptOfcdcScCode, sdSchulCode, date) {
  try {
    const monday = getMondayOfWeek(date);
    const allMeals = [];

    for (let i = 0; i < 5; i++) {
      const currentDate = new Date(monday);
      currentDate.setDate(currentDate.getDate() + i);

      const meals = await getMealInfo(
        atptOfcdcScCode,
        sdSchulCode,
        currentDate
      );

      allMeals.push(...meals);
    }

    allMeals.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateA - dateB;
    });

    return allMeals;
  } catch (error) {
    console.error('급식 정보 조회 오류:', error);
    throw error;
  }
}

async function getMealInfo(atptOfcdcScCode, sdSchulCode, date) {
  try {
    const dateString = formatDateForAPI(date);

    const params = new URLSearchParams({
      KEY: API_KEY,
      TYPE: 'json',
      ATPT_OFCDC_SC_CODE: atptOfcdcScCode,
      SD_SCHUL_CODE: sdSchulCode,
      MLSV_YMD: dateString,
      MMEAL_SC_CODE: '2',
    });

    const response = await fetch(`${BASE_URL}/mealServiceDietInfo?${params}`);
    const data = await response.json();

    if (data.mealServiceDietInfo && data.mealServiceDietInfo[1] && data.mealServiceDietInfo[1].row) {
      return data.mealServiceDietInfo[1].row.map(meal => ({
        date: formatDateDisplay(new Date(dateString.slice(0, 4), parseInt(dateString.slice(4, 6)) - 1, dateString.slice(6, 8))),
        menu: parseMenuString(meal.DDISH_NM),
        calorie: meal.CAL_INFO ? meal.CAL_INFO.split('(')[0].trim() : 'N/A',
        nutrition: meal.NTR_INFO || '',
      }));
    }

    return [];
  } catch (error) {
    console.error('급식 정보 조회 오류:', error);
    return [];
  }
}

function getMondayOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

function formatDateForAPI(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

function formatDateDisplay(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
  const dayName = dayNames[date.getDay()];
  return `${year}.${month}.${day}(${dayName})`;
}

function parseMenuString(menuString) {
  if (!menuString) return [];

  const items = menuString
    .split('<br/>')
    .map(item => item.trim())
    .filter(item => item.length > 0)
    .map(item => {
      return item.replace(/^\(\d+\)\s*/, '').trim();
    });

  return items;
}

// 테스트 실행
async function runTests() {
  console.log('========== NEIS API 테스트 ==========\n');

  // 테스트 1: 서울시 오금중학교 검색
  console.log('테스트 1: 서울시 오금중학교 검색');
  console.log('호출: searchSchools("B10", "오금중학교")');
  try {
    const schools = await searchSchools('B10', '오금중학교');
    console.log('결과:', schools);
    const found = schools.find(s => s.code === '7130197' && s.name === '오금중학교');
    if (found) {
      console.log('✓ 검증 성공: 오금중학교 (코드: 7130197) 발견');
    } else {
      console.log('✗ 검증 실패: 오금중학교를 찾을 수 없음');
    }
  } catch (error) {
    console.error('✗ 오류:', error.message);
  }

  console.log('\n---\n');

  // 테스트 2: 오금중학교 이번 주 급식 조회
  console.log('테스트 2: 오금중학교 이번 주 급식 조회');
  console.log('호출: getWeeklyMealInfo("B10", "7130197", 오늘 날짜)');
  try {
    const today = new Date();
    const meals = await getWeeklyMealInfo('B10', '7130197', today);
    console.log(`결과: ${meals.length}일 급식 데이터 조회됨`);
    if (meals.length > 0) {
      console.log('✓ 검증 성공: 급식 데이터 조회됨');
      console.log('샘플 데이터:');
      console.log(meals[0]);
    } else {
      console.log('⚠ 경고: 급식 데이터가 없음 (주말일 수 있음)');
    }
  } catch (error) {
    console.error('✗ 오류:', error.message);
  }

  console.log('\n========== 테스트 완료 ==========');
}

// Node.js 환경에서 실행
if (typeof fetch === 'undefined') {
  console.log('fetch 함수가 정의되지 않았습니다. Node.js 18+ 또는 fetch 폴리필이 필요합니다.');
  process.exit(1);
}

runTests().catch(console.error);
