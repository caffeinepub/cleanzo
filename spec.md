# Cleanzo

## Current State
The app has a working theme toggle context but is missing `.dark` CSS variable overrides, so clicking the toggle button does nothing visually. Crew registration is a simple 2-field form (name + phone). Both dashboards have logout buttons but don't navigate to home after signing out. PricingPage has a 'Most Popular' badge on the SUV card. WhatsApp button links directly to wa.me without any message preselection.

## Requested Changes (Diff)

### Add
- `.dark` CSS block in index.css with dark-mode variable overrides so theme toggle visually works
- Multi-step crew registration: Step 1 (phone + email + OTP method choice), Step 2 (OTP entry), Step 3 (ID proof type select + image upload via file picker or camera)
- WhatsApp prewritten message popup: clicking the WA icon opens a small panel with 3 selectable messages, then opens WhatsApp with that message pre-filled
- 'Waiting for approval' state on CrewDashboard when crew isActive is false

### Modify
- CrewRegistrationModal: fully rebuilt to multi-step OTP + document upload flow
- CrewDashboard: logout navigates to "/" after clear(); show pending approval banner when isActive is false
- OwnerDashboard: logout navigates to "/" after clear()
- PricingPage: remove 'Most Popular' badge span
- WhatsAppChat: show message-selection popup before opening WhatsApp

### Remove
- '✦ Most Popular' badge from PricingPage SUV card

## Implementation Plan
1. Add `.dark` block to index.css with dark background/foreground overrides
2. Rewrite CrewRegistrationModal with 3-step flow (simulated OTP since no SMS service available)
3. Update CrewDashboard to navigate to '/' on logout and show approval-pending banner
4. Update OwnerDashboard to navigate to '/' on logout
5. Remove Most Popular badge from PricingPage
6. Update WhatsAppChat to show 3 prewritten message options popup
