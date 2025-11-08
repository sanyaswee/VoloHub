export interface Project {
  id: number;
  author?: number | null;
  name: string;
  description: string;
  city: string;
  status?: string;
  location: string;
  created_at?: string;
  votes: number;
  comments_count: number;
}
