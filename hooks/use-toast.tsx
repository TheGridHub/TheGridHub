'use client'

import { useState, useEffect, createContext, useContext } from 'react'

type ToastVariant = 'default' | 'destructive' | 'success'

interface Toast {
  id: string
  title: string
  description?: string
  variant?: ToastVariant
}

interface ToastContextType {
  toasts: Toast[]
  toast: (toast: Omit<Toast, 'id'>) => void
  dismiss: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = (newToast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(7)
    setToasts((prev) => [...prev, { ...newToast, id }])
    
    // Auto dismiss after 5 seconds
    setTimeout(() => {
      dismiss(id)
    }, 5000)
  }

  const dismiss = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
      <ToastContainer toasts={toasts} dismiss={dismiss} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    // Return a mock implementation if context is not available
    return {
      toast: (toast: Omit<Toast, 'id'>) => {
        console.log('Toast:', toast)
      },
      toasts: [],
      dismiss: () => {}
    }
  }
  return context
}

function ToastContainer({ toasts, dismiss }: { toasts: Toast[], dismiss: (id: string) => void }) {
  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            min-w-[300px] max-w-md p-4 rounded-lg shadow-lg backdrop-blur-md border
            animate-in slide-in-from-bottom-2 duration-300
            ${toast.variant === 'destructive' 
              ? 'bg-red-50/90 border-red-200 text-red-900' 
              : toast.variant === 'success'
              ? 'bg-green-50/90 border-green-200 text-green-900'
              : 'bg-white/90 border-purple-200 text-gray-900'}
          `}
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="font-semibold text-sm">{toast.title}</h3>
              {toast.description && (
                <p className="mt-1 text-sm opacity-90">{toast.description}</p>
              )}
            </div>
            <button
              onClick={() => dismiss(toast.id)}
              className="ml-4 text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}