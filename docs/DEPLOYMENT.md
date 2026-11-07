# Environments & deployment

Three environments, each with its own branch, its own link and its own database. Nothing deploys until you click **Approve**.

| Environment | Branch | Link | Database |
|---|---|---|---|
| **Dev** | `dev` | https://kithly-dev.vercel.app | `kithly_dev` |
| **QA** | `qa` | https://kithly-qa.vercel.app | `kithly_qa` |
| **Prod** | `main` | https://kithly.vercel.app | `kithly_prod` |

> Vercel picks the exact `*.vercel.app` names on first deploy. If a name is taken, it adds a suffix. Each deploy's summary shows the real link, and so does the repo's **Environments** panel.

## The flow, one feature at a time

```
feature/rsvp-reminders ──PR──▶ dev ──approve──▶ Dev live
                                          │
                                          ▼  (only this feature is cherry-picked)
                                         qa ──approve──▶ QA live
                                          │
                                          ▼
                                        main ──approve──▶ Prod live
```

1. **Build a feature** on a branch: `git checkout -b feature/rsvp-reminders dev`
2. **Open a pull request into `dev`.** CI runs lint, type checks, unit tests, a build and Playwright end-to-end tests. Merge when it's green. Merges are squashed, so each feature is exactly one commit.
3. **Approve Dev.** The merge starts **Actions → Release pipeline**. Click **Review deployments → dev → Approve**. Dev updates in about two minutes.
4. **Approve QA.** Once Dev is live, the same run waits at *Promote & deploy → qa*. Approving it copies only this feature's commit onto `qa` and deploys QA.
5. **Approve Prod.** Same again for `main` → Prod.

**Reject** at any step and the feature stops there. Features that come after it still promote on their own. Re-running a rejected step later is safe; already-promoted commits are skipped.

GitHub emails you when a step is waiting. You can also approve from the GitHub mobile app.

### When promotion stops with a conflict

If feature B builds on feature A and A hasn't reached QA yet, B's commit won't apply to `qa`. The run summary says so. Either approve A first and re-run B, or open a PR into `qa` that brings both.

### Hotfixes

Open a PR from a `hotfix/…` branch straight into `main` (or `qa`). Merging it deploys just that environment after approval. Then bring the fix back down with a PR from `main` into `dev`, so the branches don't drift.

### Redeploy without code changes

**Actions → Release pipeline → Run workflow** → choose dev, qa or production. It redeploys the current head of that environment's branch. Use this after changing a secret.

## One-time setup

### 1. GitHub repo (`scripts/setup-github.sh`)
Creates the public repo, the `dev`/`qa`/`main` branches, the three environments with you as the required approver, squash-only merges, and branch rules:
- `dev`: changes only through a PR with green CI.
- `qa` and `main`: changed only by the pipeline or a hotfix PR.

> Required reviewers are free on **public** repos. Making the repo private needs GitHub Pro, or the approval step disappears.

### 2. Repository secrets
**Settings → Secrets and variables → Actions → New repository secret**

| Secret | Required | Where to get it |
|---|---|---|
| `VERCEL_TOKEN` | ✅ | https://vercel.com/account/tokens → Create |
| `MONGODB_URI` | ✅ for real use | MongoDB Atlas → Connect → Drivers. In **Network Access**, allow `0.0.0.0/0`, because Vercel's IPs change. One free M0 cluster serves all three environments; each gets its own database. |
| `GOOGLE_GENERATIVE_AI_API_KEY` | optional | https://aistudio.google.com/apikey (free tier). Turns on AI-written invite notes. |

Optional **repository variables** (same page, *Variables* tab):

| Variable | Default | Purpose |
|---|---|---|
| `APP_NAME` | `Kithly` | Product name shown in the app |
| `VERCEL_PROJECT_PREFIX` | `kithly` | Vercel project names: `<prefix>-dev`, `<prefix>-qa`, `<prefix>` |
| `VERCEL_TEAM_ID` | none | Only if your token belongs to a Vercel team |

### 3. First deploy
**Actions → Release pipeline → Run workflow → dev**, approve, then repeat for `qa` and `production`.

On first run the pipeline:
- creates the three Vercel projects,
- generates a separate `BETTER_AUTH_SECRET` for each,
- sets `MONGODB_DB`, `NEXT_PUBLIC_APP_NAME` and the DEV/QA corner badge.

You never need to open the Vercel dashboard, though everything is visible there.

## Why GitHub Actions and not Vercel's Git integration?

Vercel's built-in integration deploys the moment you push, so there's no way to approve first. Here, GitHub Actions builds the app and uploads the result to Vercel only after you approve. `vercel.json` turns off Vercel's own Git deploys, so connecting the repo in Vercel later can't bypass the approval.

## Costs

All free at this scale: a public GitHub repo with Actions, Vercel Hobby (three projects), and MongoDB Atlas M0. Vercel Hobby is for personal, non-commercial use; move to Pro when Kithly starts making money.
