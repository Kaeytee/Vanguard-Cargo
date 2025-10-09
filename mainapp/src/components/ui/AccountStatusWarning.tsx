import { AlertCircle, XCircle, Mail, Shield, Clock } from 'lucide-react';
import type { FC } from 'react';

/**
 * AccountStatusWarning Component
 * 
 * Displays a visual warning modal when user's account status prevents login.
 * Shows personalized message with account status and support contact information.
 * 
 * @author Senior Software Engineer
 * @component
 */

interface AccountStatusWarningProps {
  /** Account status from database */
  status: string;
  /** Personalized error message */
  message: string;
  /** User's first name for personalization */
  firstName?: string;
  /** Close callback */
  onClose: () => void;
}

/**
 * Get appropriate icon and color based on status
 */
const getStatusConfig = (status: string) => {
  switch (status.toLowerCase()) {
    case 'inactive':
      return {
        icon: XCircle,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        title: 'Account Inactive'
      };
    case 'suspended':
      return {
        icon: Shield,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        title: 'Account Suspended'
      };
    case 'reported':
      return {
        icon: AlertCircle,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        title: 'Account Under Review'
      };
    case 'pending_verification':
      return {
        icon: Mail,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        title: 'Email Verification Required'
      };
    default:
      return {
        icon: Clock,
        color: 'text-gray-600',
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200',
        title: 'Account Access Restricted'
      };
  }
};

const AccountStatusWarning: FC<AccountStatusWarningProps> = ({
  status,
  message,
  firstName,
  onClose
}) => {
  // Get configuration based on status
  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <>
      {/* Backdrop overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onClose();
        }}
      >
        {/* Modal container */}
        <div 
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-[slideUp_0.3s_ease-out]"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          {/* Header with icon */}
          <div className={`${config.bgColor} ${config.borderColor} border-b-2 p-6`}>
            <div className="flex items-center gap-4">
              <div className={`${config.color} p-3 bg-white rounded-full shadow-md`}>
                <Icon className="w-8 h-8" />
              </div>
              <div>
                <h2 className={`text-xl font-bold ${config.color}`}>
                  {config.title}
                </h2>
                {firstName && (
                  <p className="text-sm text-gray-600 mt-1">
                    Hello, {firstName}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Message body */}
          <div className="p-6">
            <p className="text-gray-700 leading-relaxed mb-6">
              {message}
            </p>

            {/* Support contact information */}
            <div className={`${config.bgColor} rounded-lg p-4 border ${config.borderColor}`}>
              <p className="text-sm font-semibold text-gray-800 mb-2">
                Need Help?
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Mail className="w-4 h-4" />
                <a 
                  href="mailto:support@vanguardcargo.co"
                  className="text-red-600 font-medium hover:text-red-700 hover:underline"
                >
                  support@vanguardcargo.co
                </a>
              </div>
            </div>
          </div>

          {/* Footer with action button */}
          <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClose();
              }}
              className="px-6 py-2.5 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors shadow-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Animation styles */}
      <style>{`
        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
};

export default AccountStatusWarning;
