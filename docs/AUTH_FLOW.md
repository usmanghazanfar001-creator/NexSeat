# Authentication flow

## Registration (email/password)

1. `POST /api/auth/register` — validates input with `registerSchema` (Zod), rate-limited to 5/min/IP, hashes the password with bcrypt (cost 12), creates the `User` row (`verified: false`), issues a `VerificationToken` (24h expiry), and emails a verification link via `lib/mail.ts`.
2. User clicks the link → `GET /api/auth/verify?token=...` marks `User.verified = true` and deletes the token, then redirects to `/login?verified=1`.
3. Login via the Credentials provider fails with "Please verify your email before logging in" until step 2 completes.

## Login

- **Credentials**: NextAuth's `CredentialsProvider.authorize()` (in `lib/auth.ts`) looks up the user, compares the password with bcrypt, and rejects unverified accounts. Errors are generic ("Invalid email or password") so the endpoint can't be used to enumerate registered emails.
- **Google / GitHub**: standard NextAuth OAuth providers, backed by `@auth/prisma-adapter` so `Account`/`Session` rows are persisted. OAuth users skip email verification since the provider already verified the address.
- Sessions are **JWT-based** (not database sessions) via `session: { strategy: "jwt" }`, so every request doesn't need a DB round trip; `role` and `id` are attached to the token in the `jwt` callback and exposed on `session.user` in the `session` callback.

## Forgot / reset password

- `POST /api/auth/forgot-password` always returns the same success message whether or not the email exists (prevents account enumeration), and only emails a reset link if the account is real. Tokens expire in 30 minutes and are typed `"PASSWORD_RESET"` to keep them distinct from email-verification tokens in the same table.
- `POST /api/auth/reset-password` validates the token, hashes the new password, and deletes the token in a single transaction.

## Two-factor authentication (TOTP)

1. `POST /api/auth/2fa/setup` generates a TOTP secret (`otplib`), stores it on the user (not yet "enabled"), and returns an `otpauth://` URI for the client to render as a QR code.
2. `POST /api/auth/2fa/verify` checks a 6-digit code against that secret; only on success does `twoFactorEnabled` flip to `true`.
3. `POST /api/auth/2fa/disable` requires one more valid code before clearing the secret.

**Not yet wired**: enforcing the 2FA challenge *during* the NextAuth credentials flow itself (i.e., a second step between password check and session issuance). The building blocks are here; hooking them into `authorize()` is a couple hours of work once you decide on the UX (redirect to a `/2fa-challenge` page vs. inline).

## Session management & route protection

`middleware.ts` uses `withAuth` from `next-auth/middleware` to gate `/dashboard/**` and `/admin/**`. Unauthenticated requests redirect to `/login`; authenticated non-admins hitting `/admin/**` are redirected to `/dashboard`. This is enforced at the edge, before any page or API code runs.
