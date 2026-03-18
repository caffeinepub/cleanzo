# Cleanzo

## Current State

Cleanzo is a full-stack car dry-cleaning subscription app with three roles: car owner, crew member, and admin. The backend (Motoko) handles user registration, assignments, skip days, Stripe payments, and waitlist. The frontend has a landing page, crew/owner/admin dashboards, and legal pages.

Currently missing:
- Crew has no clock-in/clock-out, no hours log, no weekly pay records
- Assignment mark-done has no photo proof upload
- Customers see no notifications when assigned or service is completed
- Landing page has no "How It Works" section

## Requested Changes (Diff)

### Add
- **Attendance system**: `clockIn(date)` and `clockOut(date)` backend functions for crew; stores timestamp per day; calculates hours worked
- **Work hours log**: `getAttendanceLogs(crewId)` — admin and self can query; returns list of `{ date, clockInTime, clockOutTime, hoursWorked }`
- **Weekly pay release**: `getWeeklyHoursSummary(crewId, weekStart)` and `releaseWeeklyPayment(crewId, weekStart, amount)` — admin only; stores payment released status
- **Service photo proof**: `uploadServicePhoto(carOwnerId, date, photoType, blobId)` — stores before/after blob IDs against an assignment; `getServicePhotos(carOwnerId, date)` — owner, crew, and admin can query
- **In-app notifications**: `getNotifications()` — returns notification list for the caller; notifications are created automatically when: (a) admin assigns a car owner to crew, (b) crew marks assignment done; `markNotificationRead(id)` — marks a notification as read
- **"How It Works" section**: 3-step visual (Sign Up → Crew Comes → Car is Clean) added to landing page above the pricing section

### Modify
- `markAssignmentDone` — after marking done, create a notification for the car owner: "Your car has been cleaned. Service completed by our crew at 5:00 AM."
- `assignCarOwnerToCrewMember` — after assigning, create a notification for the car owner: "A crew member has been assigned to clean your car on [date]."
- **CrewDashboard** — add Clock In / Clock Out buttons; show today's hours worked; show weekly hours summary and pay status
- **AdminDashboard** — add Attendance tab: view all crew attendance logs; release weekly payment per crew member
- **OwnerDashboard** — add Notifications section; add before/after photo viewer per completed assignment
- **LandingPage** — add "How It Works" section with 3-step visual

### Remove
- Nothing removed

## Implementation Plan

1. **Backend additions** (Motoko):
   - `AttendanceRecord` type: `{ date: Text, clockInTime: Int, clockOutTime: ?Int, hoursWorked: ?Float }`
   - `PayRelease` type: `{ crewId: Principal, weekStart: Text, totalHours: Float, amount: Nat, releasedAt: Int }`
   - `Notification` type: `{ id: Text, userId: Principal, message: Text, timestamp: Int, read: Bool }`
   - `ServicePhoto` type: `{ carOwnerId: Principal, date: Text, beforePhotoId: ?Text, afterPhotoId: ?Text }`
   - State maps: `crewAttendance`, `payReleases`, `notifications`, `servicePhotos`
   - Functions: `clockIn`, `clockOut`, `getAttendanceLogs`, `getWeeklyHoursSummary`, `releaseWeeklyPayment`, `uploadServicePhoto`, `getServicePhotos`, `getNotifications`, `markNotificationRead`
   - Modify `markAssignmentDone` and `assignCarOwnerToCrewMember` to create notifications

2. **Frontend — CrewDashboard**: Clock In/Out buttons with live timer, daily hours display, weekly hours + pay status section

3. **Frontend — AdminDashboard**: New "Attendance" tab showing all crew logs; weekly summary per crew; release payment button with amount input

4. **Frontend — OwnerDashboard**: Notification bell/section showing unread/read alerts; before/after photo viewer on completed assignments

5. **Frontend — Crew assignment cards**: "Upload Before Photo" and "Upload After Photo" buttons using blob-storage; calls `uploadServicePhoto` after upload

6. **Frontend — LandingPage**: "How It Works" section with 3 icon cards (Sign Up, Crew Comes, Car is Clean) inserted above pricing
