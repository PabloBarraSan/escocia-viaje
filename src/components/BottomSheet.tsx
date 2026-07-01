import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

const CLOSE_DRAG_PX = 88
const DRAG_SLOP_PX = 10

type Props = {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  footer?: ReactNode
}

export function BottomSheet({ open, onClose, title, children, footer }: Props) {
  const titleId = useId()
  const sheetRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef({
    pointerId: -1,
    tracking: false,
    dragging: false,
    startY: 0,
    offset: 0,
  })

  const [mounted, setMounted] = useState(open)
  const [visible, setVisible] = useState(false)
  const [dragOffset, setDragOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    if (open) {
      setMounted(true)
      setDragOffset(0)
      setIsDragging(false)
      const frame = requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true))
      })
      return () => cancelAnimationFrame(frame)
    }
    setVisible(false)
    const timer = window.setTimeout(() => setMounted(false), 280)
    return () => window.clearTimeout(timer)
  }, [open])

  useEffect(() => {
    if (!mounted) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [mounted])

  useEffect(() => {
    if (!mounted) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [mounted, onClose])

  const releasePointer = () => {
    const { pointerId } = dragRef.current
    if (pointerId >= 0) {
      sheetRef.current?.releasePointerCapture(pointerId)
    }
  }

  const resetDrag = () => {
    dragRef.current = { pointerId: -1, tracking: false, dragging: false, startY: 0, offset: 0 }
    setDragOffset(0)
    setIsDragging(false)
    releasePointer()
  }

  const onPointerDown = (event: React.PointerEvent) => {
    const fromHandle = (event.target as HTMLElement).closest('[data-sheet-handle]')
    const content = contentRef.current
    const canPullContent = content != null && content.scrollTop <= 0

    if (!fromHandle && !canPullContent) return

    dragRef.current = {
      pointerId: event.pointerId,
      tracking: !fromHandle,
      dragging: Boolean(fromHandle),
      startY: event.clientY,
      offset: 0,
    }
    if (fromHandle) setIsDragging(true)
    sheetRef.current?.setPointerCapture(event.pointerId)
  }

  const onPointerMove = (event: React.PointerEvent) => {
    const drag = dragRef.current
    if (drag.pointerId !== event.pointerId) return

    const delta = event.clientY - drag.startY
    if (drag.tracking && !drag.dragging) {
      if (delta <= DRAG_SLOP_PX) return
      drag.tracking = false
      drag.dragging = true
      setIsDragging(true)
    }
    if (!drag.dragging) return

    const offset = Math.max(0, delta)
    drag.offset = offset
    setDragOffset(offset)
    if (offset > 0) event.preventDefault()
  }

  const onPointerUp = (event: React.PointerEvent) => {
    const drag = dragRef.current
    if (drag.pointerId !== event.pointerId) return

    if (drag.dragging && drag.offset >= CLOSE_DRAG_PX) {
      resetDrag()
      onClose()
      return
    }
    resetDrag()
  }

  if (!mounted) return null

  const backdropOpacity = visible ? Math.max(0, 0.4 - dragOffset / 420) : 0
  const sheetTransform = visible ? `translateY(${dragOffset}px)` : 'translateY(100%)'

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-end justify-center">
      <button
        type="button"
        aria-label="Tancar"
        onClick={onClose}
        className="absolute inset-0 transition-opacity duration-300"
        style={{ backgroundColor: `rgba(20, 40, 32, ${backdropOpacity})` }}
      />
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className={`relative flex max-h-[min(92dvh,920px)] w-full max-w-lg flex-col rounded-t-[1.35rem] bg-white shadow-[0_-12px_40px_rgba(20,40,32,0.18)] ${
          isDragging ? '' : 'transition-transform duration-300 ease-out'
        }`}
        style={{ transform: sheetTransform }}
      >
        <div
          data-sheet-handle
          className="flex shrink-0 cursor-grab justify-center pt-3 pb-1 active:cursor-grabbing"
        >
          <div className="h-1 w-11 rounded-full bg-gray-300/90" aria-hidden />
        </div>

        {title && (
          <div
            data-sheet-handle
            className="flex shrink-0 cursor-grab items-center justify-between gap-3 border-b border-gray-100 px-4 pb-3 active:cursor-grabbing"
          >
            <h2 id={titleId} className="font-display text-lg font-bold text-highland-900">
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              aria-label="Tancar"
            >
              <X size={18} />
            </button>
          </div>
        )}

        <div
          ref={contentRef}
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4"
        >
          {children}
        </div>

        {footer && (
          <div className="shrink-0 border-t border-gray-100 bg-white/95 px-4 py-3 backdrop-blur safe-bottom">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}
