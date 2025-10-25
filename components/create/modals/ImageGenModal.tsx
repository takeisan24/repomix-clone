// FINAL REFACTORED VERSION - components/create/modals/ImageGenModal.tsx

"use client";

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles as SparklesIcon } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { useCreatePageStore } from '@/store/createPageStore';

export default function ImageGenModal() {
    // Lấy state và action một cách an toàn
    const isOpen = useCreatePageStore(state => state.isImageGenModalOpen);
    const selectedPostId = useCreatePageStore(state => state.selectedPostId);
    const postContents = useCreatePageStore(state => state.postContents);
    const isGenerating = useCreatePageStore(state => state.isGeneratingMedia);
    const generateImage = useCreatePageStore(state => state.generateImage);
    const setIsImageGenModalOpen = useCreatePageStore(state => state.setIsImageGenModalOpen);

    const closeModal = useCallback(() => {
        setIsImageGenModalOpen(false);
    }, [setIsImageGenModalOpen]);
    
    // SỬA ĐỔI: Sử dụng lại state `imagePrompt` như yêu cầu
    const [imagePrompt, setImagePrompt] = useState("");
    const [imageCount, setImageCount] = useState(1);
    const [imageSize, setImageSize] = useState<"1K" | "2K">("1K");
    const [imageAspectRatio, setImageAspectRatio] = useState<"1:1" | "4:3" | "3:4" | "16:9" | "9:16">("1:1");
    
    // useEffect vẫn giữ nguyên logic, chỉ đổi tên hàm setter
    useEffect(() => {
        if (isOpen) {
            // Lấy nội dung bài viết từ store và đặt làm giá trị khởi tạo cho imagePrompt
            setImagePrompt(postContents[selectedPostId] || "");
        }
    }, [isOpen, selectedPostId, postContents]);
    
    const handleGenerateClick = async () => {
        // Sử dụng imagePrompt
        if (!imagePrompt.trim() || isGenerating) return;
        await generateImage(imagePrompt, imageCount, imageSize, imageAspectRatio);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={closeModal}>
          <div className="bg-[#2A2A30] border border-[#3A3A42] rounded-2xl w-[600px] max-w-[95vw] max-h-[90vh] overflow-hidden shadow-[0_0_0_1px_rgba(255,255,255,0.08)]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <SparklesIcon className="w-5 h-5 text-[#7C3AED]" />
                <h2 className="text-lg font-semibold text-white">Tạo ảnh với AI</h2>
              </div>
            </div>
            <div className="px-6 py-4 overflow-auto" style={{ maxHeight: "60vh" }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-white mb-2 text-sm font-medium">Mô tả ảnh cần tạo</label>
                  <Textarea
                    placeholder="Mô tả chi tiết ảnh bạn muốn tạo..."
                    className="bg-[#1E1E23] border-[#3A3A42] text-white h-32 resize-none"
                    value={imagePrompt} // Đổi thành imagePrompt
                    onChange={(e) => setImagePrompt(e.target.value)} // Đổi thành setImagePrompt
                  />
                  <p className="text-xs text-gray-400 mt-1">Nội dung bài viết đã được tự động điền. Bạn có thể chỉnh sửa.</p>
                </div>
                <div>
                  <label className="block text-white mb-2 text-sm font-medium">Số lượng ảnh (tối đa 3)</label>
                  <div className="flex items-center gap-3">
                    <Button size="sm" variant="outline" className="h-9 w-9 p-0 bg-[#1E1E23] border-[#3A3A42] text-white hover:bg-white/5" onClick={() => setImageCount(Math.max(1, imageCount - 1))} disabled={imageCount <= 1}>-</Button>
                    <span className="text-white text-lg font-semibold w-8 text-center">{imageCount}</span>
                    <Button size="sm" variant="outline" className="h-9 w-9 p-0 bg-[#1E1E23] border-[#3A3A42] text-white hover:bg-white/5" onClick={() => setImageCount(Math.min(3, imageCount + 1))} disabled={imageCount >= 3}>+</Button>
                  </div>
                </div>
                <div>
                  <label className="block text-white mb-2 text-sm font-medium">Kích thước ảnh</label>
                  <select value={imageSize} onChange={(e) => setImageSize(e.target.value as "1K" | "2K")} className="w-full bg-[#1E1E23] border border-[#3A3A42] text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]">
                    <option value="1K">1K - Tiêu chuẩn (1024x1024 tùy tỷ lệ)</option>
                    <option value="2K">2K - Chất lượng cao (2048x2048 tùy tỷ lệ)</option>
                  </select>
                  <p className="text-xs text-gray-400 mt-1">Kích thước thực tế phụ thuộc vào tỷ lệ khung hình</p>
                </div>
                <div>
                  <label className="block text-white mb-2 text-sm font-medium">Tỷ lệ khung hình</label>
                  <select value={imageAspectRatio} onChange={(e) => setImageAspectRatio(e.target.value as typeof imageAspectRatio)} className="w-full bg-[#1E1E23] border border-[#3A3A42] text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]">
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
            <div className="px-6 py-4 border-t border-white/10 flex justify-end gap-3">
              <Button variant="outline" className="border-[#3A3A42] text-white hover:bg-white/5" onClick={closeModal}>Hủy</Button>
              <Button className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white" onClick={handleGenerateClick} disabled={!imagePrompt.trim() || isGenerating}>
                {isGenerating ? (
                  <>...</>
                ) : (
                  <><SparklesIcon className="w-4 h-4 mr-2" />Tạo ảnh</>
                )}
              </Button>
            </div>
          </div>
        </div>
    );
}