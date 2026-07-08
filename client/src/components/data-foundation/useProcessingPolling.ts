/**
 * useProcessingPolling
 *
 * A React hook that automatically starts the documentsStore polling when
 * mounted and stops it when unmounted. Import and use in any page that
 * lists documents so 'processing' → 'indexed' transitions are reflected live.
 *
 * Usage:
 *   import { useProcessingPolling } from '@/components/data-foundation/useProcessingPolling'
 *   // inside your component:
 *   useProcessingPolling()
 */

import { useEffect } from 'react'
import { useDocumentsStore } from '@/stores/documentsStore'

export function useProcessingPolling(): void {
  const startPolling = useDocumentsStore((s) => s.startPolling)
  const stopPolling  = useDocumentsStore((s) => s.stopPolling)
  const documents    = useDocumentsStore((s) => s.documents)

  useEffect(() => {
    const hasProcessing = documents.some((d) => d.status === 'processing')
    if (hasProcessing) {
      startPolling()
    }
    return () => {
      stopPolling()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documents.length]) // re-evaluate when document list changes (new upload etc.)
}
