#!/usr/bin/env node
import { App } from 'aws-cdk-lib';
import { SiteStack } from '../lib/site-stack.ts';

const app = new App();

new SiteStack(app, 'SiteStack', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: 'us-east-1' },
});
