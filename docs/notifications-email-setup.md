# EPIPHANY notifications and branded email setup

## Implemented in the website
- Notification bell and unread count.
- Local notification history and mark-as-read actions.
- Daily/weekly renewal notices when the app detects a new challenge period.
- Optional browser notification permission and service-worker display/click handlers.
- Notification preferences are currently stored in this browser only.

## Important current limits
- Browser alerts from this first phase are triggered while the website is running or when it next opens. They are not yet true remote push notifications while the app is closed.
- Email reminder toggles are intentionally not exposed as active settings until server-side delivery exists.
- Challenge state is synced in the `player_progress` row, but no secure scheduler currently reads each user's state and sends reminders. Do not send reminders from browser code or expose provider API keys in the repository.

## Phase 2: make authentication emails say EPIPHANY
1. Create an account with an email provider that supports SMTP (Resend is one option).
2. Verify a domain you control with that provider and publish the DNS records it supplies (typically SPF/DKIM; follow its current instructions).
3. In Supabase Dashboard, open **Authentication → SMTP Settings** and enable custom SMTP.
4. Enter the provider's SMTP host, port, username, password, and verified sender email. Set **Sender name** to `EPIPHANY`.
5. Save and test signup confirmation and password-reset emails. Keep email confirmation enabled.
6. Store SMTP credentials only in the Supabase dashboard; never commit them to this repository.

The default Supabase mail service is for testing and has recipient restrictions and low sending limits. See the official guide: https://supabase.com/docs/guides/auth/auth-smtp

## Phase 3: scheduled challenge emails
Before enabling these, implement server-side notification preferences (opt-in, timezone, and email choice), a deduplicated send log, and a scheduled Supabase Edge Function/Cron job. The function must read the user's saved progress, skip completed challenges, and use a provider secret stored in Supabase secrets. Never send email from client-side JavaScript.

## Phase 4: real push notifications while the app is closed
The service worker now handles incoming push payloads and notification clicks. Remote push still needs a push-subscription table with Row Level Security, a VAPID key pair stored as server secrets, subscription registration/unsubscribe flows, and a server-side sender. Browser permission alone is not enough.
