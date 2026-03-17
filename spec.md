# Cleanzo

## Current State
Backend (Motoko) is fully built with authorization, car owner/crew registration, skip days, assignments, and subscription status. Frontend files do not exist yet.

## Requested Changes (Diff)

### Add
- Full sign-up and sign-in flow (Internet Identity based auth via authorization component)
- Landing page: clean, startup-feel, no fake reviews or ratings, no fake testimonials
- Onboarding modal for new users: collect name, email, phone, car number, car model, car type -> auto-computes price
- Car owner dashboard: subscription details, skip-day calendar, service history
- Subscription page: pricing cards (₹399 hatchback/sedan/mid-SUV, ₹449 SUV), subscribe CTA
- Payment page: Stripe payment integration for subscription
- Crew member dashboard: today's assigned cars, mark-as-done
- Admin dashboard: manage owners, crew, daily schedule, create assignments
- Footer with social links pointing to trycleanzo.in (Instagram, Facebook, website)
- Header with Cleanzo branding and nav

### Modify
- Remove all fake reviews, ratings, testimonials, experience counts
- Social/website links updated to trycleanzo.in

### Remove
- All placeholder/fake social proof content

## Implementation Plan
1. Select authorization + stripe components
2. Generate backend (already exists, minor additions for payment intent tracking)
3. Build frontend: landing, auth flow, onboarding, car owner dashboard, crew dashboard, admin dashboard, subscription/payment pages
4. Wire Stripe payment for subscription
5. Add social links (trycleanzo.in) in footer
