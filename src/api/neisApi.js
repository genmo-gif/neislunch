const API_KEY = '3aeace82f952472ab2151a44cf0e736b';
const BASE_URL = 'https://open.neis.go.kr/hub';

/**
 * 학교 검색
 * @param {string} atptOfcdcScCode - 교육청 코드
 * @param {string} schoolName - 학교명
 * @returns {Promise<Array>} 학교 목록
 */
export async function searchSchools(atptOfcdcScCode, schoolName) {
  try {
    const params = new URLSearchParams({
      KEY: API_KEY,
      TYPE: 'json',
      ATPT_OFCDC_SC_CODE: atptOfcdcScCode,
      SCHUL_NM: schoolName,
    });

    const response = await fetch(`${BASE_URL}/schoolInfo?${params}`);
    const data = await response.json();

    // schoolInfo[1].row 구조 처리
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

/**
 * 주간 급식 정보 조회
 * @param {string} atptOfcdcScCode - 교육청 코드
 * @param {string} sdSchulCode - 학교 코드
 * @param {Date} date - 조회 기준일
 * @returns {Promise<Array>} 주간 급식 데이터
 */
export async function getWeeklyMealInfo(atptOfcdcScCode, sdSchulCode, date) {
  try {
    // 주어진 날짜가 포함된 주의 월요일 구하기
    const monday = getMondayOfWeek(date);
    const friday = new Date(monday);
    friday.setDate(friday.getDate() + 4);

    // 월요일~금요일의 급식 데이터 수집
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

    // 날짜별로 정렬
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

/**
 * 특정 날짜의 급식 정보 조회
 * @param {string} atptOfcdcScCode - 교육청 코드
 * @param {string} sdSchulCode - 학교 코드
 * @param {Date} date - 조회 날짜
 * @returns {Promise<Array>} 급식 데이터
 */
async function getMealInfo(atptOfcdcScCode, sdSchulCode, date) {
  try {
    const dateString = formatDateForAPI(date);

    const params = new URLSearchParams({
      KEY: API_KEY,
      TYPE: 'json',
      ATPT_OFCDC_SC_CODE: atptOfcdcScCode,
      SD_SCHUL_CODE: sdSchulCode,
      MLSV_YMD: dateString,
      MMEAL_SC_CODE: '2', // 2 = 중식
    });

    const response = await fetch(`${BASE_URL}/mealServiceDietInfo?${params}`);
    const data = await response.json();

    // mealServiceDietInfo[1].row 구조 처리
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

/**
 * 주어진 날짜가 속한 주의 월요일 구하기
 */
function getMondayOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

/**
 * Date를 API 요청용 형식(YYYYMMDD)으로 변환
 */
function formatDateForAPI(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

/**
 * Date를 디스플레이 형식으로 변환
 */
function formatDateDisplay(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
  const dayName = dayNames[date.getDay()];
  return `${year}.${month}.${day}(${dayName})`;
}

/**
 * 메뉴 문자열 파싱 (번호 제거, 정렬 등)
 */
function parseMenuString(menuString) {
  if (!menuString) return [];
  
  // "(번호)." 형식의 번호 제거
  const items = menuString
    .split('<br/>')
    .map(item => item.trim())
    .filter(item => item.length > 0)
    .map(item => {
      // "(1)", "(2)" 등의 번호 제거
      return item.replace(/^\(\d+\)\s*/, '').trim();
    });

  return items;
}
