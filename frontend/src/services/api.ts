import type { Project } from '../types';

const API_BASE_URL = 'http://localhost:8000/api';

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

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * Get all projects
   */
  async getProjects(): Promise<Project[]> {
    try {
      const response = await fetch(`${this.baseUrl}/projects/`);
      
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
        headers: {
          'Content-Type': 'application/json',
        },
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
      const response = await fetch(`${this.baseUrl}/projects/${projectId}/`);
      
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
        headers: {
          'Content-Type': 'application/json',
        },
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
}

// Export a singleton instance
const apiService = new ApiService(API_BASE_URL);
export default apiService;
