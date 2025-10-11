// ============================================================================
// Input Validator Tests
// ============================================================================
// Description: Comprehensive tests for input validation
// Author: Senior Software Engineer
// Purpose: Ensure validation works correctly and securely
// ============================================================================

import { InputValidator } from '../inputValidator';

describe('InputValidator', () => {
  // ============================================================================
  // EMAIL VALIDATION TESTS
  // ============================================================================
  
  describe('validateEmail', () => {
    it('should validate correct email addresses', () => {
      const validEmails = [
        'test@example.com',
        'user.name@example.com',
        'user+tag@example.co.uk',
        'test123@test-domain.com'
      ];
      
      validEmails.forEach(email => {
        const result = InputValidator.validateEmail(email);
        expect(result.isValid).toBe(true);
        expect(result.sanitizedValue).toBe(email.toLowerCase());
      });
    });
    
    it('should reject invalid email addresses', () => {
      const invalidEmails = [
        'notanemail',
        '@example.com',
        'user@',
        'user @example.com',
        'user@.com'
      ];
      
      invalidEmails.forEach(email => {
        const result = InputValidator.validateEmail(email);
        expect(result.isValid).toBe(false);
        expect(result.error).toBeDefined();
      });
    });
    
    it('should reject disposable emails when configured', () => {
      const result = InputValidator.validateEmail('test@tempmail.com', {
        allowDisposable: false
      });
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('disposable');
    });
    
    it('should enforce required domain', () => {
      const result = InputValidator.validateEmail('test@gmail.com', {
        requiredDomain: 'company.com'
      });
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('company.com');
    });
    
    it('should block specific domains', () => {
      const result = InputValidator.validateEmail('test@blocked.com', {
        blockedDomains: ['blocked.com', 'spam.com']
      });
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('not allowed');
    });
  });
  
  // ============================================================================
  // PASSWORD VALIDATION TESTS
  // ============================================================================
  
  describe('validatePassword', () => {
    it('should validate strong passwords', () => {
      const result = InputValidator.validatePassword('MyP@ssw0rd123', {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumber: true,
        requireSpecial: true
      });
      
      expect(result.isValid).toBe(true);
    });
    
    it('should enforce minimum length', () => {
      const result = InputValidator.validatePassword('short', {
        minLength: 8
      });
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('8 characters');
    });
    
    it('should require uppercase when configured', () => {
      const result = InputValidator.validatePassword('password123!', {
        requireUppercase: true
      });
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('uppercase');
    });
    
    it('should require numbers when configured', () => {
      const result = InputValidator.validatePassword('Password!', {
        requireNumber: true
      });
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('number');
    });
    
    it('should require special characters when configured', () => {
      const result = InputValidator.validatePassword('Password123', {
        requireSpecial: true
      });
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('special');
    });
    
    it('should reject common passwords', () => {
      const result = InputValidator.validatePassword('password123', {
        disallowCommon: true
      });
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('common');
    });
  });
  
  describe('calculatePasswordStrength', () => {
    it('should return 0 for empty password', () => {
      expect(InputValidator.calculatePasswordStrength('')).toBe(0);
    });
    
    it('should return low score for weak passwords', () => {
      const score = InputValidator.calculatePasswordStrength('pass');
      expect(score).toBeLessThan(40);
    });
    
    it('should return high score for strong passwords', () => {
      const score = InputValidator.calculatePasswordStrength('MyP@ssw0rd123!');
      expect(score).toBeGreaterThan(70);
    });
  });
  
  // ============================================================================
  // STRING VALIDATION TESTS
  // ============================================================================
  
  describe('validateString', () => {
    it('should validate valid strings', () => {
      const result = InputValidator.validateString('Hello World');
      expect(result.isValid).toBe(true);
    });
    
    it('should enforce minimum length', () => {
      const result = InputValidator.validateString('Hi', {
        minLength: 5
      });
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('5 characters');
    });
    
    it('should enforce maximum length', () => {
      const result = InputValidator.validateString('This is a very long string', {
        maxLength: 10
      });
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('10 characters');
    });
    
    it('should validate against pattern', () => {
      const result = InputValidator.validateString('abc123', {
        pattern: /^[a-z]+$/
      });
      
      expect(result.isValid).toBe(false);
    });
  });
  
  describe('validateName', () => {
    it('should validate valid names', () => {
      const validNames = [
        'John',
        'Mary-Jane',
        "O'Brien",
        'Jean Paul'
      ];
      
      validNames.forEach(name => {
        const result = InputValidator.validateName(name);
        expect(result.isValid).toBe(true);
      });
    });
    
    it('should reject invalid names', () => {
      const invalidNames = [
        'J',
        'John123',
        'Test@Name',
        '<script>alert("xss")</script>'
      ];
      
      invalidNames.forEach(name => {
        const result = InputValidator.validateName(name);
        expect(result.isValid).toBe(false);
      });
    });
  });
  
  // ============================================================================
  // NUMBER VALIDATION TESTS
  // ============================================================================
  
  describe('validateNumber', () => {
    it('should validate valid numbers', () => {
      const result = InputValidator.validateNumber(42);
      expect(result.isValid).toBe(true);
      expect(result.sanitizedValue).toBe(42);
    });
    
    it('should validate string numbers', () => {
      const result = InputValidator.validateNumber('42');
      expect(result.isValid).toBe(true);
      expect(result.sanitizedValue).toBe(42);
    });
    
    it('should enforce minimum value', () => {
      const result = InputValidator.validateNumber(5, { min: 10 });
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('10');
    });
    
    it('should enforce maximum value', () => {
      const result = InputValidator.validateNumber(100, { max: 50 });
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('50');
    });
    
    it('should enforce integer requirement', () => {
      const result = InputValidator.validateNumber(3.14, { integer: true });
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('whole number');
    });
    
    it('should enforce positive requirement', () => {
      const result = InputValidator.validateNumber(-5, { positive: true });
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('positive');
    });
  });
  
  // ============================================================================
  // SANITIZATION TESTS
  // ============================================================================
  
  describe('sanitizeString', () => {
    it('should remove HTML tags', () => {
      const result = InputValidator.sanitizeString('<div>Hello</div>');
      expect(result).not.toContain('<div>');
      expect(result).not.toContain('</div>');
    });
    
    it('should remove script tags', () => {
      const result = InputValidator.sanitizeString('<script>alert("xss")</script>');
      expect(result).not.toContain('<script>');
      expect(result).not.toContain('alert');
    });
    
    it('should encode HTML entities', () => {
      const result = InputValidator.sanitizeString('<>&"\'');
      expect(result).toContain('&lt;');
      expect(result).toContain('&gt;');
      expect(result).toContain('&amp;');
    });
  });
  
  describe('containsXSS', () => {
    it('should detect script tags', () => {
      expect(InputValidator.containsXSS('<script>alert("xss")</script>')).toBe(true);
    });
    
    it('should detect iframe tags', () => {
      expect(InputValidator.containsXSS('<iframe src="evil.com"></iframe>')).toBe(true);
    });
    
    it('should detect javascript: protocol', () => {
      expect(InputValidator.containsXSS('javascript:alert("xss")')).toBe(true);
    });
    
    it('should detect event handlers', () => {
      expect(InputValidator.containsXSS('<img onerror="alert(1)" />')).toBe(true);
    });
    
    it('should allow safe strings', () => {
      expect(InputValidator.containsXSS('Hello World!')).toBe(false);
    });
  });
  
  describe('containsSQLInjection', () => {
    it('should detect SQL keywords', () => {
      expect(InputValidator.containsSQLInjection("SELECT * FROM users")).toBe(true);
      expect(InputValidator.containsSQLInjection("DROP TABLE users")).toBe(true);
    });
    
    it('should detect SQL operators', () => {
      expect(InputValidator.containsSQLInjection("1' OR '1'='1")).toBe(true);
    });
    
    it('should allow safe strings', () => {
      expect(InputValidator.containsSQLInjection("Hello World")).toBe(false);
    });
  });
});

// ============================================================================
// USAGE EXAMPLES (for documentation)
// ============================================================================

/**
 * EXAMPLE TEST SUITE
 * 
 * Run these tests with:
 * ```bash
 * npm test inputValidator.test.ts
 * ```
 * 
 * Or test individual validators in console:
 * ```javascript
 * import { InputValidator } from '@/utils/inputValidator';
 * 
 * // Test email
 * InputValidator.validateEmail('test@example.com');
 * 
 * // Test password
 * InputValidator.validatePassword('MyP@ssw0rd123');
 * 
 * // Calculate password strength
 * InputValidator.calculatePasswordStrength('MyP@ssw0rd123');
 * 
 * // Check for XSS
 * InputValidator.containsXSS('<script>alert("xss")</script>');
 * 
 * // Sanitize input
 * InputValidator.sanitizeString('<script>alert("xss")</script>');
 * ```
 */
