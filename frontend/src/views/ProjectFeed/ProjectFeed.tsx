import { useState, useEffect } from 'react'
import './ProjectFeed.css'
import ProjectCard from '../../components/ProjectCard/ProjectCard'
import apiService from '../../services/api'
import type { Project } from '../../types'

interface ProjectFeedProps {
  onEditProject?: (project: Project) => void
  onLoginRequired?: () => void
}

function ProjectFeed({ onEditProject, onLoginRequired }: ProjectFeedProps) {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await apiService.getProjects()
        setProjects(data)
      } catch (err) {
        setError('Failed to load projects. Please try again later.')
        console.error('Error loading projects:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [])

  const handleVoteChange = async () => {
    // Refresh projects after a vote
    try {
      const data = await apiService.getProjects()
      setProjects(data)
    } catch (err) {
      console.error('Error refreshing projects:', err)
    }
  }

  if (loading) {
    return (
      <div className="project-feed">
        <div className="loading-state">Loading projects...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="project-feed">
        <div className="error-state">{error}</div>
      </div>
    )
  }

  if (projects.length === 0) {
    return (
      <div className="project-feed">
        <div className="empty-state">No projects found.</div>
      </div>
    )
  }

  return (
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
  )
}

export default ProjectFeed
