"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlatformIcon } from "@/components/shared/PlatformIcon";
import {X as CloseIcon} from "lucide-react";
import type { FailedPost } from "@/store/createPageStore";
import { toast } from "sonner";

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

interface RetryDetailModalProps {
  post: FailedPost | null;
  onClose: () => void;
  onConfirmReschedule: (post: FailedPost, date: string, time: string) => void;
  onEdit: (post: FailedPost) => void;
}

export function RetryDetailModal({ post, onClose, onConfirmReschedule, onEdit }: RetryDetailModalProps) {
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");

  useEffect(() => {
    if (post) {
      const now = new Date();
      now.setMinutes(now.getMinutes() + 5); // Default to 5 mins in the future
      setRescheduleDate(now.toISOString().split('T')[0]);
      setRescheduleTime(now.toTimeString().slice(0, 5));
    }
  }, [post]);

  if (!post) return null;

  const reason = getFailureReason(post);
  const account = getAccountsForPlatform(post.platform)[0];
  const isContentIssue = reason.type === 'character_limit' || reason.type === 'policy';

  const handleConfirmClick = () => {
    // const targetDateTime = new Date(`${rescheduleDate}T${rescheduleTime}`);
    // if (targetDateTime.getTime() < new Date().getTime()) {
    //   toast.error("Không thể lên lịch vào một thời điểm trong quá khứ.");
    //   return;
    // }
    // onConfirmReschedule(post, rescheduleDate, rescheduleTime);
    if (!rescheduleDate || !rescheduleTime) {
        toast.error("Vui lòng chọn ngày và giờ hợp lệ.");
        return;
    }

    const targetDateTime = new Date(`${rescheduleDate}T${rescheduleTime}`);

    const now = new Date();
    now.setMinutes(now.getMinutes() + 1); // Allow at least 1 minute in the future

    if (targetDateTime.getTime() < now.getTime()) {
        toast.error("Không thể lên lịch vào một thời điểm trong quá khứ.");
        return;
    }

    onConfirmReschedule(post, rescheduleDate, rescheduleTime);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-[#1E1E23] border border-white/10 rounded-2xl w-[600px] max-w-[95vw] shadow-xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 pt-6 pb-4 border-b border-white/10"><div className="flex items-center justify-between"><h3 className="text-xl font-bold text-white">Chi tiết bài đăng thất bại</h3><button onClick={onClose} className="text-white/60 hover:text-white"><CloseIcon className="w-6 h-6" /></button></div></div>
        <div className="px-6 py-5 overflow-y-auto">
          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/10"><PlatformIcon platform={post.platform} size={32} /><div className="flex-1"><div className="text-white font-semibold">{post.platform}</div><div className="text-white/60 text-sm">{account.username}</div></div><div className="text-white/60 text-sm text-right"><div>{post.date}</div><div>{post.time}</div></div></div>
          <div className="mb-5"><div className="text-white/80 text-sm font-semibold mb-2">Nội dung bài đăng:</div><div className="bg-[#2A2A30] border border-[#3A3A42] rounded-lg p-4 text-white whitespace-pre-wrap max-h-[200px] overflow-y-auto">{post.content}</div></div>
          <div className="bg-[#7E1C39]/30 border border-[#E33265]/40 rounded-xl p-5 mb-5"><div className="flex items-center gap-2 mb-3"><svg className="w-5 h-5 text-[#FF8CA8]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg><div className="text-[#FF8CA8] font-semibold">Lý do thất bại:</div></div><div className="text-white text-base leading-6">{reason.message}</div></div>
          {isContentIssue ? (
            <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => onEdit(post)}>Chỉnh sửa bài đăng</Button>
          ) : (
            <div className="bg-[#2A2A30] border border-[#3A3A42] rounded-xl p-5"><div className="flex items-center gap-2 mb-4"><svg className="w-5 h-5 text-[#E33265]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg><div className="text-white font-semibold">Chọn thời gian đăng lại:</div></div><div className="grid grid-cols-2 gap-4"><div><label className="block text-white/70 text-sm mb-2">Ngày:</label><Input type="date" value={rescheduleDate} onChange={(e) => setRescheduleDate(e.target.value)} /></div><div><label className="block text-white/70 text-sm mb-2">Giờ:</label><Input type="time" value={rescheduleTime} onChange={(e) => setRescheduleTime(e.target.value)} /></div></div></div>
          )}
        </div>
        {!isContentIssue && (
          <div className="px-6 pb-6 flex items-center justify-end gap-4 border-t border-white/10 pt-4 mt-auto">
            <Button variant="outline" className="border-white/20 hover:bg-white/10" onClick={onClose}>Hủy</Button>
            <Button className="bg-[#E33265] hover:bg-[#c52b57]" onClick={handleConfirmClick}>Lên lịch lại</Button>
          </div>
        )}
      </div>
    </div>
  );
}