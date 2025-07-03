import React from 'react';
import { CheckCircle } from 'lucide-react';

interface MessageDisplayProps {
  error?: string;
  success?: string;
}

export const MessageDisplay: React.FC<MessageDisplayProps> = ({ error, success }) => {
  if (error) {
    return (
      <div className="flex items-center gap-2 mt-1">
        <div className="h-4 w-4 flex-shrink-0 text-red-600">!</div>
        <p className="text-sm font-medium text-red-600">{error}</p>
      </div>
    );
  }
  
  if (success) {
    return (
      <div className="flex items-center gap-2 mt-1">
        <CheckCircle className="h-4 w-4 flex-shrink-0 text-green-600" />
        <p className="text-sm font-medium text-green-600">{success}</p>
      </div>
    );
  }
  
  return null;
};
