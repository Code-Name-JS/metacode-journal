"""베스트 상품 페이지 렌더링/상호작용 자동 검증 + 스크린샷 (로컬 서버 대상)"""
import json
from playwright.sync_api import sync_playwright

BASE = "http://127.0.0.1:8123"
OUT = "/home/user/best-products"
result = {}
issues = []

with sync_playwright() as p:
    b = p.chromium.launch()
    ctx = b.new_context(viewport={"width": 1440, "height": 950}, device_scale_factor=2)
    page = ctx.new_page()
    page.on("console", lambda m: issues.append(f"[console.{m.type}] {m.text}") if m.type == "error" else None)
    page.on("pageerror", lambda e: issues.append(f"[pageerror] {e}"))

    page.goto(BASE + "/index.html", wait_until="networkidle")
    page.wait_for_selector(".card", timeout=20000)

    result["cards_initial"] = page.locator(".card").count()
    result["hero_stats"] = [
        page.locator("#stat-count").inner_text(),
        page.locator("#stat-category").inner_text(),
        page.locator("#stat-updated").inner_text(),
    ]
    result["result_count_text"] = page.locator("#result-count").inner_text()
    result["rank_badges_first3"] = page.locator(".rank-badge").nth(0).inner_text() + "/" + \
        page.locator(".rank-badge").nth(1).inner_text() + "/" + page.locator(".rank-badge").nth(2).inner_text()
    result["title_first"] = page.locator(".card .card-title").first.inner_text()
    result["price_first"] = page.locator(".card .price").first.inner_text()
    result["discount_first"] = page.locator(".card .discount").first.inner_text()
    result["tab_count"] = page.locator(".tab").count()
    result["tab_labels"] = page.locator(".tab").all_inner_texts()

    page.select_option("#sort-select", "priceAsc")
    page.wait_for_timeout(350)
    result["lowest_price_after_sort"] = page.locator(".card .price").first.inner_text()

    page.select_option("#sort-select", "rating")
    page.wait_for_timeout(350)
    result["top_rating_after_sort"] = page.locator(".card .rating-row b").first.inner_text()

    page.select_option("#sort-select", "rank")
    page.wait_for_timeout(250)

    page.click('.tab[data-category="beauty"]')
    page.wait_for_timeout(350)
    result["cards_beauty"] = page.locator(".card").count()
    result["beauty_chips_unique"] = sorted(set(page.locator(".card .chip").all_inner_texts()))
    page.click('.tab[data-category="all"]')
    page.wait_for_timeout(250)

    page.fill("#search-input", "세럼")
    page.wait_for_timeout(500)
    result["cards_search_serum"] = page.locator(".card").count()
    result["search_result_titles"] = page.locator(".card .card-title").all_inner_texts()

    page.fill("#search-input", "zzzz")
    page.wait_for_timeout(500)
    result["empty_state_visible"] = page.locator("#empty-state").is_visible()
    page.click("#reset-btn")
    page.wait_for_timeout(400)
    result["cards_after_reset"] = page.locator(".card").count()

    page.locator(".card .wish-btn").first.click()
    page.wait_for_timeout(300)
    result["wish_aria_pressed"] = page.locator(".card .wish-btn").first.get_attribute("aria-pressed")
    result["wish_icon_glyph"] = page.locator(".card .wish-btn").first.inner_text()

    page.screenshot(path=f"{OUT}/shot-1-desktop.png", full_page=True)

    page.locator(".card .primary-btn").first.click()
    page.locator(".card .primary-btn").nth(1).click()
    page.locator(".card .primary-btn").nth(1).click()
    page.wait_for_timeout(400)
    result["cart_badge_after_add"] = page.locator("#cart-count").inner_text()

    page.click("#cart-btn")
    page.wait_for_timeout(700)
    result["drawer_aria_hidden_open"] = page.locator("#cart-drawer").get_attribute("aria-hidden")
    result["cart_line_count"] = page.locator(".cart-line").count()
    result["cart_total"] = page.locator("#cart-total").inner_text()
    result["cart_qty"] = page.locator("#cart-qty").inner_text()
    page.screenshot(path=f"{OUT}/shot-3-cart-drawer.png")

    page.locator(".qty-box button").nth(1).click()
    page.wait_for_timeout(350)
    result["cart_total_after_plus"] = page.locator("#cart-total").inner_text()
    page.click("#drawer-close")
    page.wait_for_timeout(500)
    result["drawer_aria_hidden_closed"] = page.locator("#cart-drawer").get_attribute("aria-hidden")

    result["localstorage_keys"] = page.evaluate("Object.keys(localStorage)")
    page.reload(wait_until="networkidle")
    page.wait_for_selector(".card")
    result["cart_badge_after_reload"] = page.locator("#cart-count").inner_text()
    result["wish_after_reload"] = page.locator(".card .wish-btn").first.get_attribute("aria-pressed")

    ctx2 = b.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2, is_mobile=True)
    mp = ctx2.new_page()
    mp.goto(BASE + "/index.html", wait_until="networkidle")
    mp.wait_for_selector(".card")
    result["mobile_cards"] = mp.locator(".card").count()
    mp.screenshot(path=f"{OUT}/shot-2-mobile.png", full_page=True)

    b.close()

result["console_errors"] = issues
print(json.dumps(result, ensure_ascii=False, indent=2))
