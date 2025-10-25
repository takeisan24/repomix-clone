"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { usePostFilters } from "@/hooks/usePostFilters"
import { useFilteredPosts } from "@/hooks/useFilteredPosts"
import { FilterBar } from "@/components/shared/filters/FilterBar"
import { PlatformIcon } from "@/components/shared/PlatformIcon"
import { formatDate, formatTime } from "@/lib"


import { useCreatePageStore } from "@/store/createPageStore"
import { useShallow } from 'zustand/react/shallow'

type FailedPost = ReturnType<typeof useCreatePageStore.getState>['failedPosts'][0];


/**
 * Failed section component for managing failed posts
 * Displays a list of failed posts with retry and management options
 */
export default function FailedSection() {
  // Zustand store for failed posts and actions
  const { failedPosts, onRetryPost, onDeletePost, onViewPost } = useCreatePageStore(
    useShallow((state) => ({
      failedPosts: state.failedPosts,
      onRetryPost: state.handleRetryPost,
      onDeletePost: state.handleDeletePost,
      onViewPost: state.handleViewPost,
    }))
  )
  // Filter state
  const { platformFilter, dateFilter, searchTerm, setPlatformFilter, setDateFilter, setSearchTerm } = usePostFilters()
  // const filteredPosts = useFilteredPosts(failedPosts, searchTerm, platformFilter, dateFilter)
  const filteredPosts = useFilteredPosts(
    // Chúng ta cần tạm thời tạo một thuộc tính `time` để hook sắp xếp hoạt động đúng
    failedPosts.map(p => ({ ...p, time: `${p.date}T${p.time}` })), 
    searchTerm, 
    platformFilter, 
    dateFilter
  );

  // Modal and state management
  const [showReasonModal, setShowReasonModal] = useState(false)
  const [showLoadingModal, setShowLoadingModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
// Selected post for modals
  const [selectedFailedPost, setSelectedFailedPost] = useState<FailedPost | null>(null)
  const [selectedDetailPost, setSelectedDetailPost] = useState<FailedPost | null>(null)
  // State for reschedule date and time
  const [rescheduleDate, setRescheduleDate] = useState("")
  const [rescheduleTime, setRescheduleTime] = useState("")
  // Confirm reschedule modal
  const [showConfirmReschedule, setShowConfirmReschedule] = useState(false)

  // Get accounts for platform (mock data) - unique to failed posts
  const getAccountsForPlatform = (platform: string) => {
    const mockAccounts = {
      'Twitter': [{ username: '@whatevername', profilePic: '/shego.jpg' }],
      'Instagram': [{ username: '@instagram_user', profilePic: '/shego.jpg' }],
      'LinkedIn': [{ username: 'LinkedIn User', profilePic: '/shego.jpg' }],
      'Facebook': [{ username: 'Facebook User', profilePic: '/shego.jpg' }],
      'Threads': [{ username: '@threads_user', profilePic: '/shego.jpg' }],
      'Bluesky': [{ username: '@bluesky_user', profilePic: '/shego.jpg' }],
      'YouTube': [{ username: 'YouTube Channel', profilePic: '/shego.jpg' }],
      'TikTok': [{ username: '@tiktok_user', profilePic: '/shego.jpg' }],
      'Pinterest': [{ username: 'Pinterest User', profilePic: '/shego.jpg' }]
    }
    return mockAccounts[platform as keyof typeof mockAccounts] || [{ username: 'Unknown Account', profilePic: '/shego.jpg' }]
  }

  // Calculate max profile width for consistent layout
  const getMaxProfileWidth = (posts: FailedPost[]) => {
    const maxLength = Math.max(...posts.map(post => 
      getAccountsForPlatform(post.platform)[0]?.username?.length || 0
    ))
    return Math.min(Math.max(maxLength * 8, 120), 200)
  }

  // Derive human-readable failure reason (VN) - unique to failed posts
  const getFailureReason = (post: FailedPost) => {
    const platform = (post.platform || '').toLowerCase()
    const contentLength = (post.content || '').length
    const characterLimits: Record<string, number> = {
      twitter: 280,
      facebook: 2200,
      instagram: 2200,
      linkedin: 3000,
      threads: 500,
      tiktok: 2200,
      bluesky: 300,
      youtube: 5000,
      pinterest: 500
    }
    const limit = characterLimits[platform] ?? 2200
    const err = (post.error || '').toLowerCase()

    if (contentLength > limit || err.includes('character') || err.includes('limit')) {
      return {
        type: 'character_limit',
        message: `Vượt giới hạn ký tự. Vui lòng rút gọn còn ${limit} ký tự.`,
        currentLength: contentLength,
        limit
      }
    }
    if (err.includes('network') || err.includes('timeout') || err.includes('connection')) {
      return { type: 'connection', message: 'Kết nối kém. Vui lòng thử lại.', currentLength: contentLength, limit }
    }
    if (err.includes('authentication') || err.includes('auth')) {
      return { type: 'authentication', message: 'Lỗi xác thực. Hãy kiểm tra cài đặt tài khoản.', currentLength: contentLength, limit }
    }
    if (err.includes('policy') || err.includes('violation')) {
      return { type: 'policy', message: 'Nội dung vi phạm chính sách. Vui lòng chỉnh sửa.', currentLength: contentLength, limit }
    }
    return { type: 'other', message: 'Đã xảy ra lỗi không xác định. Vui lòng thử lại.', currentLength: contentLength, limit }
  }

  const openReason = (post: FailedPost) => {
    setSelectedFailedPost(post)
    setShowReasonModal(true)
  }

  const closeReason = () => {
    setShowReasonModal(false)
    setSelectedFailedPost(null)
  }

  const openDetail = (post: FailedPost) => {
    setSelectedDetailPost(post)
    // Set default reschedule time to current date/time
    const now = new Date()
    const dateStr = now.toISOString().split('T')[0]
    const timeStr = now.toTimeString().slice(0, 5)
    setRescheduleDate(dateStr)
    setRescheduleTime(timeStr)
    setShowDetailModal(true)
  }

  const closeDetail = () => {
    setShowDetailModal(false)
    setSelectedDetailPost(null)
    setRescheduleDate("")
    setRescheduleTime("")
  }

  const handleConfirmAndRetry = () => {
    // Hàm này là ví dụ cho việc gom logic UI và gọi action từ store
    const reason = getFailureReason(selectedFailedPost!);
    if (reason.type === 'character_limit' || reason.type === 'policy') {
      // Gọi action từ store
      onRetryPost(selectedFailedPost!.id);
      closeReason();
      return;
    }
    setShowLoadingModal(true);
    closeReason();
    setTimeout(() => {
      setShowLoadingModal(false);
      // Gọi action từ store
      onRetryPost(selectedFailedPost!.id);
      setShowSuccessModal(true);
    }, 1500);
  };
  
  const handleConfirmReschedule = () => {
      if (!rescheduleDate || !rescheduleTime) {
          alert("Vui lòng chọn ngày và giờ đăng lại");
          return;
      }
      setShowConfirmReschedule(false);
      closeDetail();
      setShowLoadingModal(true);
      setTimeout(() => {
          setShowLoadingModal(false);
          // Gọi action từ store với tham số
          onRetryPost(selectedDetailPost!.id, rescheduleDate, rescheduleTime);
          setShowSuccessModal(true);
      }, 1500);
  };

  return (
    <>
    <div className="w-full max-w-none mx-4 mt-4 overflow-hidden h-full flex flex-col">
      <h2 className="text-2xl font-bold mb-6">Bài đăng thất bại</h2>

      <FilterBar
        platformFilter={platformFilter}
        dateFilter={dateFilter}
        searchTerm={searchTerm}
        onPlatformChange={setPlatformFilter}
        onDateChange={setDateFilter}
        onSearchChange={setSearchTerm}
      />

      {/* Failed Posts List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
        <div className="space-y-[1px] pb-0">
          {filteredPosts.map((post) => {
            const maxWidth = getMaxProfileWidth(filteredPosts)
            return (
            <div 
              key={post.id} 
              className="group rounded-xl transition-transform duration-300 ease-out"
            >
              <div className="flex items-center px-4 py-3 w-full">
                {/* Main content part, not clickable anymore */}
                <div 
                  className="flex items-center flex-1 min-w-0"
                >
                  {/* Left: platform icon + content */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <PlatformIcon platform={post.platform} size={27} variant="inline" />
                    <div className="text-white/90 truncate flex-1 min-w-0 max-w-[1050px]">
                      {post.content}
                    </div>
                  </div>
                  
                  {/* Right: profile info and date */}
                  <div className="flex flex-col items-start text-white/80 flex-shrink-0 ml-4" style={{ width: `${maxWidth}px` }}>
                    <div className="flex items-center gap-2 mb-1 w-full">
                      <div className="w-5 h-5 rounded-full overflow-hidden flex-shrink-0">
                        <img 
                          src={getAccountsForPlatform(post.platform)[0]?.profilePic || "/shego.jpg"} 
                          alt="Profile" 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      <span className="text-xs whitespace-nowrap" style={{ 
                        fontFamily: '"Figtree", Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"', 
                        fontWeight: '600',
                        fontSize: '0.75rem',
                        color: 'rgba(255,255,255,0.9)'
                      }}>
                        {getAccountsForPlatform(post.platform)[0]?.username || "Unknown Account"}
                      </span>
                    </div>
                    <span className="text-xs whitespace-nowrap w-full">
                      {post.date} 
                      <span className="opacity-70" style={{ marginLeft: '5px' }}>
                        {post.time}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Retry Button */}
                <div className="flex-shrink-0 ml-4 items-center gap-2 ">
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      openDetail(post);
                    }}
                    className="flex items-center justify-center w-24 h-9 bg-transparent border border-[#E33265] text-[#E33265] rounded-lg hover:bg-[#E33265] hover:text-white transition-all duration-300 ease-out text-sm font-semibold"
                  >
                    Thử lại
                  </Button>
                </div>
              </div>
            </div>
            )
          })}
        </div>
      </div>
    </div>

    {/* Reason modal */}
    {showReasonModal && selectedFailedPost && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={(e) => { if (e.target === e.currentTarget) closeReason() }}>
        <div className="bg-[#1E1E23] border border-white/10 rounded-2xl w-[450px] max-w-[95vw] shadow-xl">
          <div className="px-6 pt-6 pb-4 text-center border-b border-white/10">
            <h3 className="text-xl font-bold text-white">Thử lại?</h3>
          </div>
          <div className="px-6 py-5">
            {(() => {
              const r = getFailureReason(selectedFailedPost!)
              return (
                <div className="bg-[#7E1C39]/30 border border-[#E33265]/40 rounded-xl p-5 text-left">
                  <div className="text-[#FF8CA8] font-semibold mb-2">Lý do thất bại:</div>
                  <div className="text-white text-base leading-6 mb-3">{r.message}</div>
                  <div className="text-white/70 mb-3">Hiện tại: {r.currentLength} ký tự / {r.limit} ký tự</div>
                  {(r.type === 'character_limit' || r.type === 'policy') && (
                    <div className="text-blue-300">🖉 Sẽ mở trong tab chỉnh sửa để bạn có thể sửa nội dung</div>
                  )}
                </div>
              )
            })()}
          </div>
          <div className="px-6 pb-6 flex items-center justify-center gap-6">
            <button className="w-32 px-6 py-3 rounded-lg bg-white/15 text-white hover:bg-white/20" onClick={closeReason}>Không</button>
            <button
              className="w-32 px-6 py-3 rounded-lg bg-[#E33265] text-white hover:bg-[#c52b57]"
              onClick={() => {
                const reason = getFailureReason(selectedFailedPost!)
                // Content issue => open editor directly via onRetryPost (handled in hook)
                if (reason.type === 'character_limit' || reason.type === 'policy') {
                  onRetryPost(selectedFailedPost!.id)
                  closeReason()
                  return
                }
                // Connection/other => show loading then success, then call retry to move to published
                setShowLoadingModal(true)
                closeReason()
                setTimeout(() => {
                  setShowLoadingModal(false)
                  onRetryPost(selectedFailedPost!.id)
                  setShowSuccessModal(true)
                }, 1500)
              }}
            >
              Có
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Loading modal for retry */}
    {showLoadingModal && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-[#1E1E23] border border-white/10 rounded-2xl w-[420px] max-w-[95vw] shadow-xl text-center p-10">
          <div className="mx-auto mb-4 w-10 h-10 rounded-full border-4 border-[#E33265]/40 border-t-[#E33265] animate-spin" />
          <div className="text-2xl font-bold text-white mb-2">Đang thử lại...</div>
          <div className="text-white/70">Vui lòng chờ trong giây lát</div>
        </div>
      </div>
    )}

    {/* Success modal */}
    {showSuccessModal && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={(e) => { if (e.target === e.currentTarget) setShowSuccessModal(false) }}>
        <div className="bg-[#1E1E23] border border-white/10 rounded-2xl w-[420px] max-w-[95vw] shadow-xl text-center p-8">
          <div className="mx-auto mb-4 w-20 h-20 rounded-full bg-green-900/60 flex items-center justify-center">
            <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="text-3xl font-extrabold text-white mb-2">Thành công!</div>
          <div className="text-white/70 mb-6">Bài viết đã được đăng thành công!</div>
          <button className="px-8 py-3 rounded-lg bg-[#E33265] text-white hover:bg-[#c52b57]" onClick={() => setShowSuccessModal(false)}>Đóng</button>
        </div>
      </div>
    )}

    {/* Detail modal - Shows post content and error reason */}
    {showDetailModal && selectedDetailPost && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={(e) => { if (e.target === e.currentTarget) closeDetail() }}>
        <div className="bg-[#1E1E23] border border-white/10 rounded-2xl w-[600px] max-w-[95vw] shadow-xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="px-6 pt-6 pb-4 border-b border-white/10 sticky top-0 bg-[#1E1E23] z-10">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Chi tiết bài đăng thất bại</h3>
              <button 
                onClick={closeDetail}
                className="text-white/60 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-5">
            {/* Platform and Account Info */}
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/10">
              <PlatformIcon platform={selectedDetailPost.platform} size={32} variant="inline" />
              <div className="flex-1">
                <div className="text-white font-semibold">{selectedDetailPost.platform}</div>
                <div className="text-white/60 text-sm">
                  {getAccountsForPlatform(selectedDetailPost.platform)[0]?.username || "Unknown Account"}
                </div>
              </div>
              <div className="text-white/60 text-sm text-right">
                <div>{selectedDetailPost.date}</div>
                <div>{selectedDetailPost.time}</div>
              </div>
            </div>

            {/* Post Content */}
            <div className="mb-5">
              <div className="text-white/80 text-sm font-semibold mb-2">Nội dung bài đăng:</div>
              <div className="bg-[#2A2A30] border border-[#3A3A42] rounded-lg p-4 text-white whitespace-pre-wrap break-words max-h-[300px] overflow-y-auto">
                {selectedDetailPost.content}
              </div>
              <div className="text-white/50 text-xs mt-2">
                Độ dài: {selectedDetailPost.content.length} ký tự
              </div>
            </div>

            {/* Error Reason */}
            {(() => {
              const r = getFailureReason(selectedDetailPost)
              return (
                <div className="bg-[#7E1C39]/30 border border-[#E33265]/40 rounded-xl p-5 mb-5">
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="w-5 h-5 text-[#FF8CA8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-[#FF8CA8] font-semibold">Lý do thất bại:</div>
                  </div>
                  <div className="text-white text-base leading-6 mb-3">{r.message}</div>
                  {r.type === 'character_limit' && (
                    <div className="bg-[#E33265]/20 border border-[#E33265]/30 rounded-lg p-3 mb-3">
                      <div className="text-white/90 text-sm">
                        <span className="font-semibold">Hiện tại:</span> {r.currentLength} ký tự
                      </div>
                      <div className="text-white/90 text-sm">
                        <span className="font-semibold">Giới hạn:</span> {r.limit} ký tự
                      </div>
                      <div className="text-red-300 text-sm mt-2">
                        ⚠ Vượt quá {r.currentLength - r.limit} ký tự
                      </div>
                    </div>
                  )}
                  {(r.type === 'character_limit' || r.type === 'policy') && (
                    <div className="text-blue-300 text-sm flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Bạn có thể sửa nội dung và thử lại
                    </div>
                  )}
                </div>
              )
            })()}

            {/* Reschedule Date and Time Selection */}
            <div className="bg-[#2A2A30] border border-[#3A3A42] rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-5 h-5 text-[#E33265]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <div className="text-white font-semibold">Chọn thời gian đăng lại:</div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {/* Date Picker */}
                <div>
                  <label className="block text-white/70 text-sm mb-2">Ngày:</label>
                  <input
                    type="date"
                    value={rescheduleDate}
                    onChange={(e) => setRescheduleDate(e.target.value)}
                    className="w-full px-3 py-2 bg-[#1E1E23] border border-[#3A3A42] rounded-lg text-white focus:outline-none focus:border-[#E33265] transition-colors"
                  />
                </div>

                {/* Time Picker */}
                <div>
                  <label className="block text-white/70 text-sm mb-2">Giờ:</label>
                  <input
                    type="time"
                    value={rescheduleTime}
                    onChange={(e) => setRescheduleTime(e.target.value)}
                    className="w-full px-3 py-2 bg-[#1E1E23] border border-[#3A3A42] rounded-lg text-white focus:outline-none focus:border-[#E33265] transition-colors"
                  />
                </div>
              </div>

              <div className="mt-3 text-white/50 text-xs flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Bài viết sẽ được lên lịch lại với thời gian bạn chọn
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-6 pb-6 flex items-center justify-end gap-4 border-t border-white/10 pt-4">
            <button 
              className="px-6 py-3 rounded-lg bg-white/10 text-white hover:bg-white/15 transition-colors"
              onClick={closeDetail}
            >
              Hủy
            </button>
            <button
              className="px-6 py-3 rounded-lg bg-[#E33265] text-white hover:bg-[#c52b57] transition-colors flex items-center gap-2"
              onClick={() => {
                if (!rescheduleDate || !rescheduleTime) {
                  alert("Vui lòng chọn ngày và giờ đăng lại")
                  return
                }
                
                // Show confirm modal
                setShowConfirmReschedule(true)
              }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Lên lịch lại
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Confirm Reschedule Modal */}
    {showConfirmReschedule && selectedDetailPost && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={(e) => { if (e.target === e.currentTarget) setShowConfirmReschedule(false) }}>
        <div className="bg-[#1E1E23] border border-white/10 rounded-2xl w-[480px] max-w-[95vw] shadow-xl">
          <div className="px-6 pt-6 pb-4 text-center border-b border-white/10">
            <h3 className="text-xl font-bold text-white">Xác nhận lên lịch lại</h3>
          </div>
          
          <div className="px-6 py-5">
            <div className="bg-[#2A2A30] border border-[#3A3A42] rounded-xl p-5 mb-4">
              <div className="flex items-center gap-3 mb-3">
                <PlatformIcon platform={selectedDetailPost.platform} size={24} variant="inline" />
                <div className="text-white font-semibold">{selectedDetailPost.platform}</div>
              </div>
              
              <div className="text-white/70 text-sm mb-3">
                Bài viết sẽ được lên lịch lại vào:
              </div>
              
              <div className="bg-[#E33265]/20 border border-[#E33265]/40 rounded-lg p-3">
                <div className="flex items-center justify-center gap-3 text-white">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-[#E33265]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="font-semibold">
                      {new Date(rescheduleDate).toLocaleDateString('vi-VN', { 
                        day: '2-digit', 
                        month: '2-digit', 
                        year: 'numeric' 
                      })}
                    </span>
                  </div>
                  <span className="text-white/50">•</span>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-[#E33265]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-semibold">{rescheduleTime}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-white/60 text-sm text-center flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Bài viết sẽ xuất hiện trong lịch với ghi chú màu vàng
            </div>
          </div>
          
          <div className="px-6 pb-6 flex items-center justify-center gap-4">
            <button 
              className="w-32 px-6 py-3 rounded-lg bg-white/10 text-white hover:bg-white/15 transition-colors"
              onClick={() => setShowConfirmReschedule(false)}
            >
              Hủy
            </button>
            <button
              className="w-32 px-6 py-3 rounded-lg bg-[#E33265] text-white hover:bg-[#c52b57] transition-colors"
              onClick={() => {
                // Close all modals and show loading
                setShowConfirmReschedule(false)
                closeDetail()
                setShowLoadingModal(true)
                
                // Simulate loading then show success
                setTimeout(() => {
                  setShowLoadingModal(false)
                  
                  // Pass the reschedule date and time to the parent handler
                  onRetryPost(selectedDetailPost!.id, rescheduleDate, rescheduleTime)
                  
                  // Show success modal
                  setShowSuccessModal(true)
                }, 1500)
              }}
            >
              Xác nhận
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  )
}

