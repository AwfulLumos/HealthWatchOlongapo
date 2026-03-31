import { LogOut, CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";
import logoImage from "../../styles/Images/HealthWatchLogoPortrait.jpg";

interface LogoutScreenProps {
  userName?: string;
  onComplete?: () => void;
  duration?: number;
}

export function LogoutScreen({ 
  userName = "User", 
  onComplete, 
  duration = 2000 
}: LogoutScreenProps) {
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const progressInterval = 30;
    const progressIncrement = 100 / (duration / progressInterval);

    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + progressIncrement;
        return next >= 100 ? 100 : next;
      });
    }, progressInterval);

    const completeTimer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => {
        onComplete?.();
      }, 400);
    }, duration);

    return () => {
      clearInterval(progressTimer);
      clearTimeout(completeTimer);
    };
  }, [duration, onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-slate-900 transition-opacity duration-400 p-4 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-100px] left-[-100px] w-[300px] sm:w-[400px] h-[300px] sm:h-[400px] rounded-full bg-gray-600/20 blur-3xl animate-pulse" />
        <div className="absolute bottom-[-100px] right-[-100px] w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] rounded-full bg-slate-600/20 blur-3xl animate-pulse animation-delay-200" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Logo with Fade Out Animation */}
        <div className="relative mb-7 sm:mb-9">
          {/* Shrinking rings */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 sm:w-40 h-32 sm:h-40 rounded-full border-2 border-gray-400/30 animate-ping-reverse" style={{ animationDuration: '1.5s' }} />
          </div>

          {/* Main Logo Container - Increased by ~17% */}
          <div className="relative w-24 h-24 sm:w-32 sm:h-32 bg-white/10 backdrop-blur-sm rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-white/20 animate-scale-down">
            <img src={logoImage} alt="Health Watch Olongapo" className="w-full h-full object-cover animate-fade-out" style={{ animationDuration: '1.5s' }} />
          </div>
        </div>

        {/* Goodbye Text - Increased */}
        <h1 className="text-white text-2xl sm:text-3xl font-bold mb-2.5 animate-fade-in text-center">
          Goodbye, {userName}
        </h1>
        <p className="text-gray-300 text-sm sm:text-base mb-7 sm:mb-9 animate-fade-in animation-delay-200">
          Signing you out securely...
        </p>

        {/* Logout Icon with animation - Increased */}
        <div className="flex items-center gap-2.5 sm:gap-3.5 mb-6 sm:mb-7 animate-fade-in animation-delay-300">
          <LogOut className="w-5 h-5 sm:w-6 sm:h-6 text-red-400 animate-pulse" />
          <span className="text-white/90 text-sm sm:text-base font-medium">
            Ending session...
          </span>
        </div>

        {/* Progress Bar - Wider */}
        <div className="w-56 sm:w-72 h-2 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
          <div
            className="h-full bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 rounded-full transition-all duration-100 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Completion Check - Increased */}
        {progress > 80 && (
          <div className="mt-6 sm:mt-7 flex items-center gap-2.5 animate-fade-in">
            <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-400 animate-bounce" />
            <span className="text-green-400 text-sm sm:text-base font-medium">
              Session ended successfully
            </span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="absolute bottom-6 sm:bottom-8 text-center px-4">
        <p className="text-gray-500/70 text-sm">
          Thank you for using Health Watch Olongapo
        </p>
      </div>

      {/* Custom Styles */}
      <style>{`
        @keyframes scale-down {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          100% {
            transform: scale(0.8);
            opacity: 0.5;
          }
        }
        .animate-scale-down {
          animation: scale-down 1.5s ease-in-out forwards;
        }
        
        @keyframes fade-out {
          0% {
            opacity: 1;
          }
          100% {
            opacity: 0.3;
          }
        }
        .animate-fade-out {
          animation: fade-out 1.5s ease-in-out forwards;
        }
        
        @keyframes ping-reverse {
          0% {
            transform: scale(1);
            opacity: 0.3;
          }
          100% {
            transform: scale(0.95);
            opacity: 0;
          }
        }
        .animate-ping-reverse {
          animation: ping-reverse 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
      `}</style>
    </div>
  );
}
