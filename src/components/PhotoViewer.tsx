import { useEffect, useState } from 'react'

interface PhotoViewerProps {
  imageUrl: string
  onClose: () => void
}

export function PhotoViewer({ imageUrl, onClose }: PhotoViewerProps) {
  const [zoomLevel, setZoomLevel] = useState(1)
  const [isDragging, setIsDragging] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  // Reset zoom and position when image changes
  useEffect(() => {
    setZoomLevel(1)
    setPosition({ x: 0, y: 0 })
  }, [imageUrl])

  // Handle zoom with mouse wheel
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    const newZoom = Math.min(Math.max(0.5, zoomLevel * delta), 3)
    setZoomLevel(newZoom)
    
    // Reset position when zooming back to 1
    if (newZoom === 1) {
      setPosition({ x: 0, y: 0 })
    }
  }

  // Handle drag to pan
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel > 1) {
      setIsDragging(true)
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      })
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        cursor: zoomLevel > 1 ? 'move' : 'pointer',
      }}
      onClick={onClose}
      onWheel={handleWheel}
    >
      <div
        style={{
          position: 'relative',
          width: '90vw',
          height: '90vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <img
          src={imageUrl}
          alt="Full screen view"
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
            borderRadius: 8,
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8)',
            transform: `scale(${zoomLevel}) translate(${position.x / zoomLevel}px, ${position.y / zoomLevel}px)`,
            transition: isDragging ? 'none' : 'transform 0.2s ease',
            cursor: zoomLevel > 1 ? 'grab' : 'default',
          }}
          draggable={false}
        />
        
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 20,
            right: 20,
            width: 40,
            height: 40,
            borderRadius: '50%',
            border: '2px solid rgba(255, 255, 255, 0.8)',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            fontSize: 20,
            fontWeight: 'bold',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'
            e.currentTarget.style.borderColor = 'white'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.8)'
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.8)'
          }}
        >
          ×
        </button>
        
        {/* Zoom controls */}
        <div
          style={{
            position: 'absolute',
            bottom: 20,
            left: 20,
            display: 'flex',
            gap: '10px',
            alignItems: 'center',
          }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation()
              setZoomLevel(Math.max(0.5, zoomLevel - 0.25))
              if (zoomLevel - 0.25 === 1) {
                setPosition({ x: 0, y: 0 })
              }
            }}
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              border: '1px solid rgba(255, 255, 255, 0.5)',
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              color: 'white',
              fontSize: 16,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            −
          </button>
          
          <span
            style={{
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: 12,
              minWidth: '40px',
              textAlign: 'center',
            }}
          >
            {Math.round(zoomLevel * 100)}%
          </span>
          
          <button
            onClick={(e) => {
              e.stopPropagation()
              setZoomLevel(Math.min(3, zoomLevel + 0.25))
            }}
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              border: '1px solid rgba(255, 255, 255, 0.5)',
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              color: 'white',
              fontSize: 16,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            +
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation()
              setZoomLevel(1)
              setPosition({ x: 0, y: 0 })
            }}
            style={{
              padding: '4px 8px',
              borderRadius: '4px',
              border: '1px solid rgba(255, 255, 255, 0.5)',
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: 10,
              cursor: 'pointer',
            }}
          >
            Reset
          </button>
        </div>
        
        <div
          style={{
            position: 'absolute',
            bottom: 20,
            right: 20,
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: 12,
            textAlign: 'right',
          }}
        >
          {zoomLevel > 1 ? 'Drag to pan • ' : ''}
          Scroll to zoom • ESC to close
        </div>
      </div>
    </div>
  )
}
