from playwright.sync_api import Page, expect, sync_playwright

def verify_ui(page: Page):
    """
    This test captures screenshots of the landing page and the main application page
    for visual verification.
    """
    # 1. Arrange: Go to the landing page.
    page.goto("http://localhost:3000/")
    page.wait_for_load_state("networkidle")
    page.screenshot(path="jules-scratch/verification/landing_page.png")

    # 2. Act: Go to the main application page.
    page.goto("http://localhost:3000/app")
    page.wait_for_load_state("networkidle")
    page.screenshot(path="jules-scratch/verification/app_page.png")


if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_ui(page)
            print("Verification script ran successfully.")
        except Exception as e:
            print(f"Verification script failed: {e}")
        finally:
            browser.close()