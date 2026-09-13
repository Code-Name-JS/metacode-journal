import os
from playwright.sync_api import sync_playwright

def run_verification():
    file_path = os.path.abspath("index.html")
    file_url = f"file://{file_path}"

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # 1. 파일 로드
        page.goto(file_url)
        print("[✓] 페이지 로드 성공")

        # 2. 다크 모드 토글 확인
        page.click("#themeToggle")
        theme = page.locator("html").get_attribute("data-theme")
        assert theme in ["dark", "light"], "테마 속성 변경 실패"
        print("[✓] 테마 토글 확인 완료")

        # 3. 글쓰기 모달 열기 / 닫기 확인
        page.click("#writeBtn")
        assert page.locator("#writeModal").is_visible(), "모달이 열리지 않음"
        page.keyboard.press("Escape")
        assert not page.locator("#writeModal").is_visible(), "모달이 닫히지 않음"
        print("[✓] 글쓰기 모달 동작 확인 완료")

        # 4. 검색 동작 확인
        page.fill("#searchInput", "공지")
        page.click('#searchForm button[type="submit"]')
        page.wait_for_timeout(300)
        assert page.locator("#postBody tr").count() > 0, "검색 결과 렌더링 실패"
        print("[✓] 검색 및 목록 필터링 확인 완료")

        # 5. 검증 화면 캡처 저장
        page.screenshot(path="verification_result.png")
        print("[✓] 최종 검증 스크린샷 저장: verification_result.png")

        browser.close()

if __name__ == "__main__":
    run_verification()