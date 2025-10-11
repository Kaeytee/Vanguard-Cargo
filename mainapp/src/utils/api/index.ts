// ============================================================================
// API Security Utilities - Central Export
// ============================================================================
// Description: Centralized export for all API security utilities
// Author: Senior Software Engineer
// Purpose: Simplify imports across the application
// Usage: import { APIAuth, APIValidator, ... } from '@/utils/api'
// ============================================================================
import APIAuth from './apiAuth';
import APISecurityMiddleware from './apiSecurityMiddleware';
import APIValidator from './apiValidator';
import RequestSigner from './requestSigner';
import ResponseSanitizer from './responseSanitizer';
// ============================================================================
// VALIDATORS
// ============================================================================

export {
  type APIRequestSchema,
  type ValidationRule,
  type APIValidationResult,
  userRegistrationSchema,
  packageCreationSchema
} from './apiValidator';

// ============================================================================
// AUTHENTICATION
// ============================================================================

export {
  APIAuth,
  type APIAuthToken,
  type AuthHeaders,
  requireAuth,
  requireRole
} from './apiAuth';

// ============================================================================
// REQUEST SIGNING
// ============================================================================

export {
  RequestSigner,
  type SignatureConfig,
  type SignedRequest,
  signRequest,
  verifyRequest
} from './requestSigner';

// ============================================================================
// RESPONSE SANITIZATION
// ============================================================================

export {
  ResponseSanitizer,
  type SanitizationOptions,
  STRICT_SANITIZATION,
  STANDARD_SANITIZATION,
  LIGHT_SANITIZATION,
  PUBLIC_API_SANITIZATION,
  sanitizeResponse,
  sanitizeForLogging
} from './responseSanitizer';

// ============================================================================
// SECURITY MIDDLEWARE
// ============================================================================

export {
  APISecurityMiddleware,
  type SecurityConfig,
  type APIRequestContext,
  type APIResponseContext,
  type APIInterceptor,
  secureGet,
  securePost,
  securePut,
  secureDelete
} from './apiSecurityMiddleware';

// ============================================================================
// RATE LIMITING
// ============================================================================
// Note: API rate limiter disabled for client app - not needed for client-side use

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default {
  APIValidator,
  APIAuth,
  RequestSigner,
  ResponseSanitizer,
  APISecurityMiddleware
};
