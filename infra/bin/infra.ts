#!/usr/bin/env node
import { existsSync } from 'node:fs';
import { App } from 'aws-cdk-lib';
import { DnsStack } from '../lib/dns-stack.ts';
import { GitHubOidcStack } from '../lib/github-oidc-stack.ts';
import { SITE_DIST, SiteStack } from '../lib/site-stack.ts';

const app = new App();
const env = { account: process.env.CDK_DEFAULT_ACCOUNT, region: 'us-east-1' };
const domainName = 'danblack.co';

// One-time setup: lets GitHub Actions on main deploy without long-lived keys.
new GitHubOidcStack(app, 'GitHubOidcStack', { env, repo: 'daniel-black/danblack', branch: 'main' });

// The domain's hosted zone. Point the registrar at its nameservers after the first deploy.
const dns = new DnsStack(app, 'DnsStack', { env, domainName });

// Serving on danblack.co is switched on with the `customDomain` context flag (cdk.json) once
// the registrar points at Route 53; until then the site is on CloudFront's own domain.
const customDomain = [true, 'true'].includes(app.node.tryGetContext('customDomain')); // CLI -c gives a string

// The site deploys whatever is in web/dist, so it's only defined once there's a build.
// Without one, `cdk deploy SiteStack` fails (no such stack) rather than shipping an empty bucket.
if (existsSync(SITE_DIST)) {
  new SiteStack(app, 'SiteStack', {
    env,
    domain: customDomain ? { name: domainName, zone: dns.zone } : undefined,
  });
} else {
  console.warn(`SiteStack skipped: ${SITE_DIST} not found. Run \`pnpm build\` first.`);
}
