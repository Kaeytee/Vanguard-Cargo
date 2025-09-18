import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Wifi, WifiOff, AlertCircle } from 'lucide-react';

interface RealtimeStatusProps {
  className?: string;
  showText?: boolean;
}

export const RealtimeStatus: React.FC<RealtimeStatusProps> = ({ 
  className = '', 
  showText = true 
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if realtime is disabled via environment variable
    const realtimeDisabled = import.meta.env.VITE_DISABLE_REALTIME === 'true';
    setIsDisabled(realtimeDisabled);

    if (realtimeDisabled) {
      setError('Realtime disabled (development mode)');
      return;
    }

    // Create a channel to test realtime connectivity
    const channel = supabase
      .channel('realtime_test')
      .on('presence', { event: 'sync' }, () => {
        setIsConnected(true);
        setError(null);
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
          setError(null);
        } else if (status === 'CHANNEL_ERROR') {
          setIsConnected(false);
          setError('Connection failed - using polling mode');
        } else if (status === 'TIMED_OUT') {
          setIsConnected(false);
          setError('Connection timeout - check network');
        }
      });

    // Cleanup on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getIcon = () => {
    if (isDisabled) {
      return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    }
    return isConnected ? 
      <Wifi className="w-4 h-4 text-green-500" /> : 
      <WifiOff className="w-4 h-4 text-red-500" />;
  };

  const getStatusText = () => {
    if (isDisabled) {
      return 'Realtime Disabled';
    }
    if (error) {
      return error;
    }
    return isConnected ? 'Realtime Connected' : 'Connecting...';
  };

  const getStatusColor = () => {
    if (isDisabled) return 'text-yellow-600';
    if (error) return 'text-orange-600';
    return isConnected ? 'text-green-600' : 'text-gray-600';
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {getIcon()}
      {showText && (
        <span className={`text-sm ${getStatusColor()}`}>
          {getStatusText()}
        </span>
      )}
    </div>
  );
};

export default RealtimeStatus;
