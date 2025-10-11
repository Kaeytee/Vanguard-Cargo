// ============================================================================
// Security Headers Checker
// ============================================================================
// Description: Runtime utility to verify security headers are properly set
// Author: Senior Software Engineer
// Purpose: Validate production security posture and detect misconfigurations
// Usage: Call checkSecurityHeaders() in browser console
// ============================================================================

/**
 * Security Header Configuration
 * Expected headers and their values
 */
interface SecurityHeader {
  /** Header name */
  name: string;
  
  /** Expected value (can be partial match) */
  expectedValue?: string;
  
  /** Whether header is required */
  required: boolean;
  
  /** Description of what this header does */
  description: string;
  
  /** Security benefit */
  benefit: string;
}

/**
 * Security Headers Configuration
 * List of all expected security headers
 */
const EXPECTED_HEADERS: SecurityHeader[] = [
  {
    name: 'Content-Security-Policy',
    expectedValue: "default-src 'self'",
    required: true,
    description: 'Controls which resources can be loaded',
    benefit: 'Prevents XSS attacks by restricting resource origins'
  },
  {
    name: 'Strict-Transport-Security',
    expectedValue: 'max-age=',
    required: true,
    description: 'Forces HTTPS connections',
    benefit: 'Prevents protocol downgrade and cookie hijacking attacks'
  },
  {
    name: 'X-Frame-Options',
    expectedValue: 'DENY',
    required: true,
    description: 'Prevents page from being embedded in iframe',
    benefit: 'Protects against clickjacking attacks'
  },
  {
    name: 'X-Content-Type-Options',
    expectedValue: 'nosniff',
    required: true,
    description: 'Prevents MIME type sniffing',
    benefit: 'Prevents executing non-executable MIME types'
  },
  {
    name: 'X-XSS-Protection',
    expectedValue: '1',
    required: false,
    description: 'Legacy XSS filter for older browsers',
    benefit: 'Additional XSS protection for older browsers'
  },
  {
    name: 'Referrer-Policy',
    expectedValue: 'strict-origin',
    required: true,
    description: 'Controls referrer information',
    benefit: 'Protects user privacy by limiting referrer data'
  },
  {
    name: 'Permissions-Policy',
    expectedValue: 'camera=()',
    required: true,
    description: 'Controls browser features and APIs',
    benefit: 'Reduces attack surface by disabling unnecessary features'
  }
];

/**
 * Header Check Result
 */
interface HeaderCheckResult {
  /** Header name */
  header: string;
  
  /** Whether header is present */
  present: boolean;
  
  /** Actual header value */
  value?: string;
  
  /** Expected value */
  expected?: string;
  
  /** Whether value matches expectation */
  matches: boolean;
  
  /** Check status */
  status: 'pass' | 'fail' | 'warning';
  
  /** Status message */
  message: string;
}

/**
 * Overall Security Score
 */
interface SecurityScore {
  /** Score out of 100 */
  score: number;
  
  /** Letter grade */
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  
  /** Number of passed checks */
  passed: number;
  
  /** Number of failed checks */
  failed: number;
  
  /** Number of warnings */
  warnings: number;
  
  /** Total checks performed */
  total: number;
  
  /** Individual check results */
  results: HeaderCheckResult[];
  
  /** Overall status */
  status: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
}

/**
 * Check Security Headers
 * 
 * Fetches current page and inspects response headers.
 * Validates that all required security headers are present and correct.
 * 
 * @returns {Promise<SecurityScore>} Security score and detailed results
 */
export async function checkSecurityHeaders(): Promise<SecurityScore> {
  const results: HeaderCheckResult[] = [];
  
  try {
    // Fetch current page to inspect headers
    const response = await fetch(window.location.href, {
      method: 'HEAD',
      cache: 'no-cache'
    });
    
    // Check each expected header
    for (const expected of EXPECTED_HEADERS) {
      const headerValue = response.headers.get(expected.name);
      
      if (!headerValue) {
        // Header missing
        results.push({
          header: expected.name,
          present: false,
          expected: expected.expectedValue,
          matches: false,
          status: expected.required ? 'fail' : 'warning',
          message: expected.required 
            ? `❌ Missing required header: ${expected.name}`
            : `⚠️ Missing optional header: ${expected.name}`
        });
      } else {
        // Header present - check value
        const matches = expected.expectedValue 
          ? headerValue.includes(expected.expectedValue)
          : true;
        
        results.push({
          header: expected.name,
          present: true,
          value: headerValue,
          expected: expected.expectedValue,
          matches,
          status: matches ? 'pass' : 'warning',
          message: matches
            ? `✅ ${expected.name} correctly configured`
            : `⚠️ ${expected.name} present but value unexpected`
        });
      }
    }
    
    // Calculate score
    const passed = results.filter(r => r.status === 'pass').length;
    const failed = results.filter(r => r.status === 'fail').length;
    const warnings = results.filter(r => r.status === 'warning').length;
    const total = results.length;
    
    // Score calculation: pass = 100%, warning = 50%, fail = 0%
    const score = Math.round(
      ((passed * 1.0 + warnings * 0.5) / total) * 100
    );
    
    // Determine grade
    let grade: SecurityScore['grade'];
    if (score >= 95) grade = 'A+';
    else if (score >= 90) grade = 'A';
    else if (score >= 80) grade = 'B';
    else if (score >= 70) grade = 'C';
    else if (score >= 60) grade = 'D';
    else grade = 'F';
    
    // Determine status
    let status: SecurityScore['status'];
    if (score >= 95) status = 'excellent';
    else if (score >= 85) status = 'good';
    else if (score >= 70) status = 'fair';
    else if (score >= 50) status = 'poor';
    else status = 'critical';
    
    return {
      score,
      grade,
      passed,
      failed,
      warnings,
      total,
      results,
      status
    };
  } catch (error) {
    console.error('Failed to check security headers:', error);
    throw new Error('Unable to check security headers. This may be due to CORS restrictions.');
  }
}

/**
 * Print Security Report
 * 
 * Checks security headers and prints a formatted report to console.
 * 
 * @returns {Promise<void>}
 */
export async function printSecurityReport(): Promise<void> {
  console.log('\n🔒 SECURITY HEADERS CHECK\n');
  console.log('━'.repeat(60));
  
  try {
    const score = await checkSecurityHeaders();
    
    // Print overall score
    console.log('\n📊 OVERALL SECURITY SCORE\n');
    console.log(`Score: ${score.score}/100 (${score.grade})`);
    console.log(`Status: ${score.status.toUpperCase()}`);
    console.log(`Passed: ${score.passed}/${score.total}`);
    console.log(`Failed: ${score.failed}/${score.total}`);
    console.log(`Warnings: ${score.warnings}/${score.total}`);
    
    // Print detailed results
    console.log('\n📋 DETAILED RESULTS\n');
    
    // Group by status
    const passed = score.results.filter(r => r.status === 'pass');
    const failed = score.results.filter(r => r.status === 'fail');
    const warnings = score.results.filter(r => r.status === 'warning');
    
    if (passed.length > 0) {
      console.log('✅ PASSED CHECKS:');
      passed.forEach(r => {
        console.log(`  ${r.message}`);
      });
      console.log('');
    }
    
    if (warnings.length > 0) {
      console.log('⚠️ WARNINGS:');
      warnings.forEach(r => {
        console.log(`  ${r.message}`);
        if (r.value) {
          console.log(`    Value: ${r.value.substring(0, 100)}...`);
        }
      });
      console.log('');
    }
    
    if (failed.length > 0) {
      console.log('❌ FAILED CHECKS:');
      failed.forEach(r => {
        console.log(`  ${r.message}`);
      });
      console.log('');
    }
    
    // Print recommendations
    if (score.score < 100) {
      console.log('💡 RECOMMENDATIONS\n');
      
      if (failed.length > 0) {
        console.log('Priority: Add missing required headers');
        failed.forEach(r => {
          const headerInfo = EXPECTED_HEADERS.find(h => h.name === r.header);
          if (headerInfo) {
            console.log(`  - ${r.header}: ${headerInfo.benefit}`);
          }
        });
        console.log('');
      }
      
      if (warnings.length > 0) {
        console.log('Optional: Review warning headers');
        warnings.forEach(r => {
          const headerInfo = EXPECTED_HEADERS.find(h => h.name === r.header);
          if (headerInfo && !r.present) {
            console.log(`  - ${r.header}: ${headerInfo.benefit}`);
          }
        });
      }
    } else {
      console.log('🎉 PERFECT SCORE! All security headers configured correctly.\n');
    }
    
    console.log('━'.repeat(60));
    console.log('\n💡 Test your site at: https://securityheaders.com');
    console.log('💡 Test your site at: https://observatory.mozilla.org\n');
    
  } catch (error) {
    console.error('❌ Error checking security headers:', error);
  }
}

/**
 * Get Security Header Recommendations
 * 
 * Returns actionable recommendations based on missing/incorrect headers.
 * 
 * @returns {Promise<string[]>} List of recommendations
 */
export async function getSecurityRecommendations(): Promise<string[]> {
  const recommendations: string[] = [];
  
  try {
    const score = await checkSecurityHeaders();
    
    // Recommendations for failed checks
    score.results
      .filter(r => r.status === 'fail')
      .forEach(r => {
        const headerInfo = EXPECTED_HEADERS.find(h => h.name === r.header);
        if (headerInfo) {
          recommendations.push(
            `Add ${r.header} header: ${headerInfo.benefit}`
          );
        }
      });
    
    // Recommendations for warnings
    score.results
      .filter(r => r.status === 'warning' && !r.present)
      .forEach(r => {
        const headerInfo = EXPECTED_HEADERS.find(h => h.name === r.header);
        if (headerInfo) {
          recommendations.push(
            `Consider adding ${r.header} header: ${headerInfo.benefit}`
          );
        }
      });
    
    // General recommendations based on score
    if (score.score < 70) {
      recommendations.push(
        'Critical: Security posture is weak. Prioritize adding security headers immediately.'
      );
    } else if (score.score < 90) {
      recommendations.push(
        'Good progress! A few more headers will significantly improve security.'
      );
    }
    
    return recommendations;
  } catch (error) {
    console.error('Failed to get recommendations:', error);
    return ['Unable to generate recommendations due to error.'];
  }
}

// ============================================================================
// GLOBAL EXPORTS FOR CONSOLE ACCESS
// ============================================================================

// Make available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).checkSecurityHeaders = checkSecurityHeaders;
  (window as any).printSecurityReport = printSecurityReport;
  (window as any).getSecurityRecommendations = getSecurityRecommendations;
  
  // Convenience command
  (window as any).securityCheck = async () => {
    await printSecurityReport();
  };
}

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/**
 * EXAMPLE 1: Check security headers in console
 * 
 * ```javascript
 * // Simple check
 * window.securityCheck();
 * 
 * // Output:
 * // 🔒 SECURITY HEADERS CHECK
 * // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * // 📊 OVERALL SECURITY SCORE
 * // Score: 100/100 (A+)
 * // Status: EXCELLENT
 * ```
 * 
 * EXAMPLE 2: Get programmatic results
 * 
 * ```typescript
 * import { checkSecurityHeaders } from '@/utils/securityHeadersChecker';
 * 
 * const score = await checkSecurityHeaders();
 * if (score.score < 90) {
 *   alert('Security headers need attention!');
 * }
 * ```
 * 
 * EXAMPLE 3: Get recommendations
 * 
 * ```typescript
 * import { getSecurityRecommendations } from '@/utils/securityHeadersChecker';
 * 
 * const recommendations = await getSecurityRecommendations();
 * recommendations.forEach(rec => console.log(rec));
 * ```
 * 
 * EXAMPLE 4: Automated monitoring
 * 
 * ```typescript
 * // Check headers on app initialization
 * useEffect(() => {
 *   if (import.meta.env.PROD) {
 *     checkSecurityHeaders().then(score => {
 *       if (score.score < 90) {
 *         // Log to monitoring service
 *         logSecurityIssue('Low security header score', score);
 *       }
 *     });
 *   }
 * }, []);
 * ```
 */
