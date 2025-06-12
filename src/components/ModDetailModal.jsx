import { useEffect } from 'react'
import './ModDetailModal.css'

function ModDetailModal({ mod, isOpen, onClose }) {
  // Handle ESC key press
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    
    if (isOpen) {
      document.addEventListener('keydown', handleEsc)
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden'
    }
    
    return () => {
      document.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen || !mod) return null

  // Handle click outside
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>
          ×
        </button>
        
        <div className="modal-header">
          <h2>Mod Details</h2>
        </div>
        
        <div className="modal-body">
          {/* Placeholder content for now */}
          <p>Mod details will go here</p>
          <p>Mod ID: {mod.id}</p>
        </div>
      </div>
    </div>
  )
}

export default ModDetailModal