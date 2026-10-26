import { CfnOutput, Fn, RemovalPolicy, Stack, type StackProps } from 'aws-cdk-lib';
import { PublicHostedZone, TxtRecord } from 'aws-cdk-lib/aws-route53';
import type { Construct } from 'constructs';

interface DnsStackProps extends StackProps {
  domainName: string;
}

/**
 * The domain's hosted zone, kept separate from the site so it outlives any site changes.
 * After the first deploy, point the registrar at the NameServers output.
 *
 * MANUAL, ONE-TIME stack: deployed by hand on 2026-10-25. Not part of routine deploys (those
 * deploy only SiteStack, with --exclusively). See infra/README.md before changing it.
 */
export class DnsStack extends Stack {
  readonly zone: PublicHostedZone;

  constructor(scope: Construct, id: string, props: DnsStackProps) {
    super(scope, id, props);

    this.zone = new PublicHostedZone(this, 'Zone', { zoneName: props.domainName });
    this.zone.applyRemovalPolicy(RemovalPolicy.RETAIN);

    // Carried over from the previous DNS host: Google Search Console ownership verification.
    new TxtRecord(this, 'GoogleSiteVerification', {
      zone: this.zone,
      values: ['google-site-verification=Dbawg5faSbsx4JzoGhDJltabcwigRkItB8GaMG5V6u0'],
    });

    new CfnOutput(this, 'NameServers', {
      value: Fn.join(', ', this.zone.hostedZoneNameServers ?? []),
      description: "Set these as the domain's nameservers at the registrar",
    });
  }
}
