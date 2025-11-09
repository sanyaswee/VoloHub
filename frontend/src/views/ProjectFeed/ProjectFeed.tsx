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
  const [allProjects, setAllProjects] = useState<Project[]>([])
  const [availableCities, setAvailableCities] = useState<string[]>([])
  const [selectedCity, setSelectedCity] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch all projects initially to get available cities
  useEffect(() => {
    const fetchAllProjects = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await apiService.getProjects()
        setAllProjects(data)
        setProjects(data)
        
        // Extract unique cities
        const cities = Array.from(new Set(data.map(project => project.city).filter(Boolean)))
        setAvailableCities(cities.sort())
      } catch (err) {
        setError('Failed to load projects. Please try again later.')
        console.error('Error loading projects:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchAllProjects()
  }, [])

  // Fetch projects when city filter changes
  useEffect(() => {
    const fetchProjectsByCity = async () => {
      if (selectedCity === 'all') {
        setProjects(allProjects)
        return
      }

      try {
        setLoading(true)
        setError(null)
        const data = await apiService.getProjectsByCity(selectedCity)
        setProjects(data)
      } catch (err) {
        setError('Failed to load projects. Please try again later.')
        console.error('Error loading projects:', err)
      } finally {
        setLoading(false)
      }
    }

    if (allProjects.length > 0) {
      fetchProjectsByCity()
    }
  }, [selectedCity, allProjects])

  const handleVoteChange = async () => {
    // Refresh projects after a vote
    try {
      const data = selectedCity === 'all' 
        ? await apiService.getProjects()
        : await apiService.getProjectsByCity(selectedCity)
      setProjects(data)
    } catch (err) {
      console.error('Error refreshing projects:', err)
    }
  }

  const handleCityChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCity(event.target.value)
  }

  if (loading) {
    return (
      <div className="project-feed-container">
        {availableCities.length > 0 && (
          <div className="city-filter">
            <label htmlFor="city-select">Filter by city:</label>
            <select 
              id="city-select" 
              value={selectedCity} 
              onChange={handleCityChange}
              className="city-dropdown"
            >
              <option value="all">All Cities</option>
              {availableCities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
        )}
        <div className="project-feed">
          <div className="loading-state">Loading projects...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="project-feed-container">
        {availableCities.length > 0 && (
          <div className="city-filter">
            <label htmlFor="city-select">Filter by city:</label>
            <select 
              id="city-select" 
              value={selectedCity} 
              onChange={handleCityChange}
              className="city-dropdown"
            >
              <option value="all">All Cities</option>
              {availableCities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
        )}
        <div className="project-feed">
          <div className="error-state">{error}</div>
        </div>
      </div>
    )
  }

  if (projects.length === 0) {
    return (
      <div className="project-feed-container">
        {availableCities.length > 0 && (
          <div className="city-filter">
            <label htmlFor="city-select">Filter by city:</label>
            <select 
              id="city-select" 
              value={selectedCity} 
              onChange={handleCityChange}
              className="city-dropdown"
            >
              <option value="all">All Cities</option>
              {availableCities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
        )}
        <div className="project-feed">
          <div className="empty-state">No projects found.</div>
        </div>
      </div>
    )
  }

  return (
    <div className="project-feed-container">
      {availableCities.length > 0 && (
        <div className="city-filter">
          <label htmlFor="city-select">Filter by city:</label>
          <select 
            id="city-select" 
            value={selectedCity} 
            onChange={handleCityChange}
            className="city-dropdown"
          >
            <option value="all">All Cities</option>
            {availableCities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>
      )}
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

export default ProjectFeed
