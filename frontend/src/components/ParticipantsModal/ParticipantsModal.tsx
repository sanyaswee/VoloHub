import './ParticipantsModal.css'
import { useEffect, useState } from 'react'
import type { Participant } from '../../services/api'
import apiService from '../../services/api'
import Avatar from '../Avatar/Avatar'

interface ParticipantsModalProps {
  isOpen: boolean
  onClose: () => void
  participants: Participant[]
}

// Helper component to fetch and display username
function ParticipantUsername({ userId }: { userId: number }) {
  const [username, setUsername] = useState<string>(`User #${userId}`)

  useEffect(() => {
    apiService.getUser(userId)
      .then(user => setUsername(user.username))
      .catch(() => setUsername(`User #${userId}`))
  }, [userId])

  return <span>{username}</span>
}

function ParticipantsModal({ isOpen, onClose, participants }: ParticipantsModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="participants-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Participants ({participants.length})</h2>
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
          <div className="participants-list">
            {participants.map((participant) => (
              <div key={participant.id} className="participant-item">
                <Avatar userId={participant.user} size={48} />
                <div className="participant-info">
                  <div className="participant-name">
                    <ParticipantUsername userId={participant.user} />
                  </div>
                  <div className="participant-role">{participant.role}</div>
                </div>
                <div className="participant-date">
                  Joined {new Date(participant.joined_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ParticipantsModal
