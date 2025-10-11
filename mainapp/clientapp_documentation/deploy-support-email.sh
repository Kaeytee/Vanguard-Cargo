#!/bin/bash

# =====================================================
# DEPLOY SUPPORT EMAIL SYSTEM
# =====================================================
# This script deploys the complete support email system
# to Supabase and sets up all necessary environment variables
# =====================================================

echo "🚀 Deploying Vanguard Cargo Support Email System (Resend SDK)..."
echo "=============================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    print_error "Supabase CLI is not installed!"
    echo "Please install it with: npm install -g supabase"
    exit 1
fi

print_success "Supabase CLI found!"

# Check if user is logged in
if ! supabase status &> /dev/null; then
    print_warning "Not logged in to Supabase. Please login first:"
    echo "supabase login"
    exit 1
fi

print_success "Logged in to Supabase!"

# Link to project
print_status "Linking to Vanguard Cargo project..."
supabase link --project-ref rsxxjcsmcrcxdmyuytzc

if [ $? -eq 0 ]; then
    print_success "Project linked successfully!"
else
    print_error "Failed to link project. Please check your project reference."
    exit 1
fi

# Check if environment variables are set
print_status "Checking environment variables..."

# Check for required secrets
SECRETS=$(supabase secrets list 2>/dev/null)

if echo "$SECRETS" | grep -q "RESEND_API_KEY"; then
    print_success "RESEND_API_KEY is set"
else
    print_warning "RESEND_API_KEY is not set!"
    echo "Please set it with: supabase secrets set RESEND_API_KEY=your_api_key_here"
fi

if echo "$SECRETS" | grep -q "ADMIN_EMAIL"; then
    print_success "ADMIN_EMAIL is set"
else
    print_warning "ADMIN_EMAIL is not set!"
    echo "Please set it with: supabase secrets set ADMIN_EMAIL=your-email@example.com"
fi

# Deploy the Edge Function
print_status "Deploying resend-email Edge Function..."
supabase functions deploy resend-email

if [ $? -eq 0 ]; then
    print_success "Edge Function deployed successfully!"
else
    print_error "Failed to deploy Edge Function!"
    exit 1
fi

# List deployed functions
print_status "Listing deployed functions..."
supabase functions list

# Test the function (optional)
echo ""
echo "🧪 Testing the deployed function..."
echo "=================================="

read -p "Do you want to test the function now? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Testing function with sample data..."
    
    # Get the function URL
    FUNCTION_URL="https://rsxxjcsmcrcxdmyuytzc.supabase.co/functions/v1/resend-email"
    
    # Test payload
    TEST_PAYLOAD='{
        "name": "Test User",
        "email": "test@example.com",
        "subject": "Test Support Message",
        "message": "This is a test message from the deployment script.",
        "category": "general"
    }'
    
    # Make test request
    RESPONSE=$(curl -s -X POST "$FUNCTION_URL" \
        -H "Authorization: Bearer $(supabase status | grep 'anon key' | awk '{print $3}')" \
        -H "Content-Type: application/json" \
        -d "$TEST_PAYLOAD")
    
    if echo "$RESPONSE" | grep -q '"success":true'; then
        print_success "Test message sent successfully!"
        echo "Check your admin email for the test message."
    else
        print_error "Test failed. Response: $RESPONSE"
    fi
fi

# Show function logs
echo ""
echo "📋 Recent function logs:"
echo "======================="
supabase functions logs resend-email --limit 10

echo ""
echo "✅ Deployment Complete!"
echo "======================"
echo ""
echo "📧 Your support email system is now live!"
echo ""
echo "Next steps:"
echo "1. Test the support form on your website: /support"
echo "2. Check your admin email for notifications"
echo "3. Monitor function logs with: supabase functions logs resend-email --follow"
echo ""
echo "Environment Variables Set:"
supabase secrets list
echo ""
echo "🎉 Happy emailing!"
