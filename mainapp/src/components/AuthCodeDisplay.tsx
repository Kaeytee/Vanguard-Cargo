import { useState } from 'react';
import { Copy, CheckCircle, Shield, AlertTriangle } from 'lucide-react';

/**
 * AuthCodeDisplay Component - Display 6-digit authentication code prominently
 * 
 * This component displays the package pickup authentication code with
 * high visual emphasis, security warnings, and copy functionality.
 * 
 * Features:
 * - Large, bold 6-digit code display
 * - Copy to clipboard functionality
 * - Security warnings and instructions
 * - Responsive design
 * - Accessibility support
 * 
 * @author Senior Software Engineer
 * @version 1.0.0
 */

interface AuthCodeDisplayProps {
  /** 6-digit authentication code */
  authCode: string;
  /** Package tracking number for context */
  trackingNumber?: string;
  /** Display size variant */
  size?: 'small' | 'medium' | 'large';
  /** Show security warnings */
  showWarnings?: boolean;
  /** Custom CSS class */
  className?: string;
}

const AuthCodeDisplay = ({
  authCode,
  trackingNumber,
  size = 'large',
  showWarnings = true,
  className = ''
}: AuthCodeDisplayProps) => {
  // State for copy feedback
  const [copied, setCopied] = useState<boolean>(false);

  /**
   * Copy authentication code to clipboard
   * Shows success feedback for 2 seconds
   */
  const handleCopyCode = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(authCode);
      setCopied(true);
      console.log('✅ Auth code copied to clipboard');

      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error('❌ Failed to copy code:', err);
      alert('Failed to copy code. Please copy manually.');
    }
  };

  /**
   * Format auth code with spacing for readability
   * Example: 123456 -> 123 456
   */
  const formatAuthCode = (code: string): string => {
    if (code.length === 6) {
      return `${code.substring(0, 3)} ${code.substring(3)}`;
    }
    return code;
  };

  // Size-based styling
  const sizeClasses = {
    small: 'text-2xl px-4 py-2',
    medium: 'text-3xl px-6 py-3',
    large: 'text-5xl px-8 py-4'
  };

  return (
    <div className={`auth-code-container ${className}`}>
      {/* Header with security icon */}
      <div className="flex items-center justify-center gap-2 mb-4">
        <Shield className="w-6 h-6 text-red-600" aria-hidden="true" />
        <h3 className="text-lg font-semibold text-gray-900">
          Package Pickup Code
        </h3>
      </div>

      {/* Main code display box */}
      <div 
        className="relative bg-gradient-to-br from-red-600 to-red-700 rounded-2xl shadow-2xl overflow-hidden"
        role="region"
        aria-label="Authentication code display"
      >
        {/* Decorative background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(255,255,255,0.1)_10px,rgba(255,255,255,0.1)_20px)]"></div>
        </div>

        {/* Code display */}
        <div className="relative z-10 text-center py-8">
          {/* Label */}
          <div className="text-white/80 text-sm font-medium uppercase tracking-wider mb-3">
            Confidential - Required for Pickup
          </div>

          {/* 6-Digit Code */}
          <div 
            className={`font-mono font-bold text-white tracking-[0.5em] select-all ${sizeClasses[size]}`}
            aria-label={`Pickup code: ${formatAuthCode(authCode)}`}
            tabIndex={0}
          >
            {formatAuthCode(authCode)}
          </div>

          {/* Tracking number context */}
          {trackingNumber && (
            <div className="text-white/70 text-xs mt-3">
              Tracking: {trackingNumber}
            </div>
          )}
        </div>

        {/* Copy button */}
        <div className="relative z-10 border-t border-white/20 bg-black/10 px-6 py-3">
          <button
            onClick={handleCopyCode}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all duration-200 font-medium"
            aria-label={copied ? 'Code copied' : 'Copy code to clipboard'}
          >
            {copied ? (
              <>
                <CheckCircle className="w-5 h-5" aria-hidden="true" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-5 h-5" aria-hidden="true" />
                <span>Copy Code</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Security warnings and instructions */}
      {showWarnings && (
        <div className="mt-6 space-y-3">
          {/* Critical warning */}
          <div className="flex items-start gap-3 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg">
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div className="flex-1">
              <h4 className="font-semibold text-yellow-900 text-sm mb-1">
                Keep This Code Secure
              </h4>
              <p className="text-yellow-800 text-xs leading-relaxed">
                This code is required to collect your package. Do not share it with anyone 
                except VanguardCargo warehouse staff during pickup.
              </p>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 text-sm mb-2">
              Pickup Instructions:
            </h4>
            <ul className="space-y-2 text-blue-800 text-xs">
              <li className="flex items-start gap-2">
                <span className="font-bold text-blue-600 flex-shrink-0">1.</span>
                <span>Bring valid photo ID matching your account information</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-blue-600 flex-shrink-0">2.</span>
                <span>Provide this 6-digit code to warehouse staff</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-blue-600 flex-shrink-0">3.</span>
                <span>Show the QR code below for quick verification (if available)</span>
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Accessibility: Hidden text for screen readers */}
      <div className="sr-only" role="status" aria-live="polite">
        {copied && 'Authentication code copied to clipboard'}
      </div>
    </div>
  );
};

export default AuthCodeDisplay;
