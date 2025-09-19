'use client'

import { ReactNode, useState } from 'react'
import { AlertTriangle, Trash2, X, Check } from 'lucide-react'
import { LoadingButton } from './Loading'

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void> | void
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  type?: 'danger' | 'warning' | 'info'
  icon?: ReactNode
  children?: ReactNode
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  type = 'danger',
  icon,
  children
}: ConfirmDialogProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleConfirm = async () => {
    setIsLoading(true)
    try {
      await onConfirm()
      onClose()
    } catch (error) {
      console.error('Confirmation action failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      onClose()
    }
  }

  if (!isOpen) return null

  const typeStyles = {
    danger: {
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      confirmBtn: 'bg-red-600 hover:bg-red-700 text-white',
      defaultIcon: <Trash2 className="w-6 h-6" />
    },
    warning: {
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
      confirmBtn: 'bg-yellow-600 hover:bg-yellow-700 text-white',
      defaultIcon: <AlertTriangle className="w-6 h-6" />
    },
    info: {
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      confirmBtn: 'bg-[#873bff] hover:bg-[#7a35e6] text-white',
      defaultIcon: <Check className="w-6 h-6" />
    }
  }

  const styles = typeStyles[type]

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${styles.iconBg}`}>
            <div className={styles.iconColor}>
              {icon || styles.defaultIcon}
            </div>
          </div>

          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-600 mb-4">{description}</p>
            {children}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6">
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          
          <LoadingButton
            onClick={handleConfirm}
            loading={isLoading}
            className={`px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 ${styles.confirmBtn}`}
          >
            {confirmLabel}
          </LoadingButton>
        </div>
      </div>
    </div>
  )
}

// Predefined confirmation dialogs for common actions
export function DeleteConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  itemType = 'item',
  additionalWarning
}: {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void> | void
  itemName: string
  itemType?: string
  additionalWarning?: string
}) {
  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      type="danger"
      title={`Delete ${itemType}`}
      description={`Are you sure you want to delete "${itemName}"? This action cannot be undone.`}
      confirmLabel="Delete"
      cancelLabel="Cancel"
    >
      {additionalWarning && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{additionalWarning}</p>
        </div>
      )}
    </ConfirmDialog>
  )
}

export function RemoveMemberConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  memberName
}: {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void> | void
  memberName: string
}) {
  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      type="warning"
      title="Remove team member"
      description={`Are you sure you want to remove ${memberName} from the team? They will lose access to all team projects and data.`}
      confirmLabel="Remove Member"
      cancelLabel="Cancel"
    />
  )
}

export function ArchiveConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  itemType = 'item'
}: {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void> | void
  itemName: string
  itemType?: string
}) {
  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      type="warning"
      title={`Archive ${itemType}`}
      description={`Are you sure you want to archive "${itemName}"? You can restore it later from the archived items.`}
      confirmLabel="Archive"
      cancelLabel="Cancel"
    />
  )
}

export function LeaveTeamConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  teamName
}: {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void> | void
  teamName: string
}) {
  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      type="warning"
      title="Leave team"
      description={`Are you sure you want to leave "${teamName}"? You will lose access to all team projects and data.`}
      confirmLabel="Leave Team"
      cancelLabel="Cancel"
    >
      <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800">
          If you're the team owner, you'll need to transfer ownership before leaving.
        </p>
      </div>
    </ConfirmDialog>
  )
}

export function CancelSubscriptionConfirmDialog({
  isOpen,
  onClose,
  onConfirm
}: {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void> | void
}) {
  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      type="warning"
      title="Cancel subscription"
      description="Are you sure you want to cancel your subscription? You'll lose access to Pro features at the end of your billing period."
      confirmLabel="Cancel Subscription"
      cancelLabel="Keep Subscription"
    >
      <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800">
          Your subscription will remain active until the end of your billing period. 
          You can reactivate it anytime before it expires.
        </p>
      </div>
    </ConfirmDialog>
  )
}

export function DeleteAccountConfirmDialog({
  isOpen,
  onClose,
  onConfirm
}: {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void> | void
}) {
  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      type="danger"
      title="Delete account"
      description="This will permanently delete your account and all associated data. This action cannot be undone."
      confirmLabel="Delete Account"
      cancelLabel="Cancel"
    >
      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-sm text-red-800 font-medium mb-2">This will delete:</p>
        <ul className="text-sm text-red-800 list-disc list-inside space-y-1">
          <li>All your projects and tasks</li>
          <li>Team data (if you're the owner)</li>
          <li>All notes and contacts</li>
          <li>Your billing history</li>
        </ul>
      </div>
    </ConfirmDialog>
  )
}

// Hook for managing dialog state
export function useConfirmDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const [dialogProps, setDialogProps] = useState<Partial<ConfirmDialogProps>>({})

  const openDialog = (props: Partial<ConfirmDialogProps>) => {
    setDialogProps(props)
    setIsOpen(true)
  }

  const closeDialog = () => {
    setIsOpen(false)
    setDialogProps({})
  }

  const ConfirmDialogComponent = () => (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={closeDialog}
      onConfirm={() => {}}
      title=""
      description=""
      {...dialogProps}
    />
  )

  return {
    isOpen,
    openDialog,
    closeDialog,
    ConfirmDialog: ConfirmDialogComponent
  }
}
