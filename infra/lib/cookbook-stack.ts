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
        // DynamoDB — only the exact operations the app performs
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

    // Outputs
    new cdk.CfnOutput(this, 'TableName', {
      value: table.tableName,
      description: 'DYNAMODB_TABLE_NAME',
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
  }
}
