#!/usr/bin/env bash
# One-time GitHub setup for the Dev → QA → Prod pipeline.
# Needs: gh (logged in as the repo owner), git. Safe to re-run.
#
#   REPO=kithly ./scripts/setup-github.sh
#
# It creates the public repo (if missing), the dev/qa/main branches, the three
# GitHub environments with you as required reviewer, squash-only merges, and
# branch rules. Then add the VERCEL_TOKEN and MONGODB_URI secrets (see docs/DEPLOYMENT.md).
set -euo pipefail

REPO_NAME=${REPO:-kithly}
OWNER=${OWNER:-$(gh api user --jq .login)}
OWNER_ID=${OWNER_ID:-$(gh api "users/$OWNER" --jq .id)}
FULL="$OWNER/$REPO_NAME"
echo "→ Setting up $FULL"

# 1. Repository ---------------------------------------------------------------
if ! gh repo view "$FULL" >/dev/null 2>&1; then
  gh repo create "$FULL" --public \
    --description "Intimate event invitations for your closest circle — Next.js, MongoDB, Vercel" \
    --homepage "https://$REPO_NAME.vercel.app"
fi

gh api -X PATCH "repos/$FULL" \
  -F allow_squash_merge=true -F allow_merge_commit=false -F allow_rebase_merge=false \
  -F delete_branch_on_merge=true -F allow_auto_merge=true \
  -f squash_merge_commit_title=PR_TITLE -f squash_merge_commit_message=PR_BODY >/dev/null
echo "✓ Squash-only merges (one commit per feature)"

# 2. Environments — each deploy waits for your approval ------------------------
for env in dev qa production; do
  gh api -X PUT "repos/$FULL/environments/$env" --input - >/dev/null <<JSON
{ "reviewers": [{ "type": "User", "id": $OWNER_ID }], "prevent_self_review": false, "deployment_branch_policy": null }
JSON
  echo "✓ Environment '$env' requires approval from @$OWNER"
done

# 3. Push code and create the environment branches -----------------------------
# [skip ci] on the import commit keeps the first push from queueing three deploys.
git remote get-url origin >/dev/null 2>&1 || git remote add origin "https://github.com/$FULL.git"
git push -u origin main
for b in dev qa; do
  if ! git ls-remote --exit-code --heads origin "$b" >/dev/null; then git push origin "main:$b"; fi
done
gh api -X PATCH "repos/$FULL" -f default_branch=dev >/dev/null
echo "✓ Branches: dev (default, where features land) · qa · main (prod)"

# 4. Branch rules ---------------------------------------------------------------
# dev: changes only via pull request with green CI.
# qa/main: only the pipeline (GitHub Actions) or a reviewed hotfix PR may change them.
ruleset() { # name, branch, json-rules, bypass-json
  local existing
  existing=$(gh api "repos/$FULL/rulesets" --jq ".[] | select(.name==\"$1\") | .id" || true)
  local body
  body=$(jq -n --arg name "$1" --arg ref "refs/heads/$2" --argjson rules "$3" --argjson bypass "$4" \
    '{name:$name, target:"branch", enforcement:"active", conditions:{ref_name:{include:[$ref], exclude:[]}}, rules:$rules, bypass_actors:$bypass}')
  if [ -n "$existing" ]; then
    gh api -X PUT "repos/$FULL/rulesets/$existing" --input - <<<"$body" >/dev/null
  else
    gh api -X POST "repos/$FULL/rulesets" --input - <<<"$body" >/dev/null
  fi
}
PR_RULE='{"type":"pull_request","parameters":{"required_approving_review_count":0,"dismiss_stale_reviews_on_push":false,"require_code_owner_review":false,"require_last_push_approval":false,"required_review_thread_resolution":false}}'
CHECKS_RULE='{"type":"required_status_checks","parameters":{"strict_required_status_checks_policy":false,"required_status_checks":[{"context":"Lint, types, unit tests & build"},{"context":"End-to-end (Playwright)"}]}}'
NO_DELETE='{"type":"deletion"}'
NO_FORCE='{"type":"non_fast_forward"}'
ACTIONS_BYPASS='[{"actor_type":"Integration","actor_id":15368,"bypass_mode":"always"}]' # GitHub Actions

ruleset "dev: PR + green CI" dev "[$PR_RULE,$CHECKS_RULE,$NO_DELETE,$NO_FORCE]" '[]'
for b in qa main; do
  if ! ruleset "$b: pipeline or reviewed PR" "$b" "[$PR_RULE,$NO_DELETE,$NO_FORCE]" "$ACTIONS_BYPASS" 2>/dev/null; then
    echo "! Couldn't let GitHub Actions bypass the $b rule; protecting $b from deletion/force-push only."
    ruleset "$b: pipeline or reviewed PR" "$b" "[$NO_DELETE,$NO_FORCE]" '[]'
  fi
done
echo "✓ Branch rules"

cat <<DONE

All set: https://github.com/$FULL

Next — add two repository secrets (Settings → Secrets and variables → Actions):
  VERCEL_TOKEN   from https://vercel.com/account/tokens
  MONGODB_URI    your MongoDB Atlas connection string
Then: Actions → Release pipeline → Run workflow → pick an environment.
DONE
