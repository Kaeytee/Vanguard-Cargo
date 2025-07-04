#!/usr/bin/env node

/**
 * Vercel Environment Setup Script
 * 
 * This script helps set up environment variables for Vercel deployment
 * Run with: node setup-vercel-env.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Ttarius Logistics - Vercel Environment Setup');
console.log('================================================\n');

// Check if vercel CLI is installed
try {
  execSync('vercel --version', { stdio: 'pipe' });
  console.log('✅ Vercel CLI is installed');
} catch (error) {
  console.log('❌ Vercel CLI not found. Installing...');
  try {
    execSync('npm install -g vercel', { stdio: 'inherit' });
    console.log('✅ Vercel CLI installed successfully');
  } catch (installError) {
    console.log('❌ Failed to install Vercel CLI. Please install manually:');
    console.log('   npm install -g vercel');
    process.exit(1);
  }
}

// Read environment variables from .env.production
const envPath = path.join(__dirname, '.env.production');
if (!fs.existsSync(envPath)) {
  console.log('❌ .env.production file not found');
  console.log('Please create .env.production with your environment variables');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};

// Parse environment variables
envContent.split('\n').forEach(line => {
  line = line.trim();
  if (line && !line.startsWith('#') && line.includes('=')) {
    const [key, ...valueParts] = line.split('=');
    envVars[key.trim()] = valueParts.join('=').trim();
  }
});

console.log('\n📋 Found environment variables:');
Object.keys(envVars).forEach(key => {
  const value = envVars[key];
  const maskedValue = key.includes('SECRET') ? '***masked***' : value;
  console.log(`   ${key}=${maskedValue}`);
});

console.log('\n🔧 Setting up Vercel environment variables...');
console.log('Note: You will be prompted to confirm each variable\n');

// Set each environment variable
Object.entries(envVars).forEach(([key, value]) => {
  try {
    console.log(`Setting ${key}...`);
    execSync(`vercel env add ${key} production`, { 
      input: `${value}\n`, 
      stdio: ['pipe', 'inherit', 'inherit'] 
    });
    console.log(`✅ ${key} set successfully`);
  } catch (error) {
    console.log(`⚠️  Error setting ${key}:`, error.message);
  }
});

console.log('\n🎉 Environment setup complete!');
console.log('\n📝 Next steps:');
console.log('1. Run: vercel --prod');
console.log('2. Or push to your git repository to trigger automatic deployment');
console.log('3. Check your Vercel dashboard to verify environment variables');
console.log('\n🔗 Vercel Dashboard: https://vercel.com/dashboard');
