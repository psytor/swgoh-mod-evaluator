import { useEffect } from 'react'
import './ModDetailModal.css'
import { MOD_SETS, MOD_SLOTS, MOD_TIERS, STAT_NAMES, getSpeedRecommendation } from './ModCard'
import StatColumn from './StatColumn'

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

  // Get evaluation recommendation
  const dots = parseInt(mod.definitionId[1]);
  const is6Dot = dots === 6;
  const recommendation = getSpeedRecommendation(mod, 'basic', false); // Using basic mode for now

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
          {/* Basic mod info section */}
          <div className="modal-mod-info">
            <div className="mod-info-item">
              <span className="info-label">Set:</span>
              <span className="info-value">{MOD_SETS[mod.definitionId[0]] || 'Unknown'}</span>
            </div>
            <div className="mod-info-item">
              <span className="info-label">Slot:</span>
              <span className="info-value">{MOD_SLOTS[mod.definitionId[2]] || 'Unknown'}</span>
            </div>
            <div className="mod-info-item">
              <span className="info-label">Tier:</span>
              <span className="info-value">{MOD_TIERS[mod.tier] || 'Unknown'}</span>
            </div>
            <div className="mod-info-item">
              <span className="info-label">Level:</span>
              <span className="info-value">{mod.level}/15</span>
            </div>
          </div>
          
          {/* Secondary stats section */}
          <div className="modal-stats-section">
            <h3>Secondary Stats</h3>
            <div className="stats-grid">
              {mod.secondaryStat && mod.secondaryStat.length > 0 ? (
                mod.secondaryStat.map((stat, index) => {
                  const dots = parseInt(mod.definitionId[1]);
                  const is6Dot = dots === 6;
                  return <StatColumn key={index} stat={stat} is6Dot={is6Dot} />
                })
              ) : (
                <p className="no-stats">No secondary stats</p>
              )}
            </div>
          </div>
          
          {/* Evaluation section */}
          <div className="modal-evaluation-section">
            <h3>Evaluation</h3>
            <div className="evaluation-content">
              <div className={`evaluation-verdict ${recommendation.className}`}>
                <span className="verdict-label">Verdict:</span>
                <span className="verdict-value">{recommendation.text}</span>
              </div>
              <div className="evaluation-explanation">
                <p>Current evaluation: Speed-based only</p>
                {/* More detailed explanation will come with the new system */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ModDetailModal