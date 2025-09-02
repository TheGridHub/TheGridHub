#!/usr/bin/env node

const { execSync } = require('child_process');
const readline = require('readline');
const fs = require('fs');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

function exec(command) {
  try {
    console.log(`\n🔄 Running: ${command}`);
    const result = execSync(command, { stdio: 'inherit' });
    console.log(`✅ Completed: ${command}`);
    return result;
  } catch (error) {
    console.log(`❌ Failed: ${command}`);
    console.log(`Error: ${error.message}`);
    return false;
  }
}

async function quickStart() {
  console.log(`
🚀 TaskWork Quick Start Setup
==============================

This script will help you get TaskWork up and running quickly.
You can choose between AWS serverless deployment or local development.
`);

  // Choose deployment method
  console.log('Choose your deployment method:');
  console.log('1. 🚀 AWS Serverless (Production-ready, scales automatically)');
  console.log('2. 🏠 Local Development (Quick testing, local database)');
  
  const choice = await question('\nEnter your choice (1 or 2): ');
  
  if (choice === '1') {
    await setupAWS();
  } else if (choice === '2') {
    await setupLocal();
  } else {
    console.log('Invalid choice. Please run the script again.');
    process.exit(1);
  }

  rl.close();
}

async function setupAWS() {
  console.log('\n🚀 Setting up AWS Serverless Deployment\n');

  // Check prerequisites
  console.log('Checking prerequisites...');
  
  // Check AWS CLI
  try {
    execSync('aws --version', { stdio: 'pipe' });
    console.log('✅ AWS CLI is installed');
  } catch (error) {
    console.log('❌ AWS CLI not found. Please install it from: https://aws.amazon.com/cli/');
    console.log('Or run: choco install awscli');
    process.exit(1);
  }

  // Check AWS configuration
  try {
    execSync('aws sts get-caller-identity', { stdio: 'pipe' });
    console.log('✅ AWS CLI is configured');
  } catch (error) {
    console.log('❌ AWS CLI not configured. Please run: aws configure');
    process.exit(1);
  }

  // Set up Clerk
  console.log('\n📋 Setting up Authentication');
  console.log('1. Go to https://clerk.com');
  console.log('2. Create account and new application');  
  console.log('3. Copy your keys from the dashboard');
  
  await question('\nPress Enter when you have your Clerk keys ready...');

  // Run secrets setup
  console.log('\n🔐 Setting up secrets...');
  exec('npm run aws:secrets dev');

  // Deploy to AWS
  console.log('\n🚀 Deploying to AWS...');
  exec('npm run sst:deploy:dev');

  // Set up database
  console.log('\n🗄️ Setting up database...');
  exec('npm run db:push');

  console.log('\n🎉 AWS Deployment Complete!');
  console.log('Your app is live at: https://dev.taskwork.io');
  console.log('\nNext steps:');
  console.log('1. Visit your app and sign up');
  console.log('2. Create your first project');
  console.log('3. Invite team members');
  console.log('4. Set up enterprise integrations (optional)');
}

async function setupLocal() {
  console.log('\n🏠 Setting up Local Development\n');

  // Database choice
  console.log('Choose your database:');
  console.log('1. 🚂 Railway (Free, cloud-hosted)');
  console.log('2. 💾 Local PostgreSQL');
  
  const dbChoice = await question('Enter your choice (1 or 2): ');
  
  if (dbChoice === '1') {
    console.log('\n🚂 Setting up Railway database:');
    console.log('1. Go to https://railway.app');
    console.log('2. Sign up with GitHub');
    console.log('3. Create new project → Provision PostgreSQL');
    console.log('4. Copy the DATABASE_URL from settings');
    
    const dbUrl = await question('\nPaste your Railway DATABASE_URL: ');
    
    // Update .env file
    let envContent = fs.readFileSync('.env', 'utf8');
    envContent = envContent.replace(
      /DATABASE_URL="postgresql:\/\/.*"/,
      `DATABASE_URL="${dbUrl}"`
    );
    fs.writeFileSync('.env', envContent);
    console.log('✅ Database URL updated in .env');
    
  } else if (dbChoice === '2') {
    console.log('\n💾 Local PostgreSQL setup:');
    console.log('1. Install PostgreSQL from: https://www.postgresql.org/download/');
    console.log('2. Create a database called "taskwork"');
    console.log('3. Update the DATABASE_URL in your .env file');
    
    await question('\nPress Enter when your local PostgreSQL is ready...');
  }

  // Clerk setup
  console.log('\n📋 Setting up Clerk Authentication:');
  console.log('1. Go to https://clerk.com');
  console.log('2. Create account and new application');
  console.log('3. Copy your publishable key and secret key');
  
  const publishableKey = await question('\nEnter your Clerk Publishable Key: ');
  const secretKey = await question('Enter your Clerk Secret Key: ');
  
  // Update .env file
  let envContent = fs.readFileSync('.env', 'utf8');
  envContent = envContent.replace(
    /NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=.*/,
    `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=${publishableKey}`
  );
  envContent = envContent.replace(
    /CLERK_SECRET_KEY=.*/,
    `CLERK_SECRET_KEY=${secretKey}`
  );
  fs.writeFileSync('.env', envContent);
  console.log('✅ Clerk keys updated in .env');

  // Set up database
  console.log('\n🗄️ Setting up database schema...');
  exec('npm run db:push');

  // Start development server
  console.log('\n🔄 Starting development server...');
  console.log('Your app will be available at: http://localhost:3000');
  console.log('\nPress Ctrl+C to stop the server when you\'re done testing.');
  
  await question('\nPress Enter to start the development server...');
  exec('npm run dev');
}

// Handle different ways the script might be called
if (require.main === module) {
  quickStart().catch(error => {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  });
}
