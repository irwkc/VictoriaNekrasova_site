import { useEffect } from 'react'
import { AnimatePresence, motion } from 'motion/react'

export type AdminDialogConfig = {
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'neutral'
  /** Single-button alert (no cancel). */
  alert?: boolean
  onConfirm: () => void
}

type Props = AdminDialogConfig & {
  open: boolean
  onCancel: () => void
}

export default function AdminDialog({
  open,
  title,
  message,
  confirmLabel = 'CONFIRM',
  cancelLabel = 'CANCEL',
  variant = 'neutral',
  alert = false,
  onConfirm,
  onCancel,
}: Props) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onCancel])

  const confirmClass =
    variant === 'danger'
      ? 'border border-blood bg-blood text-ink hover:bg-transparent hover:text-blood'
      : 'border border-bone/30 text-bone hover:border-bone'

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/88 backdrop-blur-sm p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={alert ? onConfirm : onCancel}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-dialog-title"
            className="w-full max-w-md border border-bone/15 bg-ink shadow-[0_24px_80px_rgba(0,0,0,0.55)]"
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-bone/10 px-5 py-4">
              <p className="font-mono text-[9px] tracking-[0.35em] text-bone/40">VN ADMIN</p>
              <h2 id="admin-dialog-title" className="font-display text-xl tracking-wide mt-2 text-bone">
                {title}
              </h2>
            </div>

            <p className="px-5 py-5 font-mono text-xs leading-relaxed text-bone/65">{message}</p>

            <div className={`flex gap-2 px-5 pb-5 ${alert ? 'justify-end' : 'justify-end sm:justify-between'}`}>
              {!alert && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="font-mono text-[10px] tracking-[0.25em] border border-bone/15 px-4 py-2.5 text-bone/50 hover:text-bone hover:border-bone/40 transition-colors"
                >
                  {cancelLabel}
                </button>
              )}
              <button
                type="button"
                onClick={onConfirm}
                className={`font-mono text-[10px] tracking-[0.25em] px-4 py-2.5 transition-colors ${confirmClass}`}
              >
                {alert ? 'OK' : confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
