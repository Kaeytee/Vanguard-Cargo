#!/usr/bin/env node

// =====================================================
// TEST SUPPORT EMAIL SYSTEM
// =====================================================
// This script tests the support email system by sending
// a test message to verify everything is working
// =====================================================

const https = require('https');

// Configuration
const SUPABASE_URL = 'https://rsxxjcsmcrcxdmyuytzc.supabase.co';
const FUNCTION_URL = `${SUPABASE_URL}/functions/v1/send-support-email`;

// You'll need to get your anon key from Supabase dashboard
const ANON_KEY = 'your_anon_key_here'; // Replace with actual anon key

// Test data
const testMessage = {
    name: 'Test User',
    email: 'test@example.com',
    subject: 'Test Support Message',
    message: 'This is a test message to verify the support email system is working correctly.',
    category: 'general'
};

console.log('🧪 Testing Support Email System...');
console.log('===================================');
console.log(`Function URL: ${FUNCTION_URL}`);
console.log(`Test Message:`, testMessage);
console.log('');

// Prepare request data
const postData = JSON.stringify(testMessage);

const options = {
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${ANON_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
    }
};

// Make the request
const req = https.request(FUNCTION_URL, options, (res) => {
    console.log(`📡 Response Status: ${res.statusCode}`);
    console.log(`📋 Response Headers:`, res.headers);
    console.log('');

    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        try {
            const response = JSON.parse(data);
            console.log('📧 Response Data:');
            console.log(JSON.stringify(response, null, 2));
            
            if (response.success) {
                console.log('');
                console.log('✅ SUCCESS! Email system is working!');
                console.log(`📨 Message ID: ${response.messageId}`);
                console.log(`📬 Email Sent: ${response.emailSent ? 'Yes' : 'No'}`);
                console.log('');
                console.log('🎉 Check your admin email for the test message!');
            } else {
                console.log('');
                console.log('❌ FAILED! There was an error:');
                console.log(`Error: ${response.error || response.message}`);
            }
        } catch (error) {
            console.log('❌ FAILED! Invalid JSON response:');
            console.log(data);
        }
    });
});

req.on('error', (error) => {
    console.log('❌ FAILED! Request error:');
    console.error(error);
});

// Send the request
req.write(postData);
req.end();

console.log('⏳ Sending test message...');
console.log('');
