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

    // Next.js App with AWS Lambda (simplified - no VPC)
    const web = new sst.aws.Nextjs("TaskworkWeb", {
      link: [
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
        redirects: $app.stage === "production" ? ["www.taskwork.io"] : [],
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
              : "https://dev.taskwork.io",
            "http://localhost:3000" // For local development
          ],
        },
      ],
    });

    return {
      web: web.url,
      uploads: uploads.name,
    };
  },
});
