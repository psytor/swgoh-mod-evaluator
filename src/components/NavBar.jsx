import { useState } from 'react'
import './NavBar.css'

function NavBar({ currentPlayer, savedPlayers, onPlayerSwitch, onRefresh, onAddNew, isRefreshing, onDeletePlayer }) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav className="nav-bar">
      <div className="nav-container">
        <div className="nav-left">
          <h1 className="nav-title">SWGOH Mod Evaluator</h1>
        </div>
        
        <div className={`nav-right ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          {currentPlayer && (
            <div className="player-dropdown">
              <button 
                className="player-dropdown-toggle"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <div>
                  {currentPlayer.name}
                  {currentPlayer.lastUpdated && (
                    <div className="last-updated">
                      Last updated: {new Date(currentPlayer.lastUpdated).toLocaleTimeString()}
                    </div>
                  )}
                </div>
                <span className="dropdown-arrow">▼</span>
              </button>
              
              {dropdownOpen && (
                <div className="player-dropdown-menu">
                  {savedPlayers.map(player => (
                    <div key={player.allyCode} className="dropdown-player-row">
                      <button
                        className={`dropdown-item ${player.allyCode === currentPlayer.allyCode ? 'active' : ''}`}
                        onClick={() => {
                          onPlayerSwitch(player.allyCode)
                          setDropdownOpen(false)
                        }}
                      >
                        {player.name}
                      </button>
                      <button
                        className="player-delete-btn"
                        onClick={(e) => {
                          e.stopPropagation()
                          if (confirm(`Delete ${player.name}?`)) {
                            onDeletePlayer(player.allyCode)
                          }
                        }}
                        title="Delete player"
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                  <div className="dropdown-divider"></div>
                  <button
                    className="dropdown-item add-new"
                    onClick={() => {
                      onAddNew()
                      setDropdownOpen(false)
                    }}
                  >
                    + Add New Player
                  </button>
                </div>
              )}
            </div>
          )}
          
          {currentPlayer && (
            <button 
              className={`refresh-button ${isRefreshing ? 'refreshing' : ''}`} 
              onClick={(e) => onRefresh(e)} 
              title="Refresh player data"
              disabled={isRefreshing}
            >
              🔄
            </button>
          )}
        </div>
        
        <button 
          className="mobile-menu-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </nav>
  )
}

export default NavBar