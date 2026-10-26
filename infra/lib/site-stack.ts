import { fileURLToPath } from 'node:url';
import { CfnOutput, Duration, RemovalPolicy, Stack, type StackProps } from 'aws-cdk-lib';
import { Certificate, CertificateValidation } from 'aws-cdk-lib/aws-certificatemanager';
import {
  CachePolicy,
  Distribution,
  Function,
  FunctionCode,
  FunctionEventType,
  FunctionRuntime,
  HttpVersion,
  PriceClass,
  ResponseHeadersPolicy,
  ViewerProtocolPolicy,
} from 'aws-cdk-lib/aws-cloudfront';
import { S3BucketOrigin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { ARecord, AaaaRecord, type IHostedZone, RecordTarget } from 'aws-cdk-lib/aws-route53';
import { CloudFrontTarget } from 'aws-cdk-lib/aws-route53-targets';
import { BlockPublicAccess, Bucket, BucketEncryption } from 'aws-cdk-lib/aws-s3';
import { BucketDeployment, CacheControl, Source } from 'aws-cdk-lib/aws-s3-deployment';
import type { Construct } from 'constructs';

// The only coupling to the web package: its build output, deployed by path.
export const SITE_DIST = fileURLToPath(new URL('../../web/dist', import.meta.url));

interface SiteStackProps extends StackProps {
  /** Serve the site on this domain (and www) from this hosted zone. Off: CloudFront's own domain. */
  domain?: { name: string; zone: IHostedZone };
}

/** The static site: a private bucket served through CloudFront. */
export class SiteStack extends Stack {
  constructor(scope: Construct, id: string, props: SiteStackProps = {}) {
    super(scope, id, props);
    const { domain } = props;

    const bucket = new Bucket(this, 'SiteBucket', {
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      encryption: BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      removalPolicy: RemovalPolicy.RETAIN,
    });

    // Directory-style URLs and redirects (CloudFront's default root object only covers "/").
    const urlRewrite = new Function(this, 'UrlRewrite', {
      code: FunctionCode.fromFile({
        filePath: fileURLToPath(new URL('../functions/url-rewrite.js', import.meta.url)),
      }),
      runtime: FunctionRuntime.JS_2_0,
      comment: 'Directory index rewrites, trailing-slash and legacy redirects',
    });

    // CloudFront certificates must live in us-east-1 (this stack's region). Validated through
    // the hosted zone, so the domain's nameservers must already point at Route 53.
    const names = domain ? [domain.name, `www.${domain.name}`] : [];
    const certificate = domain
      ? new Certificate(this, 'Certificate', {
          domainName: domain.name,
          subjectAlternativeNames: [`www.${domain.name}`],
          validation: CertificateValidation.fromDns(domain.zone),
        })
      : undefined;

    const distribution = new Distribution(this, 'Distribution', {
      comment: 'danblack.co',
      domainNames: domain ? names : undefined,
      certificate,
      defaultRootObject: 'index.html',
      httpVersion: HttpVersion.HTTP2_AND_3,
      priceClass: PriceClass.PRICE_CLASS_100,
      defaultBehavior: {
        origin: S3BucketOrigin.withOriginAccessControl(bucket),
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: CachePolicy.CACHING_OPTIMIZED,
        responseHeadersPolicy: ResponseHeadersPolicy.SECURITY_HEADERS,
        compress: true,
        functionAssociations: [{ function: urlRewrite, eventType: FunctionEventType.VIEWER_REQUEST }],
      },
      // A private bucket answers 403 for missing keys; serve the site's 404 page for both.
      errorResponses: [403, 404].map((httpStatus) => ({
        httpStatus,
        responseHttpStatus: 404,
        responsePagePath: '/404.html',
        ttl: Duration.minutes(5),
      })),
    });

    // Hashed build assets: cache forever, and never prune them, so pages that are mid-deploy
    // (or cached in someone's browser) can still load the assets they reference.
    const assets = new BucketDeployment(this, 'DeployAssets', {
      sources: [Source.asset(SITE_DIST)],
      destinationBucket: bucket,
      exclude: ['*'],
      include: ['_astro/*'],
      prune: false,
      cacheControl: [CacheControl.fromString('public, max-age=31536000, immutable')],
    });

    // Everything else (HTML, sprites, robots, sitemap): always revalidate, then invalidate the
    // CDN. Excluding _astro/ also keeps the prune step from deleting those assets.
    const pages = new BucketDeployment(this, 'DeployPages', {
      sources: [Source.asset(SITE_DIST)],
      destinationBucket: bucket,
      exclude: ['_astro/*'],
      prune: true,
      cacheControl: [CacheControl.fromString('public, max-age=0, must-revalidate')],
      distribution,
      distributionPaths: ['/*'],
      memoryLimit: 512,
    });
    pages.node.addDependency(assets); // new assets land before the pages that use them

    // Apex and www both alias the distribution; the URL function redirects www to the apex.
    if (domain) {
      const target = RecordTarget.fromAlias(new CloudFrontTarget(distribution));
      for (const [i, name] of names.entries()) {
        new ARecord(this, `AliasA${i}`, { zone: domain.zone, recordName: name, target });
        new AaaaRecord(this, `AliasAaaa${i}`, { zone: domain.zone, recordName: name, target });
      }
    }

    new CfnOutput(this, 'DistributionDomainName', { value: distribution.distributionDomainName });
    new CfnOutput(this, 'DistributionId', { value: distribution.distributionId });
    new CfnOutput(this, 'BucketName', { value: bucket.bucketName });
  }
}
