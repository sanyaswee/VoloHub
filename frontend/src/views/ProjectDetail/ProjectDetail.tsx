import './ProjectDetail.css'
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import type { Project, Comment, ParticipationRequest } from '../../types'
import type { Participant } from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'
import apiService from '../../services/api'
import ParticipantsModal from '../../components/ParticipantsModal/ParticipantsModal'
import ApplyParticipateModal from '../../components/ApplyParticipateModal/ApplyParticipateModal'
import AIFeedbackModal from '../../components/AIFeedbackModal/AIFeedbackModal'

interface ProjectDetailProps {
  onLoginRequired?: () => void
}

// Helper component to fetch and display username
function Username({ userId }: { userId: number }) {
  const [username, setUsername] = useState<string>(`User #${userId}`)

  useEffect(() => {
    apiService.getUser(userId)
      .then(user => setUsername(user.username))
      .catch(() => setUsername(`User #${userId}`))
  }, [userId])

  return <span className="comment-user-id">{username}</span>
}

function ProjectDetail({ onLoginRequired }: ProjectDetailProps) {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [project, setProject] = useState<Project | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [participationRequests, setParticipationRequests] = useState<ParticipationRequest[]>([])
  const [participants, setParticipants] = useState<Participant[]>([])
  const [loading, setLoading] = useState(true)
  const [commentsLoading, setCommentsLoading] = useState(true)
  const [requestsLoading, setRequestsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isVoting, setIsVoting] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [isParticipantsModalOpen, setIsParticipantsModalOpen] = useState(false)
  const [firstParticipantUsername, setFirstParticipantUsername] = useState<string>('')
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false)
  const [hasApplied, setHasApplied] = useState(false)
  const [isAIFeedbackModalOpen, setIsAIFeedbackModalOpen] = useState(false)

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

  useEffect(() => {

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

    const fetchParticipationRequests = async () => {
      if (!id || !user) return
      
      try {
        setRequestsLoading(true)
        const data = await apiService.getParticipationRequests(parseInt(id))
        setParticipationRequests(data.filter(req => req.status === 'pending'))
      } catch (err) {
        console.error('Error fetching participation requests:', err)
        // Don't set error state for requests, just log it
      } finally {
        setRequestsLoading(false)
      }
    }

    const fetchParticipants = async () => {
      if (!id) return
      
      try {
        const data = await apiService.getParticipants(parseInt(id))
        setParticipants(data)
        
        // Check if current user is already a participant
        if (user) {
          const isParticipant = data.some(p => p.user === user.id)
          if (isParticipant) {
            setHasApplied(true)
          }
        }
        
        // Fetch username of first participant
        if (data.length > 0) {
          try {
            const user = await apiService.getUser(data[0].user)
            setFirstParticipantUsername(user.username)
          } catch (err) {
            console.error('Error fetching first participant username:', err)
          }
        }
      } catch (err) {
        console.error('Error fetching participants:', err)
      }
    }

    const checkIfUserApplied = async () => {
      if (!id || !user) return
      
      try {
        // Fetch user's participation requests from backend
        const myRequests = await apiService.getMyParticipationRequests()
        // Check if user has a pending request for this project
        const hasRequestForThisProject = myRequests.some(
          req => req.project === parseInt(id) && req.status === 'pending'
        )
        setHasApplied(hasRequestForThisProject)
      } catch (err) {
        console.error('Error checking if user applied:', err)
      }
    }

    fetchProjectData()
    fetchComments()
    fetchParticipationRequests()
    fetchParticipants()
    checkIfUserApplied()
  }, [id, user])

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

  const handleDeleteComment = async (commentId: number) => {
    if (!user || !project) return

    try {
      await apiService.deleteComment(commentId)
      
      // Remove comment from the list
      setComments(comments.filter(comment => comment.id !== commentId))
      
      // Update project comment count
      setProject({
        ...project,
        comments_count: project.comments_count - 1
      })
    } catch (error) {
      console.error('Error deleting comment:', error)
    }
  }

  const handleApproveRequest = async (requestId: number) => {
    if (!user || !project || !id) return

    try {
      await apiService.handleParticipationRequest(requestId, { action: 'approve' })
      
      // Refetch participation requests from backend
      const requestsData = await apiService.getParticipationRequests(parseInt(id))
      setParticipationRequests(requestsData.filter(req => req.status === 'pending'))
      
      // Refetch participants from backend
      const participantsData = await apiService.getParticipants(parseInt(id))
      setParticipants(participantsData)
      
      // Update first participant username
      if (participantsData.length > 0) {
        try {
          const user = await apiService.getUser(participantsData[0].user)
          setFirstParticipantUsername(user.username)
        } catch (err) {
          console.error('Error fetching first participant username:', err)
        }
      }
    } catch (error) {
      console.error('Error approving request:', error)
      // Could show a toast notification here
    }
  }

  const handleRejectRequest = async (requestId: number) => {
    if (!user || !project || !id) return

    try {
      await apiService.handleParticipationRequest(requestId, { action: 'reject' })
      
      // Refetch participation requests from backend
      const requestsData = await apiService.getParticipationRequests(parseInt(id))
      setParticipationRequests(requestsData.filter(req => req.status === 'pending'))
    } catch (error) {
      console.error('Error rejecting request:', error)
      // Could show a toast notification here
    }
  }

  const handleApplySuccess = async () => {
    if (!id) return
    
    // Mark as applied so button disappears
    setHasApplied(true)
    
    // Refetch user's applications from backend to ensure UI stays synced
    try {
      const myRequests = await apiService.getMyParticipationRequests()
      const hasRequestForThisProject = myRequests.some(
        req => req.project === parseInt(id) && req.status === 'pending'
      )
      setHasApplied(hasRequestForThisProject)
    } catch (err) {
      console.error('Error refreshing user applications:', err)
    }
    
    // Refetch participation requests from backend if user is the owner
    if (user && project && project.author === user.id) {
      try {
        const requestsData = await apiService.getParticipationRequests(parseInt(id))
        setParticipationRequests(requestsData.filter(req => req.status === 'pending'))
      } catch (err) {
        console.error('Error refreshing participation requests:', err)
      }
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

      {/* Participation Requests Section - Only visible to project owner */}
      {user && project?.author === user.id && participationRequests.length > 0 && (
        <section className="participation-requests-section">
          <h2 className="section-title">Participation Requests ({participationRequests.length})</h2>
          <div className="participation-requests-list">
            {participationRequests.map((request) => (
              <div key={request.id} className="participation-request-card">
                <div className="request-header">
                  <div className="request-user">
                    <div className="request-avatar"></div>
                    <Username userId={request.user} />
                  </div>
                  <time className="request-date">
                    {new Date(request.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </time>
                </div>
                <p className="request-message">{request.message}</p>
                <div className="request-actions">
                  <button
                    className="btn-approve"
                    onClick={() => handleApproveRequest(request.id)}
                    aria-label="Approve request"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Approve
                  </button>
                  <button
                    className="btn-reject"
                    onClick={() => handleRejectRequest(request.id)}
                    aria-label="Reject request"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

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

            {/* AI Feedback Button - Only visible to project owner */}
            {user && project.author === user.id && (
              <button
                className="btn-ai-feedback"
                onClick={() => setIsAIFeedbackModalOpen(true)}
                aria-label="Get AI feedback"
                title="Get AI feedback on your project"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  <path d="M8 10h.01"></path>
                  <path d="M12 10h.01"></path>
                  <path d="M16 10h.01"></path>
                </svg>
                AI Feedback
              </button>
            )}
          </div>
        </header>

        <section className="project-detail-section">
          <h2 className="section-title">About This Project</h2>
          <p className="project-detail-description">{project.description}</p>
        </section>

        {/* Apply to Participate CTA or Already Applied Message */}
        {user && project.author !== user.id && (
          <section className="project-detail-section">
            {!hasApplied ? (
              <button
                className="btn-apply-participate"
                onClick={() => setIsApplyModalOpen(true)}
                aria-label="Apply to participate in this project"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="8.5" cy="7" r="4"></circle>
                  <line x1="20" y1="8" x2="20" y2="14"></line>
                  <line x1="23" y1="11" x2="17" y2="11"></line>
                </svg>
                Apply to Participate
              </button>
            ) : (
              <div className="already-applied-message">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                <span>You have already applied for this project</span>
              </div>
            )}
          </section>
        )}

        {/* Participants Section */}
        {participants.length > 0 && (
          <section className="project-detail-section">
            <button 
              className="participants-trigger"
              onClick={() => setIsParticipantsModalOpen(true)}
              aria-label="View all participants"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              <span className="participants-text">
                <span className="participant-name">{firstParticipantUsername || 'Loading...'}</span>
                {participants.length > 1 && (
                  <span className="others-count"> and {participants.length - 1} other{participants.length - 1 !== 1 ? 's' : ''} are participating</span>
                )}
                {participants.length === 1 && (
                  <span className="others-count"> is participating</span>
                )}
              </span>
              <svg className="arrow-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </section>
        )}

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
              {comments.map((comment) => {
                const isParticipant = participants.some(p => p.user === comment.user)
                return (
                  <div key={comment.id} className={`comment-card ${isParticipant ? 'comment-card-contribution' : ''}`}>
                    <div className="comment-header">
                      <div className="comment-author">
                        <div className="comment-avatar"></div>
                        <Username userId={comment.user} />
                        {isParticipant && (
                          <span className="contribution-badge" title="This user is participating in the project">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                            </svg>
                            Contribution
                          </span>
                        )}
                      </div>
                      <div className="comment-header-right">
                        <time className="comment-date">
                          {new Date(comment.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </time>
                        {user && user.id === comment.user && (
                          <button
                            className="btn-delete-comment"
                            onClick={() => handleDeleteComment(comment.id)}
                            aria-label="Delete comment"
                            title="Delete comment"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6"></polyline>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                              <line x1="10" y1="11" x2="10" y2="17"></line>
                              <line x1="14" y1="11" x2="14" y2="17"></line>
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="comment-content">{comment.content}</p>
                  </div>
                )
              })}
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

      {/* Participants Modal */}
      <ParticipantsModal 
        isOpen={isParticipantsModalOpen}
        onClose={() => setIsParticipantsModalOpen(false)}
        participants={participants}
      />

      {/* Apply to Participate Modal */}
      {project && (
        <ApplyParticipateModal
          isOpen={isApplyModalOpen}
          onClose={() => setIsApplyModalOpen(false)}
          projectId={project.id}
          projectName={project.name}
          onSuccess={handleApplySuccess}
        />
      )}

      {/* AI Feedback Modal */}
      {project && (
        <AIFeedbackModal
          isOpen={isAIFeedbackModalOpen}
          onClose={() => setIsAIFeedbackModalOpen(false)}
          projectId={project.id}
          onSave={fetchProjectData}
        />
      )}
    </div>
  )
}

export default ProjectDetail
