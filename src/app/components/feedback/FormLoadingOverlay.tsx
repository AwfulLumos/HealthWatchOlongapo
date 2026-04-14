interface FormLoadingOverlayProps {
  open: boolean;
  title: string;
  message?: string;
}

export function FormLoadingOverlay({
  open,
  title,
  message = "Please wait",
}: FormLoadingOverlayProps) {
  if (!open) return null;

  return (
    <div
      className="absolute inset-0 z-20 flex items-center justify-center bg-white/70 backdrop-blur-sm"
      role="status"
      aria-live="polite"
    >
      <div className="bg-white border border-gray-200 rounded-xl shadow-card px-6 py-5 flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
        <div className="text-center">
          <p className="text-gray-900 font-semibold text-sm">{title}</p>
          <p className="text-gray-500 text-xs">{message}</p>
        </div>
      </div>
    </div>
  );
}
