import { CheckCircle2, Loader2, X } from "lucide-react";

type StatusModalVariant = "success" | "loading";

interface StatusModalProps {
  open: boolean;
  title: string;
  message?: string;
  variant?: StatusModalVariant;
  onClose?: () => void;
  closeLabel?: string;
}

export function StatusModal({
  open,
  title,
  message,
  variant = "success",
  onClose,
  closeLabel = "OK",
}: StatusModalProps) {
  if (!open) return null;

  const isLoading = variant === "loading";

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-3 sm:p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="relative bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-scale-in">
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-100 bg-white/90 backdrop-blur-sm">
          <h2 className="text-gray-900 font-bold text-base sm:text-lg">{title}</h2>
          {!isLoading && onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-all duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                isLoading ? "bg-blue-100" : "bg-green-100"
              }`}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 text-blue-700 animate-spin" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-green-700" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-gray-800 text-sm font-semibold">
                {isLoading ? "Please wait" : "Success"}
              </p>
              <p className="text-gray-500 text-xs sm:text-sm mt-1">
                {message || (isLoading ? "Submitting your data..." : "Your changes have been saved.")}
              </p>
            </div>
          </div>
        </div>

        {!isLoading && onClose && (
          <div className="p-4 sm:p-5 border-t border-gray-100 flex justify-end bg-gray-50/50">
            <button
              onClick={onClose}
              className="px-4 sm:px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg press-effect text-xs sm:text-sm font-semibold"
            >
              {closeLabel}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
