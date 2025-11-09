import { useState, useEffect } from 'react'
import './MyProjects.css'
import ProjectCard from '../../components/ProjectCard/ProjectCard'
import { useAuth } from '../../contexts/AuthContext'
import apiService from '../../services/api'
import type { Project } from '../../types'

interface MyProjectsProps {
  onEditProject?: (project: Project) => void
  onLoginRequired?: () => void
}

function MyProjects({ onEditProject, onLoginRequired }: MyProjectsProps) {
  const { user } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMyProjects = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        const data = await apiService.getMyProjects()
        setProjects(data)
      } catch (err) {
        setError('Failed to load your projects. Please try again later.')
        console.error('Error loading my projects:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchMyProjects()
  }, [user])

  const handleVoteChange = async () => {
    // Refresh projects after a vote
    if (!user) return
    
    try {
      const data = await apiService.getMyProjects()
      setProjects(data)
    } catch (err) {
      console.error('Error refreshing projects:', err)
    }
  }

  // Show login prompt if user is not authenticated
  if (!user && !loading) {
    return (
      <div className="view-container">
        <h1 className="view-title">My Projects</h1>
        <p className="view-description">Manage and track your volunteer projects and contributions.</p>
        <div className="auth-notice">
          <p>Please log in to view your projects.</p>
          <button className="login-button" onClick={onLoginRequired}>
            Log In
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="view-container">
        <h1 className="view-title">My Projects</h1>
        <p className="view-description">Manage and track your volunteer projects and contributions.</p>
        <div className="project-feed">
          <div className="loading-state">Loading your projects...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="view-container">
        <h1 className="view-title">My Projects</h1>
        <p className="view-description">Manage and track your volunteer projects and contributions.</p>
        <div className="project-feed">
          <div className="error-state">{error}</div>
        </div>
      </div>
    )
  }

  if (projects.length === 0) {
    return (
      <div className="view-container">
        <h1 className="view-title">My Projects</h1>
        <p className="view-description">Manage and track your volunteer projects and contributions.</p>
        <div className="project-feed">
          <div className="empty-state">
            You haven't created any projects yet. Click "New Project" to get started!
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="view-container">
      <h1 className="view-title">My Projects</h1>
      <p className="view-description">Manage and track your volunteer projects and contributions.</p>
      <div className="project-feed">
        {projects.map((project) => (
          <ProjectCard 
            key={project.id} 
            project={project} 
            onEdit={onEditProject}
            onLoginRequired={onLoginRequired}
            onVoteChange={handleVoteChange}
          />
        ))}
      </div>
    </div>
  )
}

export default MyProjects
