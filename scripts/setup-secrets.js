#!/usr/bin/env node

const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function setupSecrets() {
  console.log('🔐 TaskWork AWS Secrets Setup\n');
  console.log('This script will help you set up the required secrets for AWS deployment.\n');
  
  try {
    // Check if AWS CLI is configured
    console.log('Checking AWS configuration...');
    execSync('aws sts get-caller-identity', { stdio: 'pipe' });
    console.log('✅ AWS CLI is configured\n');
  } catch (error) {
    console.log('❌ AWS CLI not configured. Run: aws configure');
    process.exit(1);
  }

  const stage = process.argv[2] || 'dev';
  console.log(`Setting up secrets for stage: ${stage}\n`);

  // Required secrets
  const secrets = [
    {
      name: 'ClerkPublishableKey',
      description: 'Clerk Publishable Key (pk_test_... or pk_live_...)',
      required: true
    },
    {
      name: 'ClerkSecretKey', 
      description: 'Clerk Secret Key (sk_test_... or sk_live_...)',
      required: true
    }
  ];

  // Optional enterprise integration secrets
  const optionalSecrets = [
    {
      name: 'MicrosoftClientId',
      description: 'Microsoft Azure App Client ID (optional)'
    },
    {
      name: 'MicrosoftClientSecret',
      description: 'Microsoft Azure App Client Secret (optional)'
    },
    {
      name: 'GoogleClientId',
      description: 'Google OAuth Client ID (optional)'
    },
    {
      name: 'GoogleClientSecret',
      description: 'Google OAuth Client Secret (optional)'
    },
    {
      name: 'SlackClientId',
      description: 'Slack App Client ID (optional)'
    },
    {
      name: 'SlackClientSecret',
      description: 'Slack App Client Secret (optional)'
    }
  ];

  // Set required secrets
  console.log('📋 Required Secrets:\n');
  for (const secret of secrets) {
    const value = await question(`Enter ${secret.description}: `);
    if (!value && secret.required) {
      console.log(`❌ ${secret.name} is required`);
      process.exit(1);
    }
    
    if (value) {
      try {
        execSync(`sst secret set ${secret.name} "${value}" --stage ${stage}`, { stdio: 'pipe' });
        console.log(`✅ ${secret.name} set successfully`);
      } catch (error) {
        console.log(`❌ Failed to set ${secret.name}: ${error.message}`);
      }
    }
  }

  // Ask about optional secrets
  console.log('\n📋 Optional Enterprise Integration Secrets:\n');
  const setupOptional = await question('Do you want to set up enterprise integrations now? (y/N): ');
  
  if (setupOptional.toLowerCase() === 'y' || setupOptional.toLowerCase() === 'yes') {
    for (const secret of optionalSecrets) {
      const value = await question(`Enter ${secret.description} (press Enter to skip): `);
      
      if (value) {
        try {
          execSync(`sst secret set ${secret.name} "${value}" --stage ${stage}`, { stdio: 'pipe' });
          console.log(`✅ ${secret.name} set successfully`);
        } catch (error) {
          console.log(`❌ Failed to set ${secret.name}: ${error.message}`);
        }
      } else {
        console.log(`⏭️  Skipped ${secret.name}`);
      }
    }
  } else {
    console.log('⏭️  Skipping optional secrets (you can set them later)');
  }

  console.log('\n🎉 Secrets setup complete!\n');
  console.log('Next steps:');
  console.log(`1. Run: npm run sst:deploy${stage === 'dev' ? ':dev' : ''}`);
  console.log('2. Your TaskWork app will be deployed to AWS!');

  rl.close();
}

// Handle different ways the script might be called
if (require.main === module) {
  setupSecrets().catch(error => {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  });
}
