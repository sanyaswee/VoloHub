import './ApplyParticipateModal.css'
import { useEffect, useState } from 'react'
import apiService from '../../services/api'

interface ApplyParticipateModalProps {
  isOpen: boolean
  onClose: () => void
  projectId: number
  projectName: string
  onSuccess: () => void
}

function ApplyParticipateModal({ 
  isOpen, 
  onClose, 
  projectId, 
  projectName,
  onSuccess 
}: ApplyParticipateModalProps) {
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
      // Reset form when modal opens
      setMessage('')
      setError(null)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose, isSubmitting])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!message.trim()) {
      setError('Please enter a message')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      await apiService.sendParticipationRequest(projectId, {
        message: message.trim()
      })
      
      // Success - call onSuccess callback and close modal
      onSuccess()
      onClose()
    } catch (err) {
      console.error('Error sending participation request:', err)
      setError(err instanceof Error ? err.message : 'Failed to send request. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={!isSubmitting ? onClose : undefined}>
      <div className="apply-participate-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Apply to Participate</h2>
          <button 
            className="modal-close-button" 
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close modal"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-content">
          <div className="project-info">
            <p className="info-label">Project</p>
            <p className="project-name">{projectName}</p>
          </div>

          <div className="form-group">
            <label htmlFor="message" className="form-label">
              Why do you want to participate?
              <span className="required">*</span>
            </label>
            <textarea
              id="message"
              className="form-textarea"
              placeholder="Tell the project owner why you'd like to join and what you can contribute..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              disabled={isSubmitting}
              required
              maxLength={1000}
            />
            <div className="character-count">
              {message.length}/1000
            </div>
          </div>

          {error && (
            <div className="error-message">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              {error}
            </div>
          )}

          <div className="modal-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={isSubmitting || !message.trim()}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner"></span>
                  Sending...
                </>
              ) : (
                'Send Request'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ApplyParticipateModal
