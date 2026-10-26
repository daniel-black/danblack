# Infrastructure

The site is a static build served from a private S3 bucket through CloudFront, with DNS in
Route 53. Everything is defined with AWS CDK in this folder.

- **AWS account:** `danblackco` (`621422876704`), a member of my personal AWS Organization
- **Region:** `us-east-1` (required for CloudFront certificates)
- **CLI profile:** `danblackco` (IAM Identity Center, `aws sso login --profile danblackco`)

## Stacks

| Stack | What it holds | How it's deployed |
| --- | --- | --- |
| `SiteStack` | S3 bucket, CloudFront distribution, URL function, certificate, DNS records for the site | **Routinely**, by GitHub Actions on every push to `main` |
| `DnsStack` | The `danblack.co` hosted zone | **Manually, one time** |
| `GitHubOidcStack` | GitHub OIDC provider and the `danblack-github-deploy` role | **Manually, one time** |

**Going forward, only `SiteStack` gets deployed.** The other two change rarely and break a lot
if they go wrong (DNS for the whole domain, and the deploy pipeline's own access), so they're
kept out of routine deploys to keep the blast radius small. Deploys always use
`cdk deploy SiteStack --exclusively`; without `--exclusively`, CDK would also deploy the stacks
SiteStack depends on (DnsStack, via the hosted zone).

## Deploying the site

Push to `main`. `.github/workflows/deploy.yml` builds the site and deploys `SiteStack` using the
OIDC role; no AWS keys are stored in GitHub. Pull requests run `ci.yml` (typecheck, build, synth)
with no AWS access.

To deploy by hand instead (from the repo root):

```sh
aws sso login --profile danblackco
pnpm build
pnpm --filter infra deploy -- --profile danblackco
```

`SiteStack` only exists once `web/dist` does, so deploying without a build fails rather than
shipping an empty bucket.

## Setup history

What was done to stand this up, in order. Each step is one time; it shouldn't need repeating
unless the account is rebuilt from scratch.

| Date | Step | Notes |
| --- | --- | --- |
| 2026-10-25 | Created the `danblackco` account in the AWS Organization and gave my Identity Center user `AdministratorAccess` on it | Added the `danblackco` profile to `~/.aws/config` |
| 2026-10-25 | Bootstrapped CDK: `npx cdk bootstrap aws://621422876704/us-east-1 --profile danblackco` | Creates the `CDKToolkit` stack (asset bucket and the `cdk-hnb659fds-*` roles the deploy role assumes) |
| 2026-10-25 | Deployed `SiteStack` (CloudFront domain only) | Site at `d2wk0au8zuhltv.cloudfront.net`, distribution `EI1I79S2IN3RO` |
| 2026-10-25 | Deployed `GitHubOidcStack`: `npx cdk deploy GitHubOidcStack --profile danblackco` | Role `arn:aws:iam::621422876704:role/danblack-github-deploy`, hardcoded in `deploy.yml`; trusts only `main` of `daniel-black/danblack` |
| 2026-10-25 | Deployed `DnsStack`: `npx cdk deploy DnsStack --profile danblackco` | Nameservers: `ns-1074.awsdns-06.org`, `ns-61.awsdns-07.com`, `ns-2044.awsdns-63.co.uk`, `ns-954.awsdns-55.net` |
| 2026-10-25 | Cut over the domain: set `"customDomain": true` in `cdk.json`, deployed `SiteStack`, and switched the nameservers at the registrar to the four above | The domain is registered at **Squarespace** (Domains → danblack.co → DNS → Nameservers). DNS was previously hosted by Vercel |

## Rebuilding from scratch

The same steps, generalized:

1. Create an account and an Identity Center profile for it.
2. `npx cdk bootstrap aws://ACCOUNT/us-east-1 --profile PROFILE`
3. Update the account ID in `.github/workflows/deploy.yml`, and the repo/branch in `bin/infra.ts` if they changed.
4. Deploy `GitHubOidcStack` and `DnsStack` once each.
5. With `"customDomain": false` in `cdk.json`, build and deploy `SiteStack`; check it on its `cloudfront.net` domain.
6. Set `"customDomain": true`, deploy `SiteStack` again, and point the registrar's nameservers at the `DnsStack` output. The certificate validates through the hosted zone, so it issues once the nameservers switch.

## Good to know

- The hosted zone, the OIDC provider, and the site bucket are kept (`RETAIN`) if their stacks are ever deleted, so a mistaken teardown doesn't take DNS, CI access, or content with it.
- `functions/url-rewrite.js` handles directory URLs, trailing-slash redirects, `www` → apex, and redirects for old URLs from the previous site. Add new legacy redirects to its `REDIRECTS` map.
- Use `pnpm run deploy`, not `pnpm deploy` (that's a built-in pnpm command).
