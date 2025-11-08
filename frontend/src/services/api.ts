import type { Project } from '../types';

const API_BASE_URL = 'http://localhost:8000/api';

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
}

// Export a singleton instance
const apiService = new ApiService(API_BASE_URL);
export default apiService;
