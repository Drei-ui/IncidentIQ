# IncidentIQ Test Cases

## Step 1 — Seed the Knowledge Base

Go to the **Knowledge Base** tab and upload these files in order:

| File | Type to select |
|---|---|
| `auth-sop.txt` | SOP |
| `database-runbook.txt` | Runbook |
| `api-errors-runbook.txt` | Runbook |

---

## Step 2 — Submit Past Tickets (builds semantic search history)

Go to **New Ticket**, run "Analyze with AI", then click "Submit Ticket" for each:

### Past Ticket 1
- **Title:** User cannot login after password reset
- **Description:** Customer reset their password via the forgot password link. After resetting, they receive "Invalid Credentials" error every time they try to sign in. They have tried multiple browsers.
- **Priority:** High

### Past Ticket 2
- **Title:** Database connection timeout on checkout
- **Description:** Users are experiencing timeouts during the checkout process. Error logs show "connection pool exhausted" errors from the PostgreSQL connection pool. Issue started approximately 30 minutes ago and is affecting all users on the US-East region.
- **Priority:** Critical

### Past Ticket 3
- **Title:** API returning 500 errors on payment endpoint
- **Description:** The /api/v1/payments endpoint is returning HTTP 500 for approximately 15% of requests. Stripe webhook callbacks are also failing. Started after the 2pm deployment.
- **Priority:** Critical

### Past Ticket 4
- **Title:** Session expires immediately after login
- **Description:** Several users report being logged out immediately after signing in. The session appears to be created but expires within seconds. Issue is intermittent and affects about 10% of login attempts.
- **Priority:** Medium

### Past Ticket 5
- **Title:** Webhook delivery failing for enterprise client
- **Description:** Enterprise client Acme Corp reports they are not receiving webhook events for order status updates. Last successful delivery was 6 hours ago. Their endpoint returns 200 when tested manually.
- **Priority:** High

---

## Step 3 — Test AI Analysis (the core feature)

Submit these as new tickets and verify the AI response quality:

### Test A — Auth issue (should match Past Ticket 1 + auth-sop.txt)
- **Title:** Customer locked out after resetting password
- **Description:** A customer submitted a ticket saying they cannot log in after using the password reset flow. They receive "Invalid Credentials" even though they set the new password successfully. They've tried Chrome and Edge.
- **Expected:** AI suggests checking Redis cache, flushing session, checking password hash — from the SOP

### Test B — DB issue (should match Past Ticket 2 + database-runbook.txt)
- **Title:** Checkout timing out for all users
- **Description:** Multiple users reporting timeouts on the checkout page. Support queue is filling up. Started about 20 minutes ago. No recent deployments.
- **Expected:** AI suggests checking pg_stat_activity, connection pool, killing idle connections

### Test C — API spike (should match Past Ticket 3 + api-errors-runbook.txt)
- **Title:** High error rate on API after deployment
- **Description:** After deploying version 2.4.1, we are seeing a spike in HTTP 500 errors on the /payments endpoint. Error rate is around 20%. Should we roll back?
- **Expected:** AI suggests rollback, checking logs, checking downstream dependencies

### Test D — Vague ticket (tests AI inference)
- **Title:** App is broken
- **Description:** Users can't do anything. Everything is down.
- **Expected:** AI asks for more info or makes reasonable inference based on available context

---

## What to check in each response

- [ ] **Possible Cause** — is it accurate and specific?
- [ ] **Confidence score** — does it reflect how clear the issue is?
- [ ] **Suggested Steps** — are they actionable and in the right order?
- [ ] **Similar Tickets** — do semantically related past tickets appear?
- [ ] **Related Documents** — does the right SOP/runbook appear?
