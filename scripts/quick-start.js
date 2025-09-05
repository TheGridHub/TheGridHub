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
🚀 TheGridHub Quick Start Setup
===============================

This script will help you get TheGridHub up and running quickly.
`);

  // Choose deployment method
  console.log('Choose your deployment method:');
  console.log('1. ☁️  Vercel + Supabase (Recommended - Free, scalable)');
  console.log('2. 🏠 Local Development (Quick testing)');
  
  const choice = await question('\nEnter your choice (1 or 2): ');
  
  if (choice === '1') {
    await setupVercelSupabase();
  } else if (choice === '2') {
    await setupLocal();
  } else {
    console.log('Invalid choice. Please run the script again.');
    process.exit(1);
  }

  rl.close();
}

async function setupVercelSupabase() {
  console.log('\n☁️  Setting up Vercel + Supabase Deployment\n');

  // Supabase setup
  console.log('📊 Step 1: Create Supabase Database');
  console.log('1. Go to https://supabase.com');
  console.log('2. Sign up (use GitHub for easy auth)');
  console.log('3. Create new project with a strong password');
  console.log('4. Wait for database to be ready (~2 minutes)');
  console.log('5. Go to Settings → Database');
  console.log('6. Copy the "Connection string" (URI)');
  
  const dbUrl = await question('\nPaste your Supabase DATABASE_URL: ');
  const directUrl = dbUrl.replace('?pgbouncer=true&connection_limit=1', '');
  
  // Update .env.local file
const envContent = `# Supabase Database
DATABASE_URL="${dbUrl}"
DIRECT_URL="${directUrl}"

# Clerk Authentication (optional)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=${process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || 'pk_test_...'}
CLERK_SECRET_KEY=${process.env.CLERK_SECRET_KEY || 'sk_test_...'}
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding

# Application URLs
NEXT_PUBLIC_APP_URL=https://thegridhub.vercel.app
NEXT_PUBLIC_APP_NAME=TheGridHub
NEXT_PUBLIC_COMPANY_NAME=TheGridHub
NEXT_PUBLIC_DOMAIN=thegridhub.co
`;
  
  fs.writeFileSync('.env.local', envContent);
  console.log('✅ Created .env.local with Supabase configuration');

  // Push database schema
  console.log('\n🗄️ Creating database tables...');
  exec('npm run db:push');

  // Vercel setup
  console.log('\n🚀 Step 2: Deploy to Vercel');
  console.log('\nRunning: vercel');
  console.log('Follow the prompts to deploy your app.');
  console.log('\nIMPORTANT: After deployment, add environment variables in Vercel dashboard!');
  
  exec('vercel');

  console.log('\n🎉 Deployment Complete!');
  console.log('\nNext steps:');
  console.log('1. Go to your Vercel dashboard');
  console.log('2. Add all environment variables from .env.local');
  console.log('3. Redeploy for changes to take effect');
  console.log('4. Visit your app and create an account');
  console.log('5. Set up custom domain (optional)');
}

async function setupLocal() {
  console.log('\n🏠 Setting up Local Development\n');

  // Database choice
  console.log('Choose your database:');
  console.log('1. 🚀 Supabase (Recommended - same as production)');
  console.log('2. 💾 Local PostgreSQL');
  
  const dbChoice = await question('Enter your choice (1 or 2): ');
  
  if (dbChoice === '1') {
    console.log('\n🚀 Setting up Supabase database:');
    console.log('1. Go to https://supabase.com');
    console.log('2. Sign up with GitHub');
    console.log('3. Create new project with a strong password');
    console.log('4. Wait for database to be ready (~2 minutes)');
    console.log('5. Go to Settings → Database');
    console.log('6. Copy the "Connection string" (URI)');
    
    const dbUrl = await question('\nPaste your Supabase DATABASE_URL: ');
    
    // Create .env.local file
    const directUrl = dbUrl.replace('?pgbouncer=true&connection_limit=1', '');
    const envContent = `DATABASE_URL="${dbUrl}"
DIRECT_URL="${directUrl}"

# Add your Clerk keys below
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
`;
    fs.writeFileSync('.env.local', envContent);
    console.log('✅ Database URL updated in .env.local');
    
  } else if (dbChoice === '2') {
console.log('\n💾 Local PostgreSQL setup:');
  console.log('1. Install PostgreSQL from: https://www.postgresql.org/download/');
  console.log('2. Create a database called "thegridhub"');
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
let envPath = '.env.local'
  let envContent
  try {
    envContent = fs.readFileSync(envPath, 'utf8')
  } catch {
    envContent = ''
  }
  if (!envContent.includes('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=')) {
    envContent += `\nNEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=${publishableKey}`
  } else {
    envContent = envContent.replace(
      /NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=.*/,
      `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=${publishableKey}`
    )
  }
  if (!envContent.includes('CLERK_SECRET_KEY=')) {
    envContent += `\nCLERK_SECRET_KEY=${secretKey}`
  } else {
    envContent = envContent.replace(
      /CLERK_SECRET_KEY=.*/,
      `CLERK_SECRET_KEY=${secretKey}`
    )
  }
  fs.writeFileSync(envPath, envContent)
  console.log('✅ Clerk keys updated in .env.local');

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

