# Cleanzo - Car Dry Cleaning Service App

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- **Role-based access**: Car Owner, Crew Member, Admin roles
- **Car Owner registration popup**: Collects name, email, phone, car number, car model. System auto-assigns price segment based on car type.
  - Hatchback / Sedan / Mid-SUV → ₹399/month
  - SUV (full-size) → ₹449/month
- **Car Owner dashboard**: View subscription details, skip days in current month, view attendance/skip history
- **Crew Member registration**: Collects name, phone, and role
- **Crew Member dashboard**: View assigned cars for the day, mark car as cleaned/done
- **Admin dashboard**: View all car owners, assign cars to crew members, view today's schedule, manage skip requests
- **Skip day feature**: Car owners can skip up to N days/month; skipped days shown on the schedule so crew knows not to visit
- **Subscription pricing logic**: Hatchback/Sedan/MidSUV = ₹399, SUV = ₹449

### Modify
N/A

### Remove
N/A

## Implementation Plan
1. Backend actors:
   - `CarOwner`: profile (name, email, phone, carNumber, carModel, carType, priceSegment), subscriptionStatus, skipDays list per month
   - `CrewMember`: profile (name, phone), assignedCars per day
   - `Admin`: assign crew to car owners, view daily schedule
   - `Schedule`: daily entries per car owner, status (pending/done/skipped)
2. Frontend views:
   - Landing page with two CTAs: "Join as Car Owner" and "Join as Crew Member"
   - Car owner registration modal (popup form)
   - Car owner dashboard: subscription info, skip day calendar, history
   - Crew member dashboard: today's assigned cars, mark done
   - Admin dashboard: manage owners, crew, assignments, daily schedule
3. Auto price segment based on car type selection during registration
4. Skip day logic: owner marks a date as skipped; schedule reflects it
5. Role-based routing after login
