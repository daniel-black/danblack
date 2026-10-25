import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { Stack, type StackProps } from 'aws-cdk-lib';
import type { Construct } from 'constructs';

// The only coupling to the web package: its build output, deployed by path.
export const SITE_DIST = fileURLToPath(new URL('../../web/dist', import.meta.url));

export class SiteStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    if (!existsSync(SITE_DIST)) {
      throw new Error(`${SITE_DIST} not found. Run \`pnpm build\` before synth/deploy.`);
    }

    // TODO (build order step 2): bucket, OAC distribution, url-rewrite function,
    // error responses, BucketDeployments, outputs.
  }
}
