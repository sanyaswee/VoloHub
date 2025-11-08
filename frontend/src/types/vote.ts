export interface Vote {
  id: number;
  user: number;
  project: number;
  value: 1 | -1;
  created_at: string;
}
