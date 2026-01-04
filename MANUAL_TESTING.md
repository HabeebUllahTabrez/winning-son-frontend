# 📋 Manual Testing Checklist

> **Winning Son** - Comprehensive Manual Testing Guide  
> Last Updated: December 9, 2025

---

## 🔐 Authentication & Account Management

### Login Flow
- [ ] **Login with Valid Credentials**
  - Navigate to `/login`
  - Enter a valid email and password
  - Verify redirect to `/dashboard` after successful login
  - Verify toast notification appears

- [ ] **Login with Invalid Credentials**
  - Enter incorrect email/password
  - Verify error message is displayed
  - Verify no redirect occurs

- [ ] **Password Visibility Toggle**
  - Click the eye icon to show/hide password
  - Verify password is masked/unmasked correctly

- [ ] **Already Logged In Redirect**
  - If already authenticated, navigate to `/login`
  - Verify automatic redirect to `/dashboard`

### Signup Flow
- [ ] **Create New Account**
  - Toggle to signup mode
  - Enter email, password, and confirm password
  - Verify password requirements (min 8 characters)
  - Submit and verify account creation success
  - Verify redirect to setup flow

- [ ] **Password Mismatch**
  - Enter different passwords in password and confirm fields
  - Verify error message about mismatched passwords

- [ ] **Invalid Email Format**
  - Enter an invalid email format
  - Verify validation error is shown

### Guest Mode
- [ ] **Enter Guest Mode**
  - From homepage, click "Try as Guest" or equivalent
  - Verify redirect to profile setup
  - Verify no API authentication required

- [ ] **Exit Guest Mode (Without Data)**
  - As guest with no journal entries
  - Click "Exit Guest Mode" from navbar or profile
  - Verify direct exit without confirmation

- [ ] **Exit Guest Mode (With Data)**
  - As guest with journal entries
  - Click "Exit Guest Mode"
  - Verify confirmation dialog appears with dramatic messaging
  - Confirm and verify all guest data is cleared
  - Cancel and verify data is preserved

- [ ] **Create Account from Guest Mode**
  - As a guest user with data
  - Use the "Create Account" form/modal
  - Verify guest profile and journal entries are migrated
  - Verify successful account creation

### Logout
- [ ] **Logout (Authenticated User)**
  - Click logout from navbar or profile
  - Verify redirect to homepage
  - Verify session is cleared (try accessing protected route)

---

## 🏠 Homepage

### Landing Page Elements
- [ ] **Hero Section Display**
  - Verify hero section loads with proper animations
  - Check title, subtitle, and CTAs are visible
  - Verify responsive layout on mobile/tablet/desktop

- [ ] **Feature Cards**
  - Verify all feature cards display with icons
  - Check hover effects and animations work
  - Verify feature descriptions are accurate

- [ ] **Stats Section**
  - Verify stats counters display correctly
  - Check animation effects

- [ ] **Navigation from Homepage**
  - Click "Get Started" / "Login" buttons
  - Verify correct routing

- [ ] **Already Authenticated Redirect**
  - If logged in, navigate to `/`
  - Verify redirect to `/dashboard`

---

## 👤 Profile Setup (Onboarding)

### Multi-Step Setup Flow
- [ ] **Step 1: Welcome/Name**
  - Enter first name (required)
  - Enter last name (optional)
  - Click Next
  - Verify validation for empty first name

- [ ] **Step 2: Avatar Selection**
  - View all avatar options
  - Select an avatar
  - Verify selection indicator (circle highlight)
  - Navigate back and forward, verify selection persists

- [ ] **Step 3: Goal Setting**
  - Enter a personal goal
  - Test goal examples/suggestions if available
  - Verify character limit or validation

- [ ] **Step 4: Date Range**
  - Select start date
  - Select end date
  - Verify end date cannot be before start date
  - Verify date picker works correctly

- [ ] **Progress Indicator**
  - Verify progress bar/dots update as you navigate
  - Verify step numbers are accurate

- [ ] **Back Navigation**
  - Click back on each step
  - Verify previous data is preserved

- [ ] **Final Submission**
  - Complete all steps
  - Submit profile
  - Verify redirect to dashboard
  - Verify profile data is saved (check profile page)

- [ ] **Guest Mode Profile Setup**
  - Complete setup as guest user
  - Verify data is stored in localStorage

---

## 📊 Dashboard

### Dashboard Loading
- [ ] **Loading Skeleton**
  - Refresh dashboard page
  - Verify skeleton loader matches final UI structure
  - Verify skeleton displays until data loads

- [ ] **Data Display**
  - Verify user greeting shows correct name
  - Verify avatar displays correctly
  - Verify goal displays if set

### Karma Statistics
- [ ] **Today's Karma**
  - Verify today's karma score displays
  - Check if "No entry today" state shows when appropriate

- [ ] **Weekly/Monthly/Yearly Karma**
  - Verify each karma period displays correctly
  - Verify calculations seem accurate

- [ ] **Current Streak**
  - Verify streak count matches actual consecutive days
  - Verify streak icon/color

- [ ] **Longest Streak**
  - Verify longest streak ever is displayed

- [ ] **Total Days Logged**
  - Verify total count accuracy

- [ ] **Karma Change vs Last Week**
  - Verify comparison stat shows correctly
  - Check positive/negative indicators

### Submission History Chart (GitHub-style)
- [ ] **Chart Rendering**
  - Verify heat map grid renders correctly
  - Verify color coding matches karma levels
  - Verify month labels are correct

- [ ] **Day Tooltips**
  - Hover over cells
  - Verify date and karma info appears

- [ ] **Click Navigation**
  - Click on a day with an entry
  - Verify redirect to `/submissions?date=YYYY-MM-DD` in daily view

- [ ] **Empty Days**
  - Verify empty days show different color/style
  - Verify clicking empty day behavior

### Onboarding Cues/Banners
- [ ] **First Log Cue**
  - As new user with no entries
  - Verify "Create your first log" banner appears
  - Click the CTA, verify navigation to journal

- [ ] **Analyzer Cue**
  - After making some entries (criteria dependent)
  - Verify analyzer promotion shows if applicable

- [ ] **Dismiss Banner**
  - Click dismiss on any banner
  - Verify it doesn't reappear on refresh

### Quick Actions
- [ ] **Go to Journal**
  - Click any "Log Today" or journal CTA
  - Verify navigation to `/journal`

- [ ] **View Submissions**
  - Click submissions link/button
  - Verify navigation to `/submissions`

---

## 📝 Journal Page

### Journal Entry Form
- [ ] **Topics/Notes Field**
  - Enter text in the topics field
  - Verify character input works
  - Test with various lengths (short, medium, long)

- [ ] **Alignment Rating Scale**
  - Rate from 1-10 (or whatever scale is used)
  - Verify visual selection indicator
  - Verify tooltip/description for rating

- [ ] **Contentment Rating Scale**
  - Same tests as alignment rating

- [ ] **Date Display**
  - Verify current date is shown
  - Test with `?date=YYYY-MM-DD` URL param
  - Verify correct date displays when editing past entry

### Submission Behavior
- [ ] **Submit New Entry**
  - Fill all required fields
  - Click submit
  - Verify success toast
  - Verify redirect to submissions page with date param

- [ ] **Submit Empty/Incomplete Entry**
  - Leave required fields empty
  - Verify validation error or disabled submit

- [ ] **Edit Existing Entry**
  - Navigate to journal for a date with existing entry
  - Verify pre-filled data loads
  - Modify and save
  - Verify changes persist

- [ ] **Guest Mode Journal**
  - Submit entry as guest
  - Verify stored in localStorage
  - Verify entry appears in submissions

### Rating Component Behavior
- [ ] **Hover Effects**
  - Hover over rating options
  - Verify visual feedback

- [ ] **Selection State**
  - Select a rating
  - Verify it stays selected
  - Change selection multiple times

- [ ] **Loading State**
  - While submitting, verify controls are disabled

---

## 📜 Submissions Page

### View Modes
- [ ] **Weekly View (Default)**
  - Verify week navigation shows correctly
  - Verify entries for the week display

- [ ] **Daily View**
  - Switch to daily view
  - Verify single day entry displays
  - Test navigation arrows

- [ ] **View Mode Toggle**
  - Click toggle dropdown
  - Switch between daily and weekly
  - Verify UI updates accordingly
  - Verify URL doesn't show stale params

### Weekly View Navigation
- [ ] **Previous Week**
  - Click previous arrow
  - Verify week changes correctly

- [ ] **Next Week**
  - Click next arrow
  - Verify cannot navigate past current week (if applicable)

- [ ] **Go to Today**
  - Click "Today" button
  - Verify current week is shown

### Daily View Navigation
- [ ] **Previous Day**
  - Navigate to previous day
  - Verify correct date displays
  - Verify correct entry loads

- [ ] **Next Day**
  - Navigate to next day
  - Verify cannot go past today

- [ ] **Date Display**
  - Verify formatted date shown (e.g., "Monday, December 9, 2025")

### Entry Display
- [ ] **Entry Card Content**
  - Verify date shows correctly
  - Verify topics/notes display
  - Verify alignment and contentment ratings display
  - Verify karma score calculation

- [ ] **Edit Entry**
  - Click edit (pencil) icon
  - Verify redirect to journal with date param

- [ ] **Delete Entry**
  - Click delete (trash) icon
  - Verify confirmation dialog appears
  - Cancel and verify entry not deleted
  - Confirm and verify entry removed
  - Verify toast notification

- [ ] **Entry from URL Param**
  - Navigate to `/submissions?date=2025-12-01`
  - Verify daily view opens for that date

### Empty States
- [ ] **No Entries for Period**
  - Navigate to a week/day with no entries
  - Verify appropriate empty state message

- [ ] **New User No Entries**
  - As new user, go to submissions
  - Verify helpful onboarding message or empty state

### Skeleton Loading
- [ ] **Loading State**
  - Refresh submissions page
  - Verify skeleton structure matches loaded UI

---

## 🔮 Analyzer Page

### Date Range Selection
- [ ] **Start Date Picker**
  - Select a start date
  - Verify cannot select future dates (if applicable)

- [ ] **End Date Picker**
  - Select an end date
  - Verify end date must be after start date
  - Verify validation error for invalid range

- [ ] **Default Dates**
  - Verify default dates are sensible (e.g., from profile dates)

### Preference Options (if any)
- [ ] **Select Preferences**
  - Toggle any preference options
  - Verify selections are remembered

### Generate Blueprint
- [ ] **Summon Blueprint Button**
  - Click with valid date range and entries
  - Verify loading state while generating

- [ ] **Successful Generation**
  - Verify analysis result displays
  - Verify markdown formatting renders correctly
  - Check for AI-generated insights

- [ ] **Copy Result**
  - Click copy button
  - Verify toast confirms copy
  - Paste somewhere to verify actual copy

- [ ] **Reset Analysis**
  - Click reset
  - Verify form returns to initial state
  - Verify result clears

### Error States
- [ ] **No Entries in Range**
  - Select date range with no entries
  - Verify error message or prompt to log entries

- [ ] **Guest Mode Analyzer**
  - Use analyzer as guest (if allowed)
  - Verify behavior is correct

- [ ] **API Error**
  - (If possible to trigger) Verify graceful error handling

### Loading States
- [ ] **Page Load Skeleton**
  - Verify skeleton displays while user/data loads

---

## 👤 Profile Page

### Profile Display
- [ ] **Avatar Display**
  - Verify large avatar image shows
  - Verify correct avatar from profile

- [ ] **User Information**
  - Verify name displays correctly
  - Verify email displays (for authenticated users)
  - Verify goal displays
  - Verify date range displays

### Edit Profile
- [ ] **Open Edit Modal**
  - Click edit button
  - Verify modal opens with pre-filled data

- [ ] **Edit Name**
  - Change first/last name
  - Save and verify changes persist

- [ ] **Edit Goal**
  - Modify goal text
  - Save and verify changes persist

- [ ] **Edit Dates**
  - Change start/end dates
  - Verify validation
  - Save and verify changes persist

- [ ] **Cancel Edit**
  - Make changes, then cancel
  - Verify original data unchanged

### Avatar Change
- [ ] **Open Avatar Picker**
  - Click on avatar or edit avatar button
  - Verify all avatar options display

- [ ] **Select New Avatar**
  - Select different avatar
  - Verify selection indicator

- [ ] **Save Avatar**
  - Save new avatar
  - Verify avatar updates everywhere (profile, navbar, dashboard)

### Account Actions
- [ ] **Logout Button**
  - Click logout
  - Verify logout flow works
  - Verify redirect to homepage

- [ ] **Exit Guest Mode** (Guest Only)
  - Verify exit button appears for guests
  - Test confirmation flow (see Guest Mode section)

- [ ] **Admin Link** (Admins Only)
  - If admin, verify admin link appears
  - Click and verify access to admin page

### Guest Profile
- [ ] **Guest User Display**
  - Verify guest-specific UI/messaging
  - Verify email field shows "Guest User" or similar

---

## ❓ Help Page

### FAQ Section
- [ ] **FAQ Accordion**
  - Click on different FAQ items
  - Verify expand/collapse animation
  - Verify only one (or correct number) open at a time

- [ ] **FAQ Content**
  - Verify questions and answers are accurate
  - Check for broken links

### Help Resources
- [ ] **Contact Links**
  - Verify WhatsApp/email links work
  - Verify they open in new tab/app

- [ ] **Getting Started Guide**
  - Navigate through any getting started content
  - Verify links work

---

## 🔧 Admin Page (Admin Only)

### Access Control
- [ ] **Admin Access**
  - Log in as admin user
  - Navigate to `/admin`
  - Verify page loads with data

- [ ] **Non-Admin Access**
  - Log in as regular user
  - Navigate to `/admin`
  - Verify access denied message

### Admin Statistics
- [ ] **Total Users**
  - Verify stat card displays
  - Verify number is reasonable

- [ ] **Total Journal Entries**
  - Verify stat displays

- [ ] **Active Users This Week**
  - Verify stat displays

- [ ] **Entries This Week/Month**
  - Verify stats display

---

## 🧭 Navigation (Navbar)

### Desktop Navigation
- [ ] **Logo/Home Link**
  - Click logo
  - Verify navigation to home or dashboard

- [ ] **Nav Links**
  - Click each nav link (Dashboard, Journal, Submissions)
  - Verify correct routing
  - Verify active state highlighting

- [ ] **Profile/User Menu**
  - Click user avatar or profile button
  - Verify dropdown or navigation to profile

- [ ] **Sticky Behavior**
  - Scroll down the page
  - Verify navbar sticks to top

- [ ] **Scroll Effect**
  - Scroll down and verify navbar style changes (background/shadow)

### Mobile Navigation
- [ ] **Hamburger Menu**
  - On mobile viewport, find hamburger icon
  - Click to open mobile menu
  - Verify menu slides in with animation

- [ ] **Mobile Nav Links**
  - Click each link
  - Verify navigation works
  - Verify menu closes after navigation

- [ ] **Close Mobile Menu**
  - Click close button or outside menu
  - Verify menu closes

- [ ] **Guest Mode Exit in Mobile**
  - As guest, verify exit guest mode option in mobile menu

### Auth-Dependent Navigation
- [ ] **Unauthenticated State**
  - Verify only login/signup links show
  - Verify no access to protected routes

- [ ] **Authenticated State**
  - Verify full navigation shows
  - Verify logout option available

---

## 📱 Responsive Design

### Mobile (< 640px)
- [ ] **All Pages Render Correctly**
  - Homepage
  - Dashboard
  - Journal
  - Submissions
  - Profile
  - Analyzer
  - Help
  - Login

- [ ] **Touch Targets**
  - All buttons/links are easily tappable
  - No overlapping interactive elements

- [ ] **Text Readability**
  - Font sizes are appropriate
  - Text doesn't overflow containers

- [ ] **Scrolling**
  - Content is scrollable where needed
  - No horizontal scroll issues

### Tablet (640px - 1024px)
- [ ] **Layout Adaptation**
  - Grid layouts adjust appropriately
  - Cards resize correctly

### Desktop (> 1024px)
- [ ] **Full Layout**
  - Full width usage where appropriate
  - Multi-column layouts work

---

## 🎨 UI/UX Quality

### Animations & Transitions
- [ ] **Page Transitions**
  - Verify smooth transitions between pages

- [ ] **Loading Animations**
  - Skeleton loaders animate
  - Buttons show loading states

- [ ] **Hover Effects**
  - Cards, buttons, links have hover states
  - Effects are smooth

- [ ] **Focus States**
  - Tab through interactive elements
  - Verify visible focus indicators

### Toast Notifications
- [ ] **Success Toasts**
  - Appear in correct position
  - Auto-dismiss after timeout
  - Can be manually dismissed

- [ ] **Error Toasts**
  - Display for errors
  - Message is helpful
  - Correct styling (red/warning)

### Dialogs & Modals
- [ ] **Confirmation Dialogs**
  - Delete confirmations work
  - Exit guest mode confirmations work
  - Can cancel or confirm

- [ ] **Escape to Close**
  - Press Escape key
  - Verify modal closes

- [ ] **Click Outside**
  - Click outside modal
  - Verify expected behavior

### Forms
- [ ] **Input Focus**
  - Click into input
  - Verify focus styling

- [ ] **Validation Feedback**
  - Invalid inputs show errors
  - Errors clear when corrected

- [ ] **Submit States**
  - Buttons disable during submit
  - Loading indicators show

---

## 🔄 Data Persistence

### Authenticated User Data
- [ ] **Refresh Page**
  - After any changes, refresh
  - Verify data persists

- [ ] **Cross-Device**
  - Log in on different device/browser
  - Verify data syncs

### Guest User Data (localStorage)
- [ ] **Refresh Page**
  - As guest, make changes
  - Refresh and verify data persists

- [ ] **Close and Reopen Browser**
  - Close browser tab
  - Reopen and verify still in guest mode with data

- [ ] **Clear Storage**
  - (DevTools) Clear localStorage
  - Verify guest state resets

---

## ⚠️ Error Handling

### Network Errors
- [ ] **Lost Connection**
  - Disable network
  - Try to perform actions
  - Verify error messages appear

### API Errors
- [ ] **Server Errors**
  - If API returns 500
  - Verify graceful error display

- [ ] **Session Expired**
  - If session expires
  - Verify redirect to login

### Not Found
- [ ] **Invalid Routes**
  - Navigate to `/non-existent-page`
  - Verify 404 page or redirect

---

## 🧪 Edge Cases

### Empty States
- [ ] New user with no data on each page
- [ ] Date ranges with no entries

### Boundary Values
- [ ] Very long goal text
- [ ] Very long journal topics
- [ ] Minimum length inputs

### Special Characters
- [ ] Names with special characters, emojis
- [ ] Journal entries with markdown, HTML

### Concurrent Actions
- [ ] Double-click submit buttons
- [ ] Rapid navigation between pages

### Date Edge Cases
- [ ] End of month/year boundaries
- [ ] Timezone considerations
- [ ] Date picker limits

---

## 🚀 Performance

- [ ] **Initial Page Load**
  - Each page loads in reasonable time
  - Skeletons show during load

- [ ] **Navigation Speed**
  - Client-side navigation is fast
  - No unnecessary reloads

- [ ] **Image Loading**
  - Avatars load quickly
  - No layout shift from images

---

## 📝 Notes / Issues Found

| Issue | Page | Description | Severity | Status |
|-------|------|-------------|----------|--------|
| | | | | |
| | | | | |
| | | | | |

---

## ✅ Testing Sign-Off

- **Tested By:** ____________________
- **Date:** ____________________
- **Environment:** ____________________
- **Browser:** ____________________
- **Device:** ____________________

---

> 💡 **Tip:** Use this checklist in combination with browser DevTools to inspect network requests, console errors, and performance metrics during testing.
