type ToastType = 'success' | 'error' | 'info' | 'warning'

type ToastOptions = {
  id?: string
  type?: ToastType
  timeout?: number
}

export type ToastItem = {
  id: string
  message: string
  type: ToastType
  timeout: number
}

const TOAST_STATE_KEY = 'toast.queue'

const generateToastId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `toast-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export const useToastState = () => useState<ToastItem[]>(TOAST_STATE_KEY, () => [])

export const useToast = () => {
  const toasts = useToastState()

  const removeToast = (id: string) => {
    toasts.value = toasts.value.filter((toast) => toast.id !== id)
  }

  const scheduleRemoval = (id: string, timeout: number) => {
    if (!process.client || timeout <= 0) {
      return
    }
    setTimeout(() => {
      removeToast(id)
    }, timeout)
  }

  const addToast = (message: string, options: ToastOptions = {}) => {
    if (!message) {
      return null
    }

    const toast: ToastItem = {
      id: options.id ?? generateToastId(),
      message,
      type: options.type ?? 'info',
      timeout: options.timeout ?? 4000
    }

    toasts.value = [...toasts.value, toast]
    scheduleRemoval(toast.id, toast.timeout)
    return toast.id
  }

  const createTypedToast =
    (type: ToastType) =>
    (message: string, options?: Omit<ToastOptions, 'type'>) =>
      addToast(message, { ...options, type })

  return {
    toasts,
    addToast,
    removeToast,
    success: createTypedToast('success'),
    error: createTypedToast('error'),
    info: createTypedToast('info'),
    warning: createTypedToast('warning')
  }
}

