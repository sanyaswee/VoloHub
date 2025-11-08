import type { Project, User, Comment } from '../types';

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
      const response = await fetch(`${this.baseUrl}/register`, {
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
}

// Export a singleton instance
const apiService = new ApiService(API_BASE_URL);
export default apiService;
