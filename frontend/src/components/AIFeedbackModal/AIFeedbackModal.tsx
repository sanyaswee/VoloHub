import './AIFeedbackModal.css'
import { useEffect, useState } from 'react'
import apiService, { type AIFeedback } from '../../services/api'

interface AIFeedbackModalProps {
  isOpen: boolean
  onClose: () => void
  projectId: number
  onSave?: () => void
}

function AIFeedbackModal({ isOpen, onClose, projectId, onSave }: AIFeedbackModalProps) {
  const [feedback, setFeedback] = useState<AIFeedback | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editedDescription, setEditedDescription] = useState<string>('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
      
      // Fetch AI feedback when modal opens
      fetchFeedback()
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose, projectId])

  const fetchFeedback = async () => {
    setLoading(true)
    setError(null)
    setFeedback(null)

    try {
      const data = await apiService.getAIFeedback(projectId)
      setFeedback(data)
      setEditedDescription(data.updated_description_suggestion || '')
    } catch (err) {
      console.error('Error fetching AI feedback:', err)
      setError(err instanceof Error ? err.message : 'Failed to load AI feedback')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveDescription = async () => {
    if (!editedDescription.trim()) {
      return
    }

    setIsSaving(true)
    try {
      await apiService.updateProject(projectId, {
        description: editedDescription
      })
      
      // Call the onSave callback to refresh project data
      if (onSave) {
        onSave()
      }
      
      onClose()
    } catch (err) {
      console.error('Error updating project description:', err)
      setError(err instanceof Error ? err.message : 'Failed to update description')
    } finally {
      setIsSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="ai-feedback-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              <path d="M8 10h.01"></path>
              <path d="M12 10h.01"></path>
              <path d="M16 10h.01"></path>
            </svg>
            AI Feedback
          </h2>
          <button 
            className="modal-close-button" 
            onClick={onClose}
            aria-label="Close modal"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="modal-content">
          {loading && (
            <div className="feedback-loading">
              <div className="spinner-large"></div>
              <p>Analyzing your project...</p>
            </div>
          )}

          {error && (
            <div className="feedback-error">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <h3>Failed to Load Feedback</h3>
              <p>{error}</p>
              <button className="btn-retry" onClick={fetchFeedback}>
                Try Again
              </button>
            </div>
          )}

          {feedback && !loading && !error && (
            <div className="feedback-content">
              <section className="feedback-section">
                <h3 className="section-title">Summary</h3>
                <p className="summary-text">{feedback.summary}</p>
              </section>

              <section className="feedback-section">
                <h3 className="section-title">Missing Points</h3>
                <ul className="feedback-list">
                  {feedback.missing_points && feedback.missing_points.length > 0 ? (
                    feedback.missing_points.map((point, index) => (
                      <li key={index} className="feedback-item missing">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="12" y1="8" x2="12" y2="12"></line>
                          <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                        <span>{point}</span>
                      </li>
                    ))
                  ) : (
                    <li className="feedback-item empty">
                      <span>No missing points identified.</span>
                    </li>
                  )}
                </ul>
              </section>

              <section className="feedback-section">
                <h3 className="section-title">Suggestions</h3>
                <ul className="feedback-list">
                  {feedback.suggestions && feedback.suggestions.length > 0 ? (
                    feedback.suggestions.map((suggestion, index) => (
                      <li key={index} className="feedback-item suggestion">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                          <path d="M2 17l10 5 10-5"></path>
                          <path d="M2 12l10 5 10-5"></path>
                        </svg>
                        <span>{suggestion}</span>
                      </li>
                    ))
                  ) : (
                    <li className="feedback-item empty">
                      <span>No suggestions available.</span>
                    </li>
                  )}
                </ul>
              </section>

              <section className="feedback-section">
                <h3 className="section-title">Updated Description</h3>
                <p className="section-subtitle">
                  Review and edit the AI-suggested description below, then save to update your project.
                </p>
                <textarea
                  className="description-textarea"
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  rows={6}
                  placeholder="AI-suggested description will appear here..."
                />
                <div className="description-actions">
                  <button
                    className="btn-save-description"
                    onClick={handleSaveDescription}
                    disabled={isSaving || !editedDescription.trim()}
                  >
                    {isSaving ? (
                      <>
                        <div className="spinner-small"></div>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                          <polyline points="17 21 17 13 7 13 7 21"></polyline>
                          <polyline points="7 3 7 8 15 8"></polyline>
                        </svg>
                        <span>Save as Project Description</span>
                      </>
                    )}
                  </button>
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AIFeedbackModal
