interface ToastItem {
  id: number;
  message: string;
  type: "success" | "error" | "info";
}

interface ToastContainerProps {
  toasts: ToastItem[];
  onRemove: (id: number) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  const colors = {
    success: "bg-green-600/90 border-green-500",
    error: "bg-red-600/90 border-red-500",
    info: "bg-blue-600/90 border-blue-500",
  };

  return (
    <div className="fixed bottom-4 left-4 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`animate-fade-in px-4 py-2 rounded-lg border text-white text-sm shadow-lg cursor-pointer ${colors[t.type]}`}
          onClick={() => onRemove(t.id)}
          dir="ltr"
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
