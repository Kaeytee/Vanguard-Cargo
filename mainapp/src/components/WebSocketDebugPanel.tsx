import { useState, useEffect } from 'react';
import { WebSocketErrorHandler } from '../utils/websocketErrorHandler';
import { AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react';

interface WebSocketDebugPanelProps {
  isVisible?: boolean;
  onClose?: () => void;
}

export const WebSocketDebugPanel: React.FC<WebSocketDebugPanelProps> = ({
  isVisible = false,
  onClose
}) => {
  const [errorState, setErrorState] = useState({ errorCount: 0, suppressErrors: false });
  const [isRealtimeDisabled, setIsRealtimeDisabled] = useState(false);

  useEffect(() => {
    const handler = WebSocketErrorHandler.getInstance();
    setErrorState(handler.getErrorState());
    setIsRealtimeDisabled(import.meta.env.VITE_DISABLE_REALTIME === 'true');

    // Update error state every few seconds
    const interval = setInterval(() => {
      setErrorState(handler.getErrorState());
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-md z-50">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-sm font-semibold text-gray-800 flex items-center">
          <Info className="w-4 h-4 mr-2 text-blue-500" />
          WebSocket Status
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 ml-2"
          >
            ×
          </button>
        )}
      </div>
      
      <div className="space-y-3 text-sm">
        {/* Realtime Status */}
        <div className="flex items-center">
          {isRealtimeDisabled ? (
            <>
              <AlertTriangle className="w-4 h-4 text-yellow-500 mr-2" />
              <span className="text-yellow-700">Realtime Disabled (Dev Mode)</span>
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
              <span className="text-green-700">Realtime Enabled</span>
            </>
          )}
        </div>

        {/* Error Count */}
        <div className="flex items-center">
          {errorState.errorCount > 0 ? (
            <>
              <XCircle className="w-4 h-4 text-red-500 mr-2" />
              <span className="text-red-700">
                {errorState.errorCount} WebSocket errors detected
              </span>
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
              <span className="text-green-700">No errors detected</span>
            </>
          )}
        </div>

        {/* Error Suppression Status */}
        {errorState.suppressErrors && (
          <div className="flex items-center">
            <Info className="w-4 h-4 text-blue-500 mr-2" />
            <span className="text-blue-700">Errors suppressed for session</span>
          </div>
        )}

        {/* Helpful Information */}
        <div className="mt-3 p-2 bg-blue-50 rounded border">
          <p className="text-xs text-blue-800">
            {isRealtimeDisabled ? (
              <>
                <strong>Development Mode:</strong> Realtime features are disabled to prevent 
                Cloudflare cookie conflicts. Core functionality remains fully available.
              </>
            ) : errorState.errorCount > 0 ? (
              <>
                <strong>Cookie Issues Detected:</strong> Some WebSocket connections are being 
                blocked by Cloudflare. This won't affect core functionality.
              </>
            ) : (
              <>
                <strong>All Good:</strong> WebSocket connections are working normally.
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default WebSocketDebugPanel;
