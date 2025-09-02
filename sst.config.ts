/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "taskwork",
      removal: input?.stage === "production" ? "retain" : "remove",
      home: "aws",
      providers: {
        aws: {
          region: "us-east-1",
        },
      },
    };
  },
  async run() {
    // VPC for secure database connection
    const vpc = new sst.aws.Vpc("TaskworkVpc", {
      bastion: true,
    });

    // RDS PostgreSQL Database
    const database = new sst.aws.Postgres("TaskworkDatabase", {
      engine: "postgres15.6",
      scaling: {
        min: "0.5 ACU",
        max: "16 ACU",
      },
      vpc,
    });

    // Clerk Authentication Secrets
    const clerkPublishableKey = new sst.Secret("ClerkPublishableKey");
    const clerkSecretKey = new sst.Secret("ClerkSecretKey");

    // Optional: Enterprise Integration Secrets
    const microsoftClientId = new sst.Secret("MicrosoftClientId");
    const microsoftClientSecret = new sst.Secret("MicrosoftClientSecret");
    const googleClientId = new sst.Secret("GoogleClientId");
    const googleClientSecret = new sst.Secret("GoogleClientSecret");
    const slackClientId = new sst.Secret("SlackClientId");
    const slackClientSecret = new sst.Secret("SlackClientSecret");

    // Next.js App with AWS Lambda
    const web = new sst.aws.Nextjs("TaskworkWeb", {
      vpc: {
        securityGroups: [database.securityGroups[0]],
        subnets: vpc.privateSubnets,
      },
      link: [
        database,
        clerkPublishableKey,
        clerkSecretKey,
        microsoftClientId,
        microsoftClientSecret,
        googleClientId,
        googleClientSecret,
        slackClientId,
        slackClientSecret,
      ],
      environment: {
        NODE_ENV: $app.stage === "production" ? "production" : "development",
        NEXT_PUBLIC_APP_URL: $app.stage === "production" 
          ? "https://taskwork.io" 
          : "https://dev.taskwork.io",
        NEXT_PUBLIC_APP_NAME: "TaskWork",
        NEXT_PUBLIC_COMPANY_NAME: "TaskWork",
        NEXT_PUBLIC_DOMAIN: $app.stage === "production" 
          ? "taskwork.io" 
          : "dev.taskwork.io",
      },
      domain: {
        name: $app.stage === "production" ? "taskwork.io" : "dev.taskwork.io",
        redirects: ["www.taskwork.io"],
      },
    });

    // S3 Bucket for File Storage
    const uploads = new sst.aws.Bucket("TaskworkUploads", {
      cors: [
        {
          allowedHeaders: ["*"],
          allowedMethods: ["GET", "POST", "PUT", "DELETE"],
          allowedOrigins: [
            $app.stage === "production" 
              ? "https://taskwork.io" 
              : "https://dev.taskwork.io"
          ],
        },
      ],
    });

    // API Gateway for additional endpoints
    const api = new sst.aws.ApiGatewayV2("TaskworkApi", {
      cors: {
        allowOrigins: [
          $app.stage === "production" 
            ? "https://taskwork.io" 
            : "https://dev.taskwork.io"
        ],
        allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowHeaders: ["Content-Type", "Authorization"],
      },
    });

    // Lambda function for background jobs
    const backgroundJobs = new sst.aws.Function("BackgroundJobs", {
      handler: "src/functions/background-jobs.handler",
      timeout: "15 minutes",
      link: [database],
      vpc: {
        securityGroups: [database.securityGroups[0]],
        subnets: vpc.privateSubnets,
      },
    });

    // CloudWatch Event Rule for scheduled tasks
    new sst.aws.Cron("DailyTasks", {
      schedule: "cron(0 2 * * ? *)", // 2 AM daily
      job: backgroundJobs,
    });

    return {
      web: web.url,
      database: {
        host: database.host,
        port: database.port,
        database: database.database,
        username: database.username,
        password: database.password,
      },
      uploads: uploads.name,
    };
  },
});
