import './Discover.css'
import { useState, useEffect } from 'react'
import apiService from '../../services/api'
import type { Project } from '../../types'
import { ProjectCard, LoginModal } from '../../components'

interface RankedProject extends Project {
  score: number
}

interface DiscoverState {
  prompt: string
  rankedProjects: RankedProject[]
  aiSummary: string
  hasSearched: boolean
}

const STORAGE_KEY = 'volohub_discover_state'

function Discover() {
  const [prompt, setPrompt] = useState('')
  const [rankedProjects, setRankedProjects] = useState<RankedProject[]>([])
  const [aiSummary, setAiSummary] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  // Load state from sessionStorage on mount
  useEffect(() => {
    try {
      const savedState = sessionStorage.getItem(STORAGE_KEY)
      if (savedState) {
        const state: DiscoverState = JSON.parse(savedState)
        setPrompt(state.prompt)
        setRankedProjects(state.rankedProjects)
        setAiSummary(state.aiSummary)
        setHasSearched(state.hasSearched)
      }
    } catch (err) {
      console.error('Error loading saved discover state:', err)
    }
  }, [])

  // Save state to sessionStorage whenever it changes
  useEffect(() => {
    if (hasSearched) {
      try {
        const state: DiscoverState = {
          prompt,
          rankedProjects,
          aiSummary,
          hasSearched
        }
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state))
      } catch (err) {
        console.error('Error saving discover state:', err)
      }
    }
  }, [prompt, rankedProjects, aiSummary, hasSearched])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!prompt.trim()) {
      setError('Please enter a search prompt')
      return
    }

    setIsLoading(true)
    setError(null)
    setHasSearched(true)

    try {
      const results = await apiService.aiRankProjects(prompt)
      setRankedProjects(results.projects)
      setAiSummary(results.summary)
      
      if (results.projects.length === 0) {
        setError('No projects found matching your criteria')
      }
    } catch (err) {
      console.error('Error ranking projects:', err)
      setError(err instanceof Error ? err.message : 'Failed to rank projects. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVoteChange = async () => {
    // Refresh the ranked projects after a vote
    if (hasSearched && prompt.trim()) {
      try {
        const results = await apiService.aiRankProjects(prompt)
        setRankedProjects(results.projects)
        setAiSummary(results.summary)
      } catch (err) {
        console.error('Error refreshing projects:', err)
      }
    }
  }

  return (
    <>
      <div className="view-container">
        <div className="discover-header">
          <h1 className="view-title">Discover Projects</h1>
          <p className="view-description">
            Use AI to find volunteer opportunities that match your interests. Try prompts like "projects for nature", 
            "community education", or "helping seniors".
          </p>
        </div>

        <form className="discover-search-form" onSubmit={handleSearch}>
          <div className="discover-search-container">
            <div className="discover-input-wrapper">
              <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
              <input
                type="text"
                className="discover-search-input"
                placeholder="Enter your interests (e.g., 'projects for nature')"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <button 
              type="submit" 
              className="discover-search-button"
              disabled={isLoading || !prompt.trim()}
            >
              {isLoading ? (
                <>
                  <svg className="spinner" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  Searching...
                </>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                  </svg>
                  Discover with AI
                </>
              )}
            </button>
          </div>
        </form>

        {error && (
          <div className="discover-error">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>{error}</span>
          </div>
        )}

        {!hasSearched && !isLoading && (
          <div className="discover-placeholder">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
              <circle cx="12" cy="12" r="10" opacity="0.3"/>
            </svg>
            <h3>AI-Powered Project Discovery</h3>
            <p>Enter a prompt above to discover volunteer projects ranked by AI based on your interests.</p>
          </div>
        )}

        {hasSearched && !isLoading && rankedProjects.length > 0 && (
          <div className="discover-results">
            <div className="results-header">
              <h2>Top Matches for "{prompt}"</h2>
              <span className="results-count">{rankedProjects.length} project{rankedProjects.length !== 1 ? 's' : ''} found</span>
            </div>
            {aiSummary && (
              <div className="ai-summary-container">
                <div className="ai-summary-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                  </svg>
                </div>
                <p className="ai-summary-text">{aiSummary}</p>
              </div>
            )}
            <div className="projects-grid">
              {rankedProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  score={project.score}
                  showScore={true}
                  onLoginRequired={() => setShowLoginModal(true)}
                  onVoteChange={handleVoteChange}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {showLoginModal && (
        <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
      )}
    </>
  )
}

export default Discover
