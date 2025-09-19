"use client"

import { useEffect, useState } from 'react'

export default function AdminToaster() {
  const [items, setItems] = useState<Array<{ id: number, text: string, type: 'info'|'success'|'error' }>>([])
  useEffect(() => {
    let idSeq = 1
    function onToast(e: any) {
      const detail = e.detail || {}
      const id = idSeq++
      setItems((arr) => [...arr, { id, text: String(detail.text || ''), type: (detail.type || 'info') }])
      setTimeout(() => setItems(arr => arr.filter(i => i.id !== id)), detail.duration || 3000)
    }
    window.addEventListener('app:toast', onToast as any)
    return () => window.removeEventListener('app:toast', onToast as any)
  }, [])

  return (
    <div className="fixed z-[9999] bottom-4 right-4 space-y-2">
      {items.map(i => (
        <div key={i.id} className={`px-3 py-2 rounded-lg shadow border text-sm ${i.type==='success'?'bg-green-50 border-green-200 text-green-800': i.type==='error'?'bg-red-50 border-red-200 text-red-800':'bg-slate-50 border-slate-200 text-slate-800'}`}>
          {i.text}
        </div>
      ))}
    </div>
  )
}

