/**
 * Avatar utility functions for generating consistent placeholder images
 */

// Color palette for avatars (matching design system)
const AVATAR_COLORS = [
  { bg: 'rgba(74, 144, 226, 0.2)', border: 'rgba(74, 144, 226, 0.5)', text: '#4A90E2' }, // Blue
  { bg: 'rgba(168, 85, 247, 0.2)', border: 'rgba(168, 85, 247, 0.5)', text: '#A855F7' }, // Purple
  { bg: 'rgba(236, 72, 153, 0.2)', border: 'rgba(236, 72, 153, 0.5)', text: '#EC4899' }, // Pink
  { bg: 'rgba(251, 146, 60, 0.2)', border: 'rgba(251, 146, 60, 0.5)', text: '#FB923C' },  // Orange
  { bg: 'rgba(34, 197, 94, 0.2)', border: 'rgba(34, 197, 94, 0.5)', text: '#22C55E' },    // Green
  { bg: 'rgba(14, 165, 233, 0.2)', border: 'rgba(14, 165, 233, 0.5)', text: '#0EA5E9' }, // Sky
  { bg: 'rgba(244, 63, 94, 0.2)', border: 'rgba(244, 63, 94, 0.5)', text: '#F43F5E' },   // Rose
  { bg: 'rgba(168, 162, 158, 0.2)', border: 'rgba(168, 162, 158, 0.5)', text: '#A8A29E' }, // Stone
]

/**
 * Simple hash function to convert a string to a number
 */
function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash)
}

/**
 * Get a consistent color scheme for a user based on their ID or username
 */
export function getUserAvatarColor(userId?: number | string | null): typeof AVATAR_COLORS[0] {
  if (!userId) {
    return AVATAR_COLORS[0] // Default to blue
  }
  
  const hash = typeof userId === 'string' ? hashString(userId) : userId
  const index = hash % AVATAR_COLORS.length
  return AVATAR_COLORS[index]
}

/**
 * Generate a placeholder avatar URL using DiceBear API
 * This creates consistent, deterministic avatars based on a seed (username or user ID)
 */
export function getPlaceholderAvatar(
  seed: string | number,
  style: 'avataaars' | 'bottts' | 'identicon' | 'initials' = 'avataaars',
  size: number = 80
): string {
  const seedStr = typeof seed === 'number' ? `user-${seed}` : seed
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(seedStr)}&size=${size}&backgroundColor=transparent`
}

/**
 * Get user initials for fallback display
 */
export function getUserInitials(username?: string | null): string {
  if (!username) return '?'
  
  const parts = username.trim().split(/\s+/)
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase()
  }
  
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

/**
 * Get inline styles for a colored avatar background
 */
export function getAvatarStyle(userId?: number | string | null): React.CSSProperties {
  const colors = getUserAvatarColor(userId)
  return {
    background: colors.bg,
    border: `1px solid ${colors.border}`,
    color: colors.text,
  }
}
