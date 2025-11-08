"use client"

import { SOCIAL_PLATFORMS } from '@/lib/constants/platforms'
import { PlatformIcon } from '@/components/shared/PlatformIcon'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { RotateCcw, Info } from 'lucide-react'
import { toast } from 'sonner'
import Tooltip from '@/components/shared/Tooltip'

/**
 * Settings section component for social media account connections
 * Displays a grid of social media platforms with connection status
 */
export default function SettingsSection() {
  const t = useTranslations('CreatePage.settingsSection')
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

  // Handle reset onboarding tour
  const handleResetTour = () => {
    localStorage.removeItem('hasSeenOnboarding')
    toast.success(t('onboardingTour.resetSuccess'))
    // Reload page to trigger tour
    setTimeout(() => {
      window.location.reload()
    }, 1000)
  }

  return (
    <div className="w-full h-full overflow-y-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">{t('title')}</h1>
          <p className="text-sm sm:text-base text-gray-400">{t('subtitle')}</p>
        </div>

        {/* Onboarding Tour - Single Card */}
        <div className="max-w-2xl mb-6 sm:mb-8">
          <div className="p-4 sm:p-6 rounded-xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 backdrop-blur-sm">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg sm:text-xl font-semibold text-white">{t('onboardingTour.title')}</h3>
                  <Tooltip content={t('onboardingTour.tooltipInfo')} position="right">
                    <Info className="w-4 h-4 text-gray-400 cursor-help hover:text-gray-300 transition-colors flex-shrink-0" />
                  </Tooltip>
                </div>
                <p className="text-xs sm:text-sm text-gray-300 mb-3 sm:mb-4 leading-relaxed">
                  {t('onboardingTour.description')}
                </p>
                <Tooltip content={t('onboardingTour.tooltip')} position="right">
                  <Button
                    onClick={handleResetTour}
                    variant="outline"
                    size="sm"
                    className="border-purple-500/50 text-white hover:bg-purple-500/20 hover:border-purple-500 transition-all w-full sm:w-auto"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    {t('onboardingTour.resetButton')}
                  </Button>
                </Tooltip>
              </div>
            </div>
          </div>
        </div>

        {/* Social Media Connections - Full Width */}
        <div className="mt-6 sm:mt-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">{t('socialConnections')}</h2>
              <p className="text-xs sm:text-sm text-gray-400">{t('socialConnectionsDesc')}</p>
            </div>
            <div className="flex items-center gap-3 sm:gap-2 text-xs sm:text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-500 flex-shrink-0"></div>
                <span>{t('connected')}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500 flex-shrink-0"></div>
                <span>{t('notConnected')}</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {platformsWithStatus.map((platform, idx) => (
              <button
                key={idx}
                onClick={() => window.open(platform.url, '_blank')}
                className="group flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 rounded-xl bg-[#2A2A30] border border-[#3A3A42] hover:border-[#E33265]/50 hover:bg-[#2A2A30]/80 transition-all duration-200"
              >
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                  <PlatformIcon 
                    platform={platform.name}
                    size={36}
                    variant="wrapper"
                  />
                  <span className="text-sm sm:text-base text-[#F5F5F7] font-medium group-hover:text-white transition-colors truncate">{platform.name}</span>
                </div>
                <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full flex-shrink-0 ${
                  platform.connected ? 'bg-green-500 shadow-lg shadow-green-500/50' : 'bg-red-500/60'
                }`}></div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div> 
  )
}
