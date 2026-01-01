"""
Pytest configuration for VAPI Demo Builder tests

Provides fixtures for Playwright browser testing
"""

import pytest
from playwright.sync_api import sync_playwright
import subprocess
import time
import os
import signal


@pytest.fixture(scope="session")
def server():
    """Start FastAPI server for testing"""
    # Start server in background
    env = os.environ.copy()
    env.update({
        "ASSISTANT_ID": "test-assistant-id",
        "PUBLIC_KEY": "test-public-key", 
        "VAPI_PRIVATE_KEY": "test-private-key"
    })
    
    process = subprocess.Popen(
        ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"],
        env=env,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )
    
    # Wait for server to start
    time.sleep(3)
    
    yield process
    
    # Cleanup: stop server
    process.terminate()
    try:
        process.wait(timeout=5)
    except subprocess.TimeoutExpired:
        process.kill()


@pytest.fixture(scope="session")
def playwright():
    """Start Playwright"""
    with sync_playwright() as p:
        yield p


@pytest.fixture(scope="session")  
def browser(playwright):
    """Launch browser"""
    browser = playwright.chromium.launch(headless=True)
    yield browser
    browser.close()


@pytest.fixture
def page(browser, server):
    """Create new page for each test"""
    context = browser.new_context(
        viewport={"width": 1280, "height": 720},
        ignore_https_errors=True
    )
    page = context.new_page()
    yield page
    context.close()
