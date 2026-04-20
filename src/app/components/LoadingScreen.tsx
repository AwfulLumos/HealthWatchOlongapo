import { Heart, Stethoscope, Shield } from "lucide-react";
import { useEffect, useState } from "react";
import logoImage from "../../styles/Images/HealthWatchLogoPortrait.jpg";

interface LoadingScreenProps {
  userName?: string;
  onComplete?: () => void;
  duration?: number;
  mode?: 'authenticating' | 'success';
  errorMessage?: string;
}

export function LoadingScreen({ 
  userName = "User", 
  onComplete, 
  duration = 2500,
  mode = 'authenticating',
  errorMessage
}: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  const authenticatingSteps = [
    { icon: Shield, text: "Verifying credentials...", color: "text-blue-400" }
  ];

  const successSteps = [
    { icon: Shield, text: "Credentials verified!", color: "text-green-400" },
    { icon: Stethoscope, text: "Loading health records...", color: "text-teal-400" },
    { icon: Heart, text: "Preparing dashboard...", color: "text-rose-400" },
  ];

  const steps = mode === 'authenticating' ? authenticatingSteps : successSteps;

  useEffect(() => {
    // If there's an error, don't start animation
    if (errorMessage) {
      return;
    }

    // For authenticating mode, use infinite progress animation without auto-complete
    // For success mode, complete in the specified duration
    const actualDuration = mode === 'authenticating' ? 30000 : duration; // 30s max for auth
    const stepDuration = actualDuration / steps.length;
    const progressInterval = 30;
    const progressIncrement = 100 / (actualDuration / progressInterval);

    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + progressIncrement;
        return next >= 100 ? 100 : next;
      });
    }, progressInterval);

    const stepTimer = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < steps.length - 1) return prev + 1;
        return prev;
      });
    }, stepDuration);

    // Only complete if in success mode
    let completeTimer: ReturnType<typeof setTimeout> | undefined;
    if (mode === 'success') {
      completeTimer = setTimeout(() => {
        setFadeOut(true);
        setTimeout(() => {
          onComplete?.();
        }, 400);
      }, actualDuration);
    }

    return () => {
      clearInterval(progressTimer);
      clearInterval(stepTimer);
      if (completeTimer) clearTimeout(completeTimer);
    };
  }, [duration, onComplete, steps.length, mode, errorMessage]);

  const CurrentIcon = steps[currentStep].icon;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 transition-opacity duration-400 p-4 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-100px] left-[-100px] w-[300px] sm:w-[400px] h-[300px] sm:h-[400px] rounded-full bg-blue-500/20 blur-3xl animate-pulse" />
        <div className="absolute bottom-[-100px] right-[-100px] w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] rounded-full bg-indigo-500/20 blur-3xl animate-pulse animation-delay-200" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Logo with Heartbeat Animation */}
        <div className="relative mb-7 sm:mb-9">
          {/* Pulse rings */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 sm:w-40 h-32 sm:h-40 rounded-full border-2 border-blue-400/30 animate-ping" style={{ animationDuration: '1.5s' }} />
          </div>

          {/* Main Logo Container - Increased by ~17% */}
          <div className="relative w-24 h-24 sm:w-32 sm:h-32 bg-white/10 backdrop-blur-sm rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-white/20">
            <img src={logoImage} alt="Health Watch Olongapo" className="w-full h-full object-cover animate-pulse" style={{ animationDuration: '1s' }} />
          </div>
        </div>

        {/* Welcome Text - Increased */}
        {mode === 'success' ? (
          <>
            <h1 className="text-white text-2xl sm:text-3xl font-bold mb-2.5 animate-fade-in text-center">
              Welcome back, {userName}
            </h1>
            <p className="text-blue-200 text-sm sm:text-base mb-7 sm:mb-9 animate-fade-in animation-delay-200">
              Health Watch Olongapo
            </p>
          </>
        ) : (
          <>
            <h1 className="text-white text-2xl sm:text-3xl font-bold mb-2.5 animate-fade-in text-center">
              Authenticating...
            </h1>
            <p className="text-blue-200 text-sm sm:text-base mb-7 sm:mb-9 animate-fade-in animation-delay-200">
              Please wait
            </p>
          </>
        )}

        {/* Current Step Indicator - Increased */}
        <div className="flex items-center gap-2.5 sm:gap-3.5 mb-6 sm:mb-7 animate-fade-in animation-delay-300">
          <CurrentIcon className={`w-5 h-5 sm:w-6 sm:h-6 ${steps[currentStep].color} animate-bounce`} />
          <span className="text-white/90 text-sm sm:text-base font-medium">
            {steps[currentStep].text}
          </span>
        </div>

        {/* Progress Bar - Wider */}
        <div className="w-full max-w-[18rem] sm:max-w-[20rem] h-2 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
          <div
            className="h-full bg-gradient-to-r from-blue-400 via-teal-400 to-green-400 rounded-full transition-all duration-100 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Step Indicators - Larger */}
        <div className="flex items-center gap-4 sm:gap-5 mt-6 sm:mt-7">
          {steps.map((step, index) => {
            const StepIcon = step.icon;
            const isActive = index === currentStep;
            const isComplete = index < currentStep;
            
            return (
              <div
                key={index}
                className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full transition-all duration-300 ${
                  isActive
                    ? "bg-white/20 border-2 border-white/50 scale-110"
                    : isComplete
                    ? "bg-green-500/30 border-2 border-green-400/50"
                    : "bg-white/5 border border-white/10"
                }`}
              >
                <StepIcon
                  className={`w-5 h-5 sm:w-6 sm:h-6 transition-colors duration-300 ${
                    isActive
                      ? step.color
                      : isComplete
                      ? "text-green-400"
                      : "text-white/30"
                  }`}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-6 sm:bottom-8 text-center">
        <p className="text-blue-300/50 text-sm">
          Olongapo City Health Office
        </p>
      </div>
    </div>
  );
}
