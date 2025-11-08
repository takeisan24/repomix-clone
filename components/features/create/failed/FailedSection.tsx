"use client";

import { useState, useMemo } from "react";
import { usePostFilters } from "@/hooks/usePostFilters";
import { useFilteredPosts } from "@/hooks/useFilteredPosts";
import { FilterBar } from "@/components/shared/filters/FilterBar";
import { useCreatePageStore } from "@/store/createPageStore";
import { useShallow } from 'zustand/react/shallow';
import type { FailedPost } from "@/store/createPageStore";
import { toast } from "sonner";
import { useTranslations } from 'next-intl';

import { FailedPostItem } from "./FailedPostItem";
import { LoadingModal, SuccessModal } from "./GenericStatusModals";
import { RetryDetailModal } from "./RetryDetailModal";

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

export default function FailedSection() {
  const t = useTranslations('CreatePage.failedSection');
  const tToast = useTranslations('Common.toast');
  
  const { failedPosts, handleRetryPost, openPostFromUrl, setActiveSection } = useCreatePageStore(
    useShallow((state) => ({
      failedPosts: state.failedPosts,
      handleRetryPost: state.handleRetryPost,
      openPostFromUrl: state.openPostFromUrl,
      setActiveSection: state.setActiveSection,
    }))
  );
  
  const { platformFilter, dateFilter, searchTerm, setPlatformFilter, setDateFilter, setSearchTerm } = usePostFilters();
  const filteredPosts = useFilteredPosts(
    failedPosts.map(p => ({ ...p, time: `${p.date}T${p.time}` })), 
    searchTerm, platformFilter, dateFilter
  );

  const [modalState, setModalState] = useState<{
    type: 'detail' | 'loading' | 'success';
    post: FailedPost | null;
  } | null>(null);

  const handleEditInEditor = (post: FailedPost) => {
    setActiveSection('create');
    openPostFromUrl(post.platform, post.content);
    toast.info(tToast('failedPostOpened'));
    setModalState(null); // Đóng modal nếu đang mở
  };

  const handleRetryClick = (post: FailedPost) => {
    const reason = getFailureReason(post);
    // Nếu là lỗi nội dung, gọi action chỉnh sửa ngay. Ngược lại, mở modal chi tiết.
    if (reason.type === 'character_limit' || reason.type === 'policy') {
      handleEditInEditor(post);
    } else {
      setModalState({ type: 'detail', post });
    }
  };

  const handleConfirmReschedule = (post: FailedPost, date: string, time: string) => {
    setModalState({ type: 'loading', post: null });
    setTimeout(() => {
      handleRetryPost(post.id, date, time);
      setModalState({ type: 'success', post: null });
    }, 1500);
  };

  const maxProfileWidth = useMemo(() => {
    if (filteredPosts.length === 0) return 120;
    const maxLength = Math.max(...filteredPosts.map(post => getAccountsForPlatform(post.platform)[0]?.username?.length || 0));
    return Math.min(Math.max(maxLength * 8, 120), 200);
  }, [filteredPosts]);

  return (
    <>
      <div className="w-full max-w-none mx-4 mt-4 overflow-hidden h-full flex flex-col">
        <h2 className="text-2xl font-bold mb-6">{t('title')}</h2>
        <FilterBar {...{ platformFilter, dateFilter, searchTerm, onPlatformChange: setPlatformFilter, onDateChange: setDateFilter, onSearchChange: setSearchTerm }} />
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
          <div className="space-y-[1px] pb-4">
            {filteredPosts.map((post) => (
              <FailedPostItem key={post.id} post={post} account={getAccountsForPlatform(post.platform)[0]} onRetry={handleRetryClick} maxWidth={maxProfileWidth} />
            ))}
          </div>
        </div>
      </div>
      
      <RetryDetailModal
        post={modalState?.type === 'detail' ? modalState.post : null}
        onClose={() => setModalState(null)}
        onConfirmReschedule={handleConfirmReschedule}
        onEdit={handleEditInEditor}
      />
      <LoadingModal isOpen={modalState?.type === 'loading'} />
      <SuccessModal isOpen={modalState?.type === 'success'} onClose={() => setModalState(null)} />
    </>
  );
}