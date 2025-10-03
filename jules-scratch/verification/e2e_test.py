from playwright.sync_api import Page, expect, sync_playwright

def e2e_test(page: Page):
    """
    This test performs an end-to-end test of the application.
    """
    # 1. Arrange: Go to the application page.
    page.goto("http://localhost:3000/app")

    # 2. Act: Create a new project.
    page.get_by_role("button", name="New Project").click()
    page.get_by_label("Name").fill("Test Project")
    page.get_by_label("Description").fill("This is a test project.")
    page.get_by_role("button", name="Create").click()

    # 3. Open the right panel and generate a video.
    page.get_by_role("button", name="Generate", exact=True).click()
    page.get_by_role("heading", name="Generate Media").wait_for()
    page.get_by_role("textbox").fill("a cat dancing")
    page.get_by_role("button", name="Generate Video").click()

    # 4. Wait for the video to be generated and appear in the media library.
    # This will take some time, so we'll wait for a while.
    page.wait_for_timeout(30000)

    # 5. Click on the video to preview it.
    page.locator(".media-item").first.click()

    # 6. Screenshot: Capture the final result for visual verification.
    page.screenshot(path="jules-scratch/verification/e2e_test.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            e2e_test(page)
            print("E2E test script ran successfully.")
        except Exception as e:
            print(f"E2E test script failed: {e}")
        finally:
            browser.close()