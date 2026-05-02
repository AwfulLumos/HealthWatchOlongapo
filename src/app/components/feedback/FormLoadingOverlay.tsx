type LoadingTone = "info" | "success" | "danger";

interface FormLoadingOverlayProps {
  open: boolean;
  title: string;
  message?: string;
  tone?: LoadingTone;
}

export function FormLoadingOverlay({
  open,
  title,
  message = "Please wait",
  tone = "info",
}: FormLoadingOverlayProps) {
  if (!open) return null;

  const toneStyles: Record<LoadingTone, { ring: string; dot: string; glow: string; badge: string }> = {
    info: {
      ring: "border-blue-200/70 border-t-blue-600",
      dot: "bg-blue-500",
      glow: "from-blue-200/70 via-sky-200/40 to-blue-200/70",
      badge: "border-blue-200/80 bg-blue-50/70 text-blue-700",
    },
    success: {
      ring: "border-emerald-200/70 border-t-emerald-600",
      dot: "bg-emerald-500",
      glow: "from-emerald-200/70 via-teal-200/40 to-emerald-200/70",
      badge: "border-emerald-200/80 bg-emerald-50/70 text-emerald-700",
    },
    danger: {
      ring: "border-rose-200/70 border-t-rose-600",
      dot: "bg-rose-500",
      glow: "from-rose-200/70 via-pink-200/40 to-rose-200/70",
      badge: "border-rose-200/80 bg-rose-50/70 text-rose-700",
    },
  };

  const styles = toneStyles[tone];

  return (
    <div
      className="absolute inset-0 z-20 flex items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br from-white/80 via-white/70 to-white/50 backdrop-blur-md"
      role="status"
      aria-live="polite"
    >
      <div className="relative w-[220px] sm:w-[260px] rounded-2xl border border-white/70 bg-white/70 p-4 sm:p-5 shadow-[0_28px_70px_-35px_rgba(15,23,42,0.6)] overflow-hidden">
        <div className={`absolute -top-10 -right-10 h-28 w-28 rounded-full bg-gradient-to-br ${styles.glow} blur-2xl`} />
        <div className="relative z-10 flex flex-col items-center text-center gap-3">
          <div className="relative">
            <div className={`absolute inset-0 rounded-full ${styles.dot} opacity-30 blur-xl`} />
            <div className={`w-12 h-12 rounded-full border-2 ${styles.ring} animate-spin`} />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className={`w-2.5 h-2.5 rounded-full ${styles.dot} animate-pulse`} />
            </div>
          </div>
          <div>
            <p className="text-gray-900 font-semibold text-sm">{title}</p>
            <p className="text-gray-500 text-xs">{message}</p>
          </div>
          <div className={`text-[0.6rem] uppercase tracking-[0.2em] px-2.5 py-1 rounded-full border ${styles.badge}`}>
            Processing
          </div>
        </div>
      </div>
    </div>
  );
}
