const { test, expect } = require('@playwright/test');
const path = require('path');

test.describe('Activity Tracker Widget Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the demo page before each test
    await page.goto(`file://${path.resolve(__dirname, '../demo/index.html')}`);
    
    // Wait for the widget to be present
    await page.waitForSelector('.activity-tracker-widget');
  });

  test('timeline header information', async ({ page }) => {
    // Open the timeline
    await page.click('.activity-tracker-button');
    
    // Wait for timeline to be visible
    const timeline = page.locator('.activity-tracker-timeline');
    await expect(timeline).toHaveClass(/expanded/);
    
    // Check header elements
    const header = page.locator('.timeline-header');
    await expect(header.locator('h3')).toContainText('Activity Timeline');
    
    // Get the div containing session info
    const sessionInfo = header.locator('div >> div'); // Get both session info divs
    
    // Check session ID
    const sessionIdDiv = sessionInfo.first();
    const sessionIdText = await sessionIdDiv.textContent();
    expect(sessionIdText).toMatch(/Session ID: session_\d+_\w+/);
    
    // Check start time
    const startTimeDiv = sessionInfo.nth(1);
    const startTimeText = await startTimeDiv.textContent();
    expect(startTimeText).toMatch(/Started: \d{1,2}:\d{2}:\d{2}/);
  });

  test('activity tracking display', async ({ page }) => {
    // Open timeline and wait for it to be visible
    await page.click('.activity-tracker-button');
    await expect(page.locator('.activity-tracker-timeline')).toHaveClass(/expanded/);
    
    // Get initial content
    const timelineContent = page.locator('.timeline-content');
    const initialHtml = await timelineContent.innerHTML();
    
    // Click the Shop Now button to generate activity
    await page.click('.btn-primary');
    
    // Wait a moment for the activity to be recorded
    await page.waitForTimeout(500);
    
    // Check that content has changed
    const updatedHtml = await timelineContent.innerHTML();
    expect(updatedHtml).not.toBe(initialHtml);
    
    await page.click('.activity-tracker-button');
    await expect(page.locator('.activity-tracker-timeline')).toHaveClass(/expanded/);


    // Verify basic structure exists
    const wrapper = page.locator('.timeline-wrapper');
    await expect(wrapper).toBeVisible();
    
    // Check the content contains the interaction
    const content = await wrapper.textContent();
    expect(content).toMatch(/button|click|interaction/i);
  });

  test('session statistics display', async ({ page }) => {
    // Open timeline and wait for it to be visible
    await page.click('.activity-tracker-button');
    await expect(page.locator('.activity-tracker-timeline')).toHaveClass(/expanded/);
    
    // Check session stats section exists
    const stats = page.locator('.session-stats');
    await expect(stats).toBeVisible();
    
    // Verify all stat elements are present with correct structure
    await expect(stats.locator('.stat')).toHaveCount(4);
    
    // Check each stat label
    const labels = stats.locator('.stat-label');
    const values = stats.locator('.stat-value');
    await expect(labels).toHaveCount(4);
    await expect(labels.nth(0)).toHaveText('Session Duration');
    await expect(labels.nth(1)).toHaveText('Pages Viewed');
    await expect(labels.nth(2)).toHaveText('Total Clicks');
    await expect(labels.nth(3)).toHaveText('Forms Submitted');
    
    // Store initial values
    const initialClicks = await values.nth(2).textContent();
    const initialViews = await values.nth(1).textContent();
    
    // Generate some activity
    await page.click('.btn-primary');
    await page.waitForTimeout(500);

    await page.click('.activity-tracker-button');
    await expect(page.locator('.activity-tracker-timeline')).toHaveClass(/expanded/);

    const new_values = stats.locator('.stat-value');
    
    // Verify click count increased
    const updatedClicks = await new_values.nth(2).textContent();
    expect(Number(updatedClicks)).toBe(Number(initialClicks) + 1);
    
    // Verify other stats format
    const durationValue = await new_values.nth(0).textContent();
    expect(durationValue).toMatch(/\d+ min/);
    
    const pageViewsValue = await new_values.nth(1).textContent();
    expect(Number(pageViewsValue)).toBeGreaterThanOrEqual(Number(initialViews) + 1);
  });

  test('timeline content scrolling', async ({ page }) => {
    // Open timeline
    await page.click('.activity-tracker-button');
    
    // Verify timeline content area is scrollable
    const content = page.locator('.timeline-content');
    await expect(content).toHaveCSS('overflow-y', 'auto');
    await expect(content).toHaveCSS('max-height', '350px');
  });

  test('should track page navigation', async ({ page }) => {
    // Open timeline and get initial content
    await page.click('.activity-tracker-button');
    await expect(page.locator('.activity-tracker-timeline')).toHaveClass(/expanded/);
    
    const initialContent = await page.locator('.timeline-wrapper').textContent();
    
    // Navigate to products page
    await page.click('a[href="products.html"]');
    await page.waitForTimeout(500);
    
    // Open timeline again
    await page.click('.activity-tracker-button');
    
    // Check that new content is present
    const newContent = await page.locator('.timeline-wrapper').textContent();
    expect(newContent).not.toBe(initialContent);
    expect(newContent).toMatch(/page|view|products/i);
  });

  test('should track button clicks in timeline', async ({ page }) => {
    // Open timeline
    await page.click('.activity-tracker-button');
    
    // Get initial timeline items
    const initialItems = await page.locator('.timeline-item').count();
    
    // Click the Shop Now button
    await page.click('.btn-primary');
    
    // Open timeline
    await page.click('.activity-tracker-button');
    
    // Should see new interaction entry
    const timelineItems = await page.locator('.timeline-item')
    const newCount = await timelineItems.count();
    expect(newCount).toBeGreaterThan(initialItems);
    
    // Verify the interaction details
    const latestEntry = await timelineItems.nth(newCount-2);
    await expect(latestEntry.locator('.event-title')).toContainText('Interaction');
    await expect(latestEntry.locator('.event-details')).toContainText('Clicked link: Shop Now');
  });

  test('should persist activity data across page navigation', async ({ page }) => {
    // Store initial activities from timeline
    await page.click('.activity-tracker-button');
    const initialEntries = await page.locator('.timeline-item').count();

    
    // Perform some actions
    await page.click('.btn-primary'); // Click Shop Now
    await page.click('a[href="products.html"]'); // Navigate to products
    
    await page.click('.activity-tracker-button');

    // Store number of activities after first page
    const midEntries = await page.locator('.timeline-item').count();
    expect(midEntries).toBeGreaterThan(initialEntries);
    
    // Navigate back to home
    await page.click('a[href="index.html"]');
    
    await page.click('.activity-tracker-button');
    
    // Verify all previous activities are still shown
    const finalEntries = await page.locator('.timeline-item').count();
    expect(finalEntries).toBeGreaterThan(midEntries);
  });

  test('should include timestamps', async ({ page }) => {
    // Open timeline and generate activity
    await page.click('.activity-tracker-button');
    await expect(page.locator('.activity-tracker-timeline')).toHaveClass(/expanded/);
    
    await page.click('.btn-primary');
    await page.waitForTimeout(500);
    await page.click('.activity-tracker-button');

    
    // Check for time format in the content
    const content = await page.locator('.timeline-item.pageview > .time').nth(0).textContent();
    expect(content).toMatch(/\d{1,2}:\d{2}(:\d{2})?/);
  });
});