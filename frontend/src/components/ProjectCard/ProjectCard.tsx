import './ProjectCard.css'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Project } from '../../types'
import { useAuth } from '../../contexts/AuthContext'
import apiService from '../../services/api'

interface ProjectCardProps {
  project: Project
  onEdit?: (project: Project) => void
  onLoginRequired?: () => void
  onVoteChange?: () => void
}

function ProjectCard({ project, onEdit, onLoginRequired, onVoteChange }: ProjectCardProps) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [isVoting, setIsVoting] = useState(false)
  
  // Check if user has already voted on this project
  // user_voted: 1 = upvote, -1 = downvote, 0 or null = no vote
  const hasVoted = project.user_voted === 1 || project.user_voted === -1
  const isUpvoted = project.user_voted === 1
  
  // Only show edit button if user is the author
  const canEdit = user && project.author === user.id && onEdit

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onEdit) {
      onEdit(project)
    }
  }

  const handleVoteClick = async (e: React.MouseEvent) => {
    e.stopPropagation()
    
    // Check if user is logged in
    if (!user) {
      if (onLoginRequired) {
        onLoginRequired()
      }
      return
    }

    // Prevent multiple simultaneous votes
    if (isVoting) return

    try {
      setIsVoting(true)
      
      if (hasVoted) {
        // Remove the existing vote
        await apiService.removeVote(project.id)
      } else {
        // Add new upvote
        await apiService.voteProject(project.id, { value: 1 })
      }
      
      // Refresh the project list to get updated vote count
      if (onVoteChange) {
        onVoteChange()
      }
    } catch (error) {
      console.error('Error voting:', error)
      // Could show a toast notification here
    } finally {
      setIsVoting(false)
    }
  }

  const handleCommentClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!user && onLoginRequired) {
      onLoginRequired()
    }
    // TODO: Implement actual comments when logged in
  }

  const handleCardClick = () => {
    navigate(`/projects/${project.id}`)
  }

  const handleViewDetailsClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigate(`/projects/${project.id}`)
  }

  return (
    <article className="project-card" onClick={handleCardClick}>
      {canEdit && (
        <button 
          className="edit-button" 
          onClick={handleEditClick}
          aria-label="Edit project"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
        </button>
      )}
      <div className="project-card-header">
        <h2 className="project-title">{project.name}</h2>
        <div className="project-location">
          <svg className="location-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          <span>{project.location}, {project.city}</span>
        </div>
      </div>
      <p className="project-description">{project.description}</p>
      <div className="project-card-footer">
        <div className="project-stats">
          <button 
            className={`stat-button ${isVoting ? 'voting' : ''} ${isUpvoted ? 'voted' : ''}`}
            onClick={handleVoteClick}
            disabled={isVoting}
            aria-label={hasVoted ? 'Remove vote' : 'Vote for project'}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill={isUpvoted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 10v12"></path>
              <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"></path>
            </svg>
            <span>{project.votes}</span>
          </button>
          <button className="stat-button" onClick={handleCommentClick}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            <span>{project.comments_count}</span>
          </button>
        </div>
        <button className="btn-view-details" onClick={handleViewDetailsClick}>View Details</button>
      </div>
    </article>
  )
}

export default ProjectCard
