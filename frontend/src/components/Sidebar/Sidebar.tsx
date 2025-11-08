import './Sidebar.css'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  currentPath: string
}

function Sidebar({ isOpen, onClose, currentPath }: SidebarProps) {
  const { user } = useAuth()
  const location = useLocation()
  
  // Determine active path - handle project detail being under home
  const getActiveState = (path: string) => {
    if (path === '/' && (location.pathname === '/' || location.pathname.startsWith('/projects/'))) {
      return 'active'
    }
    return currentPath === path ? 'active' : ''
  }

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && <div className="sidebar-overlay" onClick={onClose}></div>}

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>VoloHub</h2>
          <button className="close-btn" onClick={onClose} aria-label="Close menu">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <nav className="sidebar-nav">
          <Link
            to="/"
            className={`nav-link ${getActiveState('/')}`}
            onClick={onClose}
          >
            <svg className="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            <span>Home</span>
          </Link>
          <Link
            to="/discover"
            className={`nav-link ${getActiveState('/discover')}`}
            onClick={onClose}
          >
            <svg className="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
            <span>Discover</span>
          </Link>
          
          {/* Only show My Projects and Settings when logged in */}
          {user && (
            <>
              <Link
                to="/my-projects"
                className={`nav-link ${getActiveState('/my-projects')}`}
                onClick={onClose}
              >
                <svg className="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                </svg>
                <span>My Projects</span>
              </Link>
              <Link
                to="/settings"
                className={`nav-link ${getActiveState('/settings')}`}
                onClick={onClose}
              >
                <svg className="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3"></circle>
                  <path d="M12 1v6m0 6v6m-6-6h6m6 0h6M4.22 4.22l4.24 4.24m7.08 7.08l4.24 4.24M4.22 19.78l4.24-4.24m7.08-7.08l4.24-4.24"></path>
                </svg>
                <span>Settings</span>
              </Link>
            </>
          )}
        </nav>
        <div className="profile-section">
          <div className="profile-avatar"></div>
          <span className="profile-label">Profile</span>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
