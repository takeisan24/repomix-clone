"use client"

import { SOCIAL_PLATFORMS } from '@/lib/constants/platforms'
import { PlatformIcon } from '@/components/shared/PlatformIcon'

/**
 * Settings section component for social media account connections
 * Displays a grid of social media platforms with connection status
 */
export default function SettingsSection() {
  // Extended platforms with connection URLs and status
  const platformsWithStatus = SOCIAL_PLATFORMS.map(platform => ({
    ...platform,
    url: getPlatformUrl(platform.name),
    connected: platform.name === 'Twitter' // Example: only Twitter connected
  }))

  // Get login URL for each platform
  function getPlatformUrl(platformName: string): string {
    const urlMap: Record<string, string> = {
      'Facebook': 'https://www.facebook.com/login',
      'Instagram': 'https://www.instagram.com/accounts/login/',
      'Twitter': 'https://twitter.com/login',
      'Threads': 'https://www.threads.net/login',
      'Bluesky': 'https://bsky.app',
      'YouTube': 'https://accounts.google.com/signin/v2/identifier',
      'TikTok': 'https://www.tiktok.com/login',
      'Pinterest': 'https://www.pinterest.com/login/'
    }
    return urlMap[platformName] || '#'
  }

  return (
    <div className="w-full max-w-none mx-4 mt-4">
      <h2 className="text-2xl font-bold mb-6">Kết nối mạng xã hội và đăng nhập</h2>
      <p className="text-white/70 mb-6">Kết nối với mạng xã hội và đăng nhập.</p>
      
      <div className="grid sm:grid-cols-2 gap-4">
        {platformsWithStatus.map((platform, idx) => (
          <button
            key={idx}
            onClick={() => window.open(platform.url, '_blank')}
            className="flex items-center justify-between px-4 py-3 rounded-md hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <PlatformIcon 
                platform={platform.name}
                size={36}
                variant="wrapper"
              />
              <span className="text-[#F5F5F7] font-medium">{platform.name}</span>
            </div>
            <div className={`w-3 h-3 rounded-full ${
              platform.connected ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
          </button>
        ))}
      </div>
    </div>
  )
}
