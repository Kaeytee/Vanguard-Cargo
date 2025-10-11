# 🔐 SECURITY GUIDELINES
## Vanguard Cargo Logistics - Security Best Practices

### ⚠️ CRITICAL SECURITY ALERT

**GitHub has detected exposed Supabase service keys in this repository. This document provides comprehensive guidelines to prevent future security incidents.**

---

## 🚨 IMMEDIATE ACTIONS REQUIRED

### 1. **Rotate Exposed Keys Immediately**
```bash
# 1. Go to Supabase Dashboard > Settings > API
# 2. Generate new service role key
# 3. Update all production environments
# 4. Revoke the old key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2. **Check Security Logs**
- Monitor Supabase logs for unauthorized access
- Review API usage patterns for anomalies
- Check for any suspicious database activities

### 3. **Update All Environments**
- Replace keys in production deployments
- Update CI/CD pipeline configurations
- Notify team members of the security incident

---

## 🛡️ SECURITY BEST PRACTICES

### **Environment Variables Management**

#### ✅ **DO - Secure Practices**
```bash
# Use environment variables for all sensitive data
SUPABASE_URL=your_project_url_here
SUPABASE_SERVICE_ROLE_KEY=your_service_key_here
SUPABASE_ANON_KEY=your_anon_key_here

# Store in secure .env files (never commit to git)
echo "SUPABASE_SERVICE_ROLE_KEY=your_key" >> .env.local

# Use in code via process.env
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
```

#### ❌ **DON'T - Dangerous Practices**
```typescript
// NEVER hardcode keys in source code
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."; // ❌ DANGEROUS

// NEVER commit keys in configuration files
const config = {
  supabaseKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." // ❌ DANGEROUS
};
```

### **Git Security Configuration**

#### **1. .gitignore Configuration**
```gitignore
# Environment files
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Supabase configuration files with keys
supabase/.env
supabase/config.toml

# Sensitive scripts and files
sql/*_with_keys.txt
sql/*_credentials.txt
scripts/deploy_with_keys.sh

# IDE and editor files that might contain secrets
.vscode/settings.json
.idea/
*.swp
*.swo
*~

# Backup files that might contain sensitive data
*.backup
*.bak
*.tmp
```

#### **2. Git Hooks for Security**
```bash
#!/bin/bash
# pre-commit hook to prevent committing secrets
# Save as .git/hooks/pre-commit

# Check for common secret patterns
if git diff --cached --name-only | xargs grep -l "eyJ[A-Za-z0-9]" 2>/dev/null; then
    echo "❌ ERROR: Potential JWT token found in staged files!"
    echo "Please remove secrets before committing."
    exit 1
fi

if git diff --cached --name-only | xargs grep -l "supabase.*key.*=" 2>/dev/null; then
    echo "❌ ERROR: Potential Supabase key found in staged files!"
    echo "Please use environment variables instead."
    exit 1
fi

echo "✅ Security check passed"
```

### **Production Deployment Security**

#### **1. Environment-Specific Configuration**
```typescript
// config/environment.ts
interface EnvironmentConfig {
  supabaseUrl: string;
  supabaseServiceRoleKey: string;
  supabaseAnonKey: string;
  isDevelopment: boolean;
  isProduction: boolean;
}

/**
 * Secure environment configuration loader
 * Validates all required environment variables are present
 * @returns {EnvironmentConfig} Validated environment configuration
 */
export const getEnvironmentConfig = (): EnvironmentConfig => {
  // Validate required environment variables
  const requiredVars = [
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'SUPABASE_ANON_KEY'
  ];

  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }

  return {
    supabaseUrl: process.env.SUPABASE_URL!,
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY!,
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production'
  };
};
```

#### **2. Secure Supabase Client Configuration**
```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import { getEnvironmentConfig } from '../config/environment';

/**
 * Secure Supabase client factory
 * Uses environment variables and implements security best practices
 */
class SupabaseClientFactory {
  private static instance: any;
  
  /**
   * Creates a secure Supabase client instance
   * @returns {SupabaseClient} Configured Supabase client
   */
  public static createSecureClient() {
    if (!this.instance) {
      const config = getEnvironmentConfig();
      
      // Use anon key for client-side operations
      this.instance = createClient(
        config.supabaseUrl,
        config.supabaseAnonKey,
        {
          auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true
          },
          // Security headers
          global: {
            headers: {
              'X-Client-Info': 'vanguard-cargo-client'
            }
          }
        }
      );
    }
    
    return this.instance;
  }

  /**
   * Creates admin client for server-side operations
   * WARNING: Only use on server-side with proper authentication
   * @returns {SupabaseClient} Admin Supabase client
   */
  public static createAdminClient() {
    const config = getEnvironmentConfig();
    
    // Only allow admin client in server environment
    if (typeof window !== 'undefined') {
      throw new Error('Admin client cannot be used in browser environment');
    }
    
    return createClient(
      config.supabaseUrl,
      config.supabaseServiceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );
  }
}

export const supabase = SupabaseClientFactory.createSecureClient();
export const supabaseAdmin = SupabaseClientFactory.createAdminClient;
```

### **Script Security Guidelines**

#### **1. Secure Script Templates**
```bash
#!/bin/bash
# secure_script_template.sh
# Template for secure administrative scripts

# =====================================================
# SECURITY CHECKLIST
# =====================================================
# ✅ Uses environment variables for credentials
# ✅ Validates required variables are present
# ✅ Includes security warnings and instructions
# ✅ Logs all operations for audit trail
# ✅ Implements error handling and cleanup
# =====================================================

set -euo pipefail  # Exit on error, undefined vars, pipe failures

# Security validation function
validate_environment() {
    local required_vars=("SUPABASE_URL" "SUPABASE_SERVICE_ROLE_KEY")
    local missing_vars=()
    
    for var in "${required_vars[@]}"; do
        if [[ -z "${!var:-}" ]]; then
            missing_vars+=("$var")
        fi
    done
    
    if [[ ${#missing_vars[@]} -gt 0 ]]; then
        echo "❌ ERROR: Missing required environment variables:"
        printf '  - %s\n' "${missing_vars[@]}"
        echo ""
        echo "Please set these variables before running this script:"
        echo "export SUPABASE_URL='your_project_url'"
        echo "export SUPABASE_SERVICE_ROLE_KEY='your_service_key'"
        exit 1
    fi
}

# Audit logging function
log_operation() {
    local operation="$1"
    local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    echo "[$timestamp] AUDIT: $operation" >> /var/log/supabase_operations.log
}

# Main script execution
main() {
    echo "🔐 SECURE SUPABASE OPERATION SCRIPT"
    echo "=================================="
    
    # Validate environment
    validate_environment
    
    # Log script execution
    log_operation "Script started by user: $(whoami)"
    
    # Your secure operations here
    echo "✅ Environment validated"
    echo "✅ Ready for secure operations"
    
    # Example secure API call
    curl -X GET "${SUPABASE_URL}/rest/v1/users" \
        -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
        -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
        -H "Content-Type: application/json"
    
    log_operation "Script completed successfully"
}

# Cleanup function
cleanup() {
    log_operation "Script cleanup initiated"
    # Add any cleanup operations here
}

# Set trap for cleanup on exit
trap cleanup EXIT

# Execute main function
main "$@"
```

#### **2. Environment Setup Script**
```bash
#!/bin/bash
# setup_environment.sh
# Secure environment setup for development

echo "🔧 VANGUARD CARGO - ENVIRONMENT SETUP"
echo "===================================="

# Create secure .env.local file
create_env_file() {
    if [[ -f .env.local ]]; then
        echo "⚠️  .env.local already exists. Backing up..."
        cp .env.local .env.local.backup.$(date +%s)
    fi
    
    cat > .env.local << 'EOF'
# =====================================================
# VANGUARD CARGO - ENVIRONMENT CONFIGURATION
# =====================================================
# SECURITY WARNING: Never commit this file to git!
# Add .env.local to your .gitignore file
# =====================================================

# Supabase Configuration
SUPABASE_URL=your_supabase_project_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Application Configuration
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Security Configuration
SESSION_SECRET=generate_a_secure_random_string_here
ENCRYPTION_KEY=generate_a_32_character_encryption_key_here

# =====================================================
# SETUP INSTRUCTIONS:
# =====================================================
# 1. Replace all placeholder values with actual credentials
# 2. Get Supabase keys from: Dashboard > Settings > API
# 3. Generate secure random strings for secrets
# 4. Never share these credentials or commit to git
# =====================================================
EOF

    echo "✅ Created .env.local template"
    echo "📝 Please edit .env.local and add your actual credentials"
}

# Add .env.local to .gitignore if not present
update_gitignore() {
    if ! grep -q ".env.local" .gitignore 2>/dev/null; then
        echo "" >> .gitignore
        echo "# Environment files" >> .gitignore
        echo ".env.local" >> .gitignore
        echo "✅ Added .env.local to .gitignore"
    else
        echo "✅ .env.local already in .gitignore"
    fi
}

# Install git hooks for security
install_git_hooks() {
    mkdir -p .git/hooks
    
    cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
# Pre-commit hook to prevent committing secrets

echo "🔍 Running security checks..."

# Check for potential secrets in staged files
if git diff --cached --name-only | xargs grep -l "eyJ[A-Za-z0-9]" 2>/dev/null; then
    echo "❌ ERROR: Potential JWT token found!"
    echo "Please remove secrets before committing."
    exit 1
fi

if git diff --cached --name-only | xargs grep -l "supabase.*key.*=" 2>/dev/null; then
    echo "❌ ERROR: Potential Supabase key found!"
    echo "Please use environment variables instead."
    exit 1
fi

echo "✅ Security check passed"
EOF

    chmod +x .git/hooks/pre-commit
    echo "✅ Installed git security hooks"
}

# Main setup execution
main() {
    create_env_file
    update_gitignore
    install_git_hooks
    
    echo ""
    echo "🎉 SETUP COMPLETE!"
    echo "=================="
    echo "Next steps:"
    echo "1. Edit .env.local with your actual Supabase credentials"
    echo "2. Run 'npm install' to install dependencies"
    echo "3. Run 'npm run dev' to start development server"
    echo ""
    echo "🔐 Security reminders:"
    echo "- Never commit .env.local to git"
    echo "- Rotate keys regularly"
    echo "- Use different keys for different environments"
    echo "- Monitor Supabase logs for suspicious activity"
}

main "$@"
```

---

## 📋 SECURITY CHECKLIST

### **Before Every Commit**
- [ ] No hardcoded API keys or secrets
- [ ] All sensitive data uses environment variables
- [ ] .env files are in .gitignore
- [ ] No credentials in configuration files
- [ ] Security hooks are installed and working

### **Before Every Deployment**
- [ ] Environment variables are properly set
- [ ] Keys are different for each environment
- [ ] Service role keys are only used server-side
- [ ] Anon keys are used for client-side operations
- [ ] All credentials are validated and working

### **Regular Security Maintenance**
- [ ] Rotate API keys monthly
- [ ] Review Supabase access logs
- [ ] Update security dependencies
- [ ] Audit environment configurations
- [ ] Check for exposed credentials in git history

---

## 🚨 INCIDENT RESPONSE PLAN

### **If Credentials Are Exposed:**

1. **Immediate Response (0-15 minutes)**
   - Rotate all exposed keys immediately
   - Revoke old keys in Supabase dashboard
   - Check recent API usage for anomalies

2. **Assessment (15-60 minutes)**
   - Review security logs for unauthorized access
   - Identify scope of potential data exposure
   - Document timeline of the incident

3. **Remediation (1-24 hours)**
   - Update all environments with new keys
   - Remove exposed credentials from git history
   - Implement additional security measures
   - Notify relevant stakeholders

4. **Post-Incident (24+ hours)**
   - Conduct security review and lessons learned
   - Update security procedures and documentation
   - Implement preventive measures
   - Schedule follow-up security audit

---

## 📞 EMERGENCY CONTACTS

**Security Incident Response:**
- Lead Developer: [Contact Information]
- DevOps Team: [Contact Information]
- Security Team: [Contact Information]

**Supabase Support:**
- Dashboard: https://app.supabase.com
- Support: support@supabase.com
- Documentation: https://supabase.com/docs

---

## 📚 ADDITIONAL RESOURCES

- [Supabase Security Best Practices](https://supabase.com/docs/guides/auth/security)
- [GitHub Secret Scanning](https://docs.github.com/en/code-security/secret-scanning)
- [OWASP Security Guidelines](https://owasp.org/www-project-top-ten/)
- [Environment Variables Best Practices](https://12factor.net/config)

---

**Last Updated:** 2025-10-04  
**Version:** 1.0.0  
**Reviewed By:** Senior Software Engineer

---

> ⚠️ **REMEMBER:** Security is everyone's responsibility. When in doubt, ask for help rather than risk exposing sensitive information.
