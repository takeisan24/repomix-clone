"use client";

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDownIcon, ImageIcon, SparklesIcon } from 'lucide-react';

import { useCreatePageStore } from '@/store/createPageStore';
import { useShallow } from 'zustand/react/shallow';

export default function ActionBar() {
  // Lấy state và actions cần thiết
    const {
        selectedPostId, postContents, currentPost,
        handleClonePost, handleSaveDraft, handleMediaUpload,
        setIsPublishModalOpen, setIsImageGenModalOpen, setIsVideoGenModalOpen, isSavingDraft
    } = useCreatePageStore(useShallow(state => ({
        selectedPostId: state.selectedPostId,
        postContents: state.postContents,
        currentPost: state.openPosts.find(p => p.id === state.selectedPostId), // Lấy post hiện tại
        handleClonePost: state.handleClonePost,
        handleSaveDraft: state.handleSaveDraft,
        handleMediaUpload: state.handleMediaUpload,
        setIsPublishModalOpen: state.setIsPublishModalOpen,
        setIsImageGenModalOpen: state.setIsImageGenModalOpen,
        setIsVideoGenModalOpen: state.setIsVideoGenModalOpen,
        isSavingDraft: state.isSavingDraft,
    })));

    // State cục bộ cho UI của action bar
    const [showGenerateMenu, setShowGenerateMenu] = useState(false);
    const generateMenuRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Đóng dropdown khi click ra ngoài
    useEffect(() => {
        if (!showGenerateMenu) return;
        const handleClickOutside = (e: MouseEvent) => {
            if (generateMenuRef.current && !generateMenuRef.current.contains(e.target as Node)) {
                setShowGenerateMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showGenerateMenu]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);
        if (files.length > 0) {
            handleMediaUpload(files);
        }
    };

    const getCharLimit = () => {
        const platform = currentPost?.type || 'default';
        const limits: Record<string, number> = { Twitter: 280, Instagram: 2200, LinkedIn: 3000, Facebook: 63206, Pinterest: 500, TikTok: 2200, Threads: 500, Bluesky: 300, YouTube: 5000, default: 5000 };
        return limits[platform] ?? limits.default;
    };
  
  return(
    <div className="sticky bottom-0 left-0 right-0 bg-[#44424D]">
        {/* Use 15px top padding for buttons and 0 bottom to tighten bottom spacing */}
      <div className="relative border-t border-white/10 pt-[15px] pb-0 flex items-center justify-between opacity-100">
        {/* Character count aligned to the right, above line */}
        {/* Place count above divider with a 15px gap below it. Approx height ~16px => offset 16 + 15 = 31px */}
        <div className="absolute -top-[31px] right-0 text-xs text-gray-400 pr-[10px]">
          {(postContents[selectedPostId] ?? "").length}/{getCharLimit()} ký tự
        </div>
                      {/* Left: Add Image and Generate buttons */}
                      <div className="flex items-center gap-2 pl-[10px] pb-[10px]">
                      <input
                        type="file"
                        accept="image/*,video/*"
                        multiple
                        onChange={handleFileChange}
                        className="hidden"
                        id="media-upload"
                      />
                      <label htmlFor="media-upload">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-9 px-4 cursor-pointer bg-black hover:bg-[#E33265]/50 hover:border-[#E33265]/80 border-black text-white"
                          asChild
                        >
                          <span>
                            <ImageIcon className="w-4 h-4 mr-2" />
                            Thêm ảnh
                          </span>
                        </Button>
                      </label>

                      {/* Generate button with dropdown */}
                      <div className="relative" ref={generateMenuRef}>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-9 px-4 bg-black hover:bg-[#7C3AED]/50 hover:border-[#7C3AED]/80 border-black text-white"
                          onClick={() => setShowGenerateMenu(!showGenerateMenu)}
                        >
                          <SparklesIcon className="w-4 h-4 mr-2" />
                          Tạo
                          <ChevronDownIcon className={`w-4 h-4 ml-1 transition-transform ${showGenerateMenu ? 'rotate-180' : ''}`} />
                        </Button>

                        {showGenerateMenu && (
                          <div className="absolute bottom-full left-0 mb-2 w-48 bg-[#2A2A30] border border-[#3A3A42] rounded-md shadow-lg py-2 z-20">
                            <button
                              type="button"
                              onClick={() => {
                                setIsImageGenModalOpen(true);
                                setShowGenerateMenu(false);
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-white/5 flex items-center gap-3"
                            >
                              <ImageIcon className="w-4 h-4" />
                              Tạo ảnh
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setIsVideoGenModalOpen(true);
                                setShowGenerateMenu(false);
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-white/5 flex items-center gap-3"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                              Tạo video
                            </button>
                          </div>
                        )}
                      </div>
                      </div>

                      {/* Right: Clone, Save, Publish */}
                      <div className="flex items-center gap-2 pr-[10px] pb-[15px]">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-9 px-4 border-[#E33265] text-white hover:bg-[#E33265]/10"
                          onClick={() => handleClonePost(selectedPostId)}
                        >
                          Nhân bản
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-9 px-4 w-16 border-[#E33265] text-white hover:bg-[#E33265]/10 transition-all"
                          onClick={() => handleSaveDraft(selectedPostId)}
                          disabled={isSavingDraft}
                        >
                          {isSavingDraft ? 'Đang lưu...' : 'Lưu'}
                        </Button>
                        <Button
                          onClick={() => setIsPublishModalOpen(true)}
                          className="h-9 px-4 w-16 bg-[#E33265] hover:bg-[#c52b57] text-white"
                        >
                          Đăng
                        </Button>
                      </div>
                    </div>
                 </div>
  )
}