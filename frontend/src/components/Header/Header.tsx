import './Header.css'
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import api from '../../services/api'
import type { Project } from '../../types'

interface HeaderProps {
  onMenuToggle: () => void
  onNewProjectClick: () => void
  onLoginClick: () => void
}

function Header({ onMenuToggle, onNewProjectClick, onLoginClick }: HeaderProps) {
  const { user, loading, logout } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Project[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const searchContainerRef = useRef<HTMLDivElement>(null)

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  // Debounced search effect
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      setShowDropdown(false)
      return
    }

    setIsSearching(true)
    const timeoutId = setTimeout(async () => {
      try {
        const results = await api.searchProjects(searchQuery)
        setSearchResults(results)
        setShowDropdown(true)
      } catch (error) {
        console.error('Search failed:', error)
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    }, 300) // 300ms debounce delay

    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleProjectClick = (projectId: number) => {
    window.location.href = `/project/${projectId}`
    setShowDropdown(false)
    setSearchQuery('')
  }

  return (
    <>
      {/* Mobile Header - Fixed at top, hidden on desktop */}
      <header className="mobile-header">
        <button className="hamburger-btn" onClick={onMenuToggle} aria-label="Toggle menu">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
        <h2>VoloHub</h2>
        <div className="header-actions mobile-actions">
          {loading ? (
            <div className="auth-loading">
              <div className="loading-spinner"></div>
            </div>
          ) : user ? (
            <>
              <button className="btn-primary" onClick={onNewProjectClick}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                <span>New Project</span>
              </button>
              <div className="user-menu">
                <button className="user-avatar" aria-label="User menu">
                  {user.username.charAt(0).toUpperCase()}
                </button>
                <div className="user-dropdown glass">
                  <div className="user-info">
                    <div className="user-name">{user.username}</div>
                    <div className="user-email">{user.email}</div>
                  </div>
                  <div className="dropdown-divider"></div>
                  <button className="dropdown-item" onClick={handleLogout}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                      <polyline points="16 17 21 12 16 7"></polyline>
                      <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                    Logout
                  </button>
                </div>
              </div>
            </>
          ) : (
            <button className="btn-primary" onClick={onLoginClick}>
              Login
            </button>
          )}
        </div>
      </header>

      {/* Content Header - Inside main content */}
      <header className="content-header">
        <div className="search-container" ref={searchContainerRef}>
          <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <input 
            type="text" 
            className="search-input" 
            placeholder="Search projects, volunteers, or organizations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchQuery && setShowDropdown(true)}
          />
          {isSearching && (
            <div className="search-loading">
              <div className="loading-spinner"></div>
            </div>
          )}
          {showDropdown && (
            <div className="search-dropdown glass">
              {searchResults.length > 0 ? (
                <>
                  <div className="search-dropdown-header">
                    {searchResults.length} {searchResults.length === 1 ? 'result' : 'results'} found
                  </div>
                  <div className="search-results">
                    {searchResults.map((project) => (
                      <button
                        key={project.id}
                        className="search-result-item"
                        onClick={() => handleProjectClick(project.id)}
                      >
                        <div className="search-result-content">
                          <div className="search-result-title">{project.name}</div>
                          <div className="search-result-meta">
                            <span>{project.city}</span>
                            <span>•</span>
                            <span>{project.votes} votes</span>
                          </div>
                        </div>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div className="search-no-results">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                  </svg>
                  <p>No projects found</p>
                  <span>Try a different search term</span>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="header-actions desktop-actions">
          {loading ? (
            <div className="auth-loading">
              <div className="loading-spinner"></div>
            </div>
          ) : user ? (
            <>
              <button className="btn-primary" onClick={onNewProjectClick}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                <span>New Project</span>
              </button>
              <div className="user-menu">
                <button className="user-avatar" aria-label="User menu">
                  {user.username.charAt(0).toUpperCase()}
                </button>
                <div className="user-dropdown glass">
                  <div className="user-info">
                    <div className="user-name">{user.username}</div>
                    <div className="user-email">{user.email}</div>
                  </div>
                  <div className="dropdown-divider"></div>
                  <button className="dropdown-item" onClick={handleLogout}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                      <polyline points="16 17 21 12 16 7"></polyline>
                      <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                    Logout
                  </button>
                </div>
              </div>
            </>
          ) : (
            <button className="btn-primary" onClick={onLoginClick}>
              Login
            </button>
          )}
        </div>
      </header>
    </>
  )
}

export default Header
