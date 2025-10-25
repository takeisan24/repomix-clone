// components/create/modals/SourceModal.tsx
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { X as CloseIcon } from 'lucide-react';

import { useCreatePageStore } from '@/store/createPageStore';
import { useShallow } from 'zustand/react/shallow';

export default function SourceModal() {
    const { 
        isSourceModalOpen, 
        setIsSourceModalOpen,
        addSavedSource,
        openCreateFromSourceModal
    } = useCreatePageStore(useShallow(state => ({
        isSourceModalOpen: state.isSourceModalOpen,
        setIsSourceModalOpen: state.setIsSourceModalOpen,
        addSavedSource: state.addSavedSource,
        openCreateFromSourceModal: state.openCreateFromSourceModal,
    })));

    // State cục bộ cho form bên trong modal
    const [selectedSourceType, setSelectedSourceType] = useState('text');
    const [sourceTextInput, setSourceTextInput] = useState('');
    const [sourceUrlInput, setSourceUrlInput] = useState('');
    const [shouldSaveSource, setShouldSaveSource] = useState(true);
    const [advancedInstructions, setAdvancedInstructions] = useState('');

    if (!isSourceModalOpen) return null;

    const handleAddAndProceed = () => {
        const value = selectedSourceType === 'text' ? sourceTextInput : sourceUrlInput;
        if (!value.trim()) return;
        
        const source = {
            type: selectedSourceType,
            value,
            label: value.length > 50 ? value.substring(0, 50) + '...' : value
        };

        if (shouldSaveSource) {
            addSavedSource(source);
        }

        // Đóng modal này và mở modal tiếp theo
        setIsSourceModalOpen(false);
        openCreateFromSourceModal(source);

        // Reset form
        setSourceTextInput('');
        setSourceUrlInput('');
    };

    const sourceTypeOptions = [
    { key: "text", label: "Văn bản" },
    { key: "article", label: "Bài viết" },
    { key: "youtube", label: "YouTube" },
    { key: "tiktok", label: "TikTok" },
    { key: "perplexity", label: "Perplexity" },
    { key: "pdf", label: "PDF" },
    { key: "audio", label: "Âm thanh" },
  ]

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-[#2A2A30] border border-[#3A3A42] rounded-2xl w-[1000px] max-w-[95vw]">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                    <h2 className="text-lg font-semibold text-white">Chỉnh sửa nguồn</h2>
                    <button onClick={() => setIsSourceModalOpen(false)}>
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>
                {/* Tabs */}
            <div className="px-6 pt-4">
              <div className="grid grid-cols-7 gap-3">
                {sourceTypeOptions.map((option) => (
                  <button
                    key={option.key}
                    className={`px-4 py-3 rounded-md text-sm ${
                      selectedSourceType === (option.key as any) 
                        ? 'bg-white/10 text-white' 
                        : 'bg-transparent text-gray-300 hover:text-white hover:bg-white/5'
                    }`}
                    onClick={() => setSelectedSourceType(option.key as any)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            {/* Body */}
                        <div className="px-6 py-4 space-y-3 overflow-auto" style={{ maxHeight: "60vh" }}>
                          <div className="text-white">Văn bản</div>
                          {selectedSourceType === 'text' && (
                            <Textarea placeholder="Dán văn bản vào đây" 
                              className="bg-gray-900/50 border-white/10 h-40"
                              value={sourceTextInput}
                              onChange={(e) => setSourceTextInput(e.target.value)}
                            />
                          )}
            
                          {selectedSourceType !== 'text' && (
                            <Input
                              placeholder={
                                selectedSourceType === 'article' ? 'Dán URL bài viết...' :
                                selectedSourceType === 'youtube' ? 'Dán URL YouTube...' :
                                selectedSourceType === 'tiktok' ? 'Dán URL TikTok...' :
                                selectedSourceType === 'pdf' ? 'Dán URL PDF...' :
                                selectedSourceType === 'perplexity' ? 'Dán URL Perplexity...' :
                                'Dán URL âm thanh...'
                              }
                              className="bg-gray-900/50 border-white/10"
                              value={sourceUrlInput}
                              onChange={(e) => setSourceUrlInput(e.target.value)}
                            />
                          )}
                          <label className="flex items-center gap-3 text-white pt-2">
                            <input 
                              type="checkbox" 
                              className="accent-[#E33265]"
                              checked={shouldSaveSource}
                              onChange={(e) => setShouldSaveSource(e.target.checked)}
                            />
                            <span>Lưu nguồn?</span>
                          </label>
                          <details className="text-white/90">
                            <summary className="cursor-pointer select-none">Cài đặt nâng cao</summary>
                            <div className="mt-2 text-sm text-gray-300">Chưa có cài đặt bổ sung.</div>
            
                          </details>
                          <label htmlFor="advanced-instructions" className="block text-white mb-2">
                        Chi tiết yêu cầu cho AI:
                      </label>
                      <Textarea
                        id="advanced-instructions"
                        placeholder="Ví dụ: 'Tạo bài đăng với giọng văn vui vẻ, tập trung vào lợi ích X, và kêu gọi hành động 'Tìm hiểu thêm'...' hoặc 'Phân tích điểm mạnh, điểm yếu của nguồn.'..."
                        className="bg-gray-900/50 border-white/10 h-32 mb-4 placeholder:text-gray-500"
                        value={advancedInstructions}
                        onChange={(e) => setAdvancedInstructions(e.target.value)}
                      />
                        </div>
                <div className="px-6 pb-6">
                    <button 
                    onClick={handleAddAndProceed} 
                    className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white py-3 rounded-md disabled:opacity-50"
                    disabled={!(selectedSourceType === 'text' ? sourceTextInput.trim() : sourceUrlInput.trim())}>
                        Thêm
                    </button>
                </div>
            </div>
        </div>
    );
}