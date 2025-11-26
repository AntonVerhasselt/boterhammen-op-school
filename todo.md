# Todo List

## Development Tasks

- [ ] Check orders in db when creating new one to avoid duplicates (2 orders for the same day for the same child)
- [ ] Protect offDays mutations with checkAdmin (need to wrap the mutations in an action to do this)
- [ ] Validate payments through Stripe webhooks, not only through success url
- [ ] Make the menu navbar mobile friendly
- [ ] Email setup with Resend (mainly order confirmation email)
- [ ] Posthog analytics

## Bugs

- [ ] When editing a child, the allergies field is required, but this shouldn't be the case

## Product Marketing Ideas

- [ ] On Sunday at noon, check what parents haven't ordered lunch for the week and send email
