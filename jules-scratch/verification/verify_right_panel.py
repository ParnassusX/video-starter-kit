from playwright.sync_api import Page, expect, sync_playwright

def verify_right_panel(page: Page):
    """
    This test verifies that clicking the 'Generate' button
    opens the right-hand panel.
    """
    # 1. Arrange: Go to the application page.
    page.goto("http://localhost:3000/app")

    # 2. Act: Find the "Generate" button and click it.
    # Use exact=True to avoid ambiguity with "Generate Video" button
    generate_button = page.get_by_role("button", name="Generate", exact=True)
    expect(generate_button).to_be_visible()
    generate_button.click()

    # 3. Assert: Confirm the right panel is now visible.
    right_panel_heading = page.get_by_role("heading", name="Generate Media")
    expect(right_panel_heading).to_be_visible()

    # 4. Screenshot: Capture the final result for visual verification.
    page.screenshot(path="jules-scratch/verification/right_panel_verification.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_right_panel(page)
            print("Verification script ran successfully.")
        except Exception as e:
            print(f"Verification script failed: {e}")
        finally:
            browser.close()