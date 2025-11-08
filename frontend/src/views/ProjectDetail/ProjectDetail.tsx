import './ProjectDetail.css'
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import type { Project, Comment } from '../../types'
import { useAuth } from '../../contexts/AuthContext'
import apiService from '../../services/api'

interface ProjectDetailProps {
  onLoginRequired?: () => void
}

function ProjectDetail({ onLoginRequired }: ProjectDetailProps) {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [project, setProject] = useState<Project | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [commentsLoading, setCommentsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isVoting, setIsVoting] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)

  useEffect(() => {
    const fetchProjectData = async () => {
      if (!id) return
      
      try {
        setLoading(true)
        setError(null)
        const data = await apiService.getProject(parseInt(id))
        setProject(data)
      } catch (err) {
        console.error('Error fetching project:', err)
        setError('Failed to load project details')
      } finally {
        setLoading(false)
      }
    }

    const fetchComments = async () => {
      if (!id) return
      
      try {
        setCommentsLoading(true)
        const data = await apiService.getComments(parseInt(id))
        setComments(data)
      } catch (err) {
        console.error('Error fetching comments:', err)
        // Don't set error state for comments, just log it
      } finally {
        setCommentsLoading(false)
      }
    }

    fetchProjectData()
    fetchComments()
  }, [id])

  const handleBack = () => {
    navigate(-1)
  }

  const handleVoteClick = async () => {
    if (!user) {
      if (onLoginRequired) {
        onLoginRequired()
      }
      return
    }

    if (!project || isVoting) return

    try {
      setIsVoting(true)
      
      const hasVoted = project.user_voted === 1 || project.user_voted === -1
      
      if (hasVoted) {
        await apiService.removeVote(project.id)
      } else {
        await apiService.voteProject(project.id, { value: 1 })
      }
      
      // Refresh project data
      const updatedProject = await apiService.getProject(project.id)
      setProject(updatedProject)
    } catch (error) {
      console.error('Error voting:', error)
    } finally {
      setIsVoting(false)
    }
  }

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      if (onLoginRequired) {
        onLoginRequired()
      }
      return
    }

    if (!project || !newComment.trim() || isSubmittingComment) return

    try {
      setIsSubmittingComment(true)
      
      const createdComment = await apiService.createComment(project.id, {
        content: newComment.trim()
      })
      
      // Add new comment to the top of the list (newest first)
      setComments([createdComment, ...comments])
      
      // Clear the input field
      setNewComment('')
      
      // Update project comment count
      setProject({
        ...project,
        comments_count: project.comments_count + 1
      })
    } catch (error) {
      console.error('Error creating comment:', error)
      // Could show a toast notification here
    } finally {
      setIsSubmittingComment(false)
    }
  }

  if (loading) {
    return (
      <div className="project-detail">
        <div className="loading-state">Loading project...</div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="project-detail">
        <div className="error-state">
          <p>{error || 'Project not found'}</p>
          <button onClick={handleBack} className="btn-back">Go Back</button>
        </div>
      </div>
    )
  }

  const hasVoted = project.user_voted === 1 || project.user_voted === -1
  const isUpvoted = project.user_voted === 1

  return (
    <div className="project-detail">
      <button className="back-button" onClick={handleBack} aria-label="Go back">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        <span>Back</span>
      </button>

      <div className="project-detail-content">
        <header className="project-detail-header">
          <div className="project-header-main">
            <h1 className="project-detail-title">{project.name}</h1>
            <div className="project-detail-location">
              <svg className="location-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              <span>{project.location}, {project.city}</span>
            </div>
          </div>
          
          <div className="project-detail-stats">
            <button 
              className={`vote-button ${isVoting ? 'voting' : ''} ${isUpvoted ? 'voted' : ''}`}
              onClick={handleVoteClick}
              disabled={isVoting}
              aria-label={hasVoted ? 'Remove vote' : 'Vote for project'}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill={isUpvoted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 10v12"></path>
                <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"></path>
              </svg>
              <span className="vote-count">{project.votes}</span>
            </button>
            
            <div className="comment-count">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              <span>{project.comments_count}</span>
            </div>
          </div>
        </header>

        <section className="project-detail-section">
          <h2 className="section-title">About This Project</h2>
          <p className="project-detail-description">{project.description}</p>
        </section>

        <section className="project-detail-section">
          <h2 className="section-title">Comments ({comments.length})</h2>
          
          {commentsLoading ? (
            <div className="comments-loading">
              <p>Loading comments...</p>
            </div>
          ) : comments.length === 0 ? (
            <div className="comments-empty">
              <p>No comments yet. Be the first to comment!</p>
            </div>
          ) : (
            <div className="comments-list">
              {comments.map((comment) => (
                <div key={comment.id} className="comment-card">
                  <div className="comment-header">
                    <div className="comment-author">
                      <div className="comment-avatar"></div>
                      <span className="comment-user-id">User #{comment.user}</span>
                    </div>
                    <time className="comment-date">
                      {new Date(comment.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </time>
                  </div>
                  <p className="comment-content">{comment.content}</p>
                </div>
              ))}
            </div>
          )}

          {/* Add Comment Form */}
          <div className="add-comment-section">
            {user ? (
              <form onSubmit={handleCommentSubmit} className="add-comment-form">
                <div className="comment-input-wrapper">
                  <textarea
                    className="comment-input"
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={3}
                    disabled={isSubmittingComment}
                  />
                </div>
                <button 
                  type="submit" 
                  className="btn-submit-comment"
                  disabled={!newComment.trim() || isSubmittingComment}
                >
                  {isSubmittingComment ? 'Posting...' : 'Post Comment'}
                </button>
              </form>
            ) : (
              <div className="login-prompt">
                <p>Please log in to leave a comment.</p>
                <button 
                  className="btn-login-prompt"
                  onClick={onLoginRequired}
                >
                  Log In
                </button>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

export default ProjectDetail
