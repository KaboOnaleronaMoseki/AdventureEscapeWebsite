# Adventure Escape SA Website

This folder contains the responsive static website. Open `index.html` directly for browsing, or
serve the folder with a web server. Its pages use the same dark brown, russet, and gold palette
and system-font styling as the Expo app.

## Booking form

The booking calculator is on `fees.html`. It uses the same activity and accommodation IDs, prices,
and distinct-activity discount tiers as the app. It validates dates in the Africa/Johannesburg
timezone, enforces the 24-hour activity cutoff and accommodation date range, and submits requests
to the Expo booking API.

The booking form requires an explicit HTTPS booking API URL; it does not POST to the static website
host. For Render deployment, `render.yaml` builds this site with the API origin supplied through
the `BOOKING_API_URL` environment variable and writes the correct API endpoints into generated
`fees.html` and `account.html`. The API must allow this site's origin.
Static hosting alone cannot store or confirm bookings; the API performs authoritative validation,
availability checks, and email notification.

## Client accounts

`account.html` provides email/password registration, sign-in, verification-link handling, and
sign-out through the server API; it never stores passwords or creates a local account. Accounts
require a verified email before sign-in. For a separate static-site origin, set
the `account-api-url` meta tag in `account.html` to the deployed API origin and add the website
origin to the server's `ALLOWED_ORIGINS`. `ACCOUNT_VERIFICATION_URL` on the server must point to
this page. Signed-in booking requests are attached to the account after the server validates the
session.

Create this Render Static Site from the website repository's `render.yaml`, set
`BOOKING_API_URL` to the API's HTTPS origin, and deploy. Then configure `ALLOWED_ORIGINS` and
`ACCOUNT_VERIFICATION_URL` in the API service using this site's deployed origin. The installable
Android APK is built from the Expo app and is distributed separately.
