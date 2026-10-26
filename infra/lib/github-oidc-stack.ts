import { CfnOutput, Duration, RemovalPolicy, Stack, type StackProps } from 'aws-cdk-lib';
import { OidcProviderNative, OpenIdConnectPrincipal, PolicyStatement, Role } from 'aws-cdk-lib/aws-iam';
import type { Construct } from 'constructs';

interface GitHubOidcStackProps extends StackProps {
  /** "owner/repo" allowed to assume the deploy role. */
  repo: string;
  /** Only workflows running on this branch can deploy. */
  branch: string;
}

/**
 * GitHub Actions → AWS without long-lived keys. The deploy workflow assumes the role it
 * creates. The role can only assume CDK's bootstrap roles, which do the actual deploying.
 *
 * MANUAL, ONE-TIME stack: deployed by hand on 2026-10-25. Not part of routine deploys (those
 * deploy only SiteStack, with --exclusively). See infra/README.md before changing it.
 */
export class GitHubOidcStack extends Stack {
  constructor(scope: Construct, id: string, props: GitHubOidcStackProps) {
    super(scope, id, props);

    const provider = new OidcProviderNative(this, 'GitHubProvider', {
      url: 'https://token.actions.githubusercontent.com',
      clientIds: ['sts.amazonaws.com'],
      removalPolicy: RemovalPolicy.RETAIN,
    });

    const role = new Role(this, 'DeployRole', {
      roleName: 'danblack-github-deploy',
      description: `Deploys danblack.co from ${props.repo}@${props.branch}`,
      maxSessionDuration: Duration.hours(1),
      assumedBy: new OpenIdConnectPrincipal(provider, {
        StringEquals: { 'token.actions.githubusercontent.com:aud': 'sts.amazonaws.com' },
        StringLike: { 'token.actions.githubusercontent.com:sub': `repo:${props.repo}:ref:refs/heads/${props.branch}` },
      }),
    });

    role.addToPolicy(
      new PolicyStatement({
        actions: ['sts:AssumeRole'],
        resources: ['deploy', 'file-publishing', 'lookup'].map(
          (kind) => `arn:aws:iam::${this.account}:role/cdk-hnb659fds-${kind}-role-${this.account}-${this.region}`,
        ),
      }),
    );

    new CfnOutput(this, 'DeployRoleArn', {
      value: role.roleArn,
      description: 'Referenced by .github/workflows/deploy.yml',
    });
  }
}
