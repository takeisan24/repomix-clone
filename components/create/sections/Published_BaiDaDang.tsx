"use client"

import { usePostFilters } from "@/hooks/usePostFilters"
import { useFilteredPosts } from "@/hooks/useFilteredPosts"
import { FilterBar } from "@/components/shared/filters/FilterBar"
import { PlatformIcon } from "@/components/shared/PlatformIcon"
import { formatDate, formatTime } from "@/lib"

interface PublishedPost {
  id: number
  platform: string
  content: string
  time: string
  status: string
  url: string
  profileName?: string
  profilePic?: string
  engagement?: {
    likes: number
    comments: number
    shares: number
  }
}

interface PublishedSectionProps {
  publishedPosts: PublishedPost[]
  onViewPost: (url: string) => void
  onRetryPost: (id: number) => void
  onDeletePost: (id: number) => void
}

/**
 * Published section component for viewing published posts
 * Displays a list of published posts with filtering, searching, and management options
 */
export default function PublishedSection({ 
  publishedPosts, 
  onViewPost, 
  onRetryPost, 
  onDeletePost 
}: PublishedSectionProps) {
  const { platformFilter, dateFilter, searchTerm, setPlatformFilter, setDateFilter, setSearchTerm } = usePostFilters()
  const filteredPosts = useFilteredPosts(publishedPosts, searchTerm, platformFilter, dateFilter)

  // Mock accounts – align layout with failed posts list
  const getAccountsForPlatform = (platform: string) => {
    const mockAccounts = {
      'Twitter': [{ username: '@whatevername', profilePic: '/shego.jpg' }],
      'Instagram': [{ username: '@instagram_user', profilePic: '/shego.jpg' }],
      'LinkedIn': [{ username: 'John Doe', profilePic: '/shego.jpg' }],
      'Facebook': [{ username: 'Unknown Account', profilePic: '/shego.jpg' }],
      'Threads': [{ username: '@threads_user', profilePic: '/shego.jpg' }],
      'Bluesky': [{ username: '@bluesky_user', profilePic: '/shego.jpg' }],
      'YouTube': [{ username: 'Unknown Account', profilePic: '/shego.jpg' }],
      'TikTok': [{ username: '@tiktok_user', profilePic: '/shego.jpg' }],
      'Pinterest': [{ username: 'Unknown Account', profilePic: '/shego.jpg' }]
    }
    return (mockAccounts as any)[platform] || [{ username: 'Unknown Account', profilePic: '/shego.jpg' }]
  }

  // Compute fixed width for right column username so rows align
  const getMaxProfileWidth = (posts: PublishedPost[]) => {
    const maxLength = Math.max(
      ...posts.map(p => (getAccountsForPlatform(p.platform)[0]?.username?.length || 0))
    )
    return Math.min(Math.max(maxLength * 8, 120), 200)
  }

  return (
    <div className="w-full max-w-none mx-4 mt-4 overflow-hidden h-full flex flex-col">
      <h2 className="text-2xl font-bold mb-6">Bài đã đăng</h2>
      
      <FilterBar
        platformFilter={platformFilter}
        dateFilter={dateFilter}
        searchTerm={searchTerm}
        onPlatformChange={setPlatformFilter}
        onDateChange={setDateFilter}
        onSearchChange={setSearchTerm}
      />
      
      {/* Published Posts List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
        <div className="space-y-[1px]">
          {(() => {
            const maxWidth = getMaxProfileWidth(filteredPosts)
            return filteredPosts.map((post) => (
              <div 
                key={post.id} 
                className="group rounded-xl hover:bg-[#E33265]/70 transition-colors cursor-pointer"
                onClick={() => onViewPost(post.url)}
              >
                <div className="flex items-center px-4 py-3 w-full">
                  {/* Left: platform icon + content */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <PlatformIcon platform={post.platform} size={27} variant="inline" />
                    <div className="text-white/90 truncate flex-1 min-w-0 max-w-[1050px]">{post.content}</div>
                  </div>
                  {/* Right: profile info and date */}
                  <div className="flex flex-col items-start text-white/80 flex-shrink-0 ml-4" style={{ width: `${maxWidth}px` }}>
                    <div className="flex items-center gap-2 mb-1 w-full">
                      <div className="w-5 h-5 rounded-full overflow-hidden flex-shrink-0">
                        <img src={getAccountsForPlatform(post.platform)[0]?.profilePic || '/shego.jpg'} alt="Profile" className="w-full h-full object-cover" />
                      </div>
                      <span className="text-xs whitespace-nowrap" style={{ fontWeight: '600', fontSize: '0.75rem', color: 'rgba(255,255,255,0.9)' }}>
                        {getAccountsForPlatform(post.platform)[0]?.username || 'Unknown Account'}
                      </span>
                    </div>
                    <span className="text-xs whitespace-nowrap w-full">
                      {formatDate(post.time)}
                      <span className="opacity-70" style={{ marginLeft: '5px' }}>
                        {formatTime(post.time)}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            ))
          })()}
        </div>
      </div>
    </div>
  )
}
