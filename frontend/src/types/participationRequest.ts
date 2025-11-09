export interface ParticipationRequest {
  id: number
  user: number
  project: number
  message: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
}
