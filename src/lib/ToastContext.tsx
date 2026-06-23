import { AlertCircle, CheckCircle2 } from "lucide-react";
import React, { createContext, useCallback, useContext, useState } from "react";

// --- Toast System ---
type ToastType = "success" | "error" | "info";
type ToastContextType = {
  showToast: (message: string, type?: ToastType) => void;
};
const ToastContext = createContext<ToastContextType>({ showToast: () => {} });

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toast, setToast] = useState<{
    message: string;
    type: ToastType;
    id: number;
  } | null>(null);

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    const id = Date.now();
    setToast({ message, type, id });
    setTimeout(() => {
      setToast((prev) => (prev?.id === id ? null : prev));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div
            className={`flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg border text-sm font-medium
            ${
              toast.type === "error"
                ? "bg-red-50 text-red-900 border-red-200 dark:bg-red-900/30 dark:text-red-200 dark:border-red-800"
                : toast.type === "success"
                  ? "bg-green-50 text-green-900 border-green-200 dark:bg-green-900/30 dark:text-green-200 dark:border-green-800"
                  : "bg-white text-slate-900 border-slate-200 dark:bg-slate-900 dark:text-slate-100 dark:border-slate-800"
            }`}
          >
            {toast.type === "error" && (
              <AlertCircle className="w-4 h-4 text-red-500" />
            )}
            {toast.type === "success" && (
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            )}
            {toast.message}
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
