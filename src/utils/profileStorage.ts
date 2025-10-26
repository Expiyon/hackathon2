export interface UserProfile {
  name: string
  surname: string
  email: string
  telegram: string
  xHandle: string
}

const PROFILE_KEY_PREFIX = 'suiven_profile_'

/**
 * Get the storage key for a specific wallet address
 */
function getStorageKey(walletAddress: string): string {
  return `${PROFILE_KEY_PREFIX}${walletAddress}`
}

/**
 * Load user profile from Local Storage
 * Returns empty profile if none exists
 */
export function loadProfile(walletAddress: string): UserProfile {
  try {
    const key = getStorageKey(walletAddress)
    const stored = localStorage.getItem(key)

    if (!stored) {
      return {
        name: '',
        surname: '',
        email: '',
        telegram: '',
        xHandle: '',
      }
    }

    return JSON.parse(stored) as UserProfile
  } catch (error) {
    console.error('Error loading profile:', error)
    return {
      name: '',
      surname: '',
      email: '',
      telegram: '',
      xHandle: '',
    }
  }
}

/**
 * Save user profile to Local Storage
 */
export function saveProfile(walletAddress: string, profile: UserProfile): boolean {
  try {
    const key = getStorageKey(walletAddress)
    localStorage.setItem(key, JSON.stringify(profile))
    return true
  } catch (error) {
    console.error('Error saving profile:', error)
    return false
  }
}

/**
 * Clear user profile from Local Storage
 */
export function clearProfile(walletAddress: string): void {
  try {
    const key = getStorageKey(walletAddress)
    localStorage.removeItem(key)
  } catch (error) {
    console.error('Error clearing profile:', error)
  }
}
