import { AlertTriangle, Clock } from "lucide-react";

interface SessionTimeoutWarningProps {
  remainingSeconds: number;
  onExtend: () => void;
  onLogout: () => void;
}

/**
 * Session Timeout Warning Modal
 * Displays when session is about to expire due to inactivity
 */
export function SessionTimeoutWarning({ 
  remainingSeconds, 
  onExtend, 
  onLogout 
}: SessionTimeoutWarningProps) {
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const timeDisplay = minutes > 0 
    ? `${minutes}:${seconds.toString().padStart(2, '0')}` 
    : `${seconds}s`;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fade-in-up">
        {/* Warning Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-amber-600" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
          Session Expiring Soon
        </h2>

        {/* Message */}
        <p className="text-gray-600 text-center mb-4">
          Your session will expire due to inactivity. You will be logged out automatically.
        </p>

        {/* Countdown Timer */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <Clock className="w-5 h-5 text-red-500" />
          <span className="text-2xl font-mono font-bold text-red-600">
            {timeDisplay}
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onLogout}
            className="flex-1 px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
          >
            Logout Now
          </button>
          <button
            onClick={onExtend}
            className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 font-bold shadow-lg shadow-blue-600/30"
          >
            Stay Logged In
          </button>
        </div>

        {/* Security Note */}
        <p className="text-xs text-gray-400 text-center mt-4">
          For your security, sessions expire after 30 minutes of inactivity.
        </p>
      </div>
    </div>
  );
}
