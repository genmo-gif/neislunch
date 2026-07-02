import { useState } from 'react';
import './App.css';
import { EDUCATION_OFFICES } from './data/educationOffices';
import { searchSchools, getWeeklyMealInfo } from './api/neisApi';

function App() {
  const [selectedOffice, setSelectedOffice] = useState('');
  const [schoolSearchInput, setSchoolSearchInput] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [mealData, setMealData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);

  // 학교 검색
  const handleSearchSchools = async () => {
    if (!selectedOffice) {
      setError('시도교육청을 선택해주세요.');
      return;
    }

    if (!schoolSearchInput.trim()) {
      setError('학교명을 입력해주세요.');
      return;
    }

    setSearchLoading(true);
    setError('');
    setSearchResults([]);

    try {
      const results = await searchSchools(selectedOffice, schoolSearchInput);
      if (results.length === 0) {
        setError('검색 결과가 없습니다. 다시 확인해주세요.');
      } else {
        setSearchResults(results);
      }
    } catch (err) {
      setError(err.message || '학교 검색 중 오류가 발생했습니다.');
    } finally {
      setSearchLoading(false);
    }
  };

  // 학교 선택
  const handleSelectSchool = (school) => {
    setSelectedSchool(school);
    setSearchResults([]);
    setError('');
  };

  // 급식 조회
  const handleFetchMeals = async () => {
    if (!selectedOffice) {
      setError('시도교육청을 선택해주세요.');
      return;
    }

    if (!selectedSchool) {
      setError('학교를 선택해주세요.');
      return;
    }

    if (!selectedDate) {
      setError('조회 기준일을 선택해주세요.');
      return;
    }

    setLoading(true);
    setError('');
    setMealData([]);

    try {
      const date = new Date(selectedDate);
      const meals = await getWeeklyMealInfo(selectedOffice, selectedSchool.code, date);
      if (meals.length === 0) {
        setError('해당 주의 급식 정보가 없습니다.');
      } else {
        setMealData(meals);
      }
    } catch (err) {
      setError(err.message || '급식 정보 조회 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="header">
        <h1>🍽️ 학교 급식 조회</h1>
        <p>NEIS Open API를 이용한 급식 정보 검색</p>
      </header>

      <main className="container">
        <div className="layout">
        {/* 검색 폼 */}
        <div className="search-section search-col">
          <div className="form-group">
            <label htmlFor="office-select">시도교육청 *</label>
            <select
              id="office-select"
              value={selectedOffice}
              onChange={(e) => {
                setSelectedOffice(e.target.value);
                setSelectedSchool(null);
                setSearchResults([]);
                setError('');
              }}
              className="form-control"
            >
              <option value="">선택하세요</option>
              {EDUCATION_OFFICES.map((office) => (
                <option key={office.code} value={office.code}>
                  {office.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="school-input">학교명 검색 *</label>
            <div className="school-search">
              <input
                id="school-input"
                type="text"
                value={schoolSearchInput}
                onChange={(e) => setSchoolSearchInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSearchSchools();
                  }
                }}
                placeholder="학교명을 입력하세요"
                className="form-control"
                disabled={!selectedOffice}
              />
              <button
                onClick={handleSearchSchools}
                disabled={!selectedOffice || !schoolSearchInput.trim() || searchLoading}
                className="btn btn-search"
              >
                {searchLoading ? '검색 중...' : '검색'}
              </button>
            </div>

            {/* 검색 결과 */}
            {searchResults.length > 0 && (
              <div className="search-results">
                <p className="results-label">검색 결과 ({searchResults.length}개)</p>
                <ul className="results-list">
                  {searchResults.map((school, index) => (
                    <li key={index}>
                      <button
                        onClick={() => handleSelectSchool(school)}
                        className="result-item"
                      >
                        <strong>{school.name}</strong>
                        {school.address && (
                          <small className="address">{school.address}</small>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 선택된 학교 표시 */}
            {selectedSchool && (
              <div className="selected-school">
                <p>
                  <strong>선택된 학교:</strong> {selectedSchool.name}
                  <button
                    onClick={() => {
                      setSelectedSchool(null);
                      setSchoolSearchInput('');
                      setMealData([]);
                    }}
                    className="btn-remove"
                  >
                    ✕
                  </button>
                </p>
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="date-input">조회 기준일 *</label>
            <input
              id="date-input"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="form-control"
            />
          </div>

          <button
            onClick={handleFetchMeals}
            disabled={!selectedOffice || !selectedSchool || !selectedDate || loading}
            className="btn btn-primary"
          >
            {loading ? '조회 중...' : '조회'}
          </button>
        </div>

        {/* 결과 영역 */}
        <div className="results-col">
          {error && (
            <div className="error-message">
              <strong>⚠️ {error}</strong>
            </div>
          )}

          {mealData.length > 0 ? (
            <div className="meal-section">
              <h2>이 주의 중식 급식 ({mealData.length}일)</h2>
              <div className="meal-list">
                {mealData.map((meal, index) => (
                  <div key={index} className="meal-card">
                    <h3 className="meal-date">{meal.date}</h3>
                    <div className="meal-content">
                      <div className="menu-section">
                        <h4>메뉴</h4>
                        {meal.menu && meal.menu.length > 0 ? (
                          <ul className="menu-list">
                            {meal.menu.map((item, idx) => (
                              <li key={idx}>{item}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="no-data">메뉴 정보가 없습니다.</p>
                        )}
                      </div>
                      {meal.calorie && meal.calorie !== 'N/A' && (
                        <div className="calorie-section">
                          <h4>칼로리</h4>
                          <p>{meal.calorie}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            !error && (
              <div className="empty-state">
                <p>왼쪽에서 학교를 선택하고 급식을 조회해보세요.</p>
              </div>
            )
          )}
        </div>
        </div>
      </main>

      <footer className="footer">
        <p>NEIS Open API 기반 | ©2024</p>
      </footer>
    </div>
  );
}

export default App;
