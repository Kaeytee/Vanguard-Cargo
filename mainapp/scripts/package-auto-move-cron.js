#!/usr/bin/env node

/**
 * Package Auto-Move Cron Job
 * 
 * This script can be set up as a cron job to automatically move packages
 * from 'processing' to 'shipped' status after 112 hours.
 * 
 * Setup instructions:
 * 1. Make this file executable: chmod +x package-auto-move-cron.js
 * 2. Add to crontab to run every hour: 0 * * * * /path/to/package-auto-move-cron.js
 * 3. Or run every 6 hours: 0 */6 * * * /path/to/package-auto-move-cron.js
 * 
 * @author Senior Software Engineer
 * @version 1.0.0
 * @created 2025-10-03
 */

const path = require('path');
const { execSync } = require('child_process');

// Configuration
const PROJECT_ROOT = path.resolve(__dirname, '..');
const LOG_FILE = path.join(PROJECT_ROOT, 'logs', 'package-auto-move.log');

/**
 * Log message with timestamp
 */
function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  
  console.log(logMessage);
  
  // Also write to log file if logs directory exists
  try {
    const fs = require('fs');
    const logDir = path.dirname(LOG_FILE);
    
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    
    fs.appendFileSync(LOG_FILE, logMessage + '\n');
  } catch (error) {
    console.error('Failed to write to log file:', error.message);
  }
}

/**
 * Main cron job function
 */
async function runCronJob() {
  log('Package Auto-Move Cron Job Started');
  
  try {
    // Change to project directory
    process.chdir(PROJECT_ROOT);
    
    // Run the auto-move utility using Node.js
    const command = 'npx ts-node src/utils/runPackageAutoMove.ts';
    
    log(`Executing command: ${command}`);
    
    const output = execSync(command, {
      encoding: 'utf8',
      timeout: 300000, // 5 minutes timeout
      stdio: 'pipe'
    });
    
    log('Command output:');
    log(output);
    
    log('Package Auto-Move Cron Job Completed Successfully');
    
  } catch (error) {
    log(`Package Auto-Move Cron Job Failed: ${error.message}`);
    
    if (error.stdout) {
      log('STDOUT:');
      log(error.stdout);
    }
    
    if (error.stderr) {
      log('STDERR:');
      log(error.stderr);
    }
    
    process.exit(1);
  }
}

// Run the cron job
runCronJob();
