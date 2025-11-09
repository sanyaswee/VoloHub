import type { Project, User, Comment, ParticipationRequest } from '../types';

const API_BASE_URL = 'http://localhost:8000/api';

/**
 * Get CSRF token from cookies
 */
function getCookie(name: string): string | undefined {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift();
  }
  return undefined;
}

export interface CreateProjectPayload {
  name: string;
  description: string;
  city: string;
  location: string;
}

export interface UpdateProjectPayload {
  name?: string;
  description?: string;
  city?: string;
  location?: string;
}

export interface VotePayload {
  value: 1 | -1;
}

export interface VoteResponse {
  message: string;
}

// Comment interfaces
export interface CreateCommentPayload {
  content: string;
}

// Participation Request interfaces
export interface SendParticipationRequestPayload {
  message: string;
}

export interface DeleteMyParticipationRequestPayload {
  request_id: number;
}

export interface HandleParticipationRequestPayload {
  action: 'approve' | 'reject';
}

// Participant interface
export interface Participant {
  id: number;
  user: number;
  project: number;
  role: string;
  joined_at: string;
}

// AI Feedback interface
export interface AIFeedback {
  summary: string;
  missing_points: string[];
  suggestions: string[];
  updated_description_suggestion: string;
}

// Authentication interfaces
export interface RegisterPayload {
  username: string;
  password: string;
  email: string;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface RegisterResponse {
  message: string;
}

export interface LoginResponse {
  message: string;
  user: User;
}

export interface LogoutResponse {
  message: string;
}

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * Get headers with CSRF token for POST/PUT/DELETE requests
   */
  private getHeaders(includeContentType: boolean = true): HeadersInit {
    const headers: HeadersInit = {};
    
    if (includeContentType) {
      headers['Content-Type'] = 'application/json';
    }
    
    const csrfToken = getCookie('csrftoken');
    if (csrfToken) {
      headers['X-CSRFToken'] = csrfToken;
    }
    
    return headers;
  }

  /**
   * Get all projects
   */
  async getProjects(): Promise<Project[]> {
    try {
      const response = await fetch(`${this.baseUrl}/projects/`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  }

  /**
   * Search projects by query
   */
  async searchProjects(query: string): Promise<Project[]> {
    try {
      const response = await fetch(`${this.baseUrl}/projects/?search=${encodeURIComponent(query)}`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error searching projects:', error);
      throw error;
    }
  }

  /**
   * Get projects filtered by city
   */
  async getProjectsByCity(city: string): Promise<Project[]> {
    try {
      const response = await fetch(`${this.baseUrl}/projects/?city=${encodeURIComponent(city)}`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching projects by city:', error);
      throw error;
    }
  }

  /**
   * Get projects created by the current user
   */
  async getMyProjects(): Promise<Project[]> {
    try {
      const response = await fetch(`${this.baseUrl}/projects/?my=true`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching my projects:', error);
      throw error;
    }
  }

  /**
   * Create a new project
   */
  async createProject(payload: CreateProjectPayload): Promise<Project> {
    try {
      const response = await fetch(`${this.baseUrl}/projects/`, {
        method: 'POST',
        headers: this.getHeaders(),
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  }

  /**
   * Get a single project by ID
   */
  async getProject(projectId: number): Promise<Project> {
    try {
      const response = await fetch(`${this.baseUrl}/projects/${projectId}`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Project not found');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error fetching project ${projectId}:`, error);
      throw error;
    }
  }

  /**
   * Update a project (partial updates allowed)
   */
  async updateProject(projectId: number, payload: UpdateProjectPayload): Promise<Project> {
    try {
      const response = await fetch(`${this.baseUrl}/projects/${projectId}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Project not found');
        }
        if (response.status === 400) {
          throw new Error('Validation error');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error updating project ${projectId}:`, error);
      throw error;
    }
  }

  /**
   * Delete a project
   */
  async deleteProject(projectId: number): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/projects/${projectId}`, {
        method: 'DELETE',
        headers: this.getHeaders(false),
        credentials: 'include',
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Project not found');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // 204 No Content response has no body
    } catch (error) {
      console.error(`Error deleting project ${projectId}:`, error);
      throw error;
    }
  }

  /**
   * Vote on a project (upvote or downvote)
   */
  async voteProject(projectId: number, payload: VotePayload): Promise<VoteResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/vote/${projectId}/`, {
        method: 'POST',
        headers: this.getHeaders(),
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Project not found');
        }
        if (response.status === 400) {
          throw new Error('Vote already exists or invalid vote value');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error voting on project ${projectId}:`, error);
      throw error;
    }
  }

  /**
   * Remove vote from a project
   */
  async removeVote(projectId: number): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/vote/${projectId}/`, {
        method: 'DELETE',
        headers: this.getHeaders(false),
        credentials: 'include',
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Project not found');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // 204 No Content response
    } catch (error) {
      console.error(`Error removing vote from project ${projectId}:`, error);
      throw error;
    }
  }

  // ==========================================
  // Authentication Methods
  // ==========================================

  /**
   * Register a new user
   * POST /register/
   */
  async register(payload: RegisterPayload): Promise<RegisterResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/register/`, {
        method: 'POST',
        headers: this.getHeaders(),
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  }

  /**
   * Login user
   * POST /login/
   */
  async login(payload: LoginPayload): Promise<LoginResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/login/`, {
        method: 'POST',
        headers: this.getHeaders(),
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  }

  /**
   * Logout user
   * POST /logout/
   */
  async logout(): Promise<LogoutResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/logout/`, {
        method: 'POST',
        headers: this.getHeaders(false),
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  }

  /**
   * Get current authenticated user
   * GET /user/
   */
  async getCurrentUser(): Promise<User> {
    try {
      const response = await fetch(`${this.baseUrl}/user`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Not authenticated');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching current user:', error);
      throw error;
    }
  }

  /**
   * Get user by ID
   * GET /users/<user_id>/
   */
  async getUser(userId: number): Promise<{ id: number; username: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/users/${userId}`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('User not found');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }

  /**
   * Get comments for a project
   * GET /comments/<project_id>/
   */
  async getComments(projectId: number): Promise<Comment[]> {
    try {
      const response = await fetch(`${this.baseUrl}/comments/${projectId}`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Project not found');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching comments:', error);
      throw error;
    }
  }

  /**
   * Create a comment on a project
   * POST /comments/<project_id>/
   */
  async createComment(projectId: number, payload: CreateCommentPayload): Promise<Comment> {
    try {
      const response = await fetch(`${this.baseUrl}/comments/${projectId}/`, {
        method: 'POST',
        headers: this.getHeaders(),
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        if (response.status === 400) {
          throw new Error('Invalid comment content');
        }
        if (response.status === 404) {
          throw new Error('Project not found');
        }
        if (response.status === 401) {
          throw new Error('Authentication required');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating comment:', error);
      throw error;
    }
  }

  /**
   * Delete a comment
   * DELETE /delete_comment/<comment_id>/
   */
  async deleteComment(commentId: number): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/delete_comment/${commentId}/`, {
        method: 'DELETE',
        headers: this.getHeaders(),
        credentials: 'include',
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Comment not found');
        }
        if (response.status === 403) {
          throw new Error('You do not have permission to delete this comment');
        }
        if (response.status === 401) {
          throw new Error('Authentication required');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  }

  // ==========================================
  // Participation Request Methods
  // ==========================================

  /**
   * Get participation requests for a project
   * GET /participation_requests/<project_id>/
   */
  async getParticipationRequests(projectId: number): Promise<ParticipationRequest[]> {
    try {
      const response = await fetch(`${this.baseUrl}/participation_requests/${projectId}/`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Project not found');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching participation requests:', error);
      throw error;
    }
  }

  /**
   * Send a participation request to a project
   * POST /participation_requests/<project_id>/
   */
  async sendParticipationRequest(
    projectId: number,
    payload: SendParticipationRequestPayload
  ): Promise<ParticipationRequest> {
    try {
      const response = await fetch(`${this.baseUrl}/participation_requests/${projectId}/`, {
        method: 'POST',
        headers: this.getHeaders(),
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        if (response.status === 400) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Invalid request or duplicate');
        }
        if (response.status === 404) {
          throw new Error('Project not found');
        }
        if (response.status === 401) {
          throw new Error('Authentication required');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error sending participation request:', error);
      throw error;
    }
  }

  /**
   * Get current user's participation requests
   * GET /my_participation_requests/
   */
  async getMyParticipationRequests(): Promise<ParticipationRequest[]> {
    try {
      const response = await fetch(`${this.baseUrl}/my_participation_requests/`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication required');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching my participation requests:', error);
      throw error;
    }
  }

  /**
   * Delete a participation request owned by the current user
   * DELETE /my_participation_requests/
   */
  async deleteMyParticipationRequest(requestId: number): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/my_participation_requests/`, {
        method: 'DELETE',
        headers: this.getHeaders(),
        credentials: 'include',
        body: JSON.stringify({ request_id: requestId }),
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Participation request not found');
        }
        if (response.status === 401) {
          throw new Error('Authentication required');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // 204 No Content response
    } catch (error) {
      console.error('Error deleting participation request:', error);
      throw error;
    }
  }

  /**
   * Handle (approve or reject) a participation request
   * POST /handle_participation_request/<request_id>/
   */
  async handleParticipationRequest(
    requestId: number,
    payload: HandleParticipationRequestPayload
  ): Promise<ParticipationRequest> {
    try {
      const response = await fetch(`${this.baseUrl}/handle_participation_request/${requestId}/`, {
        method: 'POST',
        headers: this.getHeaders(),
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        if (response.status === 400) {
          throw new Error('Invalid action');
        }
        if (response.status === 403) {
          throw new Error('Only the project author can handle participation requests');
        }
        if (response.status === 404) {
          throw new Error('Participation request not found');
        }
        if (response.status === 401) {
          throw new Error('Authentication required');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error handling participation request:', error);
      throw error;
    }
  }

  /**
   * Get participants for a project
   * GET /participants/<project_id>/
   */
  async getParticipants(projectId: number): Promise<Participant[]> {
    try {
      const response = await fetch(`${this.baseUrl}/participants/${projectId}/`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Project not found');
        }
        if (response.status === 401) {
          throw new Error('Authentication required');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching participants:', error);
      throw error;
    }
  }

  // ==========================================
  // AI Feedback Methods
  // ==========================================

  /**
   * Get AI-generated feedback for a project
   * GET /ai_feedback/<project_id>/
   */
  async getAIFeedback(projectId: number): Promise<AIFeedback> {
    try {
      const response = await fetch(`${this.baseUrl}/ai_feedback/${projectId}/`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Project not found');
        }
        if (response.status === 401) {
          throw new Error('Authentication required');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Backend returns project with 'analysis' field containing the feedback
      if (data.analysis) {
        return data.analysis;
      }
      
      // If the response is already in the correct format, return it
      return data;
    } catch (error) {
      console.error('Error fetching AI feedback:', error);
      throw error;
    }
  }

  /**
   * Get AI-ranked projects based on a prompt
   * POST /ai_rank_projects/
   */
  async aiRankProjects(prompt: string): Promise<Array<Project & { score: number }>> {
    try {
      const response = await fetch(`${this.baseUrl}/ai_rank_projects/`, {
        method: 'POST',
        headers: this.getHeaders(),
        credentials: 'include',
        body: JSON.stringify({ prompt }),
      });
      
      if (!response.ok) {
        if (response.status === 400) {
          throw new Error('Invalid prompt or request');
        }
        if (response.status === 401) {
          throw new Error('Authentication required');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error ranking projects with AI:', error);
      throw error;
    }
  }
}

// Export a singleton instance
const apiService = new ApiService(API_BASE_URL);
export default apiService;
