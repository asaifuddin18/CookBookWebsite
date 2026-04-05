import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

export class CookbookStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // DynamoDB table
    const table = new dynamodb.Table(this, 'RecipesTable', {
      tableName: 'recipes',
      partitionKey: {
        name: 'recipeId',
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // DynamoDB table for user favorites
    const favoritesTable = new dynamodb.Table(this, 'FavoritesTable', {
      tableName: 'cookbook-favorites',
      partitionKey: {
        name: 'userId',
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // S3 bucket for recipe images — public read, pre-signed URL uploads
    const imageBucket = new s3.Bucket(this, 'RecipeImagesBucket', {
      blockPublicAccess: new s3.BlockPublicAccess({
        blockPublicAcls: true,
        ignorePublicAcls: true,
        blockPublicPolicy: false,
        restrictPublicBuckets: false,
      }),
      publicReadAccess: true,
      cors: [
        {
          allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.PUT],
          allowedOrigins: ['*'],
          allowedHeaders: ['*'],
          maxAge: 3000,
        },
      ],
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // IAM user with least-privilege access for the Next.js app
    const appUser = new iam.User(this, 'CookbookAppUser', {
      userName: 'cookbook-app',
    });

    appUser.attachInlinePolicy(new iam.Policy(this, 'CookbookAppPolicy', {
      statements: [
        // DynamoDB — recipes table
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            'dynamodb:GetItem',
            'dynamodb:PutItem',
            'dynamodb:UpdateItem',
            'dynamodb:DeleteItem',
            'dynamodb:Scan',
          ],
          resources: [table.tableArn],
        }),
        // DynamoDB — favorites table
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            'dynamodb:GetItem',
            'dynamodb:UpdateItem',
          ],
          resources: [favoritesTable.tableArn],
        }),
        // Bedrock — invoke Claude Haiku 3 for macro estimation and recipe import
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: ['bedrock:InvokeModel'],
          resources: [
            'arn:aws:bedrock:us-east-1:664658497880:inference-profile/us.anthropic.claude-sonnet-4-6',
            'arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-sonnet-4-6',
            'arn:aws:bedrock:us-west-2::foundation-model/anthropic.claude-sonnet-4-6',
            'arn:aws:bedrock:us-east-2::foundation-model/anthropic.claude-sonnet-4-6',
          ],
        }),
        // S3 — PutObject and DeleteObject under images/ prefix
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: ['s3:PutObject', 's3:DeleteObject'],
          resources: [`${imageBucket.bucketArn}/images/*`],
        }),
      ],
    }));

    // Access key — stored in CloudFormation outputs
    const accessKey = new iam.CfnAccessKey(this, 'CookbookAppAccessKey', {
      userName: appUser.userName,
    });

    // IAM user for CDK deployments (local dev via 1Password)
    const cdkUser = new iam.User(this, 'CookbookCdkUser', {
      userName: 'cookbook-cdk',
    });

    cdkUser.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AdministratorAccess'));

    const cdkAccessKey = new iam.CfnAccessKey(this, 'CookbookCdkAccessKey', {
      userName: cdkUser.userName,
    });

    // --- GitHub Actions OIDC ---
    const githubProvider = new iam.OpenIdConnectProvider(this, 'GitHubOIDCProvider', {
      url: 'https://token.actions.githubusercontent.com',
      clientIds: ['sts.amazonaws.com'],
    });

    const githubActionsRole = new iam.Role(this, 'GitHubActionsDeployRole', {
      roleName: 'cookbook-github-actions-deploy',
      assumedBy: new iam.WebIdentityPrincipal(githubProvider.openIdConnectProviderArn, {
        StringEquals: {
          'token.actions.githubusercontent.com:aud': 'sts.amazonaws.com',
        },
        StringLike: {
          'token.actions.githubusercontent.com:sub': 'repo:asaifuddin18/CookBookWebsite:*',
        },
      }),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('AdministratorAccess'),
      ],
    });

    // --- Vercel OIDC ---
    const vercelProvider = new iam.OpenIdConnectProvider(this, 'VercelOIDCProvider', {
      url: 'https://oidc.vercel.com/asaifuddin18s-projects',
      clientIds: ['https://vercel.com/asaifuddin18s-projects'],
    });

    const vercelRole = new iam.Role(this, 'VercelAppRole', {
      roleName: 'cookbook-vercel-app',
      assumedBy: new iam.WebIdentityPrincipal(vercelProvider.openIdConnectProviderArn, {
        StringEquals: {
          'oidc.vercel.com/asaifuddin18s-projects:aud': 'https://vercel.com/asaifuddin18s-projects',
        },
      }),
    });

    vercelRole.attachInlinePolicy(new iam.Policy(this, 'VercelAppPolicy', {
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: ['dynamodb:GetItem', 'dynamodb:PutItem', 'dynamodb:UpdateItem', 'dynamodb:DeleteItem', 'dynamodb:Scan'],
          resources: [table.tableArn],
        }),
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: ['dynamodb:GetItem', 'dynamodb:UpdateItem'],
          resources: [favoritesTable.tableArn],
        }),
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: ['bedrock:InvokeModel'],
          resources: [
            'arn:aws:bedrock:us-east-1:664658497880:inference-profile/us.anthropic.claude-sonnet-4-6',
            'arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-sonnet-4-6',
            'arn:aws:bedrock:us-west-2::foundation-model/anthropic.claude-sonnet-4-6',
            'arn:aws:bedrock:us-east-2::foundation-model/anthropic.claude-sonnet-4-6',
          ],
        }),
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: ['s3:PutObject', 's3:DeleteObject'],
          resources: [`${imageBucket.bucketArn}/images/*`],
        }),
      ],
    }));

    // Outputs
    new cdk.CfnOutput(this, 'TableName', {
      value: table.tableName,
      description: 'DYNAMODB_TABLE_NAME',
    });

    new cdk.CfnOutput(this, 'FavoritesTableName', {
      value: favoritesTable.tableName,
      description: 'DYNAMODB_FAVORITES_TABLE_NAME',
    });

    new cdk.CfnOutput(this, 'BucketName', {
      value: imageBucket.bucketName,
      description: 'S3_BUCKET_NAME',
    });

    new cdk.CfnOutput(this, 'Region', {
      value: this.region,
      description: 'AWS_REGION',
    });

    new cdk.CfnOutput(this, 'AppAccessKeyId', {
      value: accessKey.ref,
      description: 'AWS_ACCESS_KEY_ID — replace in cookbook/.env.local',
    });

    new cdk.CfnOutput(this, 'AppSecretAccessKey', {
      value: accessKey.attrSecretAccessKey,
      description: 'AWS_SECRET_ACCESS_KEY — replace in cookbook/.env.local',
    });

    new cdk.CfnOutput(this, 'CdkAccessKeyId', {
      value: cdkAccessKey.ref,
      description: 'CDK_AWS_ACCESS_KEY_ID',
    });

    new cdk.CfnOutput(this, 'CdkSecretAccessKey', {
      value: cdkAccessKey.attrSecretAccessKey,
      description: 'CDK_AWS_SECRET_ACCESS_KEY',
    });

    new cdk.CfnOutput(this, 'VercelRoleArn', {
      value: vercelRole.roleArn,
      description: 'AWS_ROLE_ARN — set this in Vercel environment variables',
    });

    new cdk.CfnOutput(this, 'GitHubActionsRoleArn', {
      value: githubActionsRole.roleArn,
      description: 'Role ARN used by GitHub Actions to deploy CDK',
    });
  }
}
