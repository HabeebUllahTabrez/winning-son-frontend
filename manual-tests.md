# Manual Testing Checklist

This document contains all manual tests that should be performed before deploying to production.

---

## 1. Guest User Flow

### 1.1 Journal Creation (Guest)
- [ ] Open the app without logging in
- [ ] Navigate to `/journal`
- [ ] Fill in journal entry with:
  - Topics/thoughts text
  - Alignment rating (1-10)
  - Contentment rating (1-10)
- [ ] Click "Save Entry"
- [ ] Verify redirect to `/submissions?highlighted={date}`
- [ ] Verify the entry appears in the correct week
- [ ] Verify the entry is highlighted
- [ ] Open browser DevTools > Application > Local Storage
- [ ] Verify `guestJournalEntries` contains the entry with correct `alignment_rating` and `contentment_rating` (NOT 0)

### 1.2 Journal Editing (Guest)
- [ ] Click "Edit" button on an existing guest entry
- [ ] Modify the topics, alignment, and contentment ratings
- [ ] Save the entry
- [ ] Verify changes are reflected on the submissions page
- [ ] Verify localStorage is updated with new values

### 1.3 Journal Deletion (Guest)
- [ ] Navigate to `/submissions`
- [ ] Click "Delete" button on an entry
- [ ] Confirm deletion in the dialog
- [ ] Verify entry disappears without page refresh
- [ ] Verify entry is removed from localStorage
- [ ] Refresh the page and verify entry is still gone

### 1.4 Past Date Journal (Guest)
- [ ] Navigate to `/journal?date=2025-01-15` (or any past date)
- [ ] Fill in and save a journal entry for that date
- [ ] Verify redirect to submissions page
- [ ] Verify the week containing that past date is displayed
- [ ] Verify the entry is highlighted

### 1.5 Multiple Week Navigation (Guest)
- [ ] Create entries for multiple weeks
- [ ] Navigate between weeks using Previous/Next buttons
- [ ] Click "Today" button to return to current week
- [ ] Verify all entries display correctly in their respective weeks

### 1.6 Guest to Authenticated Migration
- [ ] As a guest, create 3-5 journal entries with various ratings
- [ ] Click "Create Account" or navigate to signup
- [ ] Fill in email and password
- [ ] Submit the form
- [ ] Verify successful redirect to `/dashboard`
- [ ] Navigate to `/submissions`
- [ ] Verify all guest entries are now visible
- [ ] Check that ratings were migrated correctly (NOT all 1s or 0s)
- [ ] Verify localStorage is cleared of guest data
- [ ] Log out and verify you cannot access the migrated data as a guest

---

## 2. Authenticated User Flow

### 2.1 Sign Up
- [ ] Navigate to `/signup` or registration page
- [ ] Fill in email and password (min 8 characters)
- [ ] Fill in confirm password (matching)
- [ ] Submit form
- [ ] Verify successful account creation
- [ ] Verify redirect to dashboard or appropriate page
- [ ] Verify auth token is set

### 2.2 Login
- [ ] Navigate to `/login`
- [ ] Enter valid credentials
- [ ] Click "Login"
- [ ] Verify successful login
- [ ] Verify redirect to dashboard
- [ ] Verify auth token exists in cookies

### 2.3 Login - Invalid Credentials
- [ ] Navigate to `/login`
- [ ] Enter invalid credentials
- [ ] Verify error message is displayed
- [ ] Verify no redirect occurs
- [ ] Verify no auth token is set

### 2.4 Journal Creation (Authenticated)
- [ ] Login as an authenticated user
- [ ] Navigate to `/journal`
- [ ] Fill in journal entry with:
  - Topics/thoughts text
  - Alignment rating (1-10)
  - Contentment rating (1-10)
- [ ] Click "Save Entry"
- [ ] Verify API call to POST `/api/journal` is made
- [ ] Verify redirect to `/submissions?highlighted={date}`
- [ ] Verify the entry appears in the submissions list
- [ ] Verify the entry is highlighted

### 2.5 Journal Editing (Authenticated)
- [ ] Navigate to `/submissions`
- [ ] Click "Edit" button on an existing entry
- [ ] Modify the topics, alignment, and contentment ratings
- [ ] Save the entry
- [ ] Verify API call to POST `/api/journal` is made (update)
- [ ] Verify changes are reflected on the submissions page
- [ ] Refresh the page and verify changes persisted

### 2.6 Journal Deletion (Authenticated)
- [ ] Navigate to `/submissions`
- [ ] Click "Delete" button on an entry
- [ ] Verify confirmation dialog appears
- [ ] Click "Delete" to confirm
- [ ] Verify API call to DELETE `/api/journal` is made with `local_date` in body
- [ ] Verify entry disappears without full page refresh
- [ ] Verify NO 500 error occurs
- [ ] Refresh the page and verify entry is still gone

### 2.7 Past Date Journal (Authenticated)
- [ ] Navigate to `/journal?date=2025-01-15` (or any past date)
- [ ] Fill in and save a journal entry for that date
- [ ] Verify API POST includes the correct `local_date`
- [ ] Verify redirect to submissions page
- [ ] Verify the week containing that past date is displayed
- [ ] Verify the entry is highlighted

### 2.8 Multiple Week Navigation (Authenticated)
- [ ] Create entries for multiple weeks
- [ ] Navigate between weeks using Previous/Next buttons
- [ ] Verify API calls fetch the correct date ranges
- [ ] Click "Today" button to return to current week
- [ ] Verify all entries display correctly in their respective weeks

### 2.9 Session Persistence
- [ ] Login as an authenticated user
- [ ] Create a journal entry
- [ ] Close the browser completely
- [ ] Reopen the browser and navigate to the app
- [ ] Verify you are still logged in
- [ ] Verify your entries are still visible

### 2.10 Logout
- [ ] Click "Logout" button
- [ ] Verify redirect to home or login page
- [ ] Verify auth token/cookie is cleared
- [ ] Try to access protected routes (e.g., `/dashboard`, `/journal`)
- [ ] Verify redirect to login page

### 2.11 Unauthorized Access (401 Handling)
- [ ] Login and create some entries
- [ ] Manually delete the auth cookie from DevTools
- [ ] Try to perform an authenticated action (e.g., save journal)
- [ ] Verify automatic redirect to `/login`
- [ ] Verify auth cookie is cleared

---

## 3. Cross-Flow Tests

### 3.1 Guest → Login
- [ ] Start as a guest and create entries
- [ ] Login with existing account (don't create new account)
- [ ] Verify guest data is NOT migrated
- [ ] Verify you only see the authenticated user's data
- [ ] Verify guest localStorage data is still present (not cleared on login)

### 3.2 Authenticated → Logout → Guest
- [ ] Login and create entries as authenticated user
- [ ] Logout
- [ ] Use the app as a guest and create entries
- [ ] Verify guest entries are separate from authenticated entries
- [ ] Login again with same account
- [ ] Verify only authenticated entries are visible (not guest entries)

### 3.3 Browser Refresh - Guest
- [ ] As guest, create multiple entries
- [ ] Refresh the page (F5)
- [ ] Verify all guest entries are still visible
- [ ] Verify guest status is maintained

### 3.4 Browser Refresh - Authenticated
- [ ] As authenticated user, create multiple entries
- [ ] Refresh the page (F5)
- [ ] Verify all entries are still visible
- [ ] Verify authentication is maintained

---

## 4. Edge Cases & Error Handling

### 4.1 Empty Form Submission
- [ ] Navigate to `/journal`
- [ ] Try to submit without filling any fields
- [ ] Verify the "Save Entry" button is disabled
- [ ] Fill in only topics (no ratings)
- [ ] Verify button is still disabled
- [ ] Fill in ratings with 0
- [ ] Verify button is still disabled

### 4.2 Network Error Handling (Authenticated)
- [ ] Open DevTools > Network tab
- [ ] Set network to "Offline"
- [ ] Try to save a journal entry
- [ ] Verify appropriate error message is shown
- [ ] Verify loading state ends properly
- [ ] Set network back to "Online"
- [ ] Retry the action and verify it works

### 4.3 Invalid Date Parameter
- [ ] Navigate to `/journal?date=invalid-date`
- [ ] Verify the page handles it gracefully (defaults to today or shows error)
- [ ] Navigate to `/journal?date=2025-13-45` (invalid date)
- [ ] Verify graceful handling

### 4.4 Future Date Handling
- [ ] Navigate to `/journal?date=2026-12-31` (future date)
- [ ] Create and save an entry
- [ ] Navigate to submissions
- [ ] Verify "Next Week" button is disabled when reaching current week
- [ ] Verify future entries are handled correctly

### 4.5 Backend API Errors
- [ ] Stop the backend server (if possible)
- [ ] Try to login
- [ ] Verify appropriate error message
- [ ] Try to save a journal entry
- [ ] Verify appropriate error message
- [ ] Verify the app doesn't crash

### 4.6 Rate Limiting / 429 Errors
- [ ] If rate limiting exists, trigger it by rapid API calls
- [ ] Verify appropriate error message
- [ ] Verify graceful degradation

---

## 5. UI/UX Tests

### 5.1 Responsive Design
- [ ] Test on mobile viewport (375px width)
- [ ] Test on tablet viewport (768px width)
- [ ] Test on desktop viewport (1440px width)
- [ ] Verify all buttons are accessible
- [ ] Verify text is readable at all sizes
- [ ] Verify forms are usable on mobile

### 5.2 Highlighting & Scrolling
- [ ] Create entries for multiple days in a week
- [ ] Edit an entry from the middle of the list
- [ ] After save, verify redirect highlights the correct entry
- [ ] Verify the highlighted entry scrolls into view automatically
- [ ] Verify the highlight style is visible

### 5.3 Loading States
- [ ] Verify loading indicators appear during:
  - Journal submission
  - Entry deletion
  - Page data fetching
  - Login/signup
- [ ] Verify loading indicators disappear after completion
- [ ] Verify buttons are disabled during loading

### 5.4 Toast Notifications
- [ ] Verify success toasts appear for:
  - Successful journal save
  - Successful deletion
  - Successful account creation
- [ ] Verify error toasts appear for:
  - Failed API calls
  - Validation errors
  - Network errors
- [ ] Verify toasts auto-dismiss after a few seconds

### 5.5 Confirmation Dialogs
- [ ] Click delete on an entry
- [ ] Verify confirmation dialog appears
- [ ] Click "Cancel"
- [ ] Verify entry is NOT deleted
- [ ] Click delete again and confirm
- [ ] Verify entry IS deleted

---

## 6. Data Integrity Tests

### 6.1 Rating Values
- [ ] Create entry with alignment=1, contentment=1
- [ ] Verify both ratings save correctly
- [ ] Create entry with alignment=10, contentment=10
- [ ] Verify both ratings save correctly
- [ ] Edit an entry and change only alignment rating
- [ ] Verify contentment rating is unchanged

### 6.2 Date Consistency
- [ ] Create entry for specific date (e.g., 2025-01-20)
- [ ] Verify the entry appears in the correct week
- [ ] Verify the entry shows correct day of week
- [ ] Verify date formatting is consistent throughout app

### 6.3 Week Calculation
- [ ] Test week boundaries around Sunday/Monday (depending on week start config)
- [ ] Create entry on Sunday
- [ ] Verify it appears in the correct week
- [ ] Navigate to previous/next week
- [ ] Verify week ranges are calculated correctly

### 6.4 Migration Data Integrity
- [ ] As guest, create entries with all rating combinations (1-10)
- [ ] Create entry with very long text (1000+ characters)
- [ ] Create entries for various dates (past, present)
- [ ] Migrate to authenticated account
- [ ] Verify all entries migrated correctly:
  - All dates preserved
  - All ratings preserved (not defaulting to 1)
  - All text content preserved
  - Entry count matches

---

## 7. Security Tests

### 7.1 XSS Prevention
- [ ] Try to enter `<script>alert('xss')</script>` in topics field
- [ ] Save and view the entry
- [ ] Verify the script doesn't execute
- [ ] Verify it's displayed as plain text

### 7.2 Authentication Protection
- [ ] Logout completely
- [ ] Try to access `/dashboard` directly via URL
- [ ] Verify redirect to login
- [ ] Try to access `/api/journal` directly
- [ ] Verify 401 or redirect

### 7.3 Cookie Security
- [ ] Open DevTools > Application > Cookies
- [ ] Verify `auth_token` cookie exists (when logged in)
- [ ] Verify it has `HttpOnly` flag (if applicable)
- [ ] Verify it has `Secure` flag in production
- [ ] Verify it has appropriate `SameSite` setting

---

## 8. Performance Tests

### 8.1 Large Dataset
- [ ] Create 50+ journal entries (use migration or manual entry)
- [ ] Navigate to submissions page
- [ ] Verify page loads within reasonable time (<3s)
- [ ] Navigate between weeks
- [ ] Verify smooth transitions

### 8.2 Long Text Content
- [ ] Create entry with 5000+ characters in topics
- [ ] Save and verify it displays correctly
- [ ] Verify no layout breaking
- [ ] Verify scrolling works correctly

---

## 9. Browser Compatibility

Test the entire flow in:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

---

## 10. Production Deployment Checklist

Before deploying to production:
- [ ] All critical tests from sections 1-8 pass
- [ ] Environment variables are correctly set
- [ ] API endpoints point to production backend
- [ ] Error tracking is configured (e.g., Sentry)
- [ ] Analytics is configured (if applicable)
- [ ] HTTPS is enabled
- [ ] Cookie security flags are enabled
- [ ] Rate limiting is configured
- [ ] Backup strategy is in place
- [ ] Rollback plan is documented

---

## Test Results Template

Date: _______________
Tester: _______________
Environment: [Development / Staging / Production]
Browser: _______________
OS: _______________

| Test Section | Pass/Fail | Notes |
|--------------|-----------|-------|
| 1. Guest Flow | [ ] | |
| 2. Authenticated Flow | [ ] | |
| 3. Cross-Flow | [ ] | |
| 4. Edge Cases | [ ] | |
| 5. UI/UX | [ ] | |
| 6. Data Integrity | [ ] | |
| 7. Security | [ ] | |
| 8. Performance | [ ] | |
| 9. Browser Compatibility | [ ] | |

Critical Issues Found: _______________
Blockers: _______________
Ready for Production: [ ] Yes [ ] No
