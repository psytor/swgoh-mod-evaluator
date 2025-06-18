import { useEffect } from 'react'
import './ModDetailModal.css'
import { MOD_SETS, MOD_SLOTS, MOD_TIERS, STAT_NAMES, getSpeedRecommendation } from './ModCard'
import StatColumn from './StatColumn'

function EvaluationDetailsDisplay({ evaluation, mod }) {
  if (!evaluation || !evaluation.details) {
    return (
      <div className="evaluation-explanation">
        <p>{evaluation?.reason || 'No detailed evaluation available'}</p>
      </div>
    );
  }

  const { details } = evaluation;

  // Combined Speed + Offense Display
  if (details.type === 'combined') {
    return (
      <div className="evaluation-breakdown">
        <h4>Combined Speed & Offense Check</h4>
        <div className="combined-check">
          <div className="stat-requirement">
            <span className="stat-label">Speed:</span>
            <span className={`stat-value ${details.speed >= details.minSpeed ? 'pass' : 'fail'}`}>
              {details.speed} / {details.minSpeed} required
            </span>
          </div>
          <div className="stat-requirement">
            <span className="stat-label">Offense:</span>
            <span className={`stat-value ${details.offense >= details.minOffense ? 'pass' : 'fail'}`}>
              {details.offense} / {details.minOffense} required
            </span>
          </div>
          <div className="combined-result">
            Both stats present and meet minimums: {details.bothPresent ? '✓ Pass' : '✗ Fail'}
          </div>
        </div>
      </div>
    );
  }

  // Full Point Scoring Display
  if (details.type === 'points') {
    return (
      <div className="evaluation-breakdown">
        <h4>Full Scoring Analysis</h4>
        
        {/* Score Summary */}
        <div className="score-summary">
          <div className="score-item">
            <span className="score-label">Base Points:</span>
            <span className="score-value">{details.basePoints}</span>
          </div>
          <div className="score-item">
            <span className="score-label">Synergy Bonus:</span>
            <span className="score-value">+{details.synergyBonus}</span>
          </div>
          <div className="score-divider"></div>
          <div className="score-item score-total">
            <span className="score-label">Total Score:</span>
            <span className="score-value">{details.totalScore}</span>
          </div>
          <div className="score-item">
            <span className="score-label">Required:</span>
            <span className="score-value">{details.threshold}</span>
          </div>
        </div>

        {/* Stat Breakdown */}
        <div className="stat-breakdown-section">
          <h5>Stat Contributions</h5>
          <div className="stat-breakdown-list">
            {details.statBreakdown.map((stat, idx) => (
              <div key={idx} className="stat-breakdown-item">
                <span className="stat-name">{stat.name}:</span>
                <span className="stat-points">{stat.points} pts</span>
                <span className="stat-formula">({stat.formula})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Synergy Breakdown */}
        {details.synergyBreakdown.length > 0 && (
          <div className="synergy-breakdown-section">
            <h5>Synergy Bonuses</h5>
            <div className="synergy-breakdown-list">
              {details.synergyBreakdown.map((synergy, idx) => (
                <div key={idx} className="synergy-item">
                  <span className="synergy-type">{synergy.type}:</span>
                  <span className="synergy-desc">{synergy.description}</span>
                  <span className="synergy-bonus">+{synergy.bonus}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Visual Explanation */}
        <div className="evaluation-help">
          <h5>How Synergy Works</h5>
          <ul>
            <li><strong>Set + Secondary:</strong> When secondary stats match the mod set's purpose (e.g., Speed on a Speed set mod)</li>
            <li><strong>Stat Combos:</strong> When complementary stats appear together (e.g., Offense + Offense %)</li>
            <li><strong>Perfect Match:</strong> Special bonuses for ideal primary/set combinations (e.g., Speed Arrow on Speed Set)</li>
          </ul>
        </div>
      </div>
    );
  }

  // Default display
  return (
    <div className="evaluation-explanation">
      <p>{evaluation.reason}</p>
    </div>
  );
}

function ModDetailModal({ mod, isOpen, onClose, evaluationMode = 'beginner' }) {
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
  const recommendation = getSpeedRecommendation(mod, evaluationMode, false);

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
                <div className="explanation-title">Evaluation Steps:</div>
                <ul className="explanation-steps">
                  {recommendation.explanation && recommendation.explanation.map((step, index) => (
                    <li key={index}>{step}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ModDetailModal