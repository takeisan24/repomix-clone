"use client"

import { usePostFilters } from "@/hooks/usePostFilters"
import { useFilteredPosts } from "@/hooks/useFilteredPosts"
import { FilterBar } from "@/components/shared/filters/FilterBar"
import { PlatformIcon } from "@/components/shared/PlatformIcon"
import { formatDate } from "@/lib"

interface DraftPost {
  id: number
  platform: string
  platformIcon?: string
  content: string
  time: string
  status: string
  media?: string[]
}

interface DraftsSectionProps {
  draftPosts: DraftPost[]
  onEditDraft: (post: DraftPost) => void
  onDeleteDraft: (id: number) => void
  onPublishDraft: (id: number) => void
}

/**
 * Drafts section component for managing draft posts
 * Displays a list of draft posts with filtering, searching, and management options
 */
export default function DraftsSection({ 
  draftPosts, 
  onEditDraft, 
  onDeleteDraft, 
  onPublishDraft 
}: DraftsSectionProps) {
  const { platformFilter, dateFilter, searchTerm, setPlatformFilter, setDateFilter, setSearchTerm } = usePostFilters()
  const filteredPosts = useFilteredPosts(draftPosts, searchTerm, platformFilter, dateFilter)

  return (
    <div className="w-full max-w-none mx-4 mt-4 overflow-hidden h-full flex flex-col">
      <h2 className="text-2xl font-bold mb-6">Bản nháp</h2>
      
      <FilterBar
        platformFilter={platformFilter}
        dateFilter={dateFilter}
        searchTerm={searchTerm}
        onPlatformChange={setPlatformFilter}
        onDateChange={setDateFilter}
        onSearchChange={setSearchTerm}
      />
      
      {/* Draft Posts List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
        <div className="space-y-[1px]">
          {filteredPosts.map((post) => (
            <div 
              key={post.id} 
              className="group rounded-xl hover:bg-[#E33265]/70 transition-colors cursor-pointer"
              onClick={() => onEditDraft(post)}
            >
              <div className="flex items-center px-4 py-3 w-full">
                {/* Left: platform icon + content */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <PlatformIcon 
                    platform={post.platformIcon || post.platform}
                    size={27}
                    variant="inline"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-white/90 truncate flex-1 min-w-0 max-w-[1050px]">
                      {post.content}
                    </div>
                  </div>
                </div>
                
                {/* Right: date and trash */}
                <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                  <span className="text-sm text-white/80 whitespace-nowrap">
                    {formatDate(post.time, 'vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit' })}
                  </span>
                  <button
                    className="w-8 h-8 flex items-center justify-center rounded hover:bg-white/10"
                    onClick={(e) => { e.stopPropagation(); onDeleteDraft(post.id) }}
                    aria-label="Xóa bản nháp"
                  >
                    <img src="/Trash.svg" alt="Delete" className="opacity-80" style={{ width: 19, height: 19 }} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
