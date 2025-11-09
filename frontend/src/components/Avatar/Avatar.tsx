import './Avatar.css'
import { getPlaceholderAvatar } from '../../utils/avatar'

interface AvatarProps {
  userId?: number | string | null
  username?: string | null
  size?: number
  className?: string
  style?: 'avataaars' | 'bottts' | 'identicon' | 'initials'
}

function Avatar({ userId, username, size = 40, className = '', style = 'avataaars' }: AvatarProps) {
  // Use userId or username as seed for consistent avatar generation
  const seed = userId || username || 'anonymous'
  const avatarUrl = getPlaceholderAvatar(seed, style, size)

  return (
    <div className={`avatar ${className}`} style={{ width: size, height: size }}>
      <img 
        src={avatarUrl} 
        alt={username ? `${username}'s avatar` : 'User avatar'}
        className="avatar-image"
      />
    </div>
  )
}

export default Avatar
