# iPOS launch setup — things to do outside the code

Do these once, in this order, when you approve the launch changes. Nothing here is done
automatically.

## 1. Your details and prices (Vercel → ipossystem → Settings → Environment Variables)

Add these for **Production** (and Preview, if you want previews to look the same), then redeploy.
Anything you leave out is simply hidden on the site.

| Variable | Example | Shown on |
|---|---|---|
| `VITE_LEGAL_NAME` | Herve Innovations Limited | Terms, Privacy, footer |
| `VITE_BUSINESS_ADDRESS` | Plot 123, Cairo Road, Lusaka | Terms, Privacy |
| `VITE_SUPPORT_EMAIL` | support@yourdomain.com | Footer, Terms, Privacy |
| `VITE_WHATSAPP_NUMBER` | 260971234567 (no + or spaces) | Front page buttons, Billing |
| `VITE_PAY_MTN_NUMBER` / `VITE_PAY_MTN_NAME` | 0961 234 567 / Herve Innovations | Billing page |
| `VITE_PAY_AIRTEL_NUMBER` / `VITE_PAY_AIRTEL_NAME` | 0971 234 567 / Herve Innovations | Billing page |
| `VITE_PAY_BANK`, `VITE_PAY_BANK_ACCOUNT`, `VITE_PAY_BANK_NAME`, `VITE_PAY_BANK_BRANCH` | Zanaco / 0123456789 / … / Cairo Road | Billing page |
| `VITE_PRICE_MONTHLY` | 250 | Front page, Billing (default K250) |
| `VITE_PRICE_EXTRA_BRANCH` | 100 | Front page, Billing (default K100) |
| `VITE_PRICE_YEARLY_MONTHS` | 10 | A year costs this many months (default 10 = 2 free) |

Have the Terms of Service and Privacy Policy pages (`/terms`, `/privacy`) checked by a Zambian
lawyer before you take payments — they are a good starting draft, not legal advice. If you are
collecting personal data at scale you may also need to register with the Office of the Data
Protection Commissioner.

## 2. Turn on billing in the database (Supabase → SQL editor)

Run `supabase/billing.sql` once. It:
- creates the plan and payment tables (row-level security on, no direct access),
- gives **every existing shop a 30-day launch trial from the day you run it**,
- gives every new shop a 30-day trial automatically,
- refuses new sales 3 days after a trial or paid period ends (offline sales made before then still sync).

To test it on a copy first: `supabase/tests/billing-test.sql` (instructions at the top of
`supabase/tests/local-bootstrap.sql`).

After it runs, the Creator console shows a **Billing** section: confirm payments shops submit,
add paid time, extend trials, or put a shop on hold.

## 3. Emails from your own address (about 20 minutes)

Supabase's built-in email sender is only for testing — it is heavily rate-limited and often goes
to spam.

1. Buy a domain if you don't have one (e.g. `ipos.co.zm` from a ZICTA-accredited registrar, or a `.com`).
2. Create a free **Resend** account (free plan: 3,000 emails a month, 100 a day — plenty to start; paid plans from $20/month).
3. Resend → Domains → add `mail.yourdomain.com` → copy the DNS records it shows into your domain's DNS. Wait until it says **Verified**.
4. Resend → API keys → create one with "Sending access".
5. Supabase → Authentication → Emails → **SMTP settings** → Enable custom SMTP:
   - Host `smtp.resend.com`, port `465`, username `resend`, password = the API key
   - Sender email `noreply@mail.yourdomain.com`, sender name `iPOS`
6. Supabase → Authentication → Emails → **Templates**: paste each file from `supabase/email-templates/`
   (subject line is at the top of each file):
   - Confirm signup → `confirm-signup.html`
   - Reset password → `reset-password.html`
   - Invite user → `invite-staff.html`
   - Change email address → `change-email.html`
7. Supabase → Authentication → Rate limits: raise "emails sent per hour" (e.g. to 100) now that you have your own sender.
8. Send yourself a password reset to check it arrives in the inbox, not spam.

## 4. Account security (Supabase → Authentication → Providers → Email)

- **Minimum password length: 10**, and require **letters and digits** (the app already asks for this; this makes the server enforce it too).
- **Leaked password protection: on** (checks passwords against known breaches). This needs the Pro plan — see step 5.
- Keep "Confirm email" on.

## 5. Backups (Supabase → Organization → Billing)

The free Supabase plan has **no backups** and pauses projects after a week without activity —
not safe once shops depend on iPOS.

- Upgrade the project to **Pro (from $25/month)**: daily backups kept for 7 days, no pausing,
  and leaked password protection.
- Optional later: Point-in-time recovery add-on (from $100/month) lets you restore to any minute.
- Once a month, download a backup (Database → Backups) and keep a copy somewhere else.

## 6. Final checks before announcing

- [ ] Front page shows your WhatsApp number and correct prices.
- [ ] Sign up a test shop with a new email: confirmation email arrives from your domain, and the "I agree" box is required.
- [ ] Billing page shows your MTN / Airtel / bank details; submit a test payment and confirm it in the Creator console.
- [ ] In the Creator console put the test shop on hold → checkout says selling is paused → resume it.
- [ ] Import the template with a few products on the Products page.
- [ ] Password reset email arrives and works.
