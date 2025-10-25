"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles as SparklesIcon } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { useCreatePageStore } from '@/store/createPageStore';
import { useShallow } from 'zustand/react/shallow';

export default function ImageGenModal() {
    // Lấy state và actions từ store
    const {
        isOpen, closeModal, selectedPostId, postContents,
        isGenerating, generateImage
    } = useCreatePageStore(useShallow(state => ({
        isOpen: state.isImageGenModalOpen,
        closeModal: () => state.setIsImageGenModalOpen(false),
        selectedPostId: state.selectedPostId,
        postContents: state.postContents,
        isGenerating: state.isGeneratingMedia,
        generateImage: state.generateImage,
    })));

    // State cục bộ cho các tùy chọn trong form
    // const [imagePrompt, setImagePrompt] = useState("");
    const [promptDraft, setPromptDraft] = useState(postContents[selectedPostId] || "");
    const [imageCount, setImageCount] = useState(1);
    const [imageSize, setImageSize] = useState<"1K" | "2K">("1K");
    const [imageAspectRatio, setImageAspectRatio] = useState<"1:1" | "4:3" | "3:4" | "16:9" | "9:16">("1:1");
    // const [imagePersonGeneration, setImagePersonGeneration] = useState<"dont_allow" | "allow_adult" | "allow_all">("allow_adult")
    
    // Tự động điền prompt từ nội dung bài viết khi modal được mở
    // useEffect(() => {
    //     if (isOpen) {
    //         setImagePrompt(postContents[selectedPostId] || "");
    //     }
    // }, [isOpen, selectedPostId, postContents]);

    if (!isOpen) return null;

    const handleGenerateClick = async () => {
        if (!promptDraft.trim() || isGenerating) return;
        // Gọi action từ store
        await generateImage(promptDraft, imageCount, imageSize, imageAspectRatio);
        // Modal sẽ tự đóng bên trong action
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={closeModal}>
          <div className="bg-[#2A2A30] border border-[#3A3A42] rounded-2xl w-[600px] max-w-[95vw] max-h-[90vh] overflow-hidden shadow-[0_0_0_1px_rgba(255,255,255,0.08)]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <SparklesIcon className="w-5 h-5 text-[#7C3AED]" />
                <h2 className="text-lg font-semibold text-white">Tạo ảnh với AI</h2>
              </div>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-4 overflow-auto" style={{ maxHeight: "60vh" }}>
              <div className="space-y-4">
                {/* Prompt Input */}
                <div>
                  <label className="block text-white mb-2 text-sm font-medium">Mô tả ảnh cần tạo</label>
                  <Textarea
                    placeholder="Mô tả chi tiết ảnh bạn muốn tạo..."
                    className="bg-[#1E1E23] border-[#3A3A42] text-white h-32 resize-none"
                    value={promptDraft}
                    onChange={(e) => setPromptDraft(e.target.value)}
                  />
                  <p className="text-xs text-gray-400 mt-1">Nội dung bài viết đã được tự động điền. Bạn có thể chỉnh sửa.</p>
                </div>

                {/* Image Count */}
                <div>
                  <label className="block text-white mb-2 text-sm font-medium">Số lượng ảnh (tối đa 3)</label>
                  <div className="flex items-center gap-3">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-9 w-9 p-0 bg-[#1E1E23] border-[#3A3A42] text-white hover:bg-white/5"
                      onClick={() => setImageCount(Math.max(1, imageCount - 1))}
                      disabled={imageCount <= 1}
                    >
                      -
                    </Button>
                    <span className="text-white text-lg font-semibold w-8 text-center">{imageCount}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-9 w-9 p-0 bg-[#1E1E23] border-[#3A3A42] text-white hover:bg-white/5"
                      onClick={() => setImageCount(Math.min(3, imageCount + 1))}
                      disabled={imageCount >= 3}
                    >
                      +
                    </Button>
                  </div>
                </div>

                {/* Image Size (Gemini supports 1K and 2K) */}
                <div>
                  <label className="block text-white mb-2 text-sm font-medium">Kích thước ảnh</label>
                  <select
                    value={imageSize}
                    onChange={(e) => setImageSize(e.target.value as "1K" | "2K")}
                    className="w-full bg-[#1E1E23] border border-[#3A3A42] text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
                  >
                    <option value="1K">1K - Tiêu chuẩn (1024x1024 tùy tỷ lệ)</option>
                    <option value="2K">2K - Chất lượng cao (2048x2048 tùy tỷ lệ)</option>
                  </select>
                  <p className="text-xs text-gray-400 mt-1">Kích thước thực tế phụ thuộc vào tỷ lệ khung hình</p>
                </div>

                {/* Aspect Ratio */}
                <div>
                  <label className="block text-white mb-2 text-sm font-medium">Tỷ lệ khung hình</label>
                  <select
                    value={imageAspectRatio}
                    onChange={(e) => setImageAspectRatio(e.target.value as typeof imageAspectRatio)}
                    className="w-full bg-[#1E1E23] border border-[#3A3A42] text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
                  >
                    <option value="1:1">1:1 - Vuông (Instagram, Facebook)</option>
                    <option value="4:3">4:3 - Ngang (Tiêu chuẩn)</option>
                    <option value="3:4">3:4 - Dọc (Story)</option>
                    <option value="16:9">16:9 - Ngang (YouTube, Twitter)</option>
                    <option value="9:16">9:16 - Dọc (TikTok, Reels)</option>
                  </select>
                </div>

                {/* Person Generation - Temporarily Commented */}
                {/* <div>
                  <label className="block text-white mb-2 text-sm font-medium">Cho phép tạo hình người</label>
                  <select
                    value={imagePersonGeneration}
                    onChange={(e) => setImagePersonGeneration(e.target.value as typeof imagePersonGeneration)}
                    className="w-full bg-[#1E1E23] border border-[#3A3A42] text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
                  >
                    <option value="allow_adult">Cho phép người lớn (Mặc định)</option>
                    <option value="allow_all">Cho phép tất cả</option>
                    <option value="dont_allow">Không cho phép</option>
                  </select>
                  <p className="text-xs text-gray-400 mt-1">Kiểm soát việc tạo hình người trong ảnh</p>
                </div> */}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-white/10 flex justify-end gap-3">
              <Button
                variant="outline"
                className="border-[#3A3A42] text-white hover:bg-white/5"
                onClick={closeModal}
              >
                Hủy
              </Button>
              <Button
                className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white"
                onClick={handleGenerateClick}
                disabled={!promptDraft.trim() || isGenerating}
              >
                {isGenerating ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang tạo...
                  </>
                ) : (
                  <>
                    <SparklesIcon className="w-4 h-4 mr-2" />
                    Tạo ảnh
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )
}