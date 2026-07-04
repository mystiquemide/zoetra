"use client"
import { createContext, useContext, useState, useCallback } from "react"

interface Toast {
  id: string
  message: string
  type: "success" | "error" | "info"
}

const ToastContext = createContext<{
  toasts: Toast[]
  toast: (message: string, type?: Toast["type"]) => void
}>({ toasts: [], toast: () => {} })

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const add = useCallback((message: string, type: Toast["type"] = "info") => {
    const id = Math.random().toString(36)
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000)
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, toast: add }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <div key={t.id} className={`rounded-lg px-4 py-2 text-sm ${
            t.type === "success"
              ? "bg-z-alive text-z-bg"
              : t.type === "error"
                ? "bg-z-bleed text-white"
                : "bg-z-surface-2 text-z-text"
          }`}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
