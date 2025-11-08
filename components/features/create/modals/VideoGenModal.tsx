// FINAL REFACTORED VERSION - components/create/modals/VideoGenModal.tsx

"use client";

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles as SparklesIcon } from 'lucide-react';
import { useCreatePageStore } from '@/store/createPageStore';
import { useTranslations } from 'next-intl';

export default function VideoGenModal() {
    const t = useTranslations('CreatePage.createSection.videoGenModal');
    // Lấy state và action một cách an toàn
    const isOpen = useCreatePageStore(state => state.isVideoGenModalOpen);
    const selectedPostId = useCreatePageStore(state => state.selectedPostId);
    const postContents = useCreatePageStore(state => state.postContents);
    const isGenerating = useCreatePageStore(state => state.isGeneratingMedia);
    const generateVideo = useCreatePageStore(state => state.generateVideo);
    const setIsVideoGenModalOpen = useCreatePageStore(state => state.setIsVideoGenModalOpen);
    
    const closeModal = useCallback(() => {
        setIsVideoGenModalOpen(false);
    }, [setIsVideoGenModalOpen]);

    // SỬA ĐỔI: Sử dụng lại state `videoPrompt` như yêu cầu
    const [videoPrompt, setVideoPrompt] = useState("");
    const [videoNegativePrompt, setVideoNegativePrompt] = useState("");
    const [videoAspectRatio, setVideoAspectRatio] = useState<"16:9" | "9:16" | "1:1" | "4:5" | "4:3">("16:9");
    const [videoResolution, setVideoResolution] = useState<"720p" | "1080p" | "4K">("1080p");
    
    // useEffect vẫn giữ nguyên logic, chỉ đổi tên hàm setter
    useEffect(() => {
        if (isOpen) {
            setVideoPrompt(postContents[selectedPostId] || "");
        }
    }, [isOpen, selectedPostId, postContents]);
    
    const handleGenerateClick = async () => {
        // Sử dụng videoPrompt
        if (!videoPrompt.trim() || isGenerating) return;
        await generateVideo(videoPrompt, videoNegativePrompt, videoAspectRatio, videoResolution);
    };

    if (!isOpen) return null;
    
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={closeModal}>
          <div className="bg-[#2A2A30] border border-[#3A3A42] rounded-2xl w-[600px] max-w-[95vw] max-h-[90vh] overflow-hidden shadow-[0_0_0_1px_rgba(255,255,255,0.08)]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <SparklesIcon className="w-5 h-5 text-[#7C3AED]" />
                <h2 className="text-lg font-semibold text-white">{t('title')} (Veo3)</h2>
              </div>
            </div>
            <div className="px-6 py-4 overflow-auto" style={{ maxHeight: "60vh" }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-white mb-2 text-sm font-medium">{t('promptLabel')}</label>
                  <Textarea
                    placeholder={t('promptPlaceholder')}
                    className="bg-[#1E1E23] border-[#3A3A42] text-white h-32 resize-none"
                    value={videoPrompt} // Đổi thành videoPrompt
                    onChange={(e) => setVideoPrompt(e.target.value)} // Đổi thành setVideoPrompt
                  />
                  <p className="text-xs text-gray-400 mt-1">{t('promptHint')}</p>
                </div>
                <div>
                  <label className="block text-white mb-2 text-sm font-medium">{t('negativePromptLabel')}</label>
                  <Input
                    placeholder={t('negativePromptPlaceholder')}
                    className="bg-[#1E1E23] border-[#3A3A42] text-white"
                    value={videoNegativePrompt}
                    onChange={(e) => setVideoNegativePrompt(e.target.value)}
                  />
                  <p className="text-xs text-gray-400 mt-1">{t('negativePromptHint')}</p>
                </div>
                <div>
                  <label className="block text-white mb-2 text-sm font-medium">{t('aspectRatioLabel')}</label>
                  <select
                    value={videoAspectRatio}
                    onChange={(e) => setVideoAspectRatio(e.target.value as typeof videoAspectRatio)}
                    className="w-full bg-[#1E1E23] border border-[#3A3A42] text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
                  >
                    <option value="16:9">{t('ratio16_9')}</option>
                    <option value="9:16">{t('ratio9_16')})</option>
                    <option value="1:1">{t('ratio1_1')}</option>
                    <option value="4:5">{t('ratio4_5')}</option>
                    <option value="4:3">{t('ratio4_3')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-white mb-2 text-sm font-medium">{t('resolutionLabel')}</label>
                  <select
                    value={videoResolution}
                    onChange={(e) => setVideoResolution(e.target.value as typeof videoResolution)}
                    className="w-full bg-[#1E1E23] border border-[#3A3A42] text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
                  >
                    <option value="720p">{t('resolution720p')}</option>
                    <option value="1080p">{t('resolution1080p')}</option>
                    <option value="4K">{t('resolution4K')}</option>
                  </select>
                </div>
                {/* Person Generation - Temporarily Commented */}
                {/* <div>
                  <label className="block text-white mb-2 text-sm font-medium">{t('safetyLabel')}</label>
                  <select
                    value={videoPersonGeneration}
                    onChange={(e) => setVideoPersonGeneration(e.target.value as typeof videoPersonGeneration)}
                    className="w-full bg-[#1E1E23] border border-[#3A3A42] text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
                  >
                    <option value="allow_adult">{t('safetyAllowAdult')}</option>
                    <option value="allow_all">{t('safetyAllowAll')}</option>
                    <option value="dont_allow">{t('safetyDontAllow')}</option>
                  </select>
                  <p className="text-xs text-gray-400 mt-1">Kiểm soát việc tạo hình người trong video</p>
                </div> */}
                <div className="bg-[#7C3AED]/10 border border-[#7C3AED]/30 rounded-lg p-3">
                  <p className="text-xs text-gray-300">
                    <strong className="text-[#7C3AED]">{t('note')}</strong> {t('noteText')}
                  </p>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-white/10 flex justify-end gap-3">
              <Button
                variant="outline"
                className="border-[#3A3A42] text-white hover:bg-white/5"
                onClick={closeModal}
              >
                {t('cancel')}
              </Button>
              <Button
                className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white"
                onClick={handleGenerateClick}
                disabled={!videoPrompt.trim() || isGenerating}
              >
                {isGenerating ? (
                    <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t('generating')}
                  </>
                ) : (
                  <>
                    <SparklesIcon className="w-4 h-4 mr-2" />
                    {t('generate')}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
    );
}